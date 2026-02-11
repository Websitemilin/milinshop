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
  ParseIntPipe,
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
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number = 50,
  ) {
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
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number = 50,
    @Query('status') status?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        include: { user: true, items: true },
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
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize: number = 50,
  ) {
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

  // Categories
  @Get('categories')
  async getCategories() {
    return this.prisma.category.findMany({
      include: { children: true },
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

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
