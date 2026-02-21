import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private prisma: PrismaService) {}

  // Users
  @Get('users')
  async getUsers(
    @Query('page') pageStr?: string,
    @Query('pageSize') pageSizeStr?: string,
  ) {
    const page = parseInt(pageStr || '1', 10) || 1;
    const pageSize = parseInt(pageSizeStr || '50', 10) || 50;
    const skip = (page - 1) * pageSize;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Orders
  @Get('orders')
  async getOrders(
    @Query('page') pageStr?: string,
    @Query('pageSize') pageSizeStr?: string,
    @Query('status') status?: string,
  ) {
    const page = parseInt(pageStr || '1', 10) || 1;
    const pageSize = parseInt(pageSizeStr || '50', 10) || 50;
    const skip = (page - 1) * pageSize;
    const where: any = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        include: { user: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Payments
  @Get('payments')
  async getPayments(
    @Query('page') pageStr?: string,
    @Query('pageSize') pageSizeStr?: string,
  ) {
    const page = parseInt(pageStr || '1', 10) || 1;
    const pageSize = parseInt(pageSizeStr || '50', 10) || 50;
    const skip = (page - 1) * pageSize;
    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: pageSize,
        include: { user: true, order: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      items: payments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Products (Admin)
  @Get('products')
  async getProducts(
    @Query('page') pageStr?: string,
    @Query('pageSize') pageSizeStr?: string,
    @Query('status') status?: string,
  ) {
    const page = parseInt(pageStr || '1', 10) || 1;
    const pageSize = parseInt(pageSizeStr || '50', 10) || 50;
    const skip = (page - 1) * pageSize;
    const where: any = { deletedAt: null };
    if (status) where.status = status;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        include: { images: true, category: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Categories
  @Get('categories')
  async getCategories() {
    return this.prisma.category.findMany({
      include: { children: true, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  @Post('categories')
  async createCategory(@Body() body: { name: string; description?: string }) {
    const slug = body.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
      },
    });
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    const data: any = {};
    if (body.name) {
      data.name = body.name;
      data.slug = body.name.toLowerCase().replace(/\s+/g, '-');
    }
    if (body.description !== undefined) data.description = body.description;
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }

  // Dashboard stats
  @Get('dashboard')
  async getDashboard() {
    const [totalUsers, totalOrders, totalRevenue, recentOrders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({ _sum: { total: true } }),
      this.prisma.order.findMany({
        take: 5,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
    };
  }
}
