/**
 * Validator Service - Real API Implementation
 *
 * Handles validator configuration operations against Certus API v1
 * Manages CONSAR validation rules and their configuration
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { PaginatedResponse, ApiResponse } from '@/types'
import type {
  ValidatorRule,
  ValidatorStatus,
  ValidatorCriticality,
} from '@/types/validator.types'

// ============================================
// TYPES
// ============================================

export interface ValidatorListParams {
  page?: number
  pageSize?: number
  status?: ValidatorStatus[]
  type?: string[]
  criticality?: ValidatorCriticality[]
  fileType?: string[]
  category?: string[]
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ValidatorGroupSummary {
  id: string
  name: string
  description: string
  validatorCount: number
  activeCount: number
  isEnabled: boolean
}

export interface ValidatorConfig {
  isEnabled: boolean
  criticality?: ValidatorCriticality
  parameters?: Record<string, unknown>
}

// ============================================
// SERVICE
// ============================================

export class ValidatorService {
  /**
   * Get all validators with optional filters
   */
  static async getValidators(params?: ValidatorListParams): Promise<PaginatedResponse<ValidatorRule>> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

    params?.status?.forEach((s) => queryParams.append('status', s))
    params?.type?.forEach((t) => queryParams.append('type', t))
    params?.criticality?.forEach((c) => queryParams.append('criticality', c))
    params?.fileType?.forEach((f) => queryParams.append('fileType', f))
    params?.category?.forEach((c) => queryParams.append('category', c))

    const response = await apiClient.get<PaginatedResponse<ValidatorRule>>(
      `${API_ENDPOINTS.VALIDATORS.LIST}?${queryParams.toString()}`
    )

    return response.data
  }

  /**
   * Get validator by ID
   */
  static async getValidatorById(id: string): Promise<ApiResponse<ValidatorRule>> {
    const response = await apiClient.get<ValidatorRule>(API_ENDPOINTS.VALIDATORS.DETAIL(id))

    return {
      success: true,
      data: response.data,
      message: 'Validator retrieved successfully',
    }
  }

  /**
   * Get validator groups
   */
  static async getGroups(): Promise<ApiResponse<ValidatorGroupSummary[]>> {
    const response = await apiClient.get<ValidatorGroupSummary[]>(API_ENDPOINTS.VALIDATORS.GROUPS)

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} validator groups`,
    }
  }

  /**
   * Get validators by file type
   */
  static async getValidatorsByFileType(fileType: string): Promise<ApiResponse<ValidatorRule[]>> {
    const response = await apiClient.get<ValidatorRule[]>(
      API_ENDPOINTS.VALIDATORS.BY_FILE_TYPE(fileType)
    )

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} validators for ${fileType}`,
    }
  }

  /**
   * Toggle validator enabled/disabled
   */
  static async toggleValidator(id: string): Promise<ApiResponse<ValidatorRule>> {
    const response = await apiClient.post<ValidatorRule>(API_ENDPOINTS.VALIDATORS.TOGGLE(id))

    return {
      success: true,
      data: response.data,
      message: `Validator ${response.data.isEnabled ? 'enabled' : 'disabled'}`,
    }
  }

  /**
   * Delete a validator (soft delete with justification for audit)
   */
  static async deleteValidator(id: string, justification: string): Promise<ApiResponse<void>> {
    await apiClient.delete(API_ENDPOINTS.VALIDATORS.DELETE(id), {
      data: { justification },
    })

    return {
      success: true,
      data: undefined,
      message: 'Validator deleted successfully',
    }
  }

  /**
   * Duplicate a validator with a new name
   */
  static async duplicateValidator(id: string, newName: string): Promise<ApiResponse<ValidatorRule>> {
    const response = await apiClient.post<ValidatorRule>(API_ENDPOINTS.VALIDATORS.DUPLICATE(id), {
      name: newName,
    })

    return {
      success: true,
      data: response.data,
      message: `Validator duplicated as "${newName}"`,
    }
  }

  /**
   * Update validator configuration
   */
  static async updateConfig(id: string, config: ValidatorConfig): Promise<ApiResponse<ValidatorRule>> {
    const response = await apiClient.patch<ValidatorRule>(
      API_ENDPOINTS.VALIDATORS.UPDATE_CONFIG(id),
      config
    )

    return {
      success: true,
      data: response.data,
      message: 'Validator configuration updated',
    }
  }

  /**
   * Get validators by group
   */
  static async getValidatorsByGroup(groupId: string): Promise<ApiResponse<ValidatorRule[]>> {
    const response = await apiClient.get<ValidatorRule[]>(
      `${API_ENDPOINTS.VALIDATORS.GROUPS}/${groupId}/validators`
    )

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} validators in group`,
    }
  }

  /**
   * Get active validators count
   */
  static async getActiveCount(): Promise<ApiResponse<number>> {
    const response = await this.getValidators({
      status: ['active' as ValidatorStatus],
      pageSize: 1,
    })

    return {
      success: true,
      data: response.total,
      message: `${response.total} active validators`,
    }
  }

  /**
   * Bulk enable validators
   */
  static async bulkEnable(ids: string[]): Promise<ApiResponse<ValidatorRule[]>> {
    const response = await apiClient.post<ValidatorRule[]>(
      `${API_ENDPOINTS.VALIDATORS.LIST}/bulk-enable`,
      { ids }
    )

    return {
      success: true,
      data: response.data,
      message: `${response.data.length} validators enabled`,
    }
  }

  /**
   * Bulk disable validators
   */
  static async bulkDisable(ids: string[]): Promise<ApiResponse<ValidatorRule[]>> {
    const response = await apiClient.post<ValidatorRule[]>(
      `${API_ENDPOINTS.VALIDATORS.LIST}/bulk-disable`,
      { ids }
    )

    return {
      success: true,
      data: response.data,
      message: `${response.data.length} validators disabled`,
    }
  }

  /**
   * Get validator categories
   */
  static async getCategories(): Promise<ApiResponse<string[]>> {
    const response = await apiClient.get<string[]>(`${API_ENDPOINTS.VALIDATORS.LIST}/categories`)

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} categories`,
    }
  }

  /**
   * Test validator with sample data
   */
  static async testValidator(
    id: string,
    testData: Record<string, unknown>
  ): Promise<ApiResponse<{ passed: boolean; message?: string; errors?: string[] }>> {
    const response = await apiClient.post<{
      passed: boolean
      message?: string
      errors?: string[]
    }>(`${API_ENDPOINTS.VALIDATORS.DETAIL(id)}/test`, testData)

    return {
      success: true,
      data: response.data,
      message: response.data.passed ? 'Test passed' : 'Test failed',
    }
  }

  /**
   * Execute validators against data
   */
  static async execute(
    data: Record<string, unknown>,
    validatorIds?: string[]
  ): Promise<ApiResponse<ValidatorExecutionResult>> {
    const response = await apiClient.post<ValidatorExecutionResult>(
      API_ENDPOINTS.VALIDATORS.EXECUTE,
      { data, validatorIds }
    )

    return {
      success: true,
      data: response.data,
      message: `Executed ${response.data.totalValidators} validators`,
    }
  }

  /**
   * Get validator execution metrics
   */
  static async getMetrics(params?: {
    from?: string
    to?: string
    fileType?: string
  }): Promise<ApiResponse<ValidatorMetrics>> {
    const response = await apiClient.get<ValidatorMetrics>(
      API_ENDPOINTS.VALIDATORS.METRICS,
      { params }
    )

    return {
      success: true,
      data: response.data,
      message: 'Metrics retrieved successfully',
    }
  }

  /**
   * Get validator presets (predefined configurations)
   */
  static async getPresets(): Promise<ApiResponse<ValidatorPreset[]>> {
    const response = await apiClient.get<ValidatorPreset[]>(
      API_ENDPOINTS.VALIDATORS.PRESETS
    )

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} presets`,
    }
  }

  /**
   * Apply a preset to validators
   */
  static async applyPreset(presetId: string): Promise<ApiResponse<ValidatorRule[]>> {
    const response = await apiClient.post<ValidatorRule[]>(
      `${API_ENDPOINTS.VALIDATORS.PRESETS}/${presetId}/apply`
    )

    return {
      success: true,
      data: response.data,
      message: `Applied preset to ${response.data.length} validators`,
    }
  }
}

// Additional types for new methods
export interface ValidatorExecutionResult {
  totalValidators: number
  passed: number
  failed: number
  skipped: number
  results: Array<{
    validatorId: string
    validatorName: string
    passed: boolean
    errors?: string[]
    executionTimeMs: number
  }>
  executionTimeMs: number
}

export interface ValidatorMetrics {
  totalExecutions: number
  averageExecutionTimeMs: number
  passRate: number
  failRate: number
  byFileType: Record<string, {
    executions: number
    passRate: number
  }>
  topFailingValidators: Array<{
    id: string
    name: string
    failCount: number
    failRate: number
  }>
}

export interface ValidatorPreset {
  id: string
  name: string
  description: string
  fileTypes: string[]
  validatorIds: string[]
  isDefault: boolean
  createdAt: string
}

export default ValidatorService
