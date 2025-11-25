/**
 * ApprovalModals Component - VisionOS Premium Design System
 *
 * Modales de confirmación para acciones de aprobación.
 * Migrado al sistema ResponsiveModal para:
 * - Dialog en desktop, Drawer en móvil
 * - Accesibilidad completa con focus trap
 * - Animaciones iOS-style
 * - Ajustes multi-dispositivo
 *
 * @compliance CONSAR Multi-level Approval System
 * @architecture Clean Architecture + Component Composition
 */

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  ArrowUpCircle,
  MessageSquare,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'

// Sistema de modales responsivos
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalBody,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { Button } from '@/components/ui/button'

// ============================================================================
// TYPES
// ============================================================================

export type ApprovalActionType = 'approve' | 'reject' | 'escalate' | 'request_info'

export interface ApprovalActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: ApprovalActionType
  workflowName?: string
  currentLevel?: number
  onConfirm: (comment: string) => void | Promise<void>
  isLoading?: boolean
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  minCommentLength: {
    approve: 10,
    reject: 20,
    escalate: 15,
    request_info: 10,
  },
} as const

const actionConfig = {
  approve: {
    icon: CheckCircle2,
    title: 'Confirmar Aprobación',
    description: 'Esta acción aprobará el workflow y avanzará al siguiente nivel.',
    confirmLabel: 'Aprobar Workflow',
    commentLabel: 'Comentario de Aprobación',
    commentPlaceholder: 'Proporciona un comentario que justifique la aprobación del workflow...',
    iconColorLight: 'text-green-600',
    iconColorDark: 'text-green-400',
    iconBgLight: 'bg-green-100',
    iconBgDark: 'bg-green-950/40',
    borderLight: '1.5px solid rgba(34, 197, 94, 0.25)',
    borderDark: '1.5px solid rgba(34, 197, 94, 0.3)',
    glowLight: '0 0 24px rgba(34, 197, 94, 0.15)',
    glowDark: '0 0 24px rgba(34, 197, 94, 0.2)',
    confirmVariant: 'primary' as const,
  },
  reject: {
    icon: XCircle,
    title: 'Confirmar Rechazo',
    description: 'Esta acción rechazará el workflow. Se requiere una justificación detallada.',
    confirmLabel: 'Rechazar Workflow',
    commentLabel: 'Justificación del Rechazo (requerida)',
    commentPlaceholder: 'Proporciona una justificación detallada para el rechazo. Esta información será registrada en el historial de auditoría.',
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
  escalate: {
    icon: ArrowUpCircle,
    title: 'Escalar Workflow',
    description: 'Esta acción escalará el workflow al siguiente nivel de aprobación.',
    confirmLabel: 'Escalar al Siguiente Nivel',
    commentLabel: 'Razón de Escalamiento',
    commentPlaceholder: 'Explica por qué el workflow debe ser escalado al siguiente nivel de aprobación...',
    iconColorLight: 'text-orange-600',
    iconColorDark: 'text-orange-400',
    iconBgLight: 'bg-orange-100',
    iconBgDark: 'bg-orange-950/40',
    borderLight: '1.5px solid rgba(249, 115, 22, 0.25)',
    borderDark: '1.5px solid rgba(249, 115, 22, 0.3)',
    glowLight: '0 0 24px rgba(249, 115, 22, 0.15)',
    glowDark: '0 0 24px rgba(249, 115, 22, 0.2)',
    confirmVariant: 'secondary' as const,
  },
  request_info: {
    icon: MessageSquare,
    title: 'Solicitar Información',
    description: 'Solicita información adicional al usuario que envió el workflow.',
    confirmLabel: 'Enviar Solicitud',
    commentLabel: 'Información Requerida',
    commentPlaceholder: 'Especifica qué información adicional necesitas para procesar este workflow...',
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
// COMMENT TEXTAREA SUB-COMPONENT
// ============================================================================

interface CommentFieldProps {
  value: string
  onChange: (value: string) => void
  error: string
  onClearError: () => void
  disabled?: boolean
  label: string
  placeholder: string
  minLength: number
  actionType: ApprovalActionType
}

function CommentField({
  value,
  onChange,
  error,
  onClearError,
  disabled = false,
  label,
  placeholder,
  minLength,
  actionType,
}: CommentFieldProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const isValid = value.trim().length >= minLength
  const config = actionConfig[actionType]

  return (
    <div className="space-y-3">
      {/* Label - Responsive */}
      <label
        className={cn(
          'block text-xs sm:text-sm font-semibold',
          isDark ? 'text-neutral-200' : 'text-neutral-700'
        )}
      >
        {label}
        <span className="ml-1 text-red-500">*</span>
      </label>

      {/* Textarea - Responsive */}
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
        aria-describedby={error ? 'comment-error' : undefined}
        className={cn(
          // Responsive sizing
          'w-full',
          'min-h-[120px] xs:min-h-[140px] sm:min-h-[160px] md:min-h-[180px]',
          'max-h-[40vh] sm:max-h-[45vh]',
          // Responsive padding
          'p-3 sm:p-4',
          // Responsive border-radius
          'rounded-xl sm:rounded-2xl',
          'resize-y',
          // Responsive text
          'text-xs sm:text-sm leading-relaxed',
          'border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2',
          // Responsive placeholder
          'placeholder:text-neutral-400 placeholder:text-[10px] xs:placeholder:text-xs sm:placeholder:text-sm',
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
          id="comment-error"
          role="alert"
          className={cn(
            'flex items-center gap-2 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl',
            isDark ? 'bg-red-950/30' : 'bg-red-50'
          )}
          style={{
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-red-500" strokeWidth={2} />
          <p className="text-[10px] xs:text-xs font-medium text-red-500">{error}</p>
        </div>
      )}

      {/* Character counter - Responsive */}
      <div className="flex items-center justify-between px-1">
        <p
          className={cn(
            'text-[10px] xs:text-xs',
            isDark ? 'text-neutral-500' : 'text-neutral-500'
          )}
        >
          Mínimo {minLength} caracteres
        </p>
        <p
          className={cn(
            'text-[10px] xs:text-xs font-semibold tabular-nums',
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
// INFO CARD SUB-COMPONENT
// ============================================================================

interface InfoCardProps {
  workflowName?: string
  currentLevel?: number
  actionType: ApprovalActionType
}

function InfoCard({ workflowName, currentLevel, actionType }: InfoCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const getActionMessage = () => {
    switch (actionType) {
      case 'approve':
        return currentLevel
          ? `Se aprobará en Nivel ${currentLevel} y avanzará al siguiente nivel.`
          : 'El workflow será aprobado.'
      case 'reject':
        return 'El workflow será rechazado y se notificará al solicitante.'
      case 'escalate':
        return currentLevel
          ? `Se escalará del Nivel ${currentLevel} al Nivel ${currentLevel + 1}.`
          : 'El workflow será escalado al siguiente nivel.'
      case 'request_info':
        return 'Se enviará una solicitud de información al solicitante.'
      default:
        return ''
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border backdrop-blur-xl',
        isDark
          ? 'bg-neutral-800/40 border-neutral-700/50'
          : 'bg-white/60 border-neutral-200/50'
      )}
      style={{
        boxShadow: isDark
          ? 'inset 0 1px 2px rgba(255, 255, 255, 0.04), 0 4px 12px rgba(0, 0, 0, 0.2)'
          : 'inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 4px 12px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center',
            isDark ? 'bg-blue-500/15' : 'bg-blue-100'
          )}
          style={{
            border: isDark
              ? '1px solid rgba(59, 130, 246, 0.25)'
              : '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <Info className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-blue-500" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          {workflowName && (
            <p
              className={cn(
                'text-xs sm:text-sm font-semibold mb-1 truncate',
                isDark ? 'text-neutral-200' : 'text-neutral-800'
              )}
            >
              {workflowName}
            </p>
          )}
          <p
            className={cn(
              'text-[10px] xs:text-xs sm:text-sm leading-relaxed',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}
          >
            {getActionMessage()}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ApprovalActionModal({
  open,
  onOpenChange,
  actionType,
  workflowName,
  currentLevel,
  onConfirm,
  isLoading = false,
}: ApprovalActionModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const config = actionConfig[actionType]
  const Icon = config.icon
  const minLength = CONFIG.minCommentLength[actionType]

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setComment('')
      setError('')
    }
  }, [open])

  const isConfirmDisabled =
    isLoading || !comment.trim() || comment.trim().length < minLength

  const handleConfirm = async () => {
    if (!comment.trim()) {
      setError('El comentario es requerido')
      return
    }
    if (comment.trim().length < minLength) {
      setError(`El comentario debe tener al menos ${minLength} caracteres`)
      return
    }

    setError('')
    await onConfirm(comment)
  }

  const handleCancel = () => {
    setComment('')
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

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent size="lg">
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon - Responsive */}
            <div
              className={cn(
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
                  'h-5 w-5 sm:h-6 sm:w-6',
                  isDark ? config.iconColorDark : config.iconColorLight
                )}
                strokeWidth={1.8}
              />
            </div>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>{config.title}</ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-1 sm:mt-2">
                {config.description}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="space-y-4 sm:space-y-5">
            {/* Info Card */}
            <InfoCard
              workflowName={workflowName}
              currentLevel={currentLevel}
              actionType={actionType}
            />

            {/* Comment Field */}
            <CommentField
              value={comment}
              onChange={setComment}
              error={error}
              onClearError={() => setError('')}
              disabled={isLoading}
              label={config.commentLabel}
              placeholder={config.commentPlaceholder}
              minLength={minLength}
              actionType={actionType}
            />

            {/* Warning for reject action */}
            {actionType === 'reject' && (
              <div
                className={cn(
                  'flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl',
                  isDark ? 'bg-yellow-950/30' : 'bg-yellow-50'
                )}
                style={{
                  border: isDark
                    ? '1px solid rgba(251, 191, 36, 0.25)'
                    : '1px solid rgba(251, 191, 36, 0.3)',
                }}
              >
                <AlertTriangle
                  className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-yellow-500 mt-0.5"
                  strokeWidth={2}
                />
                <p
                  className={cn(
                    'text-[10px] xs:text-xs sm:text-sm leading-relaxed',
                    isDark ? 'text-yellow-400' : 'text-yellow-700'
                  )}
                >
                  Esta acción es irreversible. El solicitante será notificado y la justificación
                  quedará registrada en el historial de auditoría.
                </p>
              </div>
            )}
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {config.confirmLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// VALIDATION ERROR MODAL
// ============================================================================

export interface ValidationErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
}

export function ValidationErrorModal({
  open,
  onOpenChange,
  message,
}: ValidationErrorModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size="sm">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                isDark ? 'bg-yellow-950/40' : 'bg-yellow-100'
              )}
              style={{
                border: isDark
                  ? '1.5px solid rgba(251, 191, 36, 0.3)'
                  : '1.5px solid rgba(251, 191, 36, 0.25)',
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.15)',
              }}
            >
              <AlertTriangle className="h-5 w-5 text-yellow-500" strokeWidth={2} />
            </div>
            <ResponsiveModalTitle>Atención</ResponsiveModalTitle>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <p
            className={cn(
              'text-sm leading-relaxed',
              isDark ? 'text-neutral-300' : 'text-neutral-700'
            )}
          >
            {message}
          </p>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="primary"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Entendido
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
