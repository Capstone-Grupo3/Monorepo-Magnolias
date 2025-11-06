# Arquitectura del Frontend - APT

## 📁 Estructura del Proyecto

```
frontend/src/
├── app/                    # Páginas Next.js 14 (App Router)
│   ├── candidato/          # Portal de candidatos
│   ├── empresa/            # Dashboard de empresas
│   ├── login/              # Página de login
│   └── registro/           # Página de registro
│
├── components/             # Componentes React reutilizables
│   ├── VacanteCard.tsx     # Tarjeta de vacante
│   ├── RankingTable.tsx    # Tabla de ranking de candidatos
│   └── FormularioPostulacion.tsx  # Formulario de postulación
│
├── types/                  # 🆕 Tipos TypeScript centralizados
│   ├── candidato.types.ts  # Interfaces de candidatos
│   ├── empresa.types.ts    # Interfaces de empresas
│   ├── vacante.types.ts    # Interfaces de vacantes
│   ├── postulacion.types.ts # Interfaces de postulaciones
│   ├── auth.types.ts       # Interfaces de autenticación
│   ├── common.types.ts     # Tipos comunes (ApiResponse, etc.)
│   └── index.ts            # Exports centralizados
│
├── services/               # 🆕 Capa de servicios (API calls)
│   ├── api.service.ts      # Cliente HTTP base
│   ├── auth.service.ts     # Servicio de autenticación
│   ├── candidato.service.ts # Servicio de candidatos
│   ├── empresa.service.ts  # Servicio de empresas
│   ├── vacante.service.ts  # Servicio de vacantes
│   └── postulacion.service.ts # Servicio de postulaciones
│
├── hooks/                  # 🆕 Custom React Hooks
│   ├── useAuth.ts          # Hook de autenticación
│   ├── useCandidatoPortal.ts # Hook para portal de candidato
│   └── useEmpresaDashboard.ts # Hook para dashboard de empresa
│
└── lib/                    # 🆕 Utilidades y helpers
    ├── constants.ts        # Constantes de la aplicación
    ├── formatters.ts       # Funciones de formateo
    └── validators.ts       # Funciones de validación
```

## 🔧 Componentes Principales

### 1. **Types (src/types/)**

Contiene todas las interfaces y tipos TypeScript del proyecto.

**Ventajas:**
- ✅ Single source of truth para estructuras de datos
- ✅ Autocompletado mejorado en todo el proyecto
- ✅ Fácil mantenimiento y actualización de tipos
- ✅ Reutilización sin duplicación

**Ejemplo de uso:**
```typescript
import { Candidato, Vacante, Postulacion } from '@/types';
```

### 2. **Services (src/services/)**

Capa de abstracción para todas las peticiones HTTP al backend.

**api.service.ts** - Cliente HTTP base:
- Manejo centralizado de tokens
- Headers automáticos con autenticación
- Manejo de errores consistente
- Redirección automática en 401
- Soporte para FormData (archivos)

**Ejemplo de uso:**
```typescript
import { candidatoService } from '@/services/candidato.service';

const perfil = await candidatoService.getCandidatoProfile(id);
```

**Ventajas:**
- ✅ No más `fetch()` repetido en componentes
- ✅ Manejo de errores centralizado
- ✅ Fácil de mockear para testing
- ✅ Cambios de API en un solo lugar

### 3. **Hooks (src/hooks/)**

Custom hooks que encapsulan lógica de negocio y estado.

**useAuth.ts:**
```typescript
const { loginEmpresa, loginCandidato, logout, loading, error } = useAuth();
```

**useCandidatoPortal.ts:**
```typescript
const { 
  candidato, 
  vacantes, 
  postulaciones, 
  loading, 
  refresh, 
  logout 
} = useCandidatoPortal();
```

**Ventajas:**
- ✅ Componentes más limpios y enfocados en UI
- ✅ Lógica reutilizable entre páginas
- ✅ Testing más fácil
- ✅ Separación de concerns

### 4. **Lib (src/lib/)**

Funciones utilitarias puras y constantes.

**formatters.ts:**
```typescript
import { formatDate, formatCurrency, getEstadoColor } from '@/lib/formatters';

const fecha = formatDate('2025-01-08');  // "8 de enero de 2025"
const precio = formatCurrency(500000);  // "$500.000 CLP"
const color = getEstadoColor('PENDIENTE');  // "bg-yellow-100 text-yellow-800"
```

**validators.ts:**
```typescript
import { validateEmail, validateCvFile } from '@/lib/validators';

const isValid = validateEmail('test@example.com');
const fileValidation = validateCvFile(file);
```

**constants.ts:**
```typescript
import { TIPO_CONTRATO_OPTIONS, CV_ALLOWED_TYPES } from '@/lib/constants';
```

## 🚀 Beneficios de la Nueva Arquitectura

### 1. **Mantenibilidad**
- Código organizado por responsabilidad
- Fácil de encontrar y modificar funcionalidad
- Cambios aislados sin efectos colaterales

### 2. **Escalabilidad**
- Agregar nuevas funcionalidades es más simple
- Estructura clara para nuevos desarrolladores
- Reutilización de código maximizada

### 3. **Type Safety**
- TypeScript aprovechado al máximo
- Menos errores en tiempo de ejecución
- Autocompletado en toda la aplicación

### 4. **Testing**
- Servicios fáciles de mockear
- Hooks testeables de forma aislada
- Funciones puras en lib/

### 5. **Performance**
- Custom hooks evitan re-renders innecesarios
- Carga de datos optimizada
- Código más eficiente

## 📝 Ejemplo de Refactorización

### ❌ Antes (código inline):
```typescript
// Interfaces inline
interface Candidato {
  id: number;
  nombre: string;
  // ...
}

// fetch() repetido
const response = await fetch(`${API_URL}/candidatos/me`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

// Formateo inline
const fecha = new Date(postulacion.fecha).toLocaleDateString('es-CL');
```

### ✅ Después (arquitectura modular):
```typescript
// Tipos importados
import { Candidato } from '@/types';

// Servicio
import { candidatoService } from '@/services/candidato.service';

// Hook personalizado
import { useCandidatoPortal } from '@/hooks/useCandidatoPortal';

// Formateo con función
import { formatDate } from '@/lib/formatters';

// Uso simple
const { candidato, loading } = useCandidatoPortal();
const fecha = formatDate(postulacion.fecha);
```

## 🔄 Flujo de Datos

```
Component
    ↓ usa
Custom Hook (useAuth, useCandidatoPortal, etc.)
    ↓ llama
Service (candidatoService, vacanteService, etc.)
    ↓ usa
API Service (cliente HTTP base)
    ↓ fetch
Backend API
```

## 📚 Guía de Uso

### Agregar un nuevo endpoint

1. **Definir el tipo en `types/`:**
```typescript
// types/nuevaEntidad.types.ts
export interface NuevaEntidad {
  id: number;
  nombre: string;
}
```

2. **Crear servicio en `services/`:**
```typescript
// services/nuevaEntidad.service.ts
class NuevaEntidadService {
  async getById(id: number): Promise<NuevaEntidad> {
    return apiService.get(`/nueva-entidad/${id}`);
  }
}

export const nuevaEntidadService = new NuevaEntidadService();
```

3. **Usar en componente:**
```typescript
import { nuevaEntidadService } from '@/services/nuevaEntidad.service';

const data = await nuevaEntidadService.getById(1);
```

### Crear un nuevo hook

```typescript
// hooks/useNuevaFuncionalidad.ts
export function useNuevaFuncionalidad() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await nuevaEntidadService.getById(1);
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { data, loading, refresh: loadData };
}
```

## ⚡ Próximos Pasos

- [ ] Refactorizar `empresa/dashboard/page.tsx` con `useEmpresaDashboard`
- [ ] Agregar tests unitarios para servicios
- [ ] Agregar tests para custom hooks
- [ ] Implementar manejo de caché con React Query
- [ ] Agregar middleware de logging
- [ ] Implementar paginación en servicios

## 🐛 Troubleshooting

### Error: "Cannot find module '@/types'"

Asegúrate que `tsconfig.json` tenga la configuración de paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Error: "Module not found"

Reinicia el servidor de desarrollo:
```bash
npm run dev
```

---

**Fecha de última actualización:** 08/01/2025  
**Autor:** GitHub Copilot Agent  
**Versión:** 2.0.0
