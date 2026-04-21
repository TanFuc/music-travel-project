import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SeatLayoutService } from './seat-layout.service';
import {
  CreateSeatLayoutDto,
  CreateCustomSeatsDto,
  BulkUpdateSeatsDto,
} from './dto/create-seat-layout.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
@Controller('seat-layouts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeatLayoutController {
  constructor(private readonly seatLayoutService: SeatLayoutService) {}
  @Get('templates')
  @Roles('ADMIN', 'STAFF')
  getTemplates() {
    return this.seatLayoutService.getTemplates();
  }
  @Get('stage/:stageId')
  @Roles('ADMIN', 'STAFF')
  getStageSeatLayout(
    @Param('stageId', ParseIntPipe)
    stageId: number,
  ) {
    return this.seatLayoutService.getStageSeatLayout(stageId);
  }
  @Post('generate')
  @Roles('ADMIN', 'STAFF')
  generateFromTemplate(
    @Body()
    dto: CreateSeatLayoutDto,
  ) {
    return this.seatLayoutService.generateFromTemplate(dto);
  }
  @Post('custom')
  @Roles('ADMIN', 'STAFF')
  createCustomSeats(
    @Body()
    dto: CreateCustomSeatsDto,
  ) {
    return this.seatLayoutService.createCustomSeats(dto);
  }
  @Put('positions')
  @Roles('ADMIN', 'STAFF')
  updateSeatPositions(
    @Body()
    dto: BulkUpdateSeatsDto,
  ) {
    return this.seatLayoutService.updateSeatPositions(dto);
  }
  @Delete('stage/:stageId')
  @Roles('ADMIN', 'STAFF')
  clearStageSeats(
    @Param('stageId', ParseIntPipe)
    stageId: number,
  ) {
    return this.seatLayoutService.clearStageSeats(stageId);
  }
}
