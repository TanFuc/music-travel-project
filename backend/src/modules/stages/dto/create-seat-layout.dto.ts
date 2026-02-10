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
  THEATER_STANDARD = 'theater_standard', // Sân khấu tiêu chuẩn - ghế ngồi xếp hàng ngang
  STADIUM = 'stadium', // Sân vận động - vòng cung
  CONCERT_HALL = 'concert_hall', // Phòng hòa nhạc - hình quạt
  STANDING_ONLY = 'standing_only', // Sân khấu đứng
  MIXED = 'mixed', // Hỗn hợp ngồi + đứng
  CUSTOM = 'custom', // Tự tạo
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

  // Offset để định vị zone
  @IsInt()
  @IsOptional()
  offsetX?: number;

  @IsInt()
  @IsOptional()
  offsetY?: number;

  // Góc xoay cho amphitheater/stadium layout
  @IsInt()
  @IsOptional()
  @Min(-180)
  @Max(180)
  rotation?: number;

  // Độ cong cho layout vòng cung
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

  // Khoảng cách giữa các ghế (pixels)
  @IsInt()
  @IsOptional()
  @Min(20)
  @Max(100)
  seatSpacing?: number;

  // Khoảng cách giữa các hàng (pixels)
  @IsInt()
  @IsOptional()
  @Min(20)
  @Max(100)
  rowSpacing?: number;

  // Khoảng cách từ sân khấu tới hàng đầu tiên
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
