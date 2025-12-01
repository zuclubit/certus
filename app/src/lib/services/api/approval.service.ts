/**
 * Approval Service - Real API Implementation
 *
 * Handles approval workflow operations against Certus API v1
 * Implements multi-level approval with SLA tracking (CONSAR compliance)
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { PaginatedResponse, ApiResponse } from '@/types'
import type {
  ApprovalWorkflow,
  ApprovalMetrics,
  ApprovalStatus,
  ApprovalLevel,
} from '@/types/approval.types'

// ============================================
// TYPES
// ============================================

export interface ApprovalListParams {
  page?: number
  pageSize?: number
  status?: ApprovalStatus[]
  level?: ApprovalLevel
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
  assignedToUserId?: string
}

export interface ApprovalStatistics {
  total: number
  pending: number
  approved: number
  rejected: number
  onHold: number
  avgApprovalTimeMinutes: number
  slaComplianceRate: number
  byLevel: Record<number, number>
  byStatus: Record<string, number>
}

export interface ApprovalActionRequest {
  workflowId: string
  action: 'approve' | 'reject' | 'request_info'
  comment: string
  level?: ApprovalLevel
}

// ============================================
// SERVICE
// ============================================

export class ApprovalServiceReal {
  /**
   * Get paginated list of approvals
   */
  static async getApprovals(params?: ApprovalListParams): Promise<PaginatedResponse<ApprovalWorkflow>> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
    if (params?.assignedToUserId) queryParams.append('assignedToUserId', params.assignedToUserId)
    if (params?.level !== undefined) queryParams.append('level', params.level.toString())

    params?.status?.forEach((s) => queryParams.append('status', s))

    const response = await apiClient.get<PaginatedResponse<ApprovalWorkflow>>(
      `${API_ENDPOINTS.APPROVALS.LIST}?${queryParams.toString()}`
    )

    return response.data
  }

  /**
   * Get approval workflow by ID
   */
  static async getApprovalById(id: string): Promise<ApiResponse<ApprovalWorkflow>> {
    const response = await apiClient.get<ApprovalWorkflow>(API_ENDPOINTS.APPROVALS.DETAIL(id))

    return {
      success: true,
      data: response.data,
      message: 'Approval retrieved successfully',
    }
  }

  /**
   * Get approval statistics
   */
  static async getStatistics(): Promise<ApiResponse<ApprovalStatistics>> {
    const response = await apiClient.get<ApprovalStatistics>(API_ENDPOINTS.APPROVALS.STATISTICS)

    return {
      success: true,
      data: response.data,
      message: 'Statistics retrieved successfully',
    }
  }

  /**
   * Approve a workflow
   */
  static async approve(id: string, comment: string): Promise<ApiResponse<ApprovalWorkflow>> {
    const response = await apiClient.post<ApprovalWorkflow>(API_ENDPOINTS.APPROVALS.APPROVE(id), {
      comment,
    })

    return {
      success: true,
      data: response.data,
      message: 'Workflow approved successfully',
    }
  }

  /**
   * Reject a workflow
   */
  static async reject(id: string, comment: string): Promise<ApiResponse<ApprovalWorkflow>> {
    const response = await apiClient.post<ApprovalWorkflow>(API_ENDPOINTS.APPROVALS.REJECT(id), {
      comment,
    })

    return {
      success: true,
      data: response.data,
      message: 'Workflow rejected',
    }
  }

  /**
   * Request additional information
   */
  static async requestInfo(id: string, message: string): Promise<ApiResponse<ApprovalWorkflow>> {
    const response = await apiClient.post<ApprovalWorkflow>(
      API_ENDPOINTS.APPROVALS.REQUEST_INFO(id),
      { message }
    )

    return {
      success: true,
      data: response.data,
      message: 'Information request sent',
    }
  }

  /**
   * Get pending approvals for current user
   */
  static async getPendingApprovals(userId?: string): Promise<ApiResponse<ApprovalWorkflow[]>> {
    const response = await this.getApprovals({
      status: ['pending' as ApprovalStatus, 'in_progress' as ApprovalStatus],
      assignedToUserId: userId,
      pageSize: 100,
    })

    return {
      success: true,
      data: response.data,
      message: `Found ${response.total} pending approvals`,
    }
  }

  /**
   * Get approval history for a validation
   */
  static async getApprovalHistory(validationId: string): Promise<ApiResponse<ApprovalWorkflow[]>> {
    const response = await apiClient.get<ApprovalWorkflow[]>(
      `${API_ENDPOINTS.APPROVALS.LIST}/validation/${validationId}`
    )

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} approval records`,
    }
  }

  /**
   * Bulk approve multiple workflows
   */
  static async bulkApprove(ids: string[], comment: string): Promise<ApiResponse<ApprovalWorkflow[]>> {
    const response = await apiClient.post<ApprovalWorkflow[]>(
      `${API_ENDPOINTS.APPROVALS.LIST}/bulk-approve`,
      { ids, comment }
    )

    return {
      success: true,
      data: response.data,
      message: `${response.data.length} workflows approved`,
    }
  }

  /**
   * Bulk reject multiple workflows
   */
  static async bulkReject(ids: string[], comment: string): Promise<ApiResponse<ApprovalWorkflow[]>> {
    const response = await apiClient.post<ApprovalWorkflow[]>(
      `${API_ENDPOINTS.APPROVALS.LIST}/bulk-reject`,
      { ids, comment }
    )

    return {
      success: true,
      data: response.data,
      message: `${response.data.length} workflows rejected`,
    }
  }

  /**
   * Escalate workflow to higher level
   */
  static async escalate(
    id: string,
    toLevel: ApprovalLevel,
    reason: string
  ): Promise<ApiResponse<ApprovalWorkflow>> {
    const response = await apiClient.post<ApprovalWorkflow>(
      `${API_ENDPOINTS.APPROVALS.DETAIL(id)}/escalate`,
      { toLevel, reason }
    )

    return {
      success: true,
      data: response.data,
      message: 'Workflow escalated successfully',
    }
  }

  /**
   * Reassign workflow to another user
   */
  static async reassign(
    id: string,
    toUserId: string,
    reason: string
  ): Promise<ApiResponse<ApprovalWorkflow>> {
    const response = await apiClient.post<ApprovalWorkflow>(
      `${API_ENDPOINTS.APPROVALS.DETAIL(id)}/reassign`,
      { toUserId, reason }
    )

    return {
      success: true,
      data: response.data,
      message: 'Workflow reassigned successfully',
    }
  }

  /**
   * Get approval metrics for a period
   */
  static async getMetrics(
    organizationId: string,
    from: string,
    to: string
  ): Promise<ApiResponse<ApprovalMetrics>> {
    const response = await apiClient.get<ApprovalMetrics>(
      `${API_ENDPOINTS.APPROVALS.STATISTICS}/metrics`,
      {
        params: { organizationId, from, to },
      }
    )

    return {
      success: true,
      data: response.data,
      message: 'Metrics retrieved successfully',
    }
  }

  /**
   * Add comment to approval workflow
   */
  static async addComment(
    id: string,
    comment: string
  ): Promise<ApiResponse<{ id: string; comment: string; createdAt: string; createdBy: string }>> {
    const response = await apiClient.post<{
      id: string
      comment: string
      createdAt: string
      createdBy: string
    }>(API_ENDPOINTS.APPROVALS.COMMENTS(id), { comment })

    return {
      success: true,
      data: response.data,
      message: 'Comment added successfully',
    }
  }

  /**
   * Get comments for approval workflow
   */
  static async getComments(
    id: string
  ): Promise<ApiResponse<Array<{ id: string; comment: string; createdAt: string; createdBy: string }>>> {
    const response = await apiClient.get<
      Array<{ id: string; comment: string; createdAt: string; createdBy: string }>
    >(API_ENDPOINTS.APPROVALS.COMMENTS(id))

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} comments`,
    }
  }
}

export default ApprovalServiceReal
