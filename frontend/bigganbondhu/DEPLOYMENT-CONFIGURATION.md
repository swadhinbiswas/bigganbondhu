# Deployment Configuration Guide

## Problem

When deploying the frontend to Vercel (or other platforms), you may encounter these issues:

### Issue 1: 404 Errors

```
GET https://your-app.vercel.app/api/experiments/chemistry 404 (Not Found)
```

### Issue 2: Mixed Content Errors

```
Mixed Content: The page at 'https://your-app.vercel.app/' was loaded over HTTPS,
but requested an insecure XMLHttpRequest endpoint 'http://backend-url:8088/api/...'.
This request has been blocked; the content must be served over HTTPS.
```

Both happen because the backend is not deployed with the frontend.

## How the Fix Works

The solution uses **Vercel Rewrites** (configured in `vercel.json`):

1. **Frontend makes relative API calls** to `/api/experiments/physics`
2. **Vercel rewrites these requests** to your HTTP backend `http://34.87.148.171:8088/api/experiments/physics`
3. **Browser sees HTTPS requests** to the same domain, avoiding mixed content issues
4. **Your backend receives the requests** and responds normally

This approach:

- ✅ Avoids mixed content issues (HTTPS frontend can call HTTP backend)
- ✅ Works without environment variables
- ✅ Keeps your backend URL hidden from the browser
- ✅ Works in both development and production

## Vercel Configuration

Your `vercel.json` is already configured correctly:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "http://34.87.148.171:8088/api/$1"
    }
  ]
}
```

## Alternative Solutions

If you want more control or better performance:

### Option 1: Deploy Backend with HTTPS

Deploy your FastAPI backend to a service that provides HTTPS:

#### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Select the `backend` folder as the source
3. Railway will auto-detect the Python app and deploy it
4. Use the Railway HTTPS URL in your `vercel.json`

#### Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Set the build command: `pip install -r requirements.txt`
5. Set the start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Heroku

1. Create a new Heroku app
2. Set the buildpack to Python
3. Add a `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option 2: Add SSL to Your Current Backend

If you want to keep using your current server (`34.87.148.171:8088`):

1. **Install SSL certificate** (Let's Encrypt is free)
2. **Configure your server** to serve HTTPS on port 443
3. **Update vercel.json** to use `https://34.87.148.171/api/$1`

### Option 3: Use Vercel Functions

Convert your FastAPI backend to Vercel Functions:

1. Move backend logic to `api/` directory in frontend
2. Convert FastAPI endpoints to Vercel Function format
3. This requires significant code restructuring

## Testing the Current Fix

1. **Deploy your updated frontend** to Vercel
2. **Check browser network tab** - you should see:
   - Requests to: `https://your-app.vercel.app/api/experiments/physics`
   - Status: `200 OK` (not 404 or mixed content errors)
3. **No environment variables needed** - the rewrite handles everything

## CORS Configuration

Your FastAPI backend already has proper CORS configuration:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### Still getting mixed content errors?

1. **Clear browser cache** and hard refresh
2. **Check that vercel.json is deployed** - redeploy if needed
3. **Verify the rewrite is working** in Vercel dashboard

### Still getting 404 errors?

1. **Check that your backend is running** at `http://34.87.148.171:8088`
2. **Test backend directly**: Visit `http://34.87.148.171:8088/api/health`
3. **Check Vercel function logs** for any rewrite errors

### Backend not responding?

1. **Check backend server status**
2. **Verify firewall settings** allow incoming connections
3. **Check backend logs** for any errors

## Environment Variables (Optional)

You can still use environment variables for different backends:

### Development

Create a `.env.local` file:

```
VITE_API_URL=http://localhost:8000
```

### Production with Different Backend

Set in Vercel dashboard:

```
VITE_API_URL=https://your-new-backend.railway.app
```

Then update `vercel.json` to use the environment variable:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "${VITE_API_URL}/api/$1"
    }
  ]
}
```

## Summary

The current fix uses Vercel rewrites to proxy all `/api/*` requests to your HTTP backend, which:

- Solves mixed content issues
- Works without additional configuration
- Keeps your setup simple and functional
