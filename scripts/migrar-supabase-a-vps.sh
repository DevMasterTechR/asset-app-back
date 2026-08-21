#!/usr/bin/env bash
# ============================================================
# Migra la base de datos de Supabase al Postgres del VPS.
#
#   1. Volca la BD de Supabase (usa el DIRECT_URL que haya en .env)
#   2. Levanta el contenedor db y restaura el volcado
#   3. Compara el número de filas tabla por tabla
#   4. Deja escritas las nuevas DATABASE_URL / DIRECT_URL en .env
#
# Es idempotente en lo importante: no borra el volcado ni toca Supabase
# (solo lectura), y guarda copia del .env antes de modificarlo.
#
# Uso:  ./scripts/migrar-supabase-a-vps.sh
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

PGIMG=postgres:17-alpine
BACKUP_DIR=/srv/backups/asset-app
STAMP=$(date +%Y%m%d-%H%M%S)
DUMP="$BACKUP_DIR/supabase-$STAMP.sql"

rojo()  { printf '\033[31m%s\033[0m\n' "$*"; }
verde() { printf '\033[32m%s\033[0m\n' "$*"; }
info()  { printf '\033[36m▸ %s\033[0m\n' "$*"; }

[ -f .env ] || { rojo "✗ No existe .env en $(pwd)"; exit 1; }

# ---------- credenciales ----------
# .env se lee a mano: tiene comentarios y no queremos exportarlo entero.
leer_env() { grep -E "^$1=" .env | tail -1 | sed -e "s/^$1=//" -e 's/^"//' -e 's/"$//'; }

SUPA_URL=$(leer_env DIRECT_URL)
POSTGRES_USER=$(leer_env POSTGRES_USER)
POSTGRES_PASSWORD=$(leer_env POSTGRES_PASSWORD)
POSTGRES_DB=$(leer_env POSTGRES_DB)

case "$SUPA_URL" in
  *supabase.com*) ;;
  *)
    rojo "✗ DIRECT_URL en .env no apunta a Supabase."
    echo "  Valor actual: ${SUPA_URL%%:*}://...  (¿ya migraste?)"
    echo "  Si ya migraste, no hay nada que hacer. Si quieres repetir la"
    echo "  migración, pon temporalmente el DIRECT_URL de Supabase en .env."
    exit 1
    ;;
esac

for v in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB; do
  if [ -z "$(eval echo \$$v)" ]; then
    rojo "✗ Falta $v en .env."
    echo "  Añade estas tres líneas antes de migrar (con una contraseña propia):"
    echo "    POSTGRES_USER=asset"
    echo "    POSTGRES_PASSWORD=\$(openssl rand -hex 24)"
    echo "    POSTGRES_DB=asset_manager"
    exit 1
  fi
done

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

# ---------- 1. volcado de Supabase ----------
info "Volcando Supabase → $DUMP"
# --no-owner / --no-privileges: los roles de Supabase no existen en el VPS.
# --schema=public: deja fuera auth, storage y demás esquemas internos.
docker run --rm -e PGURL="$SUPA_URL" "$PGIMG" \
  pg_dump "$SUPA_URL" \
    --schema=public \
    --no-owner --no-privileges \
    --no-publications --no-subscriptions \
    --quote-all-identifiers \
  > "$DUMP"

chmod 600 "$DUMP"
TAM=$(du -h "$DUMP" | cut -f1)
TABLAS=$(grep -c '^CREATE TABLE' "$DUMP" || true)
verde "✓ Volcado listo: $TAM, $TABLAS tablas"

if [ "$TABLAS" -lt 5 ]; then
  rojo "✗ El volcado tiene solo $TABLAS tablas: algo salió mal. Se aborta."
  echo "  Revisa el contenido: head -50 $DUMP"
  exit 1
fi

# ---------- 2. levantar Postgres local y restaurar ----------
info "Levantando el contenedor de Postgres..."
docker compose up -d db

for i in $(seq 1 30); do
  estado=$(docker inspect -f '{{.State.Health.Status}}' asset-app-db 2>/dev/null || echo starting)
  [ "$estado" = "healthy" ] && break
  sleep 2
done
[ "$estado" = "healthy" ] || { rojo "✗ Postgres no llegó a healthy"; docker compose logs --tail=30 db; exit 1; }
verde "✓ Postgres arriba"

YA=$(docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
      "select count(*) from information_schema.tables where table_schema='public'" | tr -d '[:space:]')
if [ "$YA" != "0" ]; then
  rojo "✗ La base $POSTGRES_DB ya tiene $YA tablas."
  echo "  Para empezar de cero (BORRA los datos locales, no los de Supabase):"
  echo "    docker compose down && docker volume rm asset-app-db-data"
  echo "    ./scripts/migrar-supabase-a-vps.sh"
  exit 1
fi

info "Restaurando el volcado..."
# Postgres ya trae el esquema public creado, pero el volcado de Supabase
# incluye CREATE SCHEMA "public" y con ON_ERROR_STOP eso aborta todo
# ("schema public already exists"). Esas dos líneas se filtran: el resto
# del volcado se aplica igual y cualquier otro error sí detiene el proceso.
sed -e '/^CREATE SCHEMA "\?public"\?;$/d' \
    -e '/^COMMENT ON SCHEMA "\?public"\?/d' \
    "$DUMP" \
  | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
      -v ON_ERROR_STOP=1 --quiet
verde "✓ Restauración terminada"

# Con ON_ERROR_STOP el psql anterior habría fallado, pero un volcado que no
# crea ninguna tabla pasaría desapercibido: se comprueba explícitamente.
N_TABLAS=$(docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE'" | tr -d '[:space:]')
if [ "$N_TABLAS" -lt 5 ]; then
  rojo "✗ Tras restaurar solo hay $N_TABLAS tablas. Se aborta sin tocar el .env."
  exit 1
fi
# ---------- 3. verificación fila por fila ----------
info "Comparando Supabase con la copia local..."

TABLAS_LOCAL=$(docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "select table_name from information_schema.tables
    where table_schema='public' and table_type='BASE TABLE' order by 1" | tr -d '\r')

# Una sola consulta con UNION ALL: un contenedor, en vez de uno por tabla.
CONSULTA=$(printf '%s\n' "$TABLAS_LOCAL" | while read -r t; do
  [ -n "$t" ] && printf "select '%s' as tabla, count(*)::text as filas from \"%s\" union all " "$t" "$t"
done | sed 's/ union all $//')

conteos_local=$(docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -tAF'|' -c "$CONSULTA" | tr -d '\r' | sort)
conteos_supa=$(docker run --rm "$PGIMG" psql "$SUPA_URL" \
  -tAF'|' -c "$CONSULTA" | tr -d '\r' | sort)

if [ "$conteos_local" = "$conteos_supa" ]; then
  printf '%s\n' "$conteos_local" | awk -F'|' 'NF>1{printf "  %-34s %8s filas  ok\n", $1, $2}'
  N=$(printf '%s\n' "$conteos_local" | grep -c .)
  verde "✓ $N tablas, todas con el mismo número de filas"
else
  rojo "✗ Los conteos no coinciden. NO se cambia el .env."
  echo "--- diferencias (< local   > supabase) ---"
  diff <(printf '%s\n' "$conteos_local") <(printf '%s\n' "$conteos_supa") || true
  echo
  echo "  El volcado sigue en $DUMP y Supabase está intacto."
  exit 1
fi

# ---------- 4. reescribir .env ----------
cp .env ".env.supabase-$STAMP"
chmod 600 ".env.supabase-$STAMP"

NUEVA="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@db:5432/$POSTGRES_DB?schema=public"
# El host es "db": el nombre del servicio dentro de la red de compose.
sed -i \
  -e "s|^DATABASE_URL=.*|DATABASE_URL=$NUEVA|" \
  -e "s|^DIRECT_URL=.*|DIRECT_URL=$NUEVA|" \
  .env

verde "✓ .env apuntando al Postgres del VPS (copia previa en .env.supabase-$STAMP)"
echo
info "Reiniciando la API contra la base local..."
docker compose up -d
sleep 5
if curl -fsS http://127.0.0.1:3000/health; then
  echo
  verde "✓ Migración completa. La API ya usa la base de datos del VPS."
  echo
  echo "Siguientes pasos:"
  echo "  · Programa los respaldos:  ./scripts/instalar-backup-cron.sh"
  echo "  · Supabase queda intacto como respaldo; no lo borres todavía."
  echo "  · Volcado guardado en: $DUMP"
else
  echo
  rojo "✗ La API no responde. Logs:"
  docker compose logs --tail=40 api
  echo
  echo "Para volver a Supabase:  cp .env.supabase-$STAMP .env && docker compose up -d"
  exit 1
fi
