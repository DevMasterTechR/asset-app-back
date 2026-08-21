#!/usr/bin/env bash
# ============================================================
# Respaldo diario del Postgres del VPS.
# Guarda un volcado comprimido y conserva los últimos RETENCION días.
#
# Uso manual:  ./scripts/backup-db.sh
# Automático:  ./scripts/instalar-backup-cron.sh
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR=/srv/backups/asset-app
RETENCION=14          # días de historial
STAMP=$(date +%Y%m%d-%H%M%S)
DESTINO="$BACKUP_DIR/asset-app-$STAMP.sql.gz"

leer_env() { grep -E "^$1=" .env | tail -1 | sed -e "s/^$1=//" -e 's/^"//' -e 's/"$//'; }
POSTGRES_USER=$(leer_env POSTGRES_USER)
POSTGRES_DB=$(leer_env POSTGRES_DB)

mkdir -p "$BACKUP_DIR"; chmod 700 "$BACKUP_DIR"

docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  --no-owner --no-privileges | gzip -9 > "$DESTINO"

chmod 600 "$DESTINO"

# Un volcado válido termina con la línea de cierre de pg_dump.
if ! gzip -dc "$DESTINO" | tail -5 | grep -q "PostgreSQL database dump complete"; then
  echo "[backup] ✗ El volcado $DESTINO parece incompleto. NO se rota el historial." >&2
  exit 1
fi

find "$BACKUP_DIR" -name 'asset-app-*.sql.gz' -mtime +$RETENCION -delete

echo "[backup] ✓ $DESTINO ($(du -h "$DESTINO" | cut -f1))"
