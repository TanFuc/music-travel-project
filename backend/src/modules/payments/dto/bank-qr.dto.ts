import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsPositive,
  Length,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
export enum VietnamBankCode {
  MB = 'MB',
  VCB = 'VCB',
  TCB = 'TCB',
  BIDV = 'BIDV',
  VTB = 'VTB',
  ACB = 'ACB',
  VPB = 'VPB',
  SHB = 'SHB',
  TPB = 'TPB',
  VIB = 'VIB',
  MSB = 'MSB',
  SACOM = 'SACOM',
  EIB = 'EIB',
  OCB = 'OCB',
  NAB = 'NAB',
  VAB = 'VAB',
  PGB = 'PGB',
  AGRI = 'AGRI',
  SCB = 'SCB',
  BAC_A_BANK = 'BAC_A_BANK',
  PVCOM = 'PVCOM',
}
export class GenerateBankQRDto {
  @ApiProperty({
    description: 'Vietnam bank code',
    enum: VietnamBankCode,
    example: 'MB',
  })
  @IsEnum(VietnamBankCode, { message: 'Invalid bank code' })
  bankCode: VietnamBankCode;
  @ApiProperty({
    description: 'Bank account number',
    example: '0123456789',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @Length(6, 20, { message: 'Account number must be between 6 and 20 characters' })
  @Matches(/^[0-9]+$/, { message: 'Account number must contain only digits' })
  accountNumber: string;
  @ApiProperty({
    description: 'Account holder name',
    example: 'NGUYEN VAN A',
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100, { message: 'Account name must be between 1 and 100 characters' })
  @Transform(({ value }) => value?.toString().toUpperCase().trim())
  accountName: string;
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
    example: 'Thanh toan don hang #12345',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200, { message: 'Description must be between 1 and 200 characters' })
  @Transform(({ value }) => value?.toString().trim())
  description?: string;
}
export class BankQRResponse {
  @ApiProperty({
    description: 'QR code as base64 image',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  })
  qrBase64: string;
  @ApiProperty({
    description: 'Raw QR content (VietQR/EMVCo format)',
    example:
      '00020101021238540010A00000072701270006970454011501234567890208QRIBFTTA53037045802VN6304...',
  })
  qrContent: string;
  @ApiProperty({
    description: 'Bank mobile app deeplink',
    example: 'mbbank://qr-payment?data=...',
    required: false,
  })
  deeplink?: string;
  @ApiProperty({
    description: 'Bank code',
    example: 'MB',
  })
  bankCode: string;
  @ApiProperty({
    description: 'Account number',
    example: '0123456789',
  })
  accountNumber: string;
  @ApiProperty({
    description: 'Account holder name',
    example: 'NGUYEN VAN A',
  })
  accountName: string;
  @ApiProperty({
    description: 'Transfer amount',
    example: 100000,
    required: false,
  })
  amount?: number;
  @ApiProperty({
    description: 'Transfer description',
    example: 'Thanh toan don hang #12345',
    required: false,
  })
  description?: string;
  @ApiProperty({
    description: 'Bank display name',
    example: 'MB Bank (Military Commercial Joint Stock Bank)',
  })
  bankName: string;
  @ApiProperty({
    description: 'Whether deeplink is supported',
    example: true,
  })
  deeplinkSupported: boolean;
}
