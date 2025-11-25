/**
 * SearchBar Component
 *
 * Glassmorphic search input with responsive design and visual feedback
 * Follows the same design system as RowDetailModal and other premium components
 *
 * @module SearchBar
 */

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  value: string
  onValueChange: (value: string) => void
  onClear?: () => void
  size?: 'sm' | 'md' | 'lg'
  glass?: boolean
  showCount?: boolean
  resultCount?: number
  totalCount?: number
}

const SIZE_CONFIG = {
  sm: {
    container: 'h-9',
    input: 'ios-text-sm',
    icon: 'h-3.5 w-3.5',
    iconLeft: 'left-2.5',
    iconRight: 'right-2.5',
    paddingLeft: 'pl-8',
    paddingRight: 'pr-8',
  },
  md: {
    container: 'h-11',
    input: 'ios-text-base',
    icon: 'h-4 w-4',
    iconLeft: 'left-3',
    iconRight: 'right-3',
    paddingLeft: 'pl-10',
    paddingRight: 'pr-10',
  },
  lg: {
    container: 'h-12',
    input: 'ios-text-lg',
    icon: 'h-5 w-5',
    iconLeft: 'left-3.5',
    iconRight: 'right-3.5',
    paddingLeft: 'pl-12',
    paddingRight: 'pr-12',
  },
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onValueChange,
      onClear,
      size = 'md',
      glass = true,
      showCount = false,
      resultCount,
      totalCount,
      placeholder = 'Buscar...',
      className,
      ...props
    },
    ref
  ) => {
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'
    const [isFocused, setIsFocused] = React.useState(false)
    const config = SIZE_CONFIG[size]

    const handleClear = () => {
      onValueChange('')
      onClear?.()
    }

    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Search Input Container */}
        <div className="relative w-full">
          {/* Search Icon */}
          <Search
            className={cn(
              'absolute top-1/2 -translate-y-1/2 transition-colors',
              config.icon,
              config.iconLeft,
              isFocused
                ? isDark
                  ? 'text-primary-400'
                  : 'text-primary-600'
                : isDark
                ? 'text-neutral-500'
                : 'text-neutral-400'
            )}
          />

          {/* Input */}
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={cn(
              'w-full transition-all duration-200',
              config.container,
              config.input,
              config.paddingLeft,
              value ? config.paddingRight : '',
              'ios-font-regular',

              // Glassmorphic base
              glass && 'glass-premium backdrop-blur-xl',

              // Background
              isDark
                ? glass
                  ? 'bg-neutral-800/60 hover:bg-neutral-800/80'
                  : 'bg-neutral-800 hover:bg-neutral-750'
                : glass
                ? 'bg-white/80 hover:bg-white/95'
                : 'bg-white hover:bg-neutral-50',

              // Border
              'border-2',
              isDark
                ? isFocused
                  ? 'border-primary-500/50'
                  : 'border-white/10 hover:border-white/20'
                : isFocused
                ? 'border-primary-400/50'
                : 'border-neutral-200 hover:border-neutral-300',

              // Border radius
              'rounded-[14px]',
              'xs:rounded-[16px]',
              'md:rounded-[18px]',

              // Text
              isDark ? 'text-white' : 'text-neutral-900',

              // Placeholder
              isDark
                ? 'placeholder:text-neutral-400'
                : 'placeholder:text-neutral-500',

              // Focus ring
              'focus:outline-none',
              isDark
                ? 'focus:ring-2 focus:ring-primary-500/30'
                : 'focus:ring-2 focus:ring-primary-400/30',

              // Shadow
              glass &&
                (isDark
                  ? 'shadow-lg shadow-black/20'
                  : 'shadow-lg shadow-neutral-900/10'),

              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed',

              className
            )}
            style={
              glass
                ? {
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  }
                : undefined
            }
            {...props}
          />

          {/* Clear Button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute top-1/2 -translate-y-1/2',
                'flex items-center justify-center',
                'rounded-full transition-all duration-200',
                'active:scale-90',
                config.iconRight,
                size === 'sm' ? 'h-5 w-5' : size === 'md' ? 'h-6 w-6' : 'h-7 w-7',
                isDark
                  ? 'hover:bg-white/10 text-neutral-400 hover:text-white'
                  : 'hover:bg-neutral-200/80 text-neutral-500 hover:text-neutral-900'
              )}
              aria-label="Limpiar búsqueda"
            >
              <X className={config.icon} />
            </button>
          )}
        </div>

        {/* Result Count */}
        {showCount && resultCount !== undefined && totalCount !== undefined && (
          <div
            className={cn(
              'ios-text-xs ios-font-medium',
              'px-2',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            {value ? (
              <>
                Mostrando{' '}
                <span className={cn('ios-font-semibold', isDark ? 'text-white' : 'text-neutral-900')}>
                  {resultCount.toLocaleString('es-MX')}
                </span>{' '}
                de{' '}
                <span className={cn('ios-font-semibold', isDark ? 'text-white' : 'text-neutral-900')}>
                  {totalCount.toLocaleString('es-MX')}
                </span>{' '}
                registros
              </>
            ) : (
              <>
                <span className={cn('ios-font-semibold', isDark ? 'text-white' : 'text-neutral-900')}>
                  {totalCount.toLocaleString('es-MX')}
                </span>{' '}
                registros totales
              </>
            )}
          </div>
        )}
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'
