/**
 * useNormativeChanges Hook - Normative Changes Management with React Query
 *
 * Enterprise-grade hook for CONSAR normative changes with:
 * - CRUD operations for normative changes
 * - Real-time data from API
 * - Search and filtering
 * - Statistics
 *
 * Uses TanStack Query for data fetching and caching
 * Uses real API service (no mocks)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import {
  NormativeService,
  type NormativeChange,
  type NormativeFilters,
  type NormativeStatistics,
  type CreateNormativeChangeRequest,
} from '@/lib/services/api/normative.service'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const normativeKeys = {
  all: QUERY_KEYS.NORMATIVE_CHANGES,
  lists: () => [...normativeKeys.all, 'list'] as const,
  list: (params: string) => [...normativeKeys.lists(), params] as const,
  details: () => [...normativeKeys.all, 'detail'] as const,
  detail: (id: string) => [...normativeKeys.details(), id] as const,
  statistics: () => [...normativeKeys.all, 'statistics'] as const,
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all normative changes with optional filtering
 */
export function useNormativeChanges(filters?: NormativeFilters & { enabled?: boolean }) {
  const { enabled = true, ...filterParams } = filters || {}

  return useQuery({
    queryKey: normativeKeys.list(JSON.stringify(filterParams)),
    queryFn: () => NormativeService.getNormativeChanges(filterParams),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get normative change by ID
 */
export function useNormativeChange(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: normativeKeys.detail(id || ''),
    queryFn: () => NormativeService.getNormativeChangeById(id!),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get normative changes statistics
 */
export function useNormativeStatistics(enabled: boolean = true) {
  return useQuery({
    queryKey: normativeKeys.statistics(),
    queryFn: () => NormativeService.getStatistics(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create new normative change
 */
export function useCreateNormativeChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNormativeChangeRequest) =>
      NormativeService.createNormativeChange(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: normativeKeys.all })
    },
  })
}

/**
 * Apply normative change
 */
export function useApplyNormativeChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => NormativeService.applyNormativeChange(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: normativeKeys.all })
      queryClient.invalidateQueries({ queryKey: normativeKeys.detail(id) })
    },
  })
}

/**
 * Archive normative change
 */
export function useArchiveNormativeChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => NormativeService.archiveNormativeChange(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: normativeKeys.all })
      queryClient.invalidateQueries({ queryKey: normativeKeys.detail(id) })
    },
  })
}

/**
 * Delete normative change
 */
export function useDeleteNormativeChange() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      NormativeService.deleteNormativeChange(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: normativeKeys.all })
    },
  })
}

// ============================================================================
// COMBINED HOOK FOR CONVENIENCE
// ============================================================================

/**
 * Combined hook providing all normative change operations
 */
export function useNormativeManagement(filters?: NormativeFilters) {
  const queryClient = useQueryClient()

  const {
    data: normativeChanges,
    isLoading,
    error,
    refetch,
  } = useNormativeChanges(filters)

  const { data: statistics, isLoading: statsLoading } = useNormativeStatistics()

  const createMutation = useCreateNormativeChange()
  const applyMutation = useApplyNormativeChange()
  const archiveMutation = useArchiveNormativeChange()
  const deleteMutation = useDeleteNormativeChange()

  return {
    // Data
    normativeChanges: normativeChanges || [],
    statistics,
    isLoading,
    statsLoading,
    error: error?.message || null,

    // Computed selectors
    getPendingChanges: () =>
      normativeChanges?.filter((c) => c.status === 'pending') || [],
    getActiveChanges: () =>
      normativeChanges?.filter((c) => c.status === 'active') || [],
    getArchivedChanges: () =>
      normativeChanges?.filter((c) => c.status === 'archived') || [],
    getHighPriorityChanges: () =>
      normativeChanges?.filter((c) => c.priority === 'high') || [],
    getByCategory: (category: string) =>
      normativeChanges?.filter((c) => c.category === category) || [],

    // Actions
    loadChanges: refetch,
    createChange: createMutation.mutateAsync,
    applyChange: applyMutation.mutateAsync,
    archiveChange: archiveMutation.mutateAsync,
    deleteChange: deleteMutation.mutateAsync,
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: normativeKeys.all }),

    // Mutation states
    isCreating: createMutation.isPending,
    isApplying: applyMutation.isPending,
    isArchiving: archiveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export default useNormativeManagement
