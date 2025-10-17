import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { OrdersModule } from './orders/orders.module';

/**
 * Root application module that imports all feature modules and third-party modules.
 * Configures global settings and connects all parts of the application.
 */
@Module({
  imports: [
    // Loads environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available throughout the app
    }),
    PrismaModule,     // Database ORM module
    RestaurantsModule, // Restaurant management features
    AnalyticsModule,   // Analytics and reporting features
    OrdersModule,      // Order processing features
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}