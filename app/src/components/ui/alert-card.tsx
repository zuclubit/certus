/**
 * AlertCard Component
 *
 * Premium glassmorphic alert card for errors, warnings, success, and info messages
 * Homologated with app design system
 */

import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { ReactNode } from 'react'

export type AlertVariant = 'error' | 'warning' | 'success' | 'info'

export interface AlertCardProps {
  variant: AlertVariant
  title?: string
  message: string
  details?: ReactNode
  showIcon?: boolean
}

const VARIANT_CONFIG = {
  error: {
    icon: AlertCircle,
    dark: {
      background: `
        linear-gradient(
          135deg,
          rgba(127, 29, 29, 0.35) 0%,
          rgba(153, 27, 27, 0.3) 50%,
          rgba(127, 29, 29, 0.25) 100%
        )
      `,
      border: '1px solid rgba(239, 68, 68, 0.35)',
      boxShadow: `
        0 2px 10px rgba(127, 29, 29, 0.35),
        inset 0 0 0 1px rgba(248, 113, 113, 0.12),
        inset 0 1px 0 rgba(248, 113, 113, 0.18)
      `,
      iconColor: 'text-red-400',
      titleColor: 'text-red-100',
      messageColor: 'text-red-200',
      detailsColor: 'text-red-300',
    },
    light: {
      background: `
        linear-gradient(
          135deg,
          rgba(254, 226, 226, 0.95) 0%,
          rgba(254, 202, 202, 0.9) 50%,
          rgba(254, 226, 226, 0.85) 100%
        )
      `,
      border: '1px solid rgba(239, 68, 68, 0.4)',
      boxShadow: `
        0 2px 10px rgba(239, 68, 68, 0.12),
        inset 0 0 0 1px rgba(239, 68, 68, 0.25),
        inset 0 1px 0 rgba(254, 226, 226, 0.7)
      `,
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-800',
      detailsColor: 'text-red-700',
    },
  },
  warning: {
    icon: AlertTriangle,
    dark: {
      background: `
        linear-gradient(
          135deg,
          rgba(113, 63, 18, 0.35) 0%,
          rgba(133, 77, 14, 0.3) 50%,
          rgba(113, 63, 18, 0.25) 100%
        )
      `,
      border: '1px solid rgba(234, 179, 8, 0.35)',
      boxShadow: `
        0 2px 10px rgba(113, 63, 18, 0.35),
        inset 0 0 0 1px rgba(250, 204, 21, 0.12),
        inset 0 1px 0 rgba(250, 204, 21, 0.18)
      `,
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-100',
      messageColor: 'text-yellow-200',
      detailsColor: 'text-yellow-300',
    },
    light: {
      background: `
        linear-gradient(
          135deg,
          rgba(254, 249, 195, 0.95) 0%,
          rgba(254, 240, 138, 0.9) 50%,
          rgba(254, 249, 195, 0.85) 100%
        )
      `,
      border: '1px solid rgba(234, 179, 8, 0.4)',
      boxShadow: `
        0 2px 10px rgba(234, 179, 8, 0.12),
        inset 0 0 0 1px rgba(234, 179, 8, 0.25),
        inset 0 1px 0 rgba(254, 249, 195, 0.7)
      `,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      messageColor: 'text-yellow-800',
      detailsColor: 'text-yellow-700',
    },
  },
  success: {
    icon: CheckCircle,
    dark: {
      background: `
        linear-gradient(
          135deg,
          rgba(20, 83, 45, 0.35) 0%,
          rgba(22, 101, 52, 0.3) 50%,
          rgba(20, 83, 45, 0.25) 100%
        )
      `,
      border: '1px solid rgba(34, 197, 94, 0.35)',
      boxShadow: `
        0 2px 10px rgba(20, 83, 45, 0.35),
        inset 0 0 0 1px rgba(74, 222, 128, 0.12),
        inset 0 1px 0 rgba(74, 222, 128, 0.18)
      `,
      iconColor: 'text-green-400',
      titleColor: 'text-green-100',
      messageColor: 'text-green-200',
      detailsColor: 'text-green-300',
    },
    light: {
      background: `
        linear-gradient(
          135deg,
          rgba(220, 252, 231, 0.95) 0%,
          rgba(187, 247, 208, 0.9) 50%,
          rgba(220, 252, 231, 0.85) 100%
        )
      `,
      border: '1px solid rgba(34, 197, 94, 0.4)',
      boxShadow: `
        0 2px 10px rgba(34, 197, 94, 0.12),
        inset 0 0 0 1px rgba(34, 197, 94, 0.25),
        inset 0 1px 0 rgba(220, 252, 231, 0.7)
      `,
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      messageColor: 'text-green-800',
      detailsColor: 'text-green-700',
    },
  },
  info: {
    icon: Info,
    dark: {
      background: `
        linear-gradient(
          135deg,
          rgba(30, 58, 138, 0.35) 0%,
          rgba(29, 78, 216, 0.3) 50%,
          rgba(30, 58, 138, 0.25) 100%
        )
      `,
      border: '1px solid rgba(59, 130, 246, 0.35)',
      boxShadow: `
        0 2px 10px rgba(30, 58, 138, 0.35),
        inset 0 0 0 1px rgba(96, 165, 250, 0.12),
        inset 0 1px 0 rgba(96, 165, 250, 0.18)
      `,
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-100',
      messageColor: 'text-blue-200',
      detailsColor: 'text-blue-300',
    },
    light: {
      background: `
        linear-gradient(
          135deg,
          rgba(219, 234, 254, 0.95) 0%,
          rgba(191, 219, 254, 0.9) 50%,
          rgba(219, 234, 254, 0.85) 100%
        )
      `,
      border: '1px solid rgba(59, 130, 246, 0.4)',
      boxShadow: `
        0 2px 10px rgba(59, 130, 246, 0.12),
        inset 0 0 0 1px rgba(59, 130, 246, 0.25),
        inset 0 1px 0 rgba(219, 234, 254, 0.7)
      `,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-800',
      detailsColor: 'text-blue-700',
    },
  },
}

export function AlertCard({
  variant,
  title,
  message,
  details,
  showIcon = true,
}: AlertCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const config = VARIANT_CONFIG[variant]
  const Icon = config.icon
  const style = isDark ? config.dark : config.light

  return (
    <div
      className={cn(
        'p-3 rounded-[16px]',
        'glass-ultra-clear depth-layer-3 fresnel-edge',
        'glass-gpu-accelerated',
        'transition-all duration-300 hover:scale-[1.005]'
      )}
      style={{
        background: style.background,
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: style.border,
        boxShadow: style.boxShadow,
      }}
    >
      <div className="flex items-start gap-2.5">
        {showIcon && (
          <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', style.iconColor)} />
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <div className={cn('ios-text-footnote ios-font-bold mb-1', style.titleColor)}>
              {title}
            </div>
          )}
          <div className={cn('ios-text-footnote ios-font-semibold', style.messageColor)}>
            {message}
          </div>
          {details && (
            <div className={cn('mt-1.5 ios-text-caption2 ios-font-medium', style.detailsColor)}>
              {details}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
