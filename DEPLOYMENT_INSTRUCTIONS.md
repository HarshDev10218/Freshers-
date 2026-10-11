# Deployment Guide: Render + Vercel

This guide walks you through deploying the CBIT Faculty Invitation Tracker to production using:
- **Backend**: Render (Node.js server)
- **Frontend**: Vercel (React SPA)

---

## Prerequisites

1. A GitHub account (already have it ✓)
2. A [Render.com](https://render.com) account (free tier available)
3. A [Vercel.com](https://vercel.com) account (free tier available)
4. (Optional) A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for cloud database

---

## Step 1: Deploy Backend to Render

### 1.1 Push Your Code to GitHub
Make sure all code is committed and pushed:
```bash
git add .
git commit -m "Add deployment configurations"
git push origin main
```

### 1.2 Connect GitHub to Render
1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"**
4. Select your GitHub account → search for **"Freshers-"** repo
5. Click **"Connect"**

### 1.3 Configure Render Deployment
Fill in the form as follows:

| Field | Value |
|-------|-------|
| **Name** | `cbit-faculty-tracker-backend` |
| **Environment** | `Node` |
| **Region** | Choose closest to you (e.g., `Oregon`, `Frankfurt`) |
| **Branch** | `main` |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start` |
| **Plan** | `Free` (for testing) or `Pay-as-you-go` (recommended) |

### 1.4 Add Environment Variables
In the Render dashboard, scroll down to **"Environment Variables"** and add:

```
PORT=10000
NODE_ENV=production
MONGODB_DB_NAME=cbit_freshers
MONGODB_URI=  (leave empty for now - uses local JSON file)
```

**Note:** To use MongoDB Atlas (optional), get your connection string and paste it as `MONGODB_URI`.

### 1.5 Deploy
Click **"Create Web Service"** and wait for deployment (2-3 minutes).

Once deployed, Render will give you a URL like:
```
https://cbit-faculty-tracker-backend.onrender.com
```

**Save this URL** — you'll need it for the frontend.

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"**
4. Search for **"Freshers-"** and select it
5. Click **"Import"**

### 2.2 Configure Vercel Deployment
Fill in the form as follows:

| Field | Value |
|-------|-------|
| **Project Name** | `cbit-faculty-tracker-frontend` |
| **Root Directory** | `./frontend` ✓ (Important!) |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 2.3 Add Environment Variables
Before clicking "Deploy", scroll to **"Environment Variables"** and add:

```
VITE_API_URL=https://cbit-faculty-tracker-backend.onrender.com
VITE_WS_URL=wss://cbit-faculty-tracker-backend.onrender.com
```

**Replace with your actual Render backend URL from Step 1.5**

### 2.4 Deploy
Click **"Deploy"** and wait for deployment (2-3 minutes).

Once deployed, Vercel will give you a URL like:
```
https://cbit-faculty-tracker-frontend.vercel.app
```

---

## Step 3: Update Backend to Accept Frontend CORS

Go back to **Render Dashboard** → your backend service → **Settings** → **Environment Variables**

Update the `CORS_ORIGIN` variable:
```
CORS_ORIGIN=https://cbit-faculty-tracker-frontend.vercel.app
```

Click **"Save"** and the service will auto-redeploy.

---

## Step 4: Test the Deployment

1. Open your Vercel frontend URL in a browser:
   ```
   https://cbit-faculty-tracker-frontend.vercel.app
   ```

2. You should see the Faculty Invitation Tracker app

3. Try adding a faculty member — it should sync in real-time via WebSocket

4. Check Render logs to confirm requests are reaching the backend:
   - Render Dashboard → your backend service → **Logs** tab

---

## Optional: Set Up MongoDB Atlas (Database)

If you want to use a cloud database instead of local JSON files:

### 3.1 Create MongoDB Atlas Cluster
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and log in
3. Click **"Create"** → **"Build a cluster"**
4. Select **"M0 Free"** tier
5. Choose region and create cluster (5-10 minutes)

### 3.2 Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster-name.mongodb.net/database-name?retryWrites=true&w=majority
   ```

### 3.3 Add to Render
1. Render Dashboard → backend service → **Environment Variables**
2. Update `MONGODB_URI` with your connection string
3. Click **"Save"** — service auto-redeploys

---

## Troubleshooting

### Frontend shows "Cannot connect to API"
- Verify `VITE_API_URL` env var on Vercel is correct
- Check Render backend URL is accessible: `https://your-backend.onrender.com/api/health`
- Verify CORS is configured correctly on Render

### WebSocket connection fails
- Make sure `VITE_WS_URL` uses `wss://` (secure WebSocket)
- Verify backend WebSocket endpoint: `wss://your-backend.onrender.com/ws`

### Data not persisting
- If using local JSON: data is stored in `backend/data/faculty_store.json` on Render
- If using MongoDB: verify connection string in `MONGODB_URI`
- Check Render logs for database errors

### Free tier Render instance spins down
- Render free tier instances auto-sleep after 15 minutes of inactivity
- They wake up on first request (5-30 seconds cold start)
- Upgrade to paid tier for always-on instances

---

## Public URLs After Deployment

- **Frontend**: `https://cbit-faculty-tracker-frontend.vercel.app`
- **Backend API**: `https://cbit-faculty-tracker-backend.onrender.com`
- **Backend Health Check**: `https://cbit-faculty-tracker-backend.onrender.com/api/health`

Anyone with these URLs can access your app!

---

## How to Update After Deployment

Changes made to the `main` branch will auto-deploy:
1. Make changes locally
2. Push to GitHub: `git push origin main`
3. Both Render and Vercel will auto-redeploy within 1-2 minutes
4. No manual redeployment needed!

---

## Security Notes

⚠️ **Before going live**, consider:
- Add authentication (login required to modify data)
- Restrict CORS to only your frontend URL
- Use MongoDB instead of local JSON for persistent data
- Enable HTTPS everywhere (both already do this)
- Add rate limiting to API endpoints
- Validate all user inputs

Current setup is great for **testing** but not recommended for **production with sensitive data**.
