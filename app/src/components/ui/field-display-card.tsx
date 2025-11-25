/**
 * FieldDisplayCard Component
 *
 * Displays a single field with label and value in premium glassmorphic style
 * Used for displaying parsed data fields in modals and detail views
 */

import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { GlassmorphicCard } from './glassmorphic-card'

export interface FieldDisplayCardProps {
  label: string
  value: string | number | boolean | null | undefined
  variant?: 'default' | 'mono' | 'emphasized'
  fullWidth?: boolean
}

export function FieldDisplayCard({
  label,
  value,
  variant = 'default',
  fullWidth = false,
}: FieldDisplayCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const displayValue = value !== null && value !== undefined ? String(value) : '-'
  const isEmpty = value === null || value === undefined || value === ''

  return (
    <GlassmorphicCard
      variant="default"
      padding="md"
      interactive
      className={cn(fullWidth && 'md:col-span-2')}
    >
      <div className="flex flex-col gap-1.5">
        <span
          className={cn(
            'ios-text-caption1 ios-font-medium',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            'ios-text-body ios-font-semibold',
            variant === 'mono' && 'font-mono text-sm',
            variant === 'emphasized' && 'ios-text-subheadline',
            isEmpty && 'opacity-50',
            isDark ? 'text-white' : 'text-neutral-900'
          )}
          title={displayValue}
        >
          {variant === 'mono' ? (
            <code className={cn(
              'px-1.5 py-0.5 rounded-[6px]',
              isDark
                ? 'bg-neutral-800/50 text-blue-300'
                : 'bg-neutral-100/80 text-blue-700'
            )}>
              {displayValue}
            </code>
          ) : (
            <span className="line-clamp-2">{displayValue}</span>
          )}
        </span>
      </div>
    </GlassmorphicCard>
  )
}
