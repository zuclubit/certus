/**
 * SectionContainer Component - Ultra Premium Modular Section
 *
 * Componente contenedor reutilizable para secciones de la aplicación
 * Diseñado siguiendo Apple HIG 2025 y mejores prácticas de UX
 *
 * Features:
 * - Espaciado consistente y adaptable
 * - Glassmorphic premium design
 * - Responsive en todas las pantallas (xxs-2xl)
 * - Arquitectura modular y limpia
 *
 * @module SectionContainer
 */

import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { ReactNode } from 'react'

export interface SectionContainerProps {
  children: ReactNode
  className?: string
  /** Variante de espaciado interno */
  spacing?: 'none' | 'compact' | 'normal' | 'comfortable' | 'spacious'
  /** Aplicar efectos glassmorphic */
  glass?: boolean
  /** Mostrar borde */
  bordered?: boolean
  /** Sombra elevada */
  elevated?: boolean
  /** Permitir scroll interno */
  scrollable?: boolean
  /** Altura máxima cuando scrollable */
  maxHeight?: string
}

const SPACING_CLASSES = {
  none: 'p-0',
  compact: 'p-2 xxs:p-2.5 xs:p-3 sm:p-3.5 md:p-4',
  normal: 'p-3 xxs:p-3.5 xs:p-4 sm:p-4.5 md:p-5 lg:p-6',
  comfortable: 'p-4 xxs:p-4.5 xs:p-5 sm:p-5.5 md:p-6 lg:p-7 xl:p-8',
  spacious: 'p-5 xxs:p-5.5 xs:p-6 sm:p-6.5 md:p-7 lg:p-8 xl:p-10 2xl:p-12',
}

export function SectionContainer({
  children,
  className,
  spacing = 'normal',
  glass = false,
  bordered = true,
  elevated = false,
  scrollable = false,
  maxHeight,
}: SectionContainerProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        // Bordes redondeados adaptativos
        'rounded-[12px] xxs:rounded-[14px] xs:rounded-[16px] sm:rounded-[18px] md:rounded-[20px] lg:rounded-[22px] xl:rounded-[24px]',

        // Espaciado interno
        SPACING_CLASSES[spacing],

        // Efectos glassmorphic
        glass && [
          'glass-ultra-clear depth-layer-2 fresnel-edge',
          'glass-gpu-accelerated',
        ],

        // Borde
        bordered && (
          isDark
            ? 'border border-white/10'
            : 'border border-neutral-200/60'
        ),

        // Sombra
        elevated && (
          isDark
            ? 'shadow-[0_4px_16px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]'
            : 'shadow-[0_4px_16px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]'
        ),

        // Scroll
        scrollable && 'overflow-y-auto custom-scrollbar',

        // Transición suave
        'transition-all duration-300',

        className
      )}
      style={{
        ...(glass && {
          background: isDark
            ? `linear-gradient(
                135deg,
                rgba(35, 35, 45, 0.7) 0%,
                rgba(30, 30, 40, 0.65) 50%,
                rgba(35, 35, 45, 0.6) 100%
              )`
            : `linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.7) 0%,
                rgba(250, 250, 255, 0.65) 50%,
                rgba(255, 255, 255, 0.6) 100%
              )`,
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }),
        ...(scrollable && maxHeight && { maxHeight }),
      }}
    >
      {children}
    </div>
  )
}
