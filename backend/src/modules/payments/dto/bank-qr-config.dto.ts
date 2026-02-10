import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, Length, Matches, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBankQRConfigDto {
  @ApiProperty({
    description: 'Bank BIN (6-digit bank identification number)',
    example: '970422',
    minLength: 6,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 10)
  @Matches(/^[0-9]+$/, { message: 'Bank BIN must contain only numbers' })
  bankBin: string;

  @ApiProperty({
    description: 'Bank account number',
    example: '8820231001',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  @Matches(/^[0-9]+$/, { message: 'Account number must contain only numbers' })
  accountNumber: string;

  @ApiProperty({
    description: 'Account holder name (will be normalized for QR compatibility)',
    example: 'LE DUC TUAN',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  accountName: string;

  @ApiPropertyOptional({
    description: 'Whether this configuration is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateBankQRConfigDto {
  @ApiPropertyOptional({
    description: 'Bank BIN (6-digit bank identification number)',
    example: '970422',
    minLength: 6,
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(6, 10)
  @Matches(/^[0-9]+$/, { message: 'Bank BIN must contain only numbers' })
  bankBin?: string;

  @ApiPropertyOptional({
    description: 'Bank account number',
    example: '8820231001',
    minLength: 6,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(6, 20)
  @Matches(/^[0-9]+$/, { message: 'Account number must contain only numbers' })
  accountNumber?: string;

  @ApiPropertyOptional({
    description: 'Account holder name (will be normalized for QR compatibility)',
    example: 'LE DUC TUAN',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  accountName?: string;

  @ApiPropertyOptional({
    description: 'Whether this configuration is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class BankQRConfigResponse {
  @ApiProperty({
    description: 'Configuration ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Bank BIN (6-digit bank identification number)',
    example: '970422',
  })
  bankBin: string;

  @ApiProperty({
    description: 'Bank account number',
    example: '8820231001',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'LE DUC TUAN',
  })
  accountName: string;

  @ApiProperty({
    description: 'Whether this configuration is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-02-07T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-02-07T10:00:00.000Z',
  })
  updatedAt: Date;
}

export class BankQRConfigListResponse {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'List of bank QR configurations',
    type: [BankQRConfigResponse],
  })
  data: BankQRConfigResponse[];

  @ApiProperty({
    description: 'Response message',
    example: 'Bank QR configurations retrieved successfully',
  })
  message: string;
}

export class BankQRConfigSingleResponse {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Bank QR configuration data',
    type: BankQRConfigResponse,
  })
  data: BankQRConfigResponse;

  @ApiProperty({
    description: 'Response message',
    example: 'Bank QR configuration created successfully',
  })
  message: string;
}
