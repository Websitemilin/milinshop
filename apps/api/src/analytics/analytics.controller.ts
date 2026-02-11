import { Controller, Get, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('revenue')
  async getRevenueChart(
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 30,
  ) {
    return this.analyticsService.getRevenueChart(days);
  }

  @Get('orders')
  async getOrderStats() {
    return this.analyticsService.getOrderStats();
  }
}
