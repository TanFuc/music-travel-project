import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  IsObject,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStageDto {
  @ApiProperty({
    example: 1,
    description: 'ID của địa điểm',
  })
  @IsNotEmpty({ message: 'Địa điểm không được để trống.' })
  @IsInt({ message: 'ID địa điểm phải là số nguyên.' })
  locationId: number;

  @ApiProperty({
    example: 'Nhà hát Hòa Bình',
    description: 'Tên sân khấu',
  })
  @IsNotEmpty({ message: 'Tên sân khấu không được để trống.' })
  @IsString()
  @MinLength(3, { message: 'Tên sân khấu phải có ít nhất 3 ký tự.' })
  name: string;

  @ApiPropertyOptional({
    example: '123 Đường ABC, Quận 1, TP.HCM',
    description: 'Địa chỉ sân khấu',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 10.7756,
    description: 'Vĩ độ',
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: 106.7019,
    description: 'Kinh độ',
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 'https://maps.google.com/...',
    description: 'Link Google Maps',
  })
  @IsOptional()
  @IsString()
  mapLink?: string;

  @ApiPropertyOptional({
    example: { zones: [{ name: 'VIP', rows: 10, seatsPerRow: 20 }] },
    description: 'Cấu hình sơ đồ chỗ ngồi tùy chỉnh',
  })
  @IsOptional()
  @IsObject()
  seatMapConfig?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID của template sơ đồ chỗ ngồi',
  })
  @IsOptional()
  @IsInt()
  seatMapTemplate?: number;

  @ApiPropertyOptional({ example: 1, description: 'Branch ID' })
  @IsOptional()
  @IsInt()
  branchId?: number;
}
