import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsInt, IsEnum, IsOptional, MinLength, MaxLength, Min, Max, IsUUID, IsBoolean } from 'class-validator';
import { SingingExperience, SingerPackage } from '@prisma/client';

export class CreateSingerRegistrationDto {
  @ApiProperty({ description: 'Full name of the applicant' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @MinLength(10)
  @MaxLength(15)
  phoneNumber: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Age of the applicant', minimum: 16, maximum: 80 })
  @IsInt()
  @Min(16)
  @Max(80)
  age: number;

  @ApiProperty({ description: 'Gender', enum: ['Nam', 'Nữ', 'Khác'] })
  @IsString()
  @IsEnum(['Nam', 'Nữ', 'Khác'])
  gender: string;

  @ApiProperty({ description: 'Address' })
  @IsString()
  @MaxLength(255)
  address: string;

  @ApiProperty({ 
    description: 'Singing experience level', 
    enum: SingingExperience,
    enumName: 'SingingExperience'
  })
  @IsEnum(SingingExperience)
  singingExperience: SingingExperience;

  @ApiProperty({ description: 'Favorite music genre' })
  @IsString()
  @MaxLength(100)
  favoriteGenre: string;

  @ApiProperty({ 
    description: 'Package selection (legacy)', 
    enum: SingerPackage,
    enumName: 'SingerPackage',
    required: false
  })
  @IsOptional()
  @IsEnum(SingerPackage)
  package?: SingerPackage;

  @ApiProperty({ description: 'Package template ID', required: false })
  @IsOptional()
  @IsUUID()
  packageTemplateId?: string;

  @ApiProperty({ description: 'Short self-introduction', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  introduction?: string;

  @ApiProperty({ description: 'Voice sample file URL', required: false })
  @IsOptional()
  @IsString()
  voiceSampleUrl?: string;

  @ApiProperty({ description: 'Agree to terms and conditions', required: false })
  @IsOptional()
  @IsBoolean()
  agreeToTerms?: boolean;
}