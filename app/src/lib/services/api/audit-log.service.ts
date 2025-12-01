/**
 * Audit Log Service - Real API Implementation
 *
 * Handles audit trail operations against Certus API v1
 * Provides compliance-ready audit logging (CONSAR requirements)
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { PaginatedResponse, ApiResponse, AuditLogEntry } from '@/types'

// ============================================
// TYPES
// ============================================

export interface AuditLogFilters {
  page?: number
  pageSize?: number
  userId?: string
  action?: string[]
  resource?: string
  entityType?: string
  entityId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: 'timestamp' | 'user' | 'action'
  sortOrder?: 'asc' | 'desc'
}

export interface AuditLogStatistics {
  totalEntries: number
  todayEntries: number
  uniqueUsers: number
  mostActiveUser: {
    id: string
    name: string
    actionCount: number
  }
  actionBreakdown: Record<string, number>
  hourlyDistribution: Array<{ hour: number; count: number }>
}

export interface AuditAction {
  code: string
  name: string
  description: string
  category: string
}

export interface AuditLogDetail extends AuditLogEntry {
  metadata?: Record<string, unknown>
  previousValue?: unknown
  newValue?: unknown
  changes?: Array<{
    field: string
    oldValue: unknown
    newValue: unknown
  }>
}

// ============================================
// SERVICE
// ============================================

export class AuditLogService {
  /**
   * Get paginated audit log entries
   */
  static async getLogs(params?: AuditLogFilters): Promise<PaginatedResponse<AuditLogEntry>> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.userId) queryParams.append('userId', params.userId)
    if (params?.resource) queryParams.append('resource', params.resource)
    if (params?.entityType) queryParams.append('entityType', params.entityType)
    if (params?.entityId) queryParams.append('entityId', params.entityId)
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    params?.action?.forEach((a) => queryParams.append('action', a))

    const response = await apiClient.get<PaginatedResponse<AuditLogEntry>>(
      `${API_ENDPOINTS.AUDIT_LOG.LIST}?${queryParams.toString()}`
    )

    return response.data
  }

  /**
   * Get audit log statistics
   */
  static async getStatistics(params?: {
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<AuditLogStatistics>> {
    const response = await apiClient.get<AuditLogStatistics>(API_ENDPOINTS.AUDIT_LOG.STATISTICS, {
      params,
    })

    return {
      success: true,
      data: response.data,
      message: 'Statistics retrieved successfully',
    }
  }

  /**
   * Get available action types
   */
  static async getActionTypes(): Promise<ApiResponse<AuditAction[]>> {
    const response = await apiClient.get<AuditAction[]>(API_ENDPOINTS.AUDIT_LOG.ACTIONS)

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} action types`,
    }
  }

  /**
   * Get audit logs for a specific entity
   */
  static async getLogsByEntity(
    entityType: string,
    entityId: string
  ): Promise<ApiResponse<AuditLogEntry[]>> {
    const response = await apiClient.get<AuditLogEntry[]>(
      API_ENDPOINTS.AUDIT_LOG.BY_ENTITY(entityType, entityId)
    )

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} entries for ${entityType}/${entityId}`,
    }
  }

  /**
   * Get audit logs for a specific user
   */
  static async getLogsByUser(userId: string, params?: {
    page?: number
    pageSize?: number
    dateFrom?: string
    dateTo?: string
  }): Promise<PaginatedResponse<AuditLogEntry>> {
    return this.getLogs({
      ...params,
      userId,
    })
  }

  /**
   * Get audit logs for a validation
   */
  static async getValidationLogs(validationId: string): Promise<ApiResponse<AuditLogEntry[]>> {
    return this.getLogsByEntity('validation', validationId)
  }

  /**
   * Get audit logs for an approval
   */
  static async getApprovalLogs(approvalId: string): Promise<ApiResponse<AuditLogEntry[]>> {
    return this.getLogsByEntity('approval', approvalId)
  }

  /**
   * Get recent audit logs
   */
  static async getRecentLogs(limit: number = 50): Promise<ApiResponse<AuditLogEntry[]>> {
    const response = await this.getLogs({
      pageSize: limit,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    })

    return {
      success: true,
      data: response.data,
      message: `Retrieved ${response.data.length} recent entries`,
    }
  }

  /**
   * Export audit logs to CSV
   */
  static async exportToCsv(params?: AuditLogFilters): Promise<ApiResponse<Blob>> {
    const queryParams = new URLSearchParams()

    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
    if (params?.userId) queryParams.append('userId', params.userId)
    params?.action?.forEach((a) => queryParams.append('action', a))

    const response = await apiClient.get<Blob>(
      `${API_ENDPOINTS.AUDIT_LOG.LIST}/export?${queryParams.toString()}`,
      { responseType: 'blob' }
    )

    return {
      success: true,
      data: response.data,
      message: 'Export generated successfully',
    }
  }

  /**
   * Get login history for a user
   */
  static async getLoginHistory(userId: string): Promise<ApiResponse<AuditLogEntry[]>> {
    const response = await this.getLogs({
      userId,
      action: ['login', 'logout', 'login_failed'],
      sortBy: 'timestamp',
      sortOrder: 'desc',
      pageSize: 100,
    })

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} login events`,
    }
  }

  /**
   * Get security events
   */
  static async getSecurityEvents(params?: {
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<AuditLogEntry[]>> {
    const response = await this.getLogs({
      ...params,
      action: [
        'login_failed',
        'unauthorized_access',
        'permission_denied',
        'session_expired',
        'password_reset',
        'mfa_enabled',
        'mfa_disabled',
      ],
      sortBy: 'timestamp',
      sortOrder: 'desc',
      pageSize: 100,
    })

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} security events`,
    }
  }
}

export default AuditLogService
