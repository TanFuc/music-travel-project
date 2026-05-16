import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateStaticPageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slug: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  content?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  category?: string;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
  @ApiProperty()
  @IsString()
  @IsOptional()
  metaTitle?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  metaDescription?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  metaKeywords?: string;
}
