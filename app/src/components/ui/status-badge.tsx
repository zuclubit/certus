/**
 * StatusBadge Component - Ultra Premium Status Badge
 *
 * Badge de estado reutilizable con variantes semánticas
 * Diseñado para máxima legibilidad y accesibilidad
 *
 * Features:
 * - Múltiples variantes (error, warning, success, info, neutral)
 * - Indicador dot animado opcional
 * - Glassmorphic design
 * - Responsive sizing
 * - Alta accesibilidad (WCAG AA)
 *
 * @module StatusBadge
 */

import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { ReactNode } from 'react'

export interface StatusBadgeProps {
  /** Contenido del badge */
  children: ReactNode
  /** Variante semántica */
  variant?: 'error' | 'warning' | 'success' | 'info' | 'neutral'
  /** Tamaño del badge */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /** Mostrar dot indicator */
  dot?: boolean
  /** Animación del dot */
  dotPulse?: boolean
  /** Aplicar glassmorphic effect */
  glass?: boolean
  className?: string
}

const SIZE_CONFIG = {
  xs: {
    container: 'px-1.5 py-0.5 rounded-[6px]',
    text: 'ios-text-caption2 ios-font-semibold',
    dot: 'h-1 w-1',
  },
  sm: {
    container: 'px-2 py-0.5 rounded-[8px]',
    text: 'ios-text-caption1 ios-font-semibold',
    dot: 'h-1.5 w-1.5',
  },
  md: {
    container: 'px-2.5 py-1 rounded-[10px]',
    text: 'ios-text-footnote ios-font-semibold',
    dot: 'h-2 w-2',
  },
  lg: {
    container: 'px-3 py-1.5 rounded-[12px]',
    text: 'ios-text-body ios-font-bold',
    dot: 'h-2.5 w-2.5',
  },
}

const VARIANT_COLORS = {
  dark: {
    error: {
      container: 'bg-red-900/30 border-red-700/40',
      text: 'text-red-300',
      dot: 'bg-red-500',
    },
    warning: {
      container: 'bg-yellow-900/30 border-yellow-700/40',
      text: 'text-yellow-300',
      dot: 'bg-yellow-500',
    },
    success: {
      container: 'bg-green-900/30 border-green-700/40',
      text: 'text-green-300',
      dot: 'bg-green-500',
    },
    info: {
      container: 'bg-blue-900/30 border-blue-700/40',
      text: 'text-blue-300',
      dot: 'bg-blue-500',
    },
    neutral: {
      container: 'bg-neutral-800/40 border-neutral-700/40',
      text: 'text-neutral-300',
      dot: 'bg-neutral-500',
    },
  },
  light: {
    error: {
      container: 'bg-red-50/95 border-red-200/70',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    warning: {
      container: 'bg-yellow-50/95 border-yellow-200/70',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
    },
    success: {
      container: 'bg-green-50/95 border-green-200/70',
      text: 'text-green-800',
      dot: 'bg-green-500',
    },
    info: {
      container: 'bg-blue-50/95 border-blue-200/70',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
    },
    neutral: {
      container: 'bg-neutral-100/95 border-neutral-200/70',
      text: 'text-neutral-800',
      dot: 'bg-neutral-500',
    },
  },
}

export function StatusBadge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  dotPulse = false,
  glass = true,
  className,
}: StatusBadgeProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const sizeConfig = SIZE_CONFIG[size]
  const colorConfig = VARIANT_COLORS[isDark ? 'dark' : 'light'][variant]

  return (
    <span
      className={cn(
        // Base styles
        'inline-flex items-center gap-1.5',
        'border',
        'transition-all duration-300',
        'select-none',

        // Size
        sizeConfig.container,
        sizeConfig.text,

        // Colors
        colorConfig.container,
        colorConfig.text,

        // Glass effect
        glass && [
          'glass-ultra-clear depth-layer-2',
          'backdrop-blur-sm',
        ],

        className
      )}
      role="status"
      aria-label={`${variant} status`}
    >
      {/* Dot indicator */}
      {dot && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            sizeConfig.dot,
            colorConfig.dot,
            dotPulse && 'animate-pulse-soft'
          )}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <span className="truncate">{children}</span>
    </span>
  )
}
