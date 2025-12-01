/**
 * useApproval Hook - CONSAR Compliance
 *
 * Custom React hook for approval workflow operations
 * Uses TanStack Query for data fetching and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApprovalService } from '@/lib/services/approval.adapter'
import type { ApprovalListParams } from '@/lib/services/approval.adapter'
import type { ApprovalLevel, ApprovalStatus } from '@/types/approval.types'

// ============================================
// QUERY KEYS
// ============================================

export const approvalKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalKeys.all, 'list'] as const,
  list: (params: string) => [...approvalKeys.lists(), params] as const,
  details: () => [...approvalKeys.all, 'detail'] as const,
  detail: (id: string) => [...approvalKeys.details(), id] as const,
  statistics: () => [...approvalKeys.all, 'statistics'] as const,
  pending: (userId?: string) => [...approvalKeys.all, 'pending', userId] as const,
  history: (validationId: string) => [...approvalKeys.all, 'history', validationId] as const,
  metrics: (orgId: string, from: string, to: string) =>
    [...approvalKeys.all, 'metrics', orgId, from, to] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook for fetching paginated approvals with filters
 */
export function useApprovals(params: ApprovalListParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...filterParams } = params

  return useQuery({
    queryKey: approvalKeys.list(JSON.stringify(filterParams)),
    queryFn: () => ApprovalService.getApprovals(filterParams),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  })
}

/**
 * Hook for fetching approval detail
 */
export function useApprovalDetail(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: approvalKeys.detail(id || ''),
    queryFn: () => ApprovalService.getApprovalById(id!),
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for fetching approval statistics
 */
export function useApprovalStatistics(enabled: boolean = true) {
  return useQuery({
    queryKey: approvalKeys.statistics(),
    queryFn: () => ApprovalService.getStatistics(),
    enabled,
    staleTime: 10000, // 10 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
  })
}

/**
 * Hook for fetching pending approvals for current user
 */
export function usePendingApprovals(userId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: approvalKeys.pending(userId),
    queryFn: () => ApprovalService.getPendingApprovals(userId),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

/**
 * Hook for fetching approval history for a validation
 */
export function useApprovalHistory(validationId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: approvalKeys.history(validationId || ''),
    queryFn: () => ApprovalService.getApprovalHistory(validationId!),
    enabled: enabled && !!validationId,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for fetching approval metrics
 */
export function useApprovalMetrics(
  organizationId: string,
  from: string,
  to: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: approvalKeys.metrics(organizationId, from, to),
    queryFn: () => ApprovalService.getMetrics(organizationId, from, to),
    enabled: enabled && !!organizationId && !!from && !!to,
    staleTime: 60000, // 1 minute
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook for approving a workflow
 */
export function useApproveWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      ApprovalService.approve(id, comment),
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: approvalKeys.detail(id) })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(approvalKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(approvalKeys.detail(id), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            status: 'approved' as ApprovalStatus,
          },
        }
      })

      return { previousData }
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(approvalKeys.detail(id), context.previousData)
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

/**
 * Hook for rejecting a workflow
 */
export function useRejectWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      ApprovalService.reject(id, comment),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: approvalKeys.detail(id) })
      const previousData = queryClient.getQueryData(approvalKeys.detail(id))

      queryClient.setQueryData(approvalKeys.detail(id), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            status: 'rejected' as ApprovalStatus,
          },
        }
      })

      return { previousData }
    },
    onError: (_err, { id }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(approvalKeys.detail(id), context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

/**
 * Hook for requesting additional information
 */
export function useRequestInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      ApprovalService.requestInfo(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

/**
 * Hook for bulk approving multiple workflows
 */
export function useBulkApprove() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, comment }: { ids: string[]; comment: string }) =>
      ApprovalService.bulkApprove(ids, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

/**
 * Hook for bulk rejecting multiple workflows
 */
export function useBulkReject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, comment }: { ids: string[]; comment: string }) =>
      ApprovalService.bulkReject(ids, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

/**
 * Hook for escalating a workflow
 */
export function useEscalateWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      toLevel,
      reason,
    }: {
      id: string
      toLevel: ApprovalLevel
      reason: string
    }) => ApprovalService.escalate(id, toLevel, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

/**
 * Hook for reassigning a workflow
 */
export function useReassignWorkflow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      toUserId,
      reason,
    }: {
      id: string
      toUserId: string
      reason: string
    }) => ApprovalService.reassign(id, toUserId, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: approvalKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: approvalKeys.lists() })
      queryClient.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

// ============================================
// COMBINED HOOK FOR CONVENIENCE
// ============================================

/**
 * Combined hook providing all approval operations
 * Use individual hooks for better tree-shaking
 */
export function useApproval() {
  const queryClient = useQueryClient()

  return {
    // Query hooks (returns full query object)
    useApprovals,
    useApprovalDetail,
    useApprovalStatistics,
    usePendingApprovals,
    useApprovalHistory,
    useApprovalMetrics,

    // Mutation hooks (returns full mutation object)
    useApproveWorkflow,
    useRejectWorkflow,
    useRequestInfo,
    useBulkApprove,
    useBulkReject,
    useEscalateWorkflow,
    useReassignWorkflow,

    // Utility
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: approvalKeys.all }),
  }
}

// Alias for backwards compatibility
export const useWorkflowDetail = useApprovalDetail

export default useApproval
