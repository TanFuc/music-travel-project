import { Module } from '@nestjs/common';
import { ContactChannelsService } from './contact-channels.service';
import { ContactChannelsController } from './contact-channels.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ContactChannelsController],
    providers: [ContactChannelsService],
    exports: [ContactChannelsService],
})
export class ContactChannelsModule { }
