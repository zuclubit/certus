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

import { useState, useRef, useCallback } from 'react'
import { FileEdit, AlertCircle, Info, FileText, XCircle, Upload, File, X } from 'lucide-react'
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
  onConfirm: (reason: string, file: File) => void | Promise<void>
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const minReasonLength = CONFIG.minReasonLength
  const isConfirmDisabled =
    isLoading || !reason.trim() || reason.trim().length < minReasonLength || !selectedFile

  const handleConfirm = async () => {
    if (!selectedFile) {
      setFileError('Debe seleccionar un archivo corregido')
      return
    }
    if (!reason.trim()) {
      setError('La razón de corrección es requerida')
      return
    }
    if (reason.trim().length < minReasonLength) {
      setError(`La razón debe tener al menos ${minReasonLength} caracteres`)
      return
    }

    setError('')
    setFileError('')
    await onConfirm(reason, selectedFile)
    setReason('')
    setSelectedFile(null)
  }

  const handleCancel = () => {
    setReason('')
    setError('')
    setSelectedFile(null)
    setFileError('')
    onOpenChange(false)
  }

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setFileError('')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

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
          <div className="space-y-6">
            {/* File Info Card */}
            <FileInfoCard
              fileName={validation.fileName}
              errorCount={validation.errorCount}
              warningCount={validation.warningCount}
            />

            {/* File Upload Section */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h3
                  className={cn(
                    'text-xs xs:text-sm font-semibold',
                    isDark ? 'text-neutral-200' : 'text-neutral-700'
                  )}
                >
                  Archivo Corregido
                  <span className="ml-1 text-red-500">*</span>
                </h3>
                <p
                  className={cn(
                    'text-[10px] xs:text-xs leading-relaxed',
                    isDark ? 'text-neutral-500' : 'text-neutral-500'
                  )}
                >
                  Seleccione el archivo con las correcciones aplicadas
                </p>
              </div>

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  'relative rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200',
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : selectedFile
                      ? 'border-green-500 bg-green-500/5'
                      : fileError
                        ? 'border-red-500 bg-red-500/5'
                        : isDark
                          ? 'border-neutral-600 bg-neutral-800/30 hover:border-blue-500/50 hover:bg-blue-500/5'
                          : 'border-neutral-300 bg-neutral-50 hover:border-blue-500/50 hover:bg-blue-50'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                  disabled={isLoading}
                  accept=".txt,.csv,.xlsx,.xls"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          isDark ? 'bg-green-500/20' : 'bg-green-100'
                        )}
                      >
                        <File className="h-5 w-5 text-green-500" strokeWidth={2} />
                      </div>
                      <div>
                        <p
                          className={cn(
                            'text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]',
                            isDark ? 'text-neutral-100' : 'text-neutral-900'
                          )}
                        >
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        isDark
                          ? 'hover:bg-neutral-700 text-neutral-400'
                          : 'hover:bg-neutral-200 text-neutral-500'
                      )}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        isDark ? 'bg-blue-500/15' : 'bg-blue-100'
                      )}
                    >
                      <Upload className="h-5 w-5 text-blue-500" strokeWidth={2} />
                    </div>
                    <div>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isDark ? 'text-neutral-200' : 'text-neutral-700'
                        )}
                      >
                        Arrastra tu archivo aquí o{' '}
                        <span className="text-blue-500">haz clic para seleccionar</span>
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Formatos soportados: TXT, CSV, XLSX
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* File Error */}
              {fileError && (
                <div
                  role="alert"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    isDark ? 'bg-red-950/30' : 'bg-red-50'
                  )}
                  style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" strokeWidth={2} />
                  <p className="text-xs font-medium text-red-500">{fileError}</p>
                </div>
              )}
            </div>

            {/* Reason Input */}
            <ReasonTextarea
              value={reason}
              onChange={setReason}
              error={error}
              onClearError={() => setError('')}
              disabled={isLoading}
              minLength={minReasonLength}
            />
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
