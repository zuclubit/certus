/**
 * API Services - Index
 *
 * Central export for all real API services
 * Use this module to import services that connect to Certus API v1
 */

// Auth Service
export { AuthService } from './auth.service'
export type { LoginCredentials, LoginResponse, RefreshTokenResponse } from './auth.service'

// Dashboard Service
export { DashboardService } from './dashboard.service'
export type {
  DashboardStatistics,
  DashboardActivity,
  DashboardAlert,
  DashboardTrends,
  DashboardPerformance,
  RecentValidation,
  FileTypeStatistics,
  TrendDataPointBackend,
  PeriodInfo,
  ValidatorPerformance,
} from './dashboard.service'

// Validation Service
export { ValidationServiceReal } from './validation.service'
export type {
  ValidationFilters,
  ValidationStatistics,
  SubstituteFileRequest,
} from './validation.service'

// Catalog Service
export { CatalogService } from './catalog.service'
export type { CatalogFilters, CatalogEntryFilters, CatalogSource } from './catalog.service'

// Approval Service
export { ApprovalServiceReal } from './approval.service'
export type {
  ApprovalListParams,
  ApprovalStatistics,
  ApprovalActionRequest,
} from './approval.service'

// Validator Service
export { ValidatorService } from './validator.service'
export type {
  ValidatorListParams,
  ValidatorGroupSummary,
  ValidatorConfig,
  ValidatorExecutionResult,
  ValidatorMetrics,
  ValidatorPreset,
} from './validator.service'

// Audit Log Service
export { AuditLogService } from './audit-log.service'
export type {
  AuditLogFilters,
  AuditLogStatistics,
  AuditAction,
  AuditLogDetail,
} from './audit-log.service'

// Export Service
export { ExportService } from './export.service'
export type {
  ExportOptions,
  PeriodReportRequest,
  ComplianceReportRequest,
  ExportResult,
} from './export.service'

// User Service
export { UserService } from './user.service'
export type {
  UserListParams,
  CreateUserRequest,
  UpdateUserRequest,
  UserProfile,
  NotificationSettings,
  SecuritySettings,
} from './user.service'

// Tenant Service (AFORE Management)
export { TenantService } from './tenant.service'
export type {
  Tenant,
  TenantUser,
  CreateTenantRequest,
  UpdateTenantRequest,
  InviteUserRequest,
  ChangeRoleRequest,
  SuspendUserRequest,
  TenantsStatistics,
  TenantStat,
  TenantListParams,
  TenantUsersParams,
} from './tenant.service'

// Scraper Service
export { ScraperService } from './scraper.service'
export type {
  ScraperSource,
  ScraperExecution,
  ScrapedDocument,
  ScraperStatistics,
  ScraperSourceType,
  ScraperExecutionStatus,
  ScrapedDocumentStatus,
  ScraperFrequency,
  CreateScraperSourceRequest,
  UpdateScraperSourceRequest,
  ProcessDocumentRequest,
  ExecuteSourceResponse,
  ExecuteAllResponse,
  ProcessAllDocumentsResponse,
} from './scraper.service'

// Normative Changes Service
export { NormativeService } from './normative.service'
export type {
  NormativeChange,
  NormativeStatistics,
  NormativeFilters,
  NormativeStatus,
  NormativePriority,
  CreateNormativeChangeRequest,
} from './normative.service'

// Reference Data Service (CONSAR/Financial data)
export { ReferenceDataService } from './reference-data.service'
export type {
  AforeInfo,
  AforeValidationResult,
  SieforeInfo,
  SieforeValidationResult,
  UdiValue,
  ExchangeRateResult,
  ExchangeRateRangeResult,
  LeiRecord,
  LeiValidationResult,
  IsinValidationResult,
  CusipValidationResult,
  FigiMappingRequest,
  FigiMappingResult,
  ValmerPrice,
  ValmerVector,
  ValmerYieldCurve,
  ActuarialFactors,
  MortalityRate,
  ReferenceDataHealthStatus,
} from './reference-data.service'

