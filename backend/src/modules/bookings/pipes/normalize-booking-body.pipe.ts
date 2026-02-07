import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { CreateBookingDto } from '../dto/create-booking.dto';

/**
 * If request body is a raw array of tour items, normalize to { tourItems: body }
 * so it matches CreateBookingDto. This handles clients sending e.g.
 * [{ scheduleId: 1, quantity: 1 }, ...] instead of { tourItems: [...] }.
 */
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
