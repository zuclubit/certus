/**
 * CreateCorrectedVersionModal Component - VisionOS Premium Design System
 *
 * Modal para crear versión corregida (archivo sustituto) conforme a normativa CONSAR.
 * Migrado al nuevo sistema ResponsiveModal para:
 * - Dialog en desktop, Drawer en móvil
 * - Accesibilidad completa con focus trap
 * - Animaciones iOS-style
 *
 * @compliance CONSAR Circular 19-8
 * @architecture Clean Architecture + Component Composition
 */

import { useState } from 'react'
import { FileEdit, AlertCircle, Info, FileText, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { Validation } from '@/types'

// Nuevo sistema de modales
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
// CONSTANTS
// ============================================================================

const CONFIG = {
  minReasonLength: 30,
} as const

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FileInfoCardProps {
  fileName: string
  errorCount: number
  warningCount: number
}

function FileInfoCard({ fileName, errorCount, warningCount }: FileInfoCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'rounded-2xl p-5 border backdrop-blur-xl',
        isDark
          ? 'bg-neutral-800/40 border-neutral-700/50'
          : 'bg-white/60 border-neutral-200/50'
      )}
      style={{
        boxShadow: isDark
          ? 'inset 0 1px 2px rgba(255, 255, 255, 0.04), 0 8px 24px rgba(0, 0, 0, 0.2)'
          : 'inset 0 1px 2px rgba(255, 255, 255, 0.6), 0 8px 24px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isDark ? 'bg-blue-500/15' : 'bg-blue-100'
            )}
            style={{
              border: isDark
                ? '1px solid rgba(59, 130, 246, 0.25)'
                : '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)',
            }}
          >
            <FileText className="h-5 w-5 text-blue-500" strokeWidth={2} />
          </div>
          <div>
            <h3
              className={cn(
                'text-sm font-semibold uppercase tracking-wider',
                isDark ? 'text-neutral-300' : 'text-neutral-600'
              )}
            >
              Archivo Actual
            </h3>
          </div>
        </div>

        {/* File Name */}
        <div className="space-y-2">
          <p
            className={cn(
              'text-xs font-medium uppercase tracking-wide',
              isDark ? 'text-neutral-500' : 'text-neutral-500'
            )}
          >
            Nombre del archivo
          </p>
          <p
            className={cn(
              'text-base font-semibold font-mono break-all',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}
          >
            {fileName}
          </p>
        </div>

        {/* Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Error Badge */}
          <div
            className={cn(
              'px-4 py-2.5 rounded-xl flex items-center gap-2',
              isDark ? 'bg-red-950/40' : 'bg-red-50'
            )}
            style={{
              border: isDark
                ? '1.5px solid rgba(239, 68, 68, 0.3)'
                : '1.5px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <AlertCircle className="h-4 w-4 text-red-500" strokeWidth={2.5} />
            <span className="text-sm font-semibold tabular-nums text-red-500">
              {errorCount} errores
            </span>
          </div>

          {/* Warning Badge */}
          <div
            className={cn(
              'px-4 py-2.5 rounded-xl flex items-center gap-2',
              isDark ? 'bg-yellow-950/40' : 'bg-yellow-50'
            )}
            style={{
              border: isDark
                ? '1.5px solid rgba(251, 191, 36, 0.3)'
                : '1.5px solid rgba(251, 191, 36, 0.25)',
            }}
          >
            <Info className="h-4 w-4 text-yellow-500" strokeWidth={2.5} />
            <span className="text-sm font-semibold tabular-nums text-yellow-500">
              {warningCount} warnings
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ReasonTextareaProps {
  value: string
  onChange: (value: string) => void
  error: string
  onClearError: () => void
  disabled?: boolean
  minLength: number
}

function ReasonTextarea({
  value,
  onChange,
  error,
  onClearError,
  disabled = false,
  minLength,
}: ReasonTextareaProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const isValid = value.trim().length >= minLength

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header - Responsive */}
      <div className="space-y-1 sm:space-y-2">
        <h3
          className={cn(
            // Responsive text size
            'text-xs xs:text-sm font-semibold',
            isDark ? 'text-neutral-200' : 'text-neutral-700'
          )}
        >
          Razón de Corrección (Normativa CONSAR)
          <span className="ml-1 text-red-500">*</span>
        </h3>
        <p
          className={cn(
            // Responsive text
            'text-[10px] xs:text-xs leading-relaxed',
            isDark ? 'text-neutral-500' : 'text-neutral-500'
          )}
        >
          Describa detalladamente los errores corregidos conforme a Artículo 8.2.4 de la
          Circular CONSAR 19-8.
        </p>
      </div>

      {/* Textarea - Responsive */}
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          if (error) onClearError()
        }}
        placeholder="Ejemplo: Corrección de errores en campos CURP detectados por validador NOMINA_VAL_02. Se actualizaron 120 registros en líneas 234-354 conforme al formato oficial de 18 caracteres establecido por RENAPO."
        disabled={disabled}
        autoFocus
        aria-label="Razón de corrección"
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? 'reason-error' : undefined}
        className={cn(
          // Responsive min-height
          'w-full min-h-[140px] xs:min-h-[160px] sm:min-h-[180px] md:min-h-[240px]',
          'max-h-[45vh] sm:max-h-[50vh]',
          // Responsive padding
          'p-3 sm:p-4',
          // Responsive border-radius
          'rounded-lg xs:rounded-xl sm:rounded-2xl',
          'resize-y',
          // Responsive text
          'text-xs sm:text-sm leading-relaxed',
          'border-2 transition-all duration-200',
          'focus:outline-none focus:ring-2',
          // Responsive placeholder
          'placeholder:text-neutral-400 placeholder:text-[10px] xs:placeholder:text-xs sm:placeholder:text-sm',
          error
            ? 'border-red-500 focus:ring-red-500/30'
            : 'border-blue-500 focus:ring-blue-500/30',
          isDark
            ? 'bg-blue-950/20 text-neutral-100'
            : 'bg-blue-50/50 text-neutral-900',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          boxShadow: error
            ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
            : '0 0 20px rgba(59, 130, 246, 0.15)',
        }}
      />

      {/* Error message */}
      {error && (
        <div
          id="reason-error"
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
          className={cn('text-[10px] xs:text-xs', isDark ? 'text-neutral-500' : 'text-neutral-500')}
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
// MAIN COMPONENT
// ============================================================================

export interface CreateCorrectedVersionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  validation: Validation | null
  onConfirm: (reason: string) => void | Promise<void>
  isLoading?: boolean
}

export function CreateCorrectedVersionModal({
  open,
  onOpenChange,
  validation,
  onConfirm,
  isLoading = false,
}: CreateCorrectedVersionModalProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const minReasonLength = CONFIG.minReasonLength
  const isConfirmDisabled =
    isLoading || !reason.trim() || reason.trim().length < minReasonLength

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('La razón de corrección es requerida')
      return
    }
    if (reason.trim().length < minReasonLength) {
      setError(`La razón debe tener al menos ${minReasonLength} caracteres`)
      return
    }

    setError('')
    await onConfirm(reason)
    setReason('')
  }

  const handleCancel = () => {
    setReason('')
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

  if (!validation) return null

  return (
    <ResponsiveModal open={open} onOpenChange={handleOpenChange}>
      <ResponsiveModalContent size="2xl">
        <ResponsiveModalHeader>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                isDark ? 'bg-blue-500/15' : 'bg-blue-100'
              )}
              style={{
                border: isDark
                  ? '1px solid rgba(59, 130, 246, 0.25)'
                  : '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 0 24px rgba(59, 130, 246, 0.2)',
              }}
            >
              <FileEdit className="h-5 w-5 text-blue-500" strokeWidth={1.8} />
            </div>
            <div>
              <ResponsiveModalTitle>Crear Versión Corregida</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Se creará un nuevo archivo sustituto conforme a la normativa CONSAR
                Circular 19-8
              </ResponsiveModalDescription>
            </div>
          </div>
        </ResponsiveModalHeader>

        <ResponsiveModalBody>
          <div className="grid grid-cols-1 lg:grid-cols-[40%_1fr] gap-5 lg:gap-6">
            {/* Left Column: File Info */}
            <div className="lg:sticky lg:top-0">
              <FileInfoCard
                fileName={validation.fileName}
                errorCount={validation.errorCount}
                warningCount={validation.warningCount}
              />
            </div>

            {/* Right Column: Reason Input */}
            <div>
              <ReasonTextarea
                value={reason}
                onChange={setReason}
                error={error}
                onClearError={() => setError('')}
                disabled={isLoading}
                minLength={minReasonLength}
              />
            </div>
          </div>
        </ResponsiveModalBody>

        <ResponsiveModalFooter>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="sm:w-auto w-full"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            isLoading={isLoading}
            className="sm:w-auto w-full"
          >
            Crear Versión Corregida
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
