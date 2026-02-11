import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './cart.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async addToCart(@Request() req: any, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, dto);
  }

  @Put('items/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateCartItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(id, req.user.userId, dto);
  }

  @Delete('items/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async removeFromCart(@Request() req: any, @Param('id') id: string) {
    return this.cartService.removeFromCart(id, req.user.userId);
  }

  @Delete()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.userId);
  }
}
