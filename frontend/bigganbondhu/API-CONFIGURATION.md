# API Configuration for BigganBondhu Frontend

This document explains how to configure the API endpoints for the BigganBondhu frontend application, especially when running the backend and frontend on different servers.

## Environment Variables

The frontend uses environment variables to configure the API proxy. The primary variable is:

```
VITE_API_URL=http://your-backend-server:8000
```

> **Note**: This URL is not exposed to the browser. It's only used server-side by the Vite development server or in production builds to configure the proxy.

## Configuration Methods

### Development Mode

1. Create a `.env.local` file in the frontend root directory:

   ```
   # .env.local
   VITE_API_URL=http://your-backend-server:8000
   ```

2. The frontend will automatically use this value to configure the API proxy during development.

### Production Deployment

1. When building the application for production, ensure the environment variable is set:

   ```bash
   VITE_API_URL=http://your-backend-server:8000 npm run build
   ```

2. Alternatively, you can set the variable in your hosting environment:
   - For Vercel: Configure it in the Environment Variables section of your project settings
   - For Docker: Pass it during container startup or in your docker-compose.yml file

## Default Behavior

If `VITE_API_URL` is not set:

1. The proxy will default to `http://0.0.0.0:8000` as the backend URL
2. All API requests will be proxied through `/api` path

## API Request Privacy

All API requests are proxied through the Vite development server (in development) or your production server (in production). This means:

1. The actual backend URL is not exposed in browser network requests
2. API requests appear to come from the same origin as your frontend
3. The browser only sees relative URLs like `/api/experiments/physics` rather than the full backend URL

## Centralized API Configuration

All API endpoints are centralized in:

- `/src/config/apiConfig.ts` - Main configuration file
- `/src/services/apiService.ts` - Service utilities for API calls

These files are configured to use relative URLs that go through the proxy, hiding the actual backend URL from the client.
