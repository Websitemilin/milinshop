import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
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
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  dailyPrice: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  depositPrice?: number;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
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
  @Type(() => Number)
  dailyPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
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
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  pageSize: number = 20;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;
}
