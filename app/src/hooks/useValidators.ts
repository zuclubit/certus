/**
 * useValidators Hook - CONSAR Compliance
 *
 * Custom React hooks for validator configuration operations
 * Uses TanStack Query for data fetching and caching
 * Uses adapter pattern for API operations (always real API)
 */

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ValidatorService } from '@/lib/services/validator.adapter'
import type { ValidatorListParams } from '@/lib/services/validator.adapter'
import type { ValidatorRule, ValidatorCriticality, ValidatorStatus } from '@/types/validator.types'

// ============================================
// QUERY KEYS
// ============================================

export const validatorKeys = {
  all: ['validators'] as const,
  lists: () => [...validatorKeys.all, 'list'] as const,
  list: (params: string) => [...validatorKeys.lists(), params] as const,
  details: () => [...validatorKeys.all, 'detail'] as const,
  detail: (id: string) => [...validatorKeys.details(), id] as const,
  groups: () => [...validatorKeys.all, 'groups'] as const,
  categories: () => [...validatorKeys.all, 'categories'] as const,
  byFileType: (fileType: string) => [...validatorKeys.all, 'byFileType', fileType] as const,
  byGroup: (groupId: string) => [...validatorKeys.all, 'byGroup', groupId] as const,
  activeCount: () => [...validatorKeys.all, 'activeCount'] as const,
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Hook for fetching paginated validators with filters
 */
export function useValidatorsList(params: ValidatorListParams & { enabled?: boolean } = {}) {
  const { enabled = true, ...filterParams } = params

  return useQuery({
    queryKey: validatorKeys.list(JSON.stringify(filterParams)),
    queryFn: () => ValidatorService.getValidators(filterParams),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: false, // Disable auto-refetch for validators (config doesn't change often)
  })
}

/**
 * Hook for fetching validator detail
 */
export function useValidatorDetail(id: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: validatorKeys.detail(id || ''),
    queryFn: () => ValidatorService.getValidatorById(id!),
    enabled: enabled && !!id && id !== 'new',
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook for fetching validator groups
 */
export function useValidatorGroups(enabled: boolean = true) {
  return useQuery({
    queryKey: validatorKeys.groups(),
    queryFn: () => ValidatorService.getGroups(),
    enabled,
    staleTime: 300000, // 5 minutes (groups don't change often)
  })
}

/**
 * Hook for fetching validator categories
 */
export function useValidatorCategories(enabled: boolean = true) {
  return useQuery({
    queryKey: validatorKeys.categories(),
    queryFn: () => ValidatorService.getCategories(),
    enabled,
    staleTime: 300000, // 5 minutes
  })
}

/**
 * Hook for fetching validators by file type
 */
export function useValidatorsByFileType(fileType: string, enabled: boolean = true) {
  return useQuery({
    queryKey: validatorKeys.byFileType(fileType),
    queryFn: () => ValidatorService.getValidatorsByFileType(fileType),
    enabled: enabled && !!fileType,
    staleTime: 60000,
  })
}

/**
 * Hook for fetching validators by group
 */
export function useValidatorsByGroup(groupId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: validatorKeys.byGroup(groupId),
    queryFn: () => ValidatorService.getValidatorsByGroup(groupId),
    enabled: enabled && !!groupId,
    staleTime: 60000,
  })
}

/**
 * Hook for fetching active validators count
 */
export function useActiveValidatorsCount(enabled: boolean = true) {
  return useQuery({
    queryKey: validatorKeys.activeCount(),
    queryFn: () => ValidatorService.getActiveCount(),
    enabled,
    staleTime: 30000,
  })
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Hook for toggling validator enabled/disabled
 */
export function useToggleValidator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ValidatorService.toggleValidator(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: validatorKeys.detail(id) })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(validatorKeys.detail(id))

      // Optimistically update
      queryClient.setQueryData(validatorKeys.detail(id), (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: {
            ...old.data,
            isEnabled: !old.data.isEnabled,
          },
        }
      })

      return { previousData }
    },
    onError: (_err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(validatorKeys.detail(id), context.previousData)
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: validatorKeys.lists() })
      queryClient.invalidateQueries({ queryKey: validatorKeys.activeCount() })
    },
  })
}

/**
 * Hook for updating validator configuration
 */
export function useUpdateValidatorConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, config }: { id: string; config: Parameters<typeof ValidatorService.updateConfig>[1] }) =>
      ValidatorService.updateConfig(id, config),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: validatorKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: validatorKeys.lists() })
    },
  })
}

/**
 * Hook for bulk enabling validators
 */
export function useBulkEnableValidators() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => ValidatorService.bulkEnable(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: validatorKeys.lists() })
      queryClient.invalidateQueries({ queryKey: validatorKeys.activeCount() })
    },
  })
}

/**
 * Hook for bulk disabling validators
 */
export function useBulkDisableValidators() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => ValidatorService.bulkDisable(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: validatorKeys.lists() })
      queryClient.invalidateQueries({ queryKey: validatorKeys.activeCount() })
    },
  })
}

/**
 * Hook for testing validator with sample data
 */
export function useTestValidator() {
  return useMutation({
    mutationFn: ({ id, testData }: { id: string; testData: Record<string, unknown> }) =>
      ValidatorService.testValidator(id, testData),
  })
}

// ============================================
// COMBINED HOOK FOR CONVENIENCE
// ============================================

/**
 * Combined hook providing all validator operations
 * Use individual hooks for better tree-shaking
 */
export function useValidators(params: ValidatorListParams = {}) {
  const queryClient = useQueryClient()

  // Query for validators list
  const {
    data: validatorsResponse,
    isLoading,
    error,
    refetch,
  } = useValidatorsList(params)

  // Extract validators from response
  const validators = validatorsResponse?.data || []
  const totalValidators = validatorsResponse?.total || 0
  const currentPage = validatorsResponse?.page || 1
  const pageSize = validatorsResponse?.pageSize || 50

  // Toggle mutation
  const toggleMutation = useToggleValidator()

  return {
    // Data
    validators,
    totalValidators,
    currentPage,
    pageSize,
    isLoading,
    error: error?.message || null,

    // Computed selectors (work with local data)
    getValidatorById: (id: string) => validators.find((v) => v.id === id),
    getValidatorByCode: (code: string) => validators.find((v) => v.code === code),
    getValidatorsByType: (type: string) => validators.filter((v) => v.type === type),
    getValidatorsByCriticality: (criticality: ValidatorCriticality) =>
      validators.filter((v) => v.criticality === criticality),
    getValidatorsByStatus: (status: ValidatorStatus) =>
      validators.filter((v) => v.status === status),
    getActiveValidators: () => validators.filter((v) => v.isEnabled),

    // Actions
    loadValidators: refetch,
    toggleValidator: (id: string) => toggleMutation.mutateAsync(id),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: validatorKeys.all }),

    // Hooks for component use
    useValidatorsList,
    useValidatorDetail,
    useValidatorGroups,
    useValidatorCategories,
    useToggleValidator,
    useUpdateValidatorConfig,
    useBulkEnableValidators,
    useBulkDisableValidators,
    useTestValidator,
  }
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

/**
 * Hook for validator detail page
 */
export function useValidatorDetailPage(validatorId: string) {
  const { data: validatorResponse, isLoading, error, refetch } = useValidatorDetail(validatorId)

  return {
    validator: validatorResponse?.data || null,
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

// ============================================
// TEST CASE TYPES
// ============================================

export interface ValidatorTestCase {
  id: string
  name: string
  description?: string
  input: Record<string, unknown>
  expectedResult: 'pass' | 'fail'
  createdAt: string
}

export interface ValidatorTestResult {
  testCaseId: string
  passed: boolean
  message?: string
  errors?: string[]
  executedAt: string
  duration?: number
}

// ============================================
// VALIDATOR TESTING HOOK
// ============================================

/**
 * Hook for validator testing functionality
 * Manages test cases locally and uses real API for test execution
 */
export function useValidatorTesting(validatorId: string | undefined) {
  const [testCases, setTestCases] = React.useState<ValidatorTestCase[]>([])
  const [testResults, setTestResults] = React.useState<Map<string, ValidatorTestResult>>(new Map())
  const [isLoading, setIsLoading] = React.useState(false)

  const testMutation = useTestValidator()

  // Run a single test case
  const runTest = React.useCallback(async (testCaseId: string) => {
    if (!validatorId) return

    const testCase = testCases.find((tc) => tc.id === testCaseId)
    if (!testCase) return

    setIsLoading(true)
    const startTime = Date.now()

    try {
      const result = await testMutation.mutateAsync({
        id: validatorId,
        testData: testCase.input,
      })

      const testResult: ValidatorTestResult = {
        testCaseId,
        passed: result.data.passed,
        message: result.data.message,
        errors: result.data.errors,
        executedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      }

      setTestResults((prev) => new Map(prev).set(testCaseId, testResult))
    } catch (error) {
      const testResult: ValidatorTestResult = {
        testCaseId,
        passed: false,
        message: error instanceof Error ? error.message : 'Test execution failed',
        executedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
      }
      setTestResults((prev) => new Map(prev).set(testCaseId, testResult))
    } finally {
      setIsLoading(false)
    }
  }, [validatorId, testCases, testMutation])

  // Run all tests for validator
  const runTestsForValidator = React.useCallback(async (id: string) => {
    if (!id || testCases.length === 0) return

    setIsLoading(true)

    for (const testCase of testCases) {
      await runTest(testCase.id)
    }

    setIsLoading(false)
  }, [testCases, runTest])

  // Add a test case
  const addTestCase = React.useCallback((testCase: Omit<ValidatorTestCase, 'id' | 'createdAt'>) => {
    const newTestCase: ValidatorTestCase = {
      ...testCase,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setTestCases((prev) => [...prev, newTestCase])
    return newTestCase
  }, [])

  // Remove a test case
  const removeTestCase = React.useCallback((testCaseId: string) => {
    setTestCases((prev) => prev.filter((tc) => tc.id !== testCaseId))
    setTestResults((prev) => {
      const newResults = new Map(prev)
      newResults.delete(testCaseId)
      return newResults
    })
  }, [])

  // Clear all results
  const clearResults = React.useCallback(() => {
    setTestResults(new Map())
  }, [])

  return {
    testCases,
    testResults: Object.fromEntries(testResults),
    isLoading,
    runTest,
    runTestsForValidator,
    addTestCase,
    removeTestCase,
    clearResults,
  }
}

/**
 * Hook for validator groups management
 */
export function useValidatorGroupsManagement() {
  const { data: groupsResponse, isLoading, error, refetch } = useValidatorGroups()

  return {
    groups: groupsResponse?.data || [],
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  }
}

// Default export for backwards compatibility
export default useValidators
