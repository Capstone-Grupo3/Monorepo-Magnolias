# Etapa de construcción
FROM node:20-slim AS builder

WORKDIR /app

# Instalar OpenSSL y otras dependencias necesarias para el build
RUN apt-get update -y && apt-get install -y openssl ca-certificates wget gnupg --no-install-recommends

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install --production=false

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Construir aplicación
RUN npm run build

# Etapa de producción
FROM node:20-slim

WORKDIR /app

# Instalar OpenSSL, Chromium y librerías necesarias para Puppeteer + Prisma
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libxshmfence1 \
    libpangocairo-1.0-0 \
    libx11-6 \
    libxext6 && \
    rm -rf /var/lib/apt/lists/*

# Variable de entorno para Chromium (usado por puppeteer-core)
ENV CHROME_PATH=/usr/bin/chromium

# Copiar archivos necesarios desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Crear usuario no root
RUN groupadd -g 1001 nodejs && useradd -r -u 1001 -g nodejs nestjs
USER nestjs

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio con memory limit optimizado para producción
CMD ["node", "--max-old-space-size=1024", "dist/main"]
