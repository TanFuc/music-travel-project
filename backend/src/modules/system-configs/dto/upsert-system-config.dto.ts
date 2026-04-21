import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class UpsertSystemConfigDto {
  @ApiProperty({ example: 'HERO_BANNER_TEXT', description: 'Unique core key' })
  @IsNotEmpty()
  @IsString()
  key: string;
  @ApiProperty({ example: { vi: 'Xin chao', en: 'Hello' }, description: 'JSON value content' })
  @IsNotEmpty()
  value: any;
  @ApiPropertyOptional({
    example: 'JSON',
    description: 'Type of data: TEXT, JSON, ARRAY, IMAGE, HTML',
  })
  @IsOptional()
  @IsString()
  type?: string;
  @ApiPropertyOptional({ description: 'Description of the config key' })
  @IsOptional()
  @IsString()
  description?: string;
}
