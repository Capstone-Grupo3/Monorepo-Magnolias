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
   - **Blueprint Path**: `render.yaml` (debería autocompletarse)

2. Haz click en **"Deploy"**

⏳ **Espera 5-10 minutos** mientras Render:
- Crea la base de datos PostgreSQL
- Construye la imagen Docker de n8n
- Despliega los servicios
- Configura SSL automáticamente

### 3. **Verificar el Deploy**

Una vez completado:

1. Ve a tu grupo de servicios en Render
2. Deberías ver 2 servicios:
   - `n8n` (Web service)
   - `n8n-postgres` (PostgreSQL database)
3. Ambos deben estar en estado **"Live"** (verde)

### 4. **Configurar n8n en Render Dashboard**

1. Haz click en el servicio **n8n**
2. Ve a la pestaña **"Environment"**
3. Agrega estas variables de entorno:

```
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=TuContraseñaFuerte123!
```

4. Click en **"Save"** - Render automáticamente redesplegará

### 5. **Obtén tu URL de n8n**

1. En el dashboard de Render, ve a tu servicio **n8n**
2. En la parte superior, copia la URL (ej: `https://n8n-xxxxx.onrender.com`)
3. Guarda esta URL, la necesitarás para webhooks

### 6. **Acceder a n8n por Primera Vez**

1. Abre tu navegador y ve a tu URL de n8n
2. Inicia sesión con las credenciales que configuraste:
   - **Usuario**: admin
   - **Contraseña**: TuContraseñaFuerte123!
3. ¡Listo! n8n está operativo

## 🔗 Conectar con tu Backend

En tu backend (`backend/.env`), configura:

```env
N8N_API_URL=https://n8n-xxxxx.onrender.com
N8N_WEBHOOK_URL=https://n8n-xxxxx.onrender.com/webhook
N8N_API_KEY=generada_en_n8n_settings
```

### Para obtener la API Key de n8n:

1. Inicia sesión en n8n
2. Ve a **Settings** (rueda de engranaje)
3. En la pestaña **API**, copia tu **API Key**
4. Agrega esta clave a tu backend

## 📊 Monitoreo

En el dashboard de Render puedes ver:

- **Logs**: Click en el servicio → pestaña **"Logs"**
- **Metrics**: CPU, memoria, solicitudes
- **Health**: Estado de la aplicación

## 🔄 Redeploy Manual

Si necesitas redeplegar:

1. Ve a tu servicio en Render
2. Click en la pestaña **"Deploys"**
3. Click en **"Deploy Latest Commit"**

O simplemente haz push a tu repositorio y se redesplegará automáticamente.

## 🐛 Troubleshooting

### Error: "Database Connection Failed"

- ✅ Espera 2-3 minutos después del deploy
- ✅ Verifica que ambos servicios estén "Live"
- ✅ Revisa los logs: servicio → "Logs"
- ✅ Intenta un manual redeploy

**Logs para revisar:**
```
Conexión a PostgreSQL...
Running migrations...
```

### Error: "Port already in use" o "EADDRINUSE"

- El puerto 5678 está en uso
- Solución: Haz un redeploy manual

### n8n No Inicia

- Revisa los logs en Render
- Verifica que `N8N_BASIC_AUTH_ACTIVE=true`
- Intenta un redeploy

### Error: "Dockerfile no encontrado"

- Verifica que `n8n.Dockerfile` esté en la raíz
- Revisa que `render.yaml` tenga `dockerfilePath: ./n8n.Dockerfile`
- Haz push de los cambios

## 💾 Backups

Los datos de n8n se almacenan en PostgreSQL. Render realiza backups automáticos cada día.

Para descargar un backup manual:

1. Ve a tu base de datos PostgreSQL en Render
2. Click en la pestaña **"Backups"**
3. Descarga el backup deseado

## 🔐 Seguridad

Recomendaciones de seguridad:

- ✅ Usa una contraseña fuerte para N8N_BASIC_AUTH_PASSWORD
- ✅ No compartas tu API Key
- ✅ Revisa los logs regularmente
- ✅ Actualiza n8n regularmente (ver sección de Actualizaciones)

## 📝 Actualizar n8n

Para actualizar a una versión más reciente de n8n:

1. Edita `n8n.Dockerfile`:
   ```dockerfile
   FROM n8nio/n8n:1.x.x  # Especifica la versión deseada
   ```

2. Haz push de los cambios
   ```bash
   git add n8n.Dockerfile
   git commit -m "chore: Actualizar n8n a versión 1.x.x"
   git push
   ```

3. Render automáticamente redesplegará con la nueva versión

**Últimas versiones de n8n:**
- Visita https://hub.docker.com/r/n8nio/n8n/tags

## 🚀 Workflow de Despliegue

Cada vez que hagas cambios:

```bash
# 1. Haz cambios locales
# 2. Commit y push
git add .
git commit -m "feat: Descripción del cambio"
git push origin main

# 3. Render automáticamente inicia el deploy
# 4. Puedes monitorear en el dashboard
```

## 📞 Recursos Útiles

- [Documentación oficial de n8n](https://docs.n8n.io/)
- [Render Documentation](https://render.com/docs)
- [Despliegue con Blueprints](https://render.com/docs/blueprints)
- [n8n Docker Hub](https://hub.docker.com/r/n8nio/n8n)

## ✅ Checklist Final

Antes de considerar todo listo:

- [ ] ✅ Ambos servicios están "Live" en Render
- [ ] ✅ Puedo acceder a n8n con mi navegador
- [ ] ✅ He cambiado la contraseña por defecto
- [ ] ✅ He generado una API Key
- [ ] ✅ Backend está configurado con N8N_API_URL
- [ ] ✅ Los webhooks de n8n funcionan correctamente
- [ ] ✅ Los logs no muestran errores

Si todo está verde, ¡tu n8n en Render está listo para producción! 🎉
