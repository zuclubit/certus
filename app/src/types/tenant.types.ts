/**
 * Tenant Types - AFORE Management
 *
 * Defines all types for the multi-tenant AFORE management system.
 * Aligned with Certus API v1 TenantsController.
 *
 * @version 1.0.0
 * @compliance CONSAR 2025
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * User roles within the system
 * Matches backend UserRole enum
 */
export type TenantUserRole =
  | 'SystemAdmin'
  | 'AforeAdmin'
  | 'AforeAnalyst'
  | 'Supervisor'
  | 'Auditor'
  | 'Viewer'

/**
 * User status
 */
export type TenantUserStatus = 'Active' | 'Pending' | 'Suspended' | 'Inactive'

// ============================================================================
// TENANT ENTITY
// ============================================================================

/**
 * Tenant/AFORE entity
 * Represents an AFORE organization in the system
 */
export interface TenantEntity {
  id: string
  name: string
  aforeCode: string
  logo?: string
  isActive: boolean
  settings: string // JSON string
  userCount: number
  validationCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Parsed tenant settings
 */
export interface TenantSettings {
  notifications?: {
    email: boolean
    sms: boolean
    inApp: boolean
  }
  timezone?: string
  language?: string
  theme?: 'light' | 'dark' | 'system'
  features?: {
    enableMfa: boolean
    enableAuditExport: boolean
    enableApiAccess: boolean
  }
}

/**
 * Tenant with parsed settings
 */
export interface TenantWithSettings extends Omit<TenantEntity, 'settings'> {
  settings: TenantSettings
}

// ============================================================================
// TENANT USER ENTITY
// ============================================================================

/**
 * User belonging to a tenant
 */
export interface TenantUserEntity {
  id: string
  email: string
  name: string
  role: TenantUserRole
  status: TenantUserStatus
  department?: string
  position?: string
  lastLogin?: string
  createdAt: string
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Create tenant request
 */
export interface CreateTenantRequest {
  name: string
  aforeCode: string
  logo?: string
  settings?: string
}

/**
 * Update tenant request
 */
export interface UpdateTenantRequest {
  name?: string
  logo?: string
  settings?: string
}

/**
 * Invite user request
 */
export interface InviteUserRequest {
  email: string
  name: string
  role: TenantUserRole
}

/**
 * Change user role request
 */
export interface ChangeUserRoleRequest {
  role: TenantUserRole
}

/**
 * Suspend user request
 */
export interface SuspendUserRequest {
  reason: string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PagedTenantResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Tenant statistics
 */
export interface TenantsStatistics {
  totalTenants: number
  activeTenants: number
  inactiveTenants: number
  totalUsers: number
  activeUsers: number
  totalValidations: number
  topTenants: TenantStatItem[]
}

/**
 * Individual tenant stat item
 */
export interface TenantStatItem {
  id: string
  name: string
  aforeCode: string
  userCount: number
  activeUserCount: number
  validationCount: number
  lastValidationAt?: string
}

// ============================================================================
// FILTER/QUERY TYPES
// ============================================================================

/**
 * Tenant list query params
 */
export interface TenantListParams {
  search?: string
  isActive?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'code' | 'createdAt' | 'isActive'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Tenant users query params
 */
export interface TenantUsersParams {
  search?: string
  role?: TenantUserRole
  status?: TenantUserStatus
  page?: number
  pageSize?: number
}

// ============================================================================
// FORM TYPES
// ============================================================================

/**
 * Create tenant form data
 */
export interface CreateTenantFormData {
  name: string
  aforeCode: string
  logo?: string
  timezone: string
  language: string
  enableMfa: boolean
  emailNotifications: boolean
  inAppNotifications: boolean
}

/**
 * Edit tenant form data
 */
export interface EditTenantFormData {
  name: string
  logo?: string
  timezone: string
  language: string
  enableMfa: boolean
  emailNotifications: boolean
  inAppNotifications: boolean
}

/**
 * Invite user form data
 */
export interface InviteUserFormData {
  email: string
  name: string
  role: TenantUserRole
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Tenant card actions
 */
export type TenantCardAction =
  | 'view'
  | 'edit'
  | 'activate'
  | 'deactivate'
  | 'viewUsers'
  | 'invite'

/**
 * User card actions in tenant context
 */
export type TenantUserAction =
  | 'changeRole'
  | 'suspend'
  | 'reactivate'
  | 'resendInvite'
  | 'remove'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse tenant settings from JSON string
 */
export function parseTenantSettings(settingsJson: string): TenantSettings {
  try {
    return JSON.parse(settingsJson) as TenantSettings
  } catch {
    return {}
  }
}

/**
 * Stringify tenant settings to JSON
 */
export function stringifyTenantSettings(settings: TenantSettings): string {
  return JSON.stringify(settings)
}

/**
 * Convert form data to create request
 */
export function formDataToCreateRequest(data: CreateTenantFormData): CreateTenantRequest {
  const settings: TenantSettings = {
    timezone: data.timezone,
    language: data.language,
    features: {
      enableMfa: data.enableMfa,
      enableAuditExport: true,
      enableApiAccess: true,
    },
    notifications: {
      email: data.emailNotifications,
      sms: false,
      inApp: data.inAppNotifications,
    },
  }

  return {
    name: data.name,
    aforeCode: data.aforeCode,
    logo: data.logo,
    settings: stringifyTenantSettings(settings),
  }
}

/**
 * Convert form data to update request
 */
export function formDataToUpdateRequest(data: EditTenantFormData): UpdateTenantRequest {
  const settings: TenantSettings = {
    timezone: data.timezone,
    language: data.language,
    features: {
      enableMfa: data.enableMfa,
      enableAuditExport: true,
      enableApiAccess: true,
    },
    notifications: {
      email: data.emailNotifications,
      sms: false,
      inApp: data.inAppNotifications,
    },
  }

  return {
    name: data.name,
    logo: data.logo,
    settings: stringifyTenantSettings(settings),
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: TenantUserRole): string {
  const roleNames: Record<TenantUserRole, string> = {
    SystemAdmin: 'Administrador del Sistema',
    AforeAdmin: 'Administrador AFORE',
    AforeAnalyst: 'Analista',
    Supervisor: 'Supervisor',
    Auditor: 'Auditor',
    Viewer: 'Visualizador',
  }
  return roleNames[role] || role
}

/**
 * Get status display name
 */
export function getStatusDisplayName(status: TenantUserStatus): string {
  const statusNames: Record<TenantUserStatus, string> = {
    Active: 'Activo',
    Pending: 'Pendiente',
    Suspended: 'Suspendido',
    Inactive: 'Inactivo',
  }
  return statusNames[status] || status
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: TenantUserRole): string {
  const colors: Record<TenantUserRole, string> = {
    SystemAdmin: 'bg-red-500/20 text-red-400 border-red-500/30',
    AforeAdmin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    AforeAnalyst: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Supervisor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Auditor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Viewer: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  }
  return colors[role] || 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
}

/**
 * Get status badge color
 */
export function getStatusBadgeColor(status: TenantUserStatus): string {
  const colors: Record<TenantUserStatus, string> = {
    Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    Inactive: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  }
  return colors[status] || 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
}
