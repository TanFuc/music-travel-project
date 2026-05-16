import { IsOptional, IsString, IsInt, IsBoolean, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
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
  @ApiPropertyOptional({ description: 'Filter by combo status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isCombo?: boolean;
  @ApiPropertyOptional({
    description: 'Filter by listing type',
    enum: ['TOUR', 'COMBO'],
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsIn(['TOUR', 'COMBO'])
  type?: 'TOUR' | 'COMBO';
}
