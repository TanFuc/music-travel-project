import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateContactChannelDto } from './dto/create-contact-channel.dto';
import { UpdateContactChannelDto } from './dto/update-contact-channel.dto';

@Injectable()
export class ContactChannelsService {
    private readonly logger = new Logger(ContactChannelsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateContactChannelDto) {
        this.logger.log('Creating contact channel', { type: createDto.type });

        return this.prisma.contactChannel.create({
            data: {
                type: createDto.type,
                label: createDto.label,
                value: createDto.value,
                icon: createDto.icon,
                colorCode: createDto.colorCode,
                displayOrder: createDto.displayOrder ?? 0,
                isActive: createDto.isActive ?? true,
            },
        });
    }

    async findAll() {
        return this.prisma.contactChannel.findMany({
            orderBy: { displayOrder: 'asc' },
        });
    }

    async findActive() {
        return this.prisma.contactChannel.findMany({
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
        });
    }

    async findOne(id: number) {
        const channel = await this.prisma.contactChannel.findUnique({
            where: { id },
        });

        if (!channel) {
            throw new NotFoundException(`Contact channel with ID ${id} not found`);
        }

        return channel;
    }

    async update(id: number, updateDto: UpdateContactChannelDto) {
        await this.findOne(id); // Check exists

        this.logger.log('Updating contact channel', { id });

        return this.prisma.contactChannel.update({
            where: { id },
            data: updateDto,
        });
    }

    async remove(id: number) {
        await this.findOne(id); // Check exists

        this.logger.log('Deleting contact channel', { id });

        return this.prisma.contactChannel.delete({
            where: { id },
        });
    }
}
