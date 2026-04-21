import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class DepositDto {
  @ApiProperty({
    example: 100000,
    description: 'Amount to deposit (VND)',
    minimum: 10000,
  })
  @IsNotEmpty({ message: 'Số tiền không được để trống.' })
  @IsNumber({}, { message: 'Số tiền phải là số.' })
  @Min(10000, { message: 'Số tiền nạp tối thiểu là 10,000 VND.' })
  amount: number;
}
