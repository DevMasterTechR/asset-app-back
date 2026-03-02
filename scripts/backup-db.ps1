param(
  [string]$ConnectionString = "",
  [string]$OutputDir = "./backups/local",
  [int]$KeepDays = 14
)

$ErrorActionPreference = 'Stop'

if (-not $ConnectionString) {
  $ConnectionString = $env:DIRECT_URL
}

if (-not $ConnectionString) {
  $ConnectionString = $env:DATABASE_URL
}

if (-not $ConnectionString) {
  throw "No se encontró ConnectionString. Define DIRECT_URL o DATABASE_URL en el entorno/.env"
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
  throw "pg_dump no está instalado o no está en PATH. Instala PostgreSQL client tools."
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$backupFile = Join-Path $OutputDir "asset-app-back-$timestamp.dump"

Write-Host "Creando backup en $backupFile ..."
& pg_dump --dbname="$ConnectionString" --format=custom --no-owner --no-privileges --file="$backupFile"

if ($LASTEXITCODE -ne 0) {
  throw "pg_dump falló con código $LASTEXITCODE"
}

Write-Host "Backup creado: $backupFile"

if ($KeepDays -gt 0) {
  $limitDate = (Get-Date).AddDays(-$KeepDays)
  Get-ChildItem -Path $OutputDir -Filter '*.dump' -File |
    Where-Object { $_.LastWriteTime -lt $limitDate } |
    Remove-Item -Force
  Write-Host "Limpieza completada (KeepDays=$KeepDays)."
}
