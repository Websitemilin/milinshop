import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  ACCEPTABLE = 'ACCEPTABLE',
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsNumber()
  dailyPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  depositPrice?: number;

  @ApiProperty()
  @IsNumber()
  stock: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  colors?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  sizes?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  material?: string;

  @ApiProperty({ required: false })
  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition;
}

export class UpdateProductDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  dailyPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  colors?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  sizes?: string[];
}

export class ProductQueryDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  pageSize: number = 20;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;
}
