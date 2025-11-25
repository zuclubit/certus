/**
 * PDF Report Types
 *
 * Type definitions for PDF report generation system
 */

import type { TDocumentDefinitions, Content, ContentText, ContentTable } from 'pdfmake/interfaces'

// ============================================================================
// Report Types
// ============================================================================

export type ReportType = 'validation' | 'errors' | 'executive' | 'comparison'

export type ReportFormat = 'pdf' | 'preview'

// ============================================================================
// Report Data Interfaces
// ============================================================================

/**
 * Base report metadata
 */
export interface ReportMetadata {
  title: string
  subtitle?: string
  generatedAt: Date
  generatedBy?: string
  version?: string
  fileInfo?: {
    fileName: string
    fileType: string
    fileSize: number
    uploadDate: Date
  }
}

/**
 * Validation report data
 */
export interface ValidationReportData {
  metadata: ReportMetadata
  summary: {
    totalRecords: number
    validRecords: number
    invalidRecords: number
    errorRate: number
    processingTime?: number
  }
  fileStructure: {
    hasHeader: boolean
    hasFooter: boolean
    detailRecords: number
    totalLines: number
  }
  errorsByType: Array<{
    type: string
    count: number
    percentage: number
    severity: 'critical' | 'error' | 'warning'
  }>
  errorsByField: Array<{
    field: string
    count: number
    percentage: number
  }>
  topErrors: Array<{
    lineNumber: number
    fieldName: string
    errorMessage: string
    value?: string
  }>
  records?: Array<{
    lineNumber: number
    recordType: string
    isValid: boolean
    errors: string[]
    data: Record<string, unknown>
  }>
}

/**
 * Error report data
 */
export interface ErrorReportData {
  metadata: ReportMetadata
  summary: {
    totalErrors: number
    criticalErrors: number
    errorTypes: number
    affectedRecords: number
  }
  errors: Array<{
    lineNumber: number
    fieldName: string
    errorType: string
    errorMessage: string
    severity: 'critical' | 'error' | 'warning'
    value?: string
    expectedFormat?: string
  }>
  errorDistribution: {
    bySeverity: Array<{
      severity: string
      count: number
      percentage: number
    }>
    byType: Array<{
      type: string
      count: number
      percentage: number
    }>
    byField: Array<{
      field: string
      count: number
      percentage: number
    }>
  }
}

/**
 * Executive summary report data
 */
export interface ExecutiveSummaryData {
  metadata: ReportMetadata
  overview: {
    filesProcessed: number
    totalRecords: number
    successRate: number
    criticalIssues: number
  }
  compliance: {
    status: 'compliant' | 'non-compliant' | 'partial'
    score: number
    criticalFindings: number
    recommendations: string[]
  }
  trends: {
    period: string
    errorTrend: 'increasing' | 'decreasing' | 'stable'
    volumeTrend: 'increasing' | 'decreasing' | 'stable'
  }
  topIssues: Array<{
    issue: string
    impact: 'high' | 'medium' | 'low'
    occurrences: number
    recommendation: string
  }>
}

/**
 * Comparison report data
 */
export interface ComparisonReportData {
  metadata: ReportMetadata
  files: Array<{
    fileName: string
    date: Date
    records: number
    errors: number
    errorRate: number
  }>
  comparison: {
    totalFiles: number
    bestFile: string
    worstFile: string
    averageErrorRate: number
  }
  trends: Array<{
    date: string
    errorCount: number
    errorRate: number
    recordCount: number
  }>
}

// ============================================================================
// Chart Data Interfaces
// ============================================================================

export interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    fill?: boolean
  }>
}

export interface PieChartData {
  labels: string[]
  data: number[]
  colors?: string[]
}

export interface BarChartData {
  categories: string[]
  series: Array<{
    name: string
    data: number[]
    color?: string
  }>
}

export interface LineChartData {
  labels: string[]
  datasets: Array<{
    name: string
    data: number[]
    color?: string
  }>
}

// ============================================================================
// PDF Generation Options
// ============================================================================

export interface PDFGenerationOptions {
  /**
   * Report type to generate
   */
  reportType: ReportType

  /**
   * Output format
   */
  format?: ReportFormat

  /**
   * Include charts
   */
  includeCharts?: boolean

  /**
   * Include detailed records
   */
  includeDetails?: boolean

  /**
   * Maximum records to include in detail section
   */
  maxDetailRecords?: number

  /**
   * Page orientation
   */
  orientation?: 'portrait' | 'landscape'

  /**
   * Include page numbers
   */
  includePageNumbers?: boolean

  /**
   * Include table of contents
   */
  includeTOC?: boolean

  /**
   * Watermark text
   */
  watermark?: string

  /**
   * Custom footer text
   */
  footerText?: string

  /**
   * Chart quality (DPI)
   */
  chartDPI?: number

  /**
   * Lazy load dependencies
   */
  lazyLoad?: boolean
}

// ============================================================================
// Template Types
// ============================================================================

export interface PDFTemplate {
  /**
   * Document definition for pdfmake
   */
  getDocumentDefinition(): TDocumentDefinitions

  /**
   * Render header
   */
  renderHeader(): Content

  /**
   * Render footer
   */
  renderFooter(currentPage: number, pageCount: number): Content

  /**
   * Render body content
   */
  renderBody(): Content
}

// ============================================================================
// Color Palette (CONSAR Brand Colors)
// ============================================================================

export const CONSARColors = {
  // Primary
  primary: '#1e40af', // CONSAR Blue
  primaryLight: '#3b82f6',
  primaryDark: '#1e3a8a',

  // Status
  success: '#059669', // Green
  warning: '#D97706', // Orange
  error: '#DC2626', // Red
  critical: '#991B1B', // Dark Red

  // Neutral
  text: '#1f2937',
  textLight: '#6b7280',
  background: '#f9fafb',
  border: '#e5e7eb',

  // Charts
  chart1: '#3b82f6', // Blue
  chart2: '#10b981', // Green
  chart3: '#f59e0b', // Amber
  chart4: '#ef4444', // Red
  chart5: '#8b5cf6', // Purple
  chart6: '#06b6d4', // Cyan
} as const

// ============================================================================
// Typography
// ============================================================================

export const PDFTypography = {
  // Font sizes
  fontSize: {
    title: 24,
    subtitle: 18,
    heading1: 16,
    heading2: 14,
    heading3: 12,
    body: 10,
    small: 8,
  },

  // Font weights
  fontWeight: {
    normal: 'normal' as const,
    bold: 'bold' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
} as const

// ============================================================================
// Helper Types
// ============================================================================

export type Severity = 'critical' | 'error' | 'warning' | 'info'

export type ComplianceStatus = 'compliant' | 'non-compliant' | 'partial'

export type TrendDirection = 'increasing' | 'decreasing' | 'stable'

export type Impact = 'high' | 'medium' | 'low'
