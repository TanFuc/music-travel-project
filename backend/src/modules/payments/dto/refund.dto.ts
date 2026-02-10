import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RefundMethod } from '@prisma/client';

export class CreateRefundDto {
  @ApiProperty({ example: 'BK12345ABC', description: 'Mã đơn hàng cần hoàn tiền' })
  @IsNotEmpty()
  @IsString()
  bookingCode: string;

  @ApiProperty({ example: 100000, description: 'Số tiền hoàn (VND)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiProperty({ required: false, description: 'Lý do hoàn tiền' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ enum: RefundMethod, description: 'Phương thức hoàn tiền' })
  @IsEnum(RefundMethod)
  refundMethod: RefundMethod;
}
