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

// User roles
export const USER_ROLES = {
  AFORE_ADMIN: 'AFORE_ADMIN',
  AFORE_ANALYST: 'AFORE_ANALYST',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  AUDITOR: 'AUDITOR',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Permissions by role
export const PERMISSIONS = {
  [USER_ROLES.AFORE_ADMIN]: {
    validations: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'download'],
    catalogs: ['read'],
    users: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
  },
  [USER_ROLES.AFORE_ANALYST]: {
    validations: ['create', 'read'],
    reports: ['read', 'download'],
    catalogs: ['read'],
    users: [],
    settings: ['read'],
  },
  [USER_ROLES.SYSTEM_ADMIN]: {
    validations: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete', 'download'],
    catalogs: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
  },
  [USER_ROLES.AUDITOR]: {
    validations: ['read'],
    reports: ['read', 'download'],
    catalogs: ['read'],
    users: ['read'],
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

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  VALIDATIONS: {
    LIST: '/validations',
    DETAIL: (id: string) => `/validations/${id}`,
    UPLOAD: '/validations/upload',
    RETRY: (id: string) => `/validations/${id}/retry`,
    DOWNLOAD: (id: string) => `/validations/${id}/download`,
  },
  REPORTS: {
    LIST: '/reports',
    GENERATE: '/reports/generate',
    DOWNLOAD: (id: string) => `/reports/${id}/download`,
  },
  CATALOGS: {
    LIST: '/catalogs',
    DETAIL: (id: string) => `/catalogs/${id}`,
    ENTRIES: (catalogId: string) => `/catalogs/${catalogId}/entries`,
    IMPORT: (catalogId: string) => `/catalogs/${catalogId}/import`,
    EXPORT: (catalogId: string) => `/catalogs/${catalogId}/export`,
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  SETTINGS: {
    PROFILE: '/settings/profile',
    AFORE: '/settings/afore',
    NOTIFICATIONS: '/settings/notifications',
    SECURITY: '/settings/security',
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
  USERS: ['users'],
  SETTINGS: ['settings'],
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
] as const
