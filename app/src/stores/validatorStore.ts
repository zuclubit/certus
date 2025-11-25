/**
 * Validator Configuration Store - CONSAR Compliance
 *
 * Zustand store for managing validator rules, presets, and testing
 * Supports visual editor state and validation execution
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  ValidatorRule,
  ValidatorGroup,
  ValidatorPreset,
  ValidatorTestCase,
  ValidatorTestResult,
  ValidatorTestBatch,
  ValidatorMetrics,
  ValidatorEditorState,
  ValidatorFilters,
  ValidatorType,
  ValidationReport,
} from '@/types/validator.types'
import { ValidatorStatus, ValidatorCriticality } from '@/types/validator.types'

// ============================================
// STATE INTERFACE
// ============================================

interface ValidatorState {
  // Data
  validators: ValidatorRule[]
  groups: ValidatorGroup[]
  presets: ValidatorPreset[]
  testCases: ValidatorTestCase[]
  testResults: ValidatorTestResult[]
  testBatches: ValidatorTestBatch[]
  metrics: ValidatorMetrics[]
  reports: ValidationReport[]

  // Selected items
  selectedValidator: ValidatorRule | null
  selectedGroup: ValidatorGroup | null
  selectedPreset: ValidatorPreset | null
  selectedTestCase: ValidatorTestCase | null

  // Visual editor state
  editorState: ValidatorEditorState | null
  isEditorDirty: boolean

  // UI State
  filters: ValidatorFilters
  isLoading: boolean
  error: string | null
  validationInProgress: boolean

  // Selectors
  getValidatorById: (id: string) => ValidatorRule | undefined
  getValidatorByCode: (code: string) => ValidatorRule | undefined
  getValidatorsByType: (type: ValidatorType) => ValidatorRule[]
  getValidatorsByCriticality: (criticality: ValidatorCriticality) => ValidatorRule[]
  getValidatorsByStatus: (status: ValidatorStatus) => ValidatorRule[]
  getActiveValidators: () => ValidatorRule[]
  getTestCasesByValidator: (validatorId: string) => ValidatorTestCase[]
  getTestResultsByValidator: (validatorId: string) => ValidatorTestResult[]
  getMetricsByValidator: (validatorId: string) => ValidatorMetrics | undefined

  // Actions - Validators
  setValidators: (validators: ValidatorRule[]) => void
  addValidator: (validator: ValidatorRule) => void
  updateValidator: (id: string, updates: Partial<ValidatorRule>) => void
  removeValidator: (id: string) => void
  duplicateValidator: (id: string) => void
  setSelectedValidator: (validator: ValidatorRule | null) => void
  toggleValidatorStatus: (id: string) => void

  // Actions - Groups
  setGroups: (groups: ValidatorGroup[]) => void
  addGroup: (group: ValidatorGroup) => void
  updateGroup: (id: string, updates: Partial<ValidatorGroup>) => void
  removeGroup: (id: string) => void
  setSelectedGroup: (group: ValidatorGroup | null) => void

  // Actions - Presets
  setPresets: (presets: ValidatorPreset[]) => void
  addPreset: (preset: ValidatorPreset) => void
  updatePreset: (id: string, updates: Partial<ValidatorPreset>) => void
  removePreset: (id: string) => void
  setSelectedPreset: (preset: ValidatorPreset | null) => void
  setDefaultPreset: (id: string) => void

  // Actions - Test Cases
  setTestCases: (testCases: ValidatorTestCase[]) => void
  addTestCase: (testCase: ValidatorTestCase) => void
  updateTestCase: (id: string, updates: Partial<ValidatorTestCase>) => void
  removeTestCase: (id: string) => void
  setSelectedTestCase: (testCase: ValidatorTestCase | null) => void

  // Actions - Testing
  runTest: (testCaseId: string) => Promise<ValidatorTestResult>
  runTestsForValidator: (validatorId: string) => Promise<ValidatorTestBatch>
  runAllTests: () => Promise<ValidatorTestBatch>
  setTestResults: (results: ValidatorTestResult[]) => void
  setTestBatches: (batches: ValidatorTestBatch[]) => void

  // Actions - Validation Execution
  validateFile: (fileId: string, presetId?: string) => Promise<ValidationReport>
  setReports: (reports: ValidationReport[]) => void
  getReportById: (id: string) => ValidationReport | undefined

  // Actions - Metrics
  setMetrics: (metrics: ValidatorMetrics[]) => void
  refreshMetrics: (validatorId?: string) => Promise<void>

  // Actions - Visual Editor
  setEditorState: (state: ValidatorEditorState | null) => void
  updateEditorState: (updates: Partial<ValidatorEditorState>) => void
  setEditorDirty: (dirty: boolean) => void
  saveEditorState: () => Promise<void>
  resetEditor: () => void

  // Actions - Import/Export
  exportValidators: (validatorIds: string[]) => string
  importValidators: (data: string) => Promise<void>

  // Actions - Filters
  setFilters: (filters: Partial<ValidatorFilters>) => void
  resetFilters: () => void

  // Actions - UI State
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setValidationInProgress: (inProgress: boolean) => void

  // Actions - Reset
  reset: () => void
}

// ============================================
// INITIAL STATE
// ============================================

const initialFilters: ValidatorFilters = {
  status: undefined,
  type: undefined,
  criticality: undefined,
  fileType: undefined,
  category: undefined,
  tags: undefined,
  search: undefined,
}

const initialState = {
  validators: [],
  groups: [],
  presets: [],
  testCases: [],
  testResults: [],
  testBatches: [],
  metrics: [],
  reports: [],
  selectedValidator: null,
  selectedGroup: null,
  selectedPreset: null,
  selectedTestCase: null,
  editorState: null,
  isEditorDirty: false,
  filters: initialFilters,
  isLoading: false,
  error: null,
  validationInProgress: false,
}

// ============================================
// STORE
// ============================================

export const useValidatorStore = create<ValidatorState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ============================================
        // SELECTORS
        // ============================================

        getValidatorById: (id: string) => {
          return get().validators.find((v) => v.id === id)
        },

        getValidatorByCode: (code: string) => {
          return get().validators.find((v) => v.code === code)
        },

        getValidatorsByType: (type: ValidatorType) => {
          return get().validators.filter((v) => v.type === type)
        },

        getValidatorsByCriticality: (criticality: ValidatorCriticality) => {
          return get().validators.filter((v) => v.criticality === criticality)
        },

        getValidatorsByStatus: (status: ValidatorStatus) => {
          return get().validators.filter((v) => v.status === status)
        },

        getActiveValidators: () => {
          return get().validators.filter((v) => v.status === ValidatorStatus.ACTIVE && v.isEnabled)
        },

        getTestCasesByValidator: (validatorId: string) => {
          return get().testCases.filter((tc) => tc.validatorId === validatorId)
        },

        getTestResultsByValidator: (validatorId: string) => {
          return get().testResults.filter((tr) => tr.validatorId === validatorId)
        },

        getMetricsByValidator: (validatorId: string) => {
          return get().metrics.find((m) => m.validatorId === validatorId)
        },

        // ============================================
        // ACTIONS - VALIDATORS
        // ============================================

        setValidators: (validators) => {
          set({ validators }, false, 'setValidators')
        },

        addValidator: (validator) => {
          set(
            (state) => ({
              validators: [...state.validators, validator],
            }),
            false,
            'addValidator'
          )
        },

        updateValidator: (id, updates) => {
          set(
            (state) => ({
              validators: state.validators.map((v) =>
                v.id === id
                  ? {
                      ...v,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                      version: v.version + 1,
                    }
                  : v
              ),
              selectedValidator:
                state.selectedValidator?.id === id
                  ? { ...state.selectedValidator, ...updates }
                  : state.selectedValidator,
            }),
            false,
            'updateValidator'
          )
        },

        removeValidator: (id) => {
          set(
            (state) => ({
              validators: state.validators.filter((v) => v.id !== id),
              selectedValidator: state.selectedValidator?.id === id ? null : state.selectedValidator,
            }),
            false,
            'removeValidator'
          )
        },

        duplicateValidator: (id) => {
          const validator = get().getValidatorById(id)
          if (validator) {
            const duplicate: ValidatorRule = {
              ...validator,
              id: `${validator.id}-copy-${Date.now()}`,
              code: `${validator.code}-COPY`,
              name: `${validator.name} (Copia)`,
              status: ValidatorStatus.DRAFT,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              version: 1,
            }
            get().addValidator(duplicate)
          }
        },

        setSelectedValidator: (validator) => {
          set({ selectedValidator: validator }, false, 'setSelectedValidator')
        },

        toggleValidatorStatus: (id) => {
          const validator = get().getValidatorById(id)
          if (validator) {
            get().updateValidator(id, {
              isEnabled: !validator.isEnabled,
            })
          }
        },

        // ============================================
        // ACTIONS - GROUPS
        // ============================================

        setGroups: (groups) => {
          set({ groups }, false, 'setGroups')
        },

        addGroup: (group) => {
          set(
            (state) => ({
              groups: [...state.groups, group],
            }),
            false,
            'addGroup'
          )
        },

        updateGroup: (id, updates) => {
          set(
            (state) => ({
              groups: state.groups.map((g) =>
                g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
              ),
              selectedGroup:
                state.selectedGroup?.id === id ? { ...state.selectedGroup, ...updates } : state.selectedGroup,
            }),
            false,
            'updateGroup'
          )
        },

        removeGroup: (id) => {
          set(
            (state) => ({
              groups: state.groups.filter((g) => g.id !== id),
              selectedGroup: state.selectedGroup?.id === id ? null : state.selectedGroup,
            }),
            false,
            'removeGroup'
          )
        },

        setSelectedGroup: (group) => {
          set({ selectedGroup: group }, false, 'setSelectedGroup')
        },

        // ============================================
        // ACTIONS - PRESETS
        // ============================================

        setPresets: (presets) => {
          set({ presets }, false, 'setPresets')
        },

        addPreset: (preset) => {
          set(
            (state) => ({
              presets: [...state.presets, preset],
            }),
            false,
            'addPreset'
          )
        },

        updatePreset: (id, updates) => {
          set(
            (state) => ({
              presets: state.presets.map((p) =>
                p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
              ),
              selectedPreset:
                state.selectedPreset?.id === id ? { ...state.selectedPreset, ...updates } : state.selectedPreset,
            }),
            false,
            'updatePreset'
          )
        },

        removePreset: (id) => {
          set(
            (state) => ({
              presets: state.presets.filter((p) => p.id !== id),
              selectedPreset: state.selectedPreset?.id === id ? null : state.selectedPreset,
            }),
            false,
            'removePreset'
          )
        },

        setSelectedPreset: (preset) => {
          set({ selectedPreset: preset }, false, 'setSelectedPreset')
        },

        setDefaultPreset: (id) => {
          set(
            (state) => ({
              presets: state.presets.map((p) => ({
                ...p,
                isDefault: p.id === id,
              })),
            }),
            false,
            'setDefaultPreset'
          )
        },

        // ============================================
        // ACTIONS - TEST CASES
        // ============================================

        setTestCases: (testCases) => {
          set({ testCases }, false, 'setTestCases')
        },

        addTestCase: (testCase) => {
          set(
            (state) => ({
              testCases: [...state.testCases, testCase],
            }),
            false,
            'addTestCase'
          )
        },

        updateTestCase: (id, updates) => {
          set(
            (state) => ({
              testCases: state.testCases.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)),
              selectedTestCase:
                state.selectedTestCase?.id === id ? { ...state.selectedTestCase, ...updates } : state.selectedTestCase,
            }),
            false,
            'updateTestCase'
          )
        },

        removeTestCase: (id) => {
          set(
            (state) => ({
              testCases: state.testCases.filter((tc) => tc.id !== id),
              selectedTestCase: state.selectedTestCase?.id === id ? null : state.selectedTestCase,
            }),
            false,
            'removeTestCase'
          )
        },

        setSelectedTestCase: (testCase) => {
          set({ selectedTestCase: testCase }, false, 'setSelectedTestCase')
        },

        // ============================================
        // ACTIONS - TESTING
        // ============================================

        runTest: async (testCaseId: string) => {
          set({ isLoading: true, error: null }, false, 'runTest:start')
          try {
            const testCase = get().testCases.find((tc) => tc.id === testCaseId)
            if (!testCase) {
              throw new Error('Test case not found')
            }

            const validator = get().getValidatorById(testCase.validatorId)
            if (!validator) {
              throw new Error('Validator not found')
            }

            // In real implementation, call validation service
            // const result = await validatorService.runTest(testCase, validator)

            // Mock result for now
            const result: ValidatorTestResult = {
              id: `result-${Date.now()}`,
              testCaseId: testCase.id,
              validatorId: testCase.validatorId,
              status: testCase.expectedResult,
              actualResult: 'pass',
              actualMessage: 'Test passed',
              expectedResult: testCase.expectedResult,
              expectedMessage: testCase.expectedMessage,
              matched: true,
              executionTimeMs: Math.random() * 100,
              executedAt: new Date().toISOString(),
            }

            set(
              (state) => ({
                testResults: [result, ...state.testResults],
                isLoading: false,
              }),
              false,
              'runTest:success'
            )

            return result
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al ejecutar test'
            set({ isLoading: false, error: message }, false, 'runTest:error')
            throw error
          }
        },

        runTestsForValidator: async (validatorId: string) => {
          set({ isLoading: true, error: null }, false, 'runTestsForValidator:start')
          try {
            const testCases = get().getTestCasesByValidator(validatorId)

            // Run all tests (in real implementation, run in parallel)
            const results: ValidatorTestResult[] = []
            for (const testCase of testCases) {
              const result = await get().runTest(testCase.id)
              results.push(result)
            }

            const batch: ValidatorTestBatch = {
              id: `batch-${Date.now()}`,
              name: `Validator ${validatorId} Tests`,
              validatorIds: [validatorId],
              testCaseIds: testCases.map((tc) => tc.id),
              results,
              totalTests: results.length,
              passedTests: results.filter((r) => r.matched).length,
              failedTests: results.filter((r) => !r.matched).length,
              errorTests: 0,
              executionTimeMs: results.reduce((sum, r) => sum + r.executionTimeMs, 0),
              executedAt: new Date().toISOString(),
              executedBy: 'current-user',
            }

            set(
              (state) => ({
                testBatches: [batch, ...state.testBatches],
                isLoading: false,
              }),
              false,
              'runTestsForValidator:success'
            )

            return batch
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al ejecutar tests'
            set({ isLoading: false, error: message }, false, 'runTestsForValidator:error')
            throw error
          }
        },

        runAllTests: async () => {
          set({ isLoading: true, error: null }, false, 'runAllTests:start')
          try {
            // Run all test cases
            const results: ValidatorTestResult[] = []
            for (const testCase of get().testCases) {
              const result = await get().runTest(testCase.id)
              results.push(result)
            }

            const batch: ValidatorTestBatch = {
              id: `batch-all-${Date.now()}`,
              name: 'All Tests',
              validatorIds: Array.from(new Set(get().testCases.map((tc) => tc.validatorId))),
              testCaseIds: get().testCases.map((tc) => tc.id),
              results,
              totalTests: results.length,
              passedTests: results.filter((r) => r.matched).length,
              failedTests: results.filter((r) => !r.matched).length,
              errorTests: 0,
              executionTimeMs: results.reduce((sum, r) => sum + r.executionTimeMs, 0),
              executedAt: new Date().toISOString(),
              executedBy: 'current-user',
            }

            set(
              (state) => ({
                testBatches: [batch, ...state.testBatches],
                isLoading: false,
              }),
              false,
              'runAllTests:success'
            )

            return batch
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al ejecutar todos los tests'
            set({ isLoading: false, error: message }, false, 'runAllTests:error')
            throw error
          }
        },

        setTestResults: (results) => {
          set({ testResults: results }, false, 'setTestResults')
        },

        setTestBatches: (batches) => {
          set({ testBatches: batches }, false, 'setTestBatches')
        },

        // ============================================
        // ACTIONS - VALIDATION EXECUTION
        // ============================================

        validateFile: async (fileId: string, presetId?: string) => {
          set({ validationInProgress: true, error: null }, false, 'validateFile:start')
          try {
            // In real implementation, call validation service
            // const report = await validatorService.validateFile(fileId, presetId)

            // Mock report for now
            const report: ValidationReport = {
              fileId,
              fileName: 'mock-file.txt',
              fileType: 'NOMINA',
              totalRecords: 100,
              validatedRecords: 100,
              passedRecords: 95,
              failedRecords: 5,
              results: {
                critical: [],
                errors: [],
                warnings: [],
                informational: [],
              },
              totalValidators: 10,
              executedValidators: 10,
              failedValidators: 2,
              totalExecutionTimeMs: 1500,
              overallStatus: 'warning',
              isCompliant: true,
              validatedAt: new Date().toISOString(),
              validatedBy: 'current-user',
              validatorPresetId: presetId,
            }

            set(
              (state) => ({
                reports: [report, ...state.reports],
                validationInProgress: false,
              }),
              false,
              'validateFile:success'
            )

            return report
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al validar archivo'
            set({ validationInProgress: false, error: message }, false, 'validateFile:error')
            throw error
          }
        },

        setReports: (reports) => {
          set({ reports }, false, 'setReports')
        },

        getReportById: (id: string) => {
          return get().reports.find((r) => r.fileId === id)
        },

        // ============================================
        // ACTIONS - METRICS
        // ============================================

        setMetrics: (metrics) => {
          set({ metrics }, false, 'setMetrics')
        },

        refreshMetrics: async (validatorId?: string) => {
          set({ isLoading: true, error: null }, false, 'refreshMetrics:start')
          try {
            // In real implementation, call API
            // const metrics = await validatorService.getMetrics(validatorId)
            // set({ metrics, isLoading: false }, false, 'refreshMetrics:success')

            set({ isLoading: false }, false, 'refreshMetrics:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al actualizar métricas'
            set({ isLoading: false, error: message }, false, 'refreshMetrics:error')
            throw error
          }
        },

        // ============================================
        // ACTIONS - VISUAL EDITOR
        // ============================================

        setEditorState: (state) => {
          set({ editorState: state, isEditorDirty: false }, false, 'setEditorState')
        },

        updateEditorState: (updates) => {
          set(
            (state) => ({
              editorState: state.editorState ? { ...state.editorState, ...updates } : null,
              isEditorDirty: true,
            }),
            false,
            'updateEditorState'
          )
        },

        setEditorDirty: (dirty) => {
          set({ isEditorDirty: dirty }, false, 'setEditorDirty')
        },

        saveEditorState: async () => {
          set({ isLoading: true, error: null }, false, 'saveEditorState:start')
          try {
            // In real implementation, convert editor state to validator rule and save
            // await validatorService.saveFromEditor(get().editorState)

            set({ isLoading: false, isEditorDirty: false }, false, 'saveEditorState:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al guardar editor'
            set({ isLoading: false, error: message }, false, 'saveEditorState:error')
            throw error
          }
        },

        resetEditor: () => {
          set({ editorState: null, isEditorDirty: false }, false, 'resetEditor')
        },

        // ============================================
        // ACTIONS - IMPORT/EXPORT
        // ============================================

        exportValidators: (validatorIds: string[]) => {
          const validators = get().validators.filter((v) => validatorIds.includes(v.id))
          const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            exportedBy: 'current-user',
            validators,
          }
          return JSON.stringify(exportData, null, 2)
        },

        importValidators: async (data: string) => {
          set({ isLoading: true, error: null }, false, 'importValidators:start')
          try {
            const importData = JSON.parse(data)
            const validators = importData.validators as ValidatorRule[]

            // Add imported validators
            validators.forEach((validator) => {
              get().addValidator({
                ...validator,
                id: `${validator.id}-imported-${Date.now()}`,
                status: ValidatorStatus.DRAFT,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            })

            set({ isLoading: false }, false, 'importValidators:success')
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al importar validadores'
            set({ isLoading: false, error: message }, false, 'importValidators:error')
            throw error
          }
        },

        // ============================================
        // ACTIONS - FILTERS
        // ============================================

        setFilters: (filters) => {
          set(
            (state) => ({
              filters: { ...state.filters, ...filters },
            }),
            false,
            'setFilters'
          )
        },

        resetFilters: () => {
          set({ filters: initialFilters }, false, 'resetFilters')
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

        setValidationInProgress: (inProgress) => {
          set({ validationInProgress: inProgress }, false, 'setValidationInProgress')
        },

        // ============================================
        // ACTIONS - RESET
        // ============================================

        reset: () => {
          set(initialState, false, 'reset')
        },
      }),
      {
        name: 'validator-store',
        partialize: (state) => ({
          // Only persist filters
          filters: state.filters,
        }),
      }
    ),
    { name: 'ValidatorStore' }
  )
)

// ============================================
// SELECTORS (for use outside components)
// ============================================

export const selectValidators = (state: ValidatorState) => state.validators
export const selectGroups = (state: ValidatorState) => state.groups
export const selectPresets = (state: ValidatorState) => state.presets
export const selectTestCases = (state: ValidatorState) => state.testCases
export const selectTestResults = (state: ValidatorState) => state.testResults
export const selectTestBatches = (state: ValidatorState) => state.testBatches
export const selectMetrics = (state: ValidatorState) => state.metrics
export const selectReports = (state: ValidatorState) => state.reports
export const selectSelectedValidator = (state: ValidatorState) => state.selectedValidator
export const selectSelectedGroup = (state: ValidatorState) => state.selectedGroup
export const selectSelectedPreset = (state: ValidatorState) => state.selectedPreset
export const selectSelectedTestCase = (state: ValidatorState) => state.selectedTestCase
export const selectEditorState = (state: ValidatorState) => state.editorState
export const selectIsEditorDirty = (state: ValidatorState) => state.isEditorDirty
export const selectFilters = (state: ValidatorState) => state.filters
export const selectIsLoading = (state: ValidatorState) => state.isLoading
export const selectError = (state: ValidatorState) => state.error
export const selectValidationInProgress = (state: ValidatorState) => state.validationInProgress
