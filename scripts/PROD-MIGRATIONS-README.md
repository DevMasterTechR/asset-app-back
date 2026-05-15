Guía rápida: aplicar migraciones Prisma en producción

Resumen:
- Haz backup de la BD antes de tocar nada.
- Comprueba columnas actuales de `AssignmentHistory`.
- Ejecuta `npx prisma migrate deploy` apuntando a `DATABASE_URL` de producción.
- Si el backend requiere Prisma Client en build, rebuild y redeploy.

Pasos (PowerShell en Windows):

1) Backup (si tienes `pg_dump`):

```powershell
$env:DATABASE_URL = 'postgresql://postgres:TU_PASS@db.ouxhehcovwkyqkbezqkm.supabase.co:5432/postgres'
pg_dump --dbname=$env:DATABASE_URL -Fc -f "prod-backup-$(Get-Date -Format yyyyMMdd).dump"
```

2) Ver columnas actuales de `AssignmentHistory` (si tienes `psql`):

```powershell
$env:DATABASE_URL = 'postgresql://postgres:TU_PASS@db.ouxhehcovwkyqkbezqkm.supabase.co:5432/postgres'
psql $env:DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='AssignmentHistory' ORDER BY column_name;"
```

3) Ejecutar migraciones (desde el repo `asset-app-back-github`):

```powershell
# situarse en la carpeta padre del repo o ejecutar desde la carpeta repo
cd C:\Users\USER_HP\Desktop\Gestor-Tech\asset-app-back-github
pnpm install --frozen-lockfile
$env:DATABASE_URL = 'postgresql://postgres:TU_PASS@db.ouxhehcovwkyqkbezqkm.supabase.co:5432/postgres'
npx prisma migrate deploy --schema=prisma/schema.prisma
```

4) Verificar endpoint y logs:

```powershell
Invoke-RestMethod -Uri https://asset-app-back-83gi.onrender.com/assignment-history
# o
curl -I https://asset-app-back-83gi.onrender.com/assignment-history
```

Notas importantes:
- Reemplaza `TU_PASS` por la contraseña real. Nunca compartas la contraseña en canales públicos.
- Si `pg_dump`/`psql` no están instalados, usa las herramientas que provea tu hosting (Supabase, Render, etc.) para generar un backup y ejecutar consultas.
- Ejecuta `npx prisma generate` y redeploy del servicio si el Prisma Client se genera durante el build.
