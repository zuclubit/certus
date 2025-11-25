/**
 * PremiumButton Component
 *
 * Premium glassmorphic button with visionOS 2025 design
 * Homologated with app design system (matches footer and sidebar buttons)
 */

import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

export interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 ios-text-caption1 rounded-[10px]',
  md: 'px-5 py-2 ios-text-body rounded-[14px]',
  lg: 'px-6 py-2.5 ios-text-subheadline rounded-[16px]',
}

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: PremiumButtonProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const getVariantStyles = () => {
    if (variant === 'primary') {
      return {
        background: isDark
          ? `
            linear-gradient(
              135deg,
              rgba(59, 130, 246, 0.9) 0%,
              rgba(37, 99, 235, 0.85) 50%,
              rgba(59, 130, 246, 0.8) 100%
            )
          `
          : `
            linear-gradient(
              135deg,
              rgba(59, 130, 246, 0.95) 0%,
              rgba(37, 99, 235, 0.9) 50%,
              rgba(59, 130, 246, 0.85) 100%
            )
          `,
        border: isDark
          ? '1px solid rgba(96, 165, 250, 0.4)'
          : '1px solid rgba(59, 130, 246, 0.5)',
        boxShadow: isDark
          ? `
            0 4px 12px rgba(59, 130, 246, 0.25),
            0 2px 6px rgba(59, 130, 246, 0.2),
            inset 0 0 0 1px rgba(147, 197, 253, 0.15),
            inset 0 2px 0 rgba(147, 197, 253, 0.2)
          `
          : `
            0 4px 12px rgba(59, 130, 246, 0.2),
            0 2px 6px rgba(59, 130, 246, 0.15),
            inset 0 0 0 1px rgba(191, 219, 254, 0.3),
            inset 0 2px 0 rgba(191, 219, 254, 0.5)
          `,
        color: 'rgb(255, 255, 255)',
      }
    }

    if (variant === 'secondary') {
      return {
        background: isDark
          ? `
            linear-gradient(
              135deg,
              rgba(45, 45, 55, 0.8) 0%,
              rgba(40, 40, 50, 0.75) 50%,
              rgba(45, 45, 55, 0.7) 100%
            )
          `
          : `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(250, 250, 255, 0.75) 50%,
              rgba(255, 255, 255, 0.7) 100%
            )
          `,
        border: isDark
          ? '1px solid rgba(255, 255, 255, 0.15)'
          : '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: isDark
          ? `
            0 4px 12px rgba(0, 0, 0, 0.3),
            0 2px 6px rgba(0, 0, 0, 0.2),
            inset 0 0 0 1px rgba(255, 255, 255, 0.08),
            inset 0 2px 0 rgba(255, 255, 255, 0.1)
          `
          : `
            0 4px 12px rgba(0, 0, 0, 0.05),
            0 2px 6px rgba(0, 0, 0, 0.03),
            inset 0 0 0 1px rgba(255, 255, 255, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.6)
          `,
        color: isDark ? 'rgb(255, 255, 255)' : 'rgb(23, 23, 23)',
      }
    }

    // ghost
    return {
      background: 'transparent',
      border: '1px solid transparent',
      boxShadow: 'none',
      color: isDark ? 'rgb(212, 212, 216)' : 'rgb(82, 82, 91)',
    }
  }

  const variantStyles = getVariantStyles()

  return (
    <button
      className={cn(
        'ios-font-semibold',
        SIZE_CLASSES[size],
        'glass-ultra-clear depth-layer-3 fresnel-edge',
        'glass-gpu-accelerated spring-bounce',
        'active:scale-[0.95]',
        'transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'ghost' && 'hover:bg-neutral-500/10',
        className
      )}
      style={{
        background: variantStyles.background,
        backdropFilter: variant !== 'ghost' ? 'blur(16px) saturate(180%) brightness(1.05)' : undefined,
        WebkitBackdropFilter: variant !== 'ghost' ? 'blur(16px) saturate(180%) brightness(1.05)' : undefined,
        border: variantStyles.border,
        boxShadow: variantStyles.boxShadow,
        color: variantStyles.color,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
