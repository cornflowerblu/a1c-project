import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './env.interface';

/**
 * Application configuration service
 * This service provides typed access to environment variables
 */
@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables, true>) {}

  /**
   * Get a configuration value by key
   * @param key - The configuration key
   * @returns The configuration value
   */
  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    return this.configService.get(key, { infer: true });
  }

  /**
   * Check if the application is running in production mode
   * @returns True if the application is running in production mode
   */
  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if the application is running in development mode
   * @returns True if the application is running in development mode
   */
  get isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Check if the application is running in test mode
   * @returns True if the application is running in test mode
   */
  get isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Get the API port
   * @returns The API port
   */
  get port(): number {
    return this.get('API_PORT');
  }

  /**
   * Get the API host
   * @returns The API host
   */
  get host(): string {
    return this.get('API_HOST');
  }

  /**
   * Get the API URL
   * @returns The API URL
   */
  get apiUrl(): string {
    const host = this.host;
    const port = this.port;
    const prefix = this.get('API_PREFIX');
    return `http://${host}:${port}/${prefix}`;
  }

  /**
   * Get the frontend URL
   * @returns The frontend URL
   */
  get frontendUrl(): string {
    return this.get('FRONTEND_URL');
  }

  /**
   * Get the JWT secret
   * @returns The JWT secret
   */
  get jwtSecret(): string {
    return this.get('JWT_SECRET');
  }

  /**
   * Get the JWT expiration time
   * @returns The JWT expiration time
   */
  get jwtExpiration(): string {
    return this.get('JWT_EXPIRATION');
  }

  /**
   * Get the database URL
   * @returns The database URL or undefined
   */
  get databaseUrl(): string | undefined {
    return this.get('DATABASE_URL');
  }
}