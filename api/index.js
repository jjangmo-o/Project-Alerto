const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { AppModule } = require('../backend/dist/app.module.js');
const { HttpExceptionFilter } = require('../backend/dist/common/filters/http-exception.filter.js');

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
  
  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const express = require('express');

  const server = express();
  let app = null;
  let bootstrapPromise = null;

  console.log('Environment check:', {
    hasMapboxToken: !!process.env.MAPBOX_TOKEN,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  });

  async function bootstrap() {
    if (app) {
      return server;
    }
    if (bootstrapPromise) {
      return bootstrapPromise;
    }
    bootstrapPromise = (async () => {
      try {
        console.log('Starting NestJS bootstrap...');
        const { AppModule } = require('../backend/dist/app.module.js');
        const { HttpExceptionFilter } = require('../backend/dist/common/filters/http-exception.filter.js');
        const nestApp = await NestFactory.create(
          AppModule,
          new ExpressAdapter(server),
          {
            logger: ['error', 'warn', 'log'],
          }
        );
        nestApp.enableCors({
          origin: true,
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
          credentials: true,
          allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        });
        nestApp.setGlobalPrefix('api');
        nestApp.useGlobalFilters(new HttpExceptionFilter());
        await nestApp.init();
        app = nestApp;
        console.log('NestJS bootstrap complete');
        return server;
      } catch (error) {
        console.error('Bootstrap error:', error);
        bootstrapPromise = null;
        throw error;
      }
    })();
    return bootstrapPromise;
  }

  module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      res.setHeader('Access-Control-Max-Age', '86400');
      return res.status(204).end();
    }
    try {
      await bootstrap();
      return server(req, res);
    } catch (error) {
      console.error('Handler error:', error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        statusCode: 500,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'An error occurred while processing your request',
        timestamp: new Date().toISOString(),
      });
    }
  };
