import { IsOptional, IsString, IsArray, IsInt, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class TourItemDto {
  @IsInt()
  scheduleId: number;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsArray()
  passengerInfo?: Record<string, unknown>[];
}

export class CreateBookingDto {
  @ApiPropertyOptional({ type: [Number], description: 'Array of ticket IDs' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ticketIds?: number[];

  @ApiPropertyOptional({ type: [TourItemDto], description: 'Tour booking items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourItemDto)
  tourItems?: TourItemDto[];

  @ApiPropertyOptional({ description: 'Voucher code' })
  @IsOptional()
  @IsString()
  voucherCode?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
