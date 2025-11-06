# Configuración Post-Deploy de n8n en Render

Después de que Render termine el deploy automático, sigue estos pasos manuales.

## ✅ Paso 1: Verificar el Deploy

1. Ve a tu grupo de servicios en Render (n8n-production)
2. Deberías ver 2 servicios:
   - `n8n-postgres` (Estado: Live)
   - `n8n` (Estado: Live o Building)

Espera a que ambos estén en estado **"Live"** (verde)

## ✅ Paso 2: Verificar Logs de n8n

1. Click en el servicio **n8n**
2. Ve a la pestaña **"Logs"**
3. Si ves errores como "Could not connect to database", espera 2-3 minutos más
4. Deberías ver eventualmente:
   ```
   n8n ready on 0.0.0.0, port 5678
   ```

## ✅ Paso 3: Configurar Variables de Entorno Adicionales

1. Click en el servicio **n8n**
2. Ve a la pestaña **"Environment"**
3. Agrega estas variables:

```
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=TuContraseñaFuerte123!
```

4. Click en **"Save"**
5. Render redesplegará automáticamente

## ✅ Paso 4: Acceder a n8n

1. Ve al servicio **n8n** en Render
2. En la parte superior, copia la URL (ej: `https://n8n-xxxxx.onrender.com`)
3. Abre en tu navegador
4. Inicia sesión con:
   - **Usuario**: admin
   - **Contraseña**: TuContraseñaFuerte123!

¡Listo! n8n está operativo.

## � Conectar con tu Backend

En tu archivo `backend/.env`, agrega:

```env
N8N_API_URL=https://n8n-xxxxx.onrender.com
N8N_WEBHOOK_URL=https://n8n-xxxxx.onrender.com/webhook
```

Luego genera una API Key en n8n:
1. Inicia sesión en n8n
2. Ve a **Settings** (rueda de engranaje)
3. En la pestaña **API**, copia tu **API Key**
4. Agrega a tu backend:
```env
N8N_API_KEY=tu_clave_copiada
```

## 🐛 Troubleshooting

### n8n no inicia o se reinicia constantemente
- Revisa los logs en Render
- Espera 3-5 minutos después del deploy
- Si persiste, intenta un manual redeploy

### Error de conexión a base de datos
- Verifica que ambos servicios estén "Live"
- Revisa los logs del servicio n8n
- El connection string se genera automáticamente

### No puedo acceder a n8n
- Verifica que hayas esperado a que sea "Live"
- Intenta recargar la página
- Limpia caché del navegador

