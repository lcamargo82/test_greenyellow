import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  create(@Body() createMetricDto: CreateMetricDto) {
    return this.metricsService.create(createMetricDto);
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.metricsService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.metricsService.findOne(id);
  }

  @Get('aggregated')
  async getAggregatedData(
    @Query('metricId') metricId,
    @Query('aggType') aggType,
    @Query('dateInitial') dateInitial,
    @Query('finalDate') finalDate,
  ) {
    return this.metricsService.getAggregatedData(
      metricId,
      aggType,
      dateInitial,
      finalDate,
    );
  }

  @Get('report')
  async generateReport(
    @Query('metricId') metricId: string,
    @Query('dateInitial') dateInitial: string,
    @Query('finalDate') finalDate: string,
  ) {
    const fileName = await this.metricsService.generateExcelReport(
      metricId,
      dateInitial,
      finalDate,
    );
    return { fileName };
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateMetricDto: UpdateMetricDto) {
    return this.metricsService.update(id, updateMetricDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.metricsService.remove(id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async importationDataCsv(@UploadedFile() file: Express.Multer.File) {
    return this.metricsService.importCsv(file.buffer);
  }
}
