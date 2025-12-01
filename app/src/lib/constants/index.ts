/**
 * Constantes globales del sistema
 */

// Validation statuses
export const VALIDATION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
} as const

export type ValidationStatus =
  (typeof VALIDATION_STATUS)[keyof typeof VALIDATION_STATUS]

// File types
export const FILE_TYPES = {
  NOMINA: 'NOMINA',
  CONTABLE: 'CONTABLE',
  REGULARIZACION: 'REGULARIZACION',
} as const

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES]

// Error severity levels
export const ERROR_SEVERITY = {
  INFO: 'info',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export type ErrorSeverity = (typeof ERROR_SEVERITY)[keyof typeof ERROR_SEVERITY]

// User roles - must match backend enum values
export const USER_ROLES = {
  SYSTEM_ADMIN: 'SystemAdmin',
  AFORE_ADMIN: 'AforeAdmin',
  AFORE_ANALYST: 'AforeAnalyst',
  SUPERVISOR: 'Supervisor',
  AUDITOR: 'Auditor',
  VIEWER: 'Viewer',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Permissions by role
export const PERMISSIONS = {
  [USER_ROLES.SYSTEM_ADMIN]: {
    validations: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete', 'download'],
    catalogs: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    tenants: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
  },
  [USER_ROLES.AFORE_ADMIN]: {
    validations: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'download'],
    catalogs: ['read'],
    users: ['create', 'read', 'update', 'delete'],
    tenants: [],
    settings: ['read', 'update'],
  },
  [USER_ROLES.AFORE_ANALYST]: {
    validations: ['create', 'read'],
    reports: ['read', 'download'],
    catalogs: ['read'],
    users: [],
    tenants: [],
    settings: ['read'],
  },
  [USER_ROLES.SUPERVISOR]: {
    validations: ['read', 'update'],
    reports: ['read', 'download'],
    catalogs: ['read'],
    users: ['read'],
    tenants: [],
    settings: ['read'],
  },
  [USER_ROLES.AUDITOR]: {
    validations: ['read'],
    reports: ['read', 'download'],
    catalogs: ['read'],
    users: ['read'],
    tenants: [],
    settings: ['read'],
  },
  [USER_ROLES.VIEWER]: {
    validations: ['read'],
    reports: ['read'],
    catalogs: ['read'],
    users: [],
    tenants: [],
    settings: ['read'],
  },
} as const

// Report types
export const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
} as const

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES]

// Report formats
export const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
  JSON: 'json',
} as const

export type ReportFormat = (typeof REPORT_FORMATS)[keyof typeof REPORT_FORMATS]

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB in bytes
  MAX_FILES: 10,
  ACCEPTED_TYPES: ['.txt', '.xml'],
  ACCEPTED_MIME_TYPES: ['text/plain', 'application/xml', 'text/xml'],
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200],
} as const

// Validation groups (37 validators)
export const VALIDATOR_GROUPS = {
  ESTRUCTURA: { start: 1, end: 5, name: 'Estructura' },
  CATALOGOS: { start: 6, end: 10, name: 'Catálogos' },
  RANGOS: { start: 11, end: 15, name: 'Rangos' },
  CALCULOS: { start: 16, end: 20, name: 'Cálculos' },
  CRUCE: { start: 21, end: 25, name: 'Cruce' },
  NEGOCIO: { start: 26, end: 30, name: 'Negocio' },
  REGULATORIO: { start: 31, end: 37, name: 'Regulatorio' },
} as const

// Date formats
export const DATE_FORMATS = {
  FULL: 'dd/MM/yyyy HH:mm:ss',
  SHORT: 'dd/MM/yyyy',
  TIME: 'HH:mm',
  DATETIME: 'dd/MM/yyyy HH:mm',
  MONTH_YEAR: 'MMMM yyyy',
} as const

// API endpoints - Certus API v1
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    LOGOUT: '/v1/auth/logout',
    REFRESH: '/v1/auth/refresh',
    REGISTER: '/v1/auth/register',
    TENANTS: '/v1/auth/tenants',
    ME: '/v1/auth/me',
  },
  DASHBOARD: {
    STATISTICS: '/v1/dashboard/statistics',
    RECENT_VALIDATIONS: '/v1/dashboard/recent-validations',
    ACTIVITY: '/v1/dashboard/activity',
    ALERTS: '/v1/dashboard/alerts',
    TRENDS: '/v1/dashboard/trends',
    PERFORMANCE: '/v1/dashboard/performance',
  },
  VALIDATIONS: {
    LIST: '/v1/validations',
    DETAIL: (id: string) => `/v1/validations/${id}`,
    UPLOAD: '/v1/validations',
    STATISTICS: '/v1/validations/statistics',
    RECENT: '/v1/validations/recent',
    ERRORS: (id: string) => `/v1/validations/${id}/errors`,
    RETRY: (id: string) => `/v1/validations/${id}/retry`,
    CANCEL: (id: string) => `/v1/validations/${id}/cancel`,
    SUBSTITUTE: (id: string) => `/v1/validations/${id}/substitute`,
  },
  APPROVALS: {
    LIST: '/v1/approvals',
    DETAIL: (id: string) => `/v1/approvals/${id}`,
    STATISTICS: '/v1/approvals/statistics',
    APPROVE: (id: string) => `/v1/approvals/${id}/approve`,
    REJECT: (id: string) => `/v1/approvals/${id}/reject`,
    ESCALATE: (id: string) => `/v1/approvals/${id}/escalate`,
    ASSIGN: (id: string) => `/v1/approvals/${id}/assign`,
    COMMENTS: (id: string) => `/v1/approvals/${id}/comments`,
    REQUEST_INFO: (id: string) => `/v1/approvals/${id}/request-info`,
  },
  CATALOGS: {
    LIST: '/v1/catalogs',
    DETAIL: (id: string) => `/v1/catalogs/${id}`,
    CREATE: '/v1/catalogs',
    DELETE: (id: string) => `/v1/catalogs/${id}`,
    BY_CODE: (code: string) => `/v1/catalogs/code/${code}`,
    BY_SOURCE: (source: string) => `/v1/catalogs/source/${source}`,
    ENTRIES: (catalogId: string) => `/v1/catalogs/${catalogId}/entries`,
    SEARCH_ENTRIES: (catalogId: string) => `/v1/catalogs/${catalogId}/entries/search`,
  },
  VALIDATORS: {
    LIST: '/v1/validators',
    DETAIL: (id: string) => `/v1/validators/${id}`,
    DELETE: (id: string) => `/v1/validators/${id}`,
    DUPLICATE: (id: string) => `/v1/validators/${id}/duplicate`,
    GROUPS: '/v1/validators/groups',
    BY_FILE_TYPE: (fileType: string) => `/v1/validators/file-type/${fileType}`,
    TOGGLE: (id: string) => `/v1/validators/${id}/toggle`,
    UPDATE_CONFIG: (id: string) => `/v1/validators/${id}/config`,
    EXECUTE: '/v1/validators/execute',
    METRICS: '/v1/validators/metrics',
    PRESETS: '/v1/validators/presets',
  },
  AUDIT_LOG: {
    LIST: '/v1/auditlog',
    STATISTICS: '/v1/auditlog/statistics',
    ACTIONS: '/v1/auditlog/actions',
    BY_ENTITY: (entityType: string, entityId: string) => `/v1/auditlog/entity/${entityType}/${entityId}`,
  },
  EXPORTS: {
    LIST: '/v1/reports',
    DETAIL: (id: string) => `/v1/reports/${id}`,
    VALIDATION_PDF: (id: string) => `/v1/exports/validations/${id}/pdf`,
    VALIDATION_EXCEL: (id: string) => `/v1/exports/validations/${id}/excel`,
    VALIDATION_CSV: (id: string) => `/v1/exports/validations/${id}/csv`,
    VALIDATION_JSON: (id: string) => `/v1/exports/validations/${id}/json`,
    PERIOD_REPORT: '/v1/exports/reports/period',
    COMPLIANCE_REPORT: '/v1/exports/reports/compliance',
  },
  USERS: {
    LIST: '/v1/users',
    DETAIL: (id: string) => `/v1/users/${id}`,
    CREATE: '/v1/users',
    UPDATE: (id: string) => `/v1/users/${id}`,
    DELETE: (id: string) => `/v1/users/${id}`,
  },
  TENANTS: {
    LIST: '/v1/tenants',
    DETAIL: (id: string) => `/v1/tenants/${id}`,
    CREATE: '/v1/tenants',
    UPDATE: (id: string) => `/v1/tenants/${id}`,
    DELETE: (id: string) => `/v1/tenants/${id}`,
    ACTIVATE: (id: string) => `/v1/tenants/${id}/activate`,
    USERS: (id: string) => `/v1/tenants/${id}/users`,
    INVITE_USER: (id: string) => `/v1/tenants/${id}/users/invite`,
    CHANGE_ROLE: (id: string, userId: string) => `/v1/tenants/${id}/users/${userId}/role`,
    SUSPEND_USER: (id: string, userId: string) => `/v1/tenants/${id}/users/${userId}/suspend`,
    REACTIVATE_USER: (id: string, userId: string) => `/v1/tenants/${id}/users/${userId}/reactivate`,
    STATISTICS: '/v1/tenants/statistics',
  },
  SETTINGS: {
    PROFILE: '/v1/settings/profile',
    AFORE: '/v1/settings/afore',
    NOTIFICATIONS: '/v1/settings/notifications',
    SECURITY: '/v1/settings/security',
  },
  NORMATIVE_CHANGES: {
    LIST: '/v1/normativechanges',
    DETAIL: (id: string) => `/v1/normativechanges/${id}`,
    STATISTICS: '/v1/normativechanges/statistics',
    APPLY: (id: string) => `/v1/normativechanges/${id}/apply`,
    ARCHIVE: (id: string) => `/v1/normativechanges/${id}/archive`,
  },
  SCRAPERS: {
    SOURCES: '/v1/scrapers/sources',
    SOURCE_DETAIL: (id: string) => `/v1/scrapers/sources/${id}`,
    EXECUTE: (sourceId: string) => `/v1/scrapers/sources/${sourceId}/execute`,
    EXECUTE_ALL: '/v1/scrapers/execute-all',
    TOGGLE: (id: string) => `/v1/scrapers/sources/${id}/toggle`,
    EXECUTIONS: '/v1/scrapers/executions',
    EXECUTION_DETAIL: (id: string) => `/v1/scrapers/executions/${id}`,
    CANCEL_EXECUTION: (id: string) => `/v1/scrapers/executions/${id}/cancel`,
    DOCUMENTS: '/v1/scrapers/documents',
    DOCUMENT_DETAIL: (id: string) => `/v1/scrapers/documents/${id}`,
    PROCESS_DOCUMENT: (id: string) => `/v1/scrapers/documents/${id}/process`,
    PROCESS_ALL_DOCUMENTS: '/v1/scrapers/documents/process-all',
    IGNORE_DOCUMENT: (id: string) => `/v1/scrapers/documents/${id}/ignore`,
    STATISTICS: '/v1/scrapers/statistics',
  },
  REFERENCE_DATA: {
    HEALTH: '/v1/reference-data/health',
    AFORES: '/v1/reference-data/afores',
    VALIDATE_AFORE: (key: string) => `/v1/reference-data/afores/validate/${key}`,
    SIEFORES: '/v1/reference-data/siefores',
    VALIDATE_SIEFORE: (key: string) => `/v1/reference-data/siefores/validate/${key}`,
    UDI: '/v1/reference-data/udi',
    EXCHANGE_RATE_FIX: '/v1/reference-data/exchange-rate/fix',
    EXCHANGE_RATE_RANGE: '/v1/reference-data/exchange-rate/range',
    LEI: (lei: string) => `/v1/reference-data/lei/${lei}`,
    LEI_SEARCH: '/v1/reference-data/lei/search',
    ISIN: (isin: string) => `/v1/reference-data/isin/${isin}`,
    CUSIP: (cusip: string) => `/v1/reference-data/cusip/${cusip}`,
    FIGI_MAP: '/v1/reference-data/figi/map',
    VALMER_PRICE: '/v1/reference-data/valmer/price',
    VALMER_VECTOR: '/v1/reference-data/valmer/vector',
    VALMER_YIELD_CURVE: '/v1/reference-data/valmer/yield-curve',
    ACTUARIAL_FACTORS: '/v1/reference-data/actuarial/factors',
    ACTUARIAL_MORTALITY: '/v1/reference-data/actuarial/mortality',
  },
  COMPLIANCE: {
    DASHBOARD: '/v1/compliance/dashboard',
    FRAMEWORKS: '/v1/compliance/frameworks',
    FRAMEWORK_DETAIL: (id: string) => `/v1/compliance/frameworks/${id}`,
    FRAMEWORK_BY_CODE: (code: string) => `/v1/compliance/frameworks/code/${code}`,
    FRAMEWORK_CONTROLS: (frameworkId: string) => `/v1/compliance/frameworks/${frameworkId}/controls`,
    CONTROLS: '/v1/compliance/controls',
    CONTROL_DETAIL: (id: string) => `/v1/compliance/controls/${id}`,
    CONTROL_STATUS: (id: string) => `/v1/compliance/controls/${id}/status`,
    CONTROL_EVIDENCE: (controlId: string) => `/v1/compliance/controls/${controlId}/evidence`,
    EVIDENCE: '/v1/compliance/evidence',
    EVIDENCE_DETAIL: (id: string) => `/v1/compliance/evidence/${id}`,
    EVIDENCE_STATUS: (id: string) => `/v1/compliance/evidence/${id}/status`,
    RISKS: '/v1/compliance/risks',
    RISK_DETAIL: (id: string) => `/v1/compliance/risks/${id}`,
    RISK_STATUS: (id: string) => `/v1/compliance/risks/${id}/status`,
    RISK_METRICS: '/v1/compliance/risks/metrics',
    AUDITS: '/v1/compliance/audits',
    AUDIT_DETAIL: (id: string) => `/v1/compliance/audits/${id}`,
    AUDIT_FINDINGS: (auditId: string) => `/v1/compliance/audits/${auditId}/findings`,
    TASKS: '/v1/compliance/tasks',
    TASK_DETAIL: (id: string) => `/v1/compliance/tasks/${id}`,
    TASK_STATUS: (id: string) => `/v1/compliance/tasks/${id}/status`,
    TASK_CHECKLIST: (id: string, itemId: string) => `/v1/compliance/tasks/${id}/checklist/${itemId}`,
    TASK_METRICS: '/v1/compliance/tasks/metrics',
    POLICIES: '/v1/compliance/policies',
    POLICY_DETAIL: (id: string) => `/v1/compliance/policies/${id}`,
  },
} as const

// SignalR Hub events
export const SIGNALR_EVENTS = {
  VALIDATION_STARTED: 'ValidationStarted',
  VALIDATION_PROGRESS: 'ValidationProgress',
  VALIDATION_COMPLETED: 'ValidationCompleted',
  VALIDATION_FAILED: 'ValidationFailed',
  NOTIFICATION: 'Notification',
} as const

// Scraper SignalR Hub events
export const SCRAPER_SIGNALR_EVENTS = {
  EXECUTION_STARTED: 'ExecutionStarted',
  EXECUTION_PROGRESS: 'ExecutionProgress',
  EXECUTION_COMPLETED: 'ExecutionCompleted',
  EXECUTION_FAILED: 'ExecutionFailed',
  DOCUMENT_FOUND: 'DocumentFound',
  EXECUTION_LOG: 'ExecutionLog',
  SCRAPER_UPDATE: 'ScraperUpdate',
} as const

// SignalR Hub URLs
export const SIGNALR_HUBS = {
  VALIDATION: '/hubs/validation',
  SCRAPERS: '/hubs/scrapers',
} as const

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  TENANT: 'tenant',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const

// Query keys for React Query
export const QUERY_KEYS = {
  USER: ['user'],
  USERS: ['users'],
  USER_DETAIL: ['user', 'detail'],
  USER_AUDIT: ['user', 'audit'],
  VALIDATIONS: ['validations'],
  VALIDATION_DETAIL: (id: string) => ['validation', id],
  REPORTS: ['reports'],
  CATALOGS: ['catalogs'],
  CATALOG_ENTRIES: (catalogId: string) => ['catalog', catalogId, 'entries'],
  SETTINGS: ['settings'],
  TENANTS: ['tenants'],
  APPROVALS: ['approvals'],
  VALIDATORS: ['validators'],
  NORMATIVE_CHANGES: ['normativeChanges'],
  NORMATIVE_CHANGE_DETAIL: (id: string) => ['normativeChange', id],
  NORMATIVE_STATISTICS: ['normativeChanges', 'statistics'],
} as const

// Navigation items
export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    requiredPermission: null,
  },
  {
    id: 'validations',
    label: 'Validaciones',
    path: '/validations',
    icon: 'FileCheck',
    requiredPermission: 'validations',
  },
  {
    id: 'reports',
    label: 'Reportes',
    path: '/reports',
    icon: 'FileText',
    requiredPermission: 'reports',
  },
  {
    id: 'catalogs',
    label: 'Catálogos',
    path: '/catalogs',
    icon: 'Database',
    requiredPermission: 'catalogs',
  },
  {
    id: 'approvals',
    label: 'Aprobaciones',
    path: '/approvals',
    icon: 'CheckCircle2',
    requiredPermission: 'validations',
  },
  {
    id: 'validators',
    label: 'Validadores',
    path: '/validators',
    icon: 'Settings',
    requiredPermission: 'settings',
  },
  {
    id: 'users',
    label: 'Usuarios',
    path: '/users',
    icon: 'Users',
    requiredPermission: 'users',
  },
  {
    id: 'tenants',
    label: 'AFOREs',
    path: '/tenants',
    icon: 'Building2',
    requiredPermission: 'tenants',
  },
  {
    id: 'scrapers',
    label: 'Scrapers',
    path: '/scrapers',
    icon: 'Bot',
    requiredPermission: 'settings',
  },
  {
    id: 'compliance',
    label: 'Cumplimiento',
    path: '/compliance',
    icon: 'Shield',
    requiredPermission: 'settings',
  },
] as const
