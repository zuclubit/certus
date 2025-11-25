# 🎨 VALIDATION DETAIL - VISIONOS ENTERPRISE 2026 REDESIGN

**Fecha:** 23 de Noviembre, 2025
**Componente:** `ValidationDetail.visionos.tsx`
**Objetivo:** Rediseño completo con estética VisionOS-Enterprise 2026 ultra-premium

---

## 🎯 INSPIRACIÓN DE DISEÑO

El rediseño está inspirado en las mejores interfaces enterprise y spatial computing de 2025-2026:

### 1. **VisionOS (Apple)**
- Profundidad espacial real
- Glass blur con múltiples niveles de elevación
- Sombras atmosféricas y parallax
- Corner bloom effects

### 2. **Linear 2025**
- Tabs flotantes con glass background
- Microinteracciones fluidas
- Tipografía jerarquizada SF Pro
- Estados hover sutiles y precisos

### 3. **Raycast Pro**
- Comandos capsule con halo lumínico
- Búsqueda glass con blur profundo
- Indicadores de estado brillantes
- Animaciones spring natural

### 4. **Stripe Sigma**
- Cards de métricas con volumen 3D
- Gradientes multicapa sutiles
- Separadores con opacidad baja
- Tipografía datos prominente

### 5. **Vercel Dashboard**
- Fondo atmosférico con gradiente volumétrico
- Elevación diferenciada por contexto
- Botones premium con inner-bevel
- Estados focus con halo azul accesible

### 6. **Coinbase Institutional**
- Profesionalismo regulatorio enterprise
- Claridad jerárquica extrema
- Semántica de color precisa
- Audit trail visible y trazable

---

## 🌌 FONDO ATMOSFÉRICO

### Gradiente Volumétrico

```typescript
background: isDark
  ? 'linear-gradient(180deg, #070B14 0%, #0C111C 50%, #0A0E18 100%)'
  : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)'
```

**Características:**
- **3 color stops:** Crea profundidad volumétrica
- **Vertical (180deg):** Guía la vista de arriba hacia abajo
- **Tonos oscuros ultra-profundos:** #070B14 → #0C111C → #0A0E18 (dark)
- **Tonos claros suaves:** #F8FAFC → #F1F5F9 → #E2E8F0 (light)

### Textura Overlay

```typescript
backgroundImage: isDark
  ? 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)'
  : 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.02) 0%, transparent 50%)'
```

**Efecto:**
- Radial sutil desde el top center
- Añade dimensión sin distraer
- Color azul CERTUS (#3B82F6)
- Opacidad ultra-baja (2-3%)

---

## 🎨 HEADER PREMIUM - GLASS NAVIGATION

### Top Navigation Bar

**Estilo:**
```typescript
background: isDark
  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)'
  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)'
backdropFilter: 'blur(20px) saturate(150%)'
border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.5)'
boxShadow: isDark
  ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.05) inset'
  : '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 0 rgba(255, 255, 255, 0.8) inset'
borderRadius: '20px'
padding: '16px 24px' (px-6 py-4)
```

**Elementos:**

#### 1. Back Button (Capsule)
- **Padding:** 20px 16px (px-5 py-2.5)
- **Border radius:** 14px
- **Background:** rgba(255, 255, 255, 0.04) dark / rgba(255, 255, 255, 0.5) light
- **Icon + Text:** ArrowLeft + "Validaciones"
- **Hover:** translateY(-1px) + brightness increase

#### 2. Notifications Button (Capsule)
- **Size:** 48px × 48px (p-3)
- **Border radius:** 12px
- **Badge:** 8px red dot with glow
- **Position:** absolute top-2 right-2
- **Glow:** `0 0 8px rgba(239, 68, 68, 0.6)`

#### 3. Settings Button (Capsule)
- **Size:** 48px × 48px (p-3)
- **Hover:** rotate(45deg) + translateY(-1px)
- **Transition:** all 300ms

#### 4. User Avatar (Glowing Ring)
- **Ring gradient:** Linear blue → purple
- **Ring glow:** `0 0 20px rgba(59, 130, 246, 0.3)`
- **Inner:** 40px × 40px rounded-[12px]
- **Hover:** scale(1.05) + glow intensity increase

---

## 📄 FILE CARD HERO - CORNER BLOOM

### Estructura de Profundidad

**Outer Container:**
```typescript
borderRadius: '24px'
background: isDark
  ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.5) 100%)'
  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
backdropFilter: 'blur(24px) saturate(180%)'
border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.8)'
```

**Box Shadow (VisionOS Multi-Layer):**
```
Dark:
  - Outer shadow: 0 20px 60px rgba(0, 0, 0, 0.5)
  - Mid shadow: 0 8px 16px rgba(0, 0, 0, 0.3)
  - Inner highlight: 0 1px 0 rgba(255, 255, 255, 0.08) inset
  - Inner depth: 0 -1px 0 rgba(0, 0, 0, 0.5) inset

Light:
  - Outer shadow: 0 20px 60px rgba(0, 0, 0, 0.12)
  - Mid shadow: 0 8px 16px rgba(0, 0, 0, 0.06)
  - Inner highlight: 0 1px 0 rgba(255, 255, 255, 0.9) inset
```

### Corner Bloom Effects

**Top Left:**
```typescript
position: 'absolute'
top: 0, left: 0
width: 384px (w-96), height: 384px (h-96)
background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.08) 0%, transparent 70%)'
filter: 'blur(40px)'
```

**Bottom Right:**
```typescript
position: 'absolute'
bottom: 0, right: 0
width: 384px, height: 384px
background: 'radial-gradient(circle at bottom right, rgba(147, 51, 234, 0.06) 0%, transparent 70%)'
filter: 'blur(40px)'
```

**Efecto:**
- Añade "ambient light" desde las esquinas
- Colores CERTUS: Azul (#3B82F6) + Púrpura (#9333EA)
- Blur profundo (40px) para difusión suave

### File Icon - Floating Mini Card

**Container:**
```typescript
padding: '16px' (p-4)
borderRadius: '16px'
background: isDark
  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.12) 100%)'
  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)'
border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)'
```

**Box Shadow:**
```
Dark:
  - Glow: 0 0 24px rgba(59, 130, 246, 0.2)
  - Depth: 0 8px 16px rgba(0, 0, 0, 0.3)
  - Inner: inset 0 1px 0 rgba(255, 255, 255, 0.1)

Light:
  - Glow: 0 0 24px rgba(59, 130, 246, 0.15)
  - Depth: 0 8px 16px rgba(0, 0, 0, 0.08)
  - Inner: inset 0 1px 0 rgba(255, 255, 255, 0.5)
```

**Icon:**
- FileText, 32px × 32px (h-8 w-8)
- Color: #93C5FD dark / #3B82F6 light

### Tipografía del Archivo

**File Name:**
```typescript
fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif'
fontSize: '20px'
lineHeight: '28px'
fontWeight: 600 (semibold)
color: '#F8FAFF' dark / '#0F172A' light
letterSpacing: '-0.02em'
marginBottom: '12px'
```

**File Type Pill:**
```typescript
fontSize: '13px'
fontWeight: 600 (semibold)
padding: '6px 12px' (px-3 py-1.5)
borderRadius: '10px'
background: Linear gradient blue-violet
color: '#C4B5FD' dark / '#6366F1' light
border: 1px solid rgba(88, 86, 214, 0.3/0.2)
```

**Metadata (Size, Date):**
```typescript
fontSize: '14px'
fontWeight: 500 (medium)
color: '#9CA3AF' dark / '#6B7280' light
separator: '•' (U+2022)
```

### Status Badge - Glowing

**Container:**
```typescript
padding: '12px 20px' (px-5 py-3)
borderRadius: '14px'
background: Depends on status (linear gradient)
border: `1px solid ${statusConfig.border}`
boxShadow: statusConfig.glow
backdropFilter: 'blur(12px)'
```

**Status Configurations:**

| Status | Background Gradient | Border | Glow | Text Color | Icon Color |
|--------|-------------------|--------|------|-----------|-----------|
| **Success** | #10B981 18% → #059669 15% | rgba(16, 185, 129, 0.35) | 20px + 40px glow | #6EE7B7 | #10B981 |
| **Error** | #EF4444 18% → #DC2626 15% | rgba(239, 68, 68, 0.35) | 20px + 40px glow | #FCA5A5 | #EF4444 |
| **Warning** | #F59E0B 18% → #D97706 15% | rgba(245, 158, 11, 0.35) | 20px + 40px glow | #FCD34D | #F59E0B |
| **Processing** | #3B82F6 18% → #2563EB 15% | rgba(59, 130, 246, 0.35) | 20px + 40px glow | #93C5FD | #3B82F6 |
| **Pending** | #6B7280 18% → #4B5563 15% | rgba(107, 114, 128, 0.35) | 20px + 40px glow | #D1D5DB | #6B7280 |

**Typography:**
```typescript
fontSize: '14px'
fontWeight: 700 (bold)
fontFamily: 'SF Pro Text / Inter'
```

---

## 🚀 BOTÓN "REPORTE RESUMEN" - ULTRA-PREMIUM

### Gradiente Multicapa Azul-Violeta-Magenta

```typescript
background: isDark
  ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)'
  : 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 50%, #F472B6 100%)'
```

**Colores:**
- **Azul:** #3B82F6 (CERTUS primary)
- **Violeta:** #8B5CF6 (transition)
- **Magenta:** #EC4899 (accent)

### Sombras VisionOS

**Default:**
```
Dark:
  - Glow: 0 0 40px rgba(59, 130, 246, 0.4)
  - Depth: 0 8px 24px rgba(0, 0, 0, 0.4)
  - Inner bevel: inset 0 1px 0 rgba(255, 255, 255, 0.2)

Light:
  - Glow: 0 0 40px rgba(59, 130, 246, 0.3)
  - Depth: 0 8px 24px rgba(0, 0, 0, 0.12)
  - Inner bevel: inset 0 1px 0 rgba(255, 255, 255, 0.6)
```

**Hover:**
```
Dark:
  - Glow: 0 0 50px rgba(59, 130, 246, 0.6)
  - Depth: 0 12px 32px rgba(0, 0, 0, 0.5)
  - Inner bevel: inset 0 1px 0 rgba(255, 255, 255, 0.25)
  - Transform: translateY(-2px)
```

**Active (Pressed):**
```
Transform: translateY(0) scale(0.98)
```

### Top Glow Direccional

```typescript
position: 'absolute'
top: 0, left: 0, right: 0
height: '2px'
background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)'
```

**Efecto:**
- Simula luz superior reflejada
- Añade profundidad táctil
- Gradiente horizontal con pico central

### Tipografía

```typescript
fontFamily: 'SF Pro Display / Inter'
fontSize: '15px'
fontWeight: 700 (bold)
color: '#FFFFFF'
textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
```

### Microinteracciones

**Sequence:**
1. **Hover:** translateY(-2px) + glow increase (300ms)
2. **Press:** scale(0.98) + glow decrease (100ms)
3. **Release:** scale(1) + translateY(-2px) (200ms)
4. **Leave:** translateY(0) + default glow (300ms)

---

## 🏷️ TABS FLOTANTES - RAYCAST/LINEAR STYLE

### Container Glass

```typescript
background: isDark
  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.4) 100%)'
  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.7) 100%)'
backdropFilter: 'blur(16px) saturate(150%)'
border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.6)'
borderRadius: '18px'
padding: '8px' (px-2 py-2)
```

**Box Shadow:**
```
Dark:
  - Inner: inset 0 1px 0 rgba(255, 255, 255, 0.05)
  - Outer: 0 4px 12px rgba(0, 0, 0, 0.3)

Light:
  - Inner: inset 0 1px 0 rgba(255, 255, 255, 0.8)
  - Outer: 0 4px 12px rgba(0, 0, 0, 0.08)
```

### Tab Button (Active)

```typescript
background: isDark
  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.2) 100%)'
  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.12) 100%)'
border: isDark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)'
color: isDark ? '#93C5FD' : '#3B82F6'
borderRadius: '14px'
padding: '10px 20px' (px-5 py-2.5)
```

**Box Shadow (Active):**
```
Dark:
  - Glow: 0 0 20px rgba(59, 130, 246, 0.2)
  - Inner: inset 0 1px 0 rgba(255, 255, 255, 0.15)

Light:
  - Glow: 0 0 20px rgba(59, 130, 246, 0.15)
  - Inner: inset 0 1px 0 rgba(255, 255, 255, 0.5)
```

### Tab Button (Inactive)

```typescript
background: 'transparent'
border: '1px solid transparent'
color: isDark ? '#9CA3AF' : '#6B7280'
```

**Hover (Inactive):**
```typescript
background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.6)'
transform: 'translateY(-1px)'
```

### Tabs List

- **Resumen:** CheckCircle2 icon
- **Errores (N):** XCircle icon
- **Advertencias (N):** AlertTriangle icon
- **Datos:** FileText icon
- **Versiones (N):** FileText icon (show if > 1)
- **Timeline:** Clock icon
- **Audit Log:** AlertCircle icon

**Typography:**
```typescript
fontFamily: 'SF Pro Text / Inter'
fontSize: '14px'
fontWeight: 600 (semibold)
gap: '10px' (between icon and text)
```

---

## 📊 CARDS DE MÉTRICAS - VOLUMEN 3D

### Card Container

```typescript
borderRadius: '20px'
padding: '24px' (p-6)
background: isDark
  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
backdropFilter: 'blur(20px) saturate(160%)'
border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)'
```

**Box Shadow (Default):**
```
Dark:
  - 0 8px 24px rgba(0, 0, 0, 0.4)
  - inset 0 1px 0 rgba(255, 255, 255, 0.08)

Light:
  - 0 8px 24px rgba(0, 0, 0, 0.08)
  - inset 0 1px 0 rgba(255, 255, 255, 0.8)
```

**Hover:**
```typescript
transform: 'translateY(-2px)'
boxShadow: isDark
  ? `0 12px 32px rgba(0, 0, 0, 0.5), 0 0 24px ${color.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.12)`
  : `0 12px 32px rgba(0, 0, 0, 0.12), 0 0 24px ${color.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.9)`
```

### Floating Icon Mini-Card

```typescript
padding: '12px' (p-3)
borderRadius: '14px'
background: `linear-gradient(135deg, ${color.start}15 0%, ${color.end}12 100%)`
border: `1px solid ${color.start}30`
boxShadow: `0 0 16px ${color.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
```

**Icon Size:** 24px × 24px (h-6 w-6)

**Color Configurations:**

| Metric | Icon | Color Start | Color End | Glow |
|--------|------|------------|----------|------|
| **Total Registros** | FileText | #3B82F6 | #2563EB | rgba(59, 130, 246, 0.3) |
| **Validados OK** | CheckCircle2 | #10B981 | #059669 | rgba(16, 185, 129, 0.3) |
| **Errores** | XCircle | #EF4444 | #DC2626 | rgba(239, 68, 68, 0.3) |
| **Advertencias** | AlertTriangle | #F59E0B | #D97706 | rgba(245, 158, 11, 0.3) |

### Tipografía de Métricas

**Label (Small):**
```typescript
fontFamily: 'SF Pro Text / Inter'
fontSize: '13px'
fontWeight: 500 (medium)
color: '#9CA3AF' dark / '#6B7280' light
letterSpacing: '0.01em'
marginBottom: '8px'
```

**Value (Large & Prominent):**
```typescript
fontFamily: 'SF Pro Display / Inter'
fontSize: '28px'
lineHeight: '32px'
fontWeight: 700 (bold)
color: '#F8FAFF' dark / '#0F172A' light
letterSpacing: '-0.02em'
```

**Percentage (Accent):**
```typescript
fontSize: '16px'
fontWeight: 600 (semibold)
color: '#6EE7B7' dark / '#059669' light
marginLeft: '8px'
```

---

## ✅ SECCIÓN DE VALIDADORES - GLASS PROFUNDO

### Container Principal

```typescript
borderRadius: '20px'
padding: '32px' (p-8)
background: isDark
  ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'
  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
backdropFilter: 'blur(20px) saturate(160%)'
border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.7)'
boxShadow: Same as metrics cards
```

### Header

**Title:**
```typescript
fontFamily: 'SF Pro Display / Inter'
fontSize: '18px'
fontWeight: 700 (bold)
color: '#F8FAFF' dark / '#0F172A' light
marginBottom: '8px'
```

**Description:**
```typescript
fontFamily: 'SF Pro Text / Inter'
fontSize: '14px'
color: '#9CA3AF' dark / '#6B7280' light
marginBottom: '24px'
```

### Group Headers

```typescript
fontFamily: 'SF Pro Text / Inter'
fontSize: '12px'
fontWeight: 700 (bold)
textTransform: 'uppercase'
letterSpacing: '0.05em'
color: '#6B7280' dark / '#9CA3AF' light
marginBottom: '12px'
```

### Validator Item

**Container:**
```typescript
borderRadius: '14px'
padding: '16px' (p-4)
background: isDark ? 'rgba(45, 55, 72, 0.4)' : 'rgba(255, 255, 255, 0.6)'
border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)'
transition: 'all 300ms'
```

**Icon (Status):**
- **Passed:** CheckCircle2, color: #10B981
- **Failed:** XCircle, color: #EF4444
- **Size:** 20px × 20px (h-5 w-5)

**Validator Name:**
```typescript
fontFamily: 'SF Pro Text / Inter'
fontSize: '14px'
fontWeight: 600 (semibold)
color: '#E5E7EB' dark / '#1F2937' light
```

**Validator Metadata:**
```typescript
fontSize: '13px'
fontWeight: 500 (medium)
color: '#9CA3AF' dark / '#6B7280' light
format: "{status} • {duration}ms"
```

**Expand Icon:**
- ChevronDown (expanded) / ChevronRight (collapsed)
- Size: 20px × 20px
- Color: #9CA3AF dark / #6B7280 light

### Expanded Details

**Container:**
```typescript
marginTop: '16px'
paddingTop: '16px'
borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
```

**Detail Items:**
```typescript
fontSize: '13px'
color: '#D1D5DB' dark / '#4B5563' light
marginBottom: '8px'
format: "<span font-semibold>Label:</span> Value"
```

---

## 🎭 MICROINTERACCIONES

### 1. Hover - Elevation

**Elementos afectados:**
- Cards de métricas
- Validator items
- Botones secundarios
- Tabs inactivos

**Transform:**
```typescript
translateY(-1px) to translateY(-2px)
duration: 300ms
easing: ease-out
```

**Shadow Increase:**
```typescript
from: 0 8px 24px rgba(0, 0, 0, 0.4)
to: 0 12px 32px rgba(0, 0, 0, 0.5) + glow
```

### 2. Active (Pressed) - Compression

**Transform:**
```typescript
scale(0.98) + translateY(0)
duration: 100ms
easing: ease-in
```

**Visual Feedback:**
- Oscurecimiento suave (brightness 0.95)
- Shadow reduce a baseline

### 3. Focus - Halo Azul

**Ring:**
```typescript
outline: 2px solid rgba(96, 165, 250, 0.6)
outlineOffset: 2px
boxShadow: 0 0 0 4px rgba(96, 165, 250, 0.2)
```

**Color:** #60A5FA (CERTUS blue light)
**Accesibilidad:** WCAG 2.1 AA compliant

### 4. Settings Icon - Rotation

**Hover:**
```typescript
transform: translateY(-1px) rotate(45deg)
duration: 300ms
easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 5. User Avatar - Scale & Glow

**Hover:**
```typescript
transform: scale(1.05)
boxShadow: from 0 0 20px rgba(59, 130, 246, 0.3)
         to 0 0 30px rgba(59, 130, 246, 0.5)
duration: 300ms
```

---

## 📐 JERARQUÍA TIPOGRÁFICA

### Font Stacks

```typescript
// Display (Headings, Titles)
fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif'

// Text (Body, Labels)
fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, sans-serif'
```

### Escala de Tamaños

| Elemento | Size | Weight | Line Height | Letter Spacing |
|----------|------|--------|-------------|----------------|
| **File Name** | 20px | 600 (Semibold) | 28px | -0.02em |
| **Card Title** | 18px | 700 (Bold) | 24px | 0 |
| **Metric Value** | 28px | 700 (Bold) | 32px | -0.02em |
| **Button Primary** | 15px | 700 (Bold) | 20px | 0 |
| **Tab Label** | 14px | 600 (Semibold) | 20px | 0 |
| **Metadata** | 14px | 500 (Medium) | 20px | 0 |
| **Metric Label** | 13px | 500 (Medium) | 18px | 0.01em |
| **Group Header** | 12px | 700 (Bold) | 16px | 0.05em |

### Colores de Texto

**Dark Mode:**
- **Primary:** #F8FAFF (ultra white)
- **Secondary:** #E5E7EB (light gray)
- **Tertiary:** #9CA3AF (medium gray)
- **Muted:** #6B7280 (dark gray)

**Light Mode:**
- **Primary:** #0F172A (ultra dark)
- **Secondary:** #1F2937 (dark gray)
- **Tertiary:** #6B7280 (medium gray)
- **Muted:** #9CA3AF (light gray)

---

## 🎨 PALETA DE COLORES SEMÁNTICA

### CERTUS Primary

| Color | Hex | Usage |
|-------|-----|-------|
| **Blue 500** | #3B82F6 | Primary actions, icons, links |
| **Blue 400** | #60A5FA | Highlights, active states |
| **Blue 300** | #93C5FD | Text accents dark mode |
| **Blue 600** | #2563EB | Gradient stops, hover states |

### Status Colors

| Status | Start | End | Text (Dark) | Text (Light) |
|--------|-------|-----|-------------|--------------|
| **Success** | #10B981 | #059669 | #6EE7B7 | #059669 |
| **Error** | #EF4444 | #DC2626 | #FCA5A5 | #DC2626 |
| **Warning** | #F59E0B | #D97706 | #FCD34D | #D97706 |
| **Info** | #3B82F6 | #2563EB | #93C5FD | #3B82F6 |
| **Neutral** | #6B7280 | #4B5563 | #D1D5DB | #4B5563 |

### Glass Backgrounds

**Dark Mode:**
```typescript
// Nivel 1 (Highest elevation - Top nav)
'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%)'

// Nivel 2 (Cards, File card)
'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.5) 100%)'
'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.5) 100%)'

// Nivel 3 (Tabs container, Validator items)
'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.4) 100%)'
'rgba(45, 55, 72, 0.4)'
```

**Light Mode:**
```typescript
// Nivel 1
'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)'

// Nivel 2
'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'

// Nivel 3
'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.7) 100%)'
'rgba(255, 255, 255, 0.6)'
```

---

## 🔧 SISTEMA DE BLUR

### Backdrop Filter

| Elemento | Blur | Saturate | Uso |
|----------|------|----------|-----|
| **Top Nav** | 20px | 150% | Navigation bar premium |
| **File Card** | 24px | 180% | Hero section máxima profundidad |
| **Metrics Cards** | 20px | 160% | Stats cards con volumen |
| **Tabs Container** | 16px | 150% | Floating tabs Raycast style |
| **Status Badge** | 12px | 100% | Glowing badges sutiles |
| **Buttons Secondary** | 12px | 100% | Glass buttons actions |

**Notas:**
- Blur más alto (24px) = Más profundidad, más premium
- Saturate > 100% = Colores más vivos a través del glass
- Combinación blur + saturate = Efecto VisionOS auténtico

---

## 📏 BORDER RADIUS SYSTEM

| Elemento | Radius | Efecto |
|----------|--------|--------|
| **Top Nav** | 20px | Capsule premium suave |
| **File Card** | 24px | Hero card ultra-rounded |
| **Metrics Cards** | 20px | Rounded cards balanceadas |
| **Tabs Container** | 18px | Floating bar moderna |
| **Tab Button** | 14px | Pill tabs Raycast style |
| **File Icon Card** | 16px | Mini-card con corner suave |
| **Status Badge** | 14px | Badge glass refined |
| **Button Primary** | 16px | CTA button premium |
| **Button Secondary** | 14px | Action buttons sutiles |
| **Validator Item** | 14px | List items smooth |
| **User Avatar Inner** | 12px | Avatar container |
| **Notification Btn** | 12px | Icon buttons compactos |
| **File Type Pill** | 10px | Small pills tight |

**Filosofía:**
- Más grande = Más prominente e importante
- 24px = Hero elements
- 20px = Primary cards
- 16px-18px = Secondary containers
- 14px = Buttons, pills, list items
- 12px = Small interactive elements
- 10px = Tiny chips

---

## 🌟 CORNER BLOOM SYSTEM

### Técnica

**Radial Gradient:**
```typescript
background: 'radial-gradient(circle at {origin}, {color} 0%, transparent {spread}%)'
filter: 'blur({blur}px)'
position: 'absolute'
pointerEvents: 'none'
size: w-96 h-96 (384px × 384px)
```

### Aplicaciones

**File Card:**
- **Top Left:** Blue #3B82F6 at 8% opacity, 70% spread, 40px blur
- **Bottom Right:** Purple #9333EA at 6% opacity, 70% spread, 40px blur

**Metrics Cards (opcional, on hover):**
- **Center:** Color del stat (green/red/yellow/blue) at 5% opacity, 60% spread, 30px blur

**Efecto:**
- Añade "ambient lighting" sutil
- Guía la atención sin distraer
- Premium spatial feel

---

## 📊 SPACING SYSTEM

### Gaps & Padding

| Contexto | Spacing | Uso |
|----------|---------|-----|
| **Page Container** | 24px (px-6) horizontal, 32px (py-8) vertical | Main layout padding |
| **Section Gap** | 32px (space-y-8) | Entre secciones principales |
| **Cards Grid Gap** | 20px (gap-5) | Grid de metrics cards |
| **Tabs Gap** | 8px (gap-2) | Entre tab buttons |
| **Icon + Text Gap** | 12px (gap-3) | Dentro de botones/badges |
| **Validator Item Gap** | 8px (space-y-2) | Entre validators |
| **Group Section Gap** | 24px (space-y-6) | Entre grupos de validators |
| **Card Internal** | 24px (p-6) | Padding de metrics cards |
| **File Card Internal** | 40px horizontal (px-10), 32px vertical (py-8) | Hero card padding |
| **Tabs Container** | 8px (px-2 py-2) | Tabs bar padding |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Completado ✅

- [x] Fondo atmosférico con gradiente volumétrico
- [x] Textura overlay radial sutil
- [x] Top navigation bar glass premium
- [x] Back button capsule con hover
- [x] Notifications button con badge glowing
- [x] Settings button con rotation hover
- [x] User avatar con glowing ring
- [x] File Card Hero con corner bloom
- [x] File icon floating mini-card
- [x] Tipografía archivo jerarquizada (20px semibold)
- [x] File metadata pills (type, size, date)
- [x] Status badge glowing con gradientes
- [x] Botón "Reporte Resumen" ultra-premium
- [x] Gradiente azul-violeta-magenta
- [x] Top glow direccional
- [x] Microinteracciones hover/press/release
- [x] Botones secundarios glass (Re-validar, Versión Corregida, Borrar)
- [x] Tabs flotantes Raycast/Linear style
- [x] Tab container glass con blur 16px
- [x] Tab buttons active con halo azul
- [x] Tab buttons inactive hover sutil
- [x] Metrics cards con volumen 3D
- [x] Floating icon mini-cards
- [x] Tipografía métricas prominente (28px bold)
- [x] Hover elevation para cards
- [x] Sección validadores glass profundo
- [x] Validator items expandibles
- [x] Group headers uppercase tracking
- [x] Validator status icons (CheckCircle2/XCircle)

### Pendiente (Siguientes Tabs)

- [ ] ErroresTabVisionOS - Lista de errores con expansión
- [ ] AdvertenciasTabVisionOS - Lista de advertencias
- [ ] DatosTabVisionOS - DataViewer integration
- [ ] TimelineTabVisionOS - Timeline vertical con glass
- [ ] AuditTabVisionOS - Audit log table premium

---

## 🚀 CÓMO USAR EL NUEVO DISEÑO

### 1. Importar el Componente

```typescript
import { ValidationDetailVisionOS } from '@/pages/ValidationDetail.visionos'
```

### 2. Agregar a Routes

```typescript
// En App.tsx o router config
<Route path="/validations/:id/visionos" element={<ValidationDetailVisionOS />} />
```

### 3. Navegar desde Lista

```typescript
// En ValidationTable o lista de validaciones
navigate(`/validations/${id}/visionos`)
```

### 4. Comparar con Original

**Original:**
```
/validations/:id  → ValidationDetail (actual)
```

**VisionOS:**
```
/validations/:id/visionos  → ValidationDetailVisionOS (nuevo)
```

---

## 🎯 PRÓXIMOS PASOS

### Fase 2: Completar Tabs Restantes

1. **ErroresTabVisionOS**
   - Lista de errores con semántica de severidad
   - Cards expandibles con detalles completos
   - Botones "Ver registro" y "Ver circular CONSAR"
   - Export errors premium button

2. **AdvertenciasTabVisionOS**
   - Similar a errores pero con amarillo warning
   - Lista compacta sin expansión
   - Icons AlertTriangle

3. **DatosTabVisionOS**
   - Integración con DataViewer existente
   - Header glass premium
   - Export buttons (CSV, Excel) styled
   - Tabla virtual con infinite scroll

4. **TimelineTabVisionOS**
   - Timeline vertical con puntos conectados
   - Glass cards para cada evento
   - Timestamps formatados relativos
   - Icons diferenciados por tipo evento

5. **AuditTabVisionOS**
   - Tabla premium con glass header
   - Rows con hover elevation
   - Columns: Timestamp, Usuario, Acción, Recurso, Detalles, IP
   - Filtros y búsqueda glass

### Fase 3: Refinamientos

1. **Animaciones Spring**
   - React Spring para transiciones suaves
   - Stagger effects en listas
   - Entrance animations

2. **Responsive Optimization**
   - Mobile adaptations
   - Tablet breakpoints
   - Reduce blur en mobile para performance

3. **Dark/Light Mode Toggle**
   - Switch animado en header
   - Transición suave entre temas
   - Persistencia en localStorage

4. **Accesibilidad**
   - ARIA labels completos
   - Keyboard navigation
   - Screen reader optimizations
   - Focus management

---

## 📞 SOPORTE TÉCNICO

**Desarrollador:** Claude (Anthropic AI)
**Fecha:** 23 de Noviembre, 2025
**Versión:** 1.0 - VisionOS Enterprise 2026 Edition

**Archivos Creados:**
1. `app/src/pages/ValidationDetail.visionos.tsx` - Componente principal
2. `VALIDATION_DETAIL_VISIONOS_2026.md` - Documentación completa

**Stack Tecnológico:**
- React 18+ con TypeScript
- TailwindCSS para utilidades base
- Inline styles para glassmorphism y gradientes complejos
- Lucide React para iconografía
- React Router para navegación
- TanStack Query para data fetching

**Dependencias:**
- Todos los hooks existentes (`useValidations`)
- Componentes UI existentes (`Card`, `Button`, `PremiumButtonV2`)
- Stores existentes (`appStore` para theme)

---

## 🎉 CONCLUSIÓN

Se ha creado un **rediseño completo VisionOS-Enterprise 2026** de la vista ValidationDetail con:

✅ **Fondo atmosférico** volumétrico con gradiente 3-color
✅ **Header premium** glass con avatar glowing ring
✅ **File Card Hero** con corner bloom effects
✅ **Botón ultra-premium** gradiente multicapa azul-violeta-magenta
✅ **Tabs flotantes** estilo Raycast/Linear con glass blur
✅ **Cards de métricas** con volumen 3D y floating icons
✅ **Sección validadores** glass profundo expandible
✅ **Microinteracciones** fluidas hover/active/focus
✅ **Tipografía jerarquizada** SF Pro Display/Inter
✅ **Semántica de color** precisa para enterprise fintech

**El resultado es una interfaz altamente profesional, refinada, coherente, táctil y moderna, lista para regulatorio CONSAR 2026.** 🚀

---

**Estado:** ✅ FASE 1 COMPLETADA - Validar en ruta `/validations/:id/visionos`
