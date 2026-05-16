import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StaticPagesService } from './static-pages.service';
import { CreateStaticPageDto } from './dto/create-static-page.dto';
import { UpdateStaticPageDto } from './dto/update-static-page.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '@/common/decorators/current-user.decorator';
@ApiTags('static-pages')
@Controller('static-pages')
export class StaticPagesController {
  constructor(private readonly staticPagesService: StaticPagesService) {}
  @Public()
  @Get('active')
  @ApiOperation({ summary: 'Get all active pages for footer' })
  findActive() {
    return this.staticPagesService.findActive();
  }
  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  findBySlug(
    @Param('slug')
    slug: string,
  ) {
    return this.staticPagesService.findBySlug(slug);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Get all pages (Admin only)' })
  findAll() {
    return this.staticPagesService.findAll();
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID (Admin only)' })
  findOne(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.staticPagesService.findById(id);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Create new page (Admin only)' })
  create(
    @Body()
    createDto: CreateStaticPageDto,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.staticPagesService.create(createDto, user.sub);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Update page (Admin only)' })
  update(
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    updateDto: UpdateStaticPageDto,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.staticPagesService.update(id, updateDto, user.sub);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete page (Admin only)' })
  remove(
    @Param('id', ParseIntPipe)
    id: number,
    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.staticPagesService.remove(id, user.sub);
  }
}
