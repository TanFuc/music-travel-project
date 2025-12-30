import { IsNotEmpty, IsEnum, IsInt, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType, MediaTargetType } from '@prisma/client';

export class CreateMediaDto {
  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Media URL' })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({ enum: MediaType, description: 'Media type' })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ enum: MediaTargetType, description: 'Target type' })
  @IsEnum(MediaTargetType)
  targetType: MediaTargetType;

  @ApiProperty({ example: 1, description: 'Target ID' })
  @IsInt()
  targetId: number;

  @ApiPropertyOptional({ example: false, description: 'Is featured' })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Display order' })
  @IsOptional()
  @IsInt()
  displayOrder?: number;
}
