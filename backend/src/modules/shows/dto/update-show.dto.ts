import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsObject,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShowStatus } from '@prisma/client';
export class UpdateShowDto {
  @ApiPropertyOptional({
    example: 'Concert ABC 2024 - Updated',
    description: 'Show title',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Tiêu đề phải có ít nhất 3 ký tự.' })
  title?: string;
  @ApiPropertyOptional({
    example: 'An amazing concert featuring top artists...',
    description: 'Show description',
  })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiPropertyOptional({
    example: 1,
    description: 'Stage ID',
  })
  @IsOptional()
  @IsInt({ message: 'ID sân khấu phải là số nguyên.' })
  stageId?: number;
  @ApiPropertyOptional({
    example: '2024-03-15T19:00:00Z',
    description: 'Performance time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Thời gian biểu diễn không hợp lệ.' })
  performTime?: string;
  @ApiPropertyOptional({
    example: '2024-03-15T17:00:00Z',
    description: 'Check-in time',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Thời gian check-in không hợp lệ.' })
  checkInTime?: string;
  @ApiPropertyOptional({
    example: 'UPCOMING',
    description: 'Show status',
    enum: ShowStatus,
  })
  @IsOptional()
  @IsEnum(ShowStatus, { message: 'Trạng thái không hợp lệ.' })
  status?: ShowStatus;
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
  @ApiPropertyOptional({
    example: 'concert, music, 2024',
    description: 'SEO meta keywords',
  })
  @IsOptional()
  @IsString()
  metaKeywords?: string;
  @ApiPropertyOptional({ example: 1, description: 'Branch ID' })
  @IsOptional()
  @IsInt()
  branchId?: number;
}
