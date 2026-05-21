# WorkHub - Deployment Guide

## Hosting on Render

Follow this guide to deploy both the frontend and backend on Render.

### Prerequisites
- GitHub account with your project repository
- Render account (https://render.com)
- Backend should be in the `backend/` folder
- Frontend in the root folder

---

## Backend Deployment (Node.js/Express)

### Step 1: Prepare Backend for Deployment

1. Navigate to `backend/` folder
2. Ensure your `backend/package.json` has a start script:
```json
{
  "scripts": {
    "start": "node src/server.js"
  }
}
```

3. Create a `.env` file or document required environment variables:
   - DATABASE_URL (if using database)
   - JWT_SECRET
   - Any API keys needed

### Step 2: Deploy Backend on Render

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `workhub-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

5. Under **Environment**, add your environment variables:
   - `DATABASE_URL`: your database connection string
   - `JWT_SECRET`: your secret key
   - `NODE_ENV`: `production`

6. Click **"Create Web Service"** and wait for deployment

7. Once live, copy the backend URL (e.g., `https://workhub-backend.onrender.com`)

---

## Frontend Deployment (React/Vite)

### Step 1: Prepare Frontend

1. Update your API base URL in `src/lib/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://workhub-backend.onrender.com/api';
```

2. Create a `.env.production` file:
```
VITE_API_URL=https://workhub-backend.onrender.com/api
```

### Step 2: Create render.yaml (Optional but Recommended)

Create a `render.yaml` file in root for easier multi-service deployment:
```yaml
services:
  - type: web
    name: workhub-frontend
    env: static
    buildCommand: npm run build
    staticPublicPath: dist
    envVars:
      - key: VITE_API_URL
        value: https://workhub-backend.onrender.com/api
```

### Step 3: Deploy Frontend on Render

1. Go to https://render.com
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Fill in the details:
   - **Name**: `workhub-frontend`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Under **Environment**, add:
   - `VITE_API_URL`: `https://workhub-backend.onrender.com/api`

6. Click **"Create Static Site"** and wait for deployment

7. Your frontend will be live at: `https://workhub-frontend.onrender.com`

---

## Connecting Frontend to Backend

Make sure your API calls in the frontend use the backend URL:

```javascript
// src/lib/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetchData = async (endpoint) => {
  const response = await fetch(`${API_URL}${endpoint}`);
  return response.json();
};
```

---

## Monitoring & Logs

- View logs on Render dashboard for each service
- Check backend logs if API calls fail
- Monitor frontend performance in browser DevTools

---

## Next Steps

- Set up a custom domain
- Configure automatic deploys on git push
- Set up health checks
- Configure auto-restart on crashes

