import { IsOptional, IsString, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShowStatus } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class ShowFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    example: 'concert',
    description: 'Search keyword',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ShowStatus,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(ShowStatus)
  status?: ShowStatus;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by stage ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stageId?: number;

  @ApiPropertyOptional({
    example: '2024-03-01',
    description: 'Filter shows from this date',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    example: '2024-03-31',
    description: 'Filter shows to this date',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by branch ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  branchId?: number;

  @ApiPropertyOptional({ example: 'da-lat', description: 'Filter by location slug' })
  @IsOptional()
  @IsString()
  location?: string;
}
