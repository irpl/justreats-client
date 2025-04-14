// API utilities
import { environmentName, getEnv } from './config';

// Track if we've logged the API URL
let hasLoggedApiUrl = false;

/**
 * Get the base URL for API calls based on environment
 */
export const getApiBaseUrl = (): string => {
  // First check the direct environment variable
  const envBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  // Default fallback URL
  const fallbackUrl = 'https://justreats-api.onrender.com';
  
  // Get the base URL
  const baseUrl = envBaseUrl || fallbackUrl;
  
  // Log the first time this is called
  if (!hasLoggedApiUrl) {
    console.log(`[API] Environment: ${process.env.NODE_ENV}`);
    console.log(`[API] Raw NEXT_PUBLIC_API_BASE_URL: ${JSON.stringify(envBaseUrl)}`);
    console.log(`[API] Using API base URL: ${baseUrl}`);
    
    if (!envBaseUrl) {
      console.warn('[API] Warning: NEXT_PUBLIC_API_BASE_URL is not set, using fallback URL');
    }
    
    hasLoggedApiUrl = true;
  }
  
  return baseUrl;
};

/**
 * Get full API URL for a specific endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove any leading slash from endpoint to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${baseUrl}/api/${cleanEndpoint}`;
};

/**
 * Basic fetch wrapper with error handling
 */
export const fetchApi = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}; 