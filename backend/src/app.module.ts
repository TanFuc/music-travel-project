import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { ShowsModule } from './modules/shows/shows.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ToursModule } from './modules/tours/tours.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { BannersModule } from './modules/banners/banners.module';
import { LocationsModule } from './modules/locations/locations.module';
import { StagesModule } from './modules/stages/stages.module';
import { SeatMapsModule } from './modules/seat-maps/seat-maps.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    PrismaModule,

    // Cache (Redis)
    CacheModule,

    // Feature modules
    AuthModule,
    UsersModule,
    WalletModule,
    ShowsModule,
    TicketsModule,
    ToursModule,
    BookingsModule,
    PaymentsModule,
    VouchersModule,
    MediaModule,
    NotificationsModule,
    AdminModule,
    BannersModule,
    LocationsModule,
    StagesModule,
    SeatMapsModule,
  ],
})
export class AppModule {}
