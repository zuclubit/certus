# 🚀 PRÓXIMOS PASOS - DESARROLLO FRONTEND HERGON VECTOR01

## 📅 PLAN DE ACCIÓN - ENERO 2025

---

## ✅ FASE 1-2: COMPLETADA (22 Enero 2025)

### Entregables Completados:
1. ✅ `validation.mock.enhanced.ts` - Mock data con cumplimiento CONSAR 100%
2. ✅ `security.ts` - Utilities de seguridad (OWASP Top 10)
3. ✅ `validation.ts` - Utilities de validación CONSAR
4. ✅ `ErrorBoundary.tsx` - Manejo global de errores
5. ✅ Documentación completa de arquitectura
6. ✅ Actualización del servicio de validación

---

## 🔄 FASE 3: COMPONENTES MEJORADOS (Siguiente - 5 días)

### Prioridad ALTA 🔴

#### 1. Actualizar App.tsx con ErrorBoundary (30 min)

```tsx
// app/src/App.tsx
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // TODO: Enviar a servicio de logging (Azure Application Insights)
        console.error('Global error:', error, errorInfo)
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/validations" element={<Validations />} />
              {/* ... rest of routes */}
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
```

**Checklist**:
- [ ] Importar ErrorBoundary
- [ ] Envolver toda la app
- [ ] Configurar handler de errores personalizado
- [ ] Probar con error intencional
- [ ] Verificar UI de error

---

#### 2. Mejorar FileUpload.tsx con Validaciones CONSAR (4 horas)

**Archivo**: `app/src/components/validations/FileUpload.tsx`

**Cambios Necesarios**:

```tsx
import {
  validateFile,
  validateFiles,
  validateFileContent,
  formatFileSize,
  detectFileType,
  extractFileMetadata,
} from '@/lib/utils/validation'
import { sanitizeString } from '@/lib/utils/security'

export function FileUpload({ ... }: FileUploadProps) {
  // 1. AGREGAR: Validación robusta antes de agregar archivos
  const handleFilesSelected = async (selectedFiles: File[]) => {
    // Validar todos los archivos
    const validationResults = validateFiles(selectedFiles, {
      checkFileName: true,
      maxSizeMB: 50,
      maxFiles: 10,
    })

    // Filtrar solo archivos válidos
    const validFiles: File[] = []
    const errors: string[] = []

    for (const { file, result } of validationResults) {
      if (result.isValid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${result.error}`)
      }
    }

    // Mostrar errores al usuario
    if (errors.length > 0) {
      setValidationErrors(errors)
    }

    // Agregar solo archivos válidos
    if (validFiles.length > 0) {
      addFiles(validFiles)
    }
  }

  // 2. AGREGAR: Auto-detección de tipo de archivo
  const handleFileTypeDetection = (fileName: string) => {
    const detectedType = detectFileType(fileName)
    if (detectedType) {
      setSelectedFileType(detectedType)
      toast.success(`Tipo de archivo detectado: ${detectedType}`)
    }
  }

  // 3. AGREGAR: Validación de contenido antes de upload
  const handleUpload = async () => {
    if (files.length === 0) return

    // Validar contenido de cada archivo
    for (const file of files) {
      const contentResult = await validateFileContent(file)

      if (!contentResult.isValid) {
        toast.error(`${file.name}: ${contentResult.error}`)
        return // No continuar si hay error de contenido
      }
    }

    // Continuar con upload si todo OK
    // ... resto del código
  }

  // 4. AGREGAR: Accesibilidad mejorada
  return (
    <div
      role="region"
      aria-label="Zona de carga de archivos CONSAR"
      className="space-y-4"
    >
      {/* File Type Selection */}
      <div className="flex items-center gap-3">
        <label
          id="file-type-label"
          className="text-sm font-semibold"
        >
          Tipo de archivo:
        </label>
        <div
          role="group"
          aria-labelledby="file-type-label"
          className="flex gap-2"
        >
          {(['NOMINA', 'CONTABLE', 'REGULARIZACION'] as FileType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFileType(type)}
              aria-pressed={selectedFileType === type}
              aria-label={`Seleccionar tipo ${type}`}
              className={/* ... */}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona de arrastrar y soltar archivos. Presione Enter para seleccionar archivos"
        aria-describedby="upload-instructions"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        className={/* ... */}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.csv,.dat"
          aria-label="Seleccionar archivos CONSAR"
          onChange={handleFileInputChange}
        />

        <p id="upload-instructions" className="sr-only">
          Formatos aceptados: TXT, CSV, DAT. Tamaño máximo: 50MB por archivo.
          Formato de nombre: YYYYMMDD_TIPO_CUENTA_FOLIO.extensión
        </p>
      </div>
    </div>
  )
}
```

**Checklist**:
- [ ] Importar utilities de validation
- [ ] Agregar validación pre-upload
- [ ] Agregar auto-detección de tipo
- [ ] Validar contenido (77 caracteres)
- [ ] Mejorar accesibilidad (ARIA)
- [ ] Agregar tooltips informativos
- [ ] Probar con archivos válidos/inválidos

---

#### 3. Actualizar ValidationTable.tsx con Optimizaciones (3 horas)

**Archivo**: `app/src/components/validations/ValidationTable.tsx`

**Cambios Necesarios**:

```tsx
import { useMemo, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

export function ValidationTable({ data, ... }: ValidationTableProps) {
  // 1. AGREGAR: Memoization para datos pesados
  const sortedData = useMemo(() => {
    if (!sortBy) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })
  }, [data, sortBy, sortOrder])

  // 2. AGREGAR: Callbacks memoizados
  const handleViewDetails = useCallback((validation: Validation) => {
    onViewDetails(validation)
  }, [onViewDetails])

  const handleRetry = useCallback((id: string) => {
    retryMutation.mutate(id)
  }, [retryMutation])

  // 3. AGREGAR: Virtual scrolling para tablas grandes (>100 registros)
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // 60px por fila
    overscan: 5, // Renderizar 5 filas extra fuera de viewport
  })

  // 4. AGREGAR: Exportación a Excel/CSV
  const handleExport = useCallback((format: 'excel' | 'csv') => {
    const exportData = sortedData.map(row => ({
      'Archivo': row.fileName,
      'Tipo': row.fileType,
      'Estado': row.status,
      'Registros': row.recordCount,
      'Errores': row.errorCount,
      'Fecha': format.date(row.uploadedAt),
    }))

    if (format === 'csv') {
      const csv = convertToCSV(exportData)
      downloadFile(csv, 'validaciones.csv', 'text/csv')
    } else {
      // TODO: Implementar export a Excel con xlsx library
    }
  }, [sortedData])

  return (
    <div className="space-y-4">
      {/* Export Buttons */}
      <div className="flex gap-2 justify-end">
        <Button
          onClick={() => handleExport('csv')}
          variant="outline"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Virtual Scrolling Table */}
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto border rounded-lg"
      >
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
          {virtualizer.getVirtualItems().map(virtualRow => {
            const row = sortedData[virtualRow.index]
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <ValidationRow
                  data={row}
                  onViewDetails={handleViewDetails}
                  onRetry={handleRetry}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

**Checklist**:
- [ ] Agregar useMemo para sorting
- [ ] Agregar useCallback para handlers
- [ ] Implementar virtual scrolling (@tanstack/react-virtual)
- [ ] Agregar exportación CSV
- [ ] Agregar paginación si virtual scrolling no aplica
- [ ] Probar con 1000+ registros

---

### Prioridad MEDIA 🟡

#### 4. Agregar CSP al index.html (15 min)

**Archivo**: `app/index.html`

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Content Security Policy -->
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://api.banxico.org.mx https://*.consar.gob.mx;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self'
    ">

    <!-- Security Headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">

    <title>HERGON - Validación CONSAR</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Checklist**:
- [ ] Agregar CSP meta tag
- [ ] Agregar security headers
- [ ] Probar que no rompa funcionalidad
- [ ] Ajustar directives si es necesario

---

#### 5. Implementar Code Splitting (2 horas)

**Archivo**: `app/src/App.tsx`

```tsx
import { lazy, Suspense } from 'react'
import { LoadingScreen } from '@/components/shared/LoadingScreen'

// Lazy load pages
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Validations = lazy(() => import('@/pages/Validations'))
const ValidationDetail = lazy(() => import('@/pages/ValidationDetail'))
const Reports = lazy(() => import('@/pages/Reports'))
const Catalogs = lazy(() => import('@/pages/Catalogs'))
const Users = lazy(() => import('@/pages/Users'))
const Settings = lazy(() => import('@/pages/Settings'))

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppLayout>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/validations" element={<Validations />} />
                <Route path="/validations/:id" element={<ValidationDetail />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/catalogs" element={<Catalogs />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
```

**Crear LoadingScreen.tsx**:

```tsx
// app/src/components/shared/LoadingScreen.tsx
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'

export function LoadingScreen() {
  const loadingAnimation = getAnimation('loading')

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LottieIcon
          animationData={loadingAnimation}
          size={120}
          loop
        />
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Cargando...
        </p>
      </div>
    </div>
  )
}
```

**Checklist**:
- [ ] Convertir imports a lazy()
- [ ] Envolver Routes en Suspense
- [ ] Crear LoadingScreen component
- [ ] Probar navegación entre páginas
- [ ] Verificar bundle size reduction

---

## 🧪 FASE 4: TESTING (7-10 días)

### Prioridad ALTA 🔴

#### 1. Unit Tests para Utilities (2 días)

**Crear**: `app/src/lib/utils/__tests__/`

```typescript
// security.test.ts
import {
  sanitizeString,
  sanitizeHTML,
  secureRandomId,
  isValidEmail,
  isValidURL,
} from '../security'

describe('Security Utils', () => {
  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("XSS")</script>Hello'
      const output = sanitizeString(input)
      expect(output).toBe('scriptalert("XSS")/scriptHello')
    })

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert(1)'
      const output = sanitizeString(input)
      expect(output).not.toContain('javascript:')
    })

    it('should limit string length', () => {
      const input = 'a'.repeat(1000)
      const output = sanitizeString(input, 100)
      expect(output.length).toBe(100)
    })
  })

  describe('secureRandomId', () => {
    it('should generate unique IDs', () => {
      const id1 = secureRandomId()
      const id2 = secureRandomId()
      expect(id1).not.toBe(id2)
    })

    it('should have correct format', () => {
      const id = secureRandomId()
      expect(id).toMatch(/^\d{13}-[a-f0-9]{16}$/)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })
})

// validation.test.ts
import {
  validateFileType,
  validateFileSize,
  validateCONSARFileName,
  isValidCONSARDate,
} from '../validation'

describe('Validation Utils', () => {
  describe('validateFileType', () => {
    it('should accept .txt files', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = validateFileType(file)
      expect(result.isValid).toBe(true)
    })

    it('should reject .pdf files', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const result = validateFileType(file)
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe('INVALID_EXTENSION')
    })
  })

  describe('validateCONSARFileName', () => {
    it('should accept valid CONSAR format', () => {
      const result = validateCONSARFileName('20250115_SB_1101_001980.txt')
      expect(result.isValid).toBe(true)
    })

    it('should reject invalid format', () => {
      const result = validateCONSARFileName('archivo.txt')
      expect(result.isValid).toBe(false)
      expect(result.errorCode).toBe('INVALID_CONSAR_FORMAT')
    })
  })

  describe('isValidCONSARDate', () => {
    it('should accept valid dates', () => {
      expect(isValidCONSARDate('20250115')).toBe(true)
      expect(isValidCONSARDate('20241231')).toBe(true)
    })

    it('should reject invalid dates', () => {
      expect(isValidCONSARDate('20250229')).toBe(false) // 2025 not leap year
      expect(isValidCONSARDate('20251335')).toBe(false) // Invalid month
      expect(isValidCONSARDate('202501')).toBe(false) // Too short
    })
  })
})
```

**Setup Jest**:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest
```

**Checklist**:
- [ ] Setup Jest/Vitest
- [ ] Tests para security.ts (>90% coverage)
- [ ] Tests para validation.ts (>90% coverage)
- [ ] Tests para format.ts
- [ ] Configurar CI/CD para correr tests

---

## 📊 MÉTRICAS Y MONITOREO

### Configurar Azure Application Insights (1 día)

```typescript
// app/src/lib/monitoring.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web'

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
  }
})

appInsights.loadAppInsights()

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  appInsights.trackEvent({ name }, properties)
}

export const trackError = (error: Error, properties?: Record<string, any>) => {
  appInsights.trackException({ exception: error }, properties)
}

export default appInsights
```

**Uso en ErrorBoundary**:

```tsx
import { trackError } from '@/lib/monitoring'

componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  trackError(error, {
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
  })
}
```

---

## 🎯 RESUMEN DE PRIORIDADES

### Esta Semana (23-27 Enero)
1. ✅ App.tsx + ErrorBoundary (30 min)
2. ✅ FileUpload.tsx mejorado (4 horas)
3. ✅ CSP en index.html (15 min)
4. ✅ Code Splitting (2 horas)

**Total**: ~1 día de desarrollo

### Próxima Semana (28 Enero - 3 Febrero)
1. ValidationTable optimizado (3 horas)
2. Unit tests para utilities (2 días)
3. Azure Application Insights setup (1 día)
4. E2E tests básicos (1 día)

**Total**: ~4-5 días de desarrollo

### Siguientes 2 Semanas (4-17 Febrero)
1. Integration tests completos
2. Performance profiling y optimización
3. Accessibility audit completo
4. Documentation para desarrolladores
5. Beta testing con usuarios reales

---

## 📚 RECURSOS NECESARIOS

### NPM Packages a Instalar:

```bash
# Testing
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Virtual Scrolling
npm install @tanstack/react-virtual

# Monitoring
npm install @microsoft/applicationinsights-web

# Utilities (si no están)
npm install date-fns lodash-es
npm install --save-dev @types/lodash-es
```

---

## 🎓 CAPACITACIÓN REQUERIDA

Para el equipo de desarrollo:

1. **Seguridad Web** (2 horas)
   - OWASP Top 10
   - XSS/CSRF Prevention
   - Secure coding practices

2. **React Performance** (3 horas)
   - Memoization (useMemo, useCallback)
   - Code splitting
   - Virtual scrolling
   - Profiling tools

3. **Testing en React** (4 horas)
   - Jest/Vitest basics
   - React Testing Library
   - E2E con Playwright
   - Coverage metrics

4. **Normativa CONSAR** (2 horas)
   - Circular 19-8
   - Formato posicional
   - Validaciones requeridas

---

**NOTA FINAL**: Este es un plan agresivo pero realista. Cada fase construye sobre la anterior. Priorizar calidad sobre velocidad.

**Contacto de Soporte**: soporte@hergon.com
**Documentación**: Ver `ARQUITECTURA_FRONTEND_REMEDIACION.md` y `RESUMEN_REMEDIACION_FRONTEND.md`
