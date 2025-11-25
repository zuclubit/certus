/**
 * Report Data Builder
 *
 * Utilities to transform parsed CONSAR data into report data structures
 */

import type { ParsedFile } from '../../parsers/types'
import type {
  ValidationReportData,
  ErrorReportData,
  ReportMetadata,
} from '../types'

/**
 * Build validation report data from parsed file
 */
export function buildValidationReportData(
  parsedFile: ParsedFile,
  fileName: string
): ValidationReportData {
  // Calculate summary
  const totalRecords = parsedFile.totalRecords
  const validRecords = parsedFile.records.filter(r => r.isValid).length
  const invalidRecords = totalRecords - validRecords
  const errorRate = totalRecords > 0 ? invalidRecords / totalRecords : 0

  // Build file structure info
  const fileStructure = {
    hasHeader: parsedFile.hasHeader ?? true,
    hasFooter: parsedFile.hasFooter ?? true,
    detailRecords: parsedFile.detailRecords || totalRecords,
    totalLines: parsedFile.records.length,
  }

  // Collect all errors
  const allErrors: Array<{
    lineNumber: number
    fieldName: string
    errorMessage: string
    errorType: string
    severity: 'critical' | 'error' | 'warning'
    value?: string
  }> = []

  parsedFile.records.forEach(record => {
    if (!record.isValid && record.errors) {
      record.errors.forEach(error => {
        allErrors.push({
          lineNumber: record.lineNumber,
          fieldName: error.field || 'unknown',
          errorMessage: error.message,
          errorType: error.type || 'validation',
          severity: error.severity || 'error',
          value: error.value,
        })
      })
    }
  })

  // Group errors by type
  const errorsByTypeMap = new Map<string, {
    type: string
    count: number
    severity: 'critical' | 'error' | 'warning'
  }>()

  allErrors.forEach(error => {
    const key = error.errorType
    const existing = errorsByTypeMap.get(key)

    if (existing) {
      existing.count++
      // Upgrade severity if needed
      if (error.severity === 'critical') {
        existing.severity = 'critical'
      } else if (error.severity === 'error' && existing.severity !== 'critical') {
        existing.severity = 'error'
      }
    } else {
      errorsByTypeMap.set(key, {
        type: error.errorType,
        count: 1,
        severity: error.severity,
      })
    }
  })

  const errorsByType = Array.from(errorsByTypeMap.values()).map(item => ({
    ...item,
    percentage: totalRecords > 0 ? item.count / totalRecords : 0,
  }))

  // Group errors by field
  const errorsByFieldMap = new Map<string, number>()

  allErrors.forEach(error => {
    const count = errorsByFieldMap.get(error.fieldName) || 0
    errorsByFieldMap.set(error.fieldName, count + 1)
  })

  const errorsByField = Array.from(errorsByFieldMap.entries())
    .map(([field, count]) => ({
      field,
      count,
      percentage: totalRecords > 0 ? count / totalRecords : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Top errors (first 20)
  const topErrors = allErrors.slice(0, 20)

  // Metadata
  const metadata: ReportMetadata = {
    title: 'Reporte de Validación CONSAR',
    subtitle: fileName,
    generatedAt: new Date(),
    generatedBy: 'Certus',
    version: '1.0',
    fileInfo: {
      fileName,
      fileType: parsedFile.fileType || 'UNKNOWN',
      fileSize: 0, // TODO: Get from file
      uploadDate: new Date(),
    },
  }

  return {
    metadata,
    summary: {
      totalRecords,
      validRecords,
      invalidRecords,
      errorRate,
      processingTime: parsedFile.processingTime,
    },
    fileStructure,
    errorsByType,
    errorsByField,
    topErrors,
    records: parsedFile.records.map(r => ({
      lineNumber: r.lineNumber,
      recordType: r.recordType,
      isValid: r.isValid,
      errors: r.errors?.map(e => e.message) || [],
      data: r.data,
    })),
  }
}

/**
 * Build error report data from parsed file
 */
export function buildErrorReportData(
  parsedFile: ParsedFile,
  fileName: string
): ErrorReportData {
  // Collect all errors
  const allErrors: Array<{
    lineNumber: number
    fieldName: string
    errorType: string
    errorMessage: string
    severity: 'critical' | 'error' | 'warning'
    value?: string
    expectedFormat?: string
  }> = []

  parsedFile.records.forEach(record => {
    if (!record.isValid && record.errors) {
      record.errors.forEach(error => {
        allErrors.push({
          lineNumber: record.lineNumber,
          fieldName: error.field || 'unknown',
          errorType: error.type || 'validation',
          errorMessage: error.message,
          severity: error.severity || 'error',
          value: error.value,
          expectedFormat: error.expectedFormat,
        })
      })
    }
  })

  const totalErrors = allErrors.length
  const criticalErrors = allErrors.filter(e => e.severity === 'critical').length
  const errorTypes = new Set(allErrors.map(e => e.errorType)).size
  const affectedRecords = parsedFile.records.filter(r => !r.isValid).length

  // Distribution by severity
  const bySeverity = [
    {
      severity: 'critical',
      count: allErrors.filter(e => e.severity === 'critical').length,
      percentage: 0,
    },
    {
      severity: 'error',
      count: allErrors.filter(e => e.severity === 'error').length,
      percentage: 0,
    },
    {
      severity: 'warning',
      count: allErrors.filter(e => e.severity === 'warning').length,
      percentage: 0,
    },
  ].map(item => ({
    ...item,
    percentage: totalErrors > 0 ? item.count / totalErrors : 0,
  }))

  // Distribution by type
  const byTypeMap = new Map<string, number>()
  allErrors.forEach(error => {
    const count = byTypeMap.get(error.errorType) || 0
    byTypeMap.set(error.errorType, count + 1)
  })

  const byType = Array.from(byTypeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalErrors > 0 ? count / totalErrors : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Distribution by field
  const byFieldMap = new Map<string, number>()
  allErrors.forEach(error => {
    const count = byFieldMap.get(error.fieldName) || 0
    byFieldMap.set(error.fieldName, count + 1)
  })

  const byField = Array.from(byFieldMap.entries())
    .map(([field, count]) => ({
      field,
      count,
      percentage: totalErrors > 0 ? count / totalErrors : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Metadata
  const metadata: ReportMetadata = {
    title: 'Reporte de Errores CONSAR',
    subtitle: fileName,
    generatedAt: new Date(),
    generatedBy: 'Certus',
    version: '1.0',
    fileInfo: {
      fileName,
      fileType: parsedFile.fileType || 'UNKNOWN',
      fileSize: 0,
      uploadDate: new Date(),
    },
  }

  return {
    metadata,
    summary: {
      totalErrors,
      criticalErrors,
      errorTypes,
      affectedRecords,
    },
    errors: allErrors,
    errorDistribution: {
      bySeverity,
      byType,
      byField,
    },
  }
}
