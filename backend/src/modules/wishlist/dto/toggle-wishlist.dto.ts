import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WishlistTargetType } from '@prisma/client';

export class ToggleWishlistDto {
  @ApiProperty({ enum: WishlistTargetType })
  @IsEnum(WishlistTargetType)
  @IsNotEmpty()
  targetType: WishlistTargetType;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  targetId: number;
}
