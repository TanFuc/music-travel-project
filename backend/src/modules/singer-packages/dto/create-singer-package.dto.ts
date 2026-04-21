import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';
export class CreateSingerPackageDto {
  @ApiProperty({ description: 'Tên gói đăng ký' })
  @IsString()
  name: string;
  @ApiProperty({ description: 'Tên tiếng Anh', required: false })
  @IsOptional()
  @IsString()
  nameEn?: string;
  @ApiProperty({ description: 'Giá gói', example: 1500000 })
  @IsNumber()
  @Min(0)
  price: number;
  @ApiProperty({ description: 'Giá gốc trước giảm', required: false, example: 2000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;
  @ApiProperty({ description: 'Mô tả gói', required: false })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty({ description: 'Danh sách quyền lợi', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
  @ApiProperty({ description: 'Mã màu', required: false })
  @IsOptional()
  @IsString()
  colorCode?: string;
  @ApiProperty({ description: 'Icon', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
  @ApiProperty({ description: 'Thứ tự hiển thị', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
  @ApiProperty({ description: 'Số lượng đăng ký tối đa', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRegistrations?: number;
  @ApiProperty({ description: 'Trạng thái hoạt động', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
