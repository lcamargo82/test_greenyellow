import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { Queue } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  const metricQueue = app.get<Queue>('BullQueue_metricQueue');

  createBullBoard({
    queues: [new BullAdapter(metricQueue)],
    serverAdapter,
  });

  app.use('/queues', serverAdapter.getRouter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
