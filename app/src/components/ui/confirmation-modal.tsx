/**
 * ConfirmationModal Component - VisionOS Premium Design System
 *
 * Modal de confirmación responsivo para acciones críticas con justificación opcional.
 * Migrado al sistema ResponsiveModal para:
 * - Dialog en desktop, Drawer en móvil
 * - Accesibilidad completa con focus trap
 * - Animaciones iOS-style
 * - Ajustes multi-dispositivo
 *
 * @compliance CONSAR audit trail requirements
 * @architecture Clean Architecture + Component Composition
 */

import { useState } from 'react'
import { AlertTriangle, Trash2, AlertCircle, XCircle } from 'lucide-react'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from './responsive-modal'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

// ============================================================================
// TYPES
// ============================================================================

export type ConfirmationVariant = 'danger' | 'warning' | 'info'

export interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmationVariant
  requireJustification?: boolean
  justificationLabel?: string
  justificationPlaceholder?: string
  minJustificationLength?: number
  onConfirm: (justification?: string) => void | Promise<void>
  isLoading?: boolean
}

// ============================================================================
// VARIANT CONFIG
// ============================================================================

const variantConfig = {
  danger: {
    icon: Trash2,
    iconColorLight: 'text-red-600',
    iconColorDark: 'text-red-400',
    iconBgLight: 'bg-red-100',
    iconBgDark: 'bg-red-950/40',
    borderLight: '1.5px solid rgba(239, 68, 68, 0.25)',
    borderDark: '1.5px solid rgba(239, 68, 68, 0.3)',
    glowLight: '0 0 24px rgba(239, 68, 68, 0.15)',
    glowDark: '0 0 24px rgba(239, 68, 68, 0.2)',
    confirmVariant: 'danger' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColorLight: 'text-yellow-600',
    iconColorDark: 'text-yellow-400',
    iconBgLight: 'bg-yellow-100',
    iconBgDark: 'bg-yellow-950/40',
    borderLight: '1.5px solid rgba(251, 191, 36, 0.25)',
    borderDark: '1.5px solid rgba(251, 191, 36, 0.3)',
    glowLight: '0 0 24px rgba(251, 191, 36, 0.15)',
    glowDark: '0 0 24px rgba(251, 191, 36, 0.2)',
    confirmVariant: 'secondary' as const,
  },
  info: {
    icon: AlertCircle,
    iconColorLight: 'text-blue-600',
    iconColorDark: 'text-blue-400',
    iconBgLight: 'bg-blue-100',
    iconBgDark: 'bg-blue-950/40',
    borderLight: '1.5px solid rgba(59, 130, 246, 0.25)',
    borderDark: '1.5px solid rgba(59, 130, 246, 0.3)',
    glowLight: '0 0 24px rgba(59, 130, 246, 0.15)',
    glowDark: '0 0 24px rgba(59, 130, 246, 0.2)',
    confirmVariant: 'primary' as const,
  },
}

// ============================================================================
// JUSTIFICATION TEXTAREA SUB-COMPONENT
// ============================================================================

interface JustificationFieldProps {
  value: string
  onChange: (value: string) => void
  error: string
  onClearError: () => void
  disabled?: boolean
  label: string
  placeholder: string
  minLength: number
}

function JustificationField({
  value,
  onChange,
  error,
  onClearError,
  disabled = false,
  label,
  placeholder,
  minLength,
}: JustificationFieldProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const isValid = value.trim().length >= minLength

  return (
    <div className="space-y-3">
      {/* Label */}
      <label
        className={cn(
          // Responsive text
          'block text-xs sm:text-sm font-semibold',
          isDark ? 'text-neutral-200' : 'text-neutral-700'
        )}
      >
        {label}
        <span className="ml-1 text-red-500">*</span>
      </label>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          if (error) onClearError()
        }}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus
        aria-label={label}
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? 'justification-error' : undefined}
        className={cn(
          // Responsive sizing
          'w-full min-h-[100px] sm:min-h-[120px] md:min-h-[140px]',
          'max-h-[40vh]',
          // Responsive padding
          'p-3 sm:p-4',
          'rounded-xl sm:rounded-2xl',
          'resize-y',
          // Responsive text
          'text-xs sm:text-sm leading-relaxed',
          'border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2',
          'placeholder:text-neutral-400 placeholder:text-xs sm:placeholder:text-sm',
          error
            ? 'border-red-500 focus:ring-red-500/30'
            : 'border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500/30',
          isDark
            ? 'bg-neutral-800/50 text-neutral-100'
            : 'bg-neutral-50 text-neutral-900',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />

      {/* Error message */}
      {error && (
        <div
          id="justification-error"
          role="alert"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl',
            isDark ? 'bg-red-950/30' : 'bg-red-50'
          )}
          style={{
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" strokeWidth={2} />
          <p className="text-xs font-medium text-red-500">{error}</p>
        </div>
      )}

      {/* Character counter */}
      <div className="flex items-center justify-between px-1">
        <p className={cn('text-[10px] sm:text-xs', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
          Mínimo {minLength} caracteres
        </p>
        <p
          className={cn(
            'text-[10px] sm:text-xs font-semibold tabular-nums',
            isValid ? 'text-green-500' : isDark ? 'text-neutral-500' : 'text-neutral-500'
          )}
        >
          {value.trim().length} / {minLength}
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  requireJustification = false,
  justificationLabel = 'Justificación (requerida)',
  justificationPlaceholder = 'Por favor proporciona una razón detallada para esta acción...',
  minJustificationLength = 10,
  onConfirm,
  isLoading = false,
}: ConfirmationModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [justification, setJustification] = useState('')
  const [error, setError] = useState('')

  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    // Validate justification if required
    if (requireJustification) {
      if (!justification.trim()) {
        setError('La justificación es requerida')
        return
      }
      if (justification.trim().length < minJustificationLength) {
        setError(`La justificación debe tener al menos ${minJustificationLength} caracteres`)
        return
      }
    }

    setError('')
    await onConfirm(requireJustification ? justification : undefined)

    // Reset state after confirmation
    setJustification('')
  }

  const handleCancel = () => {
    setJustification('')
    setError('')
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel()
    } else {
      onOpenChange(newOpen)
    }
  }

  const isConfirmDisabled =
    isLoading ||
    (requireJustification &&
      (!justification.trim() || justification.trim().length < minJustificationLength))

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent size={requireJustification ? 'lg' : 'default'}>
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon - Responsive sizing */}
            <div
              className={cn(
                // Responsive icon container
                'flex-shrink-0',
                'w-10 h-10 sm:w-12 sm:h-12',
                'rounded-xl sm:rounded-2xl',
                'flex items-center justify-center',
                isDark ? config.iconBgDark : config.iconBgLight
              )}
              style={{
                border: isDark ? config.borderDark : config.borderLight,
                boxShadow: isDark ? config.glowDark : config.glowLight,
              }}
            >
              <Icon
                className={cn(
                  // Responsive icon size
                  'h-5 w-5 sm:h-6 sm:w-6',
                  isDark ? config.iconColorDark : config.iconColorLight
                )}
                strokeWidth={1.8}
              />
            </div>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-1 sm:mt-2">
                {description}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        {/* Justification Field */}
        {requireJustification && (
          <ResponsiveModalBody>
            <JustificationField
              value={justification}
              onChange={setJustification}
              error={error}
              onClearError={() => setError('')}
              disabled={isLoading}
              label={justificationLabel}
              placeholder={justificationPlaceholder}
              minLength={minJustificationLength}
            />
          </ResponsiveModalBody>
        )}

        {/* Footer with Actions - Responsive layout */}
        <ResponsiveModalFooter>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
