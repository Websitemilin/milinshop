import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      newUsers,
      totalProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      // Total revenue
      this.prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),

      // Total orders
      this.prisma.order.count(),

      // Total users
      this.prisma.user.count(),

      // New users (last 30 days)
      this.prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // Total products
      this.prisma.product.count({ where: { deletedAt: null } }),

      // Recent orders
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, items: true },
      }),

      // Top products
      this.prisma.product.findMany({
        where: { deletedAt: null },
        orderBy: { stock: 'asc' },
        take: 5,
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalOrders,
      totalUsers,
      newUsers,
      totalProducts,
      recentOrders,
      topProducts,
    };
  }

  async getRevenueChart(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const chartData = new Map<string, number>();

    for (const payment of payments) {
      const date = payment.createdAt.toISOString().split('T')[0];
      const current = chartData.get(date) || 0;
      chartData.set(date, current + payment.amount);
    }

    return Array.from(chartData.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));
  }

  async getOrderStats() {
    const orders = await this.prisma.order.findMany({
      select: { status: true },
    });

    const stats = {
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      RETURNED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };

    for (const order of orders) {
      stats[order.status as keyof typeof stats]++;
    }

    return stats;
  }
}
