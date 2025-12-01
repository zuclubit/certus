/**
 * Tenant Service - Real API Implementation
 *
 * Handles AFORE/Tenant management operations against Certus API v1
 * Only accessible by SystemAdmin and AforeAdmin users
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { ApiResponse } from '@/types'

// ============================================
// TYPES
// ============================================

export interface Tenant {
  id: string
  name: string
  aforeCode: string
  logo?: string
  isActive: boolean
  settings: string
  userCount: number
  validationCount: number
  createdAt: string
  updatedAt: string
}

export interface TenantUser {
  id: string
  email: string
  name: string
  role: string
  status: string
  department?: string
  position?: string
  lastLogin?: string
  createdAt: string
}

export interface CreateTenantRequest {
  name: string
  aforeCode: string
  logo?: string
  settings?: string
}

export interface UpdateTenantRequest {
  name?: string
  logo?: string
  settings?: string
}

export interface InviteUserRequest {
  email: string
  name: string
  role: 'SystemAdmin' | 'AforeAdmin' | 'AforeAnalyst' | 'Supervisor' | 'Auditor' | 'Viewer'
}

export interface ChangeRoleRequest {
  role: 'SystemAdmin' | 'AforeAdmin' | 'AforeAnalyst' | 'Supervisor' | 'Auditor' | 'Viewer'
}

export interface SuspendUserRequest {
  reason: string
}

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface TenantsStatistics {
  totalTenants: number
  activeTenants: number
  inactiveTenants: number
  totalUsers: number
  activeUsers: number
  totalValidations: number
  topTenants: TenantStat[]
}

export interface TenantStat {
  id: string
  name: string
  aforeCode: string
  userCount: number
  activeUserCount: number
  validationCount: number
  lastValidationAt?: string
}

export interface TenantListParams {
  search?: string
  isActive?: boolean
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'code' | 'createdAt' | 'isActive'
  sortOrder?: 'asc' | 'desc'
}

export interface TenantUsersParams {
  search?: string
  role?: string
  status?: string
  page?: number
  pageSize?: number
}

// ============================================
// SERVICE
// ============================================

export class TenantService {
  /**
   * Get paginated list of all tenants (SystemAdmin only)
   */
  static async getTenants(params?: TenantListParams): Promise<ApiResponse<PagedResponse<Tenant>>> {
    const queryParams = new URLSearchParams()

    if (params?.search) queryParams.append('search', params.search)
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize))
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    const url = `${API_ENDPOINTS.TENANTS.LIST}?${queryParams.toString()}`
    const response = await apiClient.get<PagedResponse<Tenant>>(url)

    return {
      success: true,
      data: response.data,
      message: 'Tenants retrieved successfully',
    }
  }

  /**
   * Get tenant by ID
   */
  static async getTenant(id: string): Promise<ApiResponse<Tenant>> {
    const response = await apiClient.get<Tenant>(API_ENDPOINTS.TENANTS.DETAIL(id))

    return {
      success: true,
      data: response.data,
      message: 'Tenant retrieved successfully',
    }
  }

  /**
   * Create a new tenant/AFORE (SystemAdmin only)
   */
  static async createTenant(data: CreateTenantRequest): Promise<ApiResponse<Tenant>> {
    const response = await apiClient.post<Tenant>(API_ENDPOINTS.TENANTS.CREATE, data)

    return {
      success: true,
      data: response.data,
      message: 'Tenant created successfully',
    }
  }

  /**
   * Update an existing tenant
   */
  static async updateTenant(id: string, data: UpdateTenantRequest): Promise<ApiResponse<Tenant>> {
    const response = await apiClient.put<Tenant>(API_ENDPOINTS.TENANTS.UPDATE(id), data)

    return {
      success: true,
      data: response.data,
      message: 'Tenant updated successfully',
    }
  }

  /**
   * Deactivate a tenant (soft delete)
   */
  static async deactivateTenant(id: string): Promise<ApiResponse<void>> {
    await apiClient.delete(API_ENDPOINTS.TENANTS.DELETE(id))

    return {
      success: true,
      data: undefined,
      message: 'Tenant deactivated successfully',
    }
  }

  /**
   * Reactivate a deactivated tenant
   */
  static async activateTenant(id: string): Promise<ApiResponse<void>> {
    await apiClient.post(API_ENDPOINTS.TENANTS.ACTIVATE(id))

    return {
      success: true,
      data: undefined,
      message: 'Tenant activated successfully',
    }
  }

  /**
   * Get users belonging to a tenant
   */
  static async getTenantUsers(
    tenantId: string,
    params?: TenantUsersParams
  ): Promise<ApiResponse<PagedResponse<TenantUser>>> {
    const queryParams = new URLSearchParams()

    if (params?.search) queryParams.append('search', params.search)
    if (params?.role) queryParams.append('role', params.role)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', String(params.page))
    if (params?.pageSize) queryParams.append('pageSize', String(params.pageSize))

    const url = `${API_ENDPOINTS.TENANTS.USERS(tenantId)}?${queryParams.toString()}`
    const response = await apiClient.get<PagedResponse<TenantUser>>(url)

    return {
      success: true,
      data: response.data,
      message: 'Tenant users retrieved successfully',
    }
  }

  /**
   * Invite a new user to a tenant
   */
  static async inviteUser(
    tenantId: string,
    data: InviteUserRequest
  ): Promise<ApiResponse<TenantUser>> {
    const response = await apiClient.post<TenantUser>(
      API_ENDPOINTS.TENANTS.INVITE_USER(tenantId),
      data
    )

    return {
      success: true,
      data: response.data,
      message: 'User invited successfully',
    }
  }

  /**
   * Change a user's role within a tenant
   */
  static async changeUserRole(
    tenantId: string,
    userId: string,
    data: ChangeRoleRequest
  ): Promise<ApiResponse<void>> {
    await apiClient.patch(API_ENDPOINTS.TENANTS.CHANGE_ROLE(tenantId, userId), data)

    return {
      success: true,
      data: undefined,
      message: 'User role changed successfully',
    }
  }

  /**
   * Suspend a user
   */
  static async suspendUser(
    tenantId: string,
    userId: string,
    data: SuspendUserRequest
  ): Promise<ApiResponse<void>> {
    await apiClient.post(API_ENDPOINTS.TENANTS.SUSPEND_USER(tenantId, userId), data)

    return {
      success: true,
      data: undefined,
      message: 'User suspended successfully',
    }
  }

  /**
   * Reactivate a suspended user
   */
  static async reactivateUser(tenantId: string, userId: string): Promise<ApiResponse<void>> {
    await apiClient.post(API_ENDPOINTS.TENANTS.REACTIVATE_USER(tenantId, userId))

    return {
      success: true,
      data: undefined,
      message: 'User reactivated successfully',
    }
  }

  /**
   * Get tenants statistics (SystemAdmin only)
   */
  static async getStatistics(): Promise<ApiResponse<TenantsStatistics>> {
    const response = await apiClient.get<TenantsStatistics>(API_ENDPOINTS.TENANTS.STATISTICS)

    return {
      success: true,
      data: response.data,
      message: 'Statistics retrieved successfully',
    }
  }
}

export default TenantService
