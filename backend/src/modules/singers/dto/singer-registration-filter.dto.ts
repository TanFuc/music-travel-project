import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { SingerRegistrationStatus, SingerPackage, SingingExperience } from '@prisma/client';

export class SingerRegistrationFilterDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filter by status',
    enum: SingerRegistrationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(SingerRegistrationStatus)
  status?: SingerRegistrationStatus;

  @ApiProperty({
    description: 'Filter by package (legacy)',
    enum: SingerPackage,
    required: false,
  })
  @IsOptional()
  @IsEnum(SingerPackage)
  package?: SingerPackage;

  @ApiProperty({
    description: 'Filter by package template ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  packageTemplateId?: string;

  @ApiProperty({
    description: 'Filter by singing experience',
    enum: SingingExperience,
    required: false,
  })
  @IsOptional()
  @IsEnum(SingingExperience)
  singingExperience?: SingingExperience;

  @ApiProperty({ description: 'Search by name, phone, or email', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
