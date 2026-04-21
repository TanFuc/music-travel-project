import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ContactChannelsService } from './contact-channels.service';
import { CreateContactChannelDto } from './dto/create-contact-channel.dto';
import { UpdateContactChannelDto } from './dto/update-contact-channel.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('contact-channels')
@Controller('contact-channels')
export class ContactChannelsController {
  constructor(private readonly contactChannelsService: ContactChannelsService) {}
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create contact channel (Admin only)' })
  create(
    @Body()
    createDto: CreateContactChannelDto,
  ) {
    return this.contactChannelsService.create(createDto);
  }
  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all contact channels' })
  findAll() {
    return this.contactChannelsService.findAll();
  }
  @Get('active')
  @Public()
  @ApiOperation({ summary: 'Get active contact channels' })
  findActive() {
    return this.contactChannelsService.findActive();
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get contact channel by ID (Admin only)' })
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.contactChannelsService.findOne(id);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact channel (Admin only)' })
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateDto: UpdateContactChannelDto,
  ) {
    return this.contactChannelsService.update(id, updateDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete contact channel (Admin only)' })
  remove(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.contactChannelsService.remove(id);
  }
}
