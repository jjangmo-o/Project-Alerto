import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../../backend/dist/app.module.js';
import { HttpExceptionFilter } from '../../backend/dist/common/filters/http-exception.filter.js';

const server = express();
let app;
let bootstrapError = null;

async function bootstrap() {
  if (bootstrapError) {
    throw bootstrapError;
  }
  
  if (!app) {
    try {
      const nestApp = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
      );

      nestApp.enableCors({
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
      });

      nestApp.useGlobalFilters(new HttpExceptionFilter());

      await nestApp.init();
      app = nestApp;
    } catch (error) {
      bootstrapError = error;
      console.error('Bootstrap error:', error);
      throw error;
    }
  }
  return server;
}

export default async function handler(req, res) {
  try {
    await bootstrap();
    server(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
