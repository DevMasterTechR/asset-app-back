<#
Script seguro para ejecutar backup y aplicar migraciones Prisma en producción.
USO (PowerShell):
  .\prod-migrate.ps1 -DatabaseUrl "postgresql://postgres:password@host:5432/postgres"
Si no pasas `-DatabaseUrl`, se usa la variable de entorno `DATABASE_URL`.
#>
param(
  [string]$DatabaseUrl = $env:DATABASE_URL
)

if (-not $DatabaseUrl) {
  Write-Error "Se requiere DatabaseUrl (o establecer variable de entorno DATABASE_URL)."
  exit 1
}

Write-Host "Usando DATABASE_URL: $DatabaseUrl"

# 1) Backup (si pg_dump está disponible)
$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if ($pgDump) {
  $stamp = Get-Date -Format yyyyMMdd_HHmmss
  $backupFile = "prod-backup-$stamp.dump"
  Write-Host "Haciendo backup con pg_dump -> $backupFile"
  & pg_dump --dbname=$DatabaseUrl -Fc -f $backupFile
  if ($LASTEXITCODE -ne 0) { Write-Error "pg_dump falló. Abortando."; exit 2 }
} else {
  Write-Warning "pg_dump no encontrado en PATH. Haz un backup manual antes de continuar."
}

# 2) Mostrar columnas actuales de AssignmentHistory (si psql está disponible)
$psql = Get-Command psql -ErrorAction SilentlyContinue
if ($psql) {
  Write-Host "Columnas actuales de AssignmentHistory:"
  & psql $DatabaseUrl -c "SELECT column_name FROM information_schema.columns WHERE table_name='AssignmentHistory' ORDER BY column_name;"
} else {
  Write-Warning "psql no disponible. Ejecuta manualmente: SELECT column_name FROM information_schema.columns WHERE table_name='AssignmentHistory';"
}

# 3) Ejecutar migraciones Prisma
Write-Host "Instalando dependencias y ejecutando: npx prisma migrate deploy"
if (-not (Test-Path "..\pnpm-lock.yaml") -and -not (Test-Path "..\package.json")) {
  Write-Warning "Parece que no estás en el directorio del repo backend. Cambia a la carpeta del backend y vuelve a ejecutar este script.";
  exit 3
}

Push-Location ..\
try {
  pnpm install --frozen-lockfile
  $env:DATABASE_URL = $DatabaseUrl
  npx prisma migrate deploy --schema=prisma/schema.prisma
  if ($LASTEXITCODE -ne 0) { Write-Error "prisma migrate deploy devolvió error."; exit 4 }
  Write-Host "Migraciones aplicadas. Ejecuta 'npx prisma generate' y redeploy del backend si es necesario."
} finally {
  Pop-Location
}

# 4) Recomendación: regenerar client y redeploy si corresponde
Write-Host "Si el backend usa Prisma Client generado en build time, realiza un rebuild y redeploy del backend."