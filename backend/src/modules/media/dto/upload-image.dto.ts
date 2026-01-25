import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({ example: 'shows', description: 'Folder name on Cloudinary' })
  @IsOptional()
  @IsString()
  folder?: string;
}
