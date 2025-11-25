/**
 * Validator Service - CONSAR Compliance
 *
 * Service layer for validator configuration and execution
 * Handles validation logic, testing playground, and BRMS operations
 */

import type {
  ValidatorRule,
  ValidatorGroup,
  ValidatorPreset,
  ValidatorTestCase,
  ValidatorTestResult,
  ValidatorTestBatch,
  ValidatorMetrics,
  ValidatorCondition,
  ValidatorConditionGroup,
  ValidatorFilters,
  ValidationContext,
  ValidationResult,
  ValidationReport,
  ValidatorExport,
} from '@/types/validator.types'
import { TestResultStatus, ValidatorCriticality, ValidatorOperator } from '@/types/validator.types'
import { mockValidators, mockValidatorGroups, mockValidatorPresets } from '@/mocks/validators.mock'

// ============================================
// API CLIENT (mock for now)
// ============================================

class ValidatorAPI {
  private baseUrl = '/api/validators'

  async fetchValidators(filters?: ValidatorFilters): Promise<ValidatorRule[]> {
    // const response = await fetch(`${this.baseUrl}?${queryParams}`)
    // return response.json()

    // Mock: Return mock data with simulated delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let result = [...mockValidators]

    // Apply filters
    if (filters) {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        result = result.filter(
          (v) =>
            v.name.toLowerCase().includes(searchLower) ||
            v.code.toLowerCase().includes(searchLower) ||
            v.description.toLowerCase().includes(searchLower)
        )
      }

      if (filters.status && filters.status.length > 0) {
        result = result.filter((v) => filters.status?.includes(v.status))
      }

      if (filters.criticality && filters.criticality.length > 0) {
        result = result.filter((v) => filters.criticality?.includes(v.criticality))
      }

      if (filters.fileType) {
        result = result.filter((v) => v.fileTypes.includes(filters.fileType!))
      }
    }

    return result
  }

  async fetchValidatorById(id: string): Promise<ValidatorRule> {
    // const response = await fetch(`${this.baseUrl}/${id}`)
    // return response.json()

    // Mock: Return mock data with simulated delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const validator = mockValidators.find((v) => v.id === id)
    if (!validator) {
      throw new Error(`Validator with id ${id} not found`)
    }
    return validator
  }

  async createValidator(validator: Omit<ValidatorRule, 'id'>): Promise<ValidatorRule> {
    // const response = await fetch(`${this.baseUrl}`, {
    //   method: 'POST',
    //   body: JSON.stringify(validator),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async updateValidator(id: string, updates: Partial<ValidatorRule>): Promise<ValidatorRule> {
    // const response = await fetch(`${this.baseUrl}/${id}`, {
    //   method: 'PATCH',
    //   body: JSON.stringify(updates),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async deleteValidator(id: string): Promise<void> {
    // await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' })
  }

  async fetchGroups(): Promise<ValidatorGroup[]> {
    // const response = await fetch(`${this.baseUrl}/groups`)
    // return response.json()

    // Mock: Return mock data with simulated delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockValidatorGroups
  }

  async fetchPresets(): Promise<ValidatorPreset[]> {
    // const response = await fetch(`${this.baseUrl}/presets`)
    // return response.json()

    // Mock: Return mock data with simulated delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockValidatorPresets
  }

  async fetchTestCases(validatorId?: string): Promise<ValidatorTestCase[]> {
    // const url = validatorId
    //   ? `${this.baseUrl}/test-cases?validatorId=${validatorId}`
    //   : `${this.baseUrl}/test-cases`
    // const response = await fetch(url)
    // return response.json()
    return []
  }

  async executeValidation(fileId: string, presetId?: string): Promise<ValidationReport> {
    // const response = await fetch(`${this.baseUrl}/execute`, {
    //   method: 'POST',
    //   body: JSON.stringify({ fileId, presetId }),
    // })
    // return response.json()
    throw new Error('Not implemented')
  }

  async fetchMetrics(validatorId?: string): Promise<ValidatorMetrics[]> {
    // const url = validatorId
    //   ? `${this.baseUrl}/metrics?validatorId=${validatorId}`
    //   : `${this.baseUrl}/metrics`
    // const response = await fetch(url)
    // return response.json()
    return []
  }
}

// ============================================
// VALIDATION ENGINE
// ============================================

class ValidationEngine {
  /**
   * Evaluate a single condition against a record
   */
  evaluateCondition(condition: ValidatorCondition, record: Record<string, unknown>): boolean {
    const fieldValue = record[condition.field]
    const compareValue = condition.valueFrom ? record[condition.valueFrom] : condition.value

    switch (condition.operator) {
      case ValidatorOperator.EQUALS:
        return fieldValue === compareValue

      case ValidatorOperator.NOT_EQUALS:
        return fieldValue !== compareValue

      case ValidatorOperator.GREATER_THAN:
        return typeof fieldValue === 'number' && typeof compareValue === 'number'
          ? fieldValue > compareValue
          : false

      case ValidatorOperator.GREATER_THAN_OR_EQUAL:
        return typeof fieldValue === 'number' && typeof compareValue === 'number'
          ? fieldValue >= compareValue
          : false

      case ValidatorOperator.LESS_THAN:
        return typeof fieldValue === 'number' && typeof compareValue === 'number'
          ? fieldValue < compareValue
          : false

      case ValidatorOperator.LESS_THAN_OR_EQUAL:
        return typeof fieldValue === 'number' && typeof compareValue === 'number'
          ? fieldValue <= compareValue
          : false

      case ValidatorOperator.CONTAINS:
        return typeof fieldValue === 'string' && typeof compareValue === 'string'
          ? fieldValue.includes(compareValue)
          : false

      case ValidatorOperator.NOT_CONTAINS:
        return typeof fieldValue === 'string' && typeof compareValue === 'string'
          ? !fieldValue.includes(compareValue)
          : false

      case ValidatorOperator.STARTS_WITH:
        return typeof fieldValue === 'string' && typeof compareValue === 'string'
          ? fieldValue.startsWith(compareValue)
          : false

      case ValidatorOperator.ENDS_WITH:
        return typeof fieldValue === 'string' && typeof compareValue === 'string'
          ? fieldValue.endsWith(compareValue)
          : false

      case ValidatorOperator.MATCHES_REGEX:
        if (typeof fieldValue === 'string' && typeof compareValue === 'string') {
          const regex = new RegExp(compareValue)
          return regex.test(fieldValue)
        }
        return false

      case ValidatorOperator.IN_LIST:
        return Array.isArray(compareValue) ? compareValue.includes(fieldValue) : false

      case ValidatorOperator.NOT_IN_LIST:
        return Array.isArray(compareValue) ? !compareValue.includes(fieldValue) : false

      case ValidatorOperator.IS_EMPTY:
        return fieldValue === null || fieldValue === undefined || fieldValue === ''

      case ValidatorOperator.IS_NOT_EMPTY:
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''

      case ValidatorOperator.BETWEEN:
        if (
          typeof fieldValue === 'number' &&
          Array.isArray(compareValue) &&
          compareValue.length === 2
        ) {
          return fieldValue >= compareValue[0] && fieldValue <= compareValue[1]
        }
        return false

      default:
        console.warn(`Unknown operator: ${condition.operator}`)
        return false
    }
  }

  /**
   * Evaluate a condition group (handles AND/OR/NOT logic)
   */
  evaluateConditionGroup(
    group: ValidatorConditionGroup,
    record: Record<string, unknown>
  ): boolean {
    const results = group.conditions.map((item) => {
      if ('field' in item && 'operator' in item) {
        // It's a condition
        return this.evaluateCondition(item as ValidatorCondition, record)
      } else {
        // It's a nested group
        return this.evaluateConditionGroup(item as ValidatorConditionGroup, record)
      }
    })

    switch (group.operator) {
      case 'and':
        return results.every((r) => r)
      case 'or':
        return results.some((r) => r)
      case 'not':
        return !results[0]
      default:
        return false
    }
  }

  /**
   * Execute a validator rule against a record
   */
  executeValidator(
    validator: ValidatorRule,
    context: ValidationContext
  ): ValidationResult {
    const startTime = performance.now()

    try {
      const passed = this.evaluateConditionGroup(validator.conditionGroup, context.record)

      const endTime = performance.now()
      const executionTimeMs = endTime - startTime

      return {
        validatorId: validator.id,
        validatorCode: validator.code,
        validatorName: validator.name,
        status: passed ? 'passed' : 'failed',
        criticality: validator.criticality,
        message: passed ? undefined : validator.action.message,
        executionTimeMs,
        context,
      }
    } catch (error) {
      console.error(`Error executing validator ${validator.code}:`, error)

      return {
        validatorId: validator.id,
        validatorCode: validator.code,
        validatorName: validator.name,
        status: 'failed',
        criticality: validator.criticality,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTimeMs: performance.now() - startTime,
        context,
      }
    }
  }

  /**
   * Execute all validators in a preset against a file
   */
  async executePreset(
    preset: ValidatorPreset,
    fileData: {
      fileId: string
      fileName: string
      fileType: string
      afore: string
      records: Record<string, unknown>[]
    }
  ): Promise<ValidationReport> {
    const startTime = performance.now()

    // Flatten all validators from all groups
    const validators = preset.groups.flatMap((g) => g.validators)

    // Filter active validators and sort by runOrder
    const activeValidators = validators
      .filter((v) => v.isEnabled && v.status === 'active')
      .sort((a, b) => a.runOrder - b.runOrder)

    const allResults: ValidationResult[] = []
    let stopValidation = false

    // Execute validators for each record
    for (let i = 0; i < fileData.records.length; i++) {
      if (stopValidation) break

      const record = fileData.records[i]
      if (!record) continue

      const context: ValidationContext = {
        fileId: fileData.fileId,
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        afore: fileData.afore,
        recordIndex: i,
        record,
      }

      for (const validator of activeValidators) {
        const result = this.executeValidator(validator, context)
        allResults.push(result)

        // Stop if critical validator fails and stopOnFailure is true
        if (
          result.status === 'failed' &&
          validator.stopOnFailure &&
          (validator.criticality === ValidatorCriticality.CRITICAL ||
            validator.criticality === ValidatorCriticality.ERROR)
        ) {
          stopValidation = true
          break
        }
      }
    }

    const endTime = performance.now()

    // Group results by criticality
    const critical = allResults.filter((r) => r.criticality === ValidatorCriticality.CRITICAL)
    const errors = allResults.filter((r) => r.criticality === ValidatorCriticality.ERROR)
    const warnings = allResults.filter((r) => r.criticality === ValidatorCriticality.WARNING)
    const informational = allResults.filter(
      (r) => r.criticality === ValidatorCriticality.INFORMATIONAL
    )

    // Calculate summary
    const failedResults = allResults.filter((r) => r.status === 'failed')
    const passedRecords = fileData.records.length - new Set(failedResults.map((r) => r.context?.recordIndex)).size

    // Determine overall status
    let overallStatus: 'passed' | 'failed' | 'warning' = 'passed'
    if (critical.length > 0 || errors.length > 0) {
      overallStatus = 'failed'
    } else if (warnings.length > 0) {
      overallStatus = 'warning'
    }

    const report: ValidationReport = {
      fileId: fileData.fileId,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      totalRecords: fileData.records.length,
      validatedRecords: fileData.records.length,
      passedRecords,
      failedRecords: fileData.records.length - passedRecords,
      results: {
        critical,
        errors,
        warnings,
        informational,
      },
      totalValidators: activeValidators.length,
      executedValidators: activeValidators.length,
      failedValidators: new Set(failedResults.map((r) => r.validatorId)).size,
      totalExecutionTimeMs: endTime - startTime,
      overallStatus,
      isCompliant: overallStatus !== 'failed',
      validatedAt: new Date().toISOString(),
      validatedBy: 'current-user',
      validatorPresetId: preset.id,
    }

    return report
  }
}

// ============================================
// SERVICE CLASS
// ============================================

class ValidatorService {
  private api: ValidatorAPI
  private engine: ValidationEngine

  constructor() {
    this.api = new ValidatorAPI()
    this.engine = new ValidationEngine()
  }

  // ============================================
  // VALIDATOR CRUD
  // ============================================

  async getValidators(filters?: ValidatorFilters): Promise<ValidatorRule[]> {
    try {
      return await this.api.fetchValidators(filters)
    } catch (error) {
      console.error('Error fetching validators:', error)
      throw error
    }
  }

  async getValidatorById(id: string): Promise<ValidatorRule> {
    try {
      return await this.api.fetchValidatorById(id)
    } catch (error) {
      console.error('Error fetching validator:', error)
      throw error
    }
  }

  async createValidator(validator: Omit<ValidatorRule, 'id'>): Promise<ValidatorRule> {
    try {
      return await this.api.createValidator(validator)
    } catch (error) {
      console.error('Error creating validator:', error)
      throw error
    }
  }

  async updateValidator(id: string, updates: Partial<ValidatorRule>): Promise<ValidatorRule> {
    try {
      return await this.api.updateValidator(id, updates)
    } catch (error) {
      console.error('Error updating validator:', error)
      throw error
    }
  }

  async deleteValidator(id: string): Promise<void> {
    try {
      await this.api.deleteValidator(id)
    } catch (error) {
      console.error('Error deleting validator:', error)
      throw error
    }
  }

  // ============================================
  // GROUPS & PRESETS
  // ============================================

  async getGroups(): Promise<ValidatorGroup[]> {
    try {
      return await this.api.fetchGroups()
    } catch (error) {
      console.error('Error fetching groups:', error)
      throw error
    }
  }

  async getPresets(): Promise<ValidatorPreset[]> {
    try {
      return await this.api.fetchPresets()
    } catch (error) {
      console.error('Error fetching presets:', error)
      throw error
    }
  }

  // ============================================
  // TESTING PLAYGROUND
  // ============================================

  async getTestCases(validatorId?: string): Promise<ValidatorTestCase[]> {
    try {
      return await this.api.fetchTestCases(validatorId)
    } catch (error) {
      console.error('Error fetching test cases:', error)
      throw error
    }
  }

  /**
   * Run a single test case
   */
  runTestCase(testCase: ValidatorTestCase, validator: ValidatorRule): ValidatorTestResult {
    const startTime = performance.now()

    try {
      const context: ValidationContext = {
        fileId: 'test',
        fileName: 'test',
        fileType: 'test',
        afore: 'test',
        recordIndex: 0,
        record: testCase.input,
      }

      const result = this.engine.executeValidator(validator, context)
      const endTime = performance.now()

      const actualResult = result.status === 'passed' ? 'pass' : 'fail'
      const matched = actualResult === (testCase.expectedResult === TestResultStatus.PASSED ? 'pass' : 'fail')

      return {
        id: `test-result-${Date.now()}`,
        testCaseId: testCase.id,
        validatorId: validator.id,
        status: matched ? TestResultStatus.PASSED : TestResultStatus.FAILED,
        actualResult,
        actualMessage: result.message,
        expectedResult: testCase.expectedResult,
        expectedMessage: testCase.expectedMessage,
        matched,
        executionTimeMs: endTime - startTime,
        executedAt: new Date().toISOString(),
      }
    } catch (error) {
      return {
        id: `test-result-${Date.now()}`,
        testCaseId: testCase.id,
        validatorId: validator.id,
        status: TestResultStatus.ERROR,
        actualResult: 'fail',
        actualMessage: error instanceof Error ? error.message : 'Unknown error',
        expectedResult: testCase.expectedResult,
        expectedMessage: testCase.expectedMessage,
        matched: false,
        executionTimeMs: performance.now() - startTime,
        executedAt: new Date().toISOString(),
      }
    }
  }

  /**
   * Run all test cases for a validator
   */
  async runTestsForValidator(validatorId: string): Promise<ValidatorTestBatch> {
    try {
      const validator = await this.getValidatorById(validatorId)
      const testCases = await this.getTestCases(validatorId)

      const results = testCases.map((tc) => this.runTestCase(tc, validator))

      const batch: ValidatorTestBatch = {
        id: `batch-${Date.now()}`,
        name: `Tests for ${validator.name}`,
        validatorIds: [validatorId],
        testCaseIds: testCases.map((tc) => tc.id),
        results,
        totalTests: results.length,
        passedTests: results.filter((r) => r.status === TestResultStatus.PASSED).length,
        failedTests: results.filter((r) => r.status === TestResultStatus.FAILED).length,
        errorTests: results.filter((r) => r.status === TestResultStatus.ERROR).length,
        executionTimeMs: results.reduce((sum, r) => sum + r.executionTimeMs, 0),
        executedAt: new Date().toISOString(),
        executedBy: 'current-user',
      }

      return batch
    } catch (error) {
      console.error('Error running tests:', error)
      throw error
    }
  }

  // ============================================
  // VALIDATION EXECUTION
  // ============================================

  async validateFile(fileId: string, presetId?: string): Promise<ValidationReport> {
    try {
      return await this.api.executeValidation(fileId, presetId)
    } catch (error) {
      console.error('Error validating file:', error)
      throw error
    }
  }

  // ============================================
  // METRICS
  // ============================================

  async getMetrics(validatorId?: string): Promise<ValidatorMetrics[]> {
    try {
      return await this.api.fetchMetrics(validatorId)
    } catch (error) {
      console.error('Error fetching metrics:', error)
      throw error
    }
  }

  // ============================================
  // IMPORT/EXPORT
  // ============================================

  exportValidators(validators: ValidatorRule[]): string {
    const exportData: ValidatorExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: 'current-user',
      validators,
    }
    return JSON.stringify(exportData, null, 2)
  }

  importValidators(jsonData: string): ValidatorRule[] {
    try {
      const exportData: ValidatorExport = JSON.parse(jsonData)
      return exportData.validators
    } catch (error) {
      console.error('Error importing validators:', error)
      throw new Error('Invalid import data format')
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const validatorService = new ValidatorService()
export default validatorService
