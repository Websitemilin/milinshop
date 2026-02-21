import { Controller, Post, Body, Headers, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createPaymentIntent(
    @Request() req: any,
    @Body() body: { orderId: string },
  ) {
    return this.paymentsService.createPaymentIntent(body.orderId, req.user.userId);
  }

  @Post('webhook')
  async webhook(
    @Request() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    const body = req.rawBody || req.body;
    return this.paymentsService.handleWebhook(body, signature);
  }
}
