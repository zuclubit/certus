/**
 * Dashboard Service - Real API Implementation
 *
 * Handles dashboard metrics and statistics from Certus API v1
 * Provides real-time data for KPIs and charts
 *
 * Backend endpoints:
 * - GET /v1/dashboard/statistics
 * - GET /v1/dashboard/recent-validations
 * - GET /v1/dashboard/activity
 * - GET /v1/dashboard/alerts
 * - GET /v1/dashboard/trends
 * - GET /v1/dashboard/performance
 */

import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { ApiResponse, DashboardMetrics, Validation } from '@/types'

// ============================================
// TYPES - Aligned with Backend DTOs
// ============================================

/**
 * FileTypeStatistics - Matches backend FileTypeStatistics
 */
export interface FileTypeStatistics {
  total: number
  approved: number
  withErrors: number
  totalRecords: number
  totalErrors: number
}

/**
 * TrendDataPointBackend - Matches backend TrendDataPoint
 */
export interface TrendDataPointBackend {
  date: string
  total: number
  approved: number
  withErrors: number
  records: number
}

/**
 * PeriodInfo - Matches backend PeriodInfo
 */
export interface PeriodInfo {
  startDate: string
  endDate: string
  generatedAt: string
}

/**
 * DashboardStatistics - Matches backend DashboardStatistics DTO
 */
export interface DashboardStatistics {
  // Counts by status
  totalValidations: number
  pendingValidations: number
  processingValidations: number
  completedValidations: number
  approvedValidations: number
  rejectedValidations: number
  failedValidations: number

  // Record metrics
  totalRecordsProcessed: number
  totalValidRecords: number
  totalErrors: number
  totalWarnings: number

  // Calculated metrics
  successRate: number
  averageProcessingTimeMs: number

  // Breakdown data
  byFileType: Record<string, FileTypeStatistics>
  byStatus: Record<string, number>
  trendData: TrendDataPointBackend[]

  // Period info
  period: PeriodInfo
}

/**
 * RecentValidation - Matches backend RecentValidation DTO
 */
export interface RecentValidation {
  id: string
  fileName: string
  fileType: string
  status: string
  totalRecords: number
  errorCount: number
  warningCount: number
  uploadedAt: string
  uploadedBy?: string
}

/**
 * DashboardActivity - Matches backend ActivityItem DTO
 */
export interface DashboardActivity {
  id: string
  type: string
  title: string
  description: string
  user: string
  timestamp: string
  icon: string
  color: string
}

/**
 * DashboardAlert - Matches backend DashboardAlert DTO
 */
export interface DashboardAlert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  actionUrl?: string
  createdAt: string
}

/**
 * DashboardTrends - Matches backend TrendData DTO
 */
export interface DashboardTrends {
  labels: string[]
  datasets: Record<string, number[]>
}

/**
 * ValidatorPerformance - Matches backend ValidatorPerformance DTO
 */
export interface ValidatorPerformance {
  code: string
  name: string
  averageMs: number
  executionCount: number
  successRate: number
}

/**
 * DashboardPerformance - Matches backend PerformanceMetrics DTO
 */
export interface DashboardPerformance {
  averageProcessingTimeMs: number
  maxProcessingTimeMs: number
  minProcessingTimeMs: number
  totalValidationsProcessed: number
  totalRecordsProcessed: number
  validatorsPerformance: ValidatorPerformance[]
  slowestValidators: ValidatorPerformance[]
  processingTimeByFileType: Record<string, number>
  period: PeriodInfo
}

// ============================================
// SERVICE
// ============================================

export class DashboardService {
  /**
   * Get dashboard statistics/metrics
   */
  static async getStatistics(): Promise<ApiResponse<DashboardStatistics>> {
    const response = await apiClient.get<DashboardStatistics>(API_ENDPOINTS.DASHBOARD.STATISTICS)

    return {
      success: true,
      data: response.data,
      message: 'Statistics retrieved successfully',
    }
  }

  /**
   * Get recent validations for dashboard
   */
  static async getRecentValidations(limit: number = 10): Promise<ApiResponse<RecentValidation[]>> {
    const response = await apiClient.get<RecentValidation[]>(API_ENDPOINTS.DASHBOARD.RECENT_VALIDATIONS, {
      params: { count: limit }, // Backend uses 'count' parameter
    })

    return {
      success: true,
      data: response.data,
      message: 'Recent validations retrieved successfully',
    }
  }

  /**
   * Get activity feed
   */
  static async getActivity(params?: {
    limit?: number
    type?: string
  }): Promise<ApiResponse<DashboardActivity[]>> {
    const response = await apiClient.get<DashboardActivity[]>(API_ENDPOINTS.DASHBOARD.ACTIVITY, {
      params,
    })

    return {
      success: true,
      data: response.data,
      message: 'Activity feed retrieved successfully',
    }
  }

  /**
   * Get dashboard alerts
   */
  static async getAlerts(params?: {
    unreadOnly?: boolean
    type?: string
    limit?: number
  }): Promise<ApiResponse<DashboardAlert[]>> {
    const response = await apiClient.get<DashboardAlert[]>(API_ENDPOINTS.DASHBOARD.ALERTS, {
      params,
    })

    return {
      success: true,
      data: response.data,
      message: 'Alerts retrieved successfully',
    }
  }

  /**
   * Get validation trends data
   */
  static async getTrends(params?: {
    period?: 'day' | 'week' | 'month' | 'year'
    from?: string
    to?: string
  }): Promise<ApiResponse<DashboardTrends>> {
    const response = await apiClient.get<DashboardTrends>(API_ENDPOINTS.DASHBOARD.TRENDS, {
      params,
    })

    return {
      success: true,
      data: response.data,
      message: 'Trends retrieved successfully',
    }
  }

  /**
   * Get system performance metrics
   */
  static async getPerformance(): Promise<ApiResponse<DashboardPerformance>> {
    const response = await apiClient.get<DashboardPerformance>(API_ENDPOINTS.DASHBOARD.PERFORMANCE)

    return {
      success: true,
      data: response.data,
      message: 'Performance metrics retrieved successfully',
    }
  }

  /**
   * Mark alert as read
   */
  static async markAlertAsRead(alertId: string): Promise<ApiResponse<void>> {
    await apiClient.patch(`${API_ENDPOINTS.DASHBOARD.ALERTS}/${alertId}/read`)

    return {
      success: true,
      data: undefined,
      message: 'Alert marked as read',
    }
  }

  /**
   * Mark all alerts as read
   */
  static async markAllAlertsAsRead(): Promise<ApiResponse<void>> {
    await apiClient.patch(`${API_ENDPOINTS.DASHBOARD.ALERTS}/read-all`)

    return {
      success: true,
      data: undefined,
      message: 'All alerts marked as read',
    }
  }

  /**
   * Get dashboard metrics (formatted for UI components)
   * Calculates change percentages from trend data when available
   */
  static async getMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    const stats = await this.getStatistics()

    // Calculate change from trend data if available
    let validationsChange = 0
    let successRateChange = 0
    let errorsChange = 0
    let processingTimeChange = 0

    if (stats.data.trendData && stats.data.trendData.length >= 2) {
      const recent = stats.data.trendData.slice(-7)
      const previous = stats.data.trendData.slice(-14, -7)

      if (previous.length > 0 && recent.length > 0) {
        const recentTotal = recent.reduce((sum, d) => sum + d.total, 0)
        const previousTotal = previous.reduce((sum, d) => sum + d.total, 0)
        validationsChange = previousTotal > 0
          ? ((recentTotal - previousTotal) / previousTotal) * 100
          : 0

        const recentErrors = recent.reduce((sum, d) => sum + d.withErrors, 0)
        const previousErrors = previous.reduce((sum, d) => sum + d.withErrors, 0)
        errorsChange = previousErrors > 0
          ? ((recentErrors - previousErrors) / previousErrors) * 100
          : 0
      }
    }

    const metrics: DashboardMetrics = {
      totalValidations: {
        value: stats.data.totalValidations,
        change: Math.round(validationsChange * 10) / 10,
        period: 'vs. semana anterior',
      },
      successRate: {
        value: Math.round(stats.data.successRate * 10) / 10,
        change: Math.round(successRateChange * 10) / 10,
        period: 'vs. semana anterior',
      },
      errorCount: {
        value: stats.data.totalErrors,
        change: Math.round(errorsChange * 10) / 10,
        period: 'vs. semana anterior',
      },
      avgProcessingTime: {
        value: Math.round(stats.data.averageProcessingTimeMs / 1000), // Convert to seconds
        change: Math.round(processingTimeChange * 10) / 10,
        period: 'vs. semana anterior',
      },
    }

    return {
      success: true,
      data: metrics,
      message: 'Metrics retrieved successfully',
    }
  }

  /**
   * Get trends data formatted for charts
   * Converts backend TrendData to frontend-friendly format
   */
  static async getTrendsForChart(params?: {
    days?: number
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<ApiResponse<{ data: TrendDataPointBackend[] }>> {
    const response = await apiClient.get<DashboardTrends>(API_ENDPOINTS.DASHBOARD.TRENDS, {
      params: {
        days: params?.days || 7,
        groupBy: params?.groupBy || 'day',
      },
    })

    // Transform backend format to chart-friendly format
    const data: TrendDataPointBackend[] = response.data.labels.map((label, index) => ({
      date: label,
      total: response.data.datasets['total']?.[index] || 0,
      approved: response.data.datasets['approved']?.[index] || 0,
      withErrors: response.data.datasets['errors']?.[index] || 0,
      records: response.data.datasets['records']?.[index] || 0,
    }))

    return {
      success: true,
      data: { data },
      message: 'Chart trends retrieved successfully',
    }
  }
}

export default DashboardService
