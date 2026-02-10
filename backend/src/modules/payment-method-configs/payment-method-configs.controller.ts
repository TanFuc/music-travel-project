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
import { PaymentMethodConfigsService } from './payment-method-configs.service';
import { CreatePaymentMethodConfigDto, UpdatePaymentMethodConfigDto } from './dto/payment-method-config.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('payment-method-configs')
@Controller('payment-method-configs')
export class PaymentMethodConfigsController {
    constructor(private readonly paymentMethodConfigsService: PaymentMethodConfigsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create payment method config (Admin only)' })
    create(@Body() createDto: CreatePaymentMethodConfigDto) {
        return this.paymentMethodConfigsService.create(createDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all payment method configs (Admin only)' })
    findAll() {
        return this.paymentMethodConfigsService.findAll();
    }

    @Get('active')
    @Public()
    @ApiOperation({ summary: 'Get active payment method configs (Public)' })
    findAllActive() {
        return this.paymentMethodConfigsService.findAllActive();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get config by ID (Admin only)' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.paymentMethodConfigsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update config (Admin only)' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdatePaymentMethodConfigDto,
    ) {
        return this.paymentMethodConfigsService.update(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete config (Admin only)' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.paymentMethodConfigsService.remove(id);
    }
}
