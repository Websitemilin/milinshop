import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockProduct = {
    id: '1',
    title: 'Chanel Bag',
    slug: 'chanel-bag',
    description: 'Luxury Chanel bag',
    categoryId: '1',
    dailyPrice: 100,
    depositPrice: 500,
    stock: 10,
    colors: ['black', 'white'],
    sizes: ['S', 'M'],
    material: 'leather',
    condition: 'NEW',
    status: 'PUBLISHED',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: [],
  };

  const mockCategory = {
    id: '1',
    name: 'Bags',
    slug: 'bags',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateProductDto = {
    title: 'New Bag',
    description: 'New luxury bag',
    categoryId: '1',
    dailyPrice: 150,
    depositPrice: 750,
    stock: 5,
    colors: ['red'],
    sizes: ['M', 'L'],
    material: 'leather',
    condition: 'NEW',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            category: {
              findUnique: jest.fn(),
            },
            productImage: {
              create: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(
        mockCategory,
      );
      (prismaService.product.create as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await service.createProduct(mockCreateProductDto);

      expect(result).toEqual(mockProduct);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCreateProductDto.categoryId },
      });
      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          title: mockCreateProductDto.title,
          slug: 'new-bag',
          description: mockCreateProductDto.description,
          categoryId: mockCreateProductDto.categoryId,
          dailyPrice: mockCreateProductDto.dailyPrice,
          depositPrice: mockCreateProductDto.depositPrice,
          stock: mockCreateProductDto.stock,
          colors: mockCreateProductDto.colors,
          sizes: mockCreateProductDto.sizes,
          material: mockCreateProductDto.material,
          condition: mockCreateProductDto.condition,
          status: 'PUBLISHED',
        },
        include: { images: true },
      });
    });

    it('should throw BadRequestException if category not found', async () => {
      (prismaService.category.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createProduct(mockCreateProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getProduct', () => {
    it('should get a product by id', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );

      const result = await service.getProduct('1');

      expect(result).toEqual(mockProduct);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { images: true, category: true },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProduct('1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if product is deleted', async () => {
      const deletedProduct = { ...mockProduct, deletedAt: new Date() };
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        deletedProduct,
      );

      await expect(service.getProduct('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProducts', () => {
    it('should get products with pagination', async () => {
      const mockQuery = {
        page: 1,
        pageSize: 10,
        categoryId: undefined,
        search: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      };

      (prismaService.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);
      (prismaService.product.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getProducts(mockQuery);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter products by category', async () => {
      const mockQuery = {
        page: 1,
        pageSize: 10,
        categoryId: '1',
        search: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      };

      (prismaService.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);
      (prismaService.product.count as jest.Mock).mockResolvedValue(1);

      await service.getProducts(mockQuery);

      const callArgs = (prismaService.product.findMany as jest.Mock).mock
        .calls[0][0];
      expect(callArgs.where.categoryId).toBe('1');
    });

    it('should filter products by price range', async () => {
      const mockQuery = {
        page: 1,
        pageSize: 10,
        categoryId: undefined,
        search: undefined,
        minPrice: 80,
        maxPrice: 150,
      };

      (prismaService.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);
      (prismaService.product.count as jest.Mock).mockResolvedValue(1);

      await service.getProducts(mockQuery);

      const callArgs = (prismaService.product.findMany as jest.Mock).mock
        .calls[0][0];
      expect(callArgs.where.dailyPrice).toEqual({
        gte: 80,
        lte: 150,
      });
    });

    it('should search products by title and description', async () => {
      const mockQuery = {
        page: 1,
        pageSize: 10,
        categoryId: undefined,
        search: 'luxury',
        minPrice: undefined,
        maxPrice: undefined,
      };

      (prismaService.product.findMany as jest.Mock).mockResolvedValue([
        mockProduct,
      ]);
      (prismaService.product.count as jest.Mock).mockResolvedValue(1);

      await service.getProducts(mockQuery);

      const callArgs = (prismaService.product.findMany as jest.Mock).mock
        .calls[0][0];
      expect(callArgs.where.OR).toBeDefined();
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const updateDto = {
        title: 'Updated Title',
        dailyPrice: 200,
      };

      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (prismaService.product.update as jest.Mock).mockResolvedValue({
        ...mockProduct,
        ...updateDto,
      });

      const result = await service.updateProduct('1', updateDto);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          title: updateDto.title,
          dailyPrice: updateDto.dailyPrice,
        },
        include: { images: true },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateProduct('1', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (prismaService.product.update as jest.Mock).mockResolvedValue({
        ...mockProduct,
        deletedAt: new Date(),
      });

      await service.deleteProduct('1');

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe('uploadImage', () => {
    it('should upload product image', async () => {
      const mockImage = {
        id: '1',
        productId: '1',
        url: 'https://example.com/image.jpg',
        alt: 'Product image',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (prismaService.productImage.count as jest.Mock).mockResolvedValue(0);
      (prismaService.productImage.create as jest.Mock).mockResolvedValue(
        mockImage,
      );

      const result = await service.uploadImage(
        '1',
        'https://example.com/image.jpg',
        'Product image',
      );

      expect(result).toEqual(mockImage);
    });
  });
});
