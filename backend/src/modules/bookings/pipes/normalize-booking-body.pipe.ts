import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { CreateBookingDto } from '../dto/create-booking.dto';
@Injectable()
export class NormalizeBookingBodyPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata): CreateBookingDto {
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (first && typeof first === 'object' && 'scheduleId' in first && 'quantity' in first) {
        return { tourItems: value as CreateBookingDto['tourItems'] };
      }
    }
    return value as CreateBookingDto;
  }
}
