/**
 * Design Tokens - VisionOS Fintech Enterprise 2026
 *
 * Sistema unificado de tokens para garantizar consistencia absoluta
 * en profundidad, espaciado, iluminación, tipografía y color.
 */

// ============================================================================
// DEPTH SYSTEM - 4 Capas de profundidad VisionOS
// ============================================================================

export const DEPTH = {
  layer1_background: {
    gradient: 'linear-gradient(165deg, #05080F 0%, #0A1120 100%)',
    radialGlow1: 'radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.06) 0%, transparent 50%)',
    radialGlow2: 'radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.04) 0%, transparent 50%)',
  },
  layer2_mainPanel: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropBlur: 'blur(22px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    shadow: `
      0 8px 32px rgba(0, 0, 0, 0.28),
      0 24px 64px rgba(0, 0, 0, 0.20),
      inset 0 1px 2px rgba(255, 255, 255, 0.10)
    `,
    innerHighlight: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)',
  },
  layer3_cards: {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropBlur: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: '22px',
    shadow: `
      0 4px 20px rgba(0, 0, 0, 0.22),
      0 12px 40px rgba(0, 0, 0, 0.16),
      inset 0 1px 1px rgba(255, 255, 255, 0.14)
    `,
    innerHighlight: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 100%)',
    hoverShadow: `
      0 6px 24px rgba(0, 0, 0, 0.26),
      0 16px 48px rgba(0, 0, 0, 0.18),
      inset 0 1px 2px rgba(255, 255, 255, 0.18)
    `,
  },
  layer4_floating: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropBlur: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '18px',
    shadow: `
      0 2px 12px rgba(0, 0, 0, 0.18),
      0 8px 24px rgba(0, 0, 0, 0.12),
      inset 0 1px 1px rgba(255, 255, 255, 0.18)
    `,
  },
} as const

// ============================================================================
// SPACING SYSTEM - Grid premium
// ============================================================================

export const SPACING = {
  // Between sections
  section: '48px',
  sectionMobile: '32px',

  // Between cards
  cardGap: '28px',
  cardGapMobile: '20px',

  // Internal padding
  cardPadding: '24px',
  cardPaddingLarge: '28px',
  cardPaddingSmall: '20px',

  // Internal spacing
  internal: '16px',
  internalTight: '12px',
  internalLoose: '20px',

  // Micro spacing
  micro: '8px',
  microTight: '6px',
  microLoose: '10px',
} as const

// ============================================================================
// TYPOGRAPHY SYSTEM - Jerarquía perfecta
// ============================================================================

export const TYPOGRAPHY = {
  // Headers
  pageTitle: {
    fontSize: '22px',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 600,
    letterSpacing: '-0.015em',
    lineHeight: 1.3,
    color: '#FFFFFF',
  },

  // KPI Numbers
  kpiValue: {
    fontSize: 'clamp(32px, 3.8vw, 38px)',
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1,
    color: '#FFFFFF',
    textShadow: '0 2px 12px rgba(255, 255, 255, 0.10)',
  },

  // Labels
  label: {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    lineHeight: 1.4,
    color: '#AAB4C8',
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    lineHeight: 1.4,
    color: '#8892A6',
    textTransform: 'uppercase' as const,
  },

  // Body text
  body: {
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    lineHeight: 1.5,
    color: '#E8EBF0',
  },
  bodySecondary: {
    fontSize: '13px',
    fontWeight: 400,
    letterSpacing: '0.005em',
    lineHeight: 1.5,
    color: '#B8C1D3', // Mejorado contraste
  },
  bodyTertiary: {
    fontSize: '12px',
    fontWeight: 400,
    letterSpacing: '0.01em',
    lineHeight: 1.4,
    color: '#9BA5B8',
  },

  // Trends
  trend: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.02em',
    lineHeight: 1.3,
  },
} as const

// ============================================================================
// COLOR SYSTEM - Semántica unificada
// ============================================================================

export const COLORS = {
  // Base colors
  success: '#22C55E',
  warning: '#FB923C',
  danger: '#EF4444',
  primary: '#60A5FA',

  // Semantic variants
  successSoft: 'rgba(34, 197, 94, 0.15)',
  warningSoft: 'rgba(251, 146, 60, 0.15)',
  dangerSoft: 'rgba(239, 68, 68, 0.15)',
  primarySoft: 'rgba(96, 165, 250, 0.15)',

  // Glow colors
  successGlow: 'rgba(34, 197, 94, 0.35)',
  warningGlow: 'rgba(251, 146, 60, 0.35)',
  dangerGlow: 'rgba(239, 68, 68, 0.35)',
  primaryGlow: 'rgba(96, 165, 250, 0.35)',

  // Text colors (mejorados para dark mode)
  textPrimary: '#FFFFFF',
  textSecondary: '#B8C1D3',
  textTertiary: '#9BA5B8',
  textQuaternary: '#8892A6',

  // Border colors
  borderSubtle: 'rgba(255, 255, 255, 0.03)',
  borderSoft: 'rgba(255, 255, 255, 0.06)',
  borderMedium: 'rgba(255, 255, 255, 0.09)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',

  // Glass colors
  glassBase: 'rgba(255, 255, 255, 0.03)',
  glassElevated: 'rgba(255, 255, 255, 0.04)',
  glassFloating: 'rgba(255, 255, 255, 0.06)',

  // Inner highlights
  highlightSoft: 'rgba(255, 255, 255, 0.10)',
  highlightMedium: 'rgba(255, 255, 255, 0.14)',
  highlightStrong: 'rgba(255, 255, 255, 0.18)',
} as const

// ============================================================================
// LIGHTING SYSTEM - Iluminación direccional
// ============================================================================

export const LIGHTING = {
  // Top light (luz superior)
  topHighlight: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
    opacity: 0.6,
  },

  // Directional glow
  directionalGlow: (color: string) => `
    0 -2px 8px ${color},
    0 2px 16px ${color}
  `,

  // Ambient shadow
  ambientShadow: '0 0 40px rgba(0, 0, 0, 0.15)',

  // Corner bloom
  cornerBloom: (color: string) => ({
    position: 'absolute' as const,
    top: '-20px',
    right: '-20px',
    width: '180px',
    height: '180px',
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
    filter: 'blur(60px)',
    opacity: 0.08,
    pointerEvents: 'none' as const,
  }),
} as const

// ============================================================================
// ANIMATION SYSTEM - Microinteracciones
// ============================================================================

export const ANIMATIONS = {
  // Durations
  fast: '200ms',
  normal: '300ms',
  slow: '400ms',

  // Easing
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
  spring: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Hover transform
  hoverElevate: 'translateY(-2px)',
  hoverScale: 'scale(1.02)',

  // Active transform
  activeCompress: 'translateY(-1px) scale(0.98)',
} as const

// ============================================================================
// BORDER RADIUS SYSTEM - Consistencia de bordes
// ============================================================================

export const RADIUS = {
  large: '24px',
  medium: '22px',
  small: '20px',
  micro: '18px',
  pill: '999px',
  badge: '12px',
} as const

// ============================================================================
// BLUR SYSTEM - Blur uniforme
// ============================================================================

export const BLUR = {
  strong: 'blur(24px)',
  medium: 'blur(20px)',
  soft: 'blur(18px)',
  light: 'blur(16px)',
  minimal: 'blur(12px)',
} as const
