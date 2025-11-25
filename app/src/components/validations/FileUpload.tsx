/**
 * FileUpload Component - Enhanced Version
 *
 * CONSAR-compliant drag & drop file upload with:
 * - Full validation (type, size, name format, content)
 * - Accessibility (WCAG 2.1 AA)
 * - Security (input sanitization, XSS prevention)
 * - Auto-detection of file type
 * - Real-time feedback
 *
 * @version 2.0.0
 * @compliance CONSAR Circular 19-8, WCAG 2.1 AA, OWASP Top 10
 */

import { Upload, X, FileText, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PremiumButtonV2 } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'
import { useFileUpload } from '@/hooks/useValidations'
import type { FileType } from '@/lib/constants'
import { useState, useRef, useCallback, useMemo } from 'react'

// Import enhanced validation utilities
import {
  validateFile,
  validateFiles,
  validateFileContent,
  detectFileType,
  extractFileMetadata,
  formatFileSize,
  type ValidationResult,
} from '@/lib/utils/validation'
import { sanitizeString } from '@/lib/utils/security'

// ============================================================================
// TYPES
// ============================================================================

export interface FileUploadProps {
  onUploadComplete?: () => void
  onUploadError?: (error: string) => void
  maxFileSize?: number
  maxFiles?: number
  autoDetectType?: boolean
}

interface FileWithValidation {
  file: File
  validation: ValidationResult
  metadata?: ReturnType<typeof extractFileMetadata>
  contentValidation?: ValidationResult
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FileUpload({
  onUploadComplete,
  onUploadError,
  maxFileSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 10,
  autoDetectType = true,
}: FileUploadProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const loadFileAnimationData = getAnimation('loadFile')

  // State
  const [selectedFileType, setSelectedFileType] = useState<FileType>('CONTABLE')
  const [filesWithValidation, setFilesWithValidation] = useState<FileWithValidation[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isValidatingContent, setIsValidatingContent] = useState(false)
  const [globalError, setGlobalError] = useState<string>('')

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  // Mutations
  const uploadMutation = useFileUpload()

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Process selected files with full validation
   */
  const processFiles = useCallback(async (files: File[]) => {
    setGlobalError('')

    // Step 1: Basic validation (type, size, name)
    const validationResults = validateFiles(files, {
      checkFileName: true,
      maxSizeMB: maxFileSize / (1024 * 1024),
      maxFiles,
    })

    // Step 2: Extract metadata and detect type
    const processedFiles: FileWithValidation[] = validationResults.map(({ file, result }) => {
      const metadata = extractFileMetadata(file.name)
      return {
        file,
        validation: result,
        metadata: metadata || undefined,
      }
    })

    // Step 3: Auto-detect file type from first valid file
    if (autoDetectType && processedFiles.length > 0) {
      const firstFile = processedFiles[0]
      if (firstFile.validation.isValid) {
        const detectedType = detectFileType(firstFile.file.name)
        if (detectedType) {
          setSelectedFileType(detectedType)
        }
      }
    }

    // Step 4: Validate content for valid files (async)
    setIsValidatingContent(true)
    const filesWithContentValidation = await Promise.all(
      processedFiles.map(async (fileData) => {
        if (fileData.validation.isValid) {
          const contentValidation = await validateFileContent(fileData.file)
          return {
            ...fileData,
            contentValidation,
          }
        }
        return fileData
      })
    )
    setIsValidatingContent(false)

    // Update state
    setFilesWithValidation(filesWithContentValidation)

    // Show global error if all files are invalid
    const validCount = filesWithContentValidation.filter(
      (f) => f.validation.isValid && (!f.contentValidation || f.contentValidation.isValid)
    ).length

    if (validCount === 0 && filesWithContentValidation.length > 0) {
      setGlobalError('Ninguno de los archivos seleccionados es válido. Por favor, revise los errores.')
    }
  }, [maxFileSize, maxFiles, autoDetectType])

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      processFiles(files)
    }
    // Reset input to allow selecting same file again
    e.target.value = ''
  }, [processFiles])

  /**
   * Handle drag events
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounterRef.current = 0

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  /**
   * Remove file from list
   */
  const removeFile = useCallback((index: number) => {
    setFilesWithValidation((prev) => prev.filter((_, i) => i !== index))
    setGlobalError('')
  }, [])

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    setFilesWithValidation([])
    setGlobalError('')
  }, [])

  /**
   * Upload files
   */
  const handleUpload = useCallback(async () => {
    // Filter only valid files
    const validFiles = filesWithValidation.filter(
      (f) => f.validation.isValid && (!f.contentValidation || f.contentValidation.isValid)
    )

    if (validFiles.length === 0) {
      setGlobalError('No hay archivos válidos para subir')
      return
    }

    try {
      for (const { file } of validFiles) {
        await uploadMutation.mutateAsync({
          files: [file],
          fileType: selectedFileType,
        })
      }

      clearFiles()
      onUploadComplete?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? sanitizeString(err.message) : 'Error al subir archivos'
      setGlobalError(errorMessage)
      onUploadError?.(errorMessage)
    }
  }, [filesWithValidation, selectedFileType, uploadMutation, clearFiles, onUploadComplete, onUploadError])

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const validFilesCount = useMemo(() => {
    return filesWithValidation.filter(
      (f) => f.validation.isValid && (!f.contentValidation || f.contentValidation.isValid)
    ).length
  }, [filesWithValidation])

  const invalidFilesCount = useMemo(() => {
    return filesWithValidation.length - validFilesCount
  }, [filesWithValidation, validFilesCount])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-4" role="region" aria-label="Zona de carga de archivos CONSAR">
      {/* File Type Selection - Responsive para todos los tamaños */}
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
        <label
          id="file-type-label"
          className={cn(
            'text-xs xs:text-sm md:text-base font-semibold flex-shrink-0',
            isDark ? 'text-neutral-300' : 'text-neutral-700'
          )}
        >
          Tipo de archivo:
        </label>
        <div
          role="group"
          aria-labelledby="file-type-label"
          className="grid grid-cols-3 xs:flex xs:flex-wrap gap-1.5 xs:gap-2 sm:gap-2.5 w-full xs:w-auto"
        >
          {(['NOMINA', 'CONTABLE', 'REGULARIZACION'] as FileType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedFileType(type)}
              aria-pressed={selectedFileType === type}
              aria-label={`Seleccionar tipo ${type}`}
              className={cn(
                // Tamaños progresivos por breakpoint
                // Mobile (<480px): muy compacto
                'px-2 py-1 text-[10px]',
                // xs (480px+): compacto
                'xs:px-2.5 xs:py-1.5 xs:text-xs',
                // sm (640px+): normal
                'sm:px-3.5 sm:py-2 sm:text-sm',
                // md (768px+): cómodo
                'md:px-4 md:py-2',
                // lg (1024px+): amplio
                'lg:px-5 lg:py-2.5',
                // Border radius progresivo
                'rounded-lg xs:rounded-xl sm:rounded-[12px] md:rounded-[14px]',
                'font-semibold',
                'transition-all duration-300',
                'glass-gpu-accelerated spring-bounce active:scale-[0.95]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 sm:focus:ring-offset-2',
                // Layout: en móvil grid, en tablet+ flex
                'min-w-0 text-center',
                selectedFileType === type
                  ? 'glass-ultra-premium depth-layer-2'
                  : 'glass-ultra-clear depth-layer-1'
              )}
              style={
                selectedFileType === type
                  ? {
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.25) 0%, rgba(88, 86, 214, 0.25) 100%)'
                        : 'linear-gradient(135deg, rgba(0, 102, 255, 0.15) 0%, rgba(88, 86, 214, 0.15) 100%)',
                      backdropFilter: 'blur(16px)',
                      border: isDark
                        ? '1.5px solid rgba(0, 102, 255, 0.4)'
                        : '1.5px solid rgba(0, 102, 255, 0.3)',
                      boxShadow: isDark
                        ? '0 4px 16px rgba(0, 102, 255, 0.2), inset 0 0 20px rgba(0, 102, 255, 0.1)'
                        : '0 4px 16px rgba(0, 102, 255, 0.15), inset 0 0 20px rgba(0, 102, 255, 0.08)',
                      color: isDark ? 'rgb(147, 197, 253)' : 'rgb(37, 99, 235)',
                    }
                  : {
                      background: isDark ? 'rgba(45, 45, 55, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(12px)',
                      border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.4)',
                      color: isDark ? 'rgb(212, 212, 216)' : 'rgb(82, 82, 91)',
                    }
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Info Banner - CONSAR Requirements */}
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-[16px]',
          'glass-ultra-clear depth-layer-1'
        )}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
          backdropFilter: 'blur(12px)',
          border: isDark
            ? '1px solid rgba(59, 130, 246, 0.2)'
            : '1px solid rgba(59, 130, 246, 0.15)',
        }}
        role="status"
        aria-live="polite"
      >
        <Info className={cn('h-5 w-5 flex-shrink-0 mt-0.5', isDark ? 'text-blue-400' : 'text-blue-600')} />
        <div className="flex-1 text-sm">
          <p className={cn('font-semibold mb-1', isDark ? 'text-blue-300' : 'text-blue-700')}>
            Requisitos CONSAR
          </p>
          <ul className={cn('text-xs space-y-0.5', isDark ? 'text-blue-200' : 'text-blue-600')}>
            <li>• Formato: TXT, CSV o DAT</li>
            <li>• Nombre: YYYYMMDD_TIPO_CUENTA_FOLIO.ext</li>
            <li>• Tamaño: Máximo 50MB</li>
            <li>• Contenido: 77 caracteres por línea (formato posicional)</li>
          </ul>
        </div>
      </div>

      {/* Drop Zone */}
      <Card>
        <CardContent className="p-0">
          <div
            role="button"
            tabIndex={0}
            aria-label="Zona de arrastrar y soltar archivos. Presione Enter o Espacio para seleccionar archivos"
            aria-describedby="upload-instructions"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleKeyDown}
            className={cn(
              'relative cursor-pointer transition-all duration-300',
              'flex flex-col items-center justify-center',
              'min-h-[280px] p-8',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isDragging && 'scale-[0.98]'
            )}
            style={{
              background: isDragging
                ? isDark
                  ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.15) 0%, rgba(88, 86, 214, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 102, 255, 0.08) 0%, rgba(88, 86, 214, 0.08) 100%)'
                : 'transparent',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.csv,.dat"
              onChange={handleFileInputChange}
              aria-label="Seleccionar archivos CONSAR para validación"
              className="sr-only"
            />

            <p id="upload-instructions" className="sr-only">
              Formatos aceptados: TXT, CSV, DAT. Tamaño máximo: 50MB por archivo. Máximo 10 archivos.
              Formato de nombre requerido: YYYYMMDD_TIPO_CUENTA_FOLIO.extensión
            </p>

            {/* Upload Icon */}
            <div
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-[24px] mb-6',
                'glass-ultra-premium depth-layer-3 fresnel-edge',
                'transition-all duration-300',
                isDragging && 'scale-110'
              )}
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(0, 102, 255, 0.2) 0%, rgba(88, 86, 214, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(0, 102, 255, 0.12) 0%, rgba(88, 86, 214, 0.12) 100%)',
                backdropFilter: 'blur(16px)',
                border: isDark
                  ? '1.5px solid rgba(0, 102, 255, 0.3)'
                  : '1.5px solid rgba(0, 102, 255, 0.25)',
                boxShadow: isDark
                  ? `0 8px 32px rgba(0, 102, 255, 0.25), inset 0 0 30px rgba(0, 102, 255, 0.15)`
                  : `0 8px 32px rgba(0, 102, 255, 0.18), inset 0 0 30px rgba(0, 102, 255, 0.1)`,
              }}
              aria-hidden="true"
            >
              {loadFileAnimationData ? (
                <div className="w-10 h-10">
                  <LottieIcon
                    animationData={loadFileAnimationData}
                    isActive={isDragging}
                    loop={isDragging}
                    autoplay={isDragging}
                    inactiveColor="default"
                    speed={1.2}
                    className="transition-all duration-300"
                  />
                </div>
              ) : (
                <Upload
                  className={cn(
                    'h-10 w-10 transition-all duration-300',
                    isDark ? 'text-blue-400' : 'text-blue-600',
                    isDragging && 'scale-110'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Text */}
            <h3
              className={cn(
                'ios-heading-title3 ios-text-glass-subtle mb-2 transition-all duration-300',
                isDark ? 'text-neutral-200' : 'text-neutral-800',
                isDragging && 'scale-105'
              )}
              data-text={isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
            >
              {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
            </h3>
            <p
              className={cn(
                'ios-text-footnote ios-font-medium text-center max-w-md',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Soporta archivos TXT, CSV, DAT hasta 50MB
              <br />
              Máximo {maxFiles} archivos simultáneos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Content Validation Progress */}
      {isValidatingContent && (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-[16px]',
            'glass-ultra-clear depth-layer-2'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
            backdropFilter: 'blur(12px)',
          }}
          role="alert"
          aria-live="polite"
        >
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          <p className={cn('text-sm font-semibold', isDark ? 'text-blue-300' : 'text-blue-700')}>
            Validando contenido de archivos (formato posicional CONSAR)...
          </p>
        </div>
      )}

      {/* Global Error */}
      {globalError && (
        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-[16px]',
            'glass-ultra-clear depth-layer-2'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.08) 100%)'  ,
            backdropFilter: 'blur(12px)',
            border: isDark
              ? '1px solid rgba(239, 68, 68, 0.3)'
              : '1px solid rgba(239, 68, 68, 0.25)',
          }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', 'text-red-500')} />
          <p className={cn('text-sm font-semibold', isDark ? 'text-red-400' : 'text-red-600')}>
            {globalError}
          </p>
        </div>
      )}

      {/* Files List with Validation Status */}
      {filesWithValidation.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4
              className={cn(
                'text-sm font-bold',
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              )}
            >
              Archivos seleccionados ({filesWithValidation.length})
              {validFilesCount > 0 && (
                <span className={cn('ml-2', isDark ? 'text-green-400' : 'text-green-600')}>
                  • {validFilesCount} válidos
                </span>
              )}
              {invalidFilesCount > 0 && (
                <span className={cn('ml-2', isDark ? 'text-red-400' : 'text-red-600')}>
                  • {invalidFilesCount} con errores
                </span>
              )}
            </h4>
            <button
              onClick={clearFiles}
              className={cn(
                'text-xs font-semibold transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1',
                isDark
                  ? 'text-neutral-400 hover:text-neutral-200'
                  : 'text-neutral-600 hover:text-neutral-800'
              )}
              aria-label="Limpiar todos los archivos"
            >
              Limpiar todo
            </button>
          </div>

          <div className="space-y-2">
            {filesWithValidation.map(({ file, validation, metadata, contentValidation }, index) => {
              const isValid = validation.isValid && (!contentValidation || contentValidation.isValid)
              const hasWarning = validation.isValid && contentValidation && !contentValidation.isValid

              return (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-[14px]',
                    'glass-ultra-clear depth-layer-1',
                    'transition-all duration-300'
                  )}
                  style={{
                    background: isDark
                      ? 'rgba(45, 45, 55, 0.4)'
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: isValid
                      ? isDark
                        ? '1px solid rgba(34, 197, 94, 0.3)'
                        : '1px solid rgba(34, 197, 94, 0.25)'
                      : hasWarning
                      ? isDark
                        ? '1px solid rgba(251, 191, 36, 0.3)'
                        : '1px solid rgba(251, 191, 36, 0.25)'
                      : isDark
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  {/* File Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-[12px] flex-shrink-0',
                      'glass-ultra-clear'
                    )}
                    style={{
                      background: isDark
                        ? 'rgba(55, 55, 65, 0.5)'
                        : 'rgba(245, 245, 250, 0.8)',
                    }}
                  >
                    <FileText
                      className={cn('h-5 w-5', isDark ? 'text-blue-400' : 'text-blue-600')}
                      aria-hidden="true"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-semibold truncate',
                        isDark ? 'text-neutral-200' : 'text-neutral-800'
                      )}
                    >
                      {file.name}
                    </p>
                    <p
                      className={cn(
                        'text-xs font-medium',
                        isDark ? 'text-neutral-400' : 'text-neutral-600'
                      )}
                    >
                      {formatFileSize(file.size)}
                      {metadata && (
                        <span className="ml-2">
                          • Fecha: {metadata.date.slice(0, 4)}-{metadata.date.slice(4, 6)}-{metadata.date.slice(6, 8)}
                          {metadata.account && ` • Cuenta: ${metadata.account}`}
                        </span>
                      )}
                    </p>

                    {/* Validation Errors */}
                    {!validation.isValid && (
                      <p className={cn('text-xs font-medium mt-1', 'text-red-500')}>
                        ❌ {validation.error}
                      </p>
                    )}
                    {validation.isValid && contentValidation && !contentValidation.isValid && (
                      <p className={cn('text-xs font-medium mt-1', 'text-amber-500')}>
                        ⚠️ {contentValidation.error}
                      </p>
                    )}
                    {isValid && (
                      <p className={cn('text-xs font-medium mt-1', 'text-green-500')}>
                        ✓ Archivo válido según normativa CONSAR
                      </p>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex items-center gap-2">
                    {isValid && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" aria-label="Válido" />
                    )}
                    {hasWarning && (
                      <AlertTriangle className="h-5 w-5 text-amber-500" aria-label="Advertencia" />
                    )}
                    {!validation.isValid && (
                      <AlertCircle className="h-5 w-5 text-red-500" aria-label="Error" />
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(index)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-[10px]',
                        'transition-all duration-300 hover:scale-110',
                        'glass-ultra-clear',
                        'focus:outline-none focus:ring-2 focus:ring-red-500'
                      )}
                      style={{
                        background: isDark
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(239, 68, 68, 0.1)',
                      }}
                      aria-label={`Eliminar archivo ${file.name}`}
                    >
                      <X className={cn('h-4 w-4', 'text-red-500')} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Upload Button */}
          <div className="flex gap-3 pt-2">
            <PremiumButtonV2
              label={uploadMutation.isPending
                ? 'Subiendo...'
                : `Subir ${validFilesCount} ${validFilesCount === 1 ? 'archivo' : 'archivos'}`
              }
              icon={Upload}
              size="lg"
              loading={uploadMutation.isPending}
              disabled={validFilesCount === 0}
              onClick={handleUpload}
              fullWidth
              aria-label={`Subir ${validFilesCount} archivo${validFilesCount !== 1 ? 's' : ''} válido${validFilesCount !== 1 ? 's' : ''}`}
            />

            <Button
              variant="secondary"
              size="lg"
              onClick={clearFiles}
              disabled={uploadMutation.isPending}
              aria-label="Cancelar y limpiar archivos"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload
