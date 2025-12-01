/**
 * Services Index
 *
 * Central export for all API service adapters
 */

// Validation Service
export { ValidationService } from './validation.adapter'

// Approval Service
export { ApprovalService } from './approval.adapter'
export type { ApprovalListParams, ApprovalStatistics } from './approval.adapter'

// Validator Service
export { ValidatorService } from './validator.adapter'
export type { ValidatorListParams } from './validator.adapter'

// Export/Reports Service
export { ExportService } from './export.adapter'
export type {
  ReportListParams,
  ReportStatistics,
  GenerateReportRequest,
  ExportOptions,
  PeriodReportRequest,
  ComplianceReportRequest,
  ExportResult,
} from './export.adapter'

// Settings Service
export { SettingsService } from './settings.adapter'
export type {
  UserProfile,
  AforeSettings,
  NotificationSettings,
  SecuritySettings,
  TrustedDevice,
  LoginHistoryEntry,
  UpdateProfileRequest,
  UpdatePasswordRequest,
} from './settings.adapter'

// Re-export raw API services for direct access when needed
export * from './api'
