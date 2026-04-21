import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ValidateVoucherDto {
  @ApiProperty({ example: 'SUMMER2024', description: 'Voucher code' })
  @IsNotEmpty({ message: 'Mã giảm giá không được để trống.' })
  @IsString()
  code: string;
  @ApiProperty({ example: 500000, description: 'Order value to validate against' })
  @IsNumber()
  @Min(0)
  orderValue: number;
}
