import { IsNotEmpty, IsDateString, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @ApiProperty({
    example: '2024-03-15',
    description: 'Tour start date',
  })
  @IsNotEmpty({ message: 'Ngày khởi hành không được để trống.' })
  @IsDateString({}, { message: 'Ngày khởi hành không hợp lệ.' })
  startDate: string;

  @ApiProperty({
    example: 2500000,
    description: 'Price per person',
  })
  @IsNotEmpty({ message: 'Giá không được để trống.' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Giá phải là số.' })
  @Min(0, { message: 'Giá không được âm.' })
  price: number;

  @ApiProperty({
    example: 30,
    description: 'Maximum capacity',
  })
  @IsNotEmpty({ message: 'Số chỗ không được để trống.' })
  @Type(() => Number)
  @IsInt({ message: 'Số chỗ phải là số nguyên.' })
  @Min(1, { message: 'Số chỗ phải ít nhất là 1.' })
  capacity: number;
}
