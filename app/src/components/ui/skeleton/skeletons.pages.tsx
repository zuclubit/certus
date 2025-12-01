/**
 * Page-Level Skeletons - VisionOS Enterprise 2025
 *
 * Skeletons completos para páginas enteras.
 * Diseñados para coincidir con el layout real de cada página.
 */

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton, SkeletonText } from './skeleton'
import {
  StatCardSkeleton,
  TableSkeleton,
  ChartSkeleton,
  ActivityFeedSkeleton,
  HeaderSkeleton,
  CardSkeleton,
} from './skeletons.composite'

// ============================================================================
// DASHBOARD SKELETON
// ============================================================================

export interface DashboardSkeletonProps {
  className?: string
}

export const DashboardSkeleton = memo(function DashboardSkeleton({
  className,
}: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading dashboard">
      {/* Header */}
      <HeaderSkeleton showButton={false} />

      {/* Stats Grid - 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton type="area" height={250} />
        <ChartSkeleton type="bar" height={250} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
      </div>

      {/* Bottom Row - Activity and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeedSkeleton items={5} />
        </div>
        <ChartSkeleton type="pie" height={200} showLegend={false} />
      </div>
    </div>
  )
})

// ============================================================================
// VALIDATIONS PAGE SKELETON
// ============================================================================

export interface ValidationsSkeletonProps {
  className?: string
}

export const ValidationsSkeleton = memo(function ValidationsSkeleton({
  className,
}: ValidationsSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading validations">
      {/* Header */}
      <HeaderSkeleton showButton={true} />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Skeleton width={200} height={40} radius={10} />
        <Skeleton width={160} height={40} radius={10} />
        <Skeleton width={140} height={40} radius={10} />
        <Skeleton width={100} height={40} radius={10} />
      </div>

      {/* Table */}
      <TableSkeleton rows={8} columns={6} />
    </div>
  )
})

// ============================================================================
// VALIDATION DETAIL SKELETON
// ============================================================================

export interface ValidationDetailSkeletonProps {
  className?: string
}

export const ValidationDetailSkeleton = memo(function ValidationDetailSkeleton({
  className,
}: ValidationDetailSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading validation details">
      {/* Back button and title */}
      <div className="flex items-center gap-4">
        <Skeleton width={100} height={36} radius={8} />
        <div className="flex-1">
          <Skeleton width="40%" height={24} radius={8} className="mb-2" />
          <Skeleton width="60%" height={14} radius={7} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={120} height={40} radius={10} />
          <Skeleton width={120} height={40} radius={10} />
        </div>
      </div>

      {/* Summary Card */}
      <CardSkeleton showHeader={false} height={160}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton width="60%" height={12} radius={6} />
              <Skeleton width="80%" height={20} radius={8} />
            </div>
          ))}
        </div>
      </CardSkeleton>

      {/* Errors Table */}
      <CardSkeleton>
        <TableSkeleton rows={6} columns={4} showHeader={true} className="!p-0 !rounded-none" />
      </CardSkeleton>

      {/* Timeline */}
      <CardSkeleton>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton width={12} height={12} circle className="flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <Skeleton width="30%" height={14} radius={7} />
                <Skeleton width="70%" height={12} radius={6} />
              </div>
              <Skeleton width={80} height={12} radius={6} className="flex-shrink-0" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    </div>
  )
})

// ============================================================================
// CATALOGS PAGE SKELETON
// ============================================================================

export interface CatalogsSkeletonProps {
  className?: string
}

export const CatalogsSkeleton = memo(function CatalogsSkeleton({
  className,
}: CatalogsSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading catalogs">
      {/* Header */}
      <HeaderSkeleton />

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3">
        <Skeleton width={280} height={40} radius={10} />
        <Skeleton width={160} height={40} radius={10} />
        <Skeleton width={140} height={40} radius={10} />
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} height={180}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton width={48} height={48} radius={12} />
                <div className="flex-1 space-y-2">
                  <Skeleton width="70%" height={16} radius={8} />
                  <Skeleton width="50%" height={12} radius={6} />
                </div>
              </div>
              <SkeletonText lines={2} height={12} />
              <div className="flex justify-between items-center">
                <Skeleton width={60} height={22} radius={11} />
                <Skeleton width={80} height={32} radius={8} />
              </div>
            </div>
          </CardSkeleton>
        ))}
      </div>
    </div>
  )
})

// ============================================================================
// REPORTS PAGE SKELETON
// ============================================================================

export interface ReportsSkeletonProps {
  className?: string
}

export const ReportsSkeleton = memo(function ReportsSkeleton({
  className,
}: ReportsSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading reports">
      {/* Header */}
      <HeaderSkeleton />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton width={100} height={36} radius={18} />
        <Skeleton width={100} height={36} radius={18} />
        <Skeleton width={100} height={36} radius={18} />
      </div>

      {/* Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton type="line" height={300} />
        <ChartSkeleton type="bar" height={300} />
      </div>

      {/* Recent Reports Table */}
      <TableSkeleton rows={5} columns={5} />
    </div>
  )
})

// ============================================================================
// USERS PAGE SKELETON
// ============================================================================

export interface UsersSkeletonProps {
  className?: string
}

export const UsersSkeleton = memo(function UsersSkeleton({
  className,
}: UsersSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading users">
      {/* Header */}
      <HeaderSkeleton />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Skeleton width={240} height={40} radius={10} />
        <Skeleton width={140} height={40} radius={10} />
        <Skeleton width={140} height={40} radius={10} />
      </div>

      {/* Users Grid - Card view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} showHeader={false} height={200}>
            <div className="flex flex-col items-center text-center space-y-3">
              <Skeleton width={64} height={64} circle />
              <Skeleton width="60%" height={16} radius={8} />
              <Skeleton width="80%" height={12} radius={6} />
              <Skeleton width={80} height={24} radius={12} />
              <div className="flex gap-2 pt-2">
                <Skeleton width={32} height={32} radius={8} />
                <Skeleton width={32} height={32} radius={8} />
                <Skeleton width={32} height={32} radius={8} />
              </div>
            </div>
          </CardSkeleton>
        ))}
      </div>
    </div>
  )
})

// ============================================================================
// APPROVALS PAGE SKELETON
// ============================================================================

export interface ApprovalsSkeletonProps {
  className?: string
}

export const ApprovalsSkeleton = memo(function ApprovalsSkeleton({
  className,
}: ApprovalsSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading approvals">
      {/* Header */}
      <HeaderSkeleton />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
        <StatCardSkeleton showTrend={false} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-3">
        <Skeleton width={120} height={36} radius={8} />
        <Skeleton width={120} height={36} radius={8} />
        <Skeleton width={120} height={36} radius={8} />
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} showHeader={false} height={120}>
            <div className="flex items-center gap-4">
              <Skeleton width={48} height={48} radius={12} className="flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton width="40%" height={16} radius={8} />
                  <Skeleton width={60} height={22} radius={11} />
                </div>
                <Skeleton width="70%" height={12} radius={6} />
                <Skeleton width="30%" height={10} radius={5} />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Skeleton width={100} height={36} radius={8} />
                <Skeleton width={100} height={36} radius={8} />
              </div>
            </div>
          </CardSkeleton>
        ))}
      </div>
    </div>
  )
})

// ============================================================================
// SETTINGS PAGE SKELETON
// ============================================================================

export interface SettingsSkeletonProps {
  className?: string
}

export const SettingsSkeleton = memo(function SettingsSkeleton({
  className,
}: SettingsSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)} aria-busy="true" aria-label="Loading settings">
      {/* Header */}
      <HeaderSkeleton showButton={false} />

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation */}
        <CardSkeleton showHeader={false} className="lg:col-span-1">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton width={20} height={20} radius={6} />
                <Skeleton width="70%" height={14} radius={7} />
              </div>
            ))}
          </div>
        </CardSkeleton>

        {/* Content */}
        <div className="lg:col-span-2 space-y-4">
          <CardSkeleton>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <Skeleton width={150} height={14} radius={7} />
                    <Skeleton width={200} height={12} radius={6} />
                  </div>
                  <Skeleton width={50} height={28} radius={14} />
                </div>
              ))}
            </div>
          </CardSkeleton>
        </div>
      </div>
    </div>
  )
})

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  DashboardSkeleton,
  ValidationsSkeleton,
  ValidationDetailSkeleton,
  CatalogsSkeleton,
  ReportsSkeleton,
  UsersSkeleton,
  ApprovalsSkeleton,
  SettingsSkeleton,
}
