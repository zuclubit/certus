/**
 * Export Service - Real API Implementation
 *
 * Handles report export operations against Certus API v1
 * Generates PDF, Excel, CSV, and JSON exports
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { ApiResponse } from '@/types'

// ============================================
// TYPES
// ============================================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json'
  includeDetails?: boolean
  includeErrors?: boolean
  includeWarnings?: boolean
  language?: 'es' | 'en'
}

export interface PeriodReportRequest {
  startDate: string
  endDate: string
  format: 'pdf' | 'excel' | 'csv'
  fileTypes?: string[]
  statuses?: string[]
  groupBy?: 'day' | 'week' | 'month'
  includeCharts?: boolean
}

export interface ComplianceReportRequest {
  startDate: string
  endDate: string
  format: 'pdf' | 'excel'
  regulatoryFramework?: string
  includeRecommendations?: boolean
}

export interface ExportResult {
  url: string
  fileName: string
  fileSize: number
  mimeType: string
  expiresAt?: string
}

// ============================================
// SERVICE
// ============================================

export class ExportService {
  /**
   * Export validation report to PDF
   */
  static async exportValidationToPdf(
    validationId: string,
    options?: Partial<ExportOptions>
  ): Promise<ApiResponse<ExportResult>> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.EXPORTS.VALIDATION_PDF(validationId),
      {
        params: options,
        responseType: 'blob',
      }
    )

    const url = window.URL.createObjectURL(response.data)
    const contentDisposition = response.headers['content-disposition']
    const fileName = this.extractFileName(contentDisposition) || `validation_${validationId}.pdf`

    return {
      success: true,
      data: {
        url,
        fileName,
        fileSize: response.data.size,
        mimeType: 'application/pdf',
      },
      message: 'PDF generated successfully',
    }
  }

  /**
   * Export validation report to Excel
   */
  static async exportValidationToExcel(
    validationId: string,
    options?: Partial<ExportOptions>
  ): Promise<ApiResponse<ExportResult>> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.EXPORTS.VALIDATION_EXCEL(validationId),
      {
        params: options,
        responseType: 'blob',
      }
    )

    const url = window.URL.createObjectURL(response.data)
    const contentDisposition = response.headers['content-disposition']
    const fileName = this.extractFileName(contentDisposition) || `validation_${validationId}.xlsx`

    return {
      success: true,
      data: {
        url,
        fileName,
        fileSize: response.data.size,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      message: 'Excel file generated successfully',
    }
  }

  /**
   * Export validation report to CSV
   */
  static async exportValidationToCsv(
    validationId: string,
    options?: Partial<ExportOptions>
  ): Promise<ApiResponse<ExportResult>> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.EXPORTS.VALIDATION_CSV(validationId),
      {
        params: options,
        responseType: 'blob',
      }
    )

    const url = window.URL.createObjectURL(response.data)
    const contentDisposition = response.headers['content-disposition']
    const fileName = this.extractFileName(contentDisposition) || `validation_${validationId}.csv`

    return {
      success: true,
      data: {
        url,
        fileName,
        fileSize: response.data.size,
        mimeType: 'text/csv',
      },
      message: 'CSV file generated successfully',
    }
  }

  /**
   * Export validation report to JSON
   */
  static async exportValidationToJson(
    validationId: string,
    options?: Partial<ExportOptions>
  ): Promise<ApiResponse<ExportResult>> {
    const response = await apiClient.get<Blob>(
      API_ENDPOINTS.EXPORTS.VALIDATION_JSON(validationId),
      {
        params: options,
        responseType: 'blob',
      }
    )

    const url = window.URL.createObjectURL(response.data)
    const contentDisposition = response.headers['content-disposition']
    const fileName = this.extractFileName(contentDisposition) || `validation_${validationId}.json`

    return {
      success: true,
      data: {
        url,
        fileName,
        fileSize: response.data.size,
        mimeType: 'application/json',
      },
      message: 'JSON file generated successfully',
    }
  }

  /**
   * Generate period report
   */
  static async generatePeriodReport(
    request: PeriodReportRequest
  ): Promise<ApiResponse<ExportResult>> {
    const response = await apiClient.post<Blob>(
      API_ENDPOINTS.EXPORTS.PERIOD_REPORT,
      request,
      { responseType: 'blob' }
    )

    const url = window.URL.createObjectURL(response.data)
    const contentDisposition = response.headers['content-disposition']
    const ext = request.format === 'excel' ? 'xlsx' : request.format
    const fileName =
      this.extractFileName(contentDisposition) ||
      `period_report_${request.startDate}_${request.endDate}.${ext}`

    return {
      success: true,
      data: {
        url,
        fileName,
        fileSize: response.data.size,
        mimeType: this.getMimeType(request.format),
      },
      message: 'Period report generated successfully',
    }
  }

  /**
   * Generate compliance report
   */
  static async generateComplianceReport(
    request: ComplianceReportRequest
  ): Promise<ApiResponse<ExportResult>> {
    const response = await apiClient.post<Blob>(
      API_ENDPOINTS.EXPORTS.COMPLIANCE_REPORT,
      request,
      { responseType: 'blob' }
    )

    const url = window.URL.createObjectURL(response.data)
    const contentDisposition = response.headers['content-disposition']
    const ext = request.format === 'excel' ? 'xlsx' : request.format
    const fileName =
      this.extractFileName(contentDisposition) ||
      `compliance_report_${request.startDate}_${request.endDate}.${ext}`

    return {
      success: true,
      data: {
        url,
        fileName,
        fileSize: response.data.size,
        mimeType: this.getMimeType(request.format),
      },
      message: 'Compliance report generated successfully',
    }
  }

  /**
   * Export validation in specified format
   */
  static async exportValidation(
    validationId: string,
    format: 'pdf' | 'excel' | 'csv' | 'json',
    options?: Partial<ExportOptions>
  ): Promise<ApiResponse<ExportResult>> {
    switch (format) {
      case 'pdf':
        return this.exportValidationToPdf(validationId, options)
      case 'excel':
        return this.exportValidationToExcel(validationId, options)
      case 'csv':
        return this.exportValidationToCsv(validationId, options)
      case 'json':
        return this.exportValidationToJson(validationId, options)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Download file from blob URL
   */
  static downloadFile(result: ExportResult): void {
    const link = document.createElement('a')
    link.href = result.url
    link.download = result.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Revoke blob URL after download
    setTimeout(() => {
      window.URL.revokeObjectURL(result.url)
    }, 100)
  }

  /**
   * Export and download in one step
   */
  static async exportAndDownload(
    validationId: string,
    format: 'pdf' | 'excel' | 'csv' | 'json',
    options?: Partial<ExportOptions>
  ): Promise<void> {
    const result = await this.exportValidation(validationId, format, options)
    this.downloadFile(result.data)
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  /**
   * Extract filename from Content-Disposition header
   */
  private static extractFileName(contentDisposition?: string): string | null {
    if (!contentDisposition) return null

    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1].replace(/['"]/g, '')
    }

    return null
  }

  /**
   * Get MIME type for format
   */
  private static getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      json: 'application/json',
    }

    return mimeTypes[format] || 'application/octet-stream'
  }
}

export default ExportService
