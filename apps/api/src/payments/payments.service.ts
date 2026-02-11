import Stripe from 'stripe';
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: true },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order cannot be paid in current status');
    }

    try {
      // Create payment intent with idempotency key based on order ID
      const paymentIntent = await this.stripe.paymentIntents.create(
        {
          amount: Math.round(order.total * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            orderId: order.id,
            userId: order.userId,
          },
          description: `LUXE Rental Order ${order.id}`,
        },
        {
          idempotencyKey: `order-${order.id}`,
        },
      );

      // Update order with payment intent
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentIntentId: paymentIntent.id },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: order.total,
      };
    } catch (error) {
      this.logger.error('Stripe payment intent creation failed:', error);
      throw new BadRequestException('Failed to create payment intent');
    }
  }

  async handleWebhook(body: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw new BadRequestException('Webhook signature verification failed');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;

      default:
        this.logger.log(`Unhandled webhook event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      // Already processed
      return;
    }

    await this.prisma.payment.create({
      data: {
        orderId,
        userId: paymentIntent.metadata.userId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'SUCCEEDED',
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.charges.data[0]?.id,
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CONFIRMED' },
    });

    this.logger.log(`Payment succeeded for order ${orderId}`);
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment && payment.status === 'FAILED') {
      // Already processed
      return;
    }

    const reason = paymentIntent.last_payment_error?.message || 'Unknown error';

    await this.prisma.payment.create({
      data: {
        orderId,
        userId: paymentIntent.metadata.userId,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: 'FAILED',
        stripePaymentIntentId: paymentIntent.id,
        failureReason: reason,
        failedAt: new Date(),
      },
    });

    this.logger.error(`Payment failed for order ${orderId}: ${reason}`);
  }

  private async handleRefund(charge: Stripe.Charge) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripeChargeId: charge.id },
    });

    if (!payment) {
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'REFUNDED' },
    });

    this.logger.log(`Refund processed for order ${payment.orderId}`);
  }

  async getPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getOrderPayments(orderId: string) {
    return this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
