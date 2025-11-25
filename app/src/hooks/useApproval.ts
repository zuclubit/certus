/**
 * useApproval Hook - CONSAR Compliance
 *
 * Custom React hook for approval workflow operations
 * Combines store state with service methods for easy component integration
 */

import { useCallback, useEffect } from 'react'
import { useApprovalStore } from '@/stores/approvalStore'
import { approvalService } from '@/services/approval.service'
import type {
  ApprovalWorkflow,
  ApprovalUser,
  ApprovalLevel,
  ApprovalFilters,
  ApprovalSort,
  ApprovalConfiguration,
} from '@/types/approval.types'

// ============================================
// MAIN HOOK
// ============================================

export function useApproval() {
  const store = useApprovalStore()

  // ============================================
  // FETCH OPERATIONS
  // ============================================

  /**
   * Load workflows from API
   */
  const loadWorkflows = useCallback(async () => {
    store.setLoading(true)
    store.setError(null)

    try {
      const { workflows, total } = await approvalService.getWorkflows(
        store.filters,
        store.sort,
        store.pagination
      )
      store.setWorkflows(workflows)
      store.setPagination({ total })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar workflows'
      store.setError(message)
    } finally {
      store.setLoading(false)
    }
  }, [store.filters, store.sort, store.pagination])

  /**
   * Load single workflow by ID
   */
  const loadWorkflowById = useCallback(async (id: string) => {
    store.setLoading(true)
    store.setError(null)

    try {
      const workflow = await approvalService.getWorkflowById(id)
      store.setSelectedWorkflow(workflow)
      return workflow
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar workflow'
      store.setError(message)
      throw error
    } finally {
      store.setLoading(false)
    }
  }, [])

  /**
   * Load configurations
   */
  const loadConfigurations = useCallback(async () => {
    try {
      const configs = await approvalService.getConfigurations()
      store.setConfigurations(configs)
    } catch (error) {
      console.error('Error loading configurations:', error)
    }
  }, [])

  /**
   * Load metrics
   */
  const loadMetrics = useCallback(
    async (organizationId: string, from: string, to: string) => {
      try {
        const metrics = await approvalService.getMetrics(organizationId, from, to)
        store.setMetrics(metrics)
      } catch (error) {
        console.error('Error loading metrics:', error)
      }
    },
    []
  )

  // ============================================
  // APPROVAL ACTIONS
  // ============================================

  /**
   * Submit workflow for approval
   */
  const submitForApproval = useCallback(
    async (workflowId: string, comment: string) => {
      if (!store.currentUser) {
        throw new Error('No current user')
      }

      await store.submitForApproval(workflowId, comment)
      await loadWorkflows() // Refresh list
    },
    [store.currentUser, loadWorkflows]
  )

  /**
   * Approve workflow
   */
  const approve = useCallback(
    async (workflowId: string, comment: string) => {
      if (!store.currentUser) {
        throw new Error('No current user')
      }

      await store.approveWorkflow(workflowId, comment)
      await loadWorkflows() // Refresh list
    },
    [store.currentUser, loadWorkflows]
  )

  /**
   * Reject workflow
   */
  const reject = useCallback(
    async (workflowId: string, comment: string) => {
      if (!store.currentUser) {
        throw new Error('No current user')
      }

      await store.rejectWorkflow(workflowId, comment)
      await loadWorkflows() // Refresh list
    },
    [store.currentUser, loadWorkflows]
  )

  /**
   * Escalate workflow to higher level
   */
  const escalate = useCallback(
    async (workflowId: string, toLevel: ApprovalLevel, reason: string) => {
      if (!store.currentUser) {
        throw new Error('No current user')
      }

      await store.escalateWorkflow(workflowId, toLevel, reason)
      await loadWorkflows() // Refresh list
    },
    [store.currentUser, loadWorkflows]
  )

  /**
   * Request additional information
   */
  const requestInfo = useCallback(
    async (workflowId: string, message: string) => {
      await store.requestInfo(workflowId, message)
      await loadWorkflows() // Refresh list
    },
    [loadWorkflows]
  )

  /**
   * Provide requested information
   */
  const provideInfo = useCallback(
    async (workflowId: string, message: string) => {
      await store.provideInfo(workflowId, message)
      await loadWorkflows() // Refresh list
    },
    [loadWorkflows]
  )

  /**
   * Bulk approve multiple workflows
   */
  const bulkApprove = useCallback(
    async (workflowIds: string[], comment: string) => {
      if (!store.currentUser) {
        throw new Error('No current user')
      }

      store.setLoading(true)
      try {
        await approvalService.bulkApprove(workflowIds, comment, store.currentUser)
        await loadWorkflows() // Refresh list
      } finally {
        store.setLoading(false)
      }
    },
    [store.currentUser, loadWorkflows]
  )

  // ============================================
  // FILTERS & SORTING
  // ============================================

  /**
   * Update filters
   */
  const setFilters = useCallback(
    (filters: Partial<ApprovalFilters>) => {
      store.setFilters(filters)
    },
    []
  )

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    store.resetFilters()
  }, [])

  /**
   * Update sort
   */
  const setSort = useCallback((sort: ApprovalSort) => {
    store.setSort(sort)
  }, [])

  /**
   * Go to page
   */
  const goToPage = useCallback((page: number) => {
    store.setPagination({ page })
  }, [])

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Check if user can approve workflow
   */
  const canApprove = useCallback(
    (workflow: ApprovalWorkflow): boolean => {
      if (!store.currentUser) return false
      return approvalService.canUserApprove(workflow, store.currentUser)
    },
    [store.currentUser]
  )

  /**
   * Get SLA status for workflow
   */
  const getSLAStatus = useCallback((workflow: ApprovalWorkflow) => {
    const currentStage = workflow.stages.find((s) => s.level === workflow.currentLevel)
    if (!currentStage || !currentStage.startedAt) return null

    return approvalService.calculateSLAStatus(currentStage.startedAt, currentStage.slaConfig)
  }, [])

  /**
   * Get remaining minutes for SLA
   */
  const getRemainingMinutes = useCallback((workflow: ApprovalWorkflow): number | null => {
    const currentStage = workflow.stages.find((s) => s.level === workflow.currentLevel)
    if (!currentStage || !currentStage.startedAt) return null

    return approvalService.getRemainingMinutes(currentStage.startedAt, currentStage.slaConfig)
  }, [])

  // ============================================
  // RETURN API
  // ============================================

  return {
    // State
    workflows: store.workflows,
    selectedWorkflow: store.selectedWorkflow,
    configurations: store.configurations,
    activeConfiguration: store.activeConfiguration,
    metrics: store.metrics,
    notifications: store.notifications,
    filters: store.filters,
    sort: store.sort,
    pagination: store.pagination,
    isLoading: store.isLoading,
    error: store.error,
    currentUser: store.currentUser,

    // Selectors
    getWorkflowById: store.getWorkflowById,
    getWorkflowsByStatus: store.getWorkflowsByStatus,
    getWorkflowsByLevel: store.getWorkflowsByLevel,
    getWorkflowsBySLA: store.getWorkflowsBySLA,
    getAssignedWorkflows: store.getAssignedWorkflows,
    getPendingWorkflows: store.getPendingWorkflows,
    getUnreadNotifications: store.getUnreadNotifications,

    // Actions - Data Loading
    loadWorkflows,
    loadWorkflowById,
    loadConfigurations,
    loadMetrics,

    // Actions - Approval Operations
    submitForApproval,
    approve,
    reject,
    escalate,
    requestInfo,
    provideInfo,
    bulkApprove,

    // Actions - Selection
    setSelectedWorkflow: store.setSelectedWorkflow,

    // Actions - Filters & Sorting
    setFilters,
    resetFilters,
    setSort,
    goToPage,

    // Actions - Configuration
    setActiveConfiguration: store.setActiveConfiguration,
    updateConfiguration: store.updateConfiguration,

    // Actions - Notifications
    markNotificationAsRead: store.markNotificationAsRead,
    clearNotification: store.clearNotification,
    clearAllNotifications: store.clearAllNotifications,

    // Actions - User
    setCurrentUser: store.setCurrentUser,

    // Utility Functions
    canApprove,
    getSLAStatus,
    getRemainingMinutes,
  }
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

/**
 * Hook for workflows assigned to current user
 */
export function useMyWorkflows() {
  const { currentUser, getAssignedWorkflows, loadWorkflows } = useApproval()

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  const myWorkflows = currentUser ? getAssignedWorkflows(currentUser.id) : []

  return {
    myWorkflows,
    isLoading: useApprovalStore((s) => s.isLoading),
    refresh: loadWorkflows,
  }
}

/**
 * Hook for single workflow detail
 */
export function useWorkflowDetail(workflowId: string) {
  const { loadWorkflowById, selectedWorkflow, isLoading, error } = useApproval()

  useEffect(() => {
    if (workflowId) {
      loadWorkflowById(workflowId)
    }
  }, [workflowId, loadWorkflowById])

  return {
    workflow: selectedWorkflow,
    isLoading,
    error,
    refresh: () => loadWorkflowById(workflowId),
  }
}

/**
 * Hook for approval metrics
 */
export function useApprovalMetrics(organizationId: string, from: string, to: string) {
  const { loadMetrics, metrics, isLoading } = useApproval()

  useEffect(() => {
    if (organizationId && from && to) {
      loadMetrics(organizationId, from, to)
    }
  }, [organizationId, from, to, loadMetrics])

  return {
    metrics,
    isLoading,
    refresh: () => loadMetrics(organizationId, from, to),
  }
}

/**
 * Hook for approval configuration
 */
export function useApprovalConfiguration() {
  const {
    loadConfigurations,
    configurations,
    activeConfiguration,
    setActiveConfiguration,
    updateConfiguration,
    isLoading,
  } = useApproval()

  useEffect(() => {
    loadConfigurations()
  }, [loadConfigurations])

  return {
    configurations,
    activeConfiguration,
    setActiveConfiguration,
    updateConfiguration,
    isLoading,
    refresh: loadConfigurations,
  }
}
