/**
 * useFileValidation Hook
 *
 * React hook for validating CONSAR files with progress tracking,
 * error handling, and integration with the validation engine.
 *
 * Features:
 * - Automatic file type detection from filename
 * - Progress reporting with percentage
 * - Detailed error categorization
 * - Performance metrics
 * - Caching of validation results
 *
 * @module useFileValidation
 */

import { useState, useCallback, useRef } from 'react'
import {
  ValidationEngine,
  type FileValidationResult,
  type ValidationProgress,
  type ValidationOptions,
} from '../lib/validators'
import type { CONSARFileType } from '../lib/types/consar-record'

/**
 * Validation state
 */
export interface ValidationState {
  isValidating: boolean
  progress: ValidationProgress | null
  result: FileValidationResult | null
  error: Error | null
}

/**
 * File type detection result
 */
export interface FileTypeDetection {
  detected: boolean
  fileType: CONSARFileType | null
  confidence: 'high' | 'medium' | 'low'
  reason: string
}

/**
 * Hook return type
 */
export interface UseFileValidationReturn {
  state: ValidationState
  validateFile: (file: File, fileType?: CONSARFileType) => Promise<FileValidationResult | null>
  detectFileType: (fileName: string) => FileTypeDetection
  reset: () => void
  cancel: () => void
}

/**
 * Default validation options
 */
const DEFAULT_OPTIONS: ValidationOptions = {
  validateStructure: true,
  validateRecords: true,
  validateCrossReferences: true,
  stopOnFirstError: false,
  maxErrors: 1000,
  skipWarnings: false,
}

/**
 * File type patterns for detection
 */
const FILE_TYPE_PATTERNS: Array<{
  pattern: RegExp
  type: CONSARFileType
  confidence: 'high' | 'medium' | 'low'
}> = [
  { pattern: /^NOMINA[_-]/i, type: 'NOMINA', confidence: 'high' },
  { pattern: /^CONTABLE[_-]/i, type: 'CONTABLE', confidence: 'high' },
  { pattern: /^REGULARIZACION[_-]/i, type: 'REGULARIZACION', confidence: 'high' },
  { pattern: /^REG[_-]/i, type: 'REGULARIZACION', confidence: 'medium' },
  { pattern: /NOMINA/i, type: 'NOMINA', confidence: 'medium' },
  { pattern: /CONTABLE/i, type: 'CONTABLE', confidence: 'medium' },
  { pattern: /NOM[_-]/i, type: 'NOMINA', confidence: 'low' },
  { pattern: /CONT[_-]/i, type: 'CONTABLE', confidence: 'low' },
]

/**
 * useFileValidation Hook
 *
 * @param options - Validation options
 * @returns Validation state and controls
 */
export function useFileValidation(
  options: ValidationOptions = {}
): UseFileValidationReturn {
  const [state, setState] = useState<ValidationState>({
    isValidating: false,
    progress: null,
    result: null,
    error: null,
  })

  const engineRef = useRef<ValidationEngine | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

  /**
   * Detect file type from filename
   */
  const detectFileType = useCallback((fileName: string): FileTypeDetection => {
    const baseName = fileName.split('/').pop() || fileName

    for (const { pattern, type, confidence } of FILE_TYPE_PATTERNS) {
      if (pattern.test(baseName)) {
        return {
          detected: true,
          fileType: type,
          confidence,
          reason: `Detected from filename pattern: ${pattern.source}`,
        }
      }
    }

    // Try to extract from filename structure
    const parts = baseName.replace(/\.[^.]+$/, '').split(/[_-]/)
    const firstPart = parts[0]
    if (firstPart) {
      const upperFirstPart = firstPart.toUpperCase()

      if (['NOMINA', 'CONTABLE', 'REGULARIZACION'].includes(upperFirstPart)) {
        return {
          detected: true,
          fileType: upperFirstPart as CONSARFileType,
          confidence: 'high',
          reason: `Detected from filename prefix: ${upperFirstPart}`,
        }
      }
    }

    return {
      detected: false,
      fileType: null,
      confidence: 'low',
      reason: 'Could not detect file type from filename',
    }
  }, [])

  /**
   * Validate a file
   */
  const validateFile = useCallback(
    async (
      file: File,
      fileType?: CONSARFileType
    ): Promise<FileValidationResult | null> => {
      // Detect file type if not provided
      let resolvedType = fileType
      if (!resolvedType) {
        const detection = detectFileType(file.name)
        if (detection.detected && detection.fileType) {
          resolvedType = detection.fileType
        } else {
          setState(prev => ({
            ...prev,
            error: new Error(
              'No se pudo detectar el tipo de archivo. Por favor especifique el tipo.'
            ),
          }))
          return null
        }
      }

      // Create abort controller
      abortControllerRef.current = new AbortController()

      // Update state
      setState({
        isValidating: true,
        progress: {
          phase: 'parsing',
          percentComplete: 0,
          recordsProcessed: 0,
          totalRecords: 0,
          currentMessage: 'Iniciando validación...',
          errorsFound: 0,
          warningsFound: 0,
        },
        result: null,
        error: null,
      })

      try {
        // Create engine with progress callback
        engineRef.current = new ValidationEngine({
          ...mergedOptions,
          progressCallback: (progress) => {
            setState(prev => ({
              ...prev,
              progress,
            }))
          },
        })

        // Run validation
        const result = await engineRef.current.validateFile(file, resolvedType)

        // Update state with result
        setState(prev => ({
          ...prev,
          isValidating: false,
          result,
          progress: {
            phase: 'complete',
            percentComplete: 100,
            recordsProcessed: result.summary.totalRecords,
            totalRecords: result.summary.totalRecords,
            currentMessage: 'Validación completada',
            errorsFound: result.summary.totalErrors,
            warningsFound: result.summary.totalWarnings,
          },
        }))

        return result
      } catch (error) {
        setState(prev => ({
          ...prev,
          isValidating: false,
          error: error instanceof Error ? error : new Error(String(error)),
        }))
        return null
      }
    },
    [detectFileType, mergedOptions]
  )

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isValidating: false,
      progress: null,
      result: null,
      error: null,
    })
    engineRef.current = null
    abortControllerRef.current = null
  }, [])

  /**
   * Cancel validation
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(prev => ({
      ...prev,
      isValidating: false,
      progress: null,
    }))
  }, [])

  return {
    state,
    validateFile,
    detectFileType,
    reset,
    cancel,
  }
}

/**
 * Get error summary for display
 */
export function getErrorSummary(result: FileValidationResult | null): {
  critical: number
  errors: number
  warnings: number
  info: number
  total: number
  complianceScore: number
} {
  if (!result) {
    return {
      critical: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      total: 0,
      complianceScore: 100,
    }
  }

  return {
    critical: result.summary.errorsBySeverity.critical,
    errors: result.summary.errorsBySeverity.error,
    warnings: result.summary.errorsBySeverity.warning,
    info: result.summary.errorsBySeverity.info,
    total: result.summary.totalErrors + result.summary.totalWarnings,
    complianceScore: result.summary.complianceScore,
  }
}

/**
 * Get status color based on overall status
 */
export function getStatusColor(
  status: FileValidationResult['overallStatus'] | null
): string {
  switch (status) {
    case 'passed':
      return 'text-green-500'
    case 'warning':
      return 'text-yellow-500'
    case 'failed':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

/**
 * Get status icon based on overall status
 */
export function getStatusIcon(
  status: FileValidationResult['overallStatus'] | null
): string {
  switch (status) {
    case 'passed':
      return 'CheckCircle2'
    case 'warning':
      return 'AlertTriangle'
    case 'failed':
      return 'XCircle'
    default:
      return 'Circle'
  }
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

export default useFileValidation
