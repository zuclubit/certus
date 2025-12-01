/**
 * useReports Hook - CONSAR Compliance
 *
 * Custom React hook for report operations
 * Uses TanStack Query for data fetching and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ExportService,
  type ReportListParams,
  type GenerateReportRequest,
  type PeriodReportRequest,
  type ComplianceReportRequest,
  type ExportOptions,
} from '@/lib/services/export.adapter'
import type { Report } from '@/types'

// ============================================
// QUERY KEYS
// ============================================

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (params: string) => [...reportKeys.lists(), params] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  statistics: () => [...reportKeys.all, 'statistics'] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook for fetching paginated reports with filters
 */
export function useReports(params: ReportListParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...filterParams } = params

  return useQuery({
    queryKey: reportKeys.list(JSON.stringify(filterParams)),
    queryFn: () => ExportService.getReports(filterParams),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Refetch for real-time status updates
  })
}

/**
 * Hook for fetching report detail
 */
export function useReportDetail(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: reportKeys.detail(id || ''),
    queryFn: () => ExportService.getReportById(id!),
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for fetching report statistics
 */
export function useReportStatistics(enabled: boolean = true) {
  return useQuery({
    queryKey: reportKeys.statistics(),
    queryFn: () => ExportService.getStatistics(),
    enabled,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook for generating a new report
 */
export function useGenerateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: GenerateReportRequest) => ExportService.generateReport(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reportKeys.statistics() })
    },
  })
}

/**
 * Hook for deleting a report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, justification }: { id: string; justification: string }) =>
      ExportService.deleteReport(id, justification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reportKeys.statistics() })
    },
  })
}

/**
 * Hook for retrying a failed report
 */
export function useRetryReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ExportService.retryReport(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: reportKeys.detail(id) })

      const previousData = queryClient.getQueryData(reportKeys.detail(id))

      queryClient.setQueryData(reportKeys.detail(id), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            status: 'processing' as Report['status'],
          },
        }
      })

      return { previousData }
    },
    onError: (_err, id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(reportKeys.detail(id), context.previousData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      queryClient.invalidateQueries({ queryKey: reportKeys.statistics() })
    },
  })
}

/**
 * Hook for exporting a validation to a specific format
 */
export function useExportValidation() {
  return useMutation({
    mutationFn: ({
      validationId,
      format,
      options,
    }: {
      validationId: string
      format: 'pdf' | 'excel' | 'csv' | 'json'
      options?: Partial<ExportOptions>
    }) => ExportService.exportValidation(validationId, format, options),
    onSuccess: (result) => {
      // Automatically download the file
      ExportService.downloadFile(result.data)
    },
  })
}

/**
 * Hook for generating a period report
 */
export function useGeneratePeriodReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: PeriodReportRequest) => ExportService.generatePeriodReport(request),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      ExportService.downloadFile(result.data)
    },
  })
}

/**
 * Hook for generating a compliance report
 */
export function useGenerateComplianceReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: ComplianceReportRequest) =>
      ExportService.generateComplianceReport(request),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      ExportService.downloadFile(result.data)
    },
  })
}

// ============================================
// COMBINED HOOK FOR CONVENIENCE
// ============================================

/**
 * Combined hook providing all report operations
 * Use individual hooks for better tree-shaking
 */
export function useReportsOperations() {
  const queryClient = useQueryClient()

  return {
    // Query hooks
    useReports,
    useReportDetail,
    useReportStatistics,

    // Mutation hooks
    useGenerateReport,
    useDeleteReport,
    useRetryReport,
    useExportValidation,
    useGeneratePeriodReport,
    useGenerateComplianceReport,

    // Utility
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: reportKeys.all }),
  }
}

export default useReportsOperations
