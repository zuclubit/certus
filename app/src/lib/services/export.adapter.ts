/**
 * Export Service Adapter
 *
 * Provides a unified interface for export/report operations
 * Connects to Certus API v1
 */

import type { ApiResponse, PaginatedResponse, Report, ReportFilters } from '@/types'
import type {
  ExportOptions,
  PeriodReportRequest,
  ComplianceReportRequest,
  ExportResult,
} from './api/export.service'
import { ExportService as ExportServiceReal } from './api/export.service'
import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'

// ============================================
// TYPES
// ============================================

export interface ReportListParams {
  page?: number
  pageSize?: number
  status?: ('pending' | 'processing' | 'completed' | 'failed')[]
  type?: string[]
  format?: string[]
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export interface ReportStatistics {
  totalReports: number
  thisMonth: number
  completed: number
  processing: number
  failed: number
  averageTimeSeconds: number
}

export interface GenerateReportRequest {
  name: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  format: 'pdf' | 'xlsx' | 'csv' | 'json'
  filters: {
    dateFrom: string
    dateTo: string
    status?: string[]
    fileType?: string[]
    severity?: string[]
  }
}

// ============================================
// SERVICE
// ============================================

export class ExportService {
  /**
   * Get paginated list of reports
   */
  static async getReports(params?: ReportListParams): Promise<PaginatedResponse<Report>> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo)

    params?.status?.forEach((s) => queryParams.append('status', s))
    params?.type?.forEach((t) => queryParams.append('type', t))
    params?.format?.forEach((f) => queryParams.append('format', f))

    const response = await apiClient.get<PaginatedResponse<Report>>(
      `${API_ENDPOINTS.EXPORTS.LIST}?${queryParams.toString()}`
    )

    return response.data
  }

  /**
   * Get report by ID
   */
  static async getReportById(id: string): Promise<ApiResponse<Report>> {
    const response = await apiClient.get<Report>(API_ENDPOINTS.EXPORTS.DETAIL(id))
    return {
      success: true,
      data: response.data,
      message: 'Report retrieved successfully',
    }
  }

  /**
   * Get report statistics
   */
  static async getStatistics(): Promise<ApiResponse<ReportStatistics>> {
    const response = await apiClient.get<ReportStatistics>(`${API_ENDPOINTS.EXPORTS.LIST}/statistics`)
    return {
      success: true,
      data: response.data,
      message: 'Statistics retrieved successfully',
    }
  }

  /**
   * Generate a new report
   */
  static async generateReport(request: GenerateReportRequest): Promise<ApiResponse<Report>> {
    const response = await apiClient.post<Report>(API_ENDPOINTS.EXPORTS.LIST, request)
    return {
      success: true,
      data: response.data,
      message: 'Report generation started',
    }
  }

  /**
   * Delete a report
   */
  static async deleteReport(id: string, justification: string): Promise<ApiResponse<void>> {
    await apiClient.delete(API_ENDPOINTS.EXPORTS.DETAIL(id), {
      data: { reason: justification },
    })
    return {
      success: true,
      data: undefined,
      message: 'Report deleted successfully',
    }
  }

  /**
   * Retry a failed report
   */
  static async retryReport(id: string): Promise<ApiResponse<Report>> {
    const response = await apiClient.post<Report>(`${API_ENDPOINTS.EXPORTS.DETAIL(id)}/retry`)
    return {
      success: true,
      data: response.data,
      message: 'Report retry initiated',
    }
  }

  // ============================================
  // EXPORT OPERATIONS (pass through to real service)
  // ============================================

  static async exportValidation(
    validationId: string,
    format: 'pdf' | 'excel' | 'csv' | 'json',
    options?: Partial<ExportOptions>
  ): Promise<ApiResponse<ExportResult>> {
    return ExportServiceReal.exportValidation(validationId, format, options)
  }

  static async generatePeriodReport(
    request: PeriodReportRequest
  ): Promise<ApiResponse<ExportResult>> {
    return ExportServiceReal.generatePeriodReport(request)
  }

  static async generateComplianceReport(
    request: ComplianceReportRequest
  ): Promise<ApiResponse<ExportResult>> {
    return ExportServiceReal.generateComplianceReport(request)
  }

  static downloadFile(result: ExportResult): void {
    ExportServiceReal.downloadFile(result)
  }

  static async exportAndDownload(
    validationId: string,
    format: 'pdf' | 'excel' | 'csv' | 'json',
    options?: Partial<ExportOptions>
  ): Promise<void> {
    return ExportServiceReal.exportAndDownload(validationId, format, options)
  }

}

export default ExportService

// Re-export types from real service
export type { ExportOptions, PeriodReportRequest, ComplianceReportRequest, ExportResult }
