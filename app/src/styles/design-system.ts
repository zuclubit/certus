/**
 * Premium Navigation Design System
 *
 * Enterprise-grade design system following:
 * - Apple Human Interface Guidelines
 * - Material Design 3 (Material You)
 * - Microsoft Fluent 2
 * - 2025 Design Trends
 *
 * Aesthetic references:
 * - Linear
 * - Arc Browser
 * - iCloud 2025
 * - VisionOS
 */

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font stacks (fallback chain)
  fonts: {
    sans: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
      apple: '"SF Pro Display", "SF Pro Text", -apple-system, sans-serif',
      geist: '"Geist", "Inter", sans-serif',
    },
    mono: {
      primary: '"Geist Mono", "SF Mono", "JetBrains Mono", "Fira Code", monospace',
    },
  },

  // Type scale (modular scale 1.125 - major second)
  sizes: {
    // Navigation specific
    nav: {
      mobile: {
        label: '10px',      // Bottom nav labels
        icon: '22px',       // Mobile icon size
        badge: '9px',       // Badge text
      },
      tablet: {
        label: '11px',
        icon: '24px',
        badge: '10px',
      },
      desktop: {
        label: '13px',      // Sidebar labels
        icon: '20px',       // Sidebar icons
        badge: '10px',
      },
    },

    // Full scale
    xs: '11px',           // 0.6875rem
    sm: '13px',           // 0.8125rem
    base: '15px',         // 0.9375rem (VisionOS base)
    md: '17px',           // 1.0625rem
    lg: '19px',           // 1.1875rem
    xl: '22px',           // 1.375rem
    '2xl': '28px',        // 1.75rem
    '3xl': '34px',        // 2.125rem
  },

  // Font weights
  weights: {
    regular: '400',       // Body text
    medium: '500',        // Navigation labels
    semibold: '590',      // Active states (SF Pro optimized)
    bold: '650',          // Emphasis
  },

  // Line heights
  lineHeights: {
    tight: '1.2',         // Headlines
    nav: '1.3',           // Navigation
    base: '1.5',          // Body
    relaxed: '1.6',       // Reading
  },

  // Letter spacing (tracking)
  letterSpacing: {
    tighter: '-0.02em',   // Large headlines
    tight: '-0.01em',     // Navigation labels
    normal: '0',
    wide: '0.01em',
    wider: '0.025em',     // All caps
  },
} as const

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const colors = {
  light: {
    // Primary (inspired by Linear's blue + VisionOS)
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',      // Main brand
      600: '#2563EB',      // Active state
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      DEFAULT: '#3B82F6',
    },

    // Neutral (high contrast, WCAG AAA)
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',        // Background
      100: '#F5F5F5',       // Secondary background
      200: '#E5E5E5',       // Border light
      300: '#D4D4D4',       // Border
      400: '#A3A3A3',       // Disabled
      500: '#737373',       // Placeholder
      600: '#525252',       // Secondary text (WCAG AAA: 7:1)
      700: '#404040',       // Body text (WCAG AAA: 10:1)
      800: '#262626',       // Headings
      900: '#171717',       // Emphasis
      950: '#0A0A0A',       // Max contrast
      DEFAULT: '#737373',
    },

    // Success (Arc green)
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      500: '#10B981',
      600: '#059669',
      DEFAULT: '#10B981',
    },

    // Warning (Warm amber)
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      DEFAULT: '#F59E0B',
    },

    // Danger (Linear red)
    danger: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      DEFAULT: '#EF4444',
    },

    // Surface colors
    surface: {
      background: '#FFFFFF',
      secondary: '#FAFAFA',
      tertiary: '#F5F5F5',
      elevated: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.05)',
    },

    // Interactive states
    interactive: {
      hover: 'rgba(0, 0, 0, 0.04)',
      pressed: 'rgba(0, 0, 0, 0.08)',
      focus: '#3B82F6',
      focusRing: 'rgba(59, 130, 246, 0.5)',
    },
  },

  dark: {
    // Primary (adjusted for dark mode)
    primary: {
      50: '#1E3A8A',
      100: '#1E40AF',
      200: '#1D4ED8',
      300: '#2563EB',
      400: '#3B82F6',
      500: '#60A5FA',      // Main brand (lighter in dark)
      600: '#93C5FD',      // Active state
      700: '#BFDBFE',
      800: '#DBEAFE',
      900: '#EFF6FF',
      DEFAULT: '#60A5FA',
    },

    // Neutral (dark mode optimized)
    neutral: {
      0: '#000000',
      50: '#0A0A0A',        // Background
      100: '#171717',       // Secondary background
      200: '#262626',       // Border light
      300: '#404040',       // Border
      400: '#525252',       // Disabled
      500: '#737373',       // Placeholder
      600: '#A3A3A3',       // Secondary text (WCAG AAA on dark)
      700: '#D4D4D4',       // Body text
      800: '#E5E5E5',       // Headings
      900: '#F5F5F5',       // Emphasis
      950: '#FAFAFA',       // Max contrast
      DEFAULT: '#A3A3A3',
    },

    // Success
    success: {
      50: '#064E3B',
      100: '#065F46',
      500: '#34D399',
      600: '#6EE7B7',
      DEFAULT: '#34D399',
    },

    // Warning
    warning: {
      50: '#78350F',
      100: '#92400E',
      500: '#FBBF24',
      600: '#FCD34D',
      DEFAULT: '#FBBF24',
    },

    // Danger
    danger: {
      50: '#7F1D1D',
      100: '#991B1B',
      500: '#F87171',
      600: '#FCA5A5',
      DEFAULT: '#F87171',
    },

    // Surface colors
    surface: {
      background: '#000000',
      secondary: '#0A0A0A',
      tertiary: '#171717',
      elevated: '#171717',
      overlay: 'rgba(255, 255, 255, 0.05)',
    },

    // Interactive states
    interactive: {
      hover: 'rgba(255, 255, 255, 0.06)',
      pressed: 'rgba(255, 255, 255, 0.12)',
      focus: '#60A5FA',
      focusRing: 'rgba(96, 165, 250, 0.5)',
    },
  },
} as const

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  // Micro spacing (for fine-tuning)
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',

  // Navigation specific
  nav: {
    mobile: {
      containerPadding: '12px',
      itemGap: '4px',
      itemPadding: '8px',
      iconLabelGap: '4px',
    },
    tablet: {
      containerPadding: '14px',
      itemGap: '6px',
      itemPadding: '10px',
      iconLabelGap: '5px',
    },
    desktop: {
      containerPadding: '12px',
      itemGap: '4px',
      itemPadding: '10px 12px',
      iconLabelGap: '12px',
    },
  },
} as const

// ============================================================================
// BORDER RADIUS (Super-elliptic curves)
// ============================================================================

export const borderRadius = {
  // Standard values
  none: '0',
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '20px',
  '4xl': '24px',
  full: '9999px',

  // Super-elliptic (squircle-like, VisionOS style)
  // Using continuous curves for premium feel
  superelliptic: {
    sm: '10px',          // iOS-like corner (matches ~12% of size)
    md: '14px',          // Navigation items
    lg: '18px',          // Cards
    xl: '22px',          // Containers
    '2xl': '28px',       // Modal/Sheets
  },

  // Navigation specific
  nav: {
    container: {
      mobile: '24px',
      tablet: '26px',
      desktop: '28px',
    },
    item: {
      mobile: '18px',
      tablet: '19px',
      desktop: '12px',
    },
    badge: '9999px',     // Fully circular
  },
} as const

// ============================================================================
// SHADOWS (Soft depth, inspired by VisionOS)
// ============================================================================

export const shadows = {
  light: {
    // Elevation system (8dp grid)
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.12)',

    // Navigation specific
    nav: {
      container: '0 4px 16px 0 rgba(0, 0, 0, 0.04), 0 1px 4px 0 rgba(0, 0, 0, 0.02)',
      itemActive: '0 2px 8px 0 rgba(59, 130, 246, 0.15)',
      itemHover: '0 2px 4px 0 rgba(0, 0, 0, 0.04)',
    },

    // Focus ring
    focus: '0 0 0 4px rgba(59, 130, 246, 0.12)',
  },

  dark: {
    // Elevation (lighter in dark mode for lift effect)
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.9)',

    // Navigation specific
    nav: {
      container: '0 4px 16px 0 rgba(0, 0, 0, 0.5), 0 1px 4px 0 rgba(0, 0, 0, 0.4)',
      itemActive: '0 2px 8px 0 rgba(96, 165, 250, 0.2)',
      itemHover: '0 2px 4px 0 rgba(255, 255, 255, 0.05)',
    },

    // Focus ring
    focus: '0 0 0 4px rgba(96, 165, 250, 0.15)',
  },
} as const

// ============================================================================
// UI STATES
// ============================================================================

export const states = {
  // Navigation item states
  navItem: {
    light: {
      default: {
        background: 'transparent',
        iconColor: colors.light.neutral[600],
        labelColor: colors.light.neutral[600],
        iconStrokeWidth: 2,
      },
      hover: {
        background: colors.light.interactive.hover,
        iconColor: colors.light.primary[600],
        labelColor: colors.light.primary[600],
        scale: 1.02,
      },
      active: {
        background: `linear-gradient(135deg,
          ${colors.light.primary[500]} 0%,
          ${colors.light.primary[600]} 100%)`,
        iconColor: '#FFFFFF',
        labelColor: '#FFFFFF',
        iconStrokeWidth: 2,
        shadow: shadows.light.nav.itemActive,
      },
      pressed: {
        scale: 0.97,
        background: colors.light.interactive.pressed,
      },
      focus: {
        ring: shadows.light.focus,
        ringColor: colors.light.interactive.focusRing,
      },
      disabled: {
        opacity: 0.4,
        cursor: 'not-allowed',
      },
    },
    dark: {
      default: {
        background: 'transparent',
        iconColor: colors.dark.neutral[600],
        labelColor: colors.dark.neutral[600],
        iconStrokeWidth: 2,
      },
      hover: {
        background: colors.dark.interactive.hover,
        iconColor: colors.dark.primary[500],
        labelColor: colors.dark.primary[500],
        scale: 1.02,
      },
      active: {
        background: `linear-gradient(135deg,
          ${colors.dark.primary[500]} 0%,
          ${colors.dark.primary[600]} 100%)`,
        iconColor: '#000000',
        labelColor: '#000000',
        iconStrokeWidth: 2,
        shadow: shadows.dark.nav.itemActive,
      },
      pressed: {
        scale: 0.97,
        background: colors.dark.interactive.pressed,
      },
      focus: {
        ring: shadows.dark.focus,
        ringColor: colors.dark.interactive.focusRing,
      },
      disabled: {
        opacity: 0.4,
        cursor: 'not-allowed',
      },
    },
  },

  // Badge states
  badge: {
    light: {
      danger: {
        background: `linear-gradient(135deg, ${colors.light.danger[500]}, ${colors.light.danger[600]})`,
        color: '#FFFFFF',
        shadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
      },
    },
    dark: {
      danger: {
        background: `linear-gradient(135deg, ${colors.dark.danger[500]}, ${colors.dark.danger[600]})`,
        color: '#000000',
        shadow: '0 2px 6px rgba(248, 113, 113, 0.3)',
      },
    },
  },
} as const

// ============================================================================
// ICONOGRAPHY
// ============================================================================

export const iconography = {
  // Stroke widths
  strokeWidth: {
    thin: 1.5,
    regular: 2,          // Default for navigation
    medium: 2.25,
    bold: 2.5,
  },

  // Sizes
  sizes: {
    xs: 16,
    sm: 18,
    md: 20,              // Desktop navigation
    lg: 22,              // Mobile navigation
    xl: 24,              // Tablet navigation
    '2xl': 28,
  },

  // Style rules
  style: {
    // Use outline (stroke) for inactive states
    inactive: 'outline',
    // Keep outline for active states (filled creates inconsistency)
    active: 'outline',
    // Exception: badges can use filled icons
    badge: 'filled',
  },
} as const

// ============================================================================
// MOTION (Smooth, responsive animations)
// ============================================================================

export const motion = {
  // Durations (ms)
  duration: {
    instant: 100,
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500,
  },

  // Easing curves
  easing: {
    // Standard
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    // Decelerate (ease-out)
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    // Accelerate (ease-in)
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    // Spring (iOS-like)
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Smooth (Arc Browser)
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // Navigation specific
  nav: {
    itemHover: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
    itemActive: {
      duration: 250,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    shimmer: {
      duration: 3000,
      easing: 'linear',
    },
  },
} as const

// ============================================================================
// EXPORTS
// ============================================================================

export const designSystem = {
  typography,
  colors,
  spacing,
  borderRadius,
  shadows,
  states,
  iconography,
  motion,
} as const

export type DesignSystem = typeof designSystem
export type ThemeMode = 'light' | 'dark'
