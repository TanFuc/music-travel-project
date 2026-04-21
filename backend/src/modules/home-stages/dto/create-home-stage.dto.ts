import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateHomeStageDto {
  @ApiProperty({ example: 'Sân Khấu Mây Lang Thang', description: 'Tên hiển thị' })
  @IsNotEmpty({ message: 'Tên không được để trống.' })
  @IsString()
  @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự.' })
  title: string;
  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'URL hình ảnh' })
  @IsNotEmpty({ message: 'Hình ảnh không được để trống.' })
  @IsString()
  imageUrl: string;
  @ApiPropertyOptional({ example: 'Mô tả ngắn...', description: 'Mô tả thông tin' })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiPropertyOptional({ example: 'Đà Lạt', description: 'Địa điểm' })
  @IsOptional()
  @IsString()
  location?: string;
  @ApiPropertyOptional({ example: true, description: 'Trạng thái hiển thị' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
