/**
 * Premium Button Fintech Component
 *
 * Ultra-premium pill button inspired by fintech banking and SaaS 2025
 * Features:
 * - Pill shape with ultra-rounded corners (20-26px)
 * - Triple gradient: blue → purple → pink
 * - Glassmorphic glow and subtle 3D depth
 * - Professional, trustworthy, institutional feel
 * - Multiple states: normal, hover, pressed, disabled
 *
 * @module PremiumButtonFintech
 */

import * as React from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import './premium-button-fintech.css'

export interface PremiumButtonFintechProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label text */
  label: string
  /** Icon component (lucide-react) */
  icon?: LucideIcon
  /** Loading state */
  loading?: boolean
  /** Size variant */
  size?: 'md' | 'lg'
  /** Full width */
  fullWidth?: boolean
}

/**
 * Premium Button Fintech Component
 *
 * Professional pill button with triple gradient and glassmorphic effects
 */
export const PremiumButtonFintech = React.forwardRef<
  HTMLButtonElement,
  PremiumButtonFintechProps
>(
  (
    {
      label,
      icon: Icon,
      loading = false,
      size = 'lg',
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    const sizeConfig = {
      md: {
        height: 'h-[44px]',
        padding: 'px-6',
        fontSize: 'text-[14px]',
        iconSize: 'h-[16px] w-[16px]',
        gap: 'gap-2',
        radius: 'rounded-[20px]',
      },
      lg: {
        height: 'h-[52px]',
        padding: 'px-8',
        fontSize: 'text-[15px]',
        iconSize: 'h-[18px] w-[18px]',
        gap: 'gap-2.5',
        radius: 'rounded-[26px]',
      },
    }

    const config = sizeConfig[size]

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(
          // Layout
          'inline-flex items-center justify-center',
          config.height,
          config.padding,
          config.gap,
          config.radius,
          fullWidth && 'w-full',

          // Typography
          'font-semibold',
          config.fontSize,
          'leading-none',
          'text-white',
          'tracking-tight',

          // Base styles
          'relative',
          'overflow-hidden',
          'select-none',
          'transition-all duration-300 ease-out',

          // States
          !isDisabled && [
            'premium-button-fintech',
            'hover:premium-button-fintech-hover',
            'active:premium-button-fintech-pressed',
          ],

          // Disabled state
          isDisabled && 'premium-button-fintech-disabled cursor-not-allowed',

          // Focus
          'focus:outline-none',
          'focus-visible:ring-4',
          'focus-visible:ring-blue-500/30',

          className
        )}
        {...props}
      >
        {/* Background Gradient */}
        <div
          className={cn(
            'absolute inset-0',
            config.radius,
            'transition-opacity duration-300',
            isDisabled ? 'opacity-40' : 'opacity-100'
          )}
          style={{
            background: isDisabled
              ? 'linear-gradient(135deg, #64748B 0%, #475569 100%)'
              : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)',
          }}
        />

        {/* Inner Glow */}
        <div
          className={cn(
            'absolute inset-0',
            config.radius,
            'transition-opacity duration-300',
            isDisabled ? 'opacity-0' : 'opacity-20'
          )}
          style={{
            background:
              'radial-gradient(circle at top, rgba(255,255,255,0.3) 0%, transparent 70%)',
          }}
        />

        {/* Border Overlay */}
        <div
          className={cn('absolute inset-0', config.radius, 'pointer-events-none')}
          style={{
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        />

        {/* Content */}
        <span className="relative z-10 inline-flex items-center gap-[inherit]">
          {/* Icon or Loading */}
          {loading ? (
            <Loader2 className={cn(config.iconSize, 'animate-spin')} strokeWidth={2.5} />
          ) : Icon ? (
            <Icon className={config.iconSize} strokeWidth={2} />
          ) : null}

          {/* Label */}
          <span className="drop-shadow-sm">{label}</span>
        </span>
      </button>
    )
  }
)

PremiumButtonFintech.displayName = 'PremiumButtonFintech'
