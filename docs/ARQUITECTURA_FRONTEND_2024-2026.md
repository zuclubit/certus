# Arquitectura Frontend - Sistema de Validación CONSAR
## Hergon Vector 1.0 | 2024-2026

**Fecha:** 2025-01-22
**Versión:** 1.0.0
**Estado:** In Design

---

## 1. Visión General

### 1.1 Propósito
Diseño e implementación de una aplicación frontend moderna, escalable y de alto rendimiento para el Sistema de Validación CONSAR, siguiendo las mejores prácticas de la industria para 2024-2026.

### 1.2 Alcance
- **Aplicación Web SPA** (Single Page Application) para usuarios AFORE
- **Panel de Administración** para configuración de sistema
- **Dashboard en Tiempo Real** para monitoreo de validaciones
- **Sistema de Reportes** con visualizaciones avanzadas
- **Multi-tenancy** con aislamiento completo por AFORE

### 1.3 Usuarios Objetivo
1. **AFORE Admin** - Gestión completa de su organización
2. **AFORE Analyst** - Carga de archivos, revisión de resultados
3. **System Admin** - Configuración global, gestión de catálogos
4. **Auditor** - Acceso de solo lectura a auditorías y reportes

---

## 2. Stack Tecnológico 2024-2026

### 2.1 Framework Core
**React 19.0.0** (Stable release Dec 2024)
- **React Compiler** (formerly React Forget) - Auto-optimización de rendimiento
- **Server Components** - Para componentes sin interactividad (dashboards estáticos)
- **Actions & Forms** - `useActionState`, `useFormStatus` para manejo declarativo de forms
- **use API** - Para suspense y streaming de datos
- **Concurrent Rendering** - Para UIs fluidas sin bloqueos

**Justificación:**
- React Compiler elimina necesidad de `useMemo`, `useCallback` manual
- Server Components reducen bundle JavaScript hasta 40%
- Actions simplifican manejo de formularios complejos
- Ecosistema maduro con 20M+ descargas semanales

### 2.2 Meta-Framework
**Vite 6.0 + React Router 7.0** (SPA Mode)
- **No Next.js** - Evitamos vendor lock-in de Vercel
- **Vite** - Build ultrarrápido (<2s HMR), mejor DX
- **React Router 7** - Data loading, nested routes, actions
- **SWC** - Transpilador Rust para builds 70x más rápidos que Babel

**Alternativa considerada:** Next.js 15 (descartado por complejidad innecesaria para SPA)

### 2.3 TypeScript 5.7+
- **Strict Mode** habilitado por defecto
- **Template Literal Types** para rutas tipadas
- **Variadic Tuple Types** para hooks reutilizables
- **Unknown** en lugar de `any` para mayor seguridad
- **Zod** para validación runtime y type inference

### 2.4 State Management

#### 2.4.1 Client State: Zustand 5.0
```typescript
// Store minimalista, sin boilerplate
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppStore {
  user: User | null
  tenant: Tenant | null
  setUser: (user: User) => void
}

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        tenant: null,
        setUser: (user) => set({ user })
      }),
      { name: 'app-store' }
    )
  )
)
```

**Por qué Zustand:**
- 1.8KB gzipped vs 12KB Redux Toolkit
- Sintaxis simple, curva de aprendizaje mínima
- DevTools incluido
- Excelente rendimiento (no causa re-renders innecesarios)

#### 2.4.2 Server State: TanStack Query v5
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Cache inteligente, re-fetch automático, optimistic updates
const { data, isLoading, error } = useQuery({
  queryKey: ['validations', fileId],
  queryFn: () => api.getValidation(fileId),
  staleTime: 5 * 60 * 1000, // 5 min
  gcTime: 10 * 60 * 1000 // 10 min
})
```

**Características clave:**
- Cache con TTL configurable
- Background refetching
- Optimistic updates para UX instantánea
- DevTools para debugging
- Infinite queries para tablas virtualizadas

### 2.5 UI Components & Styling

#### 2.5.1 Tailwind CSS 4.0 Alpha
- **Nueva engine Oxide** (escrita en Rust, 10x más rápida)
- **CSS-first configuration** sin `tailwind.config.js`
- **Container queries** nativas
- **Arbitrary variants** para mayor flexibilidad

```css
/* @theme inline en CSS */
@theme {
  --color-primary: #0066FF;
  --color-success: #00D4AA;
}
```

#### 2.5.2 shadcn/ui + Radix UI
**shadcn/ui** - Copy-paste components, NO npm package
- Ownership completo del código
- Customización total sin eject
- Basado en Radix UI (accessibility-first)
- 50+ componentes listos para producción

**Componentes clave:**
- `Dialog`, `Sheet`, `Popover` - Modales accesibles
- `Table` con sorting, filtering, pagination
- `Form` integrado con React Hook Form + Zod
- `Command` palette para navegación rápida
- `Toast` para notificaciones
- `Calendar`, `DatePicker` para fechas
- `Select`, `Combobox` con búsqueda
- `DataTable` virtualizado con TanStack Table

**Nota:** Radix UI en mantenimiento, pero shadcn/ui activamente desarrollado.

### 2.6 Forms & Validation
**React Hook Form 7.53 + Zod 3.24**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  fileName: z.string().min(1, 'Requerido'),
  type: z.enum(['NOMINA', 'CONTABLE', 'REGULARIZACION'])
})

const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange' // Validación en tiempo real
})
```

**Ventajas:**
- 0 re-renders innecesarios
- Validación runtime + TypeScript types automáticos
- Error messages en español configurables
- Integración perfecta con shadcn/ui Form

### 2.7 Data Visualization
**Recharts 2.13 + Tremor 3.18**
- **Recharts** - Gráficas D3 sin complejidad
- **Tremor** - Dashboard components pre-diseñados

```typescript
import { Card, AreaChart, BarList } from '@tremor/react'

<Card>
  <AreaChart
    data={validationData}
    index="date"
    categories={["success", "error"]}
    colors={["emerald", "red"]}
    valueFormatter={(v) => `${v} archivos`}
  />
</Card>
```

### 2.8 Real-time Updates
**Microsoft SignalR Client 8.0**
```typescript
import * as signalR from '@microsoft/signalr'

const connection = new signalR.HubConnectionBuilder()
  .withUrl('/api/validationHub', {
    accessTokenFactory: () => getAccessToken()
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000])
  .configureLogging(signalR.LogLevel.Information)
  .build()

connection.on('ValidationCompleted', (data) => {
  queryClient.invalidateQueries(['validations'])
  toast.success(`Validación completada: ${data.fileName}`)
})
```

### 2.9 Tables & Virtualization
**TanStack Table v8 + TanStack Virtual v3**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// Solo renderiza filas visibles (60 FPS con 100K rows)
const virtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
  overscan: 10 // Pre-render 10 filas extras
})
```

**Casos de uso:**
- Tabla de validaciones (10K+ registros)
- Logs de auditoría (100K+ eventos)
- Catálogos CONSAR (50K+ códigos)

### 2.10 Testing
- **Vitest 3.0** - Test runner compatible con Vite
- **React Testing Library 16** - Testing centrado en usuario
- **Playwright 1.50** - E2E tests
- **MSW 2.7** - Mock Service Worker para API mocking

---

## 3. Arquitectura de Aplicación

### 3.1 Estructura de Proyecto
```
/app
├── public/                  # Assets estáticos
│   ├── fonts/              # Inter, JetBrains Mono
│   └── images/             # Logos, iconos
│
├── src/
│   ├── app/                # React Router 7 routes
│   │   ├── _layout.tsx    # Layout principal
│   │   ├── _auth/         # Rutas protegidas
│   │   │   ├── dashboard/
│   │   │   ├── validations/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   └── auth/          # Login, register
│   │
│   ├── components/         # Componentes reutilizables
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Header, Sidebar, Footer
│   │   ├── forms/         # Form components
│   │   ├── tables/        # DataTable components
│   │   └── charts/        # Chart wrappers
│   │
│   ├── features/          # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api.ts
│   │   │   └── store.ts
│   │   ├── validations/
│   │   ├── reports/
│   │   └── catalogs/
│   │
│   ├── lib/               # Utilities
│   │   ├── api/          # API client (axios)
│   │   ├── auth/         # Azure AD MSAL
│   │   ├── utils/        # Helpers
│   │   └── constants/    # Constants
│   │
│   ├── hooks/            # Custom hooks globales
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   └── main.tsx          # Entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.development
├── .env.production
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 3.2 Patrón Feature-Sliced Design
Organización por **features** en lugar de tipo de archivo:

```
features/validations/
├── components/
│   ├── ValidationCard.tsx
│   ├── ValidationTable.tsx
│   └── ValidationDetails.tsx
├── hooks/
│   ├── useValidations.ts
│   └── useValidationActions.ts
├── api.ts              # API endpoints
├── types.ts            # TypeScript types
├── store.ts            # Zustand slice (opcional)
└── index.ts            # Public exports
```

**Ventajas:**
- Cohesión alta, acoplamiento bajo
- Fácil de escalar (agregar features sin tocar existentes)
- Tests cercanos al código

### 3.3 Routing Structure
```typescript
// React Router 7 - Type-safe routes
{
  path: '/',
  element: <RootLayout />,
  children: [
    { path: 'login', element: <LoginPage /> },
    {
      path: 'app',
      element: <AuthGuard />,
      children: [
        { index: true, element: <Navigate to="/app/dashboard" /> },
        { path: 'dashboard', element: <DashboardPage /> },
        {
          path: 'validations',
          children: [
            { index: true, element: <ValidationListPage /> },
            { path: ':id', element: <ValidationDetailPage /> }
          ]
        },
        { path: 'reports', element: <ReportsPage /> },
        { path: 'catalogs', element: <CatalogsPage /> },
        { path: 'settings', element: <SettingsPage /> }
      ]
    }
  ]
}
```

---

## 4. Módulos de Aplicación

### 4.1 Módulo 1: Autenticación y Dashboard

#### 4.1.1 Autenticación con Azure AD (MSAL)
```typescript
import { PublicClientApplication } from '@azure/msal-browser'

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
}

export const msalInstance = new PublicClientApplication(msalConfig)
```

#### 4.1.2 Dashboard Components
- **Métricas en Tiempo Real**
  - Total validaciones hoy/semana/mes
  - Tasa de éxito vs error
  - Tiempo promedio de procesamiento
  - Archivos pendientes

- **Gráficas**
  - Tendencia de validaciones (últimos 30 días)
  - Distribución por tipo de error
  - Top 10 errores más frecuentes
  - Actividad por usuario

- **Actividad Reciente**
  - Stream en tiempo real de validaciones
  - Notificaciones de errores críticos
  - Alertas de límites excedidos

### 4.2 Módulo 2: Gestión de Validaciones

#### 4.2.1 Upload de Archivos
```typescript
// Drag & drop con react-dropzone
import { useDropzone } from 'react-dropzone'

const { getRootProps, getInputProps, isDragActive } = useDropzone({
  accept: {
    'text/plain': ['.txt'],
    'application/xml': ['.xml']
  },
  maxSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
  onDrop: async (files) => {
    await uploadMutation.mutateAsync(files)
  }
})
```

**Features:**
- Upload múltiple (hasta 10 archivos)
- Progress bar individual por archivo
- Validación de formato/tamaño client-side
- Preview antes de subir
- Reintentos automáticos en fallo

#### 4.2.2 Tabla de Validaciones
```typescript
// TanStack Table + Virtual
const columns = [
  { id: 'fileName', header: 'Archivo' },
  { id: 'type', header: 'Tipo', cell: (row) => <Badge>{row.type}</Badge> },
  { id: 'status', header: 'Estado', cell: StatusBadge },
  { id: 'createdAt', header: 'Fecha', cell: (row) => formatDate(row.createdAt) },
  {
    id: 'actions',
    cell: (row) => (
      <DropdownMenu>
        <DropdownMenuItem onClick={() => navigate(`/app/validations/${row.id}`)}>
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadReport(row.id)}>
          Descargar reporte
        </DropdownMenuItem>
      </DropdownMenu>
    )
  }
]
```

**Features:**
- Paginación server-side (50 registros/página)
- Filtros: estado, tipo, fecha, usuario
- Sorting: fecha, nombre, estado
- Búsqueda full-text
- Export a Excel/CSV
- Virtualización para 10K+ registros

#### 4.2.3 Detalle de Validación
**Tabs:**
1. **Resumen** - Estado general, métricas
2. **Errores** (si hay) - Lista de errores con sugerencias
3. **Advertencias** - Warnings no bloqueantes
4. **Datos Procesados** - Vista previa de datos
5. **Timeline** - Historial de eventos
6. **Audit Log** - Quién hizo qué y cuándo

### 4.3 Módulo 3: Reportes

#### 4.3.1 Generador de Reportes
**Tipos de reporte:**
1. **Reporte Diario** - Todas las validaciones del día
2. **Reporte Mensual** - Consolidado para CONSAR
3. **Reporte de Errores** - Solo archivos con errores
4. **Reporte por Usuario** - Actividad individual
5. **Reporte Customizado** - Filtros avanzados

**Formatos disponibles:**
- PDF (mediante API backend)
- Excel (.xlsx)
- CSV
- JSON

#### 4.3.2 Dashboard de Reportes
```typescript
// Tremor cards con métricas
<Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
  <Card>
    <Metric>1,247</Metric>
    <Text>Validaciones este mes</Text>
    <BadgeDelta deltaType="increase">12.3%</BadgeDelta>
  </Card>
  {/* ... */}
</Grid>

<Card className="mt-6">
  <Title>Tendencia de Validaciones</Title>
  <AreaChart
    data={data}
    index="date"
    categories={["exitosas", "error", "advertencia"]}
    colors={["emerald", "red", "amber"]}
  />
</Card>
```

### 4.4 Módulo 4: Gestión de Catálogos

#### 4.4.1 CRUD de Catálogos CONSAR
**Catálogos gestionados:**
- Códigos de rechazo (500+ códigos)
- Tipos de trabajador
- Tipos de movimiento
- Claves de AFORE
- Etc. (según normativa CONSAR)

**Features:**
- Búsqueda y filtrado
- Import masivo desde Excel
- Validación de integridad
- Historial de cambios (event sourcing)
- Aprobación de cambios (workflow)

#### 4.4.2 Versionado de Reglas
**UI para gestionar:**
- Versiones de reglas (semver)
- Feature flags (LaunchDarkly integration)
- Rollout gradual (10% → 25% → 50% → 100%)
- Rollback instantáneo
- Comparación de versiones (diff visual)

### 4.5 Módulo 5: Configuración

#### 4.5.1 Configuración de AFORE (Multi-tenant)
- Logo y branding
- Usuarios y roles
- Configuración SMTP
- Webhooks para notificaciones
- API keys

#### 4.5.2 Configuración de Usuario
- Perfil y preferencias
- Notificaciones (email, in-app, SMS)
- Idioma (ES, EN)
- Timezone
- Two-Factor Auth (TOTP)

---

## 5. Performance Optimization

### 5.1 Bundle Size
**Objetivos:**
- Initial load: < 200KB gzipped
- Lazy routes: < 50KB cada una
- Total hydration: < 500ms en 3G

**Estrategias:**
```typescript
// Code splitting automático por ruta
const DashboardPage = lazy(() => import('./pages/Dashboard'))
const ReportsPage = lazy(() => import('./pages/Reports'))

// Suspense boundaries
<Suspense fallback={<PageSkeleton />}>
  <Outlet />
</Suspense>
```

### 5.2 Rendering Performance
**React Compiler** maneja automáticamente:
- Memoization de componentes
- Callback stability
- Dependency tracking

**Manual optimizations solo para:**
- Virtual scrolling (TanStack Virtual)
- Canvas/WebGL rendering (si aplica)
- Expensive computations (Web Workers)

### 5.3 Network Optimization
```typescript
// TanStack Query - cache strategies
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 10 * 60 * 1000,   // 10 min
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
})
```

**Prefetching:**
```typescript
// Prefetch en hover para navegación instantánea
const prefetchValidation = (id: string) => {
  queryClient.prefetchQuery({
    queryKey: ['validation', id],
    queryFn: () => api.getValidation(id)
  })
}

<Link
  to={`/validations/${id}`}
  onMouseEnter={() => prefetchValidation(id)}
>
  Ver detalle
</Link>
```

### 5.4 Image Optimization
- **SVG icons** (lucide-react, 2KB total)
- **WebP** para fotos (fallback a PNG)
- **Lazy loading** con Intersection Observer
- **Blur placeholder** durante carga

---

## 6. Security & Authentication

### 6.1 Azure AD Integration
```typescript
// Protected route wrapper
const AuthGuard = () => {
  const { instance, accounts } = useMsal()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (accounts.length === 0) {
      instance.loginRedirect({
        scopes: ['User.Read', 'api://hergon-api/access_as_user']
      })
    } else {
      setIsAuthenticated(true)
    }
  }, [accounts, instance])

  if (!isAuthenticated) return <LoadingScreen />

  return <Outlet />
}
```

### 6.2 RBAC (Role-Based Access Control)
```typescript
// Hook para permisos
const usePermissions = () => {
  const user = useAppStore(state => state.user)

  const can = (action: Action, resource: Resource) => {
    const role = user?.role
    return PERMISSIONS[role]?.[resource]?.includes(action)
  }

  return { can }
}

// Uso en componentes
const { can } = usePermissions()

{can('delete', 'validation') && (
  <Button onClick={deleteValidation}>Eliminar</Button>
)}
```

### 6.3 XSS & CSRF Protection
- **CSP Headers** configurados en Vite
- **DOMPurify** para sanitizar HTML user-generated
- **CSRF tokens** en todas las mutaciones
- **HttpOnly cookies** para refresh tokens

---

## 7. Real-time Features

### 7.1 SignalR Integration
```typescript
// Hook custom para SignalR
const useValidationHub = () => {
  const queryClient = useQueryClient()
  const [connection, setConnection] = useState<HubConnection | null>(null)

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl('/api/validationHub')
      .withAutomaticReconnect()
      .build()

    conn.on('ValidationStarted', (data) => {
      queryClient.setQueryData(['validations', data.id], (old: any) => ({
        ...old,
        status: 'processing'
      }))
    })

    conn.on('ValidationCompleted', (data) => {
      queryClient.invalidateQueries(['validations'])
      toast.success(`Validación completada: ${data.fileName}`)
    })

    conn.start().then(() => setConnection(conn))

    return () => { conn.stop() }
  }, [])

  return connection
}
```

### 7.2 Optimistic Updates
```typescript
// Mutación con optimistic update
const updateValidation = useMutation({
  mutationFn: api.updateValidation,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['validation', newData.id])
    const previous = queryClient.getQueryData(['validation', newData.id])

    queryClient.setQueryData(['validation', newData.id], newData)

    return { previous }
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['validation', variables.id], context?.previous)
  },
  onSettled: (data, error, variables) => {
    queryClient.invalidateQueries(['validation', variables.id])
  }
})
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (Vitest)
```typescript
// features/validations/hooks/useValidations.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useValidations } from './useValidations'

test('fetches validations', async () => {
  const queryClient = new QueryClient()
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  const { result } = renderHook(() => useValidations(), { wrapper })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toHaveLength(10)
})
```

### 8.2 Integration Tests (RTL)
```typescript
// features/validations/ValidationList.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ValidationList } from './ValidationList'

test('filters validations by status', async () => {
  const user = userEvent.setup()
  render(<ValidationList />)

  await user.click(screen.getByRole('combobox', { name: /estado/i }))
  await user.click(screen.getByText('Error'))

  expect(screen.getAllByRole('row')).toHaveLength(5) // 5 errores
})
```

### 8.3 E2E Tests (Playwright)
```typescript
// tests/e2e/validation-flow.spec.ts
import { test, expect } from '@playwright/test'

test('complete validation flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@afore.mx')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  await page.waitForURL('/app/dashboard')
  await page.click('text=Nueva validación')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles('test-file.txt')

  await page.click('text=Subir archivo')
  await expect(page.locator('text=Validación exitosa')).toBeVisible()
})
```

---

## 9. Deployment & CI/CD

### 9.1 Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-table'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### 9.2 Azure Static Web Apps
```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths: ['app/**']

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci
        working-directory: ./app

      - name: Run tests
        run: npm test
        working-directory: ./app

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.API_URL }}
          VITE_AZURE_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
        working-directory: ./app

      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/app'
          output_location: 'dist'
```

### 9.3 Environment Variables
```env
# .env.development
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000
VITE_AZURE_CLIENT_ID=your-dev-client-id
VITE_AZURE_TENANT_ID=common

# .env.production
VITE_API_URL=https://api.hergon.com/api
VITE_SIGNALR_URL=https://api.hergon.com
VITE_AZURE_CLIENT_ID=your-prod-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
```

---

## 10. Accessibility (A11y)

### 10.1 WCAG 2.1 AA Compliance
- **Keyboard navigation** completo
- **Screen reader** compatible (ARIA labels)
- **Color contrast** mínimo 4.5:1
- **Focus indicators** visibles
- **Skip links** para navegación rápida

### 10.2 Tools
```typescript
// axe-core para testing automatizado
import { axe } from 'jest-axe'

test('no accessibility violations', async () => {
  const { container } = render(<ValidationList />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## 11. Internationalization (i18n)

### 11.1 react-i18next
```typescript
// lib/i18n.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: require('./locales/es.json') },
    en: { translation: require('./locales/en.json') }
  },
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false }
})

// Uso
const { t } = useTranslation()
<h1>{t('dashboard.title')}</h1>
```

---

## 12. Monitoring & Analytics

### 12.1 Azure Application Insights
```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true
  }
})

appInsights.loadAppInsights()
appInsights.trackPageView()

// Track custom events
appInsights.trackEvent({ name: 'ValidationUpload', properties: { fileType: 'NOMINA' }})
```

### 12.2 Error Tracking
```typescript
// ErrorBoundary con logging
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    appInsights.trackException({
      exception: error,
      properties: { errorInfo }
    })
  }
}
```

---

## 13. Migration Plan (Progressive Implementation)

### Phase 1: Foundation (Week 1-2)
- [x] Setup Vite + React 19 + TypeScript
- [x] Configure Tailwind CSS 4 + shadcn/ui
- [x] Setup TanStack Query + Zustand
- [x] Implement Azure AD authentication
- [x] Create base layout (Header, Sidebar, Footer)
- [x] Setup CI/CD pipeline

### Phase 2: Module 1 - Dashboard (Week 3-4)
- [ ] Dashboard page with metrics cards
- [ ] Real-time charts (Tremor/Recharts)
- [ ] Activity feed with SignalR
- [ ] User profile dropdown
- [ ] Notification system

### Phase 3: Module 2 - Validations (Week 5-7)
- [ ] File upload component (drag & drop)
- [ ] Validations table with virtualization
- [ ] Filters and search
- [ ] Validation detail page
- [ ] Error details with suggestions

### Phase 4: Module 3 - Reports (Week 8-9)
- [ ] Report generator form
- [ ] Report preview
- [ ] Download in multiple formats
- [ ] Schedule reports (cron)
- [ ] Report history

### Phase 5: Module 4 - Catalogs (Week 10-11)
- [ ] Catalog CRUD
- [ ] Import/export Excel
- [ ] Version history
- [ ] Approval workflow

### Phase 6: Module 5 - Settings (Week 12)
- [ ] AFORE settings (multi-tenant)
- [ ] User preferences
- [ ] Notification settings
- [ ] API keys management

### Phase 7: Testing & Polish (Week 13-14)
- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E critical paths
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (axe)
- [ ] Security audit

### Phase 8: Production Deploy (Week 15)
- [ ] Production environment setup
- [ ] Load testing
- [ ] Blue/Green deployment
- [ ] Monitoring setup
- [ ] Go live!

---

## 14. Dependencies Package.json

```json
{
  "name": "hergon-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.64.0",
    "@tanstack/react-table": "^8.20.0",
    "@tanstack/react-virtual": "^3.10.8",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.24.0",
    "@hookform/resolvers": "^3.9.0",
    "@azure/msal-browser": "^3.28.0",
    "@azure/msal-react": "^2.0.22",
    "@microsoft/signalr": "^8.0.7",
    "@microsoft/applicationinsights-web": "^3.3.3",
    "axios": "^1.7.9",
    "lucide-react": "^0.468.0",
    "recharts": "^2.13.3",
    "@tremor/react": "^3.18.0",
    "react-dropzone": "^14.3.5",
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "class-variance-authority": "^0.7.0",
    "react-i18next": "^15.1.3",
    "i18next": "^24.2.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react-swc": "^3.7.2",
    "vite": "^6.0.0",
    "typescript": "^5.7.2",
    "tailwindcss": "^4.0.0-alpha.36",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3",
    "jest-axe": "^9.0.0",
    "@playwright/test": "^1.50.0",
    "eslint": "^9.17.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "prettier": "^3.4.2"
  }
}
```

---

## 15. Conclusiones

### 15.1 Tecnologías Seleccionadas (Summary)
| Categoría | Tecnología | Versión | Justificación |
|-----------|-----------|---------|---------------|
| Framework | React | 19.0 | Compiler automático, Server Components, Actions |
| Build Tool | Vite | 6.0 | HMR <2s, builds 70x más rápidos |
| Router | React Router | 7.0 | Type-safe, data loading, actions |
| Language | TypeScript | 5.7+ | Type safety, mejor DX |
| State (Client) | Zustand | 5.0 | 1.8KB, simple, DevTools |
| State (Server) | TanStack Query | 5.64 | Cache inteligente, optimistic updates |
| UI Framework | Tailwind CSS | 4.0 | Oxide engine (Rust), 10x faster |
| Components | shadcn/ui | Latest | Copy-paste, full ownership |
| Primitives | Radix UI | Latest | Accessibility first |
| Forms | React Hook Form + Zod | 7.53 + 3.24 | 0 re-renders, type-safe validation |
| Charts | Recharts + Tremor | 2.13 + 3.18 | Simple pero poderoso |
| Tables | TanStack Table + Virtual | 8.20 + 3.10 | 100K rows @ 60 FPS |
| Real-time | SignalR | 8.0 | WebSockets, auto-reconnect |
| Auth | Azure AD (MSAL) | 3.28 | Enterprise SSO, MFA |
| Testing | Vitest + RTL + Playwright | Latest | Fast, modern, reliable |

### 15.2 Performance Targets
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms
- **Lighthouse Score:** > 95

### 15.3 Próximos Pasos
1. **Aprobación de arquitectura** por stakeholders
2. **Setup inicial del proyecto** (Phase 1)
3. **Implementación progresiva** por módulos
4. **Testing continuo** desde día 1
5. **Deploy a staging** al completar cada módulo
6. **Production release** en Week 15

---

**Documento vivo** - Se actualizará conforme avance la implementación.

**Contacto:** Equipo de Arquitectura Hergon
**Última actualización:** 2025-01-22
