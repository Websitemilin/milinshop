import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;

  const mockProduct = {
    id: 'product-1',
    title: 'Chanel Bag',
    slug: 'chanel-bag',
    description: 'Luxury bag',
    categoryId: '1',
    dailyPrice: 100,
    depositPrice: 500,
    stock: 10,
    colors: ['black'],
    sizes: ['M'],
    material: 'leather',
    condition: 'NEW',
    status: 'PUBLISHED',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    subtotal: 500,
    tax: 40,
    deposit: 500,
    total: 1040,
    status: 'PENDING',
    deliveryAddress: '123 Main St',
    notes: 'Please leave at door',
    paymentStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    user: { id: 'user-1', email: 'test@example.com' },
  };

  const mockCreateOrderDto = {
    items: [
      {
        productId: 'product-1',
        quantity: 1,
        rentalFromDate: new Date('2026-02-20'),
        rentalToDate: new Date('2026-02-25'),
      },
    ],
    deliveryAddress: '123 Main St',
    notes: 'Please leave at door',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            orderItem: {
              findFirst: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            setLock: jest.fn(),
            releaseLock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    redisService = module.get(RedisService) as jest.Mocked<RedisService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully with Redis locks', async () => {
      const mockOrderItem = {
        id: 'item-1',
        productId: 'product-1',
        quantity: 1,
        dailyPrice: 100,
        depositPrice: 500,
        rentalFromDate: new Date('2026-02-20'),
        rentalToDate: new Date('2026-02-25'),
        status: 'PENDING',
        orderId: 'order-1',
        product: mockProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCreatedOrder = {
        ...mockOrder,
        items: [mockOrderItem],
      };

      (redisService.setLock as jest.Mock).mockResolvedValue(true);
      (prismaService.orderItem.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (prismaService.order.create as jest.Mock).mockResolvedValue(
        mockCreatedOrder,
      );
      (redisService.releaseLock as jest.Mock).mockResolvedValue(true);

      const result = await service.createOrder('user-1', mockCreateOrderDto);

      expect(result).toEqual(mockCreatedOrder);
      expect(redisService.setLock).toHaveBeenCalled();
      expect(redisService.releaseLock).toHaveBeenCalled();
      expect(prismaService.order.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          subtotal: 500, // 100 * 1 * 5 days
          tax: 40, // 500 * 0.08
          deposit: 500,
          total: 1040, // 500 + 40 + 500
          deliveryAddress: '123 Main St',
          notes: 'Please leave at door',
          items: {
            create: expect.any(Array),
          },
        },
        include: { items: { include: { product: true } } },
      });
    });

    it('should throw BadRequestException if no items', async () => {
      const dto = { ...mockCreateOrderDto, items: [] };

      await expect(service.createOrder('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if rental dates invalid', async () => {
      const dto = {
        ...mockCreateOrderDto,
        items: [
          {
            ...mockCreateOrderDto.items[0],
            rentalFromDate: new Date('2026-02-25'),
            rentalToDate: new Date('2026-02-20'),
          },
        ],
      };

      await expect(service.createOrder('user-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if product not available', async () => {
      const existingOrder = {
        id: 'existing-order',
        productId: 'product-1',
        rentalFromDate: new Date('2026-02-22'),
        rentalToDate: new Date('2026-02-28'),
      };

      (prismaService.orderItem.findFirst as jest.Mock).mockResolvedValue(
        existingOrder,
      );

      await expect(service.createOrder('user-1', mockCreateOrderDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if cannot acquire lock', async () => {
      (redisService.setLock as jest.Mock).mockResolvedValue(false);

      await expect(service.createOrder('user-1', mockCreateOrderDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should release locks on error', async () => {
      (redisService.setLock as jest.Mock).mockResolvedValue(true);
      (prismaService.orderItem.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null); // Product not found

      await expect(service.createOrder('user-1', mockCreateOrderDto)).rejects.toThrow();

      expect(redisService.releaseLock).toHaveBeenCalled();
    });

    it('should throw ConflictException if insufficient stock', async () => {
      const lowStockProduct = { ...mockProduct, stock: 0 };

      (redisService.setLock as jest.Mock).mockResolvedValue(true);
      (prismaService.orderItem.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        lowStockProduct,
      );

      await expect(service.createOrder('user-1', mockCreateOrderDto)).rejects.toThrow(
        ConflictException,
      );

      expect(redisService.releaseLock).toHaveBeenCalled();
    });
  });

  describe('getOrder', () => {
    it('should get order by id for authorized user', async () => {
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await service.getOrder('order-1', 'user-1');

      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getOrder('invalid-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not authorized', async () => {
      const order = { ...mockOrder, userId: 'user-2' };
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(order);

      await expect(service.getOrder('order-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserOrders', () => {
    it('should get user orders with pagination', async () => {
      (prismaService.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (prismaService.order.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getUserOrders('user-1', 1, 20);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      const orders = Array(30).fill(mockOrder);
      (prismaService.order.findMany as jest.Mock).mockResolvedValue(
        orders.slice(0, 20),
      );
      (prismaService.order.count as jest.Mock).mockResolvedValue(30);

      const result = await service.getUserOrders('user-1', 2, 20);

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(2);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        skip: 20,
        take: 20,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const updatedOrder = { ...mockOrder, status: 'CONFIRMED' };
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prismaService.order.update as jest.Mock).mockResolvedValue(updatedOrder);

      const result = await service.updateOrderStatus('order-1', {
        status: 'CONFIRMED',
      });

      expect(result.status).toBe('CONFIRMED');
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'CONFIRMED' },
        include: { items: true },
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('invalid-id', { status: 'CONFIRMED' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders for admin', async () => {
      (prismaService.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
      (prismaService.order.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getAllOrders(1, 20);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        include: {
          items: { include: { product: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
