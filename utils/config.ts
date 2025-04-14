/**
 * Application configuration utilities
 */

/**
 * Check if the application is running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if the application is running in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Get environment variables with type safety
 */
export const getEnv = (key: string, defaultValue: string = ''): string => {
  return (process.env[key] as string) || defaultValue;
};

/**
 * Current environment name for logging
 */
export const environmentName = (): string => {
  return isDevelopment() ? 'development' : 'production';
}; 