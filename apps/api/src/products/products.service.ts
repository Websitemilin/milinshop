import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './products.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const slug = this.generateSlug(dto.title);

    return this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        categoryId: dto.categoryId,
        dailyPrice: dto.dailyPrice,
        depositPrice: dto.depositPrice || 0,
        stock: dto.stock,
        colors: dto.colors || [],
        sizes: dto.sizes || [],
        material: dto.material,
        condition: dto.condition,
        status: 'PUBLISHED',
      },
      include: { images: true },
    });
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true, category: true },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getProducts(query: ProductQueryDto) {
    // Support both pageSize and limit as aliases
    const effectivePageSize = query.limit || query.pageSize || 20;
    const effectivePage = query.page || 1;
    const where: any = { deletedAt: null, status: 'PUBLISHED' };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.minPrice !== undefined) {
      where.dailyPrice = { gte: query.minPrice };
    }

    if (query.maxPrice !== undefined) {
      if (where.dailyPrice) {
        where.dailyPrice.lte = query.maxPrice;
      } else {
        where.dailyPrice = { lte: query.maxPrice };
      }
    }

    const skip = (effectivePage - 1) * effectivePageSize;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: effectivePageSize,
        include: { images: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: products,
      total,
      page: effectivePage,
      pageSize: effectivePageSize,
      totalPages: Math.ceil(total / effectivePageSize),
    };
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.getProduct(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.dailyPrice && { dailyPrice: dto.dailyPrice }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.colors && { colors: dto.colors }),
        ...(dto.sizes && { sizes: dto.sizes }),
      },
      include: { images: true },
    });
  }

  async deleteProduct(id: string) {
    await this.getProduct(id);

    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async uploadImage(productId: string, url: string, alt?: string) {
    const product = await this.getProduct(productId);

    const order = await this.prisma.productImage.count({
      where: { productId },
    });

    return this.prisma.productImage.create({
      data: {
        productId,
        url,
        alt,
        order,
      },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
