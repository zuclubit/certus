/**
 * useValidators Hook - CONSAR Compliance
 *
 * Custom React hook for validator configuration and testing
 * Combines store state with service methods for visual editor and playground
 */

import { useCallback, useEffect, useMemo } from 'react'
import { useValidatorStore } from '@/stores/validatorStore'
import { validatorService } from '@/services/validator.service'
import type {
  ValidatorRule,
  ValidatorGroup,
  ValidatorPreset,
  ValidatorTestCase,
  ValidatorFilters,
  ValidatorEditorState,
  ValidatorType,
  ValidatorCriticality,
  ValidatorStatus,
} from '@/types/validator.types'

// ============================================
// MAIN HOOK
// ============================================

export function useValidators() {
  const store = useValidatorStore()

  // ============================================
  // FETCH OPERATIONS
  // ============================================

  /**
   * Load validators from API
   */
  const loadValidators = useCallback(async () => {
    store.setLoading(true)
    store.setError(null)

    try {
      const validators = await validatorService.getValidators(store.filters)
      store.setValidators(validators)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar validadores'
      store.setError(message)
    } finally {
      store.setLoading(false)
    }
  }, [store.filters])

  /**
   * Load single validator by ID
   */
  const loadValidatorById = useCallback(async (id: string) => {
    store.setLoading(true)
    store.setError(null)

    try {
      const validator = await validatorService.getValidatorById(id)
      store.setSelectedValidator(validator)
      return validator
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar validador'
      store.setError(message)
      throw error
    } finally {
      store.setLoading(false)
    }
  }, [])

  /**
   * Load groups
   */
  const loadGroups = useCallback(async () => {
    try {
      const groups = await validatorService.getGroups()
      store.setGroups(groups)
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }, [])

  /**
   * Load presets
   */
  const loadPresets = useCallback(async () => {
    try {
      const presets = await validatorService.getPresets()
      store.setPresets(presets)
    } catch (error) {
      console.error('Error loading presets:', error)
    }
  }, [])

  /**
   * Load test cases
   */
  const loadTestCases = useCallback(async (validatorId?: string) => {
    try {
      const testCases = await validatorService.getTestCases(validatorId)
      store.setTestCases(testCases)
    } catch (error) {
      console.error('Error loading test cases:', error)
    }
  }, [])

  /**
   * Load metrics
   */
  const loadMetrics = useCallback(async (validatorId?: string) => {
    try {
      const metrics = await validatorService.getMetrics(validatorId)
      store.setMetrics(metrics)
    } catch (error) {
      console.error('Error loading metrics:', error)
    }
  }, [])

  // ============================================
  // VALIDATOR CRUD
  // ============================================

  /**
   * Create new validator
   */
  const createValidator = useCallback(
    async (validator: Omit<ValidatorRule, 'id'>) => {
      store.setLoading(true)
      try {
        const created = await validatorService.createValidator(validator)
        store.addValidator(created)
        return created
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al crear validador'
        store.setError(message)
        throw error
      } finally {
        store.setLoading(false)
      }
    },
    []
  )

  /**
   * Update validator
   */
  const updateValidator = useCallback(
    async (id: string, updates: Partial<ValidatorRule>) => {
      store.setLoading(true)
      try {
        const updated = await validatorService.updateValidator(id, updates)
        store.updateValidator(id, updated)
        return updated
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al actualizar validador'
        store.setError(message)
        throw error
      } finally {
        store.setLoading(false)
      }
    },
    []
  )

  /**
   * Delete validator
   */
  const deleteValidator = useCallback(async (id: string) => {
    store.setLoading(true)
    try {
      await validatorService.deleteValidator(id)
      store.removeValidator(id)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar validador'
      store.setError(message)
      throw error
    } finally {
      store.setLoading(false)
    }
  }, [])

  /**
   * Duplicate validator
   */
  const duplicateValidator = useCallback(
    (id: string) => {
      store.duplicateValidator(id)
    },
    []
  )

  /**
   * Toggle validator status
   */
  const toggleValidator = useCallback(
    (id: string) => {
      store.toggleValidatorStatus(id)
    },
    []
  )

  // ============================================
  // TESTING PLAYGROUND
  // ============================================

  /**
   * Run single test case
   */
  const runTest = useCallback(async (testCaseId: string) => {
    return await store.runTest(testCaseId)
  }, [])

  /**
   * Run all tests for a validator
   */
  const runTestsForValidator = useCallback(async (validatorId: string) => {
    return await store.runTestsForValidator(validatorId)
  }, [])

  /**
   * Run all tests
   */
  const runAllTests = useCallback(async () => {
    return await store.runAllTests()
  }, [])

  /**
   * Add test case
   */
  const addTestCase = useCallback(
    (testCase: ValidatorTestCase) => {
      store.addTestCase(testCase)
    },
    []
  )

  /**
   * Update test case
   */
  const updateTestCase = useCallback(
    (id: string, updates: Partial<ValidatorTestCase>) => {
      store.updateTestCase(id, updates)
    },
    []
  )

  /**
   * Delete test case
   */
  const deleteTestCase = useCallback(
    (id: string) => {
      store.removeTestCase(id)
    },
    []
  )

  // ============================================
  // VALIDATION EXECUTION
  // ============================================

  /**
   * Validate file
   */
  const validateFile = useCallback(async (fileId: string, presetId?: string) => {
    return await store.validateFile(fileId, presetId)
  }, [])

  // ============================================
  // VISUAL EDITOR
  // ============================================

  /**
   * Initialize editor with validator
   */
  const initializeEditor = useCallback(
    (validator: ValidatorRule) => {
      // Convert validator to editor state
      const editorState: ValidatorEditorState = {
        nodes: [],
        edges: [],
        zoom: 1,
        viewport: { x: 0, y: 0 },
      }
      store.setEditorState(editorState)
    },
    []
  )

  /**
   * Update editor state
   */
  const updateEditor = useCallback(
    (updates: Partial<ValidatorEditorState>) => {
      store.updateEditorState(updates)
    },
    []
  )

  /**
   * Save editor state as validator
   */
  const saveEditor = useCallback(async () => {
    await store.saveEditorState()
  }, [])

  /**
   * Reset editor
   */
  const resetEditor = useCallback(() => {
    store.resetEditor()
  }, [])

  // ============================================
  // IMPORT/EXPORT
  // ============================================

  /**
   * Export validators
   */
  const exportValidators = useCallback(
    (validatorIds: string[]) => {
      return store.exportValidators(validatorIds)
    },
    []
  )

  /**
   * Import validators
   */
  const importValidators = useCallback(async (data: string) => {
    await store.importValidators(data)
  }, [])

  // ============================================
  // FILTERS
  // ============================================

  /**
   * Set filters
   */
  const setFilters = useCallback(
    (filters: Partial<ValidatorFilters>) => {
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

  // ============================================
  // RETURN API
  // ============================================

  return {
    // State
    validators: store.validators,
    groups: store.groups,
    presets: store.presets,
    testCases: store.testCases,
    testResults: store.testResults,
    testBatches: store.testBatches,
    metrics: store.metrics,
    reports: store.reports,
    selectedValidator: store.selectedValidator,
    selectedGroup: store.selectedGroup,
    selectedPreset: store.selectedPreset,
    selectedTestCase: store.selectedTestCase,
    editorState: store.editorState,
    isEditorDirty: store.isEditorDirty,
    filters: store.filters,
    isLoading: store.isLoading,
    error: store.error,
    validationInProgress: store.validationInProgress,

    // Selectors
    getValidatorById: store.getValidatorById,
    getValidatorByCode: store.getValidatorByCode,
    getValidatorsByType: store.getValidatorsByType,
    getValidatorsByCriticality: store.getValidatorsByCriticality,
    getValidatorsByStatus: store.getValidatorsByStatus,
    getActiveValidators: store.getActiveValidators,
    getTestCasesByValidator: store.getTestCasesByValidator,
    getTestResultsByValidator: store.getTestResultsByValidator,
    getMetricsByValidator: store.getMetricsByValidator,

    // Actions - Data Loading
    loadValidators,
    loadValidatorById,
    loadGroups,
    loadPresets,
    loadTestCases,
    loadMetrics,

    // Actions - CRUD
    createValidator,
    updateValidator,
    deleteValidator,
    duplicateValidator,
    toggleValidator,

    // Actions - Selection
    setSelectedValidator: store.setSelectedValidator,
    setSelectedGroup: store.setSelectedGroup,
    setSelectedPreset: store.setSelectedPreset,
    setSelectedTestCase: store.setSelectedTestCase,

    // Actions - Testing
    runTest,
    runTestsForValidator,
    runAllTests,
    addTestCase,
    updateTestCase,
    deleteTestCase,

    // Actions - Validation
    validateFile,

    // Actions - Visual Editor
    initializeEditor,
    updateEditor,
    saveEditor,
    resetEditor,

    // Actions - Import/Export
    exportValidators,
    importValidators,

    // Actions - Filters
    setFilters,
    resetFilters,

    // Actions - Groups
    addGroup: store.addGroup,
    updateGroup: store.updateGroup,
    removeGroup: store.removeGroup,

    // Actions - Presets
    addPreset: store.addPreset,
    updatePreset: store.updatePreset,
    removePreset: store.removePreset,
    setDefaultPreset: store.setDefaultPreset,
  }
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

/**
 * Hook for validator detail
 */
export function useValidatorDetail(validatorId: string) {
  // Get individual state slices to avoid re-renders
  const selectedValidator = useValidatorStore((state) => state.selectedValidator)
  const testCases = useValidatorStore((state) => state.testCases)
  const isLoading = useValidatorStore((state) => state.isLoading)
  const error = useValidatorStore((state) => state.error)
  const setLoading = useValidatorStore((state) => state.setLoading)
  const setSelectedValidator = useValidatorStore((state) => state.setSelectedValidator)
  const setError = useValidatorStore((state) => state.setError)
  const setTestCases = useValidatorStore((state) => state.setTestCases)

  // Load validator data only when validatorId changes
  useEffect(() => {
    if (validatorId && validatorId !== 'new') {
      // Load validator
      setLoading(true)
      validatorService.getValidatorById(validatorId)
        .then((validator) => {
          setSelectedValidator(validator)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Error al cargar validador')
        })
        .finally(() => {
          setLoading(false)
        })

      // Load test cases
      validatorService.getTestCases(validatorId)
        .then((cases) => {
          setTestCases(cases)
        })
        .catch(console.error)
    }
  }, [validatorId, setLoading, setSelectedValidator, setError, setTestCases])

  // Memoize filtered test cases
  const validatorTestCases = useMemo(
    () => testCases.filter((tc) => tc.validatorId === validatorId),
    [testCases, validatorId]
  )

  const refresh = useCallback(() => {
    if (validatorId && validatorId !== 'new') {
      validatorService.getValidatorById(validatorId)
        .then((validator) => setSelectedValidator(validator))
        .catch(console.error)
      validatorService.getTestCases(validatorId)
        .then((cases) => setTestCases(cases))
        .catch(console.error)
    }
  }, [validatorId, setSelectedValidator, setTestCases])

  return {
    validator: selectedValidator,
    testCases: validatorTestCases,
    isLoading,
    error,
    refresh,
  }
}

/**
 * Hook for validator testing
 */
export function useValidatorTesting(validatorId?: string) {
  // Get individual state slices
  const testCases = useValidatorStore((state) => state.testCases)
  const testResults = useValidatorStore((state) => state.testResults)
  const testBatches = useValidatorStore((state) => state.testBatches)
  const isLoading = useValidatorStore((state) => state.isLoading)
  const setTestCases = useValidatorStore((state) => state.setTestCases)
  const runTestStore = useValidatorStore((state) => state.runTest)
  const runTestsForValidatorStore = useValidatorStore((state) => state.runTestsForValidator)
  const runAllTestsStore = useValidatorStore((state) => state.runAllTests)

  useEffect(() => {
    validatorService.getTestCases(validatorId)
      .then((cases) => setTestCases(cases))
      .catch(console.error)
  }, [validatorId, setTestCases])

  // Memoize filtered results
  const filteredTestCases = useMemo(
    () => validatorId
      ? testCases.filter((tc) => tc.validatorId === validatorId)
      : testCases,
    [testCases, validatorId]
  )

  const filteredTestResults = useMemo(
    () => validatorId
      ? testResults.filter((tr) => tr.validatorId === validatorId)
      : testResults,
    [testResults, validatorId]
  )

  const runTest = useCallback(async (testCaseId: string) => {
    return await runTestStore(testCaseId)
  }, [runTestStore])

  const runTestsForValidator = useCallback(async (valId: string) => {
    return await runTestsForValidatorStore(valId)
  }, [runTestsForValidatorStore])

  const refresh = useCallback(() => {
    validatorService.getTestCases(validatorId)
      .then((cases) => setTestCases(cases))
      .catch(console.error)
  }, [validatorId, setTestCases])

  return {
    testCases: filteredTestCases,
    testResults: filteredTestResults,
    testBatches,
    isLoading,
    runTest,
    runTestsForValidator,
    runAllTests: runAllTestsStore,
    refresh,
  }
}

/**
 * Hook for validator metrics
 */
export function useValidatorMetrics(validatorId?: string) {
  const { loadMetrics, metrics, isLoading } = useValidators()

  useEffect(() => {
    loadMetrics(validatorId)
  }, [validatorId, loadMetrics])

  const filteredMetrics = validatorId
    ? metrics.find((m) => m.validatorId === validatorId)
    : undefined

  return {
    metrics: filteredMetrics,
    allMetrics: metrics,
    isLoading,
    refresh: () => loadMetrics(validatorId),
  }
}

/**
 * Hook for validator presets
 */
export function useValidatorPresets() {
  const { loadPresets, presets, selectedPreset, setSelectedPreset, setDefaultPreset, isLoading } =
    useValidators()

  useEffect(() => {
    loadPresets()
  }, [loadPresets])

  const defaultPreset = presets.find((p) => p.isDefault)

  return {
    presets,
    selectedPreset,
    defaultPreset,
    setSelectedPreset,
    setDefaultPreset,
    isLoading,
    refresh: loadPresets,
  }
}

/**
 * Hook for visual validator editor
 */
export function useValidatorEditor() {
  const {
    editorState,
    isEditorDirty,
    initializeEditor,
    updateEditor,
    saveEditor,
    resetEditor,
    isLoading,
  } = useValidators()

  return {
    editorState,
    isEditorDirty,
    isLoading,
    initializeEditor,
    updateEditor,
    saveEditor,
    resetEditor,
  }
}

/**
 * Hook for validator groups
 */
export function useValidatorGroups() {
  const { loadGroups, groups, selectedGroup, setSelectedGroup, addGroup, updateGroup, removeGroup, isLoading } =
    useValidators()

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  return {
    groups,
    selectedGroup,
    setSelectedGroup,
    addGroup,
    updateGroup,
    removeGroup,
    isLoading,
    refresh: loadGroups,
  }
}
