# Configuración Post-Deploy de n8n en Render

Después de que Render termine el deploy automático, sigue estos pasos manuales.

## ✅ Paso 1: Configurar la Base de Datos

1. Ve a tu servicio **n8n-postgres** en Render
2. Copia los siguientes datos de la pestaña **"Info"**:
   - **Internal Database URL**
   - **Database Name**
   - **Username**
   - **Password**

Guarda estos valores, los usarás en el paso siguiente.

## ✅ Paso 2: Agregar Variables de Entorno a n8n

1. Ve a tu servicio **n8n** en Render
2. Click en la pestaña **"Environment"**
3. Agrega estas variables (reemplaza los valores con los de tu BD):

```
DB_POSTGRESDB_HOST=<host_de_tu_base_de_datos>
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=render
DB_POSTGRESDB_USER=<tu_usuario>
DB_POSTGRESDB_PASSWORD=<tu_contraseña>
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=TuContraseñaFuerte123!
N8N_HOST=tu-n8n.onrender.com
WEBHOOK_URL=https://tu-n8n.onrender.com/
```

4. Click en **"Save"**
5. Render redesplegará automáticamente

## ✅ Paso 3: Verificar que n8n Inicie Correctamente

1. Ve a la pestaña **"Logs"** de tu servicio n8n
2. Espera a que veas este mensaje:
   ```
   n8n ready on 0.0.0.0, port 5678
   ```
3. Si ves errores de conexión a la BD, revisa que los datos sean correctos

## ✅ Paso 4: Acceder a n8n

1. Copia la URL de tu servicio n8n (ej: `https://n8n-xxxxx.onrender.com`)
2. Abre en tu navegador
3. Inicia sesión con:
   - **Usuario**: admin
   - **Contraseña**: TuContraseñaFuerte123!

¡Listo! n8n está operativo.

## 📝 Notas Importantes

- **BD automática**: Render crea automáticamente un usuario y BD para PostgreSQL
- **Contraseña segura**: Guarda tu contraseña de n8n en un lugar seguro
- **Cambiar contraseña**: Una vez dentro de n8n, ve a Settings para cambiarla
