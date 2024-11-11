import { Repository } from 'typeorm';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Metric } from '../entities/metric.entity';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
@Processor('metricQueue')
export class MetricsProcessor {
  constructor(
    @Inject('METRIC_REPOSITORY')
    private metricRepository: Repository<Metric>,
  ) {}

  @Process()
  async handleMetricBatch(job: Job<Metric[]>) {
    const metricsBatch = job.data;
    const queryRunner =
      this.metricRepository.manager.connection.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(Metric, metricsBatch);

      await queryRunner.commitTransaction();
      console.log('Lote de métricas inserido com sucesso');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Erro ao inserir o lote de métricas:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
