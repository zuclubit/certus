/**
 * Approval Service Adapter
 *
 * Provides a unified interface for approval workflow operations
 * Connects to Certus API v1
 */

import type {
  ApprovalWorkflow,
  ApprovalMetrics,
  ApprovalStatus,
  ApprovalLevel,
} from '@/types/approval.types'
import type { PaginatedResponse, ApiResponse } from '@/types'
import { ApprovalServiceReal } from './api/approval.service'

/**
 * Approval List Parameters - Unified Interface
 */
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

/**
 * Approval Statistics - Unified Interface
 */
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

/**
 * Approval Service Adapter
 * Always uses real API implementation
 */
export class ApprovalService {
  /**
   * Get paginated list of approvals
   */
  static async getApprovals(params?: ApprovalListParams): Promise<PaginatedResponse<ApprovalWorkflow>> {
    return ApprovalServiceReal.getApprovals(params)
  }

  /**
   * Get approval workflow by ID
   */
  static async getApprovalById(id: string): Promise<ApiResponse<ApprovalWorkflow>> {
    return ApprovalServiceReal.getApprovalById(id)
  }

  /**
   * Get approval statistics
   */
  static async getStatistics(): Promise<ApiResponse<ApprovalStatistics>> {
    return ApprovalServiceReal.getStatistics()
  }

  /**
   * Approve a workflow
   */
  static async approve(id: string, comment: string): Promise<ApiResponse<ApprovalWorkflow>> {
    return ApprovalServiceReal.approve(id, comment)
  }

  /**
   * Reject a workflow
   */
  static async reject(id: string, comment: string): Promise<ApiResponse<ApprovalWorkflow>> {
    return ApprovalServiceReal.reject(id, comment)
  }

  /**
   * Request additional information
   */
  static async requestInfo(id: string, message: string): Promise<ApiResponse<ApprovalWorkflow>> {
    return ApprovalServiceReal.requestInfo(id, message)
  }

  /**
   * Get pending approvals for current user
   */
  static async getPendingApprovals(userId?: string): Promise<ApiResponse<ApprovalWorkflow[]>> {
    return ApprovalServiceReal.getPendingApprovals(userId)
  }

  /**
   * Get approval history for a validation
   */
  static async getApprovalHistory(validationId: string): Promise<ApiResponse<ApprovalWorkflow[]>> {
    return ApprovalServiceReal.getApprovalHistory(validationId)
  }

  /**
   * Bulk approve multiple workflows
   */
  static async bulkApprove(ids: string[], comment: string): Promise<ApiResponse<ApprovalWorkflow[]>> {
    return ApprovalServiceReal.bulkApprove(ids, comment)
  }

  /**
   * Bulk reject multiple workflows
   */
  static async bulkReject(ids: string[], comment: string): Promise<ApiResponse<ApprovalWorkflow[]>> {
    return ApprovalServiceReal.bulkReject(ids, comment)
  }

  /**
   * Escalate workflow to higher level
   */
  static async escalate(
    id: string,
    toLevel: ApprovalLevel,
    reason: string
  ): Promise<ApiResponse<ApprovalWorkflow>> {
    return ApprovalServiceReal.escalate(id, toLevel, reason)
  }

  /**
   * Reassign workflow to another user
   */
  static async reassign(
    id: string,
    toUserId: string,
    reason: string
  ): Promise<ApiResponse<ApprovalWorkflow>> {
    return ApprovalServiceReal.reassign(id, toUserId, reason)
  }

  /**
   * Get approval metrics for a period
   */
  static async getMetrics(
    organizationId: string,
    from: string,
    to: string
  ): Promise<ApiResponse<ApprovalMetrics>> {
    return ApprovalServiceReal.getMetrics(organizationId, from, to)
  }

}

export default ApprovalService
