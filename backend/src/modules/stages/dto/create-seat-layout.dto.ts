import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
export enum SeatLayoutTemplate {
  THEATER_STANDARD = 'theater_standard',
  STADIUM = 'stadium',
  CONCERT_HALL = 'concert_hall',
  STANDING_ONLY = 'standing_only',
  MIXED = 'mixed',
  CUSTOM = 'custom',
}
export class ZoneConfigDto {
  @IsString()
  name: string;
  @IsInt()
  @Min(0)
  rows: number;
  @IsInt()
  @Min(0)
  seatsPerRow: number;
  @IsString()
  @IsOptional()
  colorCode?: string;
  @IsEnum(['SEAT', 'STANDING'])
  @IsOptional()
  type?: 'SEAT' | 'STANDING';
  @IsInt()
  @IsOptional()
  offsetX?: number;
  @IsInt()
  @IsOptional()
  offsetY?: number;
  @IsInt()
  @IsOptional()
  @Min(-180)
  @Max(180)
  rotation?: number;
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  curvature?: number;
}
export class CreateSeatLayoutDto {
  @IsInt()
  stageId: number;
  @IsEnum(SeatLayoutTemplate)
  template: SeatLayoutTemplate;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZoneConfigDto)
  zones: ZoneConfigDto[];
  @IsInt()
  @IsOptional()
  @Min(20)
  @Max(100)
  seatSpacing?: number;
  @IsInt()
  @IsOptional()
  @Min(20)
  @Max(100)
  rowSpacing?: number;
  @IsInt()
  @IsOptional()
  @Min(50)
  @Max(300)
  stageDistance?: number;
}
export class SingleSeatDto {
  @IsString()
  @IsOptional()
  zoneName?: string;
  @IsString()
  @IsOptional()
  rowName?: string;
  @IsString()
  @IsOptional()
  seatNumber?: string;
  @IsEnum(['SEAT', 'STANDING'])
  type: 'SEAT' | 'STANDING';
  @IsInt()
  xPosition: number;
  @IsInt()
  yPosition: number;
}
export class CreateCustomSeatsDto {
  @IsInt()
  stageId: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleSeatDto)
  seats: SingleSeatDto[];
}
export class UpdateSeatPositionDto {
  @IsInt()
  seatId: number;
  @IsInt()
  xPosition: number;
  @IsInt()
  yPosition: number;
}
export class BulkUpdateSeatsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSeatPositionDto)
  seats: UpdateSeatPositionDto[];
}
