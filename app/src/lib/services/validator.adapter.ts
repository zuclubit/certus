/**
 * Validator Service Adapter
 *
 * Provides a unified interface for validator configuration operations
 * Connects to Certus API v1
 */

import {
  type ValidatorRule,
  ValidatorStatus,
  type ValidatorCriticality,
} from '@/types/validator.types'
import type { PaginatedResponse, ApiResponse } from '@/types'
import { ValidatorService as ValidatorServiceReal, type ValidatorGroupSummary, type ValidatorConfig } from './api/validator.service'

/**
 * Validator List Parameters - Unified Interface
 */
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

// Re-export types from API service
export type { ValidatorGroupSummary, ValidatorConfig }

/**
 * Validator Service Adapter
 * Always uses real API implementation
 */
export class ValidatorService {
  /**
   * Get all validators with optional filters
   */
  static async getValidators(params?: ValidatorListParams): Promise<PaginatedResponse<ValidatorRule>> {
    return ValidatorServiceReal.getValidators(params)
  }

  /**
   * Get validator by ID
   */
  static async getValidatorById(id: string): Promise<ApiResponse<ValidatorRule>> {
    return ValidatorServiceReal.getValidatorById(id)
  }

  /**
   * Get validator groups
   */
  static async getGroups(): Promise<ApiResponse<ValidatorGroupSummary[]>> {
    return ValidatorServiceReal.getGroups()
  }

  /**
   * Get validators by file type
   */
  static async getValidatorsByFileType(fileType: string): Promise<ApiResponse<ValidatorRule[]>> {
    return ValidatorServiceReal.getValidatorsByFileType(fileType)
  }

  /**
   * Toggle validator enabled/disabled
   */
  static async toggleValidator(id: string): Promise<ApiResponse<ValidatorRule>> {
    return ValidatorServiceReal.toggleValidator(id)
  }

  /**
   * Update validator configuration
   */
  static async updateConfig(id: string, config: ValidatorConfig): Promise<ApiResponse<ValidatorRule>> {
    return ValidatorServiceReal.updateConfig(id, config)
  }

  /**
   * Get validators by group
   */
  static async getValidatorsByGroup(groupId: string): Promise<ApiResponse<ValidatorRule[]>> {
    return ValidatorServiceReal.getValidatorsByGroup(groupId)
  }

  /**
   * Get active validators count
   */
  static async getActiveCount(): Promise<ApiResponse<number>> {
    return ValidatorServiceReal.getActiveCount()
  }

  /**
   * Bulk enable validators
   */
  static async bulkEnable(ids: string[]): Promise<ApiResponse<ValidatorRule[]>> {
    return ValidatorServiceReal.bulkEnable(ids)
  }

  /**
   * Bulk disable validators
   */
  static async bulkDisable(ids: string[]): Promise<ApiResponse<ValidatorRule[]>> {
    return ValidatorServiceReal.bulkDisable(ids)
  }

  /**
   * Get validator categories
   */
  static async getCategories(): Promise<ApiResponse<string[]>> {
    return ValidatorServiceReal.getCategories()
  }

  /**
   * Test validator with sample data
   */
  static async testValidator(
    id: string,
    testData: Record<string, unknown>
  ): Promise<ApiResponse<{ passed: boolean; message?: string; errors?: string[] }>> {
    return ValidatorServiceReal.testValidator(id, testData)
  }

}

export default ValidatorService
