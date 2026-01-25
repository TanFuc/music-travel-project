import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Chi nhánh Đà Lạt', description: 'Branch name' })
  @IsNotEmpty({ message: 'Tên chi nhánh không được để trống.' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Branch description' })
  @IsOptional()
  @IsString()
  description?: string;
}
