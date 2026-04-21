import { PartialType } from '@nestjs/swagger';
import { CreateHomeStageDto } from './create-home-stage.dto';
export class UpdateHomeStageDto extends PartialType(CreateHomeStageDto) {}
