import { Inject, Injectable } from '@nestjs/common';
import * as csv from 'fast-csv';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Metric } from './entities/metric.entity';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { Readable } from 'stream';

@Injectable()
export class MetricsService {
  constructor(
    @Inject('METRIC_REPOSITORY')
    private metricRepository: Repository<Metric>,

    @InjectQueue('metricQueue')
    private metricsQueue: Queue<Metric[]>,
  ) {}

  async create(createMetricDto: CreateMetricDto) {
    const metric = this.metricRepository.create(createMetricDto);

    return this.metricRepository.save(metric);
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.metricRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const metric = await this.metricRepository.findOne({
      where: { id },
    });

    return metric;
  }

  async getAggregatedData(
    metricId: string,
    aggType: string,
    dateInitial: string,
    finalDate: string,
  ) {
    const startDate = moment(dateInitial, 'YYYY-MM-DD').toDate();
    const endDate = moment(finalDate, 'YYYY-MM-DD').toDate();

    console.log({ metricId, startDate, endDate });

    const query = this.metricRepository
      .createQueryBuilder('metric')
      .select('metric.metric_id', 'metricId')
      .addSelect(`DATE_TRUNC('${aggType}', metric.date_time)`, 'date')
      .addSelect('AVG(metric.value)', 'averageValue')
      .where('metric.metric_id = :metricId', { metricId })
      .andWhere('metric.date_time >= :startDate', { startDate })
      .andWhere('metric.date_time <= :endDate', { endDate })
      .groupBy('metric.metric_id')
      .addGroupBy(`DATE_TRUNC('${aggType}', metric.date_time)`)
      .orderBy('date', 'ASC');

    return await query.getRawMany();
  }

  async update(id: number, updateMetricDto: UpdateMetricDto) {
    const metric = await this.metricRepository.preload({
      ...updateMetricDto,
      id,
    });

    return this.metricRepository.save(metric);
  }

  async remove(id: number) {
    const metric = await this.metricRepository.findOne({
      where: { id },
    });

    return this.metricRepository.remove(metric);
  }

  async generateExcelReport(
    metricId: string,
    dateInitial: string,
    finalDate: string,
  ) {
    const data = await this.getAggregatedData(
      metricId,
      'DAY',
      dateInitial,
      finalDate,
    );

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Relatório');

    const fileName = `relatorio_${metricId}_${dateInitial}_${finalDate}.xlsx`;
    xlsx.writeFile(wb, fileName);

    return fileName;
  }

  async importCsv(buffer: Buffer) {
    const batchSize = 100;
    let metricsBatch: Metric[] = [];
    let isFirstRow = true;

    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer);

      stream
        .pipe(csv.parse({ headers: true, delimiter: ';' }))
        .on('data', (row) => {
          if (isFirstRow) {
            isFirstRow = false;
            return;
          }

          const metric = new Metric();
          metric.metric_id = row.metricId;
          metric.date_time = moment(row.dateTime, 'DD/MM/YYYY HH:mm').toDate();
          metric.value = row.value;
          metricsBatch.push(metric);

          if (metricsBatch.length >= batchSize) {
            stream.pause();

            this.metricsQueue
              .add(metricsBatch)
              .then(() => {
                metricsBatch = [];
                stream.resume();
              })
              .catch((error) => {
                console.error('Erro ao adicionar o lote na fila:', error);
                reject(error);
              });
          }
        })
        .on('end', async () => {
          if (metricsBatch.length > 0) {
            try {
              await this.metricsQueue.add(metricsBatch);
            } catch (error) {
              console.error('Erro ao adicionar o último lote na fila:', error);
              reject(error);
            }
          }
          resolve('Importação concluída.');
        })
        .on('error', (error) => {
          console.error('Erro no parsing do CSV:', error);
          reject(error);
        });
    });
  }
}
