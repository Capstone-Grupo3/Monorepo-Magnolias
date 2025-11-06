# Configuración de n8n en Render

Este documento proporciona instrucciones paso a paso para desplegar n8n en Render.

## ✅ Pasos de Configuración

### 1. **Conectar Repositorio a Render**

1. Accede a https://dashboard.render.com
2. Haz click en **"New +"** → **"Blueprint"**
3. Selecciona tu repositorio de GitHub (Monorepo-Magnolias)
4. Haz click en **"Connect"**

### 2. **Configurar el Blueprint**

1. En el formulario, completa:
   - **Service Group Name**: `n8n-production`
   - **Branch**: `main` (o la rama que uses)
   - **Root Directory**: dejar vacío (usa la raíz del repo)

2. Haz click en **"Deploy"**

Render automáticamente creará:
- ✅ Base de datos PostgreSQL
- ✅ Web service para n8n
- ✅ Variables de entorno
- ✅ Certificado SSL

### 3. **Variables de Entorno Importantes**

Una vez desplegado, ve a tu servicio n8n en Render y agrega estas variables adicionales:

```
N8N_BASIC_AUTH_ACTIVE = true
N8N_BASIC_AUTH_USER = tu_usuario (ej: admin)
N8N_BASIC_AUTH_PASSWORD = una_contraseña_fuerte
```

### 4. **Configurar URL de Webhook**

1. Copia la URL de tu servicio n8n (ej: https://n8n-xxxxx.onrender.com)
2. Ve a tu backend en Render
3. Actualiza la variable `N8N_WEBHOOK_URL` con la URL de n8n

### 5. **Desplegar Cambios**

El servicio se actualizará automáticamente cuando hagas push a tu rama conectada.

## 📊 Monitoreo

En el dashboard de Render puedes ver:
- **Logs**: Mensajes en tiempo real
- **Metrics**: CPU, memoria, solicitudes
- **Health**: Estado de la aplicación

## 🔄 Redeploy Manual

Si necesitas redeplegar:
1. Ve a tu servicio en Render
2. Click en **"Deploys"**
3. Click en **"Deploy Latest Commit"**

## 🐛 Troubleshooting

### Error: "Database Connection Failed"
- Espera 2-3 minutos después del deploy
- Verifica que la base de datos esté en estado "available"
- Revisa los logs en Render

### Error: "ENOENT: no such file or directory"
- Asegúrate de que todos los archivos (render.yaml, n8n.Dockerfile) estén en la raíz
- Haz push de los cambios nuevamente

### n8n No Inicia
- Revisa los logs en Render
- Verifica las variables de entorno
- Intenta un redeploy manual

## 📝 Actualizar n8n

Para actualizar a una versión más reciente de n8n:

1. Edita `n8n.Dockerfile`:
   ```dockerfile
   FROM n8nio/n8n:latest  # o especifica versión: n8nio/n8n:1.x.x
   ```

2. Haz push de los cambios
3. Render automáticamente redesplegará con la nueva versión

## 💾 Backups

Los datos de n8n se almacenan en PostgreSQL. Render realiza backups automáticos.
Para descargar un backup manual:

1. Ve a tu base de datos PostgreSQL en Render
2. Click en **"Backups"**
3. Descarga el backup deseado

## 🔗 Recursos Útiles

- [Documentación oficial de n8n](https://docs.n8n.io/)
- [Render Documentation](https://render.com/docs)
- [Despliegue con Blueprints](https://render.com/docs/blueprints)
