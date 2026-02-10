import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDate,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PerformanceType {
  SINGING = 'SINGING',
  DANCING = 'DANCING',
  INSTRUMENT = 'INSTRUMENT',
  MAGIC = 'MAGIC',
  COMEDY = 'COMEDY',
  OTHER = 'OTHER',
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  PERFORMED = 'PERFORMED',
}

export class CreatePerformanceQRCodeDto {
  @ApiProperty({ description: 'Stage ID' })
  @IsNumber()
  stageId: number;

  @ApiPropertyOptional({ description: 'Maximum number of registrations allowed' })
  @IsOptional()
  @IsNumber()
  maxRegistrations?: number;

  @ApiPropertyOptional({ description: 'Registration deadline' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationDeadline?: Date;
}

export class ScanQRCodeDto {
  @ApiProperty({ description: 'QR code value' })
  @IsString()
  code: string;
}

export class CreatePerformanceRegistrationDto {
  @ApiProperty({ description: 'QR Code ID' })
  @IsNumber()
  qrCodeId: number;

  @ApiProperty({ description: 'Show ID' })
  @IsNumber()
  showId: number;

  @ApiProperty({ description: 'Stage ID' })
  @IsNumber()
  stageId: number;

  @ApiPropertyOptional({ description: 'Guest name (required if not logged in)' })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiPropertyOptional({ description: 'Guest email' })
  @IsOptional()
  @IsString()
  guestEmail?: string;

  @ApiPropertyOptional({ description: 'Guest phone (required if not logged in)' })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiProperty({ description: 'Type of performance', enum: PerformanceType })
  @IsEnum(PerformanceType)
  performanceType: PerformanceType;

  @ApiProperty({ description: 'Song or performance title' })
  @IsString()
  songTitle: string;

  @ApiPropertyOptional({ description: 'Original artist name (if cover)' })
  @IsOptional()
  @IsString()
  artistName?: string;

  @ApiPropertyOptional({ description: 'Duration in seconds (30-600)' })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(600)
  duration?: number;

  @ApiPropertyOptional({ description: 'Additional description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ReviewRegistrationDto {
  @ApiProperty({ description: 'New status', enum: RegistrationStatus })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;

  @ApiPropertyOptional({ description: 'Review note' })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class UpdateQRCodeDto {
  @ApiPropertyOptional({ description: 'Whether the QR code is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Maximum number of registrations allowed' })
  @IsOptional()
  @IsNumber()
  maxRegistrations?: number;

  @ApiPropertyOptional({ description: 'Registration deadline' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationDeadline?: Date;
}

export class AssignSlotDto {
  @ApiProperty({ description: 'Start time of performance' })
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @ApiProperty({ description: 'End time of performance' })
  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @ApiProperty({ description: 'Order in the performance schedule' })
  @IsNumber()
  slotOrder: number;
}
