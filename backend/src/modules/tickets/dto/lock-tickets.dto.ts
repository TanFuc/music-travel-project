import { IsArray, IsInt, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LockTicketsDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of ticket IDs to lock',
    type: [Number],
  })
  @IsArray({ message: 'Danh sách vé phải là một mảng.' })
  @ArrayMinSize(1, { message: 'Phải chọn ít nhất 1 vé.' })
  @ArrayMaxSize(10, { message: 'Chỉ có thể giữ tối đa 10 vé một lần.' })
  @IsInt({ each: true, message: 'ID vé phải là số nguyên.' })
  ticketIds: number[];
}
