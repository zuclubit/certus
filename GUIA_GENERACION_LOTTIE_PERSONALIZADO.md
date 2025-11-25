# GUÍA DE GENERACIÓN DE LOTTIE JSON PERSONALIZADO - CERTUS

**Fecha:** 22 de noviembre de 2025
**Versión:** 1.0
**Objetivo:** Crear iconos Lottie JSON personalizados con colores nativos Certus

---

## 🎯 OBJETIVO

Reemplazar los iconos Lottie actuales (que usan CSS filters) con **iconos Lottie JSON personalizados** que tengan:

1. **Colores nativos Certus** integrados en el JSON
2. **Estados múltiples** (inactive/active) dentro del mismo archivo
3. **Animaciones optimizadas** para el diseño de Certus
4. **Eliminación de CSS filters** pesados

**Ventajas:**
- ✅ Mejor rendimiento (sin CSS filters complejos)
- ✅ Colores exactos sin aproximaciones
- ✅ Animaciones más fluidas
- ✅ Control total del diseño
- ✅ Coherencia visual perfecta con logo-v3.png

---

## 📊 ICONOS ACTUALES A REEMPLAZAR

### Inventario de Iconos

| Archivo JSON | Uso en Aplicación | Estado Actual |
|-------------|-------------------|---------------|
| `home.json` | Dashboard (navegación principal) | CSS filters aplicados |
| `Submited.json` | Validaciones (submitted forms) | CSS filters aplicados |
| `reports.json` | Reportes (reports section) | CSS filters aplicados |
| `catalogs.json` | Catálogos (catalogs management) | CSS filters aplicados |
| `Register.json` | Usuarios (user registration) | CSS filters aplicados |
| `setting.json` | Configuración (settings) | CSS filters aplicados |
| `user-profile.json` | Perfil de usuario (header) | CSS filters aplicados |
| `notification.json` | Notificaciones (header) | CSS filters aplicados |
| `light-mode.json` | Cambio de tema (header) | CSS filters aplicados |
| `loadfile.json` | Subir archivo (file upload) | CSS filters aplicados |
| `analytics.json` | Analytics (dashboard/reports) | CSS filters aplicados |

**Total:** 11 iconos a personalizar

---

## 🎨 ESPECIFICACIONES DE COLOR CERTUS

### Paleta Base (extraída de logo-v3.png)

```json
{
  "certus_colors": {
    "primary_blue": {
      "light": "#3B82F6",
      "main": "#2563EB",
      "dark": "#1E40AF",
      "rgb_light": [59, 130, 246],
      "rgb_main": [37, 99, 235],
      "rgb_dark": [30, 64, 175]
    },
    "cyan_accent": {
      "light": "#7DD3FC",
      "main": "#38BDF8",
      "dark": "#0EA5E9",
      "rgb_light": [125, 211, 252],
      "rgb_main": [56, 189, 248],
      "rgb_dark": [14, 165, 233]
    },
    "gradient": {
      "from": "#60A5FA",
      "to": "#93C5FD",
      "rgb_from": [96, 165, 250],
      "rgb_to": [147, 197, 253]
    },
    "neutral": {
      "light": "#94A3B8",
      "main": "#64748B",
      "dark": "#475569",
      "rgb_light": [148, 163, 184],
      "rgb_main": [100, 116, 139],
      "rgb_dark": [71, 85, 105]
    },
    "white": {
      "pure": "#FFFFFF",
      "rgb": [255, 255, 255]
    }
  }
}
```

---

## 🔧 ESTRATEGIA DE COLOR POR ESTADO

### Estado INACTIVE (Inactivo)

#### Light Mode
- **Color principal:** `#2563EB` (Primary Blue Main)
- **Color secundario:** `#1E40AF` (Primary Blue Dark - para detalles)
- **Opacidad:** 100%
- **Efecto:** Sin glow (será añadido por CSS si es necesario)

#### Dark Mode
- **Color principal:** `#60A5FA` (Gradient From - Sky Blue)
- **Color secundario:** `#38BDF8` (Cyan Main - para highlights)
- **Opacidad:** 100%
- **Efecto:** Sin glow (será añadido por CSS si es necesario)

---

### Estado ACTIVE (Activo)

#### Ambos Modos
- **Color principal:** `#FFFFFF` (White Pure)
- **Color acento:** `#7DD3FC` (Cyan Light - para detalles opcionales)
- **Opacidad:** 100%
- **Efecto:** CSS glow cyan será añadido (ya implementado en LottieIcon.tsx)

---

## 📐 ESTRUCTURA LOTTIE JSON

### Análisis de Estructura Actual

Los archivos Lottie actuales tienen esta estructura:

```json
{
  "v": "5.12.2",              // Versión Lottie
  "fr": 29.97,                // Frame rate
  "ip": 0,                    // In-point (frame inicio)
  "op": 45,                   // Out-point (frame fin)
  "w": 48,                    // Width (píxeles)
  "h": 48,                    // Height (píxeles)
  "nm": "icon-name",          // Nombre
  "ddd": 0,                   // 3D layers (0=2D, 1=3D)
  "assets": [],               // Assets externos
  "layers": [                 // Capas del icono
    {
      "ty": 4,                // Tipo de capa (4=shape)
      "shapes": [
        {
          "ty": "gr",         // Tipo grupo
          "it": [
            {
              "ty": "sh",     // Shape path
              "ks": {...}     // Keyframes
            },
            {
              "ty": "st",     // Stroke
              "c": {
                "a": 0,
                "k": [0.325, 0.427, 0.996], // RGB normalizado (0-1)
                "ix": 3
              },
              "w": {"a": 0, "k": 1}  // Stroke width
            },
            {
              "ty": "fl",     // Fill
              "c": {
                "a": 0,
                "k": [1, 1, 1],  // RGB (white)
                "ix": 4
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Puntos Críticos para Modificar

1. **Stroke colors (`"ty": "st"`):**
   ```json
   "c": {
     "a": 0,
     "k": [0.145, 0.388, 0.922],  // RGB normalizado: #2563EB
     "ix": 3
   }
   ```

2. **Fill colors (`"ty": "fl"`):**
   ```json
   "c": {
     "a": 0,
     "k": [0.231, 0.510, 0.965],  // RGB normalizado: #3B82F6
     "ix": 4
   }
   ```

3. **Animaciones de color (opcional):**
   ```json
   "c": {
     "a": 1,  // Animado
     "k": [
       {
         "t": 0,
         "s": [0.231, 0.510, 0.965],  // Color inicio
         "e": [1, 1, 1]                // Color fin (white)
       }
     ]
   }
   ```

---

## 🛠️ MÉTODOS DE GENERACIÓN

### Opción 1: Adobe After Effects + Bodymovin (RECOMENDADO)

**Herramientas:**
- Adobe After Effects 2025
- Plugin Bodymovin (LottieFiles extension)

**Proceso:**

1. **Diseñar icono en After Effects:**
   - Crear composición 48x48px
   - Usar Shape Layers (no paths de Illustrator)
   - Aplicar colores Certus directamente
   - Animar si es necesario (0-45 frames @ 29.97fps)

2. **Configurar colores:**
   - Inactive state: usar `#2563EB` (light) o `#60A5FA` (dark)
   - Active state: usar `#FFFFFF`
   - Crear marcadores de tiempo si necesitas estados

3. **Exportar con Bodymovin:**
   - File → Scripts → Bodymovin
   - Seleccionar composición
   - Export settings:
     - ✅ Shapes only (no images)
     - ✅ Optimize JSON
     - ✅ Export modes: Standalone
     - ❌ No expressions (mejor performance)

4. **Validar JSON:**
   - Verificar colores en formato [R/255, G/255, B/255]
   - Verificar tamaño < 10KB

---

### Opción 2: LottieFiles Creator (WEB - MÁS FÁCIL)

**URL:** https://lottiefiles.com/create

**Proceso:**

1. **Crear cuenta en LottieFiles**

2. **Usar Creator (editor web):**
   - Template: Start from scratch (48x48)
   - Dibujar icono con herramientas de shapes
   - Aplicar colores Certus:
     - Color picker → ingresar hex: `#2563EB`
     - O usar RGB normalizado: `rgb(37, 99, 235)`

3. **Animar (opcional):**
   - Timeline: 0-1.5s (45 frames @ 30fps)
   - Usar keyframes para animaciones simples

4. **Exportar:**
   - Download → Lottie JSON
   - Optimizar → Enable all optimizations

**Ventajas:**
- ✅ No requiere After Effects
- ✅ Preview en tiempo real
- ✅ Librería de assets gratis
- ✅ Optimización automática

**Desventajas:**
- ❌ Menos control que After Effects
- ❌ Limitado para animaciones complejas

---

### Opción 3: Edición Manual del JSON (AVANZADO)

**Para usuarios con conocimientos de JSON/programación**

**Proceso:**

1. **Copiar JSON existente:**
   ```bash
   cp icons/home.json icons/home-custom.json
   ```

2. **Buscar y reemplazar colores:**
   ```javascript
   // Script Node.js para automatizar
   const fs = require('fs');

   const CERTUS_COLORS = {
     primary_blue_main: [37/255, 99/255, 235/255],  // #2563EB
     cyan_gradient_from: [96/255, 165/255, 250/255], // #60A5FA
     white: [1, 1, 1]
   };

   let json = JSON.parse(fs.readFileSync('icons/home.json'));

   // Función recursiva para encontrar y reemplazar colores
   function replaceColors(obj, mode = 'light') {
     if (typeof obj !== 'object') return;

     for (let key in obj) {
       if (key === 'c' && obj[key].k) {
         // Reemplazar color
         if (mode === 'light') {
           obj[key].k = CERTUS_COLORS.primary_blue_main;
         } else {
           obj[key].k = CERTUS_COLORS.cyan_gradient_from;
         }
       }
       if (typeof obj[key] === 'object') {
         replaceColors(obj[key], mode);
       }
     }
   }

   replaceColors(json, 'light');
   fs.writeFileSync('icons/home-custom-light.json', JSON.stringify(json));
   ```

3. **Validar con LottieFiles:**
   - Subir a https://lottiefiles.com/preview
   - Verificar visualmente

**Ventajas:**
- ✅ Control total del JSON
- ✅ Automatizable con scripts
- ✅ No requiere software adicional

**Desventajas:**
- ❌ Requiere conocimientos técnicos
- ❌ Fácil romper la estructura
- ❌ Tedioso para 11 iconos

---

## 📝 ESPECIFICACIONES POR ICONO

### 1. home.json (Dashboard)

**Diseño:**
- Icono de casa simple con techo y base
- Animación: Puerta que se abre (opcional)

**Colores Light Mode:**
- Estructura (stroke): `#2563EB`
- Relleno base: `#3B82F6`
- Detalles (puerta): `#1E40AF`

**Colores Dark Mode:**
- Estructura (stroke): `#60A5FA`
- Relleno base: `#38BDF8`
- Highlights: `#7DD3FC`

**Animación:**
- 0-22 frames: Estado estático
- 22-44 frames: Breathing effect (scale 100% → 110% → 100%)

---

### 2. Submited.json (Validaciones)

**Diseño:**
- Checkmark con círculo o documento con check
- Animación: Check aparece con stroke animation

**Colores Light Mode:**
- Círculo/documento: `#2563EB`
- Checkmark: `#3B82F6` (más brillante)

**Colores Dark Mode:**
- Círculo/documento: `#60A5FA`
- Checkmark: `#7DD3FC` (más brillante)

**Animación:**
- 0-15 frames: Círculo estático
- 15-35 frames: Checkmark dibujándose (trim path 0% → 100%)
- 35-44 frames: Hold

---

### 3. reports.json (Reportes)

**Diseño:**
- Documento con gráficas/líneas
- Animación: Líneas dibujándose

**Colores Light Mode:**
- Documento (outline): `#2563EB`
- Líneas gráficas: `#3B82F6`, `#1E40AF` (alternadas)

**Colores Dark Mode:**
- Documento (outline): `#60A5FA`
- Líneas gráficas: `#38BDF8`, `#7DD3FC` (alternadas)

**Animación:**
- 0-20 frames: Documento estático
- 20-40 frames: Líneas gráficas aparecen (trim path)

---

### 4. catalogs.json (Catálogos)

**Diseño:**
- Grid de 4 cuadrados o libreta abierta
- Animación: Cuadrados aparecen secuencialmente

**Colores Light Mode:**
- Grid (outline): `#2563EB`
- Cuadrados: `#3B82F6`, `#2563EB` (alternados)

**Colores Dark Mode:**
- Grid (outline): `#60A5FA`
- Cuadrados: `#38BDF8`, `#60A5FA` (alternados)

**Animación:**
- 0-10 frames: Cuadrado 1 aparece
- 10-20 frames: Cuadrado 2 aparece
- 20-30 frames: Cuadrado 3 aparece
- 30-40 frames: Cuadrado 4 aparece

---

### 5. Register.json (Usuarios)

**Diseño:**
- Usuario simple (cabeza + hombros) con + (plus)
- Animación: Plus aparece/pulsa

**Colores Light Mode:**
- Usuario (outline): `#2563EB`
- Plus icon: `#3B82F6`

**Colores Dark Mode:**
- Usuario (outline): `#60A5FA`
- Plus icon: `#7DD3FC`

**Animación:**
- 0-22 frames: Usuario estático
- 22-44 frames: Plus pulsa (scale 100% → 120% → 100%)

---

### 6. setting.json (Configuración)

**Diseño:**
- Engranaje (gear) clásico
- Animación: Rotación 360°

**Colores Light Mode:**
- Engranaje exterior: `#2563EB`
- Centro: `#3B82F6`

**Colores Dark Mode:**
- Engranaje exterior: `#60A5FA`
- Centro: `#7DD3FC`

**Animación:**
- 0-44 frames: Rotación completa 360°

---

### 7. user-profile.json (Perfil)

**Diseño:**
- Usuario simple (cabeza + hombros)
- Animación: Subtle breathing

**Colores Light Mode:**
- Outline: `#2563EB`
- Fill: `#3B82F6`

**Colores Dark Mode:**
- Outline: `#60A5FA`
- Fill: `#38BDF8`

**Animación:**
- 0-44 frames: Scale 100% → 105% → 100% (breathing)

---

### 8. notification.json (Notificaciones)

**Diseño:**
- Campana (bell) con badge (punto)
- Animación: Campana balancea (swing)

**Colores Light Mode:**
- Campana: `#2563EB`
- Badge (punto): `#EF4444` (red exception - alerta)

**Colores Dark Mode:**
- Campana: `#60A5FA`
- Badge: `#F87171` (red light)

**Animación:**
- 0-15 frames: Swing izquierda (-15°)
- 15-30 frames: Swing derecha (+15°)
- 30-44 frames: Return center (0°)

---

### 9. light-mode.json (Tema)

**Diseño:**
- Sol/Luna toggle
- Animación: Transición sol → luna

**Colores Light Mode (SOL):**
- Sol exterior: `#FBBF24` (yellow - exception)
- Rayos: `#F59E0B`

**Colores Dark Mode (LUNA):**
- Luna: `#60A5FA` (cyan)
- Estrellas: `#7DD3FC`

**Animación:**
- 0-22 frames: Sol visible
- 22-44 frames: Luna visible (morph)

---

### 10. loadfile.json (Subir Archivo)

**Diseño:**
- Documento con flecha hacia arriba
- Animación: Flecha sube

**Colores Light Mode:**
- Documento: `#2563EB`
- Flecha: `#3B82F6`

**Colores Dark Mode:**
- Documento: `#60A5FA`
- Flecha: `#7DD3FC`

**Animación:**
- 0-22 frames: Flecha en posición baja
- 22-35 frames: Flecha sube (translate Y)
- 35-44 frames: Hold arriba

---

### 11. analytics.json (Analytics)

**Diseño:**
- Gráfica de barras ascendente
- Animación: Barras crecen

**Colores Light Mode:**
- Barras: `#2563EB`, `#3B82F6`, `#1E40AF` (altura determina tono)
- Ejes: `#64748B`

**Colores Dark Mode:**
- Barras: `#60A5FA`, `#38BDF8`, `#7DD3FC`
- Ejes: `#94A3B8`

**Animación:**
- 0-10 frames: Barra 1 crece (height 0% → 100%)
- 10-20 frames: Barra 2 crece
- 20-30 frames: Barra 3 crece
- 30-40 frames: Barra 4 crece

---

## 🔄 ESTRATEGIA DE DUAL-MODE (Light/Dark)

### Opción A: Dos archivos por icono (SIMPLE)

**Estructura:**
```
/icons/
  ├── home-light.json
  ├── home-dark.json
  ├── setting-light.json
  ├── setting-dark.json
  └── ...
```

**lottieIcons.ts modificado:**
```typescript
import homeLight from '../../../icons/home-light.json'
import homeDark from '../../../icons/home-dark.json'

export const lottieIcons = {
  home: {
    light: homeLight,
    dark: homeDark
  },
  // ...
}
```

**LottieIcon.tsx modificado:**
```typescript
const animationData = isDark
  ? lottieIcons[iconKey].dark
  : lottieIcons[iconKey].light
```

**Ventajas:**
- ✅ Implementación simple
- ✅ No requiere lógica compleja

**Desventajas:**
- ❌ Doble mantenimiento (22 archivos)
- ❌ Mayor tamaño del bundle

---

### Opción B: Un archivo con capas condicionales (AVANZADO)

**Estructura JSON con layers marcados:**
```json
{
  "layers": [
    {
      "nm": "shape-light-mode",
      "ks": {...},
      "shapes": [...]
    },
    {
      "nm": "shape-dark-mode",
      "ks": {...},
      "shapes": [...]
    }
  ]
}
```

**LottieIcon.tsx con layer filtering:**
```typescript
useEffect(() => {
  if (!lottieRef.current) return

  const lottie = lottieRef.current
  const layers = lottie.renderer.elements

  layers.forEach(layer => {
    if (layer.layerName?.includes('light-mode')) {
      layer.hide(!isDark)
    }
    if (layer.layerName?.includes('dark-mode')) {
      layer.hide(isDark)
    }
  })
}, [isDark])
```

**Ventajas:**
- ✅ Un solo archivo por icono (11 archivos)
- ✅ Transición suave entre modos

**Desventajas:**
- ❌ JSON más pesado
- ❌ Lógica adicional en componente
- ❌ Mayor complejidad

---

## 🎯 RECOMENDACIÓN FINAL

### Estrategia Híbrida (BALANCE PERFECTO)

1. **Usar Opción A** (dos archivos) para la implementación inicial
2. **Colores optimizados** para cada modo sin necesidad de CSS filters
3. **Mantener CSS filters solo para estado active** (white + glow)

**Modificaciones mínimas en código:**

```typescript
// lottieIcons.ts
export const lottieIconsLight = {
  home: homeLight,
  validations: submitedLight,
  // ...
}

export const lottieIconsDark = {
  home: homeDark,
  validations: submitedDark,
  // ...
}
```

```typescript
// LottieIcon.tsx - línea ~100
const iconSet = isDark ? lottieIconsDark : lottieIconsLight
const animationData = iconSet[iconKey]

// Simplificar filtros
const getFilter = () => {
  if (isActive) {
    return getActiveFilter() // Solo white + glow
  }
  return 'none' // ¡Sin filtros! Colores nativos del JSON
}
```

**Resultado:**
- ✅ Colores perfectos sin CSS filters
- ✅ Mejor performance
- ✅ Código más simple
- ✅ Fácil mantenimiento

---

## 📦 ENTREGABLES

### Para Diseñador/Desarrollador

1. **22 archivos Lottie JSON** (11 iconos × 2 modos):
   - `home-light.json`, `home-dark.json`
   - `setting-light.json`, `setting-dark.json`
   - `reports-light.json`, `reports-dark.json`
   - ... (etc. para los 11 iconos)

2. **Especificaciones por archivo:**
   - Dimensiones: 48×48px
   - Frame rate: 29.97fps
   - Duración: 45 frames (~1.5s)
   - Formato: Lottie JSON optimizado
   - Tamaño: < 10KB por archivo
   - Colores: Según paleta Certus (arriba)

3. **Validación:**
   - ✅ Preview en LottieFiles funciona correctamente
   - ✅ Colores exactos (verificar con color picker)
   - ✅ Animación suave sin glitches
   - ✅ Tamaño optimizado (< 10KB)
   - ✅ Compatible con lottie-react 2.4.1

---

## 🚀 IMPLEMENTACIÓN EN CÓDIGO

### Paso 1: Reemplazar archivos

```bash
# Backup de archivos actuales
mkdir icons/backup
cp icons/*.json icons/backup/

# Colocar nuevos archivos
cp nuevos-iconos/home-light.json icons/
cp nuevos-iconos/home-dark.json icons/
# ... (resto de archivos)
```

### Paso 2: Actualizar lottieIcons.ts

```typescript
/**
 * Lottie Icons Mapping - CERTUS CUSTOM ICONS
 * Versión 2.0 - Colores nativos por modo (light/dark)
 */

// Light Mode Icons
import homeLightAnimation from '../../../icons/home-light.json'
import submitedLightAnimation from '../../../icons/Submited-light.json'
import reportsLightAnimation from '../../../icons/reports-light.json'
import catalogsLightAnimation from '../../../icons/catalogs-light.json'
import registerLightAnimation from '../../../icons/Register-light.json'
import settingLightAnimation from '../../../icons/setting-light.json'
import userProfileLightAnimation from '../../../icons/user-profile-light.json'
import notificationLightAnimation from '../../../icons/notification-light.json'
import lightModeLightAnimation from '../../../icons/light-mode-light.json'
import loadFileLightAnimation from '../../../icons/loadfile-light.json'
import analyticsLightAnimation from '../../../icons/analytics-light.json'

// Dark Mode Icons
import homeDarkAnimation from '../../../icons/home-dark.json'
import submitedDarkAnimation from '../../../icons/Submited-dark.json'
import reportsDarkAnimation from '../../../icons/reports-dark.json'
import catalogsDarkAnimation from '../../../icons/catalogs-dark.json'
import registerDarkAnimation from '../../../icons/Register-dark.json'
import settingDarkAnimation from '../../../icons/setting-dark.json'
import userProfileDarkAnimation from '../../../icons/user-profile-dark.json'
import notificationDarkAnimation from '../../../icons/notification-dark.json'
import lightModeDarkAnimation from '../../../icons/light-mode-dark.json'
import loadFileDarkAnimation from '../../../icons/loadfile-dark.json'
import analyticsDarkAnimation from '../../../icons/analytics-dark.json'

export const lottieIconsLight = {
  home: homeLightAnimation,
  validations: submitedLightAnimation,
  reports: reportsLightAnimation,
  catalogs: catalogsLightAnimation,
  users: registerLightAnimation,
  settings: settingLightAnimation,
  userProfile: userProfileLightAnimation,
  notification: notificationLightAnimation,
  lightMode: lightModeLightAnimation,
  loadFile: loadFileLightAnimation,
  analytics: analyticsLightAnimation,
}

export const lottieIconsDark = {
  home: homeDarkAnimation,
  validations: submitedDarkAnimation,
  reports: reportsDarkAnimation,
  catalogs: catalogsDarkAnimation,
  users: registerDarkAnimation,
  settings: settingDarkAnimation,
  userProfile: userProfileDarkAnimation,
  notification: notificationDarkAnimation,
  lightMode: lightModeDarkAnimation,
  loadFile: loadFileDarkAnimation,
  analytics: analyticsDarkAnimation,
}

export type LottieIconKey = keyof typeof lottieIconsLight

// Función helper para obtener icono según modo
export const getLottieIcon = (key: LottieIconKey, isDark: boolean) => {
  return isDark ? lottieIconsDark[key] : lottieIconsLight[key]
}
```

### Paso 3: Actualizar LottieIcon.tsx

```typescript
// Línea ~96 - Modificar props
interface LottieIconProps {
  animationData?: any  // Hacer opcional
  iconKey?: LottieIconKey  // Nuevo prop para auto-select
  isActive?: boolean
  className?: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
  hoverEnabled?: boolean
}

// Línea ~100 - Auto-select animation data
const theme = useAppStore(selectTheme)
const isDark = theme === 'dark'

// Auto-seleccionar animationData según theme y iconKey
const selectedAnimationData = animationData ||
  (iconKey ? getLottieIcon(iconKey, isDark) : null)

// Línea ~207 - Simplificar filtros (ELIMINAR getInactiveFilter y getHoverFilter)
const getFilter = () => {
  if (isActive) {
    // Solo white + glow para estado activo
    return `
      brightness(0)
      saturate(100%)
      invert(1)
      drop-shadow(0 0 4px rgba(125, 211, 252, 0.8))
      drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))
      drop-shadow(0 0 12px rgba(96, 165, 250, 0.4))
      drop-shadow(0 1px 5px rgba(0, 0, 0, 0.35))
      drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))
    `.trim()
  }

  // Colores nativos del JSON, sin filtros!
  return 'none'
}

// Línea ~301 - Aplicar filtro simplificado
style={{
  filter: getFilter(),
  transition: 'filter 0.3s ease-in-out',
}}
```

### Paso 4: Actualizar componentes que usan iconos

```typescript
// Antes
<LottieIcon
  animationData={lottieIcons.home}
  isActive={isActive}
/>

// Después (auto-select por theme)
<LottieIcon
  iconKey="home"
  isActive={isActive}
/>
```

---

## ✅ VALIDACIÓN Y TESTING

### Checklist de Validación

- [ ] **Archivo JSON válido:** Se carga sin errores en navegador
- [ ] **Colores correctos Light Mode:**
  - Home icon: `#2563EB` ✓
  - Settings icon: `#2563EB` ✓
  - Reports icon: `#2563EB` ✓
- [ ] **Colores correctos Dark Mode:**
  - Home icon: `#60A5FA` ✓
  - Settings icon: `#60A5FA` ✓
  - Reports icon: `#60A5FA` ✓
- [ ] **Estado Active:** White + cyan glow funciona
- [ ] **Animaciones:** Smooth sin glitches
- [ ] **Performance:** No lag en transiciones
- [ ] **Tamaño bundle:** No incremento > 50KB total
- [ ] **Theme switching:** Cambio instantáneo light/dark
- [ ] **Hover:** Funciona correctamente (si hoverEnabled=true)

---

## 📚 RECURSOS

### Herramientas Online

1. **LottieFiles Creator:** https://lottiefiles.com/create
2. **Lottie Preview:** https://lottiefiles.com/preview
3. **Color Converter (HEX → RGB normalized):** https://convertingcolors.com/
4. **Lottie Optimizer:** https://lottiefiles.com/tools/lottie-optimizer

### Documentación

1. **Lottie Spec:** https://lottiefiles.github.io/lottie-docs/
2. **After Effects to Lottie:** https://airbnb.io/lottie/
3. **Bodymovin Plugin:** https://aescripts.com/bodymovin/

### Paleta de Colores Certus (Referencia Rápida)

```
Light Mode Inactive:  #2563EB (rgb: 37, 99, 235)
Dark Mode Inactive:   #60A5FA (rgb: 96, 165, 250)
Active (both modes):  #FFFFFF (rgb: 255, 255, 255)
```

**RGB Normalizado (para Lottie JSON):**
```json
{
  "light_inactive": [0.145, 0.388, 0.922],
  "dark_inactive": [0.376, 0.647, 0.980],
  "active": [1.0, 1.0, 1.0]
}
```

---

## 🎯 PRÓXIMOS PASOS

1. **Seleccionar método de generación:**
   - LottieFiles Creator (recomendado para no-designers)
   - After Effects (para diseñadores profesionales)
   - Edición manual (para developers avanzados)

2. **Crear archivos piloto:**
   - Empezar con 2-3 iconos (ej: home, setting, reports)
   - Validar con equipo
   - Iterar según feedback

3. **Producción completa:**
   - Generar los 22 archivos restantes
   - Optimizar tamaños
   - Implementar en código

4. **Testing exhaustivo:**
   - Validar en diferentes navegadores
   - Verificar performance
   - Confirmar coherencia visual con logo

5. **Deployment:**
   - Reemplazar archivos en `/icons/`
   - Actualizar imports en código
   - Testing en staging
   - Deploy a producción

---

**Documentado por:** Claude Code (Sonnet 4.5)
**Fecha:** 22 de noviembre de 2025
**Versión:** 1.0 - Guía de Generación de Lottie JSON Personalizado
