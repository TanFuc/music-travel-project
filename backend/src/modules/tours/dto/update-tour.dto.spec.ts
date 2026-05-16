import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { UpdateTourDto } from './update-tour.dto';
describe('UpdateTourDto validation', () => {
  const pipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  });
  it('accepts combo update fields minPrice and linkedShowId', async () => {
    const payload = {
      title: 'Combo Da Lat cap nhat',
      minPrice: 3290000,
      linkedShowId: 46,
    };
    const result = (await pipe.transform(payload, {
      type: 'body',
      metatype: UpdateTourDto,
    })) as UpdateTourDto;
    expect(result.title).toBe(payload.title);
    expect(result.minPrice).toBe(payload.minPrice);
    expect(result.linkedShowId).toBe(payload.linkedShowId);
  });
  it('accepts linkedShowId = null for unlink combo-show relation', async () => {
    const payload = {
      linkedShowId: null,
    };
    const result = (await pipe.transform(payload, {
      type: 'body',
      metatype: UpdateTourDto,
    })) as UpdateTourDto;
    expect(result.linkedShowId).toBeNull();
  });
  it('rejects unknown fields when whitelist + forbidNonWhitelisted are enabled', async () => {
    const payload = {
      title: 'Combo test',
      unknownField: 'not-allowed',
    };
    await expect(
      pipe.transform(payload, {
        type: 'body',
        metatype: UpdateTourDto,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
