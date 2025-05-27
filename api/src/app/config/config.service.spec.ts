import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { validationSchema } from './validation.schema';

describe('AppConfigService', () => {
  let service: AppConfigService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema,
          isGlobal: true,
          cache: true,
          // Use default values for testing
          ignoreEnvFile: true,
          // Provide test values
          load: [
            () => ({
              NODE_ENV: 'test',
              API_PORT: 3333,
              API_HOST: 'localhost',
              API_PREFIX: 'api',
              FRONTEND_URL: 'http://localhost:4200',
              JWT_SECRET: 'test-secret',
              JWT_EXPIRATION: '1h',
            }),
          ],
        }),
      ],
      providers: [ConfigService, AppConfigService],
    }).compile();

    service = module.get<AppConfigService>(AppConfigService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct environment', () => {
    expect(service.get('NODE_ENV')).toBe('test');
    expect(service.isProduction).toBe(false);
    expect(service.isDevelopment).toBe(false);
    expect(service.isTest).toBe(true);
  });

  it('should return the correct API configuration', () => {
    expect(service.port).toBe(3333);
    expect(service.host).toBe('localhost');
    expect(service.get('API_PREFIX')).toBe('api');
    expect(service.apiUrl).toBe('http://localhost:3333/api');
  });

  it('should return the correct frontend URL', () => {
    expect(service.frontendUrl).toBe('http://localhost:4200');
  });

  it('should return the correct JWT configuration', () => {
    expect(service.jwtSecret).toBe('test-secret');
    expect(service.jwtExpiration).toBe('1h');
  });
});