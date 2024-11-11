import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { DatabaseModule } from 'src/database/database.module';
import { metricProviders } from './repository/metrics.provider';
import { BullModule } from '@nestjs/bull';
import { MetricsProcessor } from './processors/metric.processor';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'metricQueue',
    }),
  ],
  controllers: [MetricsController],
  providers: [...metricProviders, MetricsService, MetricsProcessor],
})
export class MetricsModule {}
