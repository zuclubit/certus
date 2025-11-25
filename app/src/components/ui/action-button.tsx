/**
 * ActionButton Component
 *
 * Action button with glassmorphic design for toolbar actions
 * Supports icons, loading states, and responsive text hiding
 *
 * @module ActionButton
 */

import * as React from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  glass?: boolean
  hideTextOnMobile?: boolean
}

const SIZE_CONFIG = {
  sm: {
    container: 'h-8 px-3 gap-1.5',
    text: 'ios-text-xs',
    icon: 'h-3.5 w-3.5',
  },
  md: {
    container: 'h-9 px-4 gap-2',
    text: 'ios-text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    container: 'h-10 px-5 gap-2',
    text: 'ios-text-base',
    icon: 'h-4.5 w-4.5',
  },
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      label,
      icon: Icon,
      variant = 'default',
      size = 'md',
      loading = false,
      glass = true,
      hideTextOnMobile = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'
    const config = SIZE_CONFIG[size]
    const isDisabled = disabled || loading

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return isDark
            ? [
                'bg-primary-500/20 border-primary-400/50 text-primary-300',
                'hover:bg-primary-500/30 hover:border-primary-400/60',
                'active:bg-primary-500/40',
              ]
            : [
                'bg-primary-50 border-primary-400/60 text-primary-700',
                'hover:bg-primary-100 hover:border-primary-500/70',
                'active:bg-primary-200',
              ]

        case 'secondary':
          return isDark
            ? [
                'bg-neutral-700/50 border-neutral-600/50 text-neutral-200',
                'hover:bg-neutral-700/70 hover:border-neutral-500/60',
                'active:bg-neutral-700/90',
              ]
            : [
                'bg-neutral-100 border-neutral-300/60 text-neutral-700',
                'hover:bg-neutral-200 hover:border-neutral-400/70',
                'active:bg-neutral-300',
              ]

        case 'success':
          return isDark
            ? [
                'bg-green-500/20 border-green-400/50 text-green-300',
                'hover:bg-green-500/30 hover:border-green-400/60',
                'active:bg-green-500/40',
              ]
            : [
                'bg-green-50 border-green-400/60 text-green-700',
                'hover:bg-green-100 hover:border-green-500/70',
                'active:bg-green-200',
              ]

        case 'danger':
          return isDark
            ? [
                'bg-red-500/20 border-red-400/50 text-red-300',
                'hover:bg-red-500/30 hover:border-red-400/60',
                'active:bg-red-500/40',
              ]
            : [
                'bg-red-50 border-red-400/60 text-red-700',
                'hover:bg-red-100 hover:border-red-500/70',
                'active:bg-red-200',
              ]

        default:
          return isDark
            ? [
                glass ? 'bg-neutral-700/50' : 'bg-neutral-800',
                'border-neutral-600/50 text-neutral-200',
                'hover:bg-neutral-700/70 hover:border-neutral-500/60',
                'active:bg-neutral-700/90',
              ]
            : [
                glass ? 'bg-white/80' : 'bg-white',
                'border-neutral-300 text-neutral-700',
                'hover:bg-white/95 hover:border-neutral-400',
                'active:bg-neutral-50',
              ]
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-200',
          'ios-font-semibold',
          'select-none',
          config.container,
          config.text,

          // Glassmorphic effect
          glass && 'glass-premium backdrop-blur-xl',

          // Border
          'border-2',

          // Border radius
          'rounded-[10px]',
          'xs:rounded-[12px]',

          // Variant styles
          ...getVariantStyles(),

          // Active feedback
          !isDisabled && 'active:scale-95',

          // Focus
          'focus:outline-none',
          isDark
            ? 'focus:ring-2 focus:ring-primary-500/40'
            : 'focus:ring-2 focus:ring-primary-400/40',

          // Disabled
          isDisabled && 'opacity-50 cursor-not-allowed',

          className
        )}
        style={
          glass
            ? {
                backdropFilter: 'blur(16px) saturate(180%)',
                WebkitBackdropFilter: 'blur(16px) saturate(180%)',
              }
            : undefined
        }
        {...props}
      >
        {/* Icon or Loading Spinner */}
        {loading ? (
          <Loader2 className={cn(config.icon, 'animate-spin')} />
        ) : Icon ? (
          <Icon className={config.icon} />
        ) : null}

        {/* Label */}
        <span className={cn(hideTextOnMobile && 'hidden xs:inline')}>{label}</span>
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'
