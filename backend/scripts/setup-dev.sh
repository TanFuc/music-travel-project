#!/usr/bin/env bash
# Setup backend: .env, Docker (postgres+redis), migrations, then run dev.
set -e
cd "$(dirname "$0")/.."

echo "==> Copying .env.example to .env ..."
cp -n .env.example .env 2>/dev/null || true
if ! grep -q '^DATABASE_URL=' .env 2>/dev/null; then
  echo "Creating .env from .env.example"
  cp .env.example .env
fi

echo "==> Starting PostgreSQL and Redis (Docker)..."
docker compose -f ../docker-compose.yml up -d

echo "==> Waiting for Postgres to be ready..."
sleep 3
for i in {1..30}; do
  if docker compose -f ../docker-compose.yml exec -T postgres pg_isready -U user -d music_travel 2>/dev/null; then
    break
  fi
  sleep 1
done

echo "==> Generating Prisma client and running migrations..."
npx prisma generate
npx prisma migrate deploy

echo "==> Backend setup done. Run: npm run dev"
