import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { FastifyRequest } from 'fastify';
@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Get()
  @ApiOperation({ summary: 'Get media by target' })
  async findByTarget(
    @Query('targetType')
    targetType: string,
    @Query('targetId')
    targetId: string,
  ) {
    return this.mediaService.findByTarget(targetType, parseInt(targetId));
  }
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create media (Admin/Staff only)' })
  async create(
    @Body()
    createMediaDto: CreateMediaDto,
  ) {
    return this.mediaService.create(createMediaDto);
  }
  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and optimize image to Cloudflare R2 (Admin/Staff only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', default: 'music-travel' },
      },
      required: ['file'],
    },
  })
  async upload(
    @Req()
    req: FastifyRequest,
  ) {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request must be multipart/form-data');
    }
    const data = await req.file();
    if (!data) {
      throw new BadRequestException('No file uploaded');
    }
    const buffer = await data.toBuffer();
    const folder = (data.fields?.folder as any)?.value || 'music-travel';
    const mockFile: any = {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
    };
    return this.mediaService.uploadImage(mockFile, folder);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete media (Admin only)' })
  async delete(
    @Param('id')
    id: string,
  ) {
    return this.mediaService.delete(parseInt(id));
  }
}
