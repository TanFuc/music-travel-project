import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export enum VerificationMethod {
  QR_SCAN = 'QR_SCAN',
  MANUAL_ENTRY = 'MANUAL_ENTRY',
}
export class VerifyTicketDto {
  @ApiProperty({ description: 'Ticket code (e.g., TK-XXXXX-XXXXX)' })
  @IsString()
  ticketCode: string;
  @ApiProperty({ description: 'Show ID to verify entry for' })
  @IsNumber()
  showId: number;
  @ApiProperty({ description: 'Verification method', enum: VerificationMethod })
  @IsEnum(VerificationMethod)
  verificationMethod: VerificationMethod;
  @ApiPropertyOptional({ description: 'Device info for logging' })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
  @ApiPropertyOptional({ description: 'Whether this is a re-entry' })
  @IsOptional()
  @IsBoolean()
  isReEntry?: boolean;
  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
export class VerifyTicketByQRDto {
  @ApiProperty({ description: 'QR code data (encrypted ticket info)' })
  @IsString()
  qrData: string;
  @ApiProperty({ description: 'Show ID to verify entry for' })
  @IsNumber()
  showId: number;
  @ApiPropertyOptional({ description: 'Device info for logging' })
  @IsOptional()
  @IsString()
  deviceInfo?: string;
}
export class ManualEntryDto {
  @ApiProperty({ description: 'Show ID' })
  @IsNumber()
  showId: number;
  @ApiProperty({ description: 'User ID of the person entering' })
  @IsNumber()
  userId: number;
  @ApiPropertyOptional({ description: 'Ticket ID if available' })
  @IsOptional()
  @IsNumber()
  ticketId?: number;
  @ApiPropertyOptional({ description: 'Reason for manual entry' })
  @IsOptional()
  @IsString()
  reason?: string;
  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
export class GetVerificationsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by show ID' })
  @IsOptional()
  @IsNumber()
  showId?: number;
  @ApiPropertyOptional({ description: 'Filter by ticket ID' })
  @IsOptional()
  @IsNumber()
  ticketId?: number;
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsNumber()
  userId?: number;
  @ApiPropertyOptional({ description: 'Filter by verification method' })
  @IsOptional()
  @IsEnum(VerificationMethod)
  verificationMethod?: VerificationMethod;
  @ApiPropertyOptional({ description: 'Include only successful verifications' })
  @IsOptional()
  @IsBoolean()
  successfulOnly?: boolean;
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;
  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
export class VerificationResultDto {
  success: boolean;
  message: string;
  verification?: {
    id: number;
    ticketId: number;
    showId: number;
    userId: number;
    verifiedAt: Date;
    isReEntry: boolean;
  };
  ticketInfo?: {
    ticketCode: string;
    holderName: string;
    ticketTier?: string;
    ticketClass?: string;
  };
  showInfo?: {
    id: number;
    title: string;
    currentAttendance: number;
    maxCapacity?: number;
  };
  error?: {
    code: string;
    details?: string;
  };
}
export class AttendanceStatsDto {
  showId: number;
  showTitle: string;
  maxCapacity: number | null;
  currentAttendance: number;
  attendancePercentage: number | null;
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  reEntries: number;
  verificationsBreakdown: {
    QR_SCAN: number;
    MANUAL_ENTRY: number;
  };
  recentVerifications: Array<{
    id: number;
    ticketCode: string;
    holderName: string;
    verifiedAt: Date;
    isReEntry: boolean;
  }>;
}
