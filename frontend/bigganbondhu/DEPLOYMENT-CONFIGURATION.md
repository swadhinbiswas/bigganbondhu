# Deployment Configuration Guide

## Problem

When deploying the frontend to Vercel (or other platforms), the application shows 404 errors for API calls like:

```
GET https://your-app.vercel.app/api/experiments/chemistry 404 (Not Found)
```

This happens because the backend is not deployed with the frontend, and the API configuration needs to be updated for production.

## Solutions

### Solution 1: Set Environment Variable on Vercel (Recommended)

1. **Go to your Vercel dashboard** for the bigganbondhu project
2. **Navigate to Settings > Environment Variables**
3. **Add a new environment variable:**

   - **Name:** `VITE_API_URL`
   - **Value:** `http://34.87.148.171:8088` (or your actual backend URL)
   - **Environments:** Select "Production" (and "Preview" if you want)

4. **Redeploy your application** after setting the environment variable

### Solution 2: Deploy Backend to a Cloud Service

For a more robust solution, deploy your FastAPI backend to a cloud service:

#### Option A: Railway

1. Connect your GitHub repository to Railway
2. Select the `backend` folder as the source
3. Railway will auto-detect the Python app and deploy it
4. Use the Railway-provided URL as your `VITE_API_URL`

#### Option B: Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Set the build command: `pip install -r requirements.txt`
5. Set the start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

#### Option C: Heroku

1. Create a new Heroku app
2. Set the buildpack to Python
3. Create a `Procfile` in the backend directory: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Deploy the backend folder

### Solution 3: Use Vercel Functions (Advanced)

Move your FastAPI backend to Vercel Functions by:

1. Converting FastAPI endpoints to Vercel Function format
2. Moving them to `api/` directory in your frontend
3. This requires significant code restructuring

## Environment Variables

### Development

Create a `.env.local` file in the frontend directory:

```
VITE_API_URL=http://localhost:8000
```

### Production

Set in your hosting platform (Vercel, Netlify, etc.):

```
VITE_API_URL=https://your-backend-domain.com
```

## Updated Configuration

The frontend has been updated to automatically:

- Use relative URLs (proxy) in development
- Use absolute URLs (direct backend connection) in production
- Fall back to the hardcoded backend URL if no environment variable is set

## Testing the Fix

1. Set the environment variable on Vercel
2. Redeploy your application
3. Check the browser network tab - API calls should now go to the correct backend URL
4. Verify that the console shows successful API responses instead of 404 errors

## CORS Configuration

Make sure your FastAPI backend has proper CORS configuration:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.vercel.app"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### Still getting 404 errors?

1. Check that the backend server is running and accessible
2. Verify the `VITE_API_URL` environment variable is set correctly
3. Check the browser network tab to see where API requests are being sent
4. Ensure the backend API endpoints exist and are working

### CORS errors?

1. Add your frontend domain to the backend's CORS configuration
2. Make sure the backend includes proper CORS headers

### Environment variable not working?

1. Ensure the variable name starts with `VITE_` (required by Vite)
2. Redeploy after setting environment variables
3. Check that the variable is set in the correct environment (production/preview)
