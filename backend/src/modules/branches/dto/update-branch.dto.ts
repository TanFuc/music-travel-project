import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class UpdateBranchDto {
  @ApiPropertyOptional({ example: 'Chi nhánh Đà Lạt - Updated', description: 'Branch name' })
  @IsOptional()
  @IsString()
  name?: string;
  @ApiPropertyOptional({ description: 'Branch description' })
  @IsOptional()
  @IsString()
  description?: string;
}
