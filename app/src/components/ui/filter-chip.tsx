/**
 * FilterChip Component
 *
 * Toggleable filter chip with glassmorphic design
 * Used for filtering data views, showing active state visually
 *
 * @module FilterChip
 */

import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

export interface FilterChipProps {
  label: string
  active?: boolean
  onToggle?: () => void
  icon?: LucideIcon
  count?: number
  size?: 'sm' | 'md' | 'lg'
  glass?: boolean
  disabled?: boolean
}

const SIZE_CONFIG = {
  sm: {
    container: 'h-8 px-3 gap-1.5',
    text: 'ios-text-xs',
    icon: 'h-3 w-3',
    count: 'h-4 min-w-[16px] px-1 ios-text-[10px]',
  },
  md: {
    container: 'h-9 px-4 gap-2',
    text: 'ios-text-sm',
    icon: 'h-3.5 w-3.5',
    count: 'h-5 min-w-[20px] px-1.5 ios-text-xs',
  },
  lg: {
    container: 'h-10 px-5 gap-2',
    text: 'ios-text-base',
    icon: 'h-4 w-4',
    count: 'h-6 min-w-[24px] px-2 ios-text-sm',
  },
}

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    {
      label,
      active = false,
      onToggle,
      icon: Icon,
      count,
      size = 'md',
      glass = true,
      disabled = false,
    },
    ref
  ) => {
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'
    const config = SIZE_CONFIG[size]

    return (
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-200',
          'ios-font-semibold',
          'select-none',
          config.container,
          config.text,

          // Glassmorphic effect
          glass && 'glass-premium backdrop-blur-xl',

          // Border radius
          'rounded-[10px]',
          'xs:rounded-[12px]',

          // Border
          'border-2',

          // Active state
          active
            ? isDark
              ? [
                  // Dark active
                  'bg-primary-500/30',
                  'border-primary-400/70',
                  'text-primary-200',
                  'hover:bg-primary-500/40',
                  'shadow-lg shadow-primary-500/30',
                ]
              : [
                  // Light active
                  'bg-primary-100',
                  'border-primary-500/70',
                  'text-primary-800',
                  'hover:bg-primary-200',
                  'shadow-lg shadow-primary-500/15',
                ]
            : isDark
            ? [
                // Dark inactive
                glass ? 'bg-neutral-700/50' : 'bg-neutral-800',
                'border-neutral-600/50',
                'text-neutral-300',
                'hover:bg-neutral-700/70',
                'hover:border-neutral-500/60',
              ]
            : [
                // Light inactive
                glass ? 'bg-white/80' : 'bg-white',
                'border-neutral-300',
                'text-neutral-700',
                'hover:bg-white/95',
                'hover:border-neutral-400',
              ],

          // Active feedback
          'active:scale-95',

          // Focus
          'focus:outline-none',
          isDark
            ? 'focus:ring-2 focus:ring-primary-500/40'
            : 'focus:ring-2 focus:ring-primary-400/40',

          // Disabled
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={
          glass
            ? {
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              }
            : undefined
        }
        aria-pressed={active}
        aria-label={`Filtro: ${label}`}
      >
        {/* Icon */}
        {Icon && <Icon className={config.icon} />}

        {/* Label */}
        <span>{label}</span>

        {/* Count Badge */}
        {count !== undefined && (
          <span
            className={cn(
              'inline-flex items-center justify-center',
              'rounded-full',
              'ios-font-bold',
              'leading-none',
              config.count,
              active
                ? isDark
                  ? 'bg-primary-400/30 text-primary-200'
                  : 'bg-primary-500/20 text-primary-700'
                : isDark
                ? 'bg-white/10 text-neutral-400'
                : 'bg-neutral-200/80 text-neutral-600'
            )}
          >
            {count > 999 ? '999+' : count}
          </span>
        )}
      </button>
    )
  }
)

FilterChip.displayName = 'FilterChip'
