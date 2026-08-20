#!/usr/bin/env bash
# ============================================================
# Despliegue / actualización de asset-app-back en el VPS
# Uso:  ./deploy.sh            (pull + rebuild + restart)
#       ./deploy.sh --no-pull  (rebuild con el código local)
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "✗ No existe .env. Crea uno con: cp .env.production.example .env && nano .env" >&2
  exit 1
fi

if [ "${1:-}" != "--no-pull" ]; then
  echo "▸ Trayendo cambios de git..."
  git pull --ff-only
fi

echo "▸ Construyendo imagen..."
docker compose build

echo "▸ Levantando contenedor (migraciones incluidas en el arranque)..."
docker compose up -d

echo "▸ Esperando healthcheck..."
for i in $(seq 1 30); do
  status=$(docker inspect -f '{{.State.Health.Status}}' asset-app-back 2>/dev/null || echo "starting")
  if [ "$status" = "healthy" ]; then
    echo "✓ API healthy"
    break
  fi
  if [ "$status" = "unhealthy" ]; then
    echo "✗ Contenedor unhealthy. Logs:" >&2
    docker compose logs --tail=60 api >&2
    exit 1
  fi
  sleep 3
done

echo "▸ Limpiando imágenes viejas..."
docker image prune -f >/dev/null

echo "▸ Estado:"
docker compose ps
echo
echo "Logs en vivo:  docker compose logs -f api"
