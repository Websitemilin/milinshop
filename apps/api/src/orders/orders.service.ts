import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Fetch all products and check availability with Redis locks
    const lockDuration = 300; // 5 minutes
    const locks: string[] = [];

    try {
      // Attempt to acquire locks for all items
      for (const item of dto.items) {
        const fromDate = new Date(item.rentalFromDate);
        const toDate = new Date(item.rentalToDate);

        if (toDate <= fromDate) {
          throw new BadRequestException('Rental end date must be after start date');
        }

        // Check for overlapping rentals
        const overlapping = await this.prisma.orderItem.findFirst({
          where: {
            productId: item.productId,
            OR: [
              {
                AND: [
                  { rentalFromDate: { lt: toDate } },
                  { rentalToDate: { gt: fromDate } },
                ],
              },
            ],
          },
        });

        if (overlapping) {
          throw new ConflictException(
            `Product ${item.productId} is not available for the selected dates`,
          );
        }

        // Try to acquire lock
        const lockKey = `product:${item.productId}:${fromDate.toISOString()}:${toDate.toISOString()}`;
        const lockAcquired = await this.redis.setLock(lockKey, lockDuration);

        if (!lockAcquired) {
          throw new ConflictException(`Unable to reserve product ${item.productId}`);
        }
        locks.push(lockKey);
      }

      // All locks acquired, create order in transaction
      const orderItems = [];
      let subtotal = 0;
      let totalDeposit = 0;

      for (const item of dto.items) {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for ${product.title}. Available: ${product.stock}`,
          );
        }

        const rentalDays = Math.ceil(
          (new Date(item.rentalToDate).getTime() -new Date(item.rentalFromDate).getTime()) / (1000 * 60 * 60 * 24),
        );

        const itemSubtotal = product.dailyPrice * item.quantity * rentalDays;
        const itemDeposit = product.depositPrice * item.quantity;

        subtotal += itemSubtotal;
        totalDeposit += itemDeposit;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          dailyPrice: product.dailyPrice,
          depositPrice: product.depositPrice,
          rentalFromDate: new Date(item.rentalFromDate),
          rentalToDate: new Date(item.rentalToDate),
          status: 'PENDING',
        });
      }

      const tax = subtotal * 0.08; // 8% tax
      const total = subtotal + tax + totalDeposit;

      const order = await this.prisma.order.create({
        data: {
          userId,
          subtotal,
          tax,
          deposit: totalDeposit,
          total,
          deliveryAddress: dto.deliveryAddress,
          notes: dto.notes,
          items: {
            create: orderItems,
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Release locks - order created successfully
      for (const lockKey of locks) {
        await this.redis.releaseLock(lockKey);
      }

      return order;
    } catch (error) {
      // Release all locks on error
      for (const lockKey of locks) {
        await this.redis.releaseLock(lockKey);
      }
      throw error;
    }
  }

  async getOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getUserOrders(userId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: pageSize,
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      items: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status as any },
      include: { items: true },
    });
  }

  async getAllOrders(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: pageSize,
        include: {
          items: { include: { product: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count(),
    ]);

    return {
      items: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
