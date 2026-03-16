# Cloud Deployment Guide

There are two free options: **Render** (recommended — easiest) and **Railway**.

---

## Option 1: Render (Recommended)

Render supports Docker deployments with a free tier for web services, background workers, and Redis.

### Step 1 — Push your code to GitHub

Render deploys from a GitHub repository.

```bash
git init
git add .
git commit -m "initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2 — Create a Render account

Go to https://render.com and sign up with your GitHub account.

### Step 3 — Deploy with render.yaml (Blueprint)

1. In Render dashboard, click **New → Blueprint**
2. Connect your GitHub repository
3. Render detects `render.yaml` and shows all 4 services: `insight-redis`, `insight-backend`, `insight-worker`, `insight-frontend`
4. Click **Apply**

Render will build and deploy all services in the correct order automatically.

### Step 4 — Set secret environment variables

After deploy, go to each service and set these manually in the Render dashboard under **Environment**:

**insight-backend:**
- `CORS_ORIGINS` → `https://insight-frontend.onrender.com` (replace with your actual frontend URL shown in Render)

**insight-worker:**
- `GEMINI_API_KEY` → your Gemini API key (optional — for AI summaries)
- `RESEND_API_KEY` → your Resend API key (optional — for email delivery)
- `RESEND_FROM_EMAIL` → your verified sender email

### Step 5 — Update frontend API URL

In `render.yaml`, update these two values with your actual backend URL (shown in Render after first deploy):

```yaml
buildArgs:
  NEXT_PUBLIC_API_BASE_URL: https://YOUR-ACTUAL-BACKEND.onrender.com

envVars:
  - key: NEXT_PUBLIC_API_BASE_URL
    value: https://YOUR-ACTUAL-BACKEND.onrender.com
```

Then push the change and Render will redeploy the frontend automatically.

### Free tier limits on Render

- Web services spin down after 15 minutes of inactivity (cold start ~30s)
- 750 free instance-hours per month per service
- Redis free tier: 25MB storage
- No credit card required

---

## Option 2: Railway

Railway offers $5 of free credits per month, enough to run this stack.

### Step 1 — Push your code to GitHub (same as above)

### Step 2 — Create a Railway account

Go to https://railway.app and sign up with your GitHub account.

### Step 3 — Create a new project

1. Click **New Project → Deploy from GitHub repo**
2. Select your repository

### Step 4 — Add Redis

In your Railway project, click **New Service → Database → Add Redis**. Railway provides a managed Redis instance and injects `REDIS_URL` automatically.

### Step 5 — Deploy each service

Railway treats each subdirectory as a separate service. For each of `backend`, `worker`, and `frontend`:

1. Click **New Service → GitHub Repo** (same repo, different subdirectory)
2. Set the **Root Directory** to `backend` / `worker` / `frontend`
3. Railway detects `railway.toml` and uses the Dockerfile automatically

### Step 6 — Set environment variables

For each service, set variables in Railway dashboard under **Variables**:

**backend service:**
```
REDIS_URL          = ${{Redis.REDIS_URL}}
CELERY_BROKER_URL  = ${{Redis.REDIS_URL}}
CELERY_RESULT_BACKEND = ${{Redis.REDIS_URL}}
CORS_ORIGINS       = https://YOUR-FRONTEND.up.railway.app
```

**worker service:**
```
REDIS_URL          = ${{Redis.REDIS_URL}}
CELERY_BROKER_URL  = ${{Redis.REDIS_URL}}
CELERY_RESULT_BACKEND = ${{Redis.REDIS_URL}}
GEMINI_API_KEY     = your-key-here
RESEND_API_KEY     = your-key-here
```

**frontend service:**
Set as a build variable:
```
NEXT_PUBLIC_API_BASE_URL = https://YOUR-BACKEND.up.railway.app
```

### Railway reference variables

Use `${{ServiceName.VARIABLE}}` syntax in Railway to link variables between services, e.g. `${{Redis.REDIS_URL}}`.

---

## After Deployment (Both Platforms)

Once all services are healthy, your app is available at:

- **Frontend**: `https://insight-frontend.onrender.com` (Render) or `https://[name].up.railway.app` (Railway)
- **Backend API docs**: `https://insight-backend.onrender.com/docs`
- **Health check**: `https://insight-backend.onrender.com/health`

---

## Important Notes

1. **File uploads are ephemeral** — free tier containers have no persistent disk. Uploaded files exist only during the request/task lifecycle (stored in `/tmp/uploads`), which is sufficient since the worker reads the file immediately.

2. **CORS must match your frontend URL exactly** — after getting your Render/Railway frontend URL, set `CORS_ORIGINS` in the backend service to that exact URL.

3. **Worker shares the upload volume** — on Render/Railway the worker and backend share no disk, but since the Celery task runs inside the worker container and receives the file path, the file must be accessible. Consider using object storage (e.g., Cloudflare R2 free tier) if you need persistence. For demo purposes, the current in-memory `/tmp` approach works within a single request cycle.
