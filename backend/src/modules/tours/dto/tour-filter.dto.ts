import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class TourFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by destination location ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  destinationId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filter by branch ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  branchId?: number;

  @ApiPropertyOptional({ example: 'da-lat', description: 'Filter by location slug' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'sai-gon', description: 'Filter by departure location slug' })
  @IsOptional()
  @IsString()
  departure?: string;

  @ApiPropertyOptional({ example: 'da-lat', description: 'Filter by destination location slug' })
  @IsOptional()
  @IsString()
  destination?: string;
}
