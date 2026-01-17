const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('../../backend/dist/app.module.js');
const { HttpExceptionFilter } = require('../../backend/dist/common/filters/http-exception.filter.js');

const server = express();
let app;
let bootstrapError = null;

// Log environment variables availability (not values) for debugging
console.log('Environment check:', {
  hasMapboxToken: !!process.env.MAPBOX_TOKEN,
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
});

async function bootstrap() {
  if (bootstrapError) {
    throw bootstrapError;
  }
  
  if (!app) {
    try {
      console.log('Starting NestJS bootstrap...');
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
      console.log('NestJS bootstrap complete');
    } catch (error) {
      bootstrapError = error;
      console.error('Bootstrap error:', error);
      throw error;
    }
  }
  return server;
}

module.exports = async function handler(req, res) {
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
