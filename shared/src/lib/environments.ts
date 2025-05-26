/**
 * Environment configuration for the application
 */
export const environment = {
  production: process.env.NODE_ENV === 'production',
  apiUrl: process.env.API_URL || 'http://localhost:3333/api',
  apiVersion: 'v1',
};
