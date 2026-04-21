import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CheckInDto {
  @ApiProperty({
    example: 'MTICKET:eyJ0YyI6IlRLVC0yMDI1LTAwMSIsImJrIjoiQks...',
    description: 'The full QR code string scanned from ticket',
  })
  @IsNotEmpty({ message: 'Mã QR không được để trống.' })
  @IsString({ message: 'Mã QR phải là chuỗi ký tự.' })
  qr: string;
  @ApiPropertyOptional({
    example: 'device-uuid-123',
    description: 'Optional device ID for audit trail',
  })
  @IsOptional()
  @IsString({ message: 'Device ID phải là chuỗi ký tự.' })
  deviceId?: string;
}
