import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('CartService', () => {
  let service: CartService;
  let prismaService: jest.Mocked<PrismaService>;
  let redisService: jest.Mocked<RedisService>;

  const mockCart = {
    id: '1',
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
  };

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

  const mockAddToCartDto = {
    productId: 'product-1',
    quantity: 1,
    rentalFromDate: new Date('2026-02-20'),
    rentalToDate: new Date('2026-02-25'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: {
            cart: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            cartItem: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              deleteMany: jest.fn(),
            },
            product: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: RedisService,
          useValue: {
            acquireLock: jest.fn(),
            releaseLock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    redisService = module.get(RedisService) as jest.Mocked<RedisService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should get existing cart', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);

      const result = await service.getCart('user-1');

      expect(result).toEqual(mockCart);
      expect(prismaService.cart.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          items: {
            include: { product: { include: { images: true } } },
          },
        },
      });
    });

    it('should create cart if not exists', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.cart.create as jest.Mock).mockResolvedValue(mockCart);

      const result = await service.getCart('user-1');

      expect(result).toEqual(mockCart);
      expect(prismaService.cart.create).toHaveBeenCalledWith({
        data: { userId: 'user-1' },
        include: { items: true },
      });
    });
  });

  describe('addToCart', () => {
    it('should add item to cart successfully', async () => {
      const mockCartItem = {
        id: 'item-1',
        cartId: mockCart.id,
        productId: mockProduct.id,
        quantity: 1,
        rentalFromDate: mockAddToCartDto.rentalFromDate,
        rentalToDate: mockAddToCartDto.rentalToDate,
        product: mockProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (prismaService.cartItem.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.cartItem.create as jest.Mock).mockResolvedValue(
        mockCartItem,
      );

      const result = await service.addToCart('user-1', mockAddToCartDto);

      expect(result).toEqual(mockCartItem);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockAddToCartDto.productId },
      });
    });

    it('should throw NotFoundException if cart not found', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addToCart('user-1', mockAddToCartDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if product not found', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addToCart('user-1', mockAddToCartDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if insufficient stock', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue({
        ...mockProduct,
        stock: 0,
      });

      await expect(
        service.addToCart('user-1', { ...mockAddToCartDto, quantity: 5 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if rental dates invalid', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const invalidDto = {
        ...mockAddToCartDto,
        rentalFromDate: new Date('2026-02-25'),
        rentalToDate: new Date('2026-02-20'),
      };

      await expect(service.addToCart('user-1', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update quantity if item already exists', async () => {
      const existingItem = {
        id: 'item-1',
        cartId: mockCart.id,
        productId: mockProduct.id,
        quantity: 1,
        rentalFromDate: mockAddToCartDto.rentalFromDate,
        rentalToDate: mockAddToCartDto.rentalToDate,
      };

      const updatedItem = {
        ...existingItem,
        quantity: 2,
        product: mockProduct,
      };

      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (prismaService.cartItem.findUnique as jest.Mock).mockResolvedValue(
        existingItem,
      );
      (prismaService.cartItem.update as jest.Mock).mockResolvedValue(
        updatedItem,
      );

      const result = await service.addToCart('user-1', mockAddToCartDto);

      expect(prismaService.cartItem.update).toHaveBeenCalledWith({
        where: { id: existingItem.id },
        data: { quantity: 2 },
        include: { product: true },
      });
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item successfully', async () => {
      const mockCartItem = {
        id: 'item-1',
        cartId: mockCart.id,
        productId: mockProduct.id,
        quantity: 1,
        rentalFromDate: mockAddToCartDto.rentalFromDate,
        rentalToDate: mockAddToCartDto.rentalToDate,
        cart: mockCart,
        product: mockProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateDto = { quantity: 2 };

      (prismaService.cartItem.findUnique as jest.Mock).mockResolvedValue(
        mockCartItem,
      );
      (prismaService.cartItem.update as jest.Mock).mockResolvedValue({
        ...mockCartItem,
        quantity: 2,
      });

      const result = await service.updateCartItem('item-1', 'user-1', updateDto);

      expect(result.quantity).toBe(2);
    });

    it('should throw NotFoundException if cart item not found', async () => {
      (prismaService.cartItem.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.updateCartItem('invalid-id', 'user-1', { quantity: 2 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if quantity invalid', async () => {
      const mockCartItem = {
        id: 'item-1',
        cartId: mockCart.id,
        quantity: 1,
        cart: mockCart,
      };

      (prismaService.cartItem.findUnique as jest.Mock).mockResolvedValue(
        mockCartItem,
      );

      await expect(
        service.updateCartItem('item-1', 'user-1', { quantity: 0 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFromCart', () => {
    it('should remove cart item successfully', async () => {
      const mockCartItem = {
        id: 'item-1',
        cart: mockCart,
      };

      (prismaService.cartItem.findUnique as jest.Mock).mockResolvedValue(
        mockCartItem,
      );
      (prismaService.cartItem.delete as jest.Mock).mockResolvedValue({});

      const result = await service.removeFromCart('item-1', 'user-1');

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if cart item not found', async () => {
      (prismaService.cartItem.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.removeFromCart('invalid-id', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
      (prismaService.cartItem.deleteMany as jest.Mock).mockResolvedValue({});

      const result = await service.clearCart('user-1');

      expect(result.success).toBe(true);
      expect(prismaService.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: mockCart.id },
      });
    });

    it('should throw NotFoundException if cart not found', async () => {
      (prismaService.cart.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.clearCart('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
