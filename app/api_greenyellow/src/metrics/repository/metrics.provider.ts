import { DataSource } from 'typeorm';
import { Metric } from '../entities/metric.entity';

export const metricProviders = [
  {
    provide: 'METRIC_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Metric),
    inject: ['DATA_SOURCE'],
  },
];
