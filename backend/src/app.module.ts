import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
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
import { PerformanceModule } from './modules/performance/performance.module';
import { BranchesModule } from './modules/branches/branches.module';
import { SearchModule } from './modules/search/search.module';
import { HomeStagesModule } from './modules/home-stages/home-stages.module';
import { TicketTiersModule } from './modules/ticket-tiers/ticket-tiers.module';
import { TicketVerificationModule } from './modules/ticket-verification/ticket-verification.module';
import { ShowActivityModule } from './modules/show-activity/show-activity.module';
import { SingersModule } from './modules/singers/singers.module';
import { SingerPackagesModule } from './modules/singer-packages/singer-packages.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import cloudinaryConfig from './config/cloudinary.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, cloudinaryConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Scheduling (Cron jobs)
    ScheduleModule.forRoot(),

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
    PerformanceModule,
    BranchesModule,
    SearchModule,
    HomeStagesModule,
    TicketTiersModule,
    TicketVerificationModule,
    ShowActivityModule,
    SingersModule,
    SingerPackagesModule,
    WishlistModule,
  ],
})
export class AppModule {}
