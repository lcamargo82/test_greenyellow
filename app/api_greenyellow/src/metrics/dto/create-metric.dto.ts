import { IsString, IsNumber } from 'class-validator';

export class CreateMetricDto {
  @IsNumber()
  readonly metric_id: string;

  @IsString()
  readonly date_time: string;

  @IsNumber()
  readonly value_metric: number;
}
