# Etapa de dependencias
FROM node:25-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Etapa de construcción
FROM node:25-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Etapa de producción
FROM node:25-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copiar archivos necesarios
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3001

CMD ["npm", "start"]
