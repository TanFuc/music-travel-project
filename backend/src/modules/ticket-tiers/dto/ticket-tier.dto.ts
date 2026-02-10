import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketTierDto {
  @ApiProperty({ example: 'Vé Hạt Xanh - Green Solo', description: 'Tên vé' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Green Solo', description: 'Tên tiếng Anh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nameEn?: string;

  @ApiProperty({ example: 350000, description: 'Giá vé' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    example: 'Mỗi cá nhân là một "hạt mầm" lan tỏa lối sống xanh.',
    description: 'Mô tả chi tiết',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Đồ uống + ăn nhẹ. Ghế ngồi khu Green Solo.',
    description: 'Quyền lợi',
  })
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional({
    example: 'Khách lẻ, bạn trẻ, người yêu âm nhạc.',
    description: 'Đối tượng',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetAudience?: string;

  @ApiPropertyOptional({ example: '#22C55E', description: 'Mã màu' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  colorCode?: string;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị (1-5)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({ example: 1, description: 'Số người/vé (1 cho cá nhân, 5 cho nhóm)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  groupSize?: number;

  @ApiPropertyOptional({ example: 100, description: 'Tổng số vé' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalQuantity?: number;

  @ApiPropertyOptional({ example: 10, description: 'Số vé tối đa mỗi đơn' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxPerOrder?: number;

  @ApiPropertyOptional({ example: true, description: 'Kích hoạt' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTicketTierDto extends PartialType(CreateTicketTierDto) {}

export class TicketTierQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Trang' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Số lượng mỗi trang' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'green', description: 'Tìm kiếm theo tên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: true, description: 'Chỉ hiển thị vé đang hoạt động' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}

export class PurchaseTicketTierDto {
  @ApiProperty({ example: 1, description: 'ID loại vé' })
  @IsNumber()
  @Type(() => Number)
  ticketTierId: number;

  @ApiProperty({ example: 2, description: 'Số lượng' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
