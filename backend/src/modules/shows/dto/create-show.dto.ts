import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsObject,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateShowDto {
  @ApiProperty({
    example: 'Concert ABC 2024',
    description: 'Show title',
  })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống.' })
  @IsString()
  @MinLength(3, { message: 'Tiêu đề phải có ít nhất 3 ký tự.' })
  title: string;
  @ApiPropertyOptional({
    example: 'An amazing concert featuring top artists...',
    description: 'Show description',
  })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty({
    example: 1,
    description: 'Stage ID',
  })
  @IsNotEmpty({ message: 'Sân khấu không được để trống.' })
  @IsInt({ message: 'ID sân khấu phải là số nguyên.' })
  stageId: number;
  @ApiProperty({
    example: '2024-03-15T19:00:00Z',
    description: 'Performance time',
  })
  @IsNotEmpty({ message: 'Thời gian biểu diễn không được để trống.' })
  @IsDateString({}, { message: 'Thời gian biểu diễn không hợp lệ.' })
  performTime: string;
  @ApiPropertyOptional({
    example: '2024-03-15T17:00:00Z',
    description: 'Check-in time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Thời gian check-in không hợp lệ.' })
  checkInTime?: string;
  @ApiPropertyOptional({
    example: { dresscode: 'White', hashtag: '#ShowABC' },
    description: 'Additional properties',
  })
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
  @ApiPropertyOptional({
    example: 'Concert ABC 2024 | Best Music Event',
    description: 'SEO meta title',
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;
  @ApiPropertyOptional({
    example: 'Join us for the biggest concert of 2024...',
    description: 'SEO meta description',
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;
  @ApiPropertyOptional({ example: 1, description: 'Branch ID' })
  @IsOptional()
  @IsInt()
  branchId?: number;
}
