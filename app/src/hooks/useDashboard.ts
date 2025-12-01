/**
 * useDashboard Hook
 *
 * Custom hook for fetching dashboard data with TanStack Query
 * Provides reactive data fetching from DashboardController endpoints
 *
 * Endpoints consumed:
 * - GET /v1/dashboard/statistics
 * - GET /v1/dashboard/recent-validations
 * - GET /v1/dashboard/activity
 * - GET /v1/dashboard/alerts
 * - GET /v1/dashboard/trends
 * - GET /v1/dashboard/performance
 */

import { useQuery } from '@tanstack/react-query'
import { DashboardService } from '@/lib/services/api/dashboard.service'
import type {
  DashboardStatistics,
  DashboardActivity,
  DashboardAlert,
  DashboardTrends,
  DashboardPerformance,
} from '@/lib/services/api/dashboard.service'

// ============================================
// QUERY KEYS
// ============================================

export const dashboardKeys = {
  all: ['dashboard'] as const,
  statistics: () => [...dashboardKeys.all, 'statistics'] as const,
  statisticsWithDates: (startDate?: string, endDate?: string) =>
    [...dashboardKeys.statistics(), { startDate, endDate }] as const,
  recentValidations: (count?: number) =>
    [...dashboardKeys.all, 'recent-validations', count] as const,
  activity: (limit?: number, type?: string) =>
    [...dashboardKeys.all, 'activity', { limit, type }] as const,
  alerts: (unreadOnly?: boolean, type?: string, limit?: number) =>
    [...dashboardKeys.all, 'alerts', { unreadOnly, type, limit }] as const,
  trends: (period?: string, from?: string, to?: string) =>
    [...dashboardKeys.all, 'trends', { period, from, to }] as const,
  performance: () => [...dashboardKeys.all, 'performance'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook for fetching dashboard statistics
 * Includes: TotalValidations, SuccessRate, ErrorCount, ProcessingTime, etc.
 */
export function useDashboardStatistics(
  params?: {
    startDate?: string
    endDate?: string
  },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: dashboardKeys.statisticsWithDates(params?.startDate, params?.endDate),
    queryFn: () => DashboardService.getStatistics(),
    enabled,
    staleTime: 60000, // 1 minute (backend caches for 5 min)
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook for fetching recent validations for dashboard
 */
export function useDashboardRecentValidations(
  limit: number = 10,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: dashboardKeys.recentValidations(limit),
    queryFn: () => DashboardService.getRecentValidations(limit),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
  })
}

/**
 * Hook for fetching activity feed
 */
export function useDashboardActivity(
  params?: {
    limit?: number
    type?: string
  },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: dashboardKeys.activity(params?.limit, params?.type),
    queryFn: () => DashboardService.getActivity(params),
    enabled,
    staleTime: 30000, // 30 seconds
    refetchInterval: 20000, // Refetch every 20 seconds
  })
}

/**
 * Hook for fetching dashboard alerts
 * Returns compliance alerts, warnings, and notifications from backend
 */
export function useDashboardAlerts(
  params?: {
    unreadOnly?: boolean
    type?: string
    limit?: number
  },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: dashboardKeys.alerts(params?.unreadOnly, params?.type, params?.limit),
    queryFn: () => DashboardService.getAlerts(params),
    enabled,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every 60 seconds
  })
}

/**
 * Hook for fetching trend data for charts
 */
export function useDashboardTrends(
  params?: {
    period?: 'day' | 'week' | 'month' | 'year'
    from?: string
    to?: string
  },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: dashboardKeys.trends(params?.period, params?.from, params?.to),
    queryFn: () => DashboardService.getTrends(params),
    enabled,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // Refetch every 5 minutes
  })
}

/**
 * Hook for fetching performance metrics (requires Supervisor role)
 */
export function useDashboardPerformance(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.performance(),
    queryFn: () => DashboardService.getPerformance(),
    enabled,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // Refetch every 5 minutes
  })
}

/**
 * Hook for fetching formatted dashboard metrics
 */
export function useDashboardMetrics(enabled: boolean = true) {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: () => DashboardService.getMetrics(),
    enabled,
    staleTime: 60000, // 1 minute
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// ============================================
// COMBINED HOOK FOR FULL DASHBOARD DATA
// ============================================

/**
 * Combined hook that fetches all dashboard data needed for the main dashboard
 * Optimized for parallel fetching
 */
export function useDashboard(enabled: boolean = true) {
  const statistics = useDashboardStatistics(undefined, enabled)
  const recentValidations = useDashboardRecentValidations(10, enabled)
  const alerts = useDashboardAlerts(undefined, enabled)
  const trends = useDashboardTrends({ period: 'day' }, enabled)

  const isLoading =
    statistics.isLoading ||
    recentValidations.isLoading ||
    alerts.isLoading ||
    trends.isLoading

  const isError =
    statistics.isError ||
    recentValidations.isError ||
    alerts.isError ||
    trends.isError

  const errors = [
    statistics.error,
    recentValidations.error,
    alerts.error,
    trends.error,
  ].filter(Boolean)

  const refetchAll = async () => {
    await Promise.all([
      statistics.refetch(),
      recentValidations.refetch(),
      alerts.refetch(),
      trends.refetch(),
    ])
  }

  return {
    statistics: statistics.data?.data,
    recentValidations: recentValidations.data?.data,
    alerts: alerts.data?.data,
    trends: trends.data?.data,
    isLoading,
    isError,
    errors,
    refetchAll,
    // Individual query states for granular control
    queries: {
      statistics,
      recentValidations,
      alerts,
      trends,
    },
  }
}

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  DashboardStatistics,
  DashboardActivity,
  DashboardAlert,
  DashboardTrends,
  DashboardPerformance,
}
