/**
 * Modal Presets - VisionOS Enterprise 2026
 *
 * Standardized modal patterns for common use cases:
 * - ConfirmModal: Yes/No confirmations
 * - AlertModal: Information/Warning alerts
 * - DeleteModal: Destructive action confirmation with justification
 * - FormModal: Form submission wrapper
 *
 * All presets use ResponsiveModal for automatic mobile/desktop adaptation
 */

import { useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Trash2,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { Button } from './button'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from './responsive-modal'

// ============================================
// TYPES
// ============================================

export type ModalVariant = 'info' | 'success' | 'warning' | 'danger' | 'default'

export interface BaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: 'sm' | 'default' | 'md' | 'lg' | 'xl'
}

export interface ConfirmModalProps extends BaseModalProps {
  variant?: ModalVariant
  icon?: LucideIcon
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  children?: ReactNode
}

export interface AlertModalProps extends BaseModalProps {
  variant?: ModalVariant
  icon?: LucideIcon
  confirmLabel?: string
  children?: ReactNode
}

export interface DeleteModalProps extends BaseModalProps {
  itemName?: string
  requireJustification?: boolean
  minJustificationLength?: number
  justificationLabel?: string
  justificationPlaceholder?: string
  onConfirm: (justification?: string) => void | Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  children?: ReactNode
}

export interface FormModalProps extends BaseModalProps {
  onSubmit: () => void | Promise<void>
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  isLoading?: boolean
  isValid?: boolean
  children: ReactNode
}

// ============================================
// VARIANT CONFIGURATIONS
// ============================================

const variantConfig: Record<
  ModalVariant,
  {
    icon: LucideIcon
    iconColorLight: string
    iconColorDark: string
    iconBgLight: string
    iconBgDark: string
    borderLight: string
    borderDark: string
    confirmVariant: 'primary' | 'secondary' | 'danger' | 'ghost'
  }
> = {
  info: {
    icon: Info,
    iconColorLight: 'text-blue-600',
    iconColorDark: 'text-blue-400',
    iconBgLight: 'bg-blue-100',
    iconBgDark: 'bg-blue-950/40',
    borderLight: '1.5px solid rgba(59, 130, 246, 0.25)',
    borderDark: '1.5px solid rgba(59, 130, 246, 0.3)',
    confirmVariant: 'primary',
  },
  success: {
    icon: CheckCircle2,
    iconColorLight: 'text-green-600',
    iconColorDark: 'text-green-400',
    iconBgLight: 'bg-green-100',
    iconBgDark: 'bg-green-950/40',
    borderLight: '1.5px solid rgba(34, 197, 94, 0.25)',
    borderDark: '1.5px solid rgba(34, 197, 94, 0.3)',
    confirmVariant: 'primary',
  },
  warning: {
    icon: AlertTriangle,
    iconColorLight: 'text-yellow-600',
    iconColorDark: 'text-yellow-400',
    iconBgLight: 'bg-yellow-100',
    iconBgDark: 'bg-yellow-950/40',
    borderLight: '1.5px solid rgba(234, 179, 8, 0.25)',
    borderDark: '1.5px solid rgba(234, 179, 8, 0.3)',
    confirmVariant: 'secondary',
  },
  danger: {
    icon: XCircle,
    iconColorLight: 'text-red-600',
    iconColorDark: 'text-red-400',
    iconBgLight: 'bg-red-100',
    iconBgDark: 'bg-red-950/40',
    borderLight: '1.5px solid rgba(239, 68, 68, 0.25)',
    borderDark: '1.5px solid rgba(239, 68, 68, 0.3)',
    confirmVariant: 'danger',
  },
  default: {
    icon: Info,
    iconColorLight: 'text-neutral-600',
    iconColorDark: 'text-neutral-400',
    iconBgLight: 'bg-neutral-100',
    iconBgDark: 'bg-neutral-800/40',
    borderLight: '1.5px solid rgba(115, 115, 115, 0.25)',
    borderDark: '1.5px solid rgba(115, 115, 115, 0.3)',
    confirmVariant: 'primary',
  },
}

// ============================================
// CONFIRM MODAL
// ============================================

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  size = 'sm',
  variant = 'info',
  icon: CustomIcon,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
  children,
}: ConfirmModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const config = variantConfig[variant]
  const Icon = CustomIcon || config.icon

  const handleConfirm = async () => {
    await onConfirm()
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size={size}>
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl',
                'flex items-center justify-center',
                isDark ? config.iconBgDark : config.iconBgLight
              )}
              style={{
                border: isDark ? config.borderDark : config.borderLight,
              }}
            >
              <Icon
                className={cn(
                  'h-5 w-5 sm:h-6 sm:w-6',
                  isDark ? config.iconColorDark : config.iconColorLight
                )}
                strokeWidth={1.8}
              />
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
              {description && (
                <ResponsiveModalDescription className="mt-1 sm:mt-2">
                  {description}
                </ResponsiveModalDescription>
              )}
            </div>
          </div>
        </ResponsiveModalHeader>

        {children && <ResponsiveModalBody>{children}</ResponsiveModalBody>}

        <ResponsiveModalFooter>
          <Button variant="ghost" onClick={handleCancel} disabled={isLoading} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================
// ALERT MODAL
// ============================================

export function AlertModal({
  open,
  onOpenChange,
  title,
  description,
  size = 'sm',
  variant = 'info',
  icon: CustomIcon,
  confirmLabel = 'Entendido',
  children,
}: AlertModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const config = variantConfig[variant]
  const Icon = CustomIcon || config.icon

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size={size}>
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl',
                'flex items-center justify-center',
                isDark ? config.iconBgDark : config.iconBgLight
              )}
              style={{
                border: isDark ? config.borderDark : config.borderLight,
              }}
            >
              <Icon
                className={cn(
                  'h-5 w-5 sm:h-6 sm:w-6',
                  isDark ? config.iconColorDark : config.iconColorLight
                )}
                strokeWidth={1.8}
              />
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
              {description && (
                <ResponsiveModalDescription className="mt-1 sm:mt-2">
                  {description}
                </ResponsiveModalDescription>
              )}
            </div>
          </div>
        </ResponsiveModalHeader>

        {children && <ResponsiveModalBody>{children}</ResponsiveModalBody>}

        <ResponsiveModalFooter>
          <Button variant="primary" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            {confirmLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================
// DELETE MODAL
// ============================================

export function DeleteModal({
  open,
  onOpenChange,
  title,
  description,
  size = 'default',
  itemName,
  requireJustification = true,
  minJustificationLength = 10,
  justificationLabel = 'Motivo de eliminación',
  justificationPlaceholder = 'Proporciona una justificación para la eliminación...',
  onConfirm,
  onCancel,
  isLoading = false,
  children,
}: DeleteModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const [justification, setJustification] = useState('')
  const [error, setError] = useState('')

  const isValid = !requireJustification || justification.trim().length >= minJustificationLength
  const canSubmit = !isLoading && isValid

  const handleConfirm = async () => {
    if (requireJustification && justification.trim().length < minJustificationLength) {
      setError(`La justificación debe tener al menos ${minJustificationLength} caracteres`)
      return
    }

    setError('')
    await onConfirm(requireJustification ? justification : undefined)
    if (!isLoading) {
      setJustification('')
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setJustification('')
    setError('')
    onCancel?.()
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      handleCancel()
    } else {
      onOpenChange(newOpen)
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent size={size}>
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl',
                'flex items-center justify-center',
                isDark ? 'bg-red-950/40' : 'bg-red-100'
              )}
              style={{
                border: isDark
                  ? '1.5px solid rgba(239, 68, 68, 0.3)'
                  : '1.5px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <Trash2
                className={cn('h-5 w-5 sm:h-6 sm:w-6', isDark ? 'text-red-400' : 'text-red-600')}
                strokeWidth={1.8}
              />
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-1 sm:mt-2">
                {description || (itemName ? `¿Estás seguro de que deseas eliminar "${itemName}"?` : 'Esta acción no se puede deshacer.')}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="space-y-4">
            {children}

            {/* Warning banner */}
            <div
              className={cn(
                'flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl',
                isDark ? 'bg-red-950/30' : 'bg-red-50'
              )}
              style={{
                border: isDark
                  ? '1px solid rgba(239, 68, 68, 0.25)'
                  : '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <AlertTriangle
                className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-red-500 mt-0.5"
                strokeWidth={2}
              />
              <p
                className={cn(
                  'text-xs sm:text-sm leading-relaxed',
                  isDark ? 'text-red-400' : 'text-red-700'
                )}
              >
                Esta acción es irreversible y quedará registrada en el historial de auditoría.
              </p>
            </div>

            {/* Justification field */}
            {requireJustification && (
              <div className="space-y-2">
                <label
                  className={cn(
                    'block text-xs sm:text-sm font-semibold',
                    isDark ? 'text-neutral-200' : 'text-neutral-700'
                  )}
                >
                  {justificationLabel}
                  <span className="ml-1 text-red-500">*</span>
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => {
                    setJustification(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder={justificationPlaceholder}
                  disabled={isLoading}
                  className={cn(
                    'w-full min-h-[100px] p-3 sm:p-4 rounded-xl sm:rounded-2xl resize-y',
                    'text-xs sm:text-sm leading-relaxed border-2 transition-all duration-200',
                    'focus:outline-none focus:ring-2',
                    error
                      ? 'border-red-500 focus:ring-red-500/30'
                      : 'border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500/30',
                    isDark ? 'bg-neutral-800/50 text-neutral-100' : 'bg-neutral-50 text-neutral-900',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                />
                {error && (
                  <p className="text-xs text-red-500 font-medium">{error}</p>
                )}
                <p
                  className={cn(
                    'text-xs',
                    isValid ? 'text-green-500' : isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}
                >
                  {justification.trim().length} / {minJustificationLength} caracteres mínimos
                </p>
              </div>
            )}
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button variant="ghost" onClick={handleCancel} disabled={isLoading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={!canSubmit} className="w-full sm:w-auto">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================
// FORM MODAL
// ============================================

export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  size = 'default',
  onSubmit,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  onCancel,
  isLoading = false,
  isValid = true,
  children,
}: FormModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const handleSubmit = async () => {
    await onSubmit()
    if (!isLoading) {
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size={size}>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{title}</ResponsiveModalTitle>
          {description && (
            <ResponsiveModalDescription className="mt-1 sm:mt-2">
              {description}
            </ResponsiveModalDescription>
          )}
        </ResponsiveModalHeader>

        <ResponsiveModalBody>{children}</ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button variant="ghost" onClick={handleCancel} disabled={isLoading} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading || !isValid}
            className="w-full sm:w-auto"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================
// HOOK FOR MODAL STATE
// ============================================

export function useModalState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState)

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    setIsOpen,
  }
}
