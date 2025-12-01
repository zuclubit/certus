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

import { X, FileText, AlertCircle, CheckCircle2, AlertTriangle, Play, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PremiumButtonV2 } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { useFileUpload } from '@/hooks/useValidations'
import { useToast } from '@/hooks/use-toast'
import type { FileType } from '@/lib/constants'
import { useState, useRef, useCallback, useMemo, useEffect } from 'react'

// Import enhanced validation utilities
import {
  validateFiles,
  validateFileContent,
  detectFileType,
  extractFileMetadata,
  formatFileSize,
  getFileTypeLabel,
  CONSAR_EXTENSION_MAP,
  type ValidationResult,
} from '@/lib/utils/validation'
import { sanitizeString } from '@/lib/utils/security'

// Import validation engine for complete CONSAR validation
import { useFileValidation } from '@/hooks/useFileValidation'
import { ValidationProgress } from './ValidationProgress'
import type { CONSARFileType } from '@/lib/types/consar-record'

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
  const { toast } = useToast()

  // State
  const [selectedFileType, setSelectedFileType] = useState<FileType>('CONTABLE')
  const [filesWithValidation, setFilesWithValidation] = useState<FileWithValidation[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isValidatingContent, setIsValidatingContent] = useState(false)
  const [globalError, setGlobalError] = useState<string>('')
  const [globalSuccess, setGlobalSuccess] = useState<string>('')
  const [showDetailedValidation, setShowDetailedValidation] = useState(false)
  const [currentValidationFile, setCurrentValidationFile] = useState<File | null>(null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  // Mutations
  const uploadMutation = useFileUpload()

  // Clear success message after delay
  useEffect(() => {
    if (globalSuccess) {
      const timer = setTimeout(() => setGlobalSuccess(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [globalSuccess])

  // ValidationEngine hook for detailed CONSAR validation
  const {
    state: validationState,
    validateFile: runDetailedValidation,
    reset: resetValidation,
  } = useFileValidation()

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Process selected files with full validation
   */
  const processFiles = useCallback(async (files: File[]) => {
    setGlobalError('')
    setGlobalSuccess('')

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
      if (firstFile && firstFile.validation.isValid) {
        const detectedType = detectFileType(firstFile.file.name)
        if (detectedType) {
          setSelectedFileType(detectedType)

          // Get extension info for display
          const fileName = firstFile.file.name.toLowerCase()
          const extension = fileName.substring(fileName.lastIndexOf('.'))
          const extensionInfo = CONSAR_EXTENSION_MAP[extension]

          // Show toast for auto-detection
          toast({
            title: 'Tipo detectado automáticamente',
            description: `Archivo ${extensionInfo?.description || detectedType} (${extension})`,
            variant: 'success',
            duration: 3000,
          })
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

    // Show global error/success messages
    const validCount = filesWithContentValidation.filter(
      (f) => f.validation.isValid && (!f.contentValidation || f.contentValidation.isValid)
    ).length

    if (validCount === 0 && filesWithContentValidation.length > 0) {
      setGlobalError('Ninguno de los archivos seleccionados es válido. Por favor, revise los errores.')
      toast({
        title: 'Archivos inválidos',
        description: 'Por favor, revise los errores en los archivos seleccionados.',
        variant: 'destructive',
        duration: 5000,
      })
    } else if (validCount > 0) {
      setGlobalSuccess(`${validCount} archivo${validCount > 1 ? 's' : ''} listo${validCount > 1 ? 's' : ''} para subir`)
    }
  }, [maxFileSize, maxFiles, autoDetectType, toast])

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
    setShowDetailedValidation(false)
    setCurrentValidationFile(null)
    resetValidation()
  }, [resetValidation])

  /**
   * Run detailed CONSAR validation using ValidationEngine
   */
  const handleDetailedValidation = useCallback(async (file: File) => {
    setCurrentValidationFile(file)
    setShowDetailedValidation(true)
    setGlobalError('')

    try {
      // Convert FileType to CONSARFileType
      const consarFileType = selectedFileType as CONSARFileType

      // Run the full validation engine
      const result = await runDetailedValidation(file, consarFileType)

      if (result && !result.isValid) {
        // Update the file validation status based on detailed results
        setFilesWithValidation((prev) =>
          prev.map((f) => {
            if (f.file.name === file.name) {
              return {
                ...f,
                contentValidation: {
                  isValid: result.isCompliant,
                  error: result.isCompliant
                    ? undefined
                    : `${result.summary.totalErrors} errores, ${result.summary.totalWarnings} advertencias`,
                  errorCode: result.isCompliant ? undefined : 'VALIDATION_FAILED',
                  details: {
                    totalErrors: result.summary.totalErrors,
                    totalWarnings: result.summary.totalWarnings,
                    complianceScore: result.summary.complianceScore,
                  },
                },
              }
            }
            return f
          })
        )
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al validar archivo'
      setGlobalError(errorMessage)
    }
  }, [selectedFileType, runDetailedValidation])

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
      toast({
        title: 'Sin archivos válidos',
        description: 'No hay archivos válidos para subir. Por favor, seleccione archivos que cumplan con los requisitos.',
        variant: 'warning',
        duration: 5000,
      })
      return
    }

    setGlobalError('')
    setGlobalSuccess('')

    try {
      let uploadedCount = 0
      for (const { file } of validFiles) {
        await uploadMutation.mutateAsync({
          files: [file],
          fileType: selectedFileType,
        })
        uploadedCount++
      }

      // Show success message
      const successMessage = `${uploadedCount} archivo${uploadedCount > 1 ? 's' : ''} subido${uploadedCount > 1 ? 's' : ''} exitosamente`
      setGlobalSuccess(successMessage)

      toast({
        title: 'Carga exitosa',
        description: successMessage,
        variant: 'success',
        duration: 5000,
      })

      clearFiles()
      onUploadComplete?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? sanitizeString(err.message) : 'Error al subir archivos'
      setGlobalError(errorMessage)

      toast({
        title: 'Error al subir archivos',
        description: errorMessage,
        variant: 'destructive',
        duration: 7000,
      })

      onUploadError?.(errorMessage)
    }
  }, [filesWithValidation, selectedFileType, uploadMutation, clearFiles, onUploadComplete, onUploadError, toast])

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

  // Determine if we have files loaded for layout changes
  const hasFiles = filesWithValidation.length > 0

  return (
    <div
      className={cn(
        'flex flex-col',
        hasFiles ? 'gap-4 sm:gap-5' : 'gap-3 sm:gap-4'
      )}
      role="region"
      aria-label="Zona de carga de archivos CONSAR"
    >
      {/* Global Error Banner */}
      {globalError && (
        <aside
          className={cn(
            'flex items-start gap-3 p-3 sm:p-4 rounded-2xl',
            'backdrop-blur-xl',
            'animate-in fade-in slide-in-from-top-2 duration-300'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(220, 38, 38, 0.04) 100%)',
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <p className={cn('text-sm font-medium', isDark ? 'text-red-400' : 'text-red-600')}>
            {globalError}
          </p>
        </aside>
      )}

      {/* Drop Zone - Adaptive size based on file state */}
      <div
        className={cn(
          'relative rounded-2xl sm:rounded-3xl overflow-hidden',
          'transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          isDragging && 'scale-[0.98]',
          !hasFiles && 'hover:scale-[1.005]',
        )}
        style={{
          // Organic gradient border
          background: isDragging
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.9) 50%, rgba(59, 130, 246, 0.9) 100%)'
            : isDark
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, rgba(59, 130, 246, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(99, 102, 241, 0.12) 50%, rgba(59, 130, 246, 0.18) 100%)',
          padding: '1.5px',
          boxShadow: isDragging
            ? '0 0 60px rgba(139, 92, 246, 0.4), 0 20px 40px rgba(99, 102, 241, 0.2)'
            : hasFiles
              ? isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.04)'
              : isDark
                ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px rgba(139, 92, 246, 0.06)'
                : '0 8px 32px rgba(0, 0, 0, 0.05), 0 0 60px rgba(139, 92, 246, 0.04)',
        }}
      >
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
            'relative cursor-pointer',
            'flex items-center',
            'rounded-[calc(1rem-1.5px)] sm:rounded-[calc(1.5rem-1.5px)]',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2',
            'transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
            // Adaptive layout based on file state
            hasFiles
              ? 'flex-row gap-3 sm:gap-4 px-4 py-3 sm:px-5 sm:py-4 min-h-0'
              : 'flex-col justify-center min-h-[300px] sm:min-h-[340px] md:min-h-[380px] px-6 py-10 sm:px-8 sm:py-12'
          )}
          style={{
            background: isDark
              ? isDragging
                ? 'linear-gradient(180deg, rgba(30, 27, 45, 0.98) 0%, rgba(25, 22, 40, 0.98) 100%)'
                : 'linear-gradient(180deg, rgba(30, 27, 45, 0.95) 0%, rgba(25, 22, 40, 0.95) 100%)'
              : isDragging
                ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.96) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.csv,.dat,.0100,.0200,.0300,.0314,.0316,.0317,.0321,.0400,.0500,.0600,.0700,.1101,.zip,.gpg"
            onChange={handleFileInputChange}
            aria-label="Seleccionar archivos CONSAR para validación"
            className="sr-only"
          />

          <p id="upload-instructions" className="sr-only">
            Formatos aceptados: TXT, CSV, DAT. Tamaño máximo: 50MB por archivo. Máximo 10 archivos.
            Formato de nombre requerido: YYYYMMDD_TIPO_CUENTA_FOLIO.extensión
          </p>

          {/* ========== COMPACT MODE (when files exist) ========== */}
          {hasFiles ? (
            <>
              {/* Compact Icon */}
              <figure
                className={cn(
                  'flex-shrink-0 flex items-center justify-center',
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl',
                  'transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                  isDragging && 'scale-110'
                )}
                style={{
                  background: isDark
                    ? 'linear-gradient(145deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)'
                    : 'linear-gradient(145deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
                  border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                }}
                aria-hidden="true"
              >
                <Upload className={cn(
                  'w-5 h-5 sm:w-6 sm:h-6',
                  'transition-transform duration-500',
                  isDragging ? 'translate-y-[-2px]' : '',
                  isDark ? 'text-violet-400' : 'text-violet-600'
                )} />
              </figure>

              {/* Compact Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm sm:text-base font-semibold truncate',
                  'transition-all duration-300',
                  isDark ? 'text-neutral-200' : 'text-neutral-700',
                  isDragging && 'text-violet-400'
                )}>
                  {isDragging ? 'Suelta para añadir' : 'Añadir más archivos'}
                </p>
                <p className={cn(
                  'text-xs font-medium truncate',
                  isDark ? 'text-neutral-500' : 'text-neutral-400'
                )}>
                  Arrastra o haz clic • CONSAR .0100-.1101
                </p>
              </div>

              {/* Compact Badge */}
              <span
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-1.5',
                  'px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full',
                  'text-xs font-bold tabular-nums',
                  'transition-all duration-300',
                  isDragging && 'scale-105'
                )}
                style={{
                  background: isDark
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(34, 197, 94, 0.1)',
                  color: isDark ? 'rgb(74, 222, 128)' : 'rgb(22, 163, 74)',
                  border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`,
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{validFilesCount}</span>
              </span>
            </>
          ) : (
            /* ========== FULL MODE (no files) ========== */
            <>
              {/* Organic Upload Illustration */}
              <figure
                className={cn(
                  'relative mb-6 sm:mb-8',
                  'transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
                  isDragging && 'scale-110 -translate-y-2'
                )}
                aria-hidden="true"
              >
                {/* Ambient glow */}
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, ${isDark ? 'rgba(99, 102, 241, 0.6)' : 'rgba(99, 102, 241, 0.4)'} 0%, transparent 70%)`,
                    transform: 'scale(2)',
                    animation: 'pulse 3s ease-in-out infinite',
                  }}
                />

                {/* Main organic container */}
                <div
                  className={cn(
                    'relative flex items-center justify-center',
                    'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
                  )}
                  style={{
                    background: isDark
                      ? 'linear-gradient(145deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(59, 130, 246, 0.12) 100%)'
                      : 'linear-gradient(145deg, rgba(99, 102, 241, 0.06) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(59, 130, 246, 0.06) 100%)',
                    borderRadius: '35% 65% 58% 42% / 48% 42% 58% 52%',
                    border: `1.5px solid ${isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(139, 92, 246, 0.15)'}`,
                    backdropFilter: 'blur(16px)',
                    boxShadow: isDark
                      ? '0 24px 64px rgba(99, 102, 241, 0.2), inset 0 0 40px rgba(139, 92, 246, 0.1)'
                      : '0 24px 64px rgba(99, 102, 241, 0.1), inset 0 0 40px rgba(139, 92, 246, 0.05)',
                  }}
                >
                  {/* SVG Illustration */}
                  <svg
                    viewBox="0 0 64 64"
                    className={cn(
                      'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
                      'transition-all duration-500 ease-out'
                    )}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Document */}
                    <rect
                      x="16" y="8" width="32" height="42" rx="4"
                      fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.9)'}
                      stroke={isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.4)'}
                      strokeWidth="2"
                    />
                    <path
                      d="M40 8 L48 16 L40 16 Z"
                      fill={isDark ? 'rgba(139, 92, 246, 0.25)' : 'rgba(99, 102, 241, 0.15)'}
                      stroke={isDark ? 'rgba(139, 92, 246, 0.5)' : 'rgba(99, 102, 241, 0.4)'}
                      strokeWidth="1.5"
                    />
                    {/* Lines */}
                    <line x1="22" y1="24" x2="42" y2="24" stroke={isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(99, 102, 241, 0.3)'} strokeWidth="2" strokeLinecap="round" />
                    <line x1="22" y1="32" x2="38" y2="32" stroke={isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(99, 102, 241, 0.2)'} strokeWidth="2" strokeLinecap="round" />
                    <line x1="22" y1="40" x2="34" y2="40" stroke={isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.15)'} strokeWidth="2" strokeLinecap="round" />
                    {/* Upload button */}
                    <g style={{ animation: 'bounce 2s ease-in-out infinite' }}>
                      <circle cx="32" cy="52" r="10" fill={isDark ? 'rgba(99, 102, 241, 0.9)' : 'rgba(99, 102, 241, 0.85)'} />
                      <path d="M32 56 L32 48 M28 51 L32 47 L36 51" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                </div>

                {/* Floating accents */}
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400/60 animate-bounce" style={{ animationDuration: '2.5s' }} />
                <span className="absolute -bottom-2 -left-2 w-2 h-2 rounded-full bg-cyan-400/60 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.3s' }} />
                <span className="absolute top-1/2 -right-3 w-2 h-2 rounded-full bg-violet-400/50 animate-pulse" />
              </figure>

              {/* Title Section */}
              <header className="text-center space-y-2 sm:space-y-3">
                <h3
                  className={cn(
                    'text-xl sm:text-2xl md:text-3xl font-bold tracking-tight',
                    'transition-all duration-500',
                    isDark ? 'text-white' : 'text-neutral-900',
                    isDragging && 'scale-105 text-violet-400'
                  )}
                >
                  {isDragging ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic'}
                </h3>
                <p
                  className={cn(
                    'text-sm sm:text-base font-medium',
                    'transition-all duration-300',
                    isDark ? 'text-neutral-400' : 'text-neutral-500',
                    isDragging && 'opacity-40'
                  )}
                >
                  para seleccionar archivos CONSAR
                </p>
              </header>

              {/* CONSAR Extension Chips */}
              <nav
                className={cn(
                  'mt-6 sm:mt-8 w-full max-w-lg',
                  'transition-all duration-500',
                  isDragging && 'opacity-20 scale-95 blur-sm'
                )}
                aria-label="Tipos de archivos CONSAR soportados"
              >
                <ul className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-4">
                  {[
                    { ext: '.0100', label: 'Nómina', rgb: '52, 211, 153' },
                    { ext: '.0200', label: 'Contable', rgb: '139, 92, 246' },
                    { ext: '.0300', label: 'Cartera', rgb: '59, 130, 246' },
                    { ext: '.0314', label: 'Derivados', rgb: '251, 191, 36' },
                    { ext: '.1101', label: 'Conciliación', rgb: '34, 211, 238' },
                  ].map(({ ext, label, rgb }) => (
                    <li
                      key={ext}
                      className={cn(
                        'inline-flex items-center gap-1 sm:gap-1.5',
                        'px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full',
                        'text-[10px] sm:text-xs font-semibold',
                        'transition-all duration-300 ease-out',
                        'hover:scale-105 hover:-translate-y-0.5',
                        'cursor-default select-none'
                      )}
                      style={{
                        background: `rgba(${rgb}, ${isDark ? '0.12' : '0.08'})`,
                        color: `rgba(${rgb}, ${isDark ? '1' : '0.9'})`,
                        border: `1px solid rgba(${rgb}, ${isDark ? '0.2' : '0.15'})`,
                      }}
                    >
                      <code className="font-mono">{ext}</code>
                      <span className="opacity-70 hidden xs:inline">{label}</span>
                    </li>
                  ))}
                </ul>

                {/* Format hint */}
                <p className={cn(
                  'text-center text-[10px] sm:text-xs',
                  isDark ? 'text-neutral-500' : 'text-neutral-400'
                )}>
                  <code className={cn(
                    'px-1.5 py-0.5 rounded font-mono',
                    isDark ? 'bg-neutral-800/50' : 'bg-neutral-100'
                  )}>YYYYMMDD_XX_YYY_ZZZZ</code>
                  <span className="mx-2 opacity-40">•</span>
                  <span>Máx. 50MB</span>
                </p>
              </nav>
            </>
          )}
        </div>
      </div>

      {/* Content Validation Progress */}
      {isValidatingContent && (
        <aside
          className={cn(
            'flex items-center gap-3 p-3 sm:p-4 rounded-2xl',
            'backdrop-blur-xl'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.06) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.03) 100%)',
            border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
          }}
          role="alert"
          aria-live="polite"
        >
          <span className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
          <p className={cn('text-sm font-medium', isDark ? 'text-blue-300' : 'text-blue-700')}>
            Validando contenido de archivos...
          </p>
        </aside>
      )}

      {/* ========== FILES TABLE - Premium Design ========== */}
      {filesWithValidation.length > 0 && (
        <section
          className={cn(
            'rounded-2xl sm:rounded-3xl overflow-hidden',
            'animate-in fade-in slide-in-from-bottom-4 duration-500',
            'backdrop-blur-xl'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(30, 27, 45, 0.9) 0%, rgba(25, 22, 40, 0.95) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
          aria-label="Archivos seleccionados para validación"
        >
          {/* Table Header */}
          <header
            className={cn(
              'flex items-center justify-between',
              'px-4 py-3 sm:px-5 sm:py-4'
            )}
            style={{
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <h4 className={cn(
                'text-base sm:text-lg font-bold',
                isDark ? 'text-neutral-100' : 'text-neutral-800'
              )}>
                Archivos
              </h4>

              {/* Status Pills */}
              <div className="flex items-center gap-2">
                {validFilesCount > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                      'text-xs font-semibold tabular-nums',
                      'animate-in fade-in zoom-in-90 duration-300'
                    )}
                    style={{
                      background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                      color: isDark ? 'rgb(74, 222, 128)' : 'rgb(22, 163, 74)',
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {validFilesCount}
                  </span>
                )}
                {invalidFilesCount > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                      'text-xs font-semibold tabular-nums',
                      'animate-in fade-in zoom-in-90 duration-300'
                    )}
                    style={{
                      background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                      color: isDark ? 'rgb(248, 113, 113)' : 'rgb(220, 38, 38)',
                    }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    {invalidFilesCount}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={clearFiles}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-lg',
                'transition-all duration-300 ease-out',
                'hover:scale-105 active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-red-500/30',
                isDark
                  ? 'text-neutral-400 hover:text-red-400 hover:bg-red-500/10'
                  : 'text-neutral-500 hover:text-red-600 hover:bg-red-50'
              )}
              aria-label="Limpiar todos los archivos"
            >
              Limpiar todo
            </button>
          </header>

          {/* Table Body */}
          <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
            {filesWithValidation.map(({ file, validation, metadata, contentValidation }, index) => {
              const isValid = validation.isValid && (!contentValidation || contentValidation.isValid)
              const hasWarning = validation.isValid && contentValidation && !contentValidation.isValid
              const hasError = !validation.isValid

              // Get file extension and type color
              const fileName = file.name.toLowerCase()
              const extension = fileName.substring(fileName.lastIndexOf('.'))
              const extensionInfo = CONSAR_EXTENSION_MAP[extension]
              const fileTypeLabel = extensionInfo?.name || extension.toUpperCase().replace('.', '')

              // Color map for different file types
              const typeColorMap: Record<string, { rgb: string; text: string }> = {
                '.0100': { rgb: '52, 211, 153', text: 'emerald' },
                '.0200': { rgb: '139, 92, 246', text: 'violet' },
                '.0300': { rgb: '59, 130, 246', text: 'blue' },
                '.0314': { rgb: '251, 191, 36', text: 'amber' },
                '.0316': { rgb: '236, 72, 153', text: 'pink' },
                '.0317': { rgb: '168, 85, 247', text: 'purple' },
                '.0321': { rgb: '249, 115, 22', text: 'orange' },
                '.0400': { rgb: '34, 211, 238', text: 'cyan' },
                '.0500': { rgb: '20, 184, 166', text: 'teal' },
                '.0600': { rgb: '132, 204, 22', text: 'lime' },
                '.0700': { rgb: '244, 63, 94', text: 'rose' },
                '.1101': { rgb: '99, 102, 241', text: 'indigo' },
              }
              const defaultColor = { rgb: '107, 114, 128', text: 'gray' }
              const typeColor = typeColorMap[extension] || defaultColor

              return (
                <article
                  key={`${file.name}-${index}`}
                  className={cn(
                    'group/row relative',
                    'flex items-center gap-3 sm:gap-4',
                    'px-4 py-3 sm:px-5 sm:py-4',
                    'transition-all duration-300 ease-out',
                    'animate-in fade-in slide-in-from-left-2',
                    'hover:bg-white/[0.02]'
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'backwards',
                  }}
                >
                  {/* Status Indicator Line */}
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2',
                      'w-1 h-8 rounded-r-full',
                      'transition-all duration-500 ease-out',
                      'group-hover/row:h-12'
                    )}
                    style={{
                      background: isValid
                        ? 'rgb(34, 197, 94)'
                        : hasWarning
                          ? 'rgb(251, 191, 36)'
                          : 'rgb(239, 68, 68)',
                      boxShadow: isValid
                        ? '0 0 12px rgba(34, 197, 94, 0.4)'
                        : hasWarning
                          ? '0 0 12px rgba(251, 191, 36, 0.4)'
                          : '0 0 12px rgba(239, 68, 68, 0.4)',
                    }}
                    aria-hidden="true"
                  />

                  {/* File Type Icon */}
                  <figure
                    className={cn(
                      'flex-shrink-0 flex items-center justify-center',
                      'w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl',
                      'transition-all duration-300 ease-out',
                      'group-hover/row:scale-105'
                    )}
                    style={{
                      background: `rgba(${typeColor.rgb}, ${isDark ? '0.12' : '0.08'})`,
                      border: `1px solid rgba(${typeColor.rgb}, ${isDark ? '0.25' : '0.15'})`,
                    }}
                    aria-hidden="true"
                  >
                    <FileText
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: `rgba(${typeColor.rgb}, ${isDark ? '0.9' : '0.8'})` }}
                    />
                  </figure>

                  {/* File Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    {/* File name + Type Badge row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className={cn(
                        'text-sm sm:text-base font-semibold truncate',
                        isDark ? 'text-neutral-100' : 'text-neutral-800'
                      )}>
                        {file.name}
                      </h5>
                      <span
                        className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded-md',
                          'text-[9px] sm:text-[10px] font-bold uppercase tracking-wide'
                        )}
                        style={{
                          background: `rgba(${typeColor.rgb}, ${isDark ? '0.15' : '0.1'})`,
                          color: `rgba(${typeColor.rgb}, 1)`,
                        }}
                      >
                        {fileTypeLabel}
                      </span>
                    </div>

                    {/* Metadata row */}
                    <p className={cn(
                      'text-xs font-medium',
                      isDark ? 'text-neutral-500' : 'text-neutral-400'
                    )}>
                      <span className="tabular-nums">{formatFileSize(file.size)}</span>
                      {metadata && (
                        <>
                          <span className="mx-1.5 opacity-40">•</span>
                          <time>
                            {metadata.date.slice(0, 4)}-{metadata.date.slice(4, 6)}-{metadata.date.slice(6, 8)}
                          </time>
                          {metadata.account && (
                            <>
                              <span className="mx-1.5 opacity-40">•</span>
                              <span>Cuenta: {metadata.account}</span>
                            </>
                          )}
                        </>
                      )}
                    </p>

                    {/* Validation Status Message */}
                    {hasError && (
                      <p className="text-xs font-medium text-red-500 animate-in fade-in duration-200">
                        {validation.error}
                      </p>
                    )}
                    {hasWarning && (
                      <p className="text-xs font-medium text-amber-500 animate-in fade-in duration-200">
                        {contentValidation?.error}
                      </p>
                    )}
                    {isValid && (
                      <p className={cn(
                        'text-xs font-medium',
                        isDark ? 'text-green-400/80' : 'text-green-600/80'
                      )}>
                        Cumple normativa CONSAR
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={cn(
                    'flex items-center gap-1.5 sm:gap-2',
                    'transition-all duration-300',
                    'opacity-60 group-hover/row:opacity-100'
                  )}>
                    {/* Status Icon */}
                    <span
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg',
                        'transition-all duration-300'
                      )}
                      style={{
                        background: isValid
                          ? isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)'
                          : hasWarning
                            ? isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(251, 191, 36, 0.08)'
                            : isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                      }}
                    >
                      {isValid && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {hasWarning && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {hasError && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </span>

                    {/* Validate Button */}
                    {isValid && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDetailedValidation(file) }}
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-lg',
                          'transition-all duration-300 ease-out',
                          'hover:scale-110 active:scale-95',
                          'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
                        )}
                        style={{
                          background: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(59, 130, 246, 0.08)',
                        }}
                        title="Validación CONSAR completa"
                        aria-label={`Ejecutar validación completa de ${file.name}`}
                      >
                        <Play className="w-4 h-4 text-blue-500" />
                      </button>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(index)}
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg',
                        'transition-all duration-300 ease-out',
                        'hover:scale-110 active:scale-95',
                        'focus:outline-none focus:ring-2 focus:ring-red-500/40'
                      )}
                      style={{
                        background: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
                      }}
                      aria-label={`Eliminar ${file.name}`}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Table Footer - Actions */}
          <footer
            className={cn(
              'flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3',
              'px-4 py-4 sm:px-5 sm:py-5'
            )}
            style={{
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
              background: isDark
                ? 'rgba(0, 0, 0, 0.15)'
                : 'rgba(248, 250, 252, 0.5)',
            }}
          >
            <Button
              variant="secondary"
              size="lg"
              onClick={clearFiles}
              disabled={uploadMutation.isPending}
              className="w-full sm:w-auto"
              aria-label="Cancelar y limpiar archivos"
            >
              Cancelar
            </Button>
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
              className="w-full sm:flex-1"
              aria-label={`Subir ${validFilesCount} archivo${validFilesCount !== 1 ? 's' : ''} válido${validFilesCount !== 1 ? 's' : ''}`}
            />
          </footer>
        </section>
      )}

      {/* Detailed Validation Progress */}
      {showDetailedValidation && (
        <ValidationProgress
          progress={validationState.progress}
          result={validationState.result}
          isValidating={validationState.isValidating}
          fileName={currentValidationFile?.name}
        />
      )}
    </div>
  )
}

export default FileUpload
