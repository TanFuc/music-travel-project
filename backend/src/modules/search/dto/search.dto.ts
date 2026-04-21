import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
export enum SearchType {
  ALL = 'all',
  SHOWS = 'shows',
  TOURS = 'tours',
  LOCATIONS = 'locations',
}
export class SearchDto {
  @ApiPropertyOptional({ description: 'Search query keyword' })
  @IsOptional()
  @IsString()
  q?: string;
  @ApiPropertyOptional({ enum: SearchType, description: 'Type of search' })
  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;
  @ApiPropertyOptional({ description: 'Filter by location ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationId?: number;
  @ApiPropertyOptional({ description: 'Filter by branch ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;
  @ApiPropertyOptional({ description: 'Filter shows from date (ISO string)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;
  @ApiPropertyOptional({ description: 'Filter shows to date (ISO string)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;
  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
