/**
 * usePDFGenerator Hook
 *
 * React hook for generating PDF reports
 */

import { useState, useCallback } from 'react'
import { getPDFGenerator } from '../generators/pdf-generator.service'
import type {
  ValidationReportData,
  ErrorReportData,
  PDFGenerationOptions,
} from '../types'

interface UsePDFGeneratorReturn {
  /**
   * Generate validation report
   */
  generateValidationReport: (
    data: ValidationReportData,
    options?: Partial<PDFGenerationOptions>
  ) => Promise<void>

  /**
   * Generate error report
   */
  generateErrorReport: (
    data: ErrorReportData,
    options?: Partial<PDFGenerationOptions>
  ) => Promise<void>

  /**
   * Is PDF being generated
   */
  isGenerating: boolean

  /**
   * Error during generation
   */
  error: Error | null

  /**
   * Clear error
   */
  clearError: () => void
}

/**
 * Hook for PDF generation
 */
export function usePDFGenerator(): UsePDFGeneratorReturn {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const generator = getPDFGenerator()

  const generateValidationReport = useCallback(
    async (
      data: ValidationReportData,
      options?: Partial<PDFGenerationOptions>
    ): Promise<void> => {
      setIsGenerating(true)
      setError(null)

      try {
        await generator.generateValidationReport(data, options)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate PDF')
        setError(error)
        throw error
      } finally {
        setIsGenerating(false)
      }
    },
    [generator]
  )

  const generateErrorReport = useCallback(
    async (
      data: ErrorReportData,
      options?: Partial<PDFGenerationOptions>
    ): Promise<void> => {
      setIsGenerating(true)
      setError(null)

      try {
        await generator.generateErrorReport(data, options)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate PDF')
        setError(error)
        throw error
      } finally {
        setIsGenerating(false)
      }
    },
    [generator]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    generateValidationReport,
    generateErrorReport,
    isGenerating,
    error,
    clearError,
  }
}
