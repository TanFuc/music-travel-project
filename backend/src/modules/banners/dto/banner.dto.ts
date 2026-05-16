import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { BannerPosition } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateBannerDto {
  @ApiProperty({ description: 'Title of the banner' })
  @IsOptional()
  @IsString()
  title?: string;
  @ApiProperty({ description: 'Image URL of the banner' })
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;
  @ApiPropertyOptional({ description: 'Mobile Image URL' })
  @IsOptional()
  @IsUrl()
  mobileImageUrl?: string;
  actionLink?: string;
  @ApiPropertyOptional({ description: 'Location display text' })
  @IsOptional()
  @IsString()
  location?: string;
  @ApiPropertyOptional({ description: 'Date/Time display text' })
  @IsOptional()
  @IsString()
  date?: string;
  @ApiProperty({ enum: BannerPosition, default: BannerPosition.HOME_MAIN_SLIDER })
  @IsNotEmpty()
  @IsEnum(BannerPosition)
  position: BannerPosition;
  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
  @ApiPropertyOptional({ description: 'Is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @ApiPropertyOptional({ description: 'Start time' })
  @IsOptional()
  @IsDateString()
  startTime?: Date;
  @ApiPropertyOptional({ description: 'End time' })
  @IsOptional()
  @IsDateString()
  endTime?: Date;
}
export class UpdateBannerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  mobileImageUrl?: string;
  actionLink?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string;
  @ApiPropertyOptional({ enum: BannerPosition })
  @IsOptional()
  @IsEnum(BannerPosition)
  position?: BannerPosition;
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  displayOrder?: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startTime?: Date;
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endTime?: Date;
}
