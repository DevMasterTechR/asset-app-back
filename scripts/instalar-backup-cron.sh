#!/usr/bin/env bash
# Programa el respaldo diario a las 03:15. Idempotente: no duplica la entrada.
set -euo pipefail
RUTA="$(cd "$(dirname "$0")/.." && pwd)/scripts/backup-db.sh"
LINEA="15 3 * * * $RUTA >> /var/log/asset-app-backup.log 2>&1"

if crontab -l 2>/dev/null | grep -Fq "$RUTA"; then
  echo "✓ El respaldo ya estaba programado:"
else
  (crontab -l 2>/dev/null; echo "$LINEA") | crontab -
  echo "✓ Respaldo diario programado (03:15):"
fi
crontab -l | grep -F "$RUTA"
echo
echo "Probar ahora:      $RUTA"
echo "Ver el historial:  ls -lh /srv/backups/asset-app/"
