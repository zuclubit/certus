# Modal Detalle del Registro - Documentación Técnica

## Descripción General

Modal responsive con diseño glassmorphic para visualizar detalles completos de registros CONSAR. Implementa un sistema de componentes modulares y reutilizables siguiendo principios de clean architecture.

---

## Características Principales

### 🎨 Diseño
- **Glassmorphic UI**: Efectos visionOS 2025 con blur, transparencia y profundidad
- **Responsive Design**: Adaptación completa desde 340px hasta 2560px+
- **Dark/Light Mode**: Soporte completo para ambos temas
- **Progressive Enhancement**: Mobile-first con mejoras progresivas

### 🔧 Funcionalidad
- **Sistema de Cierre Unificado**: Un solo botón "Cerrar" en footer
- **Copy-to-Clipboard**: Botón con feedback visual y táctil
- **Grid Adaptativo**: 1→2→3 columnas según dispositivo
- **Scroll Inteligente**: Contenido scrollable con altura máxima

### 📐 Sistema de Espaciado
- **Padding Progresivo**: 12px → 16px → 20px → 24px
- **Sincronización**: Header, Content y Footer alineados
- **Border Radius**: 16px → 18px → 20px → 22px → 24px → 26px

---

## Arquitectura de Componentes

### Componente Principal
**`RowDetailModal.tsx`** - Orquesta todos los sub-componentes

```tsx
<RowDetailModal
  record={selectedRecord}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

### Componentes Modulares

#### 1. SectionContainer
Contenedor flexible con efectos glassmorphic
```tsx
<SectionContainer
  spacing="normal"
  glass
  elevated
  scrollable
>
  {children}
</SectionContainer>
```

**Props**:
- `spacing`: 'none' | 'compact' | 'normal' | 'comfortable' | 'spacious'
- `glass`: boolean - Efectos glassmorphic
- `bordered`: boolean - Borde visible
- `elevated`: boolean - Elevación con sombra
- `scrollable`: boolean - Overflow scroll
- `maxHeight`: string - Altura máxima

#### 2. SectionHeader
Encabezado de sección con ícono, título y contador
```tsx
<SectionHeader
  title="Campos Parseados"
  icon={Database}
  count={25}
  size="md"
/>
```

**Props**:
- `title`: string - Título de la sección
- `icon`: LucideIcon - Ícono opcional
- `count`: number - Contador de elementos
- `size`: 'sm' | 'md' | 'lg' | 'xl'

#### 3. StatusBadge
Badge semántico con efectos glassmorphic
```tsx
<StatusBadge
  variant="error"
  dot
  dotPulse
  size="sm"
>
  Con errores
</StatusBadge>
```

**Props**:
- `variant`: 'error' | 'warning' | 'success' | 'info' | 'neutral'
- `dot`: boolean - Mostrar punto indicador
- `dotPulse`: boolean - Animación pulsante
- `size`: 'xs' | 'sm' | 'md' | 'lg'

#### 4. DataField
Campo de datos con label/value y copy-to-clipboard
```tsx
<DataField
  label="NSS"
  value="12345678901"
  variant="mono"
  copyable
  size="sm"
/>
```

**Props**:
- `label`: string - Etiqueta del campo
- `value`: string | number | boolean | null
- `variant`: 'default' | 'mono' | 'currency' | 'date'
- `copyable`: boolean - Habilitar copia
- `size`: 'xs' | 'sm' | 'md' | 'lg'

---

## Sistema de Breakpoints

### Definición
```
xxs:  340px  - Móviles muy pequeños
xs:   360px  - iPhone SE, Galaxy A
sm:   480px  - Móviles grandes
md:   768px  - Tablets portrait
lg:   1024px - Tablets landscape
xl:   1280px - Desktop
2xl:  1536px - Desktop grande
```

### Comportamiento por Dispositivo

#### 📱 Mobile (< 480px)
```
Grid:         1 columna
Padding:      12-16px (px-3 xs:px-4)
Width:        calc(100vw - 16px) → calc(100vw - 24px)
Botón Cerrar: Full-width
Texto Copiar: Oculto (solo ícono)
Border:       16-18px
```

#### 📱 Tablet (480-1279px)
```
Grid:         2 columnas
Padding:      20px (sm:px-5)
Width:        max-w-2xl → max-w-3xl
Botón Cerrar: Auto-width
Texto Copiar: Visible
Border:       20-22px
```

#### 💻 Desktop (1280px+)
```
Grid:         3 columnas
Padding:      24px (md:px-6)
Width:        max-w-4xl → max-w-6xl
Border:       24-26px
Typography:   Heading-title3 (24px)
```

---

## Sistema de Diseño

### Colores Glassmorphic

#### Badges
```css
/* Error */
background: rgb(127, 29, 29, 0.30);
border: rgb(127, 29, 29, 0.40);
color: rgb(252, 165, 165);

/* Warning */
background: rgb(133, 77, 14, 0.30);
border: rgb(133, 77, 14, 0.40);
color: rgb(253, 224, 71);

/* Success */
background: rgb(20, 83, 45, 0.30);
border: rgb(20, 83, 45, 0.40);
color: rgb(134, 239, 172);

/* Info */
background: rgb(30, 64, 175, 0.30);
border: rgb(30, 64, 175, 0.40);
color: rgb(147, 197, 253);
```

#### Código
```css
/* Dark Mode */
background: rgb(23, 23, 23, 0.70);
color: rgb(103, 232, 249); /* cyan-300 */

/* Light Mode */
background: rgb(245, 245, 245, 0.95);
color: rgb(14, 116, 144); /* cyan-700 */
```

### Typography Scale

#### Títulos
```
Mobile:  ios-text-base       (16px)
xs:      ios-text-lg         (18px)
sm:      ios-text-xl         (20px)
Desktop: ios-heading-title3  (24px)
```

#### Descripciones
```
Mobile:  ios-text-xs         (12px)
xs:      ios-text-sm         (14px)
Desktop: ios-text-base       (16px)
```

#### Body Text
```
Mobile:  ios-text-sm         (14px)
Desktop: ios-text-body       (16px)
```

### Espaciado Progresivo

| Breakpoint | Header | Content | Footer | Valor |
|------------|--------|---------|--------|-------|
| < 360px    | px-3   | px-3    | px-3   | 12px  |
| 360-479px  | xs:px-4| xs:px-4 | xs:px-4| 16px  |
| 480-639px  | sm:px-5| sm:px-5 | sm:px-5| 20px  |
| 640px+     | md:px-6| md:px-6 | md:px-6| 24px  |

---

## Grid Adaptativo

### Estrategia
```tsx
className={cn(
  'grid gap-x-3 gap-y-3',
  'grid-cols-1',        // < 480px: 1 columna
  'sm:grid-cols-2',     // 480-1279px: 2 columnas
  'xl:grid-cols-3'      // 1280px+: 3 columnas
)}
```

### Razones
- **1 columna (< 480px)**: Máxima legibilidad en móviles
- **2 columnas (480-1279px)**: Balance entre espacio y densidad
- **3 columnas (1280px+)**: Aprovecha espacio en desktop

---

## Patrones de Diseño Aplicados

### 1. Atomic Design
```
Atoms      → DataField, StatusBadge
Molecules  → SectionHeader, RawLineDisplay
Organisms  → ParsedFieldsGrid, ErrorsSection
Templates  → RowDetailModal
```

### 2. Composition over Inheritance
Componentes pequeños y componibles en lugar de jerarquías complejas

### 3. Single Responsibility
Cada componente tiene un propósito único y bien definido

### 4. Progressive Disclosure
Información organizada jerárquicamente:
1. Línea original (más importante)
2. Campos parseados
3. Errores/Advertencias
4. Estado de validación

### 5. Mobile-First
Base optimizada para móviles, mejoras progresivas para desktop

---

## Interacciones y Feedback

### Botón Copiar
```tsx
// Visual Feedback
className={cn(
  'transition-all duration-200',
  'active:scale-95',  // Tactile feedback
  copied && 'bg-green-500/20'  // Visual confirmation
)}

// State Management
const [copied, setCopied] = useState(false)
setTimeout(() => setCopied(false), 2000)  // Auto-reset
```

### Animaciones
```css
/* Modal entrance */
data-[state=open]:animate-in
data-[state=open]:fade-in-0
data-[state=open]:zoom-in-95
duration-200

/* Modal exit */
data-[state=closed]:animate-out
data-[state=closed]:fade-out-0
data-[state=closed]:zoom-out-95
```

---

## Accesibilidad

### ARIA Labels
```tsx
<button aria-label="Copiar línea completa">
<div role="alert">  // Para errores
<div role="status">  // Para estado de éxito
```

### Keyboard Navigation
- **Tab**: Navegar entre elementos interactivos
- **Enter/Space**: Activar botones
- **Escape**: Cerrar modal

### Screen Reader Support
- Semantic HTML (header, main, footer)
- Descriptive labels
- Status announcements

### Contrast Ratios
- Texto normal: 4.5:1 (WCAG AA)
- Texto grande: 3:1 (WCAG AA)
- Elementos interactivos: 3:1 (WCAG AA)

---

## Performance

### Optimizaciones
```tsx
// GPU Acceleration
glass-gpu-accelerated

// Will-change hints
transition-all duration-200

// Efficient re-renders
React.memo para sub-componentes

// Virtual scrolling ready
scrollable maxHeight="200px"
```

### Métricas Esperadas
```
First Paint:    < 100ms
Interactive:    < 300ms
Animation FPS:  60fps
Memory Usage:   < 10MB
Bundle Impact:  +15KB gzipped
```

---

## Testing

### Unit Tests
```tsx
describe('RowDetailModal', () => {
  it('should render with record data', () => {})
  it('should close on button click', () => {})
  it('should copy line to clipboard', () => {})
  it('should show errors when present', () => {})
  it('should adapt grid to screen size', () => {})
})
```

### Visual Regression Tests
- Mobile: 375px (iPhone SE)
- Tablet: 768px (iPad)
- Desktop: 1280px, 1920px

### Accessibility Tests
- Lighthouse score > 90
- axe-core validation
- Keyboard navigation
- Screen reader testing

---

## Uso y Ejemplos

### Ejemplo Básico
```tsx
import { RowDetailModal } from '@/components/data-viewer/RowDetailModal'

function DataViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AnyRecord | null>(null)

  const handleRowClick = (record: AnyRecord) => {
    setSelectedRecord(record)
    setIsOpen(true)
  }

  return (
    <>
      <Table onRowClick={handleRowClick} />

      {selectedRecord && (
        <RowDetailModal
          record={selectedRecord}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
```

### Uso de Componentes Modulares
```tsx
import {
  SectionContainer,
  SectionHeader,
  StatusBadge,
  DataField
} from '@/components/ui'

function CustomSection() {
  return (
    <SectionContainer spacing="normal" glass elevated>
      <SectionHeader
        title="Información Personal"
        icon={User}
        count={5}
        size="md"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <DataField
          label="Nombre"
          value="Juan Pérez"
          size="sm"
        />

        <DataField
          label="NSS"
          value="12345678901"
          variant="mono"
          copyable
          size="sm"
        />
      </div>

      <StatusBadge variant="success" dot>
        Activo
      </StatusBadge>
    </SectionContainer>
  )
}
```

---

## Troubleshooting

### Modal no abre
```tsx
// Verificar state
console.log('isOpen:', isOpen)
console.log('record:', record)

// Verificar Dialog provider
<DialogProvider>
  <App />
</DialogProvider>
```

### Botón copiar no funciona
```tsx
// Verificar permisos clipboard
navigator.clipboard.writeText(text)
  .then(() => console.log('Copied'))
  .catch(err => console.error('Failed:', err))

// Verificar HTTPS (clipboard API requiere secure context)
```

### Grid no responsive
```tsx
// Verificar Tailwind config
module.exports = {
  theme: {
    screens: {
      'xs': '360px',
      'sm': '480px',
      // ...
    }
  }
}
```

---

## Roadmap de Mejoras Futuras

### Corto Plazo
- [ ] Tests unitarios completos
- [ ] Storybook documentation
- [ ] Reducir bundle size (tree-shaking)

### Medio Plazo
- [ ] Virtual scroll para +100 campos
- [ ] Exportar registro (JSON/CSV)
- [ ] Comparar con registro anterior/siguiente
- [ ] Keyboard shortcuts (Cmd+C, Cmd+W)

### Largo Plazo
- [ ] Animaciones spring physics
- [ ] Theme customization por usuario
- [ ] Drag-to-resize secciones
- [ ] Historial de cambios del registro

---

## Mantenimiento

### Actualizar Componentes
1. Modificar componente base (ej: `DataField.tsx`)
2. Verificar todos los usos con grep
3. Ejecutar tests
4. Actualizar documentación

### Agregar Nuevo Breakpoint
```tsx
// 1. Agregar en tailwind.config.js
screens: {
  'xxl': '1920px'
}

// 2. Usar en componentes
'xxl:grid-cols-4'
'xxl:px-8'
```

### Agregar Nueva Variante de Badge
```tsx
// En StatusBadge.tsx
const VARIANTS = {
  // ...existing
  critical: {
    bg: 'bg-red-950/40',
    text: 'text-red-200',
    border: 'border-red-900/50',
    dot: 'bg-red-500'
  }
}
```

---

## Referencias

### Estándares Aplicados
- **Apple HIG 2025**: Human Interface Guidelines
- **visionOS Design**: Glassmorphic principles
- **WCAG 2.1**: Web Content Accessibility Guidelines
- **Material Design 3**: Component patterns

### Recursos Externos
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app)

---

## Créditos

**Versión**: 1.0.0
**Última actualización**: 2025-11-23
**Arquitectura**: Clean Architecture + Atomic Design
**Stack**: React + TypeScript + Tailwind CSS + Radix UI

---

## Licencia

Este componente es parte del proyecto CONSAR y está sujeto a las políticas de licencia del proyecto principal.
