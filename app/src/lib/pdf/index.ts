/**
 * PDF Generation System
 *
 * Main exports for PDF report generation
 */

// Generator Service
export { PDFGeneratorService, getPDFGenerator } from './generators/pdf-generator.service'

// Templates
export { BaseTemplate } from './templates/base.template'
export { ValidationTemplate } from './templates/validation.template'
export { ErrorTemplate } from './templates/error.template'

// Charts
export {
  ErrorsByTypeChart,
  ErrorsByFieldChart,
  ValidationOverviewChart,
  ErrorSeverityChart,
} from './charts/ValidationCharts'

// Utils
export {
  chartToImage,
  rechartsToImage,
  chartsToImages,
  waitForChartRender,
  getPDFImageOptions,
  getPreviewImageOptions,
  downloadImage,
} from './utils/chart-to-image'

export {
  buildValidationReportData,
  buildErrorReportData,
} from './utils/report-builder'

// Hooks
export { usePDFGenerator } from './hooks/usePDFGenerator'

// Types
export type {
  ReportType,
  ReportFormat,
  ReportMetadata,
  ValidationReportData,
  ErrorReportData,
  ExecutiveSummaryData,
  ComparisonReportData,
  PDFGenerationOptions,
  PDFTemplate,
  ChartData,
  PieChartData,
  BarChartData,
  LineChartData,
  Severity,
  ComplianceStatus,
  TrendDirection,
  Impact,
} from './types'

export { CONSARColors, PDFTypography } from './types'
