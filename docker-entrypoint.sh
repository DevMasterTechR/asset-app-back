#!/bin/sh
set -e

echo "[entrypoint] NODE_ENV=$NODE_ENV PORT=${PORT:-3000}"

# Docker/Compose pasan los valores del .env tal cual, sin interpretar las
# comillas que dotenv sí quita. Sin esto, un DATABASE_URL="postgresql://..."
# llega con las comillas incluidas y Prisma falla con P1012.
strip_quotes() {
  printf '%s' "$1" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

DATABASE_URL=$(strip_quotes "$DATABASE_URL"); export DATABASE_URL
DIRECT_URL=$(strip_quotes "$DIRECT_URL"); export DIRECT_URL

if [ -z "$DATABASE_URL" ]; then
  echo "[entrypoint] ERROR: DATABASE_URL no está definida. Revisa el archivo .env." >&2
  exit 1
fi

case "$DATABASE_URL" in
  postgresql://*|postgres://*) ;;
  *)
    echo "[entrypoint] ERROR: DATABASE_URL debe empezar por postgresql:// o postgres://" >&2
    exit 1
    ;;
esac

# Aplica las migraciones pendientes contra Supabase antes de arrancar.
# Usa DIRECT_URL (puerto 5432) según el datasource de prisma/schema.prisma.
# Desactivable con RUN_MIGRATIONS=false.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Aplicando migraciones (prisma migrate deploy)..."
  ./node_modules/.bin/prisma migrate deploy
  echo "[entrypoint] Migraciones al día."
else
  echo "[entrypoint] RUN_MIGRATIONS=false → se omiten las migraciones."
fi

echo "[entrypoint] Iniciando API..."
exec "$@"
