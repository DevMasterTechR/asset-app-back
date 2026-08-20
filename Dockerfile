# ============================================================
# asset-app-back — imagen de producción para VPS
# Base de datos: Postgres en Supabase (externa, no se contiene aquí)
# ============================================================

# ---------- Stage 1: build ----------
FROM node:22-bookworm-slim AS builder

# openssl es requerido por los engines de Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl ca-certificates python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /app

# Dependencias (capa cacheable). prisma/ se copia antes porque
# el postinstall del proyecto ejecuta `prisma generate`.
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile --prod=false

# Código fuente y compilación (nest build + prisma generate)
COPY . .
RUN pnpm run build

# ---------- Stage 2: runtime ----------
FROM node:22-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends \
        openssl ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Se copia el árbol completo (incluye node_modules con el cliente Prisma
# ya generado y el CLI de prisma, necesario para `migrate deploy`).
COPY --from=builder --chown=node:node /app ./

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
