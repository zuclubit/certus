/**
 * Approval Workflow Store - CONSAR Compliance
 *
 * Zustand store for managing approval workflow state
 * Handles multi-level approvals, SLA tracking, and maker-checker compliance
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  ApprovalWorkflow,
  ApprovalFilters,
  ApprovalSort,
  ApprovalPagination,
  ApprovalUser,
  ApprovalMetrics,
  ApprovalConfiguration,
  ApprovalNotification,
} from '@/types/approval.types'
import { ApprovalStatus, ApprovalLevel, SLAStatus } from '@/types/approval.types'
import { ApprovalServiceReal } from '@/lib/services/api/approval.service'

// ============================================
// STATE INTERFACE
// ============================================

interface ApprovalState {
  // Data
  workflows: ApprovalWorkflow[]
  selectedWorkflow: ApprovalWorkflow | null
  configurations: ApprovalConfiguration[]
  activeConfiguration: ApprovalConfiguration | null
  metrics: ApprovalMetrics | null
  notifications: ApprovalNotification[]

  // UI State
  filters: ApprovalFilters
  sort: ApprovalSort
  pagination: ApprovalPagination
  isLoading: boolean
  error: string | null

  // Current user
  currentUser: ApprovalUser | null

  // Selectors
  getWorkflowById: (id: string) => ApprovalWorkflow | undefined
  getWorkflowsByStatus: (status: ApprovalStatus) => ApprovalWorkflow[]
  getWorkflowsByLevel: (level: ApprovalLevel) => ApprovalWorkflow[]
  getWorkflowsBySLA: (slaStatus: SLAStatus) => ApprovalWorkflow[]
  getAssignedWorkflows: (userId: string) => ApprovalWorkflow[]
  getPendingWorkflows: () => ApprovalWorkflow[]
  getUnreadNotifications: () => ApprovalNotification[]

  // Actions - Workflows
  setWorkflows: (workflows: ApprovalWorkflow[]) => void
  addWorkflow: (workflow: ApprovalWorkflow) => void
  updateWorkflow: (id: string, updates: Partial<ApprovalWorkflow>) => void
  removeWorkflow: (id: string) => void
  setSelectedWorkflow: (workflow: ApprovalWorkflow | null) => void

  // Actions - Approval Operations
  submitForApproval: (workflowId: string, comment: string) => Promise<void>
  approveWorkflow: (workflowId: string, comment: string) => Promise<void>
  rejectWorkflow: (workflowId: string, comment: string) => Promise<void>
  escalateWorkflow: (workflowId: string, toLevel: ApprovalLevel, reason: string) => Promise<void>
  reassignWorkflow: (workflowId: string, toUserId: string, reason: string) => Promise<void>
  requestInfo: (workflowId: string, message: string) => Promise<void>
  provideInfo: (workflowId: string, message: string) => Promise<void>

  // Actions - Configuration
  setConfigurations: (configs: ApprovalConfiguration[]) => void
  setActiveConfiguration: (config: ApprovalConfiguration | null) => void
  updateConfiguration: (id: string, updates: Partial<ApprovalConfiguration>) => Promise<void>

  // Actions - Metrics
  setMetrics: (metrics: ApprovalMetrics) => void
  refreshMetrics: () => Promise<void>

  // Actions - Notifications
  setNotifications: (notifications: ApprovalNotification[]) => void
  addNotification: (notification: ApprovalNotification) => void
  markNotificationAsRead: (id: string) => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void

  // Actions - Filters & Pagination
  setFilters: (filters: Partial<ApprovalFilters>) => void
  resetFilters: () => void
  setSort: (sort: ApprovalSort) => void
  setPagination: (pagination: Partial<ApprovalPagination>) => void

  // Actions - UI State
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentUser: (user: ApprovalUser | null) => void

  // Actions - Reset
  reset: () => void
}

// ============================================
// INITIAL STATE
// ============================================

const initialFilters: ApprovalFilters = {
  status: undefined,
  level: undefined,
  priority: undefined,
  fileType: undefined,
  afore: undefined,
  assignedToUserId: undefined,
  submittedByUserId: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  slaStatus: undefined,
  search: undefined,
}

const initialSort: ApprovalSort = {
  field: 'submittedAt',
  order: 'desc',
}

const initialPagination: ApprovalPagination = {
  page: 1,
  pageSize: 20,
  total: 0,
}

const initialState = {
  workflows: [] as ApprovalWorkflow[], // Data loaded from API
  selectedWorkflow: null,
  configurations: [],
  activeConfiguration: null,
  metrics: null,
  notifications: [],
  filters: initialFilters,
  sort: initialSort,
  pagination: initialPagination,
  isLoading: false,
  error: null,
  currentUser: null as ApprovalUser | null, // Set from auth context
}

// ============================================
// STORE
// ============================================

export const useApprovalStore = create<ApprovalState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ============================================
        // SELECTORS
        // ============================================

        getWorkflowById: (id: string) => {
          return get().workflows.find((w) => w.id === id)
        },

        getWorkflowsByStatus: (status: ApprovalStatus) => {
          return get().workflows.filter((w) => w.status === status)
        },

        getWorkflowsByLevel: (level: ApprovalLevel) => {
          return get().workflows.filter((w) => w.currentLevel === level)
        },

        getWorkflowsBySLA: (slaStatus: SLAStatus) => {
          return get().workflows.filter((w) => w.overallSLAStatus === slaStatus)
        },

        getAssignedWorkflows: (userId: string) => {
          return get().workflows.filter((w) => {
            const currentStage = w.stages.find((s) => s.level === w.currentLevel)
            return currentStage?.assignedTo.some((u) => u.id === userId) ?? false
          })
        },

        getPendingWorkflows: () => {
          return get().workflows.filter(
            (w) => w.status === ApprovalStatus.PENDING || w.status === ApprovalStatus.IN_PROGRESS
          )
        },

        getUnreadNotifications: () => {
          return get().notifications.filter((n) => !n.read)
        },

        // ============================================
        // ACTIONS - WORKFLOWS
        // ============================================

        setWorkflows: (workflows) => {
          set({ workflows }, false, 'setWorkflows')
        },

        addWorkflow: (workflow) => {
          set(
            (state) => ({
              workflows: [workflow, ...state.workflows],
            }),
            false,
            'addWorkflow'
          )
        },

        updateWorkflow: (id, updates) => {
          set(
            (state) => ({
              workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
              selectedWorkflow:
                state.selectedWorkflow?.id === id
                  ? { ...state.selectedWorkflow, ...updates }
                  : state.selectedWorkflow,
            }),
            false,
            'updateWorkflow'
          )
        },

        removeWorkflow: (id) => {
          set(
            (state) => ({
              workflows: state.workflows.filter((w) => w.id !== id),
              selectedWorkflow: state.selectedWorkflow?.id === id ? null : state.selectedWorkflow,
            }),
            false,
            'removeWorkflow'
          )
        },

        setSelectedWorkflow: (workflow) => {
          set({ selectedWorkflow: workflow }, false, 'setSelectedWorkflow')
        },

        // ============================================
        // ACTIONS - APPROVAL OPERATIONS
        // ============================================

        submitForApproval: async (workflowId, comment) => {
          set({ isLoading: true, error: null }, false, 'submitForApproval:start')
          try {
            // Call real API
            const response = await ApprovalServiceReal.approve(workflowId, comment)

            if (response.success && response.data) {
              // Update local state with API response
              get().updateWorkflow(workflowId, {
                status: response.data.status as ApprovalStatus,
                currentLevel: response.data.currentLevel as ApprovalLevel,
              })
            }

            set({ isLoading: false }, false, 'submitForApproval:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al enviar para aprobación'
            set({ isLoading: false, error: message }, false, 'submitForApproval:error')
            throw error
          }
        },

        approveWorkflow: async (workflowId, comment) => {
          set({ isLoading: true, error: null }, false, 'approveWorkflow:start')
          try {
            // Call real API
            const response = await ApprovalServiceReal.approve(workflowId, comment)

            if (response.success && response.data) {
              // Update local state with API response
              get().updateWorkflow(workflowId, {
                status: response.data.status as ApprovalStatus,
                currentLevel: response.data.currentLevel as ApprovalLevel,
              })
            }

            set({ isLoading: false }, false, 'approveWorkflow:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al aprobar'
            set({ isLoading: false, error: message }, false, 'approveWorkflow:error')
            throw error
          }
        },

        rejectWorkflow: async (workflowId, comment) => {
          set({ isLoading: true, error: null }, false, 'rejectWorkflow:start')
          try {
            // Call real API
            const response = await ApprovalServiceReal.reject(workflowId, comment)

            if (response.success && response.data) {
              get().updateWorkflow(workflowId, {
                status: response.data.status as ApprovalStatus,
              })
            }

            set({ isLoading: false }, false, 'rejectWorkflow:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al rechazar'
            set({ isLoading: false, error: message }, false, 'rejectWorkflow:error')
            throw error
          }
        },

        escalateWorkflow: async (workflowId, toLevel, reason) => {
          set({ isLoading: true, error: null }, false, 'escalateWorkflow:start')
          try {
            // Call real API
            const response = await ApprovalServiceReal.escalate(workflowId, toLevel, reason)

            if (response.success && response.data) {
              get().updateWorkflow(workflowId, {
                status: response.data.status as ApprovalStatus,
                currentLevel: response.data.currentLevel as ApprovalLevel,
              })
            }

            set({ isLoading: false }, false, 'escalateWorkflow:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al escalar'
            set({ isLoading: false, error: message }, false, 'escalateWorkflow:error')
            throw error
          }
        },

        reassignWorkflow: async (workflowId, toUserId, reason) => {
          set({ isLoading: true, error: null }, false, 'reassignWorkflow:start')
          try {
            // Call real API
            await ApprovalServiceReal.reassign(workflowId, toUserId, reason)

            set({ isLoading: false }, false, 'reassignWorkflow:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al reasignar'
            set({ isLoading: false, error: message }, false, 'reassignWorkflow:error')
            throw error
          }
        },

        requestInfo: async (workflowId, infoMessage) => {
          set({ isLoading: true, error: null }, false, 'requestInfo:start')
          try {
            // Call real API
            const response = await ApprovalServiceReal.requestInfo(workflowId, infoMessage)

            if (response.success) {
              get().updateWorkflow(workflowId, {
                status: ApprovalStatus.ON_HOLD,
              })
            }

            set({ isLoading: false }, false, 'requestInfo:success')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al solicitar información'
            set({ isLoading: false, error: errorMessage }, false, 'requestInfo:error')
            throw error
          }
        },

        provideInfo: async (workflowId, infoMessage) => {
          set({ isLoading: true, error: null }, false, 'provideInfo:start')
          try {
            // Call real API - using addComment as provideInfo endpoint
            await ApprovalServiceReal.addComment(workflowId, infoMessage)

            get().updateWorkflow(workflowId, {
              status: ApprovalStatus.IN_PROGRESS,
            })

            set({ isLoading: false }, false, 'provideInfo:success')
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al proporcionar información'
            set({ isLoading: false, error: errorMessage }, false, 'provideInfo:error')
            throw error
          }
        },

        // ============================================
        // ACTIONS - CONFIGURATION
        // ============================================

        setConfigurations: (configs) => {
          set({ configurations: configs }, false, 'setConfigurations')
        },

        setActiveConfiguration: (config) => {
          set({ activeConfiguration: config }, false, 'setActiveConfiguration')
        },

        updateConfiguration: async (id, updates) => {
          set({ isLoading: true, error: null }, false, 'updateConfiguration:start')
          try {
            // In real implementation, call API
            // await approvalService.updateConfiguration(id, updates)

            set(
              (state) => ({
                configurations: state.configurations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
                activeConfiguration:
                  state.activeConfiguration?.id === id
                    ? { ...state.activeConfiguration, ...updates }
                    : state.activeConfiguration,
                isLoading: false,
              }),
              false,
              'updateConfiguration:success'
            )
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al actualizar configuración'
            set({ isLoading: false, error: message }, false, 'updateConfiguration:error')
            throw error
          }
        },

        // ============================================
        // ACTIONS - METRICS
        // ============================================

        setMetrics: (metrics) => {
          set({ metrics }, false, 'setMetrics')
        },

        refreshMetrics: async () => {
          set({ isLoading: true, error: null }, false, 'refreshMetrics:start')
          try {
            // In real implementation, call API
            // const metrics = await approvalService.getMetrics()
            // set({ metrics, isLoading: false }, false, 'refreshMetrics:success')

            set({ isLoading: false }, false, 'refreshMetrics:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al actualizar métricas'
            set({ isLoading: false, error: message }, false, 'refreshMetrics:error')
            throw error
          }
        },

        // ============================================
        // ACTIONS - NOTIFICATIONS
        // ============================================

        setNotifications: (notifications) => {
          set({ notifications }, false, 'setNotifications')
        },

        addNotification: (notification) => {
          set(
            (state) => ({
              notifications: [notification, ...state.notifications],
            }),
            false,
            'addNotification'
          )
        },

        markNotificationAsRead: (id) => {
          set(
            (state) => ({
              notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
            }),
            false,
            'markNotificationAsRead'
          )
        },

        clearNotification: (id) => {
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            'clearNotification'
          )
        },

        clearAllNotifications: () => {
          set({ notifications: [] }, false, 'clearAllNotifications')
        },

        // ============================================
        // ACTIONS - FILTERS & PAGINATION
        // ============================================

        setFilters: (filters) => {
          set(
            (state) => ({
              filters: { ...state.filters, ...filters },
              pagination: { ...state.pagination, page: 1 }, // Reset to page 1 when filtering
            }),
            false,
            'setFilters'
          )
        },

        resetFilters: () => {
          set(
            {
              filters: initialFilters,
              pagination: { ...initialPagination },
            },
            false,
            'resetFilters'
          )
        },

        setSort: (sort) => {
          set({ sort }, false, 'setSort')
        },

        setPagination: (pagination) => {
          set(
            (state) => ({
              pagination: { ...state.pagination, ...pagination },
            }),
            false,
            'setPagination'
          )
        },

        // ============================================
        // ACTIONS - UI STATE
        // ============================================

        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading')
        },

        setError: (error) => {
          set({ error }, false, 'setError')
        },

        setCurrentUser: (user) => {
          set({ currentUser: user }, false, 'setCurrentUser')
        },

        // ============================================
        // ACTIONS - RESET
        // ============================================

        reset: () => {
          set(initialState, false, 'reset')
        },
      }),
      {
        name: 'approval-store',
        partialize: (state) => ({
          // Only persist filters and pagination
          filters: state.filters,
          sort: state.sort,
          pagination: state.pagination,
          currentUser: state.currentUser,
        }),
      }
    ),
    { name: 'ApprovalStore' }
  )
)

// ============================================
// SELECTORS (for use outside components)
// ============================================

export const selectWorkflows = (state: ApprovalState) => state.workflows
export const selectSelectedWorkflow = (state: ApprovalState) => state.selectedWorkflow
export const selectConfigurations = (state: ApprovalState) => state.configurations
export const selectActiveConfiguration = (state: ApprovalState) => state.activeConfiguration
export const selectMetrics = (state: ApprovalState) => state.metrics
export const selectNotifications = (state: ApprovalState) => state.notifications
export const selectFilters = (state: ApprovalState) => state.filters
export const selectSort = (state: ApprovalState) => state.sort
export const selectPagination = (state: ApprovalState) => state.pagination
export const selectIsLoading = (state: ApprovalState) => state.isLoading
export const selectError = (state: ApprovalState) => state.error
export const selectCurrentUser = (state: ApprovalState) => state.currentUser
