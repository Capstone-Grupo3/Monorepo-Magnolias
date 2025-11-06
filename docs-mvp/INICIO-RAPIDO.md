# 🚀 Guía de Inicio Rápido - APT

Esta guía te ayudará a tener el sistema APT funcionando en menos de 5 minutos.

## ✅ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- ✅ **Docker Desktop** (Windows/Mac) o **Docker + Docker Compose** (Linux)
- ✅ **Git** para clonar el repositorio
- ✅ Cuenta en **Supabase** (base de datos PostgreSQL)
- ✅ **API Key de OpenAI** (para funcionalidad de IA)

## 📥 Paso 1: Clonar el Repositorio

```powershell
git clone <url-repositorio>
cd APT
```

## ⚙️ Paso 2: Configurar Variables de Entorno

### Backend (.env)

Copia el archivo de ejemplo:
```powershell
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus credenciales:
```env
# Base de datos Supabase
DATABASE_URL="postgresql://usuario:password@host:5432/database?schema=public"

# JWT
JWT_SECRET="tu-secret-key-muy-seguro-aqui"

# Puerto
PORT=3000
```

### Frontend (.env.local)

Copia el archivo de ejemplo:
```powershell
cp frontend/.env.example frontend/.env.local
```

Edita `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🐳 Paso 3: Iniciar con Docker

Ejecuta el script de inicio:

```powershell
.\start-dev.ps1
```

Este script hará:
1. ✅ Verificar que Docker esté corriendo
2. ✅ Validar archivos de configuración
3. ✅ Construir las imágenes Docker
4. ✅ Iniciar todos los servicios

## 🌐 Paso 4: Acceder a los Servicios

Una vez iniciado, podrás acceder a:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| 🌐 **Frontend** | http://localhost:3001 | - |
| 🔧 **Backend API** | http://localhost:3000 | - |
| 📚 **API Docs (Swagger)** | http://localhost:3000/api | - |
| 🤖 **n8n** | http://localhost:5678 | admin / admin123 |

## 🔧 Paso 5: Configurar n8n (Primera vez)

1. Accede a http://localhost:5678
2. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: `admin123`
3. Importa el workflow:
   - Click en **"Import from File"**
   - Selecciona: `docs-mvp/n8n-workflows/evaluacion-ia-completa.json`
4. Configura tu API Key de OpenAI:
   - Click en el nodo de OpenAI
   - Agrega tu API Key
5. Activa el workflow

## ✅ Verificación

Para verificar que todo funciona:

1. **Frontend**: Abre http://localhost:3001 - Deberías ver la página de login
2. **Backend**: Abre http://localhost:3000/api - Deberías ver Swagger
3. **n8n**: Abre http://localhost:5678 - Deberías ver el dashboard

## 🧪 Prueba E2E

Sigue la guía de pruebas completa: [PRUEBA-END-TO-END.md](./PRUEBA-END-TO-END.md)

### Flujo de Prueba Rápido:

1. **Crear Empresa** (desde Swagger o frontend)
2. **Login como Empresa** → http://localhost:3001/login
3. **Crear Vacante** con preguntas personalizadas
4. **Crear Candidato** (desde Swagger o frontend)
5. **Login como Candidato** → http://localhost:3001/login
6. **Postular a la vacante** con CV y respuestas
7. **Verificar evaluación IA** en n8n (debería ejecutarse automáticamente)
8. **Ver resultados** en el dashboard de empresa

## 🛑 Detener el Sistema

Para detener todos los servicios:

```powershell
.\stop-dev.ps1
```

## 📊 Comandos Útiles

### Ver logs en tiempo real
```powershell
docker-compose -f docker-compose.mvp.yml logs -f
```

### Ver logs de un servicio específico
```powershell
docker-compose -f docker-compose.mvp.yml logs -f backend
docker-compose -f docker-compose.mvp.yml logs -f frontend
docker-compose -f docker-compose.mvp.yml logs -f n8n
```

### Reiniciar un servicio
```powershell
docker-compose -f docker-compose.mvp.yml restart backend
```

### Reconstruir y reiniciar
```powershell
docker-compose -f docker-compose.mvp.yml up -d --build
```

### Eliminar todo (incluidos volúmenes)
```powershell
docker-compose -f docker-compose.mvp.yml down -v
```

## ❓ Problemas Comunes

### Error: "Docker no está corriendo"
**Solución**: Inicia Docker Desktop y espera a que esté completamente iniciado.

### Error: "Puerto ya en uso"
**Solución**: Verifica que no tengas otros servicios corriendo en los puertos 3000, 3001, o 5678.

```powershell
# Windows - Ver qué está usando un puerto
netstat -ano | findstr :3000
```

### Error: "Cannot connect to database"
**Solución**: Verifica que tus credenciales de Supabase en `backend/.env` sean correctas.

### n8n no guarda el workflow
**Solución**: Asegúrate de activar el workflow después de importarlo (toggle en la parte superior).

## 📚 Documentación Adicional

- [RESUMEN-FINAL.md](./RESUMEN-FINAL.md) - Resumen del proyecto completo
- [frontend/ARCHITECTURE.md](../frontend/ARCHITECTURE.md) - Arquitectura del frontend
- [backend/INTEGRACION-N8N.md](../backend/INTEGRACION-N8N.md) - Integración con n8n

## 🎉 ¡Listo!

Ahora tienes APT corriendo localmente. ¡Feliz desarrollo! 🚀
