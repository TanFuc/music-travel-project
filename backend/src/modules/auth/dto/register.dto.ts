import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: '0901234567',
    description: 'Vietnamese phone number',
  })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
  @IsString()
  @Matches(/^0[3-9]\d{8,9}$/, {
    message: 'Số điện thoại không hợp lệ.',
  })
  phoneNumber: string;

  @ApiProperty({
    example: 'Password123',
    description: 'User password (min 8 characters)',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống.' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
  password: string;

  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Full name',
  })
  @IsNotEmpty({ message: 'Họ tên không được để trống.' })
  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự.' })
  fullName: string;
}
