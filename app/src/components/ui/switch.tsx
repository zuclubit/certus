/**
 * Switch Component - Enterprise 2025
 *
 * A toggle switch component following VisionOS design patterns.
 *
 * @version 1.0.0
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

export interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, className, id }, ref) => {
    const theme = useAppStore(selectTheme)
    const isDark = theme === 'dark'

    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
          'transition-all duration-300 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        style={{
          background: checked
            ? 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)'
            : isDark
              ? 'rgba(55, 55, 65, 0.6)'
              : 'rgba(200, 200, 210, 0.6)',
          border: checked
            ? '1.5px solid rgba(255, 255, 255, 0.3)'
            : isDark
              ? '1.5px solid rgba(255, 255, 255, 0.1)'
              : '1.5px solid rgba(0, 0, 0, 0.1)',
        }}
      >
        <span
          className={cn(
            'pointer-events-none block h-5 w-5 rounded-full shadow-lg',
            'transition-all duration-300 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0.5'
          )}
          style={{
            background: 'white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
        />
      </button>
    )
  }
)

Switch.displayName = 'Switch'

export default Switch
