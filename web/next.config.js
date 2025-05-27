/* eslint-disable @typescript-eslint/no-var-requires */
const { composePlugins, withNx } = require('@nx/next');

//@ts-check

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  // Environment variables configuration
  env: {
    // Node environment
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Port configuration
    PORT: process.env.NEXT_PORT || '4200',
    
    // API configuration
    API_URL: process.env.API_URL || 'http://localhost:3333/api',
    API_PREFIX: process.env.API_PREFIX || 'api',
    
    // Clerk authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
  }
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
