/**
 * Environment variables interface
 * This interface defines all environment variables used in the application
 */
export interface EnvironmentVariables {
  // Node environment
  NODE_ENV: 'development' | 'production' | 'test';
  
  // API configuration
  API_PORT: number;
  API_HOST: string;
  API_PREFIX: string;
  
  // Frontend configuration
  FRONTEND_URL: string;
  
  // JWT configuration
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  
  // Database configuration (for future use)
  DATABASE_URL?: string;
  
  // Clerk configuration (for authentication)
  CLERK_SECRET_KEY?: string;
  CLERK_PUBLISHABLE_KEY?: string;
  CLERK_WEBHOOK_SECRET?: string;
}