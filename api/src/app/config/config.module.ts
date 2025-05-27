import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { validationSchema } from './validation.schema';

/**
 * Configuration module
 * This module loads environment variables from .env files and validates them
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      // Load environment variables from .env files
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
      // Validate environment variables against the schema
      validationSchema,
      // Throw an error if validation fails
      validationOptions: {
        abortEarly: true,
      },
      // Make environment variables available globally
      isGlobal: true,
      // Cache environment variables
      cache: true,
      // Expand environment variables
      expandVariables: true,
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}