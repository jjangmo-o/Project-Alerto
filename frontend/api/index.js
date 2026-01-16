const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');

// Import the compiled AppModule (path relative to frontend folder)
const { AppModule } = require('../../backend/dist/app.module');
const { HttpExceptionFilter } = require('../../backend/dist/common/filters/http-exception.filter');

const server = express();
let app;

async function bootstrap() {
  if (!app) {
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
  }
  return server;
}

module.exports = async (req, res) => {
  await bootstrap();
  server(req, res);
};
