/**
 * Environment configuration for the application
 * This file provides environment configuration for both frontend and backend
 */
export const environment = {
  // Production flag
  production: process.env["NODE_ENV"] === 'production',
  
  // API URL
  apiUrl: process.env["API_URL"] || 'http://localhost:3333/api',
  
  // API version
  apiVersion: 'v1',
  
  // Frontend URL
  frontendUrl: process.env["FRONTEND_URL"] || 'http://localhost:4200',
};

/**
 * Get the current environment
 * @returns The current environment name
 */
export function getEnvironment(): string {
  return process.env["NODE_ENV"] || 'development';
}

/**
 * Check if the application is running in production mode
 * @returns True if the application is running in production mode
 */
export function isProduction(): boolean {
  return environment.production;
}

/**
 * Check if the application is running in development mode
 * @returns True if the application is running in development mode
 */
export function isDevelopment(): boolean {
  return !environment.production;
}
