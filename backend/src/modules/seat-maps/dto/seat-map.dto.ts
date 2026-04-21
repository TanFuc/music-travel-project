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
export interface SeatMapConfig {
  width: number;
  height: number;
  zones: SeatZone[];
}
export interface SeatZone {
  id: string;
  name: string;
  type: 'SEAT' | 'STANDING';
  color: string;
  rows: SeatRow[];
}
export interface SeatRow {
  id: string;
  rowName: string;
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
