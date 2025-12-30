import { IsString, IsInt, IsOptional, IsObject, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTourDto {
  @ApiPropertyOptional({ example: 'Tour Đà Lạt 3N2Đ - Updated', description: 'Tour title' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({ description: 'Tour description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '3 ngày 2 đêm', description: 'Tour duration' })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: 1, description: 'Departure location ID' })
  @IsOptional()
  @IsInt()
  departureLocId?: number;

  @ApiPropertyOptional({ example: 2, description: 'Destination location ID' })
  @IsOptional()
  @IsInt()
  destinationLocId?: number;

  @ApiPropertyOptional({ description: 'Additional properties' })
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'SEO meta title' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'SEO meta keywords' })
  @IsOptional()
  @IsString()
  metaKeywords?: string;
}
