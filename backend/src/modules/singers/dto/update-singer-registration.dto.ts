import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SingerRegistrationStatus } from '@prisma/client';
import { CreateSingerRegistrationDto } from './create-singer-registration.dto';

export class UpdateSingerRegistrationDto extends PartialType(CreateSingerRegistrationDto) {
  @ApiProperty({
    description: 'Registration status (Admin only)',
    enum: SingerRegistrationStatus,
    enumName: 'SingerRegistrationStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(SingerRegistrationStatus)
  status?: SingerRegistrationStatus;

  @ApiProperty({ description: 'Admin notes', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminNotes?: string;
}
