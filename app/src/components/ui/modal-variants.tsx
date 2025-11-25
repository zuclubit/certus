/**
 * Modal Variants - VisionOS Premium Design System
 *
 * Variantes especializadas de modales para casos de uso comunes:
 * - ConfirmDialog: Confirmación de acciones críticas
 * - FormModal: Formularios con validación
 * - DetailModal: Visualización de detalles
 * - AlertModal: Alertas y notificaciones
 *
 * Todos los componentes usan ResponsiveModal internamente.
 */

import * as React from 'react'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { Button } from './button'
import { Textarea } from './textarea'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from './responsive-modal'

// ============================================================================
// CONFIRM DIALOG
// ============================================================================

export type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success'

export interface ConfirmDialogProps {
  /** Estado de apertura */
  open: boolean
  /** Callback cuando cambia el estado */
  onOpenChange: (open: boolean) => void
  /** Título del diálogo */
  title: string
  /** Descripción del diálogo */
  description: string
  /** Texto del botón de confirmación */
  confirmLabel?: string
  /** Texto del botón de cancelación */
  cancelLabel?: string
  /** Variante visual */
  variant?: ConfirmDialogVariant
  /** Requerir justificación escrita */
  requireJustification?: boolean
  /** Label del campo de justificación */
  justificationLabel?: string
  /** Placeholder del campo de justificación */
  justificationPlaceholder?: string
  /** Longitud mínima de justificación */
  minJustificationLength?: number
  /** Callback al confirmar */
  onConfirm: (justification?: string) => void | Promise<void>
  /** Estado de carga */
  isLoading?: boolean
  /** Icono personalizado */
  icon?: LucideIcon
}

const confirmVariantConfig: Record<
  ConfirmDialogVariant,
  {
    icon: LucideIcon
    iconColor: string
    iconBg: string
    iconBgDark: string
    buttonVariant: 'danger' | 'warning' | 'primary' | 'success'
  }
> = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100',
    iconBgDark: 'bg-red-950/50',
    buttonVariant: 'danger',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-yellow-100',
    iconBgDark: 'bg-yellow-950/50',
    buttonVariant: 'warning',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100',
    iconBgDark: 'bg-blue-950/50',
    buttonVariant: 'primary',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100',
    iconBgDark: 'bg-green-950/50',
    buttonVariant: 'success',
  },
}

export function ConfirmDialog({
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
  icon: CustomIcon,
}: ConfirmDialogProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [justification, setJustification] = React.useState('')
  const [error, setError] = React.useState('')

  const config = confirmVariantConfig[variant]
  const Icon = CustomIcon || config.icon

  const handleConfirm = async () => {
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
      <ResponsiveModalContent size="sm" showCloseButton={false}>
        <ResponsiveModalHeader>
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={cn(
                'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
                isDark ? config.iconBgDark : config.iconBg
              )}
            >
              <Icon className={cn('h-6 w-6', config.iconColor)} />
            </div>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-2">
                {description}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        {/* Justification Field */}
        {requireJustification && (
          <ResponsiveModalBody>
            <label
              className={cn(
                'block text-sm font-medium mb-2',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}
            >
              {justificationLabel}
            </label>
            <Textarea
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value)
                if (error) setError('')
              }}
              placeholder={justificationPlaceholder}
              error={!!error}
              className="min-h-[120px]"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            <p
              className={cn(
                'mt-2 text-xs',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}
            >
              {justification.trim().length} / {minJustificationLength} caracteres mínimos
            </p>
          </ResponsiveModalBody>
        )}

        <ResponsiveModalFooter>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="sm:w-auto w-full"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant as any}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            isLoading={isLoading}
            className="sm:w-auto w-full"
          >
            {confirmLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// FORM MODAL
// ============================================================================

export interface FormModalProps {
  /** Estado de apertura */
  open: boolean
  /** Callback cuando cambia el estado */
  onOpenChange: (open: boolean) => void
  /** Título del formulario */
  title: string
  /** Descripción opcional */
  description?: string
  /** Contenido del formulario */
  children: React.ReactNode
  /** Texto del botón de submit */
  submitLabel?: string
  /** Texto del botón de cancelar */
  cancelLabel?: string
  /** Callback al hacer submit */
  onSubmit: () => void | Promise<void>
  /** Estado de carga */
  isLoading?: boolean
  /** Deshabilitar submit */
  isSubmitDisabled?: boolean
  /** Tamaño del modal */
  size?: 'sm' | 'default' | 'lg' | 'xl' | '2xl'
  /** Icono en el header */
  icon?: LucideIcon
  /** Color del icono */
  iconColor?: string
}

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  onSubmit,
  isLoading = false,
  isSubmitDisabled = false,
  size = 'default',
  icon: Icon,
  iconColor = 'text-primary-500',
}: FormModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit()
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size={size}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ResponsiveModalHeader>
            <div className="flex items-center gap-3">
              {Icon && (
                <div
                  className={cn(
                    'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                    isDark ? 'bg-white/10' : 'bg-neutral-100'
                  )}
                >
                  <Icon className={cn('h-5 w-5', iconColor)} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
                {description && (
                  <ResponsiveModalDescription>{description}</ResponsiveModalDescription>
                )}
              </div>
            </div>
          </ResponsiveModalHeader>

          <ResponsiveModalBody>{children}</ResponsiveModalBody>

          <ResponsiveModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="sm:w-auto w-full"
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitDisabled || isLoading}
              isLoading={isLoading}
              className="sm:w-auto w-full"
            >
              {submitLabel}
            </Button>
          </ResponsiveModalFooter>
        </form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// DETAIL MODAL
// ============================================================================

export interface DetailModalProps {
  /** Estado de apertura */
  open: boolean
  /** Callback cuando cambia el estado */
  onOpenChange: (open: boolean) => void
  /** Título */
  title: string
  /** Subtítulo opcional */
  subtitle?: string
  /** Contenido */
  children: React.ReactNode
  /** Texto del botón de cerrar */
  closeLabel?: string
  /** Tamaño del modal */
  size?: 'sm' | 'default' | 'lg' | 'xl' | '2xl' | '3xl'
  /** Badges/status para mostrar junto al título */
  badges?: React.ReactNode
  /** Icono del header */
  icon?: LucideIcon
}

export function DetailModal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  closeLabel = 'Cerrar',
  size = 'lg',
  badges,
  icon: Icon,
}: DetailModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size={size}>
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3 pr-8">
            {Icon && (
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                  isDark ? 'bg-white/10' : 'bg-neutral-100'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isDark ? 'text-neutral-300' : 'text-neutral-600'
                  )}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
                {badges}
              </div>
              {subtitle && (
                <ResponsiveModalDescription>{subtitle}</ResponsiveModalDescription>
              )}
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>{children}</ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="sm:w-auto w-full min-w-[120px]"
          >
            {closeLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// ALERT MODAL
// ============================================================================

export type AlertModalVariant = 'info' | 'success' | 'warning' | 'error'

export interface AlertModalProps {
  /** Estado de apertura */
  open: boolean
  /** Callback cuando cambia el estado */
  onOpenChange: (open: boolean) => void
  /** Título */
  title: string
  /** Mensaje */
  message: string
  /** Variante visual */
  variant?: AlertModalVariant
  /** Texto del botón */
  buttonLabel?: string
  /** Callback al hacer click en el botón */
  onAction?: () => void
}

const alertVariantConfig: Record<
  AlertModalVariant,
  {
    icon: LucideIcon
    iconColor: string
    iconBg: string
    iconBgDark: string
  }
> = {
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100',
    iconBgDark: 'bg-blue-950/50',
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100',
    iconBgDark: 'bg-green-950/50',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-yellow-100',
    iconBgDark: 'bg-yellow-950/50',
  },
  error: {
    icon: X,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100',
    iconBgDark: 'bg-red-950/50',
  },
}

export function AlertModal({
  open,
  onOpenChange,
  title,
  message,
  variant = 'info',
  buttonLabel = 'Entendido',
  onAction,
}: AlertModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const config = alertVariantConfig[variant]
  const Icon = config.icon

  const handleAction = () => {
    onAction?.()
    onOpenChange(false)
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size="sm" showCloseButton={false}>
        <ResponsiveModalBody>
          <div className="flex flex-col items-center text-center py-4">
            {/* Icon */}
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center mb-4',
                isDark ? config.iconBgDark : config.iconBg
              )}
            >
              <Icon className={cn('h-8 w-8', config.iconColor)} />
            </div>

            {/* Title */}
            <h3
              className={cn(
                'text-xl font-bold mb-2',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
            >
              {title}
            </h3>

            {/* Message */}
            <p
              className={cn(
                'text-sm',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              {message}
            </p>
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="primary"
            onClick={handleAction}
            className="w-full sm:w-auto min-w-[120px]"
          >
            {buttonLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  confirmVariantConfig,
  alertVariantConfig,
}
