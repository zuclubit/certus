/**
 * Validation Service Adapter
 *
 * Provides a unified interface for validation operations
 * Connects to Certus API v1
 */

import type { ValidationStatus, FileType } from '@/lib/constants'
import type {
  Validation,
  ValidationDetail,
  PaginatedResponse,
  ApiResponse,
  FileUploadForm,
} from '@/types'
import { ValidationServiceReal } from './api/validation.service'

/**
 * Validation Service Adapter
 * Always uses real API implementation
 */
export class ValidationService {
  /**
   * Get paginated list of validations with optional filters
   */
  static async getValidations(params: {
    page?: number
    pageSize?: number
    status?: ValidationStatus[]
    fileType?: FileType[]
    search?: string
    sortBy?: 'uploadedAt' | 'fileName' | 'status'
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Validation>> {
    return ValidationServiceReal.getValidations(params)
  }

  /**
   * Get validation detail by ID
   */
  static async getValidationById(id: string): Promise<ApiResponse<ValidationDetail>> {
    return ValidationServiceReal.getValidationById(id)
  }

  /**
   * Upload file for validation
   */
  static async uploadFile(formData: FileUploadForm): Promise<ApiResponse<Validation>> {
    return ValidationServiceReal.uploadFile(formData)
  }

  /**
   * Get validation statistics
   */
  static async getStatistics(): Promise<ApiResponse<{
    total: number
    processing: number
    success: number
    error: number
    warning: number
    pending: number
  }>> {
    return ValidationServiceReal.getStatistics()
  }

  /**
   * Get recent validations
   */
  static async getRecentValidations(limit: number = 5): Promise<ApiResponse<Validation[]>> {
    return ValidationServiceReal.getRecentValidations(limit)
  }

  /**
   * Retry validation
   */
  static async retryValidation(id: string): Promise<ApiResponse<Validation>> {
    return ValidationServiceReal.retryValidation(id)
  }

  /**
   * Delete validation (soft delete)
   */
  static async deleteValidation(id: string, justification?: string): Promise<ApiResponse<void>> {
    return ValidationServiceReal.deleteValidation(id, justification)
  }

  /**
   * Download report
   */
  static async downloadReport(
    id: string,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<ApiResponse<{ url: string; fileName: string }>> {
    return ValidationServiceReal.downloadReport(id, format)
  }

  /**
   * Batch upload files
   */
  static async batchUpload(files: File[], fileType: FileType): Promise<ApiResponse<Validation[]>> {
    return ValidationServiceReal.batchUpload(files, fileType)
  }

  /**
   * Search validations
   */
  static async searchValidations(query: string): Promise<ApiResponse<Validation[]>> {
    return ValidationServiceReal.searchValidations(query)
  }

  /**
   * Create corrected version with file (CONSAR RETRANSMISION)
   * Complies with CONSAR Circular 19-8
   */
  static async createCorrectedVersion(
    id: string,
    reason: string,
    file: File
  ): Promise<ApiResponse<Validation>> {
    return ValidationServiceReal.createCorrectedVersion(id, reason, file)
  }

  /**
   * Get version chain
   */
  static async getVersionChain(id: string): Promise<ApiResponse<Validation[]>> {
    return ValidationServiceReal.getVersionChain(id)
  }

}

export default ValidationService
