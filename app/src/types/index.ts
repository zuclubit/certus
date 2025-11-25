/**
 * Type definitions for the application
 */

import type {
  ValidationStatus,
  FileType,
  ErrorSeverity,
  UserRole,
  ReportType,
  ReportFormat,
} from '@/lib/constants'

// User types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId: string
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
  lastLogin?: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  department?: string
  position?: string
  employeeNumber?: string
  isEmailVerified: boolean
  isMfaEnabled: boolean
  sessionCount: number

  // Suspension fields (CONSAR compliance)
  suspensionReason?: string
  suspendedAt?: string
  suspendedBy?: string

  // Inactive fields
  inactiveReason?: string
  inactiveSince?: string

  // Pending invitation fields
  invitedBy?: string
  invitedAt?: string
}

export interface Tenant {
  id: string
  name: string
  logo?: string
  afore: string
  settings: TenantSettings
}

export interface TenantSettings {
  notifications: {
    email: boolean
    sms: boolean
    inApp: boolean
  }
  timezone: string
  language: string
}

// Validation types
export interface Validation {
  id: string
  fileName: string
  fileType: FileType
  fileSize: number
  status: ValidationStatus
  uploadedBy: string
  uploadedAt: string
  processedAt?: string
  validatedAt?: string
  errorCount: number
  warningCount: number
  recordCount: number
  validRecordCount: number
  progress?: number

  // Versioning fields (CONSAR compliance)
  version?: number
  isOriginal?: boolean
  isSubstitute?: boolean
  replacesId?: string
  replacedById?: string
  substitutionReason?: string
  supersededAt?: string
  supersededBy?: string

  // CONSAR metadata
  consarDirectory?: 'RECEPCION' | 'RETRANSMISION'
  requiresAuthorization?: boolean
  authorizationStatus?: 'pending' | 'approved' | 'rejected'
  authorizationDate?: string
  authorizationOffice?: string
}

export interface ValidationDetail extends Validation {
  errors: ValidationError[]
  warnings: ValidationWarning[]
  validators: ValidatorResult[]
  timeline: TimelineEvent[]
  auditLog: AuditLogEntry[]
}

export interface ValidationError {
  id: string
  validatorCode: string
  validatorName: string
  severity: ErrorSeverity
  message: string
  description: string
  suggestion: string
  line: number
  column: number
  field: string
  value: string
  expectedValue?: string
  reference?: string
}

export interface ValidationWarning {
  id: string
  validatorCode: string
  message: string
  line: number
  column: number
}

export interface ValidatorResult {
  code: string
  name: string
  group: string
  status: 'passed' | 'failed' | 'warning' | 'pending' | 'running'
  duration: number
  errorCount: number
  warningCount: number
}

export interface TimelineEvent {
  id: string
  timestamp: string
  type: string
  message: string
  user?: string
  metadata?: Record<string, unknown>
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  details: string
  ipAddress?: string
}

// Report types
export interface Report {
  id: string
  name: string
  type: ReportType
  format: ReportFormat
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdBy: string
  createdAt: string
  completedAt?: string
  downloadUrl?: string
  filters: ReportFilters
}

export interface ReportFilters {
  dateFrom: string
  dateTo: string
  status?: ValidationStatus[]
  fileType?: FileType[]
  severity?: ErrorSeverity[]
}

// Catalog types
export interface Catalog {
  id: string
  name: string
  code: string
  description: string
  version: string
  entryCount: number
  lastUpdatedAt: string
  lastUpdatedBy: string
}

export interface CatalogEntry {
  id: string
  code: string
  description: string
  status: 'active' | 'inactive'
  metadata?: Record<string, string>
}

// Dashboard types
export interface DashboardMetrics {
  totalValidations: {
    value: number
    change: number
    period: string
  }
  successRate: {
    value: number
    change: number
    period: string
  }
  errorCount: {
    value: number
    change: number
    period: string
  }
  avgProcessingTime: {
    value: number // in seconds
    change: number
    period: string
  }
}

export interface TrendDataPoint {
  date: string
  exitosas: number
  errores: number
  advertencias: number
}

export interface ErrorDistribution {
  type: string
  count: number
  percentage: number
}

export interface RecentActivity {
  id: string
  fileName: string
  status: ValidationStatus
  timestamp: string
  errorCount?: number
  warningCount?: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

export interface FileUploadForm {
  files: File[]
  fileType: FileType
}

export interface ReportGeneratorForm {
  name: string
  type: ReportType
  format: ReportFormat
  dateFrom: string
  dateTo: string
  status: ValidationStatus[]
  fileType: FileType[]
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  error?: string
  statusCode: number
  timestamp: string
}

// Re-export approval workflow types
export * from './approval.types'

// Re-export validator types
export * from './validator.types'
