/**
 * Validations Module - Utility Functions
 *
 * Helper functions for validation operations
 */

import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ValidationStatus, FileType } from '@/lib/constants'
import { STATUS_CONFIG, FILE_TYPE_CONFIG, CONSAR_CONFIG } from './constants'
import type { Validation, ValidationError, ValidationStatistics } from './types'

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format date as relative time (e.g., "hace 5 minutos")
 */
export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), {
      addSuffix: true,
      locale: es,
    })
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Format date in full format
 */
export function formatFullDate(dateString: string): string {
  try {
    return format(parseISO(dateString), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
      locale: es,
    })
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Format date in short format
 */
export function formatShortDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
  } catch {
    return 'Fecha inválida'
  }
}

/**
 * Format processing time
 */
export function formatProcessingTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }
  if (milliseconds < 60000) {
    return `${(milliseconds / 1000).toFixed(1)}s`
  }
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

/**
 * Format number with locale
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('es-MX')
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// ============================================
// STATUS UTILITIES
// ============================================

/**
 * Get status configuration
 */
export function getStatusConfig(status: ValidationStatus) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending
}

/**
 * Get file type configuration
 */
export function getFileTypeConfig(fileType: FileType) {
  return FILE_TYPE_CONFIG[fileType] || FILE_TYPE_CONFIG.PROCESAR
}

/**
 * Check if validation is actionable (can be retried, deleted, etc.)
 */
export function isValidationActionable(validation: Validation): boolean {
  return ['error', 'warning'].includes(validation.status)
}

/**
 * Check if validation is in progress
 */
export function isValidationInProgress(validation: Validation): boolean {
  return ['pending', 'processing'].includes(validation.status)
}

/**
 * Check if validation is completed
 */
export function isValidationCompleted(validation: Validation): boolean {
  return ['success', 'warning', 'error'].includes(validation.status)
}

/**
 * Check if validation can be downloaded
 */
export function canDownloadReport(validation: Validation): boolean {
  return validation.status === 'success' || validation.status === 'warning'
}

// ============================================
// COMPLIANCE UTILITIES
// ============================================

/**
 * Calculate compliance score
 */
export function calculateComplianceScore(
  validRecords: number,
  totalRecords: number
): number {
  if (totalRecords === 0) return 100
  return Math.round((validRecords / totalRecords) * 10000) / 100
}

/**
 * Check if compliance score meets CONSAR requirements
 */
export function meetsComplianceRequirements(score: number): boolean {
  return score >= CONSAR_CONFIG.MIN_COMPLIANCE_SCORE
}

/**
 * Get compliance status
 */
export function getComplianceStatus(score: number): {
  status: 'compliant' | 'warning' | 'non-compliant'
  label: string
  color: string
} {
  if (score >= CONSAR_CONFIG.MIN_COMPLIANCE_SCORE) {
    return { status: 'compliant', label: 'Cumple', color: 'text-green-500' }
  }
  if (score >= CONSAR_CONFIG.MIN_COMPLIANCE_SCORE - 5) {
    return { status: 'warning', label: 'En riesgo', color: 'text-yellow-500' }
  }
  return { status: 'non-compliant', label: 'No cumple', color: 'text-red-500' }
}

/**
 * Calculate error rate
 */
export function calculateErrorRate(
  errorCount: number,
  totalRecords: number
): number {
  if (totalRecords === 0) return 0
  return errorCount / totalRecords
}

/**
 * Check if error rate is acceptable
 */
export function isErrorRateAcceptable(errorRate: number): boolean {
  return errorRate <= CONSAR_CONFIG.ACCEPTABLE_ERROR_RATE
}

// ============================================
// ERROR ANALYSIS UTILITIES
// ============================================

/**
 * Group errors by field
 */
export function groupErrorsByField(
  errors: ValidationError[]
): Map<string, ValidationError[]> {
  const grouped = new Map<string, ValidationError[]>()

  errors.forEach((error) => {
    const existing = grouped.get(error.field) || []
    existing.push(error)
    grouped.set(error.field, existing)
  })

  return grouped
}

/**
 * Group errors by rule
 */
export function groupErrorsByRule(
  errors: ValidationError[]
): Map<string, ValidationError[]> {
  const grouped = new Map<string, ValidationError[]>()

  errors.forEach((error) => {
    const existing = grouped.get(error.rule) || []
    existing.push(error)
    grouped.set(error.rule, existing)
  })

  return grouped
}

/**
 * Get error summary
 */
export function getErrorSummary(errors: ValidationError[]): {
  total: number
  critical: number
  byField: { field: string; count: number }[]
  byRule: { rule: string; count: number }[]
} {
  const byField = groupErrorsByField(errors)
  const byRule = groupErrorsByRule(errors)

  return {
    total: errors.length,
    critical: errors.filter((e) => e.severity === 'critical').length,
    byField: Array.from(byField.entries())
      .map(([field, errs]) => ({ field, count: errs.length }))
      .sort((a, b) => b.count - a.count),
    byRule: Array.from(byRule.entries())
      .map(([rule, errs]) => ({ rule, count: errs.length }))
      .sort((a, b) => b.count - a.count),
  }
}

// ============================================
// STATISTICS UTILITIES
// ============================================

/**
 * Calculate success rate from statistics
 */
export function calculateSuccessRate(stats: ValidationStatistics): number {
  const completed = stats.success + stats.warning + stats.error
  if (completed === 0) return 0
  return Math.round((stats.success / completed) * 10000) / 100
}

/**
 * Get trend indicator
 */
export function getTrendIndicator(
  current: number,
  previous: number
): { trend: 'up' | 'down' | 'stable'; percentage: number } {
  if (previous === 0) {
    return { trend: current > 0 ? 'up' : 'stable', percentage: 0 }
  }

  const change = ((current - previous) / previous) * 100

  if (Math.abs(change) < 1) {
    return { trend: 'stable', percentage: 0 }
  }

  return {
    trend: change > 0 ? 'up' : 'down',
    percentage: Math.abs(Math.round(change)),
  }
}

// ============================================
// VERSION UTILITIES
// ============================================

/**
 * Get version label
 */
export function getVersionLabel(version: number): string {
  if (version === 1) return 'Original'
  return `Versión ${version}`
}

/**
 * Check if can create corrected version
 */
export function canCreateCorrectedVersion(validation: Validation): boolean {
  return (
    validation.isLatestVersion &&
    ['error', 'warning'].includes(validation.status) &&
    validation.version < CONSAR_CONFIG.MAX_RETRANSMISSIONS + 1
  )
}

/**
 * Get remaining retransmissions
 */
export function getRemainingRetransmissions(version: number): number {
  return Math.max(0, CONSAR_CONFIG.MAX_RETRANSMISSIONS - version + 1)
}
