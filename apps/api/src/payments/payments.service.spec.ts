import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prismaService: jest.Mocked<PrismaService>;
  let stripeInstance: any;

  const mockOrder = {
    id: 'order-1',
    userId: 'user-1',
    subtotal: 500,
    tax: 40,
    deposit: 500,
    total: 1040,
    status: 'PENDING',
    paymentIntentId: null,
    deliveryAddress: '123 Main St',
    notes: 'Please leave at door',
    paymentStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [],
    user: { id: 'user-1', email: 'test@example.com' },
  };

  const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
    id: 'pi_123',
    object: 'payment_intent',
    amount: 104000,
    currency: 'usd',
    client_secret: 'pi_123_secret',
    status: 'succeeded',
    metadata: {
      orderId: 'order-1',
      userId: 'user-1',
    },
    charges: {
      object: 'list',
      data: [{ id: 'ch_123' } as Stripe.Charge],
    } as any,
    last_payment_error: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            payment: {
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    stripeInstance = require('stripe')();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (stripeInstance.paymentIntents.create as jest.Mock).mockResolvedValue(
        mockPaymentIntent,
      );
      (prismaService.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        paymentIntentId: mockPaymentIntent.id,
      });

      const result = await service.createPaymentIntent('order-1', 'user-1');

      expect(result).toHaveProperty('clientSecret', mockPaymentIntent.client_secret);
      expect(result).toHaveProperty('paymentIntentId', mockPaymentIntent.id);
      expect(result).toHaveProperty('amount', 1040);
      expect(stripeInstance.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 104000, // cents
          currency: 'usd',
          metadata: {
            orderId: 'order-1',
            userId: 'user-1',
          },
        }),
        { idempotencyKey: 'order-order-1' },
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.createPaymentIntent('invalid-id', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user not authorized', async () => {
      const order = { ...mockOrder, userId: 'user-2' };
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(order);

      await expect(
        service.createPaymentIntent('order-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order status not PENDING', async () => {
      const confirmedOrder = { ...mockOrder, status: 'CONFIRMED' };
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(
        confirmedOrder,
      );

      await expect(
        service.createPaymentIntent('order-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle Stripe errors gracefully', async () => {
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (stripeInstance.paymentIntents.create as jest.Mock).mockRejectedValue(
        new Error('Stripe error'),
      );

      await expect(
        service.createPaymentIntent('order-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleWebhook', () => {
    it('should handle payment_intent.succeeded webhook', async () => {
      const event: Stripe.Event = {
        id: 'evt_123',
        object: 'event',
        type: 'payment_intent.succeeded',
        created: Date.now() / 1000,
        data: {
          object: mockPaymentIntent,
        },
      } as any;

      const body = Buffer.from(JSON.stringify(event));
      const signature = 'sig_123';

      (stripeInstance.webhooks.constructEvent as jest.Mock).mockReturnValue(event);
      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.payment.create as jest.Mock).mockResolvedValue({
        id: 'payment-1',
      });
      (prismaService.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'CONFIRMED',
      });

      const result = await service.handleWebhook(body, signature);

      expect(result).toEqual({ received: true });
      expect(prismaService.payment.create).toHaveBeenCalled();
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'CONFIRMED' },
      });
    });

    it('should handle payment_intent.payment_failed webhook', async () => {
      const failedPaymentIntent: Partial<Stripe.PaymentIntent> = {
        ...mockPaymentIntent,
        last_payment_error: {
          message: 'Card declined',
        } as any,
      };

      const event: Stripe.Event = {
        id: 'evt_123',
        object: 'event',
        type: 'payment_intent.payment_failed',
        created: Date.now() / 1000,
        data: {
          object: failedPaymentIntent,
        },
      } as any;

      const body = Buffer.from(JSON.stringify(event));
      const signature = 'sig_123';

      (stripeInstance.webhooks.constructEvent as jest.Mock).mockReturnValue(event);
      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaService.payment.create as jest.Mock).mockResolvedValue({
        id: 'payment-1',
      });

      const result = await service.handleWebhook(body, signature);

      expect(result).toEqual({ received: true });
      expect(prismaService.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'FAILED',
          failureReason: 'Card declined',
        }),
      });
    });

    it('should handle charge.refunded webhook', async () => {
      const charge: Stripe.Charge = {
        id: 'ch_123',
        object: 'charge',
      } as any;

      const event: Stripe.Event = {
        id: 'evt_123',
        object: 'event',
        type: 'charge.refunded',
        created: Date.now() / 1000,
        data: {
          object: charge,
        },
      } as any;

      const body = Buffer.from(JSON.stringify(event));
      const signature = 'sig_123';

      const mockPayment = {
        id: 'payment-1',
        orderId: 'order-1',
        status: 'SUCCEEDED',
      };

      (stripeInstance.webhooks.constructEvent as jest.Mock).mockReturnValue(event);
      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(
        mockPayment,
      );
      (prismaService.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: 'REFUNDED',
      });
      (prismaService.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'REFUNDED',
      });

      const result = await service.handleWebhook(body, signature);

      expect(result).toEqual({ received: true });
      expect(prismaService.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: { status: 'REFUNDED' },
      });
    });

    it('should throw BadRequestException on signature verification failure', async () => {
      const body = Buffer.from('invalid');
      const signature = 'invalid_sig';

      (stripeInstance.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Signature verification failed');
      });

      await expect(service.handleWebhook(body, signature)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should deduplicate webhook events', async () => {
      const event: Stripe.Event = {
        id: 'evt_123',
        object: 'event',
        type: 'payment_intent.succeeded',
        created: Date.now() / 1000,
        data: {
          object: mockPaymentIntent,
        },
      } as any;

      const body = Buffer.from(JSON.stringify(event));
      const signature = 'sig_123';

      const existingPayment = { id: 'payment-1' };

      (stripeInstance.webhooks.constructEvent as jest.Mock).mockReturnValue(event);
      (prismaService.payment.findFirst as jest.Mock).mockResolvedValue(
        existingPayment,
      );

      const result = await service.handleWebhook(body, signature);

      expect(result).toEqual({ received: true });
      // Payment should not be created again
      expect(prismaService.payment.create).not.toHaveBeenCalled();
    });
  });

  describe('getPayment', () => {
    it('should get payment by id', async () => {
      const mockPayment = {
        id: 'payment-1',
        orderId: 'order-1',
        status: 'SUCCEEDED',
        order: mockOrder,
      };

      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(
        mockPayment,
      );

      const result = await service.getPayment('payment-1');

      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if payment not found', async () => {
      (prismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getPayment('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOrderPayments', () => {
    it('should get all payments for order', async () => {
      const mockPayments = [
        { id: 'payment-1', orderId: 'order-1', status: 'SUCCEEDED' },
      ];

      (prismaService.payment.findMany as jest.Mock).mockResolvedValue(
        mockPayments,
      );

      const result = await service.getOrderPayments('order-1');

      expect(result).toEqual(mockPayments);
      expect(prismaService.payment.findMany).toHaveBeenCalledWith({
        where: { orderId: 'order-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
