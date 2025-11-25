/**
 * DataField Component - Ultra Premium Data Display
 *
 * Componente para mostrar campos de datos con label/value
 * Optimizado para máxima legibilidad y UX en todos los tamaños de pantalla
 *
 * Features:
 * - Múltiples variantes de visualización
 * - Responsive layout (vertical en móvil, horizontal en desktop)
 * - Soporte para diferentes tipos de datos
 * - Estados de vacío y error
 * - Copy-to-clipboard opcional
 *
 * @module DataField
 */

import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export interface DataFieldProps {
  /** Label del campo */
  label: string
  /** Valor a mostrar */
  value: string | number | boolean | null | undefined
  /** Variante de visualización */
  variant?: 'default' | 'mono' | 'emphasized' | 'currency' | 'date'
  /** Layout responsive */
  layout?: 'auto' | 'vertical' | 'horizontal'
  /** Tamaño */
  size?: 'sm' | 'md' | 'lg'
  /** Permitir copiar valor */
  copyable?: boolean
  /** Ocupar ancho completo en grids */
  fullWidth?: boolean
  /** Mostrar como error */
  error?: boolean
  className?: string
}

const SIZE_CONFIG = {
  sm: {
    label: 'ios-text-caption1 ios-font-medium',
    value: 'ios-text-footnote ios-font-semibold',
    spacing: 'gap-1',
  },
  md: {
    label: 'ios-text-footnote ios-font-medium',
    value: 'ios-text-body ios-font-semibold',
    spacing: 'gap-1.5',
  },
  lg: {
    label: 'ios-text-body ios-font-medium',
    value: 'ios-text-subheadline ios-font-bold',
    spacing: 'gap-2',
  },
}

export function DataField({
  label,
  value,
  variant = 'default',
  layout = 'auto',
  size = 'md',
  copyable = false,
  fullWidth = false,
  error = false,
  className,
}: DataFieldProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const config = SIZE_CONFIG[size]

  const [copied, setCopied] = useState(false)

  // Formatear valor según variante
  const formatValue = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined || val === '') return '-'

    switch (variant) {
      case 'currency':
        return typeof val === 'number'
          ? new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
            }).format(val)
          : String(val)
      case 'date':
        return String(val) // Podría incluir formateo de fecha
      case 'mono':
        return String(val)
      default:
        return String(val)
    }
  }

  const displayValue = formatValue(value)
  const isEmpty = value === null || value === undefined || value === ''

  // Copiar al clipboard
  const handleCopy = async () => {
    if (!displayValue || displayValue === '-') return

    try {
      await navigator.clipboard.writeText(displayValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Determinar layout final
  const isVertical =
    layout === 'vertical' ||
    (layout === 'auto' && variant !== 'default')

  return (
    <div
      className={cn(
        // Base
        'group relative',
        'transition-all duration-300',

        // Layout
        isVertical ? (
          cn('flex flex-col', config.spacing)
        ) : (
          'flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-3'
        ),

        // Full width
        fullWidth && 'md:col-span-2',

        // Error state
        error && 'opacity-75',

        className
      )}
    >
      {/* Label */}
      <span
        className={cn(
          config.label,
          'flex-shrink-0',
          isDark ? 'text-neutral-500' : 'text-neutral-600',
          error && (isDark ? 'text-red-400' : 'text-red-600')
        )}
      >
        {label}
      </span>

      {/* Value Container */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Value */}
        <span
          className={cn(
            config.value,
            'truncate',

            // Variantes
            variant === 'mono' && 'font-mono text-sm',
            variant === 'emphasized' && 'ios-text-subheadline ios-font-bold',
            variant === 'currency' && 'tabular-nums',

            // Estados
            isEmpty && 'opacity-50 italic',
            error && (isDark ? 'text-red-400' : 'text-red-600'),

            // Colores
            !error && (isDark ? 'text-white' : 'text-neutral-900')
          )}
          title={displayValue}
        >
          {variant === 'mono' && !isEmpty ? (
            <code
              className={cn(
                'px-1.5 py-0.5 rounded-[6px]',
                isDark
                  ? 'bg-neutral-900/70 text-cyan-300'
                  : 'bg-neutral-100/95 text-cyan-700'
              )}
            >
              {displayValue}
            </code>
          ) : (
            displayValue
          )}
        </span>

        {/* Copy button */}
        {copyable && !isEmpty && (
          <button
            onClick={handleCopy}
            className={cn(
              'flex-shrink-0 p-1 rounded-[6px]',
              'transition-all duration-200',
              'opacity-0 group-hover:opacity-100',
              isDark
                ? 'hover:bg-white/10 text-neutral-400 hover:text-white'
                : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900'
            )}
            aria-label="Copiar valor"
            title="Copiar valor"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
