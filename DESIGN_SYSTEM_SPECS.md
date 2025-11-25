# Premium Enterprise Navigation Design System

## 📐 Especificaciones Técnicas Completas

Sistema de navegación de nivel enterprise siguiendo:
- **Apple Human Interface Guidelines** (HIG)
- **Material Design 3** (Material You)
- **Microsoft Fluent 2**
- **Tendencias 2025-2026**

Estética inspirada en: Linear, Arc Browser, iCloud 2025, VisionOS

---

## 🎨 Paleta de Colores

### Light Mode

#### Primary (Brand)
```css
--primary-50: #EFF6FF;
--primary-100: #DBEAFE;
--primary-200: #BFDBFE;
--primary-300: #93C5FD;
--primary-400: #60A5FA;
--primary-500: #3B82F6;  /* Main */
--primary-600: #2563EB;  /* Active state */
--primary-700: #1D4ED8;
--primary-800: #1E40AF;
--primary-900: #1E3A8A;
```

#### Neutral (WCAG AAA)
```css
--neutral-0: #FFFFFF;
--neutral-50: #FAFAFA;   /* Background */
--neutral-100: #F5F5F5;  /* Secondary BG */
--neutral-200: #E5E5E5;  /* Border light */
--neutral-300: #D4D4D4;  /* Border */
--neutral-400: #A3A3A3;  /* Disabled */
--neutral-500: #737373;  /* Placeholder */
--neutral-600: #525252;  /* Secondary text (7:1) */
--neutral-700: #404040;  /* Body text (10:1) */
--neutral-800: #262626;  /* Headings */
--neutral-900: #171717;  /* Emphasis */
--neutral-950: #0A0A0A;  /* Max contrast */
```

#### Semantic Colors
```css
/* Success (Arc Green) */
--success-500: #10B981;
--success-600: #059669;

/* Warning (Warm Amber) */
--warning-500: #F59E0B;
--warning-600: #D97706;

/* Danger (Linear Red) */
--danger-500: #EF4444;
--danger-600: #DC2626;
```

#### Interactive States
```css
--interactive-hover: rgba(0, 0, 0, 0.04);
--interactive-pressed: rgba(0, 0, 0, 0.08);
--interactive-focus: #3B82F6;
--interactive-focus-ring: rgba(59, 130, 246, 0.5);
```

### Dark Mode

#### Primary (Adjusted)
```css
--primary-500: #60A5FA;  /* Lighter for dark */
--primary-600: #93C5FD;  /* Active state */
```

#### Neutral (Inverted)
```css
--neutral-50: #0A0A0A;   /* Background */
--neutral-100: #171717;  /* Secondary BG */
--neutral-600: #A3A3A3;  /* Secondary text */
--neutral-700: #D4D4D4;  /* Body text */
```

---

## 📝 Tipografía

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont,
             'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
```

### Type Scale (Modular Scale 1.125)

#### Navigation Specific
```css
/* Mobile Bottom Nav */
--nav-mobile-label: 10px;
--nav-mobile-icon: 22px;
--nav-mobile-badge: 9px;

/* Tablet */
--nav-tablet-label: 11px;
--nav-tablet-icon: 24px;
--nav-tablet-badge: 10px;

/* Desktop Sidebar */
--nav-desktop-label: 13px;
--nav-desktop-icon: 20px;
--nav-desktop-badge: 10px;
```

#### Full Scale
```css
--text-xs: 11px;   /* 0.6875rem */
--text-sm: 13px;   /* 0.8125rem */
--text-base: 15px; /* 0.9375rem - VisionOS base */
--text-md: 17px;   /* 1.0625rem */
--text-lg: 19px;   /* 1.1875rem */
--text-xl: 22px;   /* 1.375rem */
--text-2xl: 28px;  /* 1.75rem */
--text-3xl: 34px;  /* 2.125rem */
```

### Font Weights
```css
--font-regular: 400;   /* Body */
--font-medium: 500;    /* Nav labels */
--font-semibold: 590;  /* Active (SF Pro optimized) */
--font-bold: 650;      /* Emphasis */
```

### Line Heights
```css
--leading-tight: 1.2;   /* Headlines */
--leading-nav: 1.3;     /* Navigation */
--leading-base: 1.5;    /* Body */
--leading-relaxed: 1.6; /* Reading */
```

### Letter Spacing (Tracking)
```css
--tracking-tighter: -0.02em; /* Large headlines */
--tracking-tight: -0.01em;   /* Nav labels */
--tracking-normal: 0;
--tracking-wide: 0.01em;
--tracking-wider: 0.025em;   /* ALL CAPS */
```

---

## 📏 Spacing System

### Base Scale (8px grid)
```css
--space-px: 1px;
--space-0.5: 2px;
--space-1: 4px;
--space-1.5: 6px;
--space-2: 8px;
--space-2.5: 10px;
--space-3: 12px;
--space-3.5: 14px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Navigation Specific

#### Mobile
```css
--nav-mobile-container-padding: 12px;
--nav-mobile-item-gap: 4px;
--nav-mobile-item-padding: 8px;
--nav-mobile-icon-label-gap: 4px;
```

#### Tablet
```css
--nav-tablet-container-padding: 14px;
--nav-tablet-item-gap: 6px;
--nav-tablet-item-padding: 10px;
--nav-tablet-icon-label-gap: 5px;
```

#### Desktop
```css
--nav-desktop-container-padding: 12px;
--nav-desktop-item-gap: 4px;
--nav-desktop-item-padding: 10px 12px;
--nav-desktop-icon-label-gap: 12px;
```

---

## 🔲 Border Radius (Super-Elliptic)

### Standard Scale
```css
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 10px;
--radius-xl: 12px;
--radius-2xl: 16px;
--radius-3xl: 20px;
--radius-4xl: 24px;
--radius-full: 9999px;
```

### Super-Elliptic (Squircle-like)
```css
/* VisionOS-style continuous curves */
--radius-superelliptic-sm: 10px;  /* iOS-like */
--radius-superelliptic-md: 14px;  /* Nav items */
--radius-superelliptic-lg: 18px;  /* Cards */
--radius-superelliptic-xl: 22px;  /* Containers */
--radius-superelliptic-2xl: 28px; /* Modals */
```

### Navigation Specific
```css
/* Bottom Nav Container */
--nav-container-mobile: 24px;
--nav-container-tablet: 26px;
--nav-container-desktop: 28px;

/* Nav Items */
--nav-item-mobile: 18px;
--nav-item-tablet: 19px;
--nav-item-desktop: 12px;

/* Badge */
--nav-badge: 9999px; /* Circular */
```

---

## 🌑 Shadows (Soft Depth)

### Light Mode Elevation
```css
/* Subtle, VisionOS-inspired */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.03);

--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.04),
             0 1px 2px -1px rgba(0, 0, 0, 0.02);

--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
             0 2px 4px -2px rgba(0, 0, 0, 0.03);

--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.06),
             0 4px 6px -4px rgba(0, 0, 0, 0.04);

--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.07),
             0 8px 10px -6px rgba(0, 0, 0, 0.05);

--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.12);
```

### Navigation Specific
```css
/* Container */
--shadow-nav-container: 0 4px 16px 0 rgba(0, 0, 0, 0.04),
                        0 1px 4px 0 rgba(0, 0, 0, 0.02);

/* Active Item */
--shadow-nav-active: 0 2px 8px 0 rgba(59, 130, 246, 0.15);

/* Hover */
--shadow-nav-hover: 0 2px 4px 0 rgba(0, 0, 0, 0.04);
```

### Focus Ring
```css
--shadow-focus: 0 0 0 4px rgba(59, 130, 246, 0.12);
```

### Dark Mode
```css
/* Higher alpha for lift effect */
--shadow-nav-container-dark: 0 4px 16px 0 rgba(0, 0, 0, 0.5),
                              0 1px 4px 0 rgba(0, 0, 0, 0.4);

--shadow-nav-active-dark: 0 2px 8px 0 rgba(96, 165, 250, 0.2);

--shadow-focus-dark: 0 0 0 4px rgba(96, 165, 250, 0.15);
```

---

## 🎯 UI States

### Navigation Item States

#### Default (Inactive)
```css
/* Light */
background: transparent;
icon-color: #525252 (neutral-600, WCAG AAA 7:1);
label-color: #525252;
icon-stroke-width: 2;

/* Dark */
background: transparent;
icon-color: #A3A3A3 (neutral-600);
label-color: #A3A3A3;
icon-stroke-width: 2;
```

#### Hover
```css
/* Light */
background: rgba(0, 0, 0, 0.04);
icon-color: #2563EB (primary-600);
label-color: #2563EB;
scale: 1.02;
transition: 150ms cubic-bezier(0.25, 0.1, 0.25, 1);

/* Dark */
background: rgba(255, 255, 255, 0.06);
icon-color: #60A5FA (primary-500);
label-color: #60A5FA;
```

#### Active
```css
/* Light */
background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
icon-color: #FFFFFF;
label-color: #FFFFFF;
icon-stroke-width: 2;
shadow: 0 2px 8px 0 rgba(59, 130, 246, 0.15);
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);

/* Dark */
background: linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%);
icon-color: #000000;
label-color: #000000;
shadow: 0 2px 8px 0 rgba(96, 165, 250, 0.2);
```

#### Pressed
```css
scale: 0.97;
transition: 150ms cubic-bezier(0.4, 0, 1, 1);
```

#### Focus (WCAG 2.1)
```css
outline: none;
box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
ring-color: rgba(59, 130, 246, 0.5);
```

#### Disabled
```css
opacity: 0.4;
cursor: not-allowed;
pointer-events: none;
```

---

## 🎨 Iconografía

### Stroke Widths
```css
--icon-stroke-thin: 1.5;
--icon-stroke-regular: 2;    /* Default */
--icon-stroke-medium: 2.25;
--icon-stroke-bold: 2.5;
```

### Sizes
```css
--icon-xs: 16px;
--icon-sm: 18px;
--icon-md: 20px;  /* Desktop nav */
--icon-lg: 22px;  /* Mobile nav */
--icon-xl: 24px;  /* Tablet nav */
--icon-2xl: 28px;
```

### Style Rules
- **Inactive**: Outline (stroke) - `strokeWidth: 2`
- **Active**: Outline (stroke) - `strokeWidth: 2` (mantener consistencia)
- **Exception**: Badges pueden usar filled icons

### Consistencia
✅ **CORRECTO**: Todos los iconos con `strokeWidth={2}` (outline)
❌ **INCORRECTO**: Mezclar filled/outline o diferentes stroke-widths

---

## 🎭 Motion & Animations

### Durations
```css
--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
```

### Easing Curves
```css
/* Standard */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);

/* Decelerate (ease-out) */
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);

/* Accelerate (ease-in) */
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);

/* Spring (iOS-like) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Smooth (Arc Browser) */
--ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### Navigation Specific
```css
/* Item Hover */
duration: 150ms;
easing: cubic-bezier(0.25, 0.1, 0.25, 1);

/* Item Active */
duration: 250ms;
easing: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Shimmer */
duration: 3000ms;
easing: linear;
```

---

## 📱 Touch Targets (WCAG + Platform)

### Minimum Sizes
```css
/* iOS HIG */
min-width: 44px;
min-height: 44px;

/* Android Material */
min-width: 48px;
min-height: 48px;

/* WCAG AAA */
min-width: 44px;
min-height: 44px;

/* Bottom of screen (thumb reach) */
min-height: 46px; /* 12mm */
```

### Navigation Implementation
```css
/* Mobile (xs) */
min-width: 52px;
min-height: 52px;

/* Mobile (sm) */
min-width: 56px;
min-height: 56px;

/* Tablet (md) */
min-width: 60px;
min-height: 60px;

/* Desktop */
min-width: 64px;
min-height: 64px;
```

### Spacing Between Targets
```css
min-gap: 8px; /* WCAG guideline */
```

---

## 🏗️ Component Anatomy

### Bottom Nav Container (Mobile)
```css
/* Structure */
position: fixed;
bottom: 0;
z-index: 50;
max-width: 448px; /* md */
margin: 0 auto;
margin-bottom: 12px; /* xs: 12px, sm: 14px, md: 16px */

/* Visual */
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(24px);
border-radius: 24px; /* xs: 24px, sm: 26px, md: 28px */
box-shadow: 0 4px 16px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02);

/* Gradient overlay */
background-image: linear-gradient(to top,
  rgba(255, 255, 255, 0.95),
  rgba(255, 255, 255, 0.90),
  rgba(255, 255, 255, 0.80)
);

/* Border */
border: 0.5px solid;
border-image: linear-gradient(to bottom,
  rgba(255, 255, 255, 0.95),
  rgba(255, 255, 255, 0.70)
) 1;
```

### Nav Item (Active State)
```css
/* Premium Pill */
position: relative;

/* Glow layer */
.glow {
  position: absolute;
  inset: 0;
  background: #3B82F6;
  opacity: 0.4;
  filter: blur(16px);
  border-radius: 18px;
}

/* Gradient background */
.background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  border-radius: 18px;
}

/* Inner reflection (VisionOS) */
.reflection {
  position: absolute;
  inset: 1px;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0.25),
    transparent
  );
  opacity: 0.6;
  border-radius: 17px;
}

/* Shimmer (hover only) */
.shimmer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 3000ms linear;
}

.shimmer:hover {
  opacity: 1;
}

.shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.20),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  from { background-position: -200% center; }
  to { background-position: 200% center; }
}
```

### Badge (Notifications)
```css
/* Container */
position: absolute;
top: -4px;
right: -4px;
min-width: 18px;
height: 18px;
padding: 0 6px;

/* Visual */
background: linear-gradient(135deg, #EF4444, #DC2626);
color: #FFFFFF;
border-radius: 9999px;
box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
border: 2px solid #FFFFFF;

/* Typography */
font-size: 9px;
font-weight: 650;
line-height: 1;

/* Glow */
.glow {
  position: absolute;
  inset: -2px;
  background: #EF4444;
  opacity: 0.6;
  filter: blur(8px);
  border-radius: 9999px;
}
```

---

## 🎨 Glassmorphism Recipe

### Premium Glass Effect
```css
/* Layer 1: Base blur */
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);

/* Layer 2: Gradient overlay */
background-image: linear-gradient(to top,
  rgba(255, 255, 255, 0.95),
  rgba(255, 255, 255, 0.90),
  rgba(255, 255, 255, 0.80)
);

/* Layer 3: Border gradient */
border: 0.5px solid transparent;
background-clip: padding-box;
position: relative;

&::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 0.5px;
  background: linear-gradient(to bottom,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.70)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box,
                 linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### Dark Mode Glass
```css
background: rgba(10, 10, 10, 0.85);
backdrop-filter: blur(24px);

background-image: linear-gradient(to top,
  rgba(10, 10, 10, 0.95),
  rgba(10, 10, 10, 0.90),
  rgba(10, 10, 10, 0.85)
);

border-gradient: linear-gradient(to bottom,
  rgba(255, 255, 255, 0.10),
  rgba(255, 255, 255, 0.05)
);
```

---

## 📋 Checklist de Implementación

### Consistencia Visual
- [ ] Todos los iconos con `strokeWidth: 2`
- [ ] Mismo pill treatment (activo/inactivo)
- [ ] Gradientes premium en estados activos
- [ ] Super-elliptic corners (squircle)
- [ ] Sombras suaves (VisionOS style)

### Accesibilidad (WCAG 2.1 AAA)
- [ ] Contraste 7:1 en texto secundario
- [ ] Touch targets ≥ 44x44px
- [ ] Focus ring visible (no solo color)
- [ ] Aria labels en todos los items
- [ ] Keyboard navigation completa

### Tipografía
- [ ] Inter font stack cargado
- [ ] Weights correctos (400, 500, 590, 650)
- [ ] Letter-spacing optimizado
- [ ] Line-heights apropiados

### Responsive
- [ ] Breakpoints: 360px, 480px, 768px, 1024px
- [ ] Touch targets escalables
- [ ] Iconos responsive
- [ ] Padding/spacing adaptivo

### Estados UI
- [ ] Default, Hover, Active, Pressed, Focus, Disabled
- [ ] Transiciones smooth (150-250ms)
- [ ] Spring physics en interactions
- [ ] Shimmer en hover (opcional)

### Microinteracciones
- [ ] Scale on hover (1.02)
- [ ] Scale on press (0.97)
- [ ] Smooth color transitions
- [ ] Badge animations

---

## 🚀 Uso del Sistema

### Importar Design System
```tsx
import { designSystem } from '@/styles/design-system'

// Acceder a valores
const primaryColor = designSystem.colors.light.primary[500]
const navPadding = designSystem.spacing.nav.mobile.containerPadding
const navRadius = designSystem.borderRadius.nav.container.mobile
```

### Componentes Premium
```tsx
// Bottom Nav
import { BottomNavPremium } from '@/components/layout/BottomNav.premium'

// Sidebar
import { SidebarPremium } from '@/components/layout/Sidebar.premium'
```

---

## 📚 Referencias

### Design Systems
- [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)
- [Fluent 2](https://fluent2.microsoft.design/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

### Inspiración
- [Linear](https://linear.app/) - Premium gradients, refined interactions
- [Arc Browser](https://arc.net/) - Smooth animations, beautiful UI
- [iCloud 2025](https://www.icloud.com/) - Apple's glassmorphism
- [VisionOS](https://developer.apple.com/visionos/) - Soft depth, super-ellipses

---

**Versión**: 1.0
**Fecha**: 2025-11-22
**Autor**: Claude Code + Design System Research
**Licencia**: Uso interno / Enterprise
