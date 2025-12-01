/**
 * Validation Service - Real API Implementation
 *
 * Handles file validation operations against Certus API v1
 * Implements CONSAR Circular 19-8 compliance requirements
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { ValidationStatus, FileType } from '@/lib/constants'
import type {
  Validation,
  ValidationDetail,
  ValidationError,
  PaginatedResponse,
  ApiResponse,
  FileUploadForm,
} from '@/types'

// ============================================
// TYPES
// ============================================

export interface ValidationFilters {
  page?: number
  pageSize?: number
  status?: ValidationStatus[]
  fileType?: FileType[]
  search?: string
  sortBy?: 'uploadedAt' | 'fileName' | 'status'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export interface ValidationStatistics {
  total: number
  processing: number
  success: number
  error: number
  warning: number
  pending: number
  todayCount: number
  successRate: number
}

export interface SubstituteFileRequest {
  originalValidationId: string
  reason: string
  file: File
}

// ============================================
// SERVICE
// ============================================

export class ValidationServiceReal {
  /**
   * Get paginated list of validations with optional filters
   */
  static async getValidations(params: ValidationFilters): Promise<PaginatedResponse<Validation>> {
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append('page', params.page.toString())
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params.search) queryParams.append('search', params.search)
    if (params.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder === 'desc' ? 'true' : 'false')
    if (params.dateFrom) queryParams.append('startDate', params.dateFrom)
    if (params.dateTo) queryParams.append('endDate', params.dateTo)

    // Handle arrays
    params.status?.forEach((s) => queryParams.append('status', s))
    params.fileType?.forEach((f) => queryParams.append('fileType', f))

    // Backend returns { items, page, pageSize, totalCount, totalPages }
    // Frontend expects { data, page, pageSize, total, totalPages }
    const response = await apiClient.get<{
      items: Validation[]
      page: number
      pageSize: number
      totalCount: number
      totalPages: number
    }>(`${API_ENDPOINTS.VALIDATIONS.LIST}?${queryParams.toString()}`)

    // Map backend response to frontend expected format
    return {
      data: response.data.items || [],
      page: response.data.page,
      pageSize: response.data.pageSize,
      total: response.data.totalCount,
      totalPages: response.data.totalPages,
    }
  }

  /**
   * Get validation detail by ID
   */
  static async getValidationById(id: string): Promise<ApiResponse<ValidationDetail>> {
    const response = await apiClient.get<Record<string, unknown>>(API_ENDPOINTS.VALIDATIONS.DETAIL(id))

    // Transform backend response to frontend expected format
    // Backend returns: ValidatorResults, Errors, Warnings, Timeline
    // Frontend expects: validators, errors, warnings, timeline, auditLog
    const backendData = response.data
    const transformedData: ValidationDetail = {
      ...backendData,
      // Map validatorResults to validators (handle both naming conventions)
      validators: (backendData.validatorResults ?? backendData.validators ?? []) as ValidationDetail['validators'],
      // Ensure arrays have defaults
      errors: (backendData.errors ?? []) as ValidationDetail['errors'],
      warnings: (backendData.warnings ?? []) as ValidationDetail['warnings'],
      timeline: (backendData.timeline ?? []) as ValidationDetail['timeline'],
      // Backend doesn't provide auditLog yet - provide empty array
      auditLog: (backendData.auditLog ?? []) as ValidationDetail['auditLog'],
    } as ValidationDetail

    return {
      success: true,
      data: transformedData,
      message: 'Validation detail retrieved successfully',
    }
  }

  /**
   * Upload file for validation
   */
  static async uploadFile(formData: FileUploadForm): Promise<ApiResponse<Validation>> {
    const { files, fileType } = formData

    if (files.length === 0) {
      throw new Error('No files provided')
    }

    const form = new FormData()
    form.append('file', files[0] as Blob)
    form.append('fileType', fileType as string)
    form.append('autoProcess', 'true')

    const response = await apiClient.post<Validation>(API_ENDPOINTS.VALIDATIONS.UPLOAD, form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return {
      success: true,
      data: response.data,
      message: 'File uploaded successfully and validation started',
    }
  }

  /**
   * Get validation statistics
   */
  static async getStatistics(): Promise<ApiResponse<ValidationStatistics>> {
    const response = await apiClient.get<ValidationStatistics>(
      API_ENDPOINTS.VALIDATIONS.STATISTICS
    )

    return {
      success: true,
      data: response.data,
      message: 'Statistics retrieved successfully',
    }
  }

  /**
   * Get recent validations
   */
  static async getRecentValidations(limit: number = 5): Promise<ApiResponse<Validation[]>> {
    const response = await apiClient.get<Validation[]>(API_ENDPOINTS.VALIDATIONS.RECENT, {
      params: { limit },
    })

    return {
      success: true,
      data: response.data,
      message: 'Recent validations retrieved successfully',
    }
  }

  /**
   * Get validation errors
   */
  static async getValidationErrors(
    id: string,
    params?: {
      page?: number
      pageSize?: number
      severity?: string[]
    }
  ): Promise<PaginatedResponse<ValidationError>> {
    const response = await apiClient.get<PaginatedResponse<ValidationError>>(
      API_ENDPOINTS.VALIDATIONS.ERRORS(id),
      { params }
    )

    return response.data
  }

  /**
   * Retry validation
   */
  static async retryValidation(id: string): Promise<ApiResponse<Validation>> {
    const response = await apiClient.post<Validation>(API_ENDPOINTS.VALIDATIONS.RETRY(id))

    return {
      success: true,
      data: response.data,
      message: 'Validation retry started',
    }
  }

  /**
   * Cancel validation
   */
  static async cancelValidation(id: string): Promise<ApiResponse<void>> {
    await apiClient.post(API_ENDPOINTS.VALIDATIONS.CANCEL(id))

    return {
      success: true,
      data: undefined,
      message: 'Validation cancelled',
    }
  }

  /**
   * Create substitute file (CONSAR RETRANSMISION)
   * Complies with CONSAR Circular 19-8
   */
  static async createSubstituteFile(request: SubstituteFileRequest): Promise<ApiResponse<Validation>> {
    const form = new FormData()
    form.append('file', request.file)
    form.append('reason', request.reason)

    const response = await apiClient.post<Validation>(
      API_ENDPOINTS.VALIDATIONS.SUBSTITUTE(request.originalValidationId),
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return {
      success: true,
      data: response.data,
      message: 'Substitute file created successfully',
    }
  }

  /**
   * Batch upload files
   */
  static async batchUpload(files: File[], fileType: FileType): Promise<ApiResponse<Validation[]>> {
    const validations: Validation[] = []

    for (const file of files) {
      const response = await this.uploadFile({ files: [file], fileType })
      if (response.data) {
        validations.push(response.data)
      }
    }

    return {
      success: true,
      data: validations,
      message: `${validations.length} files uploaded successfully`,
    }
  }

  /**
   * Search validations by file name or user
   */
  static async searchValidations(query: string): Promise<ApiResponse<Validation[]>> {
    const response = await this.getValidations({
      search: query,
      pageSize: 20,
    })

    return {
      success: true,
      data: response.data,
      message: `Found ${response.total} results`,
    }
  }

  /**
   * Delete validation (soft delete with justification)
   * Complies with financial regulations requiring audit trail
   */
  static async deleteValidation(id: string, justification?: string): Promise<ApiResponse<void>> {
    await apiClient.delete(API_ENDPOINTS.VALIDATIONS.DETAIL(id), {
      data: { justification },
    })

    return {
      success: true,
      data: undefined,
      message: 'Validation deleted successfully',
    }
  }

  /**
   * Get version chain for a validation
   * Returns all versions (original + substitutes)
   */
  static async getVersionChain(id: string): Promise<ApiResponse<Validation[]>> {
    const response = await apiClient.get<Validation[]>(
      `${API_ENDPOINTS.VALIDATIONS.DETAIL(id)}/versions`
    )

    return {
      success: true,
      data: response.data,
      message: `Found ${response.data.length} versions in chain`,
    }
  }

  /**
   * Download validation report
   */
  static async downloadReport(
    id: string,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<ApiResponse<{ url: string; fileName: string }>> {
    const endpoint = format === 'pdf'
      ? API_ENDPOINTS.EXPORTS.VALIDATION_PDF(id)
      : format === 'excel'
        ? API_ENDPOINTS.EXPORTS.VALIDATION_EXCEL(id)
        : API_ENDPOINTS.EXPORTS.VALIDATION_CSV(id)

    const response = await apiClient.get<Blob>(endpoint, {
      responseType: 'blob',
    })

    // Create blob URL for download
    const url = window.URL.createObjectURL(response.data)
    const contentDisposition = response.headers['content-disposition']
    const fileName = contentDisposition
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
      : `validation_${id}_report.${format}`

    return {
      success: true,
      data: { url, fileName },
      message: 'Report generated successfully',
    }
  }

  /**
   * Create corrected version with file upload
   * Complies with CONSAR Circular 19-8 - RETRANSMISION process
   */
  static async createCorrectedVersion(
    id: string,
    reason: string,
    file: File
  ): Promise<ApiResponse<Validation>> {
    // Use createSubstituteFile internally with proper file upload
    return this.createSubstituteFile({
      originalValidationId: id,
      reason,
      file,
    })
  }
}

export default ValidationServiceReal
