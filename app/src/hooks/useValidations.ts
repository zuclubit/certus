/**
 * useValidations Hook
 *
 * Custom hook for managing validations with TanStack Query
 * Provides reactive data fetching, caching, and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ValidationStatus, FileType } from '@/lib/constants'
import { ValidationService } from '@/lib/services/validation.service'
import type { Validation, ValidationDetail } from '@/types'

// Query keys for cache management
export const validationKeys = {
  all: ['validations'] as const,
  lists: () => [...validationKeys.all, 'list'] as const,
  list: (filters: string) => [...validationKeys.lists(), filters] as const,
  details: () => [...validationKeys.all, 'detail'] as const,
  detail: (id: string) => [...validationKeys.details(), id] as const,
  statistics: () => [...validationKeys.all, 'statistics'] as const,
  recent: () => [...validationKeys.all, 'recent'] as const,
}

/**
 * Hook for fetching paginated validations with filters
 */
export function useValidations(params: {
  page?: number
  pageSize?: number
  status?: ValidationStatus[]
  fileType?: FileType[]
  search?: string
  sortBy?: 'uploadedAt' | 'fileName' | 'status'
  sortOrder?: 'asc' | 'desc'
  enabled?: boolean
}) {
  const { enabled = true, ...filterParams } = params

  return useQuery({
    queryKey: validationKeys.list(JSON.stringify(filterParams)),
    queryFn: () => ValidationService.getValidations(filterParams),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 5000, // Refetch every 5 seconds to update processing status
  })
}

/**
 * Hook for fetching validation detail
 */
export function useValidationDetail(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: validationKeys.detail(id || ''),
    queryFn: () => ValidationService.getValidationById(id!),
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for fetching validation statistics
 */
export function useValidationStatistics(enabled: boolean = true) {
  return useQuery({
    queryKey: validationKeys.statistics(),
    queryFn: () => ValidationService.getStatistics(),
    enabled,
    staleTime: 10000, // 10 seconds
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

/**
 * Hook for fetching recent validations
 */
export function useRecentValidations(limit: number = 5, enabled: boolean = true) {
  return useQuery({
    queryKey: [...validationKeys.recent(), limit],
    queryFn: () => ValidationService.getRecentValidations(limit),
    enabled,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook for uploading files
 */
export function useFileUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ValidationService.uploadFile,
    onSuccess: () => {
      // Invalidate and refetch validations
      queryClient.invalidateQueries({ queryKey: validationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: validationKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: validationKeys.recent() })
    },
  })
}

/**
 * Hook for batch uploading files
 */
export function useBatchUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ files, fileType }: { files: File[]; fileType: FileType }) =>
      ValidationService.batchUpload(files, fileType),
    onSuccess: () => {
      // Invalidate and refetch validations
      queryClient.invalidateQueries({ queryKey: validationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: validationKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: validationKeys.recent() })
    },
  })
}

/**
 * Hook for retrying validation
 */
export function useRetryValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ValidationService.retryValidation(id),
    onMutate: async (id) => {
      // Optimistically update the validation status
      await queryClient.cancelQueries({ queryKey: validationKeys.detail(id) })

      const previousData = queryClient.getQueryData(validationKeys.detail(id))

      queryClient.setQueryData(validationKeys.detail(id), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            status: 'processing' as ValidationStatus,
            progress: 0,
          },
        }
      })

      return { previousData }
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(validationKeys.detail(id), context.previousData)
      }
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: validationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: validationKeys.statistics() })
    },
  })
}

/**
 * Hook for deleting validation (soft delete with justification)
 */
export function useDeleteValidation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, justification }: { id: string; justification?: string }) =>
      ValidationService.deleteValidation(id, justification),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: validationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: validationKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: validationKeys.recent() })
    },
  })
}

/**
 * Hook for downloading validation report
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'excel' | 'csv' }) =>
      ValidationService.downloadReport(id, format),
    onSuccess: (response) => {
      // Trigger download
      const link = document.createElement('a')
      link.href = response.data.url
      link.download = response.data.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
  })
}

/**
 * Hook for searching validations
 */
export function useSearchValidations(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: [...validationKeys.all, 'search', query],
    queryFn: () => ValidationService.searchValidations(query),
    enabled: enabled && query.length > 0,
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook for creating corrected version
 * Complies with CONSAR Circular 19-8 - RETRANSMISION process
 */
export function useCreateCorrectedVersion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ValidationService.createCorrectedVersion(id, reason),
    onSuccess: (response) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: validationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: validationKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: validationKeys.recent() })

      // Invalidate version chain for both original and new version
      if (response.data.replacesId) {
        queryClient.invalidateQueries({ queryKey: ['versionChain', response.data.replacesId] })
      }
      queryClient.invalidateQueries({ queryKey: ['versionChain', response.data.id] })
    },
  })
}

/**
 * Hook for fetching version chain
 */
export function useVersionChain(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: ['versionChain', id],
    queryFn: () => ValidationService.getVersionChain(id!),
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  })
}
