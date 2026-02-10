import { IsString, IsNumber, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ShowActivityType {
  REGISTRATION = 'REGISTRATION',
  CANCELLATION = 'CANCELLATION',
  STATUS_CHANGE = 'STATUS_CHANGE',
  TICKET_VERIFICATION = 'TICKET_VERIFICATION',
  ADMIN_ACTION = 'ADMIN_ACTION',
  QUEUE_REORDER = 'QUEUE_REORDER',
  CHECK_IN = 'CHECK_IN',
}

export class CreateActivityLogDto {
  @ApiProperty({ description: 'Show ID' })
  @IsNumber()
  showId: number;

  @ApiProperty({ description: 'Activity type', enum: ShowActivityType })
  @IsEnum(ShowActivityType)
  activityType: ShowActivityType;

  @ApiPropertyOptional({ description: 'User or admin who performed action' })
  @IsOptional()
  @IsNumber()
  actorId?: number;

  @ApiPropertyOptional({ description: 'Target registration, ticket, or user ID' })
  @IsOptional()
  @IsNumber()
  targetId?: number;

  @ApiPropertyOptional({ description: 'Target type (REGISTRATION, TICKET, USER)' })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiProperty({ description: 'Activity description' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'IP address of the actor' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class GetActivityLogsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by activity type' })
  @IsOptional()
  @IsEnum(ShowActivityType)
  activityType?: ShowActivityType;

  @ApiPropertyOptional({ description: 'Filter by actor ID' })
  @IsOptional()
  @IsNumber()
  actorId?: number;

  @ApiPropertyOptional({ description: 'Filter by target type' })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiPropertyOptional({ description: 'Search term for description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Start date filter' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class ShowAnalyticsDto {
  showId: number;
  showTitle: string;
  performTime: Date;

  // Registration stats
  totalRegistrations: number;
  pendingRegistrations: number;
  approvedRegistrations: number;
  performedRegistrations: number;
  cancelledRegistrations: number;
  noShowRate: number;

  // Attendance stats
  maxCapacity: number | null;
  currentAttendance: number;
  attendancePercentage: number | null;

  // Verification stats
  totalVerifications: number;
  qrScanVerifications: number;
  manualEntryVerifications: number;

  // Activity stats
  totalActivities: number;
  activityBreakdown: Record<string, number>;

  // Time-based stats
  registrationsOverTime: Array<{ date: string; count: number }>;
  verificationsOverTime: Array<{ time: string; count: number }>;

  // Performance stats
  averagePerformanceDuration: number | null;
  mostPopularPerformanceTypes: Array<{ type: string; count: number }>;
}
