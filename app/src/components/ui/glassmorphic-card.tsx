/**
 * GlassmorphicCard Component
 *
 * Reusable premium glassmorphic card with visionOS 2025 design
 * Homologated with app design system (Sidebar, Header, Footer)
 */

import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { ReactNode, CSSProperties } from 'react'

export interface GlassmorphicCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'subtle' | 'code'
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  style?: CSSProperties
}

const VARIANT_STYLES = {
  dark: {
    default: {
      background: `
        linear-gradient(
          135deg,
          rgba(35, 35, 45, 0.7) 0%,
          rgba(30, 30, 40, 0.65) 50%,
          rgba(35, 35, 45, 0.6) 100%
        )
      `,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: `
        0 2px 6px rgba(0, 0, 0, 0.2),
        inset 0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.06)
      `,
    },
    elevated: {
      background: `
        linear-gradient(
          135deg,
          rgba(40, 40, 50, 0.85) 0%,
          rgba(35, 35, 45, 0.8) 50%,
          rgba(40, 40, 50, 0.75) 100%
        )
      `,
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: `
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 2px 6px rgba(0, 0, 0, 0.2),
        inset 0 0 0 1px rgba(255, 255, 255, 0.08),
        inset 0 2px 0 rgba(255, 255, 255, 0.1)
      `,
    },
    subtle: {
      background: `
        linear-gradient(
          135deg,
          rgba(30, 30, 38, 0.5) 0%,
          rgba(25, 25, 32, 0.45) 50%,
          rgba(30, 30, 38, 0.4) 100%
        )
      `,
      border: '1px solid rgba(255, 255, 255, 0.06)',
      boxShadow: `
        0 1px 3px rgba(0, 0, 0, 0.15),
        inset 0 0 0 1px rgba(255, 255, 255, 0.03),
        inset 0 1px 0 rgba(255, 255, 255, 0.04)
      `,
    },
    code: {
      background: `
        linear-gradient(
          135deg,
          rgba(30, 30, 38, 0.8) 0%,
          rgba(25, 25, 32, 0.75) 50%,
          rgba(30, 30, 38, 0.7) 100%
        )
      `,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: `
        0 2px 8px rgba(0, 0, 0, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.08)
      `,
    },
  },
  light: {
    default: {
      background: `
        linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.7) 0%,
          rgba(250, 250, 255, 0.65) 50%,
          rgba(255, 255, 255, 0.6) 100%
        )
      `,
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: `
        0 2px 6px rgba(0, 0, 0, 0.03),
        inset 0 0 0 1px rgba(255, 255, 255, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.5)
      `,
    },
    elevated: {
      background: `
        linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.85) 0%,
          rgba(250, 250, 255, 0.8) 50%,
          rgba(255, 255, 255, 0.75) 100%
        )
      `,
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: `
        0 4px 12px rgba(0, 0, 0, 0.05),
        0 2px 6px rgba(0, 0, 0, 0.03),
        inset 0 0 0 1px rgba(255, 255, 255, 0.4),
        inset 0 2px 0 rgba(255, 255, 255, 0.6)
      `,
    },
    subtle: {
      background: `
        linear-gradient(
          135deg,
          rgba(248, 250, 252, 0.6) 0%,
          rgba(241, 245, 249, 0.55) 50%,
          rgba(248, 250, 252, 0.5) 100%
        )
      `,
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: `
        0 1px 3px rgba(0, 0, 0, 0.02),
        inset 0 0 0 1px rgba(255, 255, 255, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.4)
      `,
    },
    code: {
      background: `
        linear-gradient(
          135deg,
          rgba(248, 250, 252, 0.9) 0%,
          rgba(241, 245, 249, 0.85) 50%,
          rgba(248, 250, 252, 0.8) 100%
        )
      `,
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: `
        0 2px 8px rgba(0, 0, 0, 0.04),
        inset 0 0 0 1px rgba(255, 255, 255, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `,
    },
  },
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
}

export function GlassmorphicCard({
  children,
  className,
  variant = 'default',
  interactive = false,
  padding = 'md',
  style,
}: GlassmorphicCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const variantStyle = VARIANT_STYLES[isDark ? 'dark' : 'light'][variant]

  return (
    <div
      className={cn(
        'rounded-[14px]',
        'glass-ultra-clear depth-layer-2 fresnel-edge',
        'glass-gpu-accelerated',
        PADDING_CLASSES[padding],
        interactive && 'transition-all duration-300 hover:scale-[1.01] cursor-pointer',
        className
      )}
      style={{
        background: variantStyle.background,
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        border: variantStyle.border,
        boxShadow: variantStyle.boxShadow,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
