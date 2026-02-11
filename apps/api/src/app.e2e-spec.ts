import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('email', 'newuser@example.com');
          expect(res.body.user).toHaveProperty('role');
        });
    });

    it('should reject duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com', // Already registered in setup
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(409);
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid@example.com',
          // missing password
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('email');
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
        });
      refreshToken = res.body.refreshToken;
    });

    it('should refresh access token with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body.accessToken).not.toBe(''); // New token
        });
    });

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);
    });
  });
});

describe('Products Endpoints (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

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

    // Get admin token
    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
      });
    adminToken = adminRes.body.accessToken;

    // Get user token
    const userRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'UserPassword123!',
      });
    userToken = userRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /products', () => {
    it('should get all products with pagination', () => {
      return request(app.getHttpServer())
        .get('/products?page=1&pageSize=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('pageSize', 10);
          expect(Array.isArray(res.body.items)).toBe(true);
        });
    });

    it('should filter products by category', () => {
      return request(app.getHttpServer())
        .get('/products?categoryId=1&page=1&pageSize=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.items.every((p: any) => p.categoryId === '1')).toBe(true);
        });
    });

    it('should filter products by price range', () => {
      return request(app.getHttpServer())
        .get('/products?minPrice=100&maxPrice=300&page=1&pageSize=10')
        .expect(200)
        .expect((res) => {
          expect(
            res.body.items.every((p: any) => p.dailyPrice >= 100 && p.dailyPrice <= 300),
          ).toBe(true);
        });
    });

    it('should search products by keyword', () => {
      return request(app.getHttpServer())
        .get('/products?search=bag&page=1&pageSize=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.items.length).toBeGreaterThanOrEqual(0);
        });
    });
  });

  describe('GET /products/:id', () => {
    it('should get product details', () => {
      // Assuming product with id '1' exists
      return request(app.getHttpServer())
        .get('/products/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('category');
          expect(res.body).toHaveProperty('images');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/99999')
        .expect(404);
    });
  });

  describe('POST /products (admin only)', () => {
    it('should create product as admin', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Luxury Bag',
          description: 'Premium designer bag',
          categoryId: '1',
          dailyPrice: 150,
          depositPrice: 750,
          stock: 5,
          colors: ['black', 'white'],
          sizes: ['S', 'M'],
          material: 'leather',
          condition: 'NEW',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('New Luxury Bag');
        });
    });

    it('should reject non-admin user', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'New Luxury Bag',
          description: 'Premium designer bag',
          categoryId: '1',
          dailyPrice: 150,
          depositPrice: 750,
          stock: 5,
        })
        .expect(403);
    });

    it('should reject without authentication', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          title: 'New Luxury Bag',
          description: 'Premium designer bag',
          categoryId: '1',
          dailyPrice: 150,
          depositPrice: 750,
          stock: 5,
        })
        .expect(401);
    });
  });

  describe('PUT /products/:id (admin only)', () => {
    it('should update product as admin', () => {
      return request(app.getHttpServer())
        .put('/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Bag',
          dailyPrice: 200,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Bag');
          expect(res.body.dailyPrice).toBe(200);
        });
    });
  });

  describe('DELETE /products/:id (admin only)', () => {
    it('should delete product as admin', () => {
      return request(app.getHttpServer())
        .delete('/products/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should return 404 after deletion', () => {
      return request(app.getHttpServer())
        .get('/products/1')
        .expect(404);
    });
  });
});
