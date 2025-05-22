# API Configuration for BigganBondhu Frontend

This document explains how to configure the API endpoints for the BigganBondhu frontend application, especially when running the backend and frontend on different servers.

## Environment Variables

The frontend uses environment variables to determine the API URL. The primary variable is:

```
VITE_API_URL=http://your-backend-server:8000
```

## Configuration Methods

### Development Mode

1. Create a `.env.local` file in the frontend root directory:

   ```
   # .env.local
   VITE_API_URL=http://your-backend-server:8000
   ```

2. The frontend will automatically load this environment variable during development.

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

1. For relative API paths, the frontend will use the same origin (same server hosting the frontend)
2. For development on localhost, it will default to `http://localhost:8000` as the backend URL

## Centralized API Configuration

All API endpoints are centralized in:

- `/src/config/apiConfig.ts` - Main configuration file
- `/src/services/apiService.ts` - Service utilities for API calls

This ensures that if the API structure changes, updates only need to be made in these central files.

## Checking API Configuration

To verify the current API configuration, open the browser console and run:

```javascript
import.meta.env.VITE_API_URL;
```

This will show the current API URL being used by the application.
