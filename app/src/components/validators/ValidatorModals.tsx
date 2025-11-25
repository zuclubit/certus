/**
 * ValidatorModals Component - VisionOS Premium Design System
 *
 * Modales para acciones del módulo de validadores.
 * Migrado al sistema ResponsiveModal para:
 * - Dialog en desktop, Drawer en móvil
 * - Accesibilidad completa con focus trap
 * - Animaciones iOS-style
 * - Ajustes multi-dispositivo
 *
 * @compliance CONSAR Validator Configuration System
 * @architecture Clean Architecture + Component Composition
 */

import { useState, useEffect } from 'react'
import {
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Shield,
  CheckCircle2,
  XCircle,
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
import type { Validator } from '@/types'

// ============================================================================
// DELETE VALIDATOR MODAL
// ============================================================================

export interface DeleteValidatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  validator: Validator | null
  onConfirm: (justification: string) => void | Promise<void>
  isLoading?: boolean
}

export function DeleteValidatorModal({
  open,
  onOpenChange,
  validator,
  onConfirm,
  isLoading = false,
}: DeleteValidatorModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [justification, setJustification] = useState('')
  const [error, setError] = useState('')

  const minLength = 15

  useEffect(() => {
    if (open) {
      setJustification('')
      setError('')
    }
  }, [open])

  const isConfirmDisabled =
    isLoading || !justification.trim() || justification.trim().length < minLength

  const handleConfirm = async () => {
    if (!justification.trim()) {
      setError('La justificación es requerida')
      return
    }
    if (justification.trim().length < minLength) {
      setError(`La justificación debe tener al menos ${minLength} caracteres`)
      return
    }

    setError('')
    await onConfirm(justification)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setJustification('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  if (!validator) return null

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent size="lg">
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
                boxShadow: '0 0 24px rgba(239, 68, 68, 0.2)',
              }}
            >
              <Trash2
                className={cn('h-5 w-5 sm:h-6 sm:w-6', isDark ? 'text-red-400' : 'text-red-600')}
                strokeWidth={1.8}
              />
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>Eliminar Validador</ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-1 sm:mt-2">
                Esta acción eliminará el validador permanentemente del sistema.
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="space-y-4">
            {/* Validator Info */}
            <div
              className={cn(
                'rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border',
                isDark ? 'bg-neutral-800/40 border-neutral-700/50' : 'bg-white/60 border-neutral-200/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Shield className={cn('h-5 w-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
                <div className="min-w-0">
                  <p className={cn('text-sm font-semibold truncate', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                    {validator.name}
                  </p>
                  <p className={cn('text-xs font-mono', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                    {validator.code}
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
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
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-yellow-500 mt-0.5" />
              <p className={cn('text-[10px] xs:text-xs sm:text-sm leading-relaxed', isDark ? 'text-yellow-400' : 'text-yellow-700')}>
                Esta acción es irreversible. Las validaciones que usan este validador dejarán de funcionar.
              </p>
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <label className={cn('block text-xs sm:text-sm font-semibold', isDark ? 'text-neutral-200' : 'text-neutral-700')}>
                Justificación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => {
                  setJustification(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Explica por qué se elimina este validador..."
                disabled={isLoading}
                autoFocus
                className={cn(
                  'w-full min-h-[100px] sm:min-h-[120px] max-h-[40vh]',
                  'p-3 sm:p-4 rounded-xl sm:rounded-2xl resize-y',
                  'text-xs sm:text-sm leading-relaxed',
                  'border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2',
                  'placeholder:text-neutral-400 placeholder:text-xs sm:placeholder:text-sm',
                  error
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500/30',
                  isDark ? 'bg-neutral-800/50 text-neutral-100' : 'bg-neutral-50 text-neutral-900',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              />

              {error && (
                <div className={cn('flex items-center gap-2 px-2.5 py-2 rounded-lg', isDark ? 'bg-red-950/30' : 'bg-red-50')}
                  style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                  <p className="text-[10px] xs:text-xs font-medium text-red-500">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between px-1">
                <p className={cn('text-[10px] xs:text-xs', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
                  Mínimo {minLength} caracteres
                </p>
                <p className={cn(
                  'text-[10px] xs:text-xs font-semibold tabular-nums',
                  justification.trim().length >= minLength ? 'text-green-500' : 'text-neutral-500'
                )}>
                  {justification.trim().length} / {minLength}
                </p>
              </div>
            </div>
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isLoading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={isConfirmDisabled} isLoading={isLoading} className="w-full sm:w-auto">
            Eliminar Validador
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// TOGGLE VALIDATOR MODAL
// ============================================================================

export interface ToggleValidatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  validator: Validator | null
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

export function ToggleValidatorModal({
  open,
  onOpenChange,
  validator,
  onConfirm,
  isLoading = false,
}: ToggleValidatorModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  if (!validator) return null

  const isEnabling = !validator.isEnabled
  const Icon = isEnabling ? ToggleRight : ToggleLeft
  const iconColor = isEnabling ? 'text-green-500' : 'text-neutral-500'
  const bgColor = isEnabling
    ? isDark ? 'bg-green-950/40' : 'bg-green-100'
    : isDark ? 'bg-neutral-800/40' : 'bg-neutral-100'
  const borderColor = isEnabling
    ? isDark ? '1.5px solid rgba(34, 197, 94, 0.3)' : '1.5px solid rgba(34, 197, 94, 0.25)'
    : isDark ? '1.5px solid rgba(163, 163, 163, 0.3)' : '1.5px solid rgba(163, 163, 163, 0.25)'

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size="default">
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={cn('flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center', bgColor)}
              style={{ border: borderColor }}
            >
              <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', iconColor)} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>
                {isEnabling ? 'Activar Validador' : 'Desactivar Validador'}
              </ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-1 sm:mt-2">
                {isEnabling
                  ? 'El validador comenzará a ejecutarse en las validaciones.'
                  : 'El validador dejará de ejecutarse en las validaciones.'}
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div
            className={cn(
              'rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border',
              isDark ? 'bg-neutral-800/40 border-neutral-700/50' : 'bg-white/60 border-neutral-200/50'
            )}
          >
            <div className="flex items-center gap-3">
              <Shield className={cn('h-5 w-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
              <div className="min-w-0">
                <p className={cn('text-sm font-semibold truncate', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                  {validator.name}
                </p>
                <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                  Estado actual: {validator.isEnabled ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            variant={isEnabling ? 'primary' : 'secondary'}
            onClick={onConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            {isEnabling ? 'Activar' : 'Desactivar'}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// DUPLICATE VALIDATOR MODAL
// ============================================================================

export interface DuplicateValidatorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  validator: Validator | null
  onConfirm: (newName: string) => void | Promise<void>
  isLoading?: boolean
}

export function DuplicateValidatorModal({
  open,
  onOpenChange,
  validator,
  onConfirm,
  isLoading = false,
}: DuplicateValidatorModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')

  // Solo resetear cuando el modal se abre
  useEffect(() => {
    if (open && validator) {
      setNewName(`${validator.name} (Copia)`)
      setError('')
    }
  }, [open]) // Removido 'validator' para evitar loops

  const handleConfirm = async () => {
    if (!newName.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (newName.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }

    setError('')
    await onConfirm(newName)
  }

  if (!validator) return null

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent size="default">
        <ResponsiveModalHeader>
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className={cn(
                'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center',
                isDark ? 'bg-blue-950/40' : 'bg-blue-100'
              )}
              style={{
                border: isDark ? '1.5px solid rgba(59, 130, 246, 0.3)' : '1.5px solid rgba(59, 130, 246, 0.25)',
                boxShadow: '0 0 24px rgba(59, 130, 246, 0.2)',
              }}
            >
              <Copy className={cn('h-5 w-5 sm:h-6 sm:w-6', isDark ? 'text-blue-400' : 'text-blue-600')} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveModalTitle>Duplicar Validador</ResponsiveModalTitle>
              <ResponsiveModalDescription className="mt-1 sm:mt-2">
                Se creará una copia del validador con un nuevo nombre.
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="space-y-4">
            {/* Source Validator */}
            <div
              className={cn(
                'rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border',
                isDark ? 'bg-neutral-800/40 border-neutral-700/50' : 'bg-white/60 border-neutral-200/50'
              )}
            >
              <p className={cn('text-[10px] xs:text-xs uppercase tracking-wider mb-1', isDark ? 'text-neutral-500' : 'text-neutral-600')}>
                Origen
              </p>
              <p className={cn('text-sm font-semibold', isDark ? 'text-neutral-200' : 'text-neutral-800')}>
                {validator.name}
              </p>
            </div>

            {/* New Name Input */}
            <div className="space-y-2">
              <label className={cn('block text-xs sm:text-sm font-semibold', isDark ? 'text-neutral-200' : 'text-neutral-700')}>
                Nombre de la copia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  if (error) setError('')
                }}
                disabled={isLoading}
                autoFocus
                className={cn(
                  'w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl',
                  'text-xs sm:text-sm',
                  'border-2 transition-all duration-200',
                  'focus:outline-none focus:ring-2',
                  error
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500/30',
                  isDark ? 'bg-neutral-800/50 text-neutral-100' : 'bg-neutral-50 text-neutral-900',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              />

              {error && (
                <div className={cn('flex items-center gap-2 px-2.5 py-2 rounded-lg', isDark ? 'bg-red-950/30' : 'bg-red-50')}
                  style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                  <p className="text-[10px] xs:text-xs font-medium text-red-500">{error}</p>
                </div>
              )}
            </div>
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading || !newName.trim()}
            isLoading={isLoading}
            className="w-full sm:w-auto"
          >
            Duplicar Validador
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

// ============================================================================
// JSON ERROR MODAL (for Test Playground)
// ============================================================================

export interface JsonErrorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message?: string
}

export function JsonErrorModal({
  open,
  onOpenChange,
  message = 'El formato JSON es inválido. Por favor verifica la sintaxis.',
}: JsonErrorModalProps) {
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
                isDark ? 'bg-red-950/40' : 'bg-red-100'
              )}
              style={{
                border: isDark ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1.5px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <XCircle className="h-5 w-5 text-red-500" strokeWidth={2} />
            </div>
            <ResponsiveModalTitle>Error de JSON</ResponsiveModalTitle>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <p className={cn('text-sm leading-relaxed', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
            {message}
          </p>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button variant="primary" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Entendido
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
