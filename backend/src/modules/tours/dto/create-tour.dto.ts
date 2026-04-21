import { IsNotEmpty, IsString, IsInt, IsOptional, IsObject, MinLength, IsBoolean, IsNumber, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateTourDto {
    @ApiProperty({ example: 'Tour Đà Lạt 3N2Đ', description: 'Tour title' })
    @IsNotEmpty({ message: 'Tiêu đề không được để trống.' })
    @IsString()
    @MinLength(3)
    title: string;
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
    @ApiPropertyOptional({ example: 1, description: 'Branch ID' })
    @ApiPropertyOptional({ example: 1, description: 'Branch ID' })
    @IsOptional()
    @IsInt()
    branchId?: number;
    @ApiPropertyOptional({ description: 'Is a combo tour (tour + show)?' })
    @IsOptional()
    @IsBoolean()
    isCombo?: boolean;
    @ApiPropertyOptional({ description: 'Base minimum price' })
    @IsOptional()
    @IsNumber()
    minPrice?: number;
    @ApiPropertyOptional({ description: 'ID of the show this combo is linked to' })
    @IsOptional()
    @IsInt()
    linkedShowId?: number;
}
