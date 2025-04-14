# Sweet Delights Bakery

A dynamic e-commerce application for a pastry shop, featuring product management, event scheduling, and ordering capabilities.

## API Environment Configuration

The application is configured to use different API endpoints based on the environment:

- Development: `http://localhost:8000`
- Production: `https://justreats-api.onrender.com`

### Environment Variables

Next.js loads environment variables in a specific way. For local development, you should create a `.env.local` file in the root of your project:

```
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

When deployed to production, the environment variables should be set in your hosting platform (Vercel, Netlify, etc.).

> ⚠️ **Important**: After changing environment variables, you must restart the development server for changes to take effect. Next.js only loads environment variables when the server starts.

You can also create environment-specific files:
- `.env.development` - Used when running in development mode
- `.env.production` - Used when running in production mode

### Debugging Environment Variables

Visit `/debug` in your browser to see the current environment variables and API base URL.

### API Utilities

The application includes a set of API utility functions in `utils/api.ts` to handle these environment differences:

- `getApiBaseUrl()` - Returns the base URL for API calls based on the current environment
- `getApiUrl(endpoint)` - Returns the full API URL for a specific endpoint
- `fetchApi<T>(endpoint, options)` - A typed fetch wrapper for API calls with error handling

Example usage:

```typescript
import { fetchApi } from '@/utils/api';

// Fetch products
const products = await fetchApi<Product[]>('products');

// Create a new product
const newProduct = await fetchApi<Product>('products', {
  method: 'POST',
  body: JSON.stringify(productData),
});
```

## Getting Started

To run the application in development mode:

```bash
# Create .env.local first with your environment variables
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local

# Start the development server
npm run dev
```

This will start the application on http://localhost:3000 and use the development API endpoint. 