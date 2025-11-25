# Guía de Inicio Rápido - Frontend Hergon

## Inicialización del Proyecto

### Paso 1: Ejecutar Script de Inicialización

Desde la raíz del repositorio, ejecutar:

```bash
./init-frontend.sh
```

Este script automáticamente:
- ✅ Crea la estructura de directorios
- ✅ Instala todas las dependencias (React 19, TypeScript, etc.)
- ✅ Configura Vite, Tailwind CSS, ESLint, Prettier
- ✅ Crea archivos de configuración
- ✅ Genera aplicación base funcional

**Tiempo estimado:** 3-5 minutos (dependiendo de velocidad de internet)

### Paso 2: Configurar Variables de Entorno

```bash
cd app
cp .env.example .env.development
```

Editar `.env.development` con tus credenciales:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000
VITE_AZURE_CLIENT_ID=tu-client-id-de-azure
VITE_AZURE_TENANT_ID=common
```

**Nota:** Para desarrollo local, puedes usar valores dummy si el backend no está disponible aún.

### Paso 3: Iniciar Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

Deberías ver una pantalla de bienvenida con:
- Logo de Hergon
- Mensaje de inicialización exitosa
- Lista de tecnologías configuradas

---

## Verificación de Instalación

### Verificar que todo funciona:

```bash
# 1. Tests unitarios
npm test

# 2. Linting
npm run lint

# 3. Formateo
npm run format

# 4. Build de producción
npm run build

# 5. Preview del build
npm run preview
```

Si todos los comandos se ejecutan sin errores, ¡la instalación fue exitosa! ✅

---

## Próximos Pasos de Desarrollo

### Phase 1: Setup Base (Semana 1)

#### 1. Instalar shadcn/ui Components

shadcn/ui NO es un paquete npm, se instala copiando componentes:

```bash
# Opcional: Usar CLI de shadcn/ui (recomendado)
npx shadcn@latest init

# O copiar componentes manualmente desde:
# https://ui.shadcn.com/docs/components
```

Componentes esenciales para empezar:
- `button` - Botones
- `card` - Tarjetas
- `dialog` - Modales
- `form` - Formularios
- `table` - Tablas
- `toast` - Notificaciones
- `dropdown-menu` - Menús desplegables
- `select` - Selectores
- `input` - Campos de texto

Instalar todos de una vez:

```bash
npx shadcn@latest add button card dialog form table toast dropdown-menu select input label badge avatar tabs sheet
```

#### 2. Crear Utilidades Base

**`src/lib/utils/cn.ts`** - Utility para merge de clases Tailwind:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**`src/lib/utils/format.ts`** - Formateo de fechas y números:

```typescript
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatDate = (date: Date | string) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
}

export const formatRelativeTime = (date: Date | string) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('es-MX').format(num)
}
```

#### 3. Configurar API Client

**`src/lib/api/client.ts`** - Axios configurado:

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (agregar token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor (manejo de errores)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

#### 4. Configurar Zustand Store

**`src/stores/appStore.ts`** - Global app state:

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'AFORE_ADMIN' | 'AFORE_ANALYST' | 'SYSTEM_ADMIN' | 'AUDITOR'
}

interface Tenant {
  id: string
  name: string
  logo?: string
}

interface AppState {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setTenant: (tenant: Tenant) => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        tenant: null,
        isAuthenticated: false,
        setUser: (user) => set({ user, isAuthenticated: true }),
        setTenant: (tenant) => set({ tenant }),
        logout: () => set({ user: null, tenant: null, isAuthenticated: false })
      }),
      {
        name: 'app-store'
      }
    )
  )
)
```

#### 5. Configurar Azure AD (MSAL)

**`src/lib/auth/msalConfig.ts`**:

```typescript
import { Configuration, PublicClientApplication } from '@azure/msal-browser'

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
}

export const msalInstance = new PublicClientApplication(msalConfig)

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email']
}
```

#### 6. Setup Routing

**`src/app/router.tsx`** - React Router 7 setup:

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootLayout from './layout'
import LoginPage from './auth/login'
import DashboardPage from './_auth/dashboard/page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'app',
        element: <AuthGuard />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />
          }
          // Más rutas aquí
        ]
      }
    ]
  }
])
```

---

### Phase 2: Implementar Módulo 1 - Dashboard (Semana 2-3)

Ver archivo de arquitectura: `docs/ARQUITECTURA_FRONTEND_2024-2026.md` sección 4.1

Tareas principales:
1. ✅ Crear layout principal (Header, Sidebar, Footer)
2. ✅ Implementar autenticación con Azure AD
3. ✅ Dashboard con métricas en tiempo real
4. ✅ Gráficas con Recharts/Tremor
5. ✅ Activity feed con SignalR
6. ✅ Sistema de notificaciones

---

## Comandos Útiles

### Desarrollo
```bash
npm run dev              # Servidor desarrollo (hot reload)
npm run build            # Build producción
npm run preview          # Preview build local
```

### Testing
```bash
npm test                 # Tests unitarios (watch mode)
npm run test:ui          # Tests con UI de Vitest
npm run test:e2e         # Tests E2E con Playwright
```

### Calidad de Código
```bash
npm run lint             # Ejecutar ESLint
npm run format           # Formatear con Prettier
```

### Instalación de Componentes
```bash
npx shadcn@latest add <component>  # Agregar componente shadcn/ui
```

---

## Troubleshooting

### Error: "Cannot find module '@/...'"

**Solución:** Verificar que `tsconfig.json` tiene configurado el path alias:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Error: Tailwind classes no aplican

**Solución:** Verificar que `src/index.css` tiene las directivas:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Error: React DevTools no detecta la app

**Solución:** Instalar extensión React DevTools en Chrome/Firefox.

### Puerto 3000 ya en uso

**Solución:** Cambiar puerto en `vite.config.ts`:

```typescript
server: {
  port: 3001, // Cambiar aquí
}
```

---

## Recursos Adicionales

### Documentación
- [React 19 Docs](https://react.dev)
- [Vite Docs](https://vite.dev)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand.docs.pmnd.rs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

### Ejemplos de Código
- [TanStack Query Examples](https://tanstack.com/query/latest/docs/framework/react/examples)
- [shadcn/ui Examples](https://ui.shadcn.com/examples)

### Comunidad
- [React Discord](https://discord.gg/react)
- [Vite Discord](https://chat.vite.dev)

---

## Soporte

Para preguntas o issues:
1. Revisar documentación en `docs/ARQUITECTURA_FRONTEND_2024-2026.md`
2. Buscar en issues del proyecto
3. Contactar al equipo de desarrollo

---

**¡Feliz desarrollo! 🚀**
