import * as Joi from 'joi';

/**
 * Validation schema for environment variables
 * This schema is used to validate environment variables at application startup
 */
export const validationSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  // API configuration
  API_PORT: Joi.number().default(3333),
  API_HOST: Joi.string().default('localhost'),
  API_PREFIX: Joi.string().default('api'),
  
  // Frontend configuration
  FRONTEND_URL: Joi.string().default('http://localhost:4200'),
  
  // JWT configuration
  JWT_SECRET: Joi.string().default('your-secret-key'),
  JWT_EXPIRATION: Joi.string().default('1d'),
  
  // Database configuration (for future use)
  DATABASE_URL: Joi.string().optional(),
  
  // Clerk configuration (for authentication)
  CLERK_SECRET_KEY: Joi.string().optional(),
  CLERK_PUBLISHABLE_KEY: Joi.string().optional(),
  CLERK_WEBHOOK_SECRET: Joi.string().optional(),
});