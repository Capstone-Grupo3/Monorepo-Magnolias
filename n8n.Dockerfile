FROM n8nio/n8n:latest

# Instalar dependencias adicionales si es necesario
RUN npm install -g npm@latest

# Exponer el puerto
EXPOSE 5678

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5678/healthz', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando por defecto
CMD ["n8n"]
