/**
 * useCatalogs Hook - Catalog Management with React Query
 *
 * Enterprise-grade catalog management hook with:
 * - CRUD operations for CONSAR catalogs
 * - Real-time data from API
 * - Search and filtering
 * - Catalog entries management
 *
 * Uses TanStack Query for data fetching and caching
 * Uses real API service (no mocks)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Catalog, CatalogEntry, ApiResponse } from '@/types'
import { CatalogService, type CatalogFilters, type CatalogEntryFilters, type CreateCatalogData } from '@/lib/services/api/catalog.service'

// ============================================================================
// QUERY KEYS
// ============================================================================

export const catalogKeys = {
  all: ['catalogs'] as const,
  lists: () => [...catalogKeys.all, 'list'] as const,
  list: (params: string) => [...catalogKeys.lists(), params] as const,
  details: () => [...catalogKeys.all, 'detail'] as const,
  detail: (id: string) => [...catalogKeys.details(), id] as const,
  byCode: (code: string) => [...catalogKeys.all, 'code', code] as const,
  bySource: (source: string) => [...catalogKeys.all, 'source', source] as const,
  entries: (catalogId: string, params: string) => [...catalogKeys.all, catalogId, 'entries', params] as const,
  search: (catalogId: string, query: string) => [...catalogKeys.all, catalogId, 'search', query] as const,
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CatalogWithEntries extends Catalog {
  entries: CatalogEntry[]
}

export interface CreateCatalogData {
  code: string
  name: string
  description?: string
  version?: string
  source?: string
}

export interface CreateEntryData {
  key: string
  value: string
  displayName?: string
  description?: string
  sortOrder?: number
  parentKey?: string
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all catalogs with optional filtering
 */
export function useCatalogs(filters?: CatalogFilters & { enabled?: boolean }) {
  const { enabled = true, ...filterParams } = filters || {}

  return useQuery({
    queryKey: catalogKeys.list(JSON.stringify(filterParams)),
    queryFn: async () => {
      const response = await CatalogService.getCatalogs(filterParams)
      // Response is PaginatedResponse, extract data array
      return response.data || response
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - catalogs don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Get catalog by ID with entries
 */
export function useCatalog(catalogId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: catalogKeys.detail(catalogId || ''),
    queryFn: async () => {
      const response = await CatalogService.getCatalogById(catalogId!)
      return response.data
    },
    enabled: enabled && !!catalogId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get catalog by code (e.g., 'AFORES', 'FILE_TYPES')
 */
export function useCatalogByCode(code: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: catalogKeys.byCode(code || ''),
    queryFn: async () => {
      const response = await CatalogService.getCatalogByCode(code!)
      return response.data
    },
    enabled: enabled && !!code,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Get catalogs by source (e.g., 'CONSAR', 'INTERNO')
 */
export function useCatalogsBySource(source: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: catalogKeys.bySource(source || ''),
    queryFn: async () => {
      const response = await CatalogService.getCatalogsBySource(source!)
      return response.data
    },
    enabled: enabled && !!source,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get catalog entries with optional filtering
 */
export function useCatalogEntries(
  catalogId: string | undefined,
  params?: CatalogEntryFilters & { enabled?: boolean }
) {
  const { enabled = true, ...filterParams } = params || {}

  return useQuery({
    queryKey: catalogKeys.entries(catalogId || '', JSON.stringify(filterParams)),
    queryFn: async () => {
      const response = await CatalogService.getCatalogEntries(catalogId!, filterParams)
      return response.data || response
    },
    enabled: enabled && !!catalogId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Search catalog entries
 */
export function useSearchCatalogEntries(catalogId: string | undefined, query: string) {
  return useQuery({
    queryKey: catalogKeys.search(catalogId || '', query),
    queryFn: async () => {
      if (!query || query.length < 2) {
        return []
      }
      const response = await CatalogService.searchCatalogEntries(catalogId!, query)
      return response.data
    },
    enabled: !!catalogId && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Get AFOREs catalog entries (convenience hook)
 */
export function useAfores(enabled: boolean = true) {
  return useQuery({
    queryKey: [...catalogKeys.all, 'afores'],
    queryFn: async () => {
      const response = await CatalogService.getAfores()
      return response.data
    },
    enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes - AFOREs don't change often
  })
}

/**
 * Get file types catalog entries (convenience hook)
 */
export function useFileTypes(enabled: boolean = true) {
  return useQuery({
    queryKey: [...catalogKeys.all, 'fileTypes'],
    queryFn: async () => {
      const response = await CatalogService.getFileTypes()
      return response.data
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Get validation statuses catalog entries (convenience hook)
 */
export function useValidationStatuses(enabled: boolean = true) {
  return useQuery({
    queryKey: [...catalogKeys.all, 'validationStatuses'],
    queryFn: async () => {
      const response = await CatalogService.getValidationStatuses()
      return response.data
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  })
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Validate entry exists in catalog
 */
export function useValidateEntry() {
  return useMutation({
    mutationFn: async ({ catalogCode, entryCode }: { catalogCode: string; entryCode: string }): Promise<boolean> => {
      return CatalogService.validateEntry(catalogCode, entryCode)
    },
  })
}

/**
 * Create a new catalog
 */
export function useCreateCatalog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCatalogData) => {
      const response = await CatalogService.createCatalog(data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate catalogs list to trigger refetch
      queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

/**
 * Delete a catalog (soft delete with justification)
 */
export function useDeleteCatalog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, justification }: { id: string; justification: string }) => {
      return CatalogService.deleteCatalog(id, justification)
    },
    onSuccess: () => {
      // Invalidate catalogs list to trigger refetch
      queryClient.invalidateQueries({ queryKey: catalogKeys.all })
    },
  })
}

// ============================================================================
// COMBINED HOOK FOR CONVENIENCE
// ============================================================================

/**
 * Combined hook providing all catalog operations
 * Use individual hooks for better tree-shaking
 */
export function useCatalogManagement(params: CatalogFilters = {}) {
  const queryClient = useQueryClient()

  // Query for catalogs list
  const {
    data: catalogs,
    isLoading,
    error,
    refetch,
  } = useCatalogs(params)

  return {
    // Data
    catalogs: catalogs || [],
    isLoading,
    error: error?.message || null,

    // Computed selectors
    getCatalogById: (id: string) => catalogs?.find((c) => c.id === id),
    getCatalogByCode: (code: string) => catalogs?.find((c) => c.code === code),
    getActiveCatalogs: () => catalogs?.filter((c) => c.isActive) || [],
    getCatalogsBySource: (source: string) => catalogs?.filter((c) => c.source === source) || [],

    // Actions
    loadCatalogs: refetch,
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: catalogKeys.all }),

    // Hooks for component use
    useCatalog,
    useCatalogs,
    useCatalogByCode,
    useCatalogsBySource,
    useCatalogEntries,
    useSearchCatalogEntries,
    useAfores,
    useFileTypes,
    useValidationStatuses,
    useValidateEntry,
  }
}

// Default export for backwards compatibility
export default useCatalogManagement
