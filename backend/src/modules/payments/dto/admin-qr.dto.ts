import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsPositive, Length } from 'class-validator';
import { Transform } from 'class-transformer';
export class GenerateAdminQRDto {
  @ApiProperty({
    description: 'Transfer amount in VND (optional)',
    example: 100000,
    required: false,
    minimum: 1000,
    maximum: 500000000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be positive' })
  @Transform(({ value }) => (value ? Number(value) : undefined))
  amount?: number;
  @ApiProperty({
    description: 'Transfer description (optional)',
    example: 'Payment for order #123',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200, { message: 'Description must be between 1 and 200 characters' })
  @Transform(({ value }) => value?.toString().trim())
  description?: string;
}
export class AdminQRResponse {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;
  @ApiProperty({
    description: 'QR code as base64 image (self-generated)',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrImageBase64: string;
  @ApiProperty({
    description: 'VietQR.io image URL - use this for QR that is accepted by all bank apps',
    example: 'https://img.vietqr.io/image/VPB-10393335845-qr_only.jpg',
    required: false,
  })
  qrImageUrl?: string;
  @ApiProperty({
    description: 'Raw QR content (VietQR/EMVCo format)',
    example:
      '00020101021238540010A00000072701270006970454011501234567890208QRIBFTTA53037045802VN6304...',
  })
  qrContent: string;
  @ApiProperty({
    description: 'Bank information',
    type: 'object',
    properties: {
      bankCode: { type: 'string', example: 'MB' },
      bankName: { type: 'string', example: 'MB Bank' },
      accountNumber: { type: 'string', example: '10393335845' },
      accountName: { type: 'string', example: 'ADMIN COMPANY' },
    },
  })
  bank: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  @ApiProperty({
    description: 'Transfer amount',
    example: 100000,
    required: false,
  })
  amount?: number;
  @ApiProperty({
    description: 'Transfer description',
    example: 'Payment for order #123',
    required: false,
  })
  description?: string;
  @ApiProperty({
    description: 'Bank mobile app deeplink',
    example: 'mbbank://qr-payment?data=...',
    required: false,
  })
  deeplink?: string;
}
