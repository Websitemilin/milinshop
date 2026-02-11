import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Cart Endpoints (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login user
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'UserPassword123!',
      });
    userToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;

    // Get existing product (or create one)
    const productRes = await request(app.getHttpServer()).get('/products?page=1&pageSize=1');
    if (productRes.body.items.length > 0) {
      productId = productRes.body.items[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /cart', () => {
    it('should get user cart', () => {
      return request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('items');
          expect(Array.isArray(res.body.items)).toBe(true);
        });
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .get('/cart')
        .expect(401);
    });
  });

  describe('POST /cart/items', () => {
    it('should add item to cart', () => {
      const fromDate = new Date('2026-03-01');
      const toDate = new Date('2026-03-05');

      return request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId,
          quantity: 1,
          rentalFromDate: fromDate.toISOString(),
          rentalToDate: toDate.toISOString(),
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.quantity).toBe(1);
        });
    });

    it('should reject invalid rental dates', () => {
      return request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId,
          quantity: 1,
          rentalFromDate: new Date('2026-03-05').toISOString(),
          rentalToDate: new Date('2026-03-01').toISOString(), // End before start
        })
        .expect(400);
    });

    it('should reject non-existent product', () => {
      return request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: 'nonexistent',
          quantity: 1,
          rentalFromDate: new Date('2026-03-01').toISOString(),
          rentalToDate: new Date('2026-03-05').toISOString(),
        })
        .expect(400);
    });

    it('should increment quantity if item already in cart', () => {
      const fromDate = new Date('2026-03-01');
      const toDate = new Date('2026-03-05');

      return (
        request(app.getHttpServer())
          .post('/cart/items')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            productId,
            quantity: 1,
            rentalFromDate: fromDate.toISOString(),
            rentalToDate: toDate.toISOString(),
          })
          // Then add same item again
          .then(() =>
            request(app.getHttpServer())
              .post('/cart/items')
              .set('Authorization', `Bearer ${userToken}`)
              .send({
                productId,
                quantity: 1,
                rentalFromDate: fromDate.toISOString(),
                rentalToDate: toDate.toISOString(),
              }),
          )
          .then((res) => {
            expect(res.status).toBe(200);
            expect(res.body.quantity).toBe(2);
          })
      );
    });
  });

  describe('DELETE /cart/items/:id', () => {
    it('should remove item from cart', async () => {
      // First add item
      const addRes = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId,
          quantity: 1,
          rentalFromDate: new Date('2026-03-10').toISOString(),
          rentalToDate: new Date('2026-03-15').toISOString(),
        });

      const itemId = addRes.body.id;

      // Then delete it
      return request(app.getHttpServer())
        .delete(`/cart/items/${itemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });

  describe('DELETE /cart', () => {
    it('should clear entire cart', () => {
      return request(app.getHttpServer())
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
        });
    });
  });
});

describe('Orders Endpoints (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;
  let adminToken: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login user
    const userRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'UserPassword123!',
      });
    userToken = userRes.body.accessToken;
    userId = userRes.body.user.id;

    // Login admin
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
      });
    adminToken = adminRes.body.accessToken;

    // Get product
    const productRes = await request(app.getHttpServer()).get('/products?page=1&pageSize=1');
    if (productRes.body.items.length > 0) {
      productId = productRes.body.items[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create order with single item', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 1,
              rentalFromDate: new Date('2026-03-20').toISOString(),
              rentalToDate: new Date('2026-03-25').toISOString(),
            },
          ],
          deliveryAddress: '123 Main St, City, State 12345',
          notes: 'Please leave at door',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe(userId);
          expect(res.body.status).toBe('PENDING');
          expect(res.body).toHaveProperty('total');
          expect(res.body.items).toHaveLength(1);
        });
    });

    it('should calculate tax and deposit correctly', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 1,
              rentalFromDate: new Date('2026-04-01').toISOString(),
              rentalToDate: new Date('2026-04-06').toISOString(), // 5 days
            },
          ],
          deliveryAddress: '123 Main St',
          notes: 'Test',
        })
        .expect(201)
        .expect((res) => {
          const { subtotal, tax, deposit, total } = res.body;
          expect(tax).toBe(subtotal * 0.08); // 8% tax
          expect(total).toBe(subtotal + tax + deposit);
        });
    });

    it('should reject empty order', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [],
          deliveryAddress: '123 Main St',
        })
        .expect(400);
    });

    it('should reject invalid rental dates', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 1,
              rentalFromDate: new Date('2026-03-25').toISOString(),
              rentalToDate: new Date('2026-03-20').toISOString(), // End before start
            },
          ],
          deliveryAddress: '123 Main St',
        })
        .expect(400);
    });

    it('should return 401 without authentication', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          items: [
            {
              productId,
              quantity: 1,
              rentalFromDate: new Date('2026-03-20').toISOString(),
              rentalToDate: new Date('2026-03-25').toISOString(),
            },
          ],
          deliveryAddress: '123 Main St',
        })
        .expect(401);
    });
  });

  describe('GET /orders/:id', () => {
    let orderId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 1,
              rentalFromDate: new Date('2026-04-10').toISOString(),
              rentalToDate: new Date('2026-04-15').toISOString(),
            },
          ],
          deliveryAddress: '123 Main St',
        });
      orderId = res.body.id;
    });

    it('should get own order', () => {
      return request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(orderId);
          expect(res.body.userId).toBe(userId);
        });
    });

    it('should return 404 for non-existent order', () => {
      return request(app.getHttpServer())
        .get('/orders/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('GET /orders', () => {
    it('should get user orders', () => {
      return request(app.getHttpServer())
        .get('/orders?page=1&pageSize=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page', 1);
          expect(Array.isArray(res.body.items)).toBe(true);
        });
    });
  });

  describe('PUT /orders/:id/status (admin only)', () => {
    let orderId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 1,
              rentalFromDate: new Date('2026-05-01').toISOString(),
              rentalToDate: new Date('2026-05-05').toISOString(),
            },
          ],
          deliveryAddress: '123 Main St',
        });
      orderId = res.body.id;
    });

    it('should update order status as admin', () => {
      return request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('CONFIRMED');
        });
    });

    it('should reject non-admin user', () => {
      return request(app.getHttpServer())
        .put(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(403);
    });
  });

  describe('GET /orders (admin)', () => {
    it('should get all orders as admin', () => {
      return request(app.getHttpServer())
        .get('/orders?admin=true&page=1&pageSize=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.items)).toBe(true);
        });
    });
  });
});
