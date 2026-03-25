# Sales Insight Automator

Sales Insight Automator is a production-oriented SaaS prototype that converts CSV/XLSX datasets into AI-generated executive insights and delivers reports by email.

## Live App

- Frontend: https://insight-frontend-fs7r.onrender.com/
- Backend Health: https://insight-backend-jpj3.onrender.com/health
- Backend API Docs: https://insight-backend-jpj3.onrender.com/docs

## Stack

- Frontend: Next.js 14, TypeScript, TailwindCSS, Framer Motion, Recharts
- Backend: FastAPI, Pydantic, Celery producer, Redis job store
- Worker: Celery, Pandas, Gemini API, Resend API
- Infrastructure: Docker, Docker Compose, GitHub Actions

## Features

- Upload `.csv`, `.xlsx`, and `.xls` files (max 10MB)
- Async processing pipeline via Redis + Celery
- Automatic schema detection:
  - Numeric columns
  - Categorical columns
  - Datetime columns
- Automatic dataset analysis:
  - Dataset overview (rows, columns, missing values)
  - Numeric summaries
  - Categorical distributions
  - Correlations
  - Outlier detection
  - Datetime trends (if available)
- AI executive summary generation
- Email delivery of insights
- Dynamic insights dashboard and job history
- Swagger API docs at `/docs`

## Project Structure

- `frontend/` Next.js app
- `backend/` FastAPI API service
- `worker/` Celery processing service
- `.github/workflows/` CI pipeline

## Local Run (Docker)

1. Copy `.env.example` to `.env`.
2. Set at minimum:
  - `GEMINI_API_KEY` (optional; fallback summary is used when empty)
  - `RESEND_API_KEY` (optional; email sending is skipped when empty)
3. Start the stack:

```bash
docker compose up --build
```

4. Access services:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

## Production Deploy

Use the production compose override with health checks and restart policies.

Windows (PowerShell):

```powershell
./scripts/deploy.ps1
```

Linux/macOS:

```bash
sh ./scripts/deploy.sh
```

Manual equivalent command:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Build-only mode:

```powershell
./scripts/deploy.ps1 -BuildOnly
```

```bash
sh ./scripts/deploy.sh --build-only
```

## API Endpoints

- `POST /api/v1/upload`
- `GET /api/v1/job/{id}`
- `GET /api/v1/jobs`
- `GET /health`

## CI

GitHub Actions workflow runs on pull requests to `main` and performs:

- Frontend dependency install + lint
- Python formatting checks (Black/isort)
- Docker image builds for frontend/backend/worker



