import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MetricsModule } from './metrics/metrics.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    UsersModule,
    MetricsModule,
    DatabaseModule,
    AuthModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
