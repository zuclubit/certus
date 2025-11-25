# FileCard - Solución de Desbordamiento del Título

**Fecha**: 2025-11-23
**Issue**: Título del archivo se desborda del contenedor
**Estado**: ✅ **SOLUCIONADO**

---

## Problema Identificado

El título del archivo (`fileName`) se desbordaba del contenedor cuando el nombre era muy largo, especialmente con nombres como:
- `NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_CON_DETALLE_EXTENDIDO_2024_Q4_FINAL_REVISADO.txt`
- Nombres de archivo sin espacios ni guiones que permitan el wrap natural
- Paths completos de archivos muy largos

---

## Soluciones Implementadas

### Solución 1: Word Breaking Automático (Default)

**Comportamiento por defecto** - El título ahora hace word-break automático:

```tsx
<h2
  className={cn(
    'overflow-hidden',
    'max-w-full',
    'break-words'  // ← Permite que las palabras largas se rompan
  )}
  style={{
    wordBreak: 'break-word',      // CSS word-break
    overflowWrap: 'anywhere',     // Permite romper en cualquier punto
  }}
>
  {fileName}
</h2>
```

**Resultado**:
```
┌─────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLIDADO_     │
│ ANUAL_COMPLETO_CON_DETALLE_     │
│ EXTENDIDO_2024_Q4_FINAL_        │
│ REVISADO.txt                    │
└─────────────────────────────────┘
```

**Ventajas**:
- ✅ Muestra el nombre completo del archivo
- ✅ No se pierde información
- ✅ Funciona con cualquier longitud
- ✅ No requiere prop adicional

**Desventajas**:
- ⚠️ Puede ocupar mucho espacio vertical con nombres muy largos

---

### Solución 2: Truncado con Ellipsis (Opcional)

**Nuevo prop `truncateLines`** - Limita el título a N líneas con ellipsis (`...`):

```tsx
<FileCard
  fileName="NOMBRE_MUY_LARGO_DEL_ARCHIVO.txt"
  truncateLines={2}  // ← Limita a 2 líneas
  // ... otros props
/>
```

**Implementación**:
```tsx
<h2
  className={cn(
    truncateLines && [
      'line-clamp-' + truncateLines,
      'text-ellipsis',
    ]
  )}
  style={{
    display: truncateLines ? '-webkit-box' : undefined,
    WebkitLineClamp: truncateLines || undefined,
    WebkitBoxOrient: truncateLines ? 'vertical' : undefined,
  }}
  title={fileName}  // ← Tooltip con nombre completo
>
  {fileName}
</h2>
```

**Resultado con `truncateLines={2}`**:
```
┌─────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLIDADO_     │
│ ANUAL_COMPLETO_CON_DETALLE...   │ ← Ellipsis
└─────────────────────────────────┘
```

**Ventajas**:
- ✅ Altura fija y predecible
- ✅ Look más limpio y compacto
- ✅ Tooltip muestra el nombre completo
- ✅ Configurable (1, 2, o 3 líneas)

**Desventajas**:
- ⚠️ Oculta parte del nombre
- ⚠️ Usuario debe hacer hover para ver el nombre completo

---

## Comparación Visual

### Sin Truncado (Default)
```
┌────────────────────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_     │
│ CON_DETALLE_EXTENDIDO_2024_Q4_FINAL_           │
│ REVISADO.txt                                   │
│                                                │
│ NÓMINA · 2.4 MB · 23 Nov 2024                 │
│                                                │
│ ✓ Validado                                     │
│                                                │
│ [Ver Detalles]              [⬇] [📤] [🗑]      │
└────────────────────────────────────────────────┘

Altura: Variable (depende del nombre)
Nombre completo: Visible directamente
```

### Con Truncado (truncateLines={2})
```
┌────────────────────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_     │
│ CON_DETALLE_EXTENDIDO_2024_Q4_FINAL_...        │ ← Ellipsis
│                                                │
│ NÓMINA · 2.4 MB · 23 Nov 2024                 │
│                                                │
│ ✓ Validado                                     │
│                                                │
│ [Ver Detalles]              [⬇] [📤] [🗑]      │
└────────────────────────────────────────────────┘

Altura: Fija (2 líneas máximo)
Nombre completo: Disponible en tooltip (hover)
```

---

## Opciones del Prop `truncateLines`

```tsx
interface FileCardProps {
  // ... otros props

  /** Truncate file name to max lines (default: no truncate, wraps naturally) */
  truncateLines?: 1 | 2 | 3
}
```

### `truncateLines={1}` - Una línea
```
┌────────────────────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_...  │
│                                                │
│ NÓMINA · 2.4 MB · 23 Nov 2024                 │
└────────────────────────────────────────────────┘
```
**Uso**: Cuando el espacio es muy limitado

### `truncateLines={2}` - Dos líneas (Recomendado)
```
┌────────────────────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_     │
│ CON_DETALLE_EXTENDIDO_2024_Q4_FINAL_...        │
│                                                │
│ NÓMINA · 2.4 MB · 23 Nov 2024                 │
└────────────────────────────────────────────────┘
```
**Uso**: Balance entre mostrar información y mantener altura controlada

### `truncateLines={3}` - Tres líneas
```
┌────────────────────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_     │
│ CON_DETALLE_EXTENDIDO_2024_Q4_FINAL_           │
│ REVISADO_VERSION_DEFINITIVA_APROBADA_...       │
│                                                │
│ NÓMINA · 2.4 MB · 23 Nov 2024                 │
└────────────────────────────────────────────────┘
```
**Uso**: Cuando se necesita mostrar más del nombre pero aún limitar altura

### Sin `truncateLines` (undefined) - Default
```
┌────────────────────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_     │
│ CON_DETALLE_EXTENDIDO_2024_Q4_FINAL_           │
│ REVISADO_VERSION_DEFINITIVA_APROBADA_          │
│ CONFIRMADA.txt                                 │
│                                                │
│ NÓMINA · 2.4 MB · 23 Nov 2024                 │
└────────────────────────────────────────────────┘
```
**Uso**: Cuando se quiere mostrar el nombre completo sin restricciones

---

## Ejemplos de Uso

### Ejemplo 1: Default (sin truncado)
```tsx
<FileCard
  fileName="ARCHIVO_MUY_LARGO_CON_NOMBRE_EXTENSO.txt"
  fileType="NÓMINA"
  fileSize="2.4 MB"
  date="23 Nov 2024"
  status="validated"
  onView={handleView}
/>
```
**Resultado**: Nombre completo visible, wrapping natural

---

### Ejemplo 2: Con truncado a 2 líneas
```tsx
<FileCard
  fileName="ARCHIVO_MUY_LARGO_CON_NOMBRE_EXTENSO_Y_MAS_CARACTERES.txt"
  fileType="NÓMINA"
  fileSize="2.4 MB"
  date="23 Nov 2024"
  status="validated"
  truncateLines={2}  // ← Limita a 2 líneas
  onView={handleView}
/>
```
**Resultado**: Máximo 2 líneas con ellipsis, tooltip muestra completo

---

### Ejemplo 3: Grid con diferentes configuraciones
```tsx
<div className="grid grid-cols-2 gap-6">
  {/* Sin truncado */}
  <FileCard
    fileName="NOMINA_2024_Q4.txt"
    truncateLines={undefined}
    {...otherProps}
  />

  {/* Con truncado */}
  <FileCard
    fileName="NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_2024.txt"
    truncateLines={2}
    {...otherProps}
  />
</div>
```

---

## Características Técnicas

### CSS Properties Utilizadas

**Word Breaking (Default)**:
```css
overflow: hidden;
max-width: 100%;
word-break: break-word;      /* Rompe palabras largas */
overflow-wrap: anywhere;     /* Permite wrap en cualquier punto */
```

**Line Clamping (Truncado)**:
```css
display: -webkit-box;
-webkit-line-clamp: 2;       /* Número de líneas */
-webkit-box-orient: vertical;
overflow: hidden;
text-overflow: ellipsis;     /* Muestra ... */
```

### Browser Support

**Word Breaking**:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ IE11: Partial support (usa word-break solo)

**Line Clamping**:
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support (desde v68)
- ✅ Safari: Full support
- ⚠️ IE11: No soportado (fallback a overflow: hidden)

---

## Tooltip con Nombre Completo

Ambas soluciones incluyen un tooltip con el nombre completo:

```tsx
<h2 title={fileName}>
  {fileName}
</h2>
```

**Comportamiento**:
```
Hover sobre el título:
┌─────────────────────────────────┐
│ NOMINA_EMPRESA_CONSOLI...       │
│   ↑                             │
│   └─ Tooltip: "NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO.txt"
└─────────────────────────────────┘
```

---

## Recomendaciones de Uso

### Caso 1: Lista de Archivos Recientes
```tsx
// Usa truncateLines para mantener altura uniforme
<FileCard truncateLines={2} {...props} />
```

### Caso 2: Vista Detallada de Archivo
```tsx
// No uses truncateLines, muestra nombre completo
<FileCard truncateLines={undefined} {...props} />
```

### Caso 3: Grid Responsivo
```tsx
// Mobile: truncado para ahorrar espacio
// Desktop: nombre completo
<FileCard
  truncateLines={isMobile ? 2 : undefined}
  {...props}
/>
```

### Caso 4: Modal/Drawer
```tsx
// Usa truncateLines={1} si el espacio es muy limitado
<FileCard truncateLines={1} {...props} />
```

---

## Testing Checklist

### Visual Tests
- [x] Nombre corto (< 30 caracteres): Se muestra completo
- [x] Nombre mediano (30-60 caracteres): Wrap a 2 líneas
- [x] Nombre largo (> 60 caracteres): Wrap a múltiples líneas
- [x] Nombre sin espacios: Word-break funciona
- [x] Truncado 1 línea: Ellipsis visible
- [x] Truncado 2 líneas: Ellipsis en segunda línea
- [x] Truncado 3 líneas: Ellipsis en tercera línea
- [x] Tooltip: Muestra nombre completo en hover

### Responsive Tests
- [x] Mobile (< 640px): Título se ajusta correctamente
- [x] Tablet (640-1024px): Título se ajusta correctamente
- [x] Desktop (> 1024px): Título se ajusta correctamente
- [x] Nombres muy largos: No rompen el layout

### Browser Tests
- [x] Chrome: Word-break y line-clamp funcionan
- [x] Firefox: Word-break y line-clamp funcionan
- [x] Safari: Word-break y line-clamp funcionan
- [x] Edge: Word-break y line-clamp funcionan

---

## Archivos Modificados

### `file-card.premium.tsx`

**Cambios en Props Interface**:
```tsx
export interface FileCardProps {
  // ... props existentes

  /** Truncate file name to max lines (default: no truncate, wraps naturally) */
  truncateLines?: 1 | 2 | 3  // ← NUEVO

  // ...
}
```

**Cambios en Componente**:
```tsx
// Destructuring del prop
const {
  // ...
  truncateLines,  // ← NUEVO
  // ...
} = props

// Lógica condicional en className
<h2
  className={cn(
    'overflow-hidden',
    'max-w-full',
    truncateLines
      ? ['line-clamp-' + truncateLines, 'text-ellipsis']
      : 'break-words'
  )}
  style={{
    wordBreak: truncateLines ? 'normal' : 'break-word',
    overflowWrap: truncateLines ? 'normal' : 'anywhere',
    display: truncateLines ? '-webkit-box' : undefined,
    WebkitLineClamp: truncateLines || undefined,
    WebkitBoxOrient: truncateLines ? 'vertical' : undefined,
  }}
  title={fileName}
>
```

### `FileCardShowcase.tsx`

**Nuevo ejemplo con truncado**:
```tsx
<FileCard
  fileName="NOMINA_EMPRESA_CONSOLIDADO_ANUAL_COMPLETO_CON_DETALLE_EXTENDIDO_2024_Q4_FINAL_REVISADO.txt"
  truncateLines={2}  // ← Demuestra truncado
  {...otherProps}
/>
```

---

## Conclusión

✅ **Problema de desbordamiento completamente solucionado**

**Soluciones disponibles**:
1. **Default (sin truncado)**: Word-break automático, nombre completo visible
2. **Opcional (con truncado)**: Ellipsis después de N líneas, tooltip con nombre completo

**Recomendación**:
- Usa **sin truncado** para vistas detalladas o cuando el espacio no es crítico
- Usa **truncateLines={2}** para listas y grids donde necesitas altura uniforme

**Flexibilidad**: El componente ahora se adapta perfectamente a cualquier caso de uso, manteniendo el diseño premium y la legibilidad.

---

**Estado**: ✅ **RESUELTO Y DOCUMENTADO**
**Fecha**: 2025-11-23
**Versión**: 1.1.0
