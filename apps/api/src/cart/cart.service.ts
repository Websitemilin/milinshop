import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { images: true } } },
        },
      },
    });

    if (!cart) {
      // Create cart if doesn't exist
      return this.prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Validate product exists and is available
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if (product.stock < dto.quantity) {
      throw new ConflictException('Insufficient stock');
    }

    // Validate dates
    const fromDate = new Date(dto.rentalFromDate);
    const toDate = new Date(dto.rentalToDate);

    if (toDate <= fromDate) {
      throw new BadRequestException('Rental end date must be after start date');
    }

    // Check for existing item with same product and dates
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_rentalFromDate_rentalToDate: {
          cartId: cart.id,
          productId: dto.productId,
          rentalFromDate: fromDate,
          rentalToDate: toDate,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
        rentalFromDate: fromDate,
        rentalToDate: toDate,
      },
      include: { product: true },
    });
  }

  async updateCartItem(cartItemId: string, userId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity !== undefined && dto.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: {
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.rentalFromDate && { rentalFromDate: new Date(dto.rentalFromDate) }),
        ...(dto.rentalToDate && { rentalToDate: new Date(dto.rentalToDate) }),
      },
      include: { product: true },
    });
  }

  async removeFromCart(cartItemId: string, userId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return { success: true };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { success: true };
  }
}
