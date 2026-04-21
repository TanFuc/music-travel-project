import { IsOptional, IsString, IsEmail, IsUrl, IsObject, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Nguyen Van A',
    description: 'Full name',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự.' })
  fullName?: string;
  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  email?: string;
  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  })
  @IsOptional()
  @IsUrl({}, { message: 'URL avatar không hợp lệ.' })
  avatarUrl?: string;
  @ApiPropertyOptional({
    example: { theme: 'dark', lang: 'vi' },
    description: 'User settings',
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
