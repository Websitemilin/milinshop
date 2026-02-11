import { Controller, Post, Body, Headers, RawBodyRequest, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createPaymentIntent(
    @Request() req: any,
    @Body() body: { orderId: string },
  ) {
    return this.paymentsService.createPaymentIntent(body.orderId, req.user.userId);
  }

  @Post('webhook')
  async webhook(
    @RawBodyRequest() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const body = (req as any).rawBody;
    return this.paymentsService.handleWebhook(body, signature);
  }
}
