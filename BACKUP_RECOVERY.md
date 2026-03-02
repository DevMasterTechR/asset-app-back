# Backup y Recuperación (Supabase + Prisma)

## 1) Estado recomendado de conexión

Usa dos URLs en `.env`:

- `DIRECT_URL`: para migraciones, backups y restore (puerto 5432)
- `DATABASE_URL`: para la app (pooler puerto 6543)

Ejemplo:

```env
DIRECT_URL="postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"
DATABASE_URL="postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
```

## 2) Deploy final en Render

En Render (servicio web), define estas variables:

- `DATABASE_URL` = la URL de pooler (6543)
- `DIRECT_URL` = la URL directa/pooler sesión (5432)
- resto de variables de correo según tu `.env`

Start command sugerido en Render:

```bash
npx prisma migrate deploy && node dist/src/main.js
```

## 3) Backup diario en la nube (GitHub Actions)

Archivo creado:

- `.github/workflows/daily-db-backup.yml`

Qué hace:

- Se ejecuta diario (`08:00 UTC`) y también manual (`workflow_dispatch`)
- Ejecuta `pg_dump` con formato custom (`.dump`)
- Sube el archivo como artifact de GitHub (retención 30 días)

Configura este secreto en GitHub (repo -> Settings -> Secrets and variables -> Actions):

- `SUPABASE_DIRECT_URL` = valor de `DIRECT_URL`

## 4) Backup diario local (Windows)

Script creado:

- `scripts/backup-db.ps1`

Ejecución manual:

```powershell
npm run backup:local
```

Opcional con parámetros:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/backup-db.ps1 -OutputDir "D:\db-backups" -KeepDays 30
```

Programarlo diario en Task Scheduler (Windows):

1. Abrir Task Scheduler -> Create Basic Task
2. Trigger: Daily (hora deseada)
3. Action: Start a program
4. Program/script: `powershell.exe`
5. Add arguments:

```text
-ExecutionPolicy Bypass -File "C:\Users\USER_HP\Desktop\Pagina Tech\asset-app-back\scripts\backup-db.ps1" -OutputDir "C:\Users\USER_HP\Desktop\Pagina Tech\asset-app-back\backups\local" -KeepDays 14
```

## 5) Restore

Script creado:

- `scripts/restore-db.ps1`

Uso:

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/restore-db.ps1 -DumpFile "./backups/local/asset-app-back-YYYY-MM-DD_HH-mm-ss.dump"
```

## 6) Buenas prácticas

- Rota contraseña de base de datos después de cualquier incidente.
- Nunca subas `.env` al repositorio.
- Mantén al menos dos copias: una local y una en la nube.
- Prueba restore al menos 1 vez al mes para validar que el backup sirve.
