# 🚀 APT - Advanced People Tracking

Portal de empleo inteligente con IA para optimizar el proceso de reclutamiento y selección de personal en MiPyMEs.

## 📋 Descripción

APT es un sistema integral que conecta empresas con candidatos, utilizando inteligencia artificial para evaluar automáticamente la compatibilidad entre el perfil del candidato y los requisitos de la vacante.

## ⚡ Inicio Rápido con Docker

**¿Quieres ejecutar todo el proyecto en 2 minutos?**

```powershell
# 1. Clonar el repositorio
git clone <url-repo>
cd APT

# 2. Configurar variables de entorno
# Copia los archivos .env.example y configúralos:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Iniciar con Docker
.\start-dev.ps1

# 4. Acceder a:
# - Frontend: http://localhost:3001
# - Backend API: http://localhost:3000/api
# - n8n: http://localhost:5678 (admin/admin123)
```

**Para detener:**
```powershell
.\stop-dev.ps1
```

**📚 Documentación del Proyecto:**
- **[INICIO-RAPIDO.md](./docs-mvp/INICIO-RAPIDO.md)** - ⭐ Guía de inicio en 5 minutos
- **[PRUEBA-END-TO-END.md](./docs-mvp/PRUEBA-END-TO-END.md)** - Guía de pruebas E2E
- **[RESUMEN-FINAL.md](./docs-mvp/RESUMEN-FINAL.md)** - Resumen del proyecto
- **[ARCHITECTURE.md](./frontend/ARCHITECTURE.md)** - Arquitectura del frontend
- **[INTEGRACION-N8N.md](./backend/INTEGRACION-N8N.md)** - Integración con n8n

## 🛠 Stack Tecnológico

### Frontend
- **Next.js 14** (App Router) + React + TypeScript
- **TailwindCSS** + **Lucide Icons** para UI
- Arquitectura modular: types, services, hooks, lib
- Custom Hooks para gestión de estado
- JWT para autenticación

### Backend
- **NestJS** + TypeScript
- **Prisma ORM** (v5.22.0)
- **PostgreSQL** (Supabase)
- **JWT + Bcrypt** para seguridad
- REST API + Swagger

### Inteligencia Artificial (Integrada en n8n)
- **n8n** como orquestador de workflows de IA
- **OpenAI API** para análisis de CVs y respuestas
- Evaluación automática de compatibilidad
- Scoring y feedback inteligente

### Infraestructura
- **Docker** + Docker Compose
- **n8n** para automatización y procesamiento IA
- **Supabase** para base de datos y storage
- **GitHub Actions** para CI/CD

## 🏗 Arquitectura

```
APT/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── modules/           # Módulos de dominio
│   │   ├── auth/              # Autenticación JWT
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma      # Definición de BD
│   │   └── migrations/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .dockerignore
│
├── frontend/                  # Next.js + React
│   ├── src/
│   │   ├── app/               # App Router (páginas)
│   │   ├── components/        # Componentes reutilizables
│   │   ├── types/             # Interfaces TypeScript centralizadas
│   │   ├── services/          # Capa de API (HTTP client)
│   │   ├── hooks/             # Custom hooks (lógica de negocio)
│   │   └── lib/               # Utilidades (formatters, validators)
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── postcss.config.js
│   └── .dockerignore
│
├── docs-mvp/                  # Documentación del proyecto
│   ├── PRUEBA-END-TO-END.md   # Guía de pruebas E2E
│   ├── RESUMEN-FINAL.md       # Resumen del proyecto
│   └── n8n-workflows/         # Workflows exportados de n8n
│       └── evaluacion-ia-completa.json
│
├── docker-compose.mvp.yml     # Stack completo (Backend, Frontend, n8n)
├── start-dev.ps1              # Script de inicio rápido
└── stop-dev.ps1               # Script de detención
```

## 🚀 Instalación

### Prerrequisitos
- Node.js >= 18
- Docker y Docker Compose
- Cuenta en Supabase (base de datos PostgreSQL)
- API Key de OpenAI (para funcionalidad de IA en n8n)

### Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd APT
```

2. **Configurar variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Instalar dependencias**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

4. **Configurar base de datos**
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

5. **Ejecutar con Docker**
```bash
docker-compose up -d
```

## 🔧 Desarrollo

### Opción 1: Con Docker (Recomendado) 🐳

**Todo el stack en un comando:**
```powershell
.\start-dev.ps1
```

Accede a:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- n8n: http://localhost:5678 (admin/admin123)

**Para detener:**
```powershell
.\stop-dev.ps1
```

### Opción 2: Desarrollo Local

#### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
API disponible en: `http://localhost:3000`

#### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

**Estructura del frontend:**
- `src/types/` - Interfaces TypeScript
- `src/services/` - Llamadas a API
- `src/hooks/` - Lógica de negocio
- `src/lib/` - Utilidades
- `src/components/` - Componentes UI
- `src/app/` - Páginas (App Router)

Aplicación disponible en: `http://localhost:3001`

#### n8n (Automatización + IA)

n8n está incluido en el docker-compose y se ejecuta automáticamente con `.\start-dev.ps1`

Para ejecutar n8n de forma independiente:
```bash
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```
n8n disponible en: `http://localhost:5678`

## 📚 Documentación

### Guías de Usuario
- **[INICIO-RAPIDO.md](./docs-mvp/INICIO-RAPIDO.md)** - ⭐ Guía de inicio en 5 minutos
- **[PRUEBA-END-TO-END.md](./docs-mvp/PRUEBA-END-TO-END.md)** - Guía completa de pruebas E2E del sistema

### Documentación Técnica
- **[ARCHITECTURE.md](./frontend/ARCHITECTURE.md)** - Arquitectura modular del frontend
- **[INTEGRACION-N8N.md](./backend/INTEGRACION-N8N.md)** - Documentación de integración con n8n
- **[RESUMEN-FINAL.md](./docs-mvp/RESUMEN-FINAL.md)** - Resumen ejecutivo del proyecto

## 🏛 Arquitectura del Sistema

### Frontend - Arquitectura Modular

El frontend sigue una arquitectura empresarial moderna con clara separación de responsabilidades:

```
frontend/src/
├── types/          # 📦 Interfaces TypeScript centralizadas
│   ├── candidato.types.ts
│   ├── empresa.types.ts
│   ├── vacante.types.ts
│   ├── postulacion.types.ts
│   ├── auth.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── services/       # 🌐 Capa de abstracción de API
│   ├── api.service.ts       # HTTP client base con auth
│   ├── auth.service.ts      # Autenticación
│   ├── candidato.service.ts
│   ├── empresa.service.ts
│   ├── vacante.service.ts
│   └── postulacion.service.ts
│
├── hooks/          # 🎣 Custom hooks (lógica de negocio)
│   ├── useAuth.ts
│   ├── useCandidatoPortal.ts
│   └── useEmpresaDashboard.ts
│
├── lib/            # 🛠 Utilidades y helpers
│   ├── formatters.ts    # Formateo de datos
│   ├── validators.ts    # Validaciones
│   └── constants.ts     # Constantes y enums
│
├── components/     # 🧩 Componentes reutilizables
│   ├── VacanteCard.tsx
│   ├── RankingTable.tsx
│   └── FormularioPostulacion.tsx
│
└── app/            # 📄 Páginas (App Router)
    ├── login/
    ├── candidato/portal/
    └── empresa/dashboard/
```

**Beneficios de esta arquitectura:**
- ✅ **Single Source of Truth**: Tipos centralizados, sin duplicación
- ✅ **Separación de Responsabilidades**: UI, lógica y datos separados
- ✅ **Reutilización**: Hooks y servicios compartidos
- ✅ **Testabilidad**: Servicios y hooks fácilmente mockeables
- ✅ **Mantenibilidad**: Cambios localizados en un solo lugar
- ✅ **Type Safety**: 100% de cobertura TypeScript

📖 **Ver documentación completa:** [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md)

### Backend - API REST con NestJS

- Arquitectura modular por dominio
- Autenticación JWT con guards
- Prisma ORM para gestión de BD
- Swagger para documentación automática
- Endpoints para CRUD de candidatos, empresas, vacantes y postulaciones

### n8n - Orquestación de Workflows e IA

- **Evaluación automática** de postulaciones con OpenAI
- Análisis de CVs y respuestas a preguntas
- Cálculo de puntaje de compatibilidad (0-100)
- Generación de feedback inteligente
- Webhooks para comunicación con backend
- Actualización automática de postulaciones con resultados IA

## 🔑 Características Principales

### Para Empresas
- ✅ Crear y gestionar vacantes
- ✅ Definir preguntas personalizadas
- ✅ Visualizar ranking de candidatos con IA
- ✅ Revisar CVs y respuestas
- ✅ Dashboard analítico

### Para Candidatos
- ✅ Explorar vacantes disponibles
- ✅ Postular con CV y respuestas
- ✅ Seguimiento de postulaciones
- ✅ Feedback automatizado
- ✅ Perfil personalizable

### Inteligencia Artificial
- ✅ Análisis automático de CVs
- ✅ Evaluación de respuestas a preguntas
- ✅ Puntaje de compatibilidad (0-100)
- ✅ Feedback generado por IA
- ✅ Ranking inteligente de candidatos
- ✅ Integración con n8n para procesamiento automático

## 🧪 Testing

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

## 📦 Despliegue

### Producción
- **Frontend**: Vercel
- **Backend**: Render / Railway
- **Base de Datos**: Supabase

### CI/CD
GitHub Actions configurado para:
- Testing automático
- Build y validación
- Despliegue automático a producción

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del Capstone Grupo 3 - 2025.

## 👥 Equipo

Proyecto desarrollado por el equipo de Magnolias Asesorías.

## 📞 Contacto

Para más información, consulta la documentación en la carpeta `docs-mvp/`.

---

## 🚀 Comandos Rápidos

```powershell
# Iniciar todo el sistema
.\start-dev.ps1

# Detener todo el sistema
.\stop-dev.ps1

# Ver logs en tiempo real
docker-compose -f docker-compose.mvp.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.mvp.yml logs -f backend
docker-compose -f docker-compose.mvp.yml logs -f frontend
docker-compose -f docker-compose.mvp.yml logs -f n8n

# Reiniciar un servicio
docker-compose -f docker-compose.mvp.yml restart backend

# Reconstruir y reiniciar
docker-compose -f docker-compose.mvp.yml up -d --build
```
