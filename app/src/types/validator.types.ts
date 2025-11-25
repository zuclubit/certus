/**
 * Validator Configuration Types - CONSAR Compliance
 *
 * Type definitions for visual validator editor and testing playground
 * Based on Business Rules Management System (BRMS) principles
 */

// ============================================
// ENUMS
// ============================================

/**
 * Validator criticality/severity levels
 */
export enum ValidatorCriticality {
  INFORMATIONAL = 'informational', // Just info, doesn't block
  WARNING = 'warning', // Warning, doesn't block
  ERROR = 'error', // Error, blocks submission
  CRITICAL = 'critical', // Critical error, requires immediate attention
}

/**
 * Validator types based on what they validate
 */
export enum ValidatorType {
  FORMAT = 'format', // Format validation (length, pattern)
  RANGE = 'range', // Range validation (min/max)
  REFERENCE = 'reference', // Cross-reference validation
  CALCULATION = 'calculation', // Mathematical calculation
  BUSINESS_RULE = 'business_rule', // Business logic validation
  REGULATORY = 'regulatory', // CONSAR regulatory rule
  CUSTOM = 'custom', // Custom validator
}

/**
 * Data types that can be validated
 */
export enum ValidatorDataType {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  CURP = 'curp',
  RFC = 'rfc',
  NSS = 'nss', // Número de Seguridad Social
  ACCOUNT = 'account',
  CURRENCY = 'currency',
}

/**
 * Operators for validation conditions
 */
export enum ValidatorOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN = 'less_than',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  MATCHES_REGEX = 'matches_regex',
  IN_LIST = 'in_list',
  NOT_IN_LIST = 'not_in_list',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty',
  BETWEEN = 'between',
}

/**
 * Logical operators for combining conditions
 */
export enum LogicalOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not',
}

/**
 * Validator status
 */
export enum ValidatorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
  TESTING = 'testing',
  ARCHIVED = 'archived',
}

/**
 * Test result status
 */
export enum TestResultStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  ERROR = 'error',
  SKIPPED = 'skipped',
}

// ============================================
// INTERFACES - VALIDATOR CONFIGURATION
// ============================================

/**
 * Validator condition (single rule)
 */
export interface ValidatorCondition {
  id: string
  field: string // Field name in the record
  dataType: ValidatorDataType
  operator: ValidatorOperator
  value: unknown // Value to compare against
  valueFrom?: string // Field to get value from (for field-to-field comparison)
  message?: string // Custom message for this condition
}

/**
 * Validator condition group (multiple conditions with logical operator)
 */
export interface ValidatorConditionGroup {
  id: string
  operator: LogicalOperator
  conditions: (ValidatorCondition | ValidatorConditionGroup)[]
}

/**
 * Action to take when validator fails
 */
export interface ValidatorAction {
  type: 'reject' | 'warn' | 'log' | 'custom'
  message: string
  code: string // Error code (e.g., "VAL-001")
  metadata?: Record<string, unknown>
}

/**
 * Complete validator rule configuration
 */
export interface ValidatorRule {
  id: string
  code: string // Unique code (e.g., "VAL-001", "CONSAR-19-8-A1")
  name: string
  description: string
  type: ValidatorType
  criticality: ValidatorCriticality
  status: ValidatorStatus

  // Applicability
  fileTypes: string[] // Which file types this applies to (NOMINA, CONTABLE, etc.)
  recordTypes?: string[] // Which record types this applies to
  afores?: string[] // Which AFOREs this applies to (empty = all)

  // Validation logic
  conditionGroup: ValidatorConditionGroup
  action: ValidatorAction

  // Metadata
  category: string // Group validators by category
  tags: string[]
  regulatoryReference?: string // CONSAR circular reference
  examples?: ValidatorExample[]

  // Configuration
  isEnabled: boolean
  runOrder: number // Execution order (lower runs first)
  stopOnFailure: boolean // Stop validation if this fails

  // Audit
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
  version: number
}

/**
 * Example for validator documentation
 */
export interface ValidatorExample {
  id: string
  title: string
  description: string
  input: Record<string, unknown>
  expectedResult: 'pass' | 'fail'
  expectedMessage?: string
}

/**
 * Validator group (collection of related validators)
 */
export interface ValidatorGroup {
  id: string
  name: string
  description: string
  validators: ValidatorRule[]
  isEnabled: boolean
  runOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Validator preset (pre-configured set of validators)
 */
export interface ValidatorPreset {
  id: string
  name: string
  description: string
  icon?: string
  groups: ValidatorGroup[]
  isDefault: boolean
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

// ============================================
// INTERFACES - TESTING PLAYGROUND
// ============================================

/**
 * Test case for validator
 */
export interface ValidatorTestCase {
  id: string
  validatorId: string
  name: string
  description?: string
  input: Record<string, unknown>
  expectedResult: TestResultStatus
  expectedMessage?: string
  tags?: string[]
  createdAt: string
  createdBy: string
}

/**
 * Test execution result
 */
export interface ValidatorTestResult {
  id: string
  testCaseId: string
  validatorId: string
  status: TestResultStatus
  actualResult: 'pass' | 'fail'
  actualMessage?: string
  expectedResult: TestResultStatus
  expectedMessage?: string
  matched: boolean // Did actual match expected?
  executionTimeMs: number
  executedAt: string
  metadata?: Record<string, unknown>
}

/**
 * Batch test execution
 */
export interface ValidatorTestBatch {
  id: string
  name: string
  validatorIds: string[]
  testCaseIds: string[]
  results: ValidatorTestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  errorTests: number
  executionTimeMs: number
  executedAt: string
  executedBy: string
}

/**
 * Validator performance metrics
 */
export interface ValidatorMetrics {
  validatorId: string
  validatorCode: string
  validatorName: string

  // Execution stats
  totalExecutions: number
  totalFailures: number
  failureRate: number // Percentage
  averageExecutionTimeMs: number

  // Impact
  recordsAffected: number
  filesAffected: number

  // Time period
  period: {
    from: string
    to: string
  }

  // Trends
  trendData?: Array<{
    date: string
    executions: number
    failures: number
    avgTimeMs: number
  }>
}

// ============================================
// INTERFACES - VISUAL EDITOR
// ============================================

/**
 * Position in visual editor canvas
 */
export interface NodePosition {
  x: number
  y: number
}

/**
 * Visual node in editor
 */
export interface ValidatorNode {
  id: string
  type: 'condition' | 'group' | 'action' | 'start' | 'end'
  position: NodePosition
  data: ValidatorCondition | ValidatorConditionGroup | ValidatorAction
  style?: Record<string, unknown>
}

/**
 * Connection between nodes in visual editor
 */
export interface ValidatorEdge {
  id: string
  source: string // Source node ID
  target: string // Target node ID
  label?: string
  type?: 'success' | 'failure' | 'default'
  style?: Record<string, unknown>
}

/**
 * Visual editor state
 */
export interface ValidatorEditorState {
  nodes: ValidatorNode[]
  edges: ValidatorEdge[]
  selectedNodeId?: string
  selectedEdgeId?: string
  zoom: number
  viewport: {
    x: number
    y: number
  }
}

// ============================================
// INTERFACES - VALIDATION EXECUTION
// ============================================

/**
 * Validation context (runtime information)
 */
export interface ValidationContext {
  fileId: string
  fileName: string
  fileType: string
  afore: string
  recordIndex: number
  record: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * Validation result for single validator
 */
export interface ValidationResult {
  validatorId: string
  validatorCode: string
  validatorName: string
  status: 'passed' | 'failed'
  criticality: ValidatorCriticality
  message?: string
  field?: string
  value?: unknown
  expectedValue?: unknown
  executionTimeMs: number
  context?: ValidationContext
}

/**
 * Validation report for entire file
 */
export interface ValidationReport {
  fileId: string
  fileName: string
  fileType: string
  totalRecords: number
  validatedRecords: number
  passedRecords: number
  failedRecords: number

  // Results grouped by criticality
  results: {
    critical: ValidationResult[]
    errors: ValidationResult[]
    warnings: ValidationResult[]
    informational: ValidationResult[]
  }

  // Summary
  totalValidators: number
  executedValidators: number
  failedValidators: number
  totalExecutionTimeMs: number

  // Status
  overallStatus: 'passed' | 'failed' | 'warning'
  isCompliant: boolean

  // Audit
  validatedAt: string
  validatedBy: string
  validatorPresetId?: string
}

// ============================================
// TYPE GUARDS
// ============================================

export function isValidatorCondition(
  item: ValidatorCondition | ValidatorConditionGroup
): item is ValidatorCondition {
  return 'field' in item && 'operator' in item
}

export function isValidatorConditionGroup(
  item: ValidatorCondition | ValidatorConditionGroup
): item is ValidatorConditionGroup {
  return 'conditions' in item && Array.isArray(item.conditions)
}

export function isCriticalValidator(criticality: ValidatorCriticality): boolean {
  return criticality === ValidatorCriticality.CRITICAL || criticality === ValidatorCriticality.ERROR
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Filters for validator queries
 */
export interface ValidatorFilters {
  status?: ValidatorStatus[]
  type?: ValidatorType[]
  criticality?: ValidatorCriticality[]
  fileType?: string[]
  category?: string[]
  tags?: string[]
  search?: string
}

/**
 * Template for creating new validators
 */
export interface ValidatorTemplate {
  id: string
  name: string
  description: string
  icon?: string
  type: ValidatorType
  template: Partial<ValidatorRule>
}

/**
 * Validator import/export format
 */
export interface ValidatorExport {
  version: string
  exportedAt: string
  exportedBy: string
  validators: ValidatorRule[]
  groups?: ValidatorGroup[]
  presets?: ValidatorPreset[]
}
