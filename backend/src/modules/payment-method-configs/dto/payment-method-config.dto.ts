import { ApiProperty, PartialType } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsString, IsNotEmpty, IsNumber, Min, Max, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreatePaymentMethodConfigDto {
    @ApiProperty({ enum: PaymentMethod, description: 'Phương thức thanh toán' })
    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @ApiProperty({ description: 'Tên hiển thị', example: 'Chuyển khoản ngân hàng' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({ description: 'Phần trăm giảm giá', example: 5.5, default: 0 })
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercentage: number;

    @ApiProperty({ description: 'Trạng thái hoạt động', default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdatePaymentMethodConfigDto extends PartialType(CreatePaymentMethodConfigDto) { }
