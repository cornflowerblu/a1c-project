/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AppConfigService } from './app/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Get configuration service
  const configService = app.get(AppConfigService);
  
  // Set global prefix from configuration
  const globalPrefix = configService.get('API_PREFIX');
  app.setGlobalPrefix(globalPrefix);
  
  // Enable CORS for the frontend
  app.enableCors({
    origin: configService.frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Get port from configuration
  const port = configService.port;
  await app.listen(port);
  
  Logger.log(
    `🚀 Application is running on: http://${configService.host}:${port}/${globalPrefix}`
  );
  
  // Log environment information
  Logger.log(`Environment: ${configService.get('NODE_ENV')}`);
  Logger.log(`Frontend URL: ${configService.frontendUrl}`);
}

bootstrap();
