# Front + API + base de datos, todo en el VPS

Estado de partida: la API ya corre en el VPS (`/srv/asset-app-back`) contra
Supabase, el front está en Vercel y `gestor.techresources360.tech` aún no existe.

Estado final:

```
https://gestor.techresources360.tech/          → front (React) servido por Nginx
https://gestor.techresources360.tech/api/...   → API NestJS (contenedor, :3000)
                                                  ↓
                                          Postgres 17 (contenedor, volumen propio)
```

Mismo origen para front y API ⇒ **no hay CORS** y la cookie de sesión funciona
sin configuración especial. Supabase queda intacto como respaldo.

Los otros tres sitios del VPS (`marcas`, `permisos`, `whatsapp`) no se tocan:
cada paso que roza Nginx valida con `nginx -t` antes de recargar.

---

## 1. DNS en Cloudflare

| Tipo | Nombre | Valor | Proxy |
|---|---|---|---|
| `A` | `gestor` | `2.25.93.154` | **gris (DNS only)** de momento |

La nube gris es necesaria para emitir el certificado. Después puedes activarla.

```bash
dig +short gestor.techresources360.tech      # debe devolver 2.25.93.154
```

---

## 2. Traer los cambios

```bash
cd /srv/asset-app-back
git pull
```

---

## 3. Contraseña de la base de datos local

Tres líneas nuevas en `.env`. La contraseña se genera sola, no la escribes tú:

```bash
cd /srv/asset-app-back
cat >> .env <<EOF

POSTGRES_USER=asset
POSTGRES_PASSWORD=$(openssl rand -hex 24)
POSTGRES_DB=asset_manager
EOF

grep -c POSTGRES .env      # → 3
```

**No** cambies todavía `DATABASE_URL`: el script de migración necesita el de
Supabase para hacer el volcado, y lo reescribe él al terminar.

---

## 4. Migrar los datos de Supabase al VPS

Un solo comando. Volca Supabase, restaura en el contenedor, **compara el número
de filas de cada tabla** y solo si todo coincide reescribe el `.env`:

```bash
./scripts/migrar-supabase-a-vps.sh
```

Qué esperar:

```
▸ Volcando Supabase → /srv/backups/asset-app/supabase-2026....sql
✓ Volcado listo: 1.2M, 43 tablas
✓ Postgres arriba
✓ Restauración terminada
  assets                                  312 filas  ok
  people                                   87 filas  ok
  ...
✓ 43 tablas, todas con el mismo número de filas
✓ .env apuntando al Postgres del VPS (copia previa en .env.supabase-2026...)
✓ Migración completa. La API ya usa la base de datos del VPS.
```

Si algo falla, **no toca el `.env`**: sigues contra Supabase y no pierdes nada.
Para volver atrás en cualquier momento:

```bash
cp .env.supabase-<fecha> .env && docker compose up -d
```

Detalle que resuelve el problema viejo de las migraciones: el volcado incluye la
tabla `_prisma_migrations`, así que el historial llega completo y
`prisma migrate deploy` ya no falla por drift. Por eso `RUN_MIGRATIONS` vuelve
a `"true"` en `docker-compose.yml`.

---

## 5. Respaldos automáticos

Con la base en el VPS ya no hay red de seguridad de Supabase. Esto es obligatorio:

```bash
./scripts/instalar-backup-cron.sh
./scripts/backup-db.sh                 # probar ahora mismo
ls -lh /srv/backups/asset-app/
```

Volcado comprimido diario a las 03:15, 14 días de historial, y verifica que el
archivo esté completo antes de rotar los viejos.

Restaurar un respaldo:

```bash
gzip -dc /srv/backups/asset-app/asset-app-<fecha>.sql.gz | \
  docker compose exec -T db psql -U asset -d asset_manager
```

---

## 6. Compilar y publicar el front

```bash
cd /srv
git clone https://github.com/DevMasterTechR/asset-app-front.git
cd asset-app-front
./deploy-front.sh --no-pull
```

Compila dentro de un contenedor Node (no hace falta instalar Node en el VPS),
deja el resultado en `/srv/asset-app-front/dist` y comprueba que la URL de la
API quedó incrustada en el bundle.

---

## 7. Nginx: front + API en el mismo subdominio

```bash
cd /srv/asset-app-back
DOMAIN=gestor.techresources360.tech

# quita el bloque de la etapa anterior, si quedó
rm -f /etc/nginx/sites-enabled/asset-app-back

sed "s/DOMINIO_AQUI/$DOMAIN/g" nginx/gestor-http.conf \
  > /etc/nginx/sites-available/gestor
ln -sf /etc/nginx/sites-available/gestor /etc/nginx/sites-enabled/

nginx -t          # si NO dice "successful", borra el enlace y no recargues
systemctl reload nginx

# pruebas por HTTP, antes del certificado
curl -s -H "Host: $DOMAIN" http://127.0.0.1/api/health     # → {"status":"ok",...}
curl -sI -H "Host: $DOMAIN" http://127.0.0.1/ | head -3    # → 200 y text/html
```

---

## 8. HTTPS

```bash
certbot --nginx -d gestor.techresources360.tech \
  --agree-tos -m marketing@recursos-tecnologicos.com --redirect -n

nginx -t && systemctl reload nginx
curl -s https://gestor.techresources360.tech/api/health
```

Certbot añade el bloque 443 y la redirección sin tocar los demás sitios.
Después, en Cloudflare puedes volver a la nube naranja con SSL/TLS en
**Full (strict)**.

Renovación (Certbot ya instala el timer):

```bash
systemctl status certbot.timer
certbot renew --dry-run
```

---

## 9. Cerrar la etapa anterior

- Entra a `https://gestor.techresources360.tech`, inicia sesión y comprueba un
  listado y una creación.
- **Rota las credenciales** si no lo has hecho: el `.env` viejo sigue en el
  historial de un repo público (contraseña de Supabase y app password de Gmail).
- Apaga el servicio de Render y el proyecto de Vercel cuando esto lleve unos días
  estable.
- **No borres Supabase todavía**: es tu copia de seguridad de la migración.

---

## Operación diaria

| Qué quieres hacer | Comando |
|---|---|
| Desplegar cambios del back | `cd /srv/asset-app-back && ./deploy.sh` |
| Desplegar cambios del front | `cd /srv/asset-app-front && ./deploy-front.sh` |
| Ver logs de la API | `docker compose logs -f api` |
| Ver logs de Postgres | `docker compose logs -f db` |
| Entrar a la base | `docker compose exec db psql -U asset -d asset_manager` |
| Respaldo manual | `./scripts/backup-db.sh` |
| Estado de todo | `docker compose ps` |

La API ya no depende de Supabase ni de internet para la base de datos: todo
vive en el VPS, en el volumen `asset-app-db-data`.

---

## Problemas conocidos

### `P3009: migrate found failed migrations` al arrancar la API

Pasa si `prisma migrate deploy` intentó aplicar
`20260513000000_add_parent_assignment_id` sobre una base donde la columna ya
existía a mano (era el caso de Supabase). Prisma deja la migración marcada como
**fallida** en `_prisma_migrations` y a partir de ahí se niega a aplicar nada más.
Si el volcado se tomó después de ese intento, la base del VPS hereda el registro.

Se resuelve marcando esa migración como aplicada (la columna ya está, no hay nada
que ejecutar):

```bash
cd /srv/asset-app-back
docker compose run --rm --no-deps --entrypoint sh api -c \
  './node_modules/.bin/prisma migrate resolve --applied 20260513000000_add_parent_assignment_id \
   && ./node_modules/.bin/prisma migrate status'
docker compose up -d
curl -s http://127.0.0.1:3000/health
```

`migrate status` debe terminar en *Database schema is up to date!*.

### El contenedor reinicia en bucle por las migraciones

Para arrancar sin aplicarlas y poder investigar desde dentro:

```bash
RUN_MIGRATIONS=false docker compose up -d
docker compose exec api ./node_modules/.bin/prisma migrate status
```

### Volver a Supabase

La copia del `.env` anterior permite volver atrás, pero **desactivando las
migraciones**: aquel intento fallido sigue registrado en Supabase y daría P3009.

```bash
cp .env.supabase-<fecha> .env
RUN_MIGRATIONS=false docker compose up -d
```
