/**
 * Premium Button V2 - VisionOS Fintech 2026
 *
 * Ultra-premium capsule button with 3D depth, atmospheric lighting,
 * and professional blue-violet-magenta gradient.
 *
 * Features:
 * - Multi-layer glassmorphic depth
 * - Atmospheric light bloom
 * - Dual border system (outer stroke + inner glow)
 * - Icon micro-glow with emboss
 * - Professional SF Pro typography
 * - Advanced microinteractions
 *
 * Inspired by: VisionOS, Linear 2025, Arc Browser, Raycast Pro
 *
 * @module PremiumButtonV2
 * @version 2.0.0
 */

import * as React from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import './premium-button-v2.css'

export interface PremiumButtonV2Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label text */
  label: string
  /** Icon component (lucide-react) */
  icon?: LucideIcon
  /** Loading state */
  loading?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Full width */
  fullWidth?: boolean
}

/**
 * Premium Button V2 Component
 *
 * Ultra-premium capsule button with VisionOS-Fintech 2026 aesthetics
 */
export const PremiumButtonV2 = React.forwardRef<
  HTMLButtonElement,
  PremiumButtonV2Props
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
      sm: {
        height: 'h-[40px]',
        padding: 'px-5',
        fontSize: 'text-[14px]',
        iconSize: 'h-[15px] w-[15px]',
        gap: 'gap-2',
        radius: 'rounded-[20px]',
      },
      md: {
        height: 'h-[46px]',
        padding: 'px-6',
        fontSize: 'text-[15px]',
        iconSize: 'h-[16px] w-[16px]',
        gap: 'gap-2.5',
        radius: 'rounded-[23px]',
      },
      lg: {
        height: 'h-[52px]',
        padding: 'px-8',
        fontSize: 'text-[16px]',
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
          'relative',
          'overflow-visible',
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
          'select-none',
          'transition-all duration-300 ease-out',

          // States
          !isDisabled && [
            'premium-button-v2',
            'hover:premium-button-v2-hover',
            'active:premium-button-v2-pressed',
          ],

          // Disabled state
          isDisabled && 'premium-button-v2-disabled cursor-not-allowed',

          // Focus
          'focus:outline-none',
          'focus-visible:premium-button-v2-focus',

          className
        )}
        {...props}
      >
        {/* Solid Background Layer */}
        <div
          className={cn(
            'absolute inset-0',
            config.radius,
            'transition-all duration-300'
          )}
          style={{
            background: isDisabled
              ? 'rgba(30, 35, 45, 0.6)'
              : 'rgba(15, 20, 30, 0.85)',
            backdropFilter: 'blur(12px) saturate(140%)',
          }}
        />

        {/* Atmospheric Inner Glow - Volume */}
        <div
          className={cn(
            'absolute inset-0',
            config.radius,
            'transition-opacity duration-300',
            isDisabled ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(255,255,255,0.25) 0%, transparent 60%)',
            mixBlendMode: 'soft-light',
          }}
        />

        {/* Light Bloom - Top Highlight */}
        <div
          className={cn(
            'absolute inset-x-0 top-0',
            config.radius,
            'h-[45%]',
            'transition-opacity duration-300',
            isDisabled ? 'opacity-0' : 'opacity-100'
          )}
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
            mixBlendMode: 'overlay',
          }}
        />

        {/* Gradient Border System */}
        {/* Base Border with Gradient */}
        <div
          className={cn(
            'absolute inset-0',
            config.radius,
            'pointer-events-none',
            'transition-all duration-300'
          )}
          style={{
            border: '1.5px solid transparent',
            backgroundImage: isDisabled
              ? 'linear-gradient(rgba(15,20,30,0.85), rgba(15,20,30,0.85)), linear-gradient(135deg, rgba(100,116,139,0.3), rgba(71,85,105,0.3))'
              : 'linear-gradient(rgba(15,20,30,0.85), rgba(15,20,30,0.85)), linear-gradient(135deg, #3B82F6 0%, #7C4DFF 50%, #EC4899 100%)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        />

        {/* Inner Highlight */}
        <div
          className={cn('absolute inset-0', config.radius, 'pointer-events-none')}
          style={{
            boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.15)',
          }}
        />

        {/* Content Layer */}
        <span className="relative z-10 inline-flex items-center gap-[inherit]">
          {/* Icon with Micro-Glow */}
          {loading ? (
            <div
              className="relative"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.6))',
              }}
            >
              <Loader2
                className={cn(config.iconSize, 'animate-spin')}
                strokeWidth={1.75}
              />
            </div>
          ) : Icon ? (
            <div
              className="relative transition-transform duration-300"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(96,165,250,0.6))',
              }}
            >
              <Icon className={config.iconSize} strokeWidth={1.75} />
            </div>
          ) : null}

          {/* Label with Text Shadow */}
          <span
            style={{
              textShadow: '0 1px 2px rgba(0,0,0,0.25)',
            }}
          >
            {label}
          </span>
        </span>
      </button>
    )
  }
)

PremiumButtonV2.displayName = 'PremiumButtonV2'
