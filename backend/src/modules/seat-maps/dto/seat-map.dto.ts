import { IsString, IsOptional, IsBoolean, IsObject, MaxLength } from 'class-validator';

export class CreateSeatMapTemplateDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  config: SeatMapConfig;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateSeatMapTemplateDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  config?: SeatMapConfig;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class UpdateStageSeatMapDto {
  @IsObject()
  @IsOptional()
  seatMapConfig?: SeatMapConfig;

  @IsOptional()
  seatMapTemplateId?: number;
}

// Seat Map Configuration Interface
export interface SeatMapConfig {
  width: number; // Canvas width
  height: number; // Canvas height
  zones: SeatZone[];
}

export interface SeatZone {
  id: string;
  name: string; // VIP, Standard, Standing
  type: 'SEAT' | 'STANDING';
  color: string;
  rows: SeatRow[];
}

export interface SeatRow {
  id: string;
  rowName: string; // A, B, C...
  seats: Seat[];
}

export interface Seat {
  id: string;
  seatNumber: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status?: 'available' | 'locked' | 'disabled';
}
