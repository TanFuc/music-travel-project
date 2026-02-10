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

class TicketWithSeatDto {
  @IsInt()
  ticketId: number;

  @IsOptional()
  @IsInt()
  physicalSeatId?: number;
  phyiscalSeatId?: number;
}

export class TicketTierItemDto {
  @IsInt()
  tierId: number;

  @IsInt()
  quantity: number;
}

class SingerPackageItemDto {
  @IsString()
  packageId: string;

  @IsInt()
  quantity: number;
}

export class CreateBookingDto {
  @ApiPropertyOptional({ type: [Number], description: 'Array of ticket IDs (deprecated - use ticketsWithSeats for seat selection)' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  ticketIds?: number[];

  @ApiPropertyOptional({
    type: [TicketWithSeatDto],
    description: 'Array of tickets with physical seat IDs',
    example: [{ ticketId: 1, physicalSeatId: 10 }, { ticketId: 2, physicalSeatId: 11 }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketWithSeatDto)
  @Type(() => TicketWithSeatDto)
  ticketsWithSeats?: TicketWithSeatDto[];

  @ApiPropertyOptional({
    type: 'object',
    isArray: true,
    description: 'Array of ticket tiers to book (Open Ticket flow)',
    example: [{ tierId: 1, quantity: 2 }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketTierItemDto)
  ticketTiers?: TicketTierItemDto[];

  @ApiPropertyOptional({ type: [TourItemDto], description: 'Tour booking items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TourItemDto)
  tourItems?: TourItemDto[];

  @ApiPropertyOptional({ type: [SingerPackageItemDto], description: 'Singer package booking items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingerPackageItemDto)
  singerPackages?: SingerPackageItemDto[];

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
