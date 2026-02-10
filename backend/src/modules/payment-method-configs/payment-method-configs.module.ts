import { Module } from '@nestjs/common';
import { PaymentMethodConfigsService } from './payment-method-configs.service';
import { PaymentMethodConfigsController } from './payment-method-configs.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PaymentMethodConfigsController],
    providers: [PaymentMethodConfigsService],
    exports: [PaymentMethodConfigsService],
})
export class PaymentMethodConfigsModule { }
