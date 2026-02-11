import { IsUUID, IsNumber, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number = 1;

  @ApiProperty()
  @IsISO8601()
  rentalFromDate: string;

  @ApiProperty()
  @IsISO8601()
  rentalToDate: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ required: false })
  @IsNumber()
  quantity?: number;

  @ApiProperty({ required: false })
  @IsISO8601()
  rentalFromDate?: string;

  @ApiProperty({ required: false })
  @IsISO8601()
  rentalToDate?: string;
}
