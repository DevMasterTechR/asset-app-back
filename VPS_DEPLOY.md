# Despliegue de asset-app-back en VPS (Docker + Nginx + HTTPS)

La base de datos **sigue en Supabase**. Lo único que se mueve de Render al VPS es el
runtime de la API (NestJS). No hay que migrar ni copiar datos: el contenedor se conecta
a la misma cadena de conexión de Supabase que usas hoy.

```
Internet ──> Nginx (443, TLS Let's Encrypt) ──> 127.0.0.1:3000 (contenedor Docker) ──> Supabase (pooler 6543 / directo 5432)
```

Reemplaza en todos los pasos `api.tudominio.com` por tu dominio real y `USUARIO_VPS` por tu usuario.

---


---

## ⚠️ Antes de empezar: dos cosas verificadas en tu Supabase (2026-08-20)

Construí y ejecuté esta imagen en local contra tu base real. Resultado:

**1. El pooler de transacciones (`:6543`) está caído — es la causa probable del 503 en Render.**

| Endpoint | Resultado |
|---|---|
| `aws-0-us-west-2.pooler.supabase.com:5432` (session/directa) | conecta y responde ✔ |
| `aws-0-us-west-2.pooler.supabase.com:6543` (transaction, `pgbouncer=true`) | acepta la conexión TCP pero **nunca completa el handshake** → Prisma corta con `P1001` ✘ |

Tu `DATABASE_URL` actual apunta al `:6543`. Como `PrismaService` hace `process.exit(1)`
si no conecta, el proceso muere al arrancar, el contenedor entra en crash-loop y la
plataforma responde **503** — exactamente lo que muestra el navegador.

Por eso el `.env.production.example` trae `DATABASE_URL` en el **puerto 5432**. En un VPS
eso es lo correcto igualmente: el pooler de transacciones existe para entornos serverless
que abren y cierran conexiones constantemente, no para un proceso Node de larga vida.
Con el 5432 la API arrancó y `/health` devolvió `{"status":"ok","db":"up"}`.

**2. Hay drift de migraciones: una migración aplicada a mano pero no registrada.**

`prisma migrate status` reporta pendiente `20260513000000_add_parent_assignment_id`, pero
en la base **ya existen** la columna `AssignmentHistory.parentAssignmentId` y su FK
`AssignmentHistory_parentAssignmentId_fkey` (se aplicaron por SQL manual, como el resto
del arreglo descrito en `SOLUCION_500_BACKEND.md`).

Si `prisma migrate deploy` corre así, falla con *"column already exists"* y el contenedor
no arranca. Por eso `docker-compose.yml` viene con `RUN_MIGRATIONS: "false"`. Se corrige
una sola vez en el **paso 5-bis** y luego se puede dejar en `true`.

**3. Comillas en el `.env`.** Docker pasa los valores literales, incluidas las comillas
(dotenv sí las quita, por eso funciona en local). Un `DATABASE_URL="postgresql://…"`
produce `P1012`. Escribe los valores sin comillas; el entrypoint además las limpia.

## 1. Requisitos previos

- VPS con Ubuntu 22.04/24.04 (o Debian 12), acceso SSH con sudo.
- Un registro DNS **A** apuntando `api.tudominio.com` → IP pública del VPS.
  Verifica antes de pedir el certificado: `dig +short api.tudominio.com`
- Las credenciales actuales de Supabase (`DATABASE_URL` y `DIRECT_URL`) y las de email.
  Si no las tienes a mano, están en el panel de Render → servicio `asset-app-back` → Environment.

---

## 2. Preparar el VPS

```bash
ssh USUARIO_VPS@IP_DEL_VPS

sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx

# Docker + compose plugin (script oficial)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# cierra y reabre la sesión SSH para que el grupo docker aplique
exit
```

Vuelve a entrar y comprueba:

```bash
docker --version && docker compose version
```

### Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'     # 80 + 443
sudo ufw enable
sudo ufw status
```

El puerto 3000 **no** se abre: el contenedor publica solo en `127.0.0.1`.

---

## 3. Clonar el proyecto

```bash
sudo mkdir -p /srv && sudo chown $USER:$USER /srv
cd /srv
git clone https://github.com/DevMasterTechR/asset-app-back.git
cd asset-app-back
```

> Si el repo es privado, usa una deploy key o un token:
> `git clone https://TU_TOKEN@github.com/DevMasterTechR/asset-app-back.git`

---

## 4. Configurar variables de entorno

```bash
cp .env.production.example .env
nano .env
```

Rellena, como mínimo:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | la de Supabase en el puerto **5432** (no 6543 — ver hallazgo 1), **sin comillas** |
| `DIRECT_URL` | la de Supabase, `:5432` (la usan las migraciones), sin comillas |
| `JWT_SECRET` | `openssl rand -hex 32` — hoy, sin definirla, el código cae al default `'superclave'` |
| `CORS_ORIGINS` | URLs del frontend separadas por coma |
| `EMAIL_*` | credenciales SMTP |

Las credenciales exactas de Supabase están en tu `.env` local y en Render → servicio
`asset-app-back` → Environment. Solo hay que cambiarle el puerto del `DATABASE_URL` a 5432
y quitarle las comillas.

Dos advertencias importantes:

- **`JWT_SECRET`**: si lo cambias respecto a lo que usa Render, las sesiones abiertas
  quedan inválidas y todos los usuarios deben volver a iniciar sesión. Es lo recomendable
  (el default es público), solo hazlo sabiendo el efecto.
- **`COOKIE_ENCRYPTION_KEY`**: déjala exactamente como esté hoy en Render. Si hoy está
  vacía, mantenla comentada — activarla ahora haría ilegibles los tokens ya guardados en
  la columna `person.current_token`.

Permisos del archivo:

```bash
chmod 600 .env
```

---

## 5. Primer arranque

```bash
chmod +x deploy.sh docker-entrypoint.sh
./deploy.sh --no-pull
```

El script construye la imagen, la levanta y espera el healthcheck. En este primer arranque
las migraciones vienen **desactivadas** (`RUN_MIGRATIONS: "false"` en `docker-compose.yml`)
por el drift explicado arriba; se regularizan en el paso 5-bis.

Comprobación local, dentro del VPS:

```bash
curl -s http://127.0.0.1:3000/health
# {"status":"ok","db":"up","uptime":3}

curl -s http://127.0.0.1:3000/
# Hola mi amol! Api corriendo
```

Si algo falla:

```bash
docker compose logs -f api
```

---

## 5-bis. Regularizar el drift de migraciones (una sola vez)

La migración `20260513000000_add_parent_assignment_id` ya está aplicada en la base pero no
registrada. Se marca como aplicada sin tocar el esquema (no ejecuta el SQL, solo escribe la
fila en `_prisma_migrations`):

```bash
docker compose exec api ./node_modules/.bin/prisma migrate resolve \
  --applied 20260513000000_add_parent_assignment_id

docker compose exec api ./node_modules/.bin/prisma migrate status
# Debe decir: "Database schema is up to date!"
```

Cuando el status esté limpio, activa las migraciones automáticas en cada despliegue:

```bash
sed -i 's/RUN_MIGRATIONS: "false"/RUN_MIGRATIONS: "true"/' docker-compose.yml
docker compose up -d
```

> Si `migrate status` reportara *otras* migraciones pendientes cuyo SQL sí falte aplicar,
> **no** uses `resolve` con esas: déjalas para `migrate deploy`. `resolve --applied` es solo
> para las que ya están físicamente en la base.

---

## 6. Nginx + certificado HTTPS

```bash
sudo cp nginx/asset-app-back.conf /etc/nginx/sites-available/asset-app-back
sudo sed -i 's/api\.tudominio\.com/TU_DOMINIO_REAL/g' /etc/nginx/sites-available/asset-app-back
sudo ln -sf /etc/nginx/sites-available/asset-app-back /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

El archivo ya referencia las rutas de los certificados, que aún no existen, así que primero
se emite el certificado con Certbot (usa el modo `--nginx`, que ajusta y recarga solo):

```bash
sudo apt install -y certbot python3-certbot-nginx

# Comenta temporalmente el bloque 443 para que Nginx pueda arrancar sin certificados:
sudo certbot certonly --webroot -w /var/www/html -d TU_DOMINIO_REAL --agree-tos -m tu@correo.com -n
sudo nginx -t && sudo systemctl reload nginx
```

> Si `nginx -t` falla por certificados inexistentes antes de emitirlos: deja habilitado
> solo el bloque `listen 80` (comenta el bloque `server` de 443), recarga, emite el
> certificado con el comando de arriba, descomenta el bloque 443 y vuelve a recargar.

Renovación automática (Certbot instala el timer solo). Verifica:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

Prueba final desde tu máquina:

```bash
curl -s https://TU_DOMINIO_REAL/health
```

---

## 7. Apuntar el frontend

En Vercel, cambia la variable de entorno de la API (la que hoy apunta a
`https://asset-app-back-83gi.onrender.com`) a `https://TU_DOMINIO_REAL` y redespliega.

Y en el VPS, asegúrate de que `CORS_ORIGINS` en `.env` incluya la URL del front. Tras
cambiar `.env`:

```bash
docker compose up -d   # relee env_file y recrea el contenedor
```

Las cookies siguen funcionando cross-site porque con `NODE_ENV=production` la app emite
`SameSite=None; Secure`, y Nginx pasa `X-Forwarded-Proto: https`.

---

## 8. Operación diaria

| Acción | Comando |
|---|---|
| Actualizar a la última versión | `cd /srv/asset-app-back && ./deploy.sh` |
| Ver logs | `docker compose logs -f api` |
| Reiniciar | `docker compose restart api` |
| Detener | `docker compose down` |
| Estado / salud | `docker compose ps` |
| Entrar al contenedor | `docker compose exec api sh` |
| Migración manual | `docker compose exec api ./node_modules/.bin/prisma migrate deploy` |
| Ver estado de migraciones | `docker compose exec api ./node_modules/.bin/prisma migrate status` |

El contenedor tiene `restart: unless-stopped`, así que arranca solo al reiniciar el VPS
(el servicio de Docker ya viene habilitado con systemd).

---

## 9. Cuando ya funcione: apagar Render

Deja Render arriba hasta confirmar que el front trabaja contra el VPS. Después, en el
dashboard de Render: **Settings → Suspend** (o Delete) del servicio `asset-app-back`.
Ambos apuntan a la misma base de Supabase, así que no hay riesgo de perder datos, pero
sí conviene no tener dos backends escribiendo a la vez más tiempo del necesario.

---

## 10. Recomendaciones sobre Supabase

- **Restringir red**: en Supabase → Settings → Database, si activas restricciones de IP,
  agrega la IP pública del VPS (y quita la de Render cuando la apagues).
- **Pooler**: mantén `DATABASE_URL` en el puerto `6543` con `pgbouncer=true`. Es lo que
  evita agotar conexiones; las migraciones usan `DIRECT_URL` (`5432`) automáticamente.
- **Backups**: los backups gestionados los sigue haciendo Supabase. Para una copia propia
  desde el VPS:
  ```bash
  docker run --rm -v /srv/backups:/backup postgres:16-alpine \
    pg_dump "TU_DIRECT_URL" -Fc -f /backup/asset-$(date +%F).dump
  ```

---

## Problemas frecuentes

| Síntoma | Causa probable |
|---|---|
| `502 Bad Gateway` en Nginx | contenedor caído → `docker compose logs api` |
| Muere al arrancar con `P1001` | `DATABASE_URL` apunta al puerto 6543 (pooler de transacciones caído) → usa 5432 |
| Muere al arrancar con `P1012` | valores del `.env` escritos entre comillas |
| `/health` devuelve `db: down` | `DATABASE_URL` mal copiada, o IP del VPS bloqueada en Supabase |
| `column already exists` al migrar | drift de migraciones → paso 5-bis (`migrate resolve --applied`) |
| El front recibe error de CORS | `CORS_ORIGINS` no incluye la URL exacta del front (con https, sin slash final) |
| Login "funciona" pero se pierde la sesión | falta HTTPS o `X-Forwarded-Proto` → la cookie `Secure` no se guarda |
| `prisma migrate deploy` falla al arrancar | `DIRECT_URL` ausente o inválida en `.env` |
| Build lento / sin memoria en un VPS de 1 GB | añade swap: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |
