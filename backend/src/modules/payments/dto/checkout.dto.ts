import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CheckoutDto {
  @ApiProperty({ example: 'BK12345ABC', description: 'Booking code' })
  @IsNotEmpty({ message: 'Mã đơn hàng không được để trống.' })
  @IsString()
  bookingCode: string;

  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsNotEmpty({ message: 'Phương thức thanh toán không được để trống.' })
  @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ.' })
  paymentMethod: PaymentMethod;
}
