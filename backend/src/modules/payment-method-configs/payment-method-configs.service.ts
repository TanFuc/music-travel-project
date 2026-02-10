import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePaymentMethodConfigDto, UpdatePaymentMethodConfigDto } from './dto/payment-method-config.dto';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentMethodConfigsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreatePaymentMethodConfigDto) {
        const existingConfig = await this.prisma.paymentMethodConfig.findUnique({
            where: { method: createDto.method },
        });

        if (existingConfig) {
            throw new ConflictException(`Cấu hình cho phương thức ${createDto.method} đã tồn tại`);
        }

        return this.prisma.paymentMethodConfig.create({
            data: createDto,
        });
    }

    async findAll() {
        return this.prisma.paymentMethodConfig.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAllActive() {
        return this.prisma.paymentMethodConfig.findMany({
            where: { isActive: true },
        });
    }

    async findOne(id: number) {
        const config = await this.prisma.paymentMethodConfig.findUnique({
            where: { id },
        });

        if (!config) {
            throw new NotFoundException(`Không tìm thấy cấu hình với ID ${id}`);
        }

        return config;
    }

    async findByMethod(method: PaymentMethod) {
        return this.prisma.paymentMethodConfig.findUnique({
            where: { method },
        });
    }

    async update(id: number, updateDto: UpdatePaymentMethodConfigDto) {
        await this.findOne(id); // Check exists

        // If implementing unique check on update (for method change), add here. But typically method shouldn't change.

        return this.prisma.paymentMethodConfig.update({
            where: { id },
            data: updateDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id);
        return this.prisma.paymentMethodConfig.delete({
            where: { id },
        });
    }
}
