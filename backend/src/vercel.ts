import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import express from 'express';

const server = express();

let appReady: Promise<void>;

async function createApp() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PUT,DELETE',
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
}

// Initialize the app once
appReady = createApp();

// Export for Vercel serverless
export default async function handler(req: any, res: any) {
  await appReady;
  server(req, res);
}
