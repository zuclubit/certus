/**
 * SectionHeader Component - Ultra Premium Section Header
 *
 * Encabezado de sección reutilizable con jerarquía visual clara
 * Diseñado para consistencia en toda la aplicación
 *
 * Features:
 * - Tipografía iOS 2025 (SF Pro)
 * - Iconos opcionales con animaciones
 * - Badges de estado
 * - Responsive y adaptable
 * - Arquitectura modular
 *
 * @module SectionHeader
 */

import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { ReactNode, ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface SectionHeaderProps {
  /** Título de la sección */
  title: string
  /** Descripción opcional */
  description?: string
  /** Icono opcional */
  icon?: LucideIcon | ComponentType<{ className?: string }>
  /** Badge de conteo */
  count?: number
  /** Badges personalizados */
  badges?: ReactNode
  /** Acciones (botones, etc) */
  actions?: ReactNode
  /** Variante de tamaño */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Alineación */
  align?: 'left' | 'center'
  /** Borde inferior */
  divider?: boolean
  className?: string
}

const SIZE_CONFIG = {
  sm: {
    title: 'ios-text-base sm:ios-text-subheadline ios-font-semibold',
    description: 'ios-text-xs sm:ios-text-caption1 ios-font-regular mt-0.5',
    icon: 'h-4 w-4 sm:h-4.5 sm:w-4.5',
    spacing: 'gap-2',
  },
  md: {
    title: 'ios-text-md sm:ios-text-headline ios-font-bold',
    description: 'ios-text-sm sm:ios-text-footnote ios-font-regular mt-1',
    icon: 'h-4.5 w-4.5 sm:h-5 sm:w-5',
    spacing: 'gap-2.5',
  },
  lg: {
    title: 'ios-text-xl sm:ios-heading-title3 ios-font-bold',
    description: 'ios-text-base sm:ios-text-subheadline ios-font-regular mt-1.5',
    icon: 'h-5 w-5 sm:h-6 sm:w-6',
    spacing: 'gap-3',
  },
  xl: {
    title: 'ios-text-2xl sm:ios-heading-title2 ios-font-bold',
    description: 'ios-text-lg sm:ios-text-headline ios-font-regular mt-2',
    icon: 'h-6 w-6 sm:h-7 sm:w-7',
    spacing: 'gap-3.5',
  },
}

export function SectionHeader({
  title,
  description,
  icon: Icon,
  count,
  badges,
  actions,
  size = 'md',
  align = 'left',
  divider = false,
  className,
}: SectionHeaderProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const config = SIZE_CONFIG[size]

  return (
    <div
      className={cn(
        'flex flex-col',
        config.spacing,
        divider && [
          'pb-3 mb-3',
          isDark
            ? 'border-b border-white/10'
            : 'border-b border-neutral-200/60',
        ],
        className
      )}
    >
      {/* Fila principal: título, badges y acciones */}
      <div className={cn(
        'flex items-start gap-3',
        align === 'center' && 'justify-center'
      )}>
        {/* Columna izquierda: Icono + Título + Badges */}
        <div className={cn(
          'flex-1 flex items-center flex-wrap gap-2',
          align === 'center' && 'justify-center'
        )}>
          {/* Icono */}
          {Icon && (
            <Icon
              className={cn(
                config.icon,
                'flex-shrink-0',
                'transition-transform duration-300 hover:scale-110',
                isDark ? 'text-blue-400' : 'text-blue-600'
              )}
              aria-hidden="true"
            />
          )}

          {/* Título */}
          <h2
            className={cn(
              config.title,
              'flex-shrink-0',
              isDark ? 'text-white' : 'text-neutral-900'
            )}
          >
            {title}
            {count !== undefined && (
              <span
                className={cn(
                  'ml-2 ios-text-caption1 ios-font-semibold',
                  'inline-flex items-center justify-center',
                  'min-w-[20px] h-5 px-1.5 rounded-full',
                  isDark
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-blue-100 text-blue-700'
                )}
              >
                {count}
              </span>
            )}
          </h2>

          {/* Badges personalizados */}
          {badges && (
            <div className="flex items-center gap-2 flex-wrap">
              {badges}
            </div>
          )}
        </div>

        {/* Columna derecha: Acciones */}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Descripción */}
      {description && (
        <p
          className={cn(
            config.description,
            align === 'center' && 'text-center',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
