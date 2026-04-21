import { PartialType } from '@nestjs/swagger';
import { CreateSingerPackageDto } from './create-singer-package.dto';
export class UpdateSingerPackageDto extends PartialType(CreateSingerPackageDto) {}
