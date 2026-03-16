#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
cd "$REPO_ROOT"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example."
  echo "Update .env with GEMINI_API_KEY and RESEND_API_KEY, then rerun this script."
  exit 1
fi

echo "Checking Docker availability..."
docker info >/dev/null

if [ "${1:-}" = "--build-only" ]; then
  echo "Building production images..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml build
  exit 0
fi

echo "Starting production stack..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans

echo "Deployment status:"
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
