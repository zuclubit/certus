/**
 * Approval Service - CONSAR Compliance
 *
 * Service layer for approval workflow operations
 * Handles API communication, business logic, and SLA calculations
 */

import type {
  ApprovalWorkflow,
  ApprovalUser,
  ApprovalConfiguration,
  ApprovalMetrics,
  ApprovalFilters,
  ApprovalSort,
  ApprovalPagination,
  SLAConfiguration,
  BulkApprovalRequest,
  ApprovalDelegation,
} from '@/types/approval.types'
import { ApprovalLevel, ApprovalStatus, SLAStatus, ApprovalAction } from '@/types/approval.types'
import mockApprovalWorkflows from '@/lib/mock/approval.mock'

// ============================================
// API CLIENT (mock for now)
// ============================================

class ApprovalAPI {
  private baseUrl = '/api/approvals'

  async fetchWorkflows(
    filters?: ApprovalFilters,
    sort?: ApprovalSort,
    pagination?: ApprovalPagination
  ): Promise<{ data: ApprovalWorkflow[]; total: number }> {
    // In real implementation, call actual API
    // const response = await fetch(`${this.baseUrl}?${queryParams}`)
    // return response.json()

    // Mock data with filtering, sorting, and pagination
    let filteredWorkflows = [...mockApprovalWorkflows]

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filteredWorkflows = filteredWorkflows.filter((w) => filters.status!.includes(w.status))
      }

      if (filters.slaStatus && filters.slaStatus.length > 0) {
        filteredWorkflows = filteredWorkflows.filter((w) => filters.slaStatus!.includes(w.overallSLAStatus))
      }

      if (filters.level !== undefined) {
        filteredWorkflows = filteredWorkflows.filter((w) => w.currentLevel === filters.level)
      }

      if (filters.afore) {
        filteredWorkflows = filteredWorkflows.filter((w) => w.afore === filters.afore)
      }

      if (filters.fileType) {
        filteredWorkflows = filteredWorkflows.filter((w) => w.fileType === filters.fileType)
      }

      if (filters.assignedToUserId) {
        filteredWorkflows = filteredWorkflows.filter((w) => {
          const currentStage = w.stages.find((s) => s.level === w.currentLevel)
          return currentStage?.assignedTo.some((u) => u.id === filters.assignedToUserId)
        })
      }

      if (filters.submittedBy) {
        filteredWorkflows = filteredWorkflows.filter((w) => w.submittedBy.id === filters.submittedBy)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredWorkflows = filteredWorkflows.filter(
          (w) =>
            w.fileName.toLowerCase().includes(searchLower) ||
            w.fileType.toLowerCase().includes(searchLower) ||
            w.afore.toLowerCase().includes(searchLower) ||
            w.submittedBy.name.toLowerCase().includes(searchLower)
        )
      }

      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom).getTime()
        filteredWorkflows = filteredWorkflows.filter((w) => new Date(w.submittedAt).getTime() >= from)
      }

      if (filters.dateTo) {
        const to = new Date(filters.dateTo).getTime()
        filteredWorkflows = filteredWorkflows.filter((w) => new Date(w.submittedAt).getTime() <= to)
      }
    }

    // Apply sorting
    if (sort) {
      filteredWorkflows.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sort.field) {
          case 'submittedAt':
            aValue = new Date(a.submittedAt).getTime()
            bValue = new Date(b.submittedAt).getTime()
            break
          case 'fileName':
            aValue = a.fileName
            bValue = b.fileName
            break
          case 'status':
            aValue = a.status
            bValue = b.status
            break
          case 'currentLevel':
            aValue = a.currentLevel
            bValue = b.currentLevel
            break
          case 'overallSLAStatus':
            aValue = a.overallSLAStatus
            bValue = b.overallSLAStatus
            break
          default:
            return 0
        }

        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    // Apply pagination
    const total = filteredWorkflows.length
    let paginatedWorkflows = filteredWorkflows

    if (pagination) {
      const start = (pagination.page - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      paginatedWorkflows = filteredWorkflows.slice(start, end)
    }

    return {
      data: paginatedWorkflows,
      total,
    }
  }

  async fetchWorkflowById(id: string): Promise<ApprovalWorkflow> {
    // const response = await fetch(`${this.baseUrl}/${id}`)
    // return response.json()

    // Mock data - find workflow by ID
    const workflow = mockApprovalWorkflows.find((w) => w.id === id)
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`)
    }
    return workflow
  }

  async submitWorkflow(workflowId: string, comment: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    // const response = await fetch(`${this.baseUrl}/${workflowId}/submit`, {
    //   method: 'POST',
    //   body: JSON.stringify({ comment, userId: user.id }),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async approveWorkflow(workflowId: string, comment: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    // const response = await fetch(`${this.baseUrl}/${workflowId}/approve`, {
    //   method: 'POST',
    //   body: JSON.stringify({ comment, userId: user.id }),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async rejectWorkflow(workflowId: string, comment: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    // const response = await fetch(`${this.baseUrl}/${workflowId}/reject`, {
    //   method: 'POST',
    //   body: JSON.stringify({ comment, userId: user.id }),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async escalateWorkflow(
    workflowId: string,
    toLevel: ApprovalLevel,
    reason: string,
    user: ApprovalUser
  ): Promise<ApprovalWorkflow> {
    // const response = await fetch(`${this.baseUrl}/${workflowId}/escalate`, {
    //   method: 'POST',
    //   body: JSON.stringify({ toLevel, reason, userId: user.id }),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async reassignWorkflow(
    workflowId: string,
    toUserId: string,
    reason: string,
    user: ApprovalUser
  ): Promise<ApprovalWorkflow> {
    // const response = await fetch(`${this.baseUrl}/${workflowId}/reassign`, {
    //   method: 'POST',
    //   body: JSON.stringify({ toUserId, reason, userId: user.id }),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async requestInfo(workflowId: string, message: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    // const response = await fetch(`${this.baseUrl}/${workflowId}/request-info`, {
    //   method: 'POST',
    //   body: JSON.stringify({ message, userId: user.id }),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async provideInfo(workflowId: string, message: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    // const response = await fetch(`${this.baseUrl}/${workflowId}/provide-info`, {
    //   method: 'POST',
    //   body: JSON.stringify({ message, userId: user.id }),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async bulkApprove(request: BulkApprovalRequest): Promise<ApprovalWorkflow[]> {
    // const response = await fetch(`${this.baseUrl}/bulk`, {
    //   method: 'POST',
    //   body: JSON.stringify(request),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async fetchConfigurations(): Promise<ApprovalConfiguration[]> {
    // const response = await fetch(`${this.baseUrl}/configurations`)
    // return response.json()
    return []
  }

  async updateConfiguration(
    id: string,
    updates: Partial<ApprovalConfiguration>
  ): Promise<ApprovalConfiguration> {
    // const response = await fetch(`${this.baseUrl}/configurations/${id}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify(updates),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async fetchMetrics(organizationId: string, from: string, to: string): Promise<ApprovalMetrics> {
    // const response = await fetch(
    //   `${this.baseUrl}/metrics?org=${organizationId}&from=${from}&to=${to}`
    // )
    // return response.json()
    throw new Error('Not implemented')
  }

  async fetchDelegations(userId: string): Promise<ApprovalDelegation[]> {
    // const response = await fetch(`${this.baseUrl}/delegations?userId=${userId}`)
    // return response.json()
    return []
  }

  async createDelegation(delegation: Omit<ApprovalDelegation, 'id'>): Promise<ApprovalDelegation> {
    // const response = await fetch(`${this.baseUrl}/delegations`, {
    //   method: 'POST',
    //   body: JSON.stringify(delegation),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }
}

// ============================================
// SERVICE CLASS
// ============================================

class ApprovalService {
  private api: ApprovalAPI

  constructor() {
    this.api = new ApprovalAPI()
  }

  // ============================================
  // WORKFLOW OPERATIONS
  // ============================================

  /**
   * Fetch workflows with filters, sorting, and pagination
   */
  async getWorkflows(
    filters?: ApprovalFilters,
    sort?: ApprovalSort,
    pagination?: ApprovalPagination
  ): Promise<{ workflows: ApprovalWorkflow[]; total: number }> {
    try {
      const { data, total } = await this.api.fetchWorkflows(filters, sort, pagination)
      return { workflows: data, total }
    } catch (error) {
      console.error('Error fetching workflows:', error)
      throw error
    }
  }

  /**
   * Get single workflow by ID
   */
  async getWorkflowById(id: string): Promise<ApprovalWorkflow> {
    try {
      return await this.api.fetchWorkflowById(id)
    } catch (error) {
      console.error('Error fetching workflow:', error)
      throw error
    }
  }

  /**
   * Submit workflow for approval
   */
  async submitForApproval(workflowId: string, comment: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    try {
      return await this.api.submitWorkflow(workflowId, comment, user)
    } catch (error) {
      console.error('Error submitting workflow:', error)
      throw error
    }
  }

  /**
   * Approve workflow at current level
   */
  async approve(workflowId: string, comment: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    try {
      return await this.api.approveWorkflow(workflowId, comment, user)
    } catch (error) {
      console.error('Error approving workflow:', error)
      throw error
    }
  }

  /**
   * Reject workflow
   */
  async reject(workflowId: string, comment: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    try {
      return await this.api.rejectWorkflow(workflowId, comment, user)
    } catch (error) {
      console.error('Error rejecting workflow:', error)
      throw error
    }
  }

  /**
   * Escalate workflow to higher level
   */
  async escalate(
    workflowId: string,
    toLevel: ApprovalLevel,
    reason: string,
    user: ApprovalUser
  ): Promise<ApprovalWorkflow> {
    try {
      return await this.api.escalateWorkflow(workflowId, toLevel, reason, user)
    } catch (error) {
      console.error('Error escalating workflow:', error)
      throw error
    }
  }

  /**
   * Reassign workflow to different user
   */
  async reassign(
    workflowId: string,
    toUserId: string,
    reason: string,
    user: ApprovalUser
  ): Promise<ApprovalWorkflow> {
    try {
      return await this.api.reassignWorkflow(workflowId, toUserId, reason, user)
    } catch (error) {
      console.error('Error reassigning workflow:', error)
      throw error
    }
  }

  /**
   * Request additional information
   */
  async requestInfo(workflowId: string, message: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    try {
      return await this.api.requestInfo(workflowId, message, user)
    } catch (error) {
      console.error('Error requesting info:', error)
      throw error
    }
  }

  /**
   * Provide requested information
   */
  async provideInfo(workflowId: string, message: string, user: ApprovalUser): Promise<ApprovalWorkflow> {
    try {
      return await this.api.provideInfo(workflowId, message, user)
    } catch (error) {
      console.error('Error providing info:', error)
      throw error
    }
  }

  /**
   * Bulk approve multiple workflows
   */
  async bulkApprove(workflowIds: string[], comment: string, user: ApprovalUser): Promise<ApprovalWorkflow[]> {
    try {
      const request: BulkApprovalRequest = {
        workflowIds,
        action: ApprovalAction.APPROVE,
        comment,
        performedBy: user,
        timestamp: new Date().toISOString(),
      }
      return await this.api.bulkApprove(request)
    } catch (error) {
      console.error('Error bulk approving:', error)
      throw error
    }
  }

  // ============================================
  // SLA CALCULATIONS
  // ============================================

  /**
   * Calculate SLA status based on elapsed time
   */
  calculateSLAStatus(startTime: string, slaConfig: SLAConfiguration): SLAStatus {
    const start = new Date(startTime).getTime()
    const now = new Date().getTime()

    let elapsedMinutes = (now - start) / (1000 * 60)

    // If business hours only, adjust calculation
    if (slaConfig.businessHoursOnly) {
      elapsedMinutes = this.calculateBusinessMinutes(startTime, new Date().toISOString())
    }

    const percentUsed = (elapsedMinutes / slaConfig.maxDurationMinutes) * 100

    if (percentUsed >= 100) return SLAStatus.BREACHED
    if (percentUsed >= slaConfig.criticalThresholdPercent) return SLAStatus.CRITICAL
    if (percentUsed >= slaConfig.warningThresholdPercent) return SLAStatus.WARNING
    return SLAStatus.ON_TIME
  }

  /**
   * Calculate business minutes between two timestamps
   * Only counts 8am-6pm, Monday-Friday
   */
  private calculateBusinessMinutes(startTime: string, endTime: string): number {
    const start = new Date(startTime)
    const end = new Date(endTime)
    let minutes = 0

    const current = new Date(start)

    while (current < end) {
      const day = current.getDay()
      const hour = current.getHours()

      // Monday = 1, Friday = 5
      const isWeekday = day >= 1 && day <= 5
      // Business hours: 8am-6pm
      const isBusinessHour = hour >= 8 && hour < 18

      if (isWeekday && isBusinessHour) {
        minutes++
      }

      current.setMinutes(current.getMinutes() + 1)
    }

    return minutes
  }

  /**
   * Get remaining time for SLA
   */
  getRemainingMinutes(startTime: string, slaConfig: SLAConfiguration): number {
    const start = new Date(startTime).getTime()
    const now = new Date().getTime()
    const elapsedMinutes = (now - start) / (1000 * 60)
    return Math.max(0, slaConfig.maxDurationMinutes - elapsedMinutes)
  }

  /**
   * Check if workflow should be auto-escalated
   */
  shouldAutoEscalate(startTime: string, slaConfig: SLAConfiguration): boolean {
    if (!slaConfig.autoEscalate) return false
    const status = this.calculateSLAStatus(startTime, slaConfig)
    return status === SLAStatus.BREACHED
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Get all approval configurations
   */
  async getConfigurations(): Promise<ApprovalConfiguration[]> {
    try {
      return await this.api.fetchConfigurations()
    } catch (error) {
      console.error('Error fetching configurations:', error)
      throw error
    }
  }

  /**
   * Update approval configuration
   */
  async updateConfiguration(
    id: string,
    updates: Partial<ApprovalConfiguration>
  ): Promise<ApprovalConfiguration> {
    try {
      return await this.api.updateConfiguration(id, updates)
    } catch (error) {
      console.error('Error updating configuration:', error)
      throw error
    }
  }

  // ============================================
  // METRICS
  // ============================================

  /**
   * Get approval metrics for organization
   */
  async getMetrics(organizationId: string, from: string, to: string): Promise<ApprovalMetrics> {
    try {
      return await this.api.fetchMetrics(organizationId, from, to)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      throw error
    }
  }

  // ============================================
  // DELEGATION
  // ============================================

  /**
   * Get delegations for user
   */
  async getDelegations(userId: string): Promise<ApprovalDelegation[]> {
    try {
      return await this.api.fetchDelegations(userId)
    } catch (error) {
      console.error('Error fetching delegations:', error)
      throw error
    }
  }

  /**
   * Create new delegation
   */
  async createDelegation(delegation: Omit<ApprovalDelegation, 'id'>): Promise<ApprovalDelegation> {
    try {
      return await this.api.createDelegation(delegation)
    } catch (error) {
      console.error('Error creating delegation:', error)
      throw error
    }
  }

  // ============================================
  // VALIDATION
  // ============================================

  /**
   * Validate if user can approve workflow
   */
  canUserApprove(workflow: ApprovalWorkflow, user: ApprovalUser): boolean {
    const currentStage = workflow.stages.find((s) => s.level === workflow.currentLevel)
    if (!currentStage) return false

    // Check if user is assigned to current stage
    return currentStage.assignedTo.some((u) => u.id === user.id)
  }

  /**
   * Validate if workflow meets maker-checker requirements
   */
  validateMakerChecker(workflow: ApprovalWorkflow, config: ApprovalConfiguration): boolean {
    if (!config.makerCheckerEnabled) return true

    // Ensure submitter is not same as approver
    const currentStage = workflow.stages.find((s) => s.level === workflow.currentLevel)
    if (!currentStage?.currentApprover) return true

    return workflow.submittedBy.id !== currentStage.currentApprover.id
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const approvalService = new ApprovalService()
export default approvalService
