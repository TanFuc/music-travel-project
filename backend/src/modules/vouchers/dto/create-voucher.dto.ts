import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherDiscountType } from '@prisma/client';

export class CreateVoucherDto {
  @ApiProperty({ example: 'SUMMER2024', description: 'Voucher code' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ enum: VoucherDiscountType, description: 'Discount type' })
  @IsEnum(VoucherDiscountType)
  discountType: VoucherDiscountType;

  @ApiProperty({ example: 10, description: 'Discount value' })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ example: 100000, description: 'Minimum order value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Maximum discount amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 100, description: 'Usage limit' })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;
}
