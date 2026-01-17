const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');

const server = express();
let app;
let bootstrapError = null;

async function bootstrap() {
  if (bootstrapError) {
    throw bootstrapError;
  }
  
  if (!app) {
    try {
      // Import the compiled AppModule (path relative to frontend folder)
      const { AppModule } = require('../../backend/dist/app.module');
      const { HttpExceptionFilter } = require('../../backend/dist/common/filters/http-exception.filter');
      
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

module.exports = async (req, res) => {
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
};
