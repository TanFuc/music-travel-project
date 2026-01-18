import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  IsObject,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MinLength,
  IsHexColor,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for assigning an artist to a show
 * Can reference an existing artist by ID or create a new one inline
 */
export class ArtistAssignmentDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Existing artist ID (null if creating new)',
  })
  @IsOptional()
  @IsInt({ message: 'ID nghệ sĩ phải là số nguyên.' })
  artistId?: number;

  @ApiPropertyOptional({
    example: 'New Artist Name',
    description: 'Name for new artist (required if no artistId)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Artist biography and background...',
    description: 'Bio for new artist',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: true,
    description: 'Is this a headline artist?',
  })
  @IsBoolean({ message: 'isHeadline phải là boolean.' })
  isHeadline: boolean;
}

/**
 * DTO for creating a ticket class with quantity
 */
export class TicketClassCreateDto {
  @ApiProperty({
    example: 'VIP',
    description: 'Ticket class name',
  })
  @IsNotEmpty({ message: 'Tên hạng vé không được để trống.' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 500000,
    description: 'Price in VND',
  })
  @IsNotEmpty({ message: 'Giá vé không được để trống.' })
  @IsNumber({}, { message: 'Giá vé phải là số.' })
  @Min(0, { message: 'Giá vé không được âm.' })
  price: number;

  @ApiPropertyOptional({
    example: '#FFD700',
    description: 'Color code for visualization (hex)',
  })
  @IsOptional()
  @IsString()
  colorCode?: string;

  @ApiProperty({
    example: 100,
    description: 'Total quantity of tickets for this class',
  })
  @IsNotEmpty({ message: 'Số lượng vé không được để trống.' })
  @IsInt({ message: 'Số lượng vé phải là số nguyên.' })
  @Min(1, { message: 'Số lượng vé phải ít nhất là 1.' })
  quantity: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Sort order for display',
  })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

/**
 * Custom properties object for a show
 */
export class ShowPropertiesDto {
  @ApiPropertyOptional({
    example: 'White',
    description: 'Dress code for the event',
  })
  @IsOptional()
  @IsString()
  dresscode?: string;

  @ApiPropertyOptional({
    example: '#ConcertABC2024',
    description: 'Event hashtag',
  })
  @IsOptional()
  @IsString()
  hashtag?: string;

  @ApiPropertyOptional({
    example: '18+',
    description: 'Age restriction',
  })
  @IsOptional()
  @IsString()
  ageRestriction?: string;

  @ApiPropertyOptional({
    example: 'No outside food or drinks',
    description: 'Additional notes or rules',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  // Index signature to allow any additional string properties
  [key: string]: any;
}

/**
 * Full DTO for creating a show with all related entities
 * Includes artists, ticket classes, and generates tickets automatically
 */
export class CreateShowFullDto {
  // ==================== Basic Info ====================

  @ApiProperty({
    example: 'Concert ABC 2024',
    description: 'Show title',
  })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống.' })
  @IsString()
  @MinLength(3, { message: 'Tiêu đề phải có ít nhất 3 ký tự.' })
  title: string;

  @ApiPropertyOptional({
    example: 'An amazing concert featuring top artists...',
    description: 'Show description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 1,
    description: 'Stage ID (must exist)',
  })
  @IsNotEmpty({ message: 'Sân khấu không được để trống.' })
  @IsInt({ message: 'ID sân khấu phải là số nguyên.' })
  stageId: number;

  @ApiProperty({
    example: '2024-03-15T19:00:00Z',
    description: 'Performance time (ISO 8601 format)',
  })
  @IsNotEmpty({ message: 'Thời gian biểu diễn không được để trống.' })
  @IsDateString({}, { message: 'Thời gian biểu diễn không hợp lệ.' })
  performTime: string;

  @ApiPropertyOptional({
    example: '2024-03-15T17:00:00Z',
    description: 'Check-in time (ISO 8601 format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Thời gian check-in không hợp lệ.' })
  checkInTime?: string;

  // ==================== Seat Selection ====================

  @ApiPropertyOptional({
    example: true,
    description:
      'Enable seat selection. When false, operates in General Admission mode.',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'seatSelectionEnabled phải là boolean.' })
  seatSelectionEnabled?: boolean;

  // ==================== Artists ====================

  @ApiPropertyOptional({
    type: [ArtistAssignmentDto],
    description: 'List of artists for this show',
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách nghệ sĩ phải là mảng.' })
  @ValidateNested({ each: true })
  @Type(() => ArtistAssignmentDto)
  artists?: ArtistAssignmentDto[];

  // ==================== Ticket Classes ====================

  @ApiProperty({
    type: [TicketClassCreateDto],
    description: 'Ticket classes with pricing and quantity',
  })
  @IsArray({ message: 'Danh sách hạng vé phải là mảng.' })
  @ValidateNested({ each: true })
  @Type(() => TicketClassCreateDto)
  ticketClasses: TicketClassCreateDto[];

  // ==================== Custom Properties ====================

  @ApiPropertyOptional({
    type: ShowPropertiesDto,
    description: 'Additional custom properties',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ShowPropertiesDto)
  properties?: ShowPropertiesDto;

  // ==================== SEO Fields ====================

  @ApiPropertyOptional({
    example: 'Concert ABC 2024 | Best Music Event',
    description: 'SEO meta title',
  })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Join us for the biggest concert of 2024...',
    description: 'SEO meta description',
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({
    example: 'concert, music, live, entertainment',
    description: 'SEO meta keywords (comma-separated)',
  })
  @IsOptional()
  @IsString()
  metaKeywords?: string;
}
