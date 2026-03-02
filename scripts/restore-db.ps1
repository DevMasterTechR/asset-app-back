param(
  [Parameter(Mandatory = $true)]
  [string]$DumpFile,

  [string]$TargetConnectionString = ""
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $DumpFile)) {
  throw "No existe el archivo dump: $DumpFile"
}

if (-not $TargetConnectionString) {
  $TargetConnectionString = $env:DIRECT_URL
}

if (-not $TargetConnectionString) {
  throw "No se encontró TargetConnectionString. Define DIRECT_URL o pásalo como parámetro."
}

$pgRestore = Get-Command pg_restore -ErrorAction SilentlyContinue
if (-not $pgRestore) {
  throw "pg_restore no está instalado o no está en PATH. Instala PostgreSQL client tools."
}

Write-Host "Restaurando $DumpFile ..."
& pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$TargetConnectionString" "$DumpFile"

if ($LASTEXITCODE -ne 0) {
  throw "pg_restore falló con código $LASTEXITCODE"
}

Write-Host "Restore completado correctamente."
