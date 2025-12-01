/**
 * Composite Skeletons - VisionOS Enterprise 2025
 *
 * Skeletons compuestos para componentes comunes de la aplicación.
 * Incluye: StatCards, TableRows, Charts, Cards, etc.
 *
 * Diseñados para coincidir con los componentes reales de la UI.
 */

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton, SkeletonText, SkeletonCircle } from './skeleton'

// ============================================================================
// STAT CARD SKELETON - Matches Dashboard stat cards
// ============================================================================

export interface StatCardSkeletonProps {
  /** Show trend indicator */
  showTrend?: boolean
  /** Additional className */
  className?: string
}

export const StatCardSkeleton = memo(function StatCardSkeleton({
  showTrend = true,
  className,
}: StatCardSkeletonProps) {
  return (
    <div
      className={cn(
        'relative rounded-[20px] p-5 overflow-hidden',
        'skeleton-glass-card',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Label, Value, Trend */}
        <div className="flex-1 space-y-3">
          {/* Label */}
          <Skeleton width="60%" height={14} radius={7} />
          {/* Value */}
          <Skeleton width="80%" height={32} radius={8} />
          {/* Trend */}
          {showTrend && (
            <div className="flex items-center gap-2">
              <Skeleton width={16} height={16} radius={4} />
              <Skeleton width="40%" height={12} radius={6} />
            </div>
          )}
        </div>

        {/* Right: Icon */}
        <Skeleton
          width={52}
          height={52}
          radius={16}
          className="flex-shrink-0"
        />
      </div>
    </div>
  )
})

// ============================================================================
// TABLE ROW SKELETON - Matches ValidationTable rows
// ============================================================================

export interface TableRowSkeletonProps {
  /** Number of columns */
  columns?: number
  /** Show checkbox column */
  showCheckbox?: boolean
  /** Show actions column */
  showActions?: boolean
  /** Additional className */
  className?: string
}

export const TableRowSkeleton = memo(function TableRowSkeleton({
  columns = 5,
  showCheckbox = false,
  showActions = true,
  className,
}: TableRowSkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3',
        'border-b border-white/5',
        className
      )}
    >
      {/* Checkbox */}
      {showCheckbox && (
        <Skeleton width={20} height={20} radius={4} className="flex-shrink-0" />
      )}

      {/* Icon/Avatar */}
      <SkeletonCircle size={36} />

      {/* Columns */}
      <div className="flex-1 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns - 1}, 1fr)` }}>
        {/* File name */}
        <div className="space-y-1">
          <Skeleton width="80%" height={14} radius={7} />
          <Skeleton width="50%" height={10} radius={5} />
        </div>

        {/* Other columns */}
        {Array.from({ length: columns - 2 }).map((_, i) => (
          <Skeleton key={i} width="70%" height={14} radius={7} />
        ))}
      </div>

      {/* Status badge */}
      <Skeleton width={80} height={26} radius={13} className="flex-shrink-0" />

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 flex-shrink-0">
          <Skeleton width={32} height={32} radius={8} />
          <Skeleton width={32} height={32} radius={8} />
        </div>
      )}
    </div>
  )
})

// ============================================================================
// TABLE SKELETON - Full table with header and rows
// ============================================================================

export interface TableSkeletonProps {
  /** Number of rows to show */
  rows?: number
  /** Number of columns */
  columns?: number
  /** Show header */
  showHeader?: boolean
  /** Additional className */
  className?: string
}

export const TableSkeleton = memo(function TableSkeleton({
  rows = 5,
  columns = 5,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('skeleton-glass-card rounded-[20px] overflow-hidden', className)}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={i}
              width={i === 0 ? '25%' : '15%'}
              height={12}
              radius={6}
              className={i === 0 ? 'flex-shrink-0' : ''}
            />
          ))}
        </div>
      )}

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </div>
  )
})

// ============================================================================
// CHART SKELETON - Matches TrendChart/DistributionChart
// ============================================================================

export interface ChartSkeletonProps {
  /** Chart type */
  type?: 'line' | 'bar' | 'pie' | 'area'
  /** Chart height */
  height?: number
  /** Show legend */
  showLegend?: boolean
  /** Additional className */
  className?: string
}

export const ChartSkeleton = memo(function ChartSkeleton({
  type = 'line',
  height = 200,
  showLegend = true,
  className,
}: ChartSkeletonProps) {
  return (
    <div className={cn('skeleton-glass-card rounded-[20px] p-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton width={150} height={16} radius={8} />
          <Skeleton width={100} height={12} radius={6} />
        </div>
        {showLegend && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Skeleton width={12} height={12} circle />
              <Skeleton width={50} height={10} radius={5} />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width={12} height={12} circle />
              <Skeleton width={50} height={10} radius={5} />
            </div>
          </div>
        )}
      </div>

      {/* Chart area */}
      {type === 'pie' ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <SkeletonCircle size={Math.min(height - 40, 160)} />
        </div>
      ) : (
        <div className="relative" style={{ height }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width={30} height={10} radius={5} />
            ))}
          </div>

          {/* Chart bars/lines placeholder */}
          <div className="ml-10 h-full flex items-end gap-2">
            {type === 'bar' ? (
              // Bar chart
              Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height={`${30 + Math.random() * 60}%`}
                  radius={4}
                  className="flex-1"
                />
              ))
            ) : (
              // Line/Area chart - wave pattern
              <div className="w-full h-full relative">
                <Skeleton width="100%" height="100%" radius={8} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* X-axis labels */}
      {type !== 'pie' && (
        <div className="flex justify-between ml-10 mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} width={40} height={10} radius={5} />
          ))}
        </div>
      )}
    </div>
  )
})

// ============================================================================
// CARD SKELETON - Generic glass card
// ============================================================================

export interface CardSkeletonProps {
  /** Show header with title and description */
  showHeader?: boolean
  /** Card height */
  height?: number | string
  /** Additional className */
  className?: string
  /** Children - custom skeleton content */
  children?: React.ReactNode
}

export const CardSkeleton = memo(function CardSkeleton({
  showHeader = true,
  height = 'auto',
  className,
  children,
}: CardSkeletonProps) {
  return (
    <div
      className={cn('skeleton-glass-card rounded-[20px] p-5', className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {showHeader && (
        <div className="mb-4">
          <Skeleton width="40%" height={18} radius={9} className="mb-2" />
          <Skeleton width="60%" height={14} radius={7} />
        </div>
      )}
      {children}
    </div>
  )
})

// ============================================================================
// LIST ITEM SKELETON - For lists and activity feeds
// ============================================================================

export interface ListItemSkeletonProps {
  /** Show avatar/icon */
  showAvatar?: boolean
  /** Show timestamp */
  showTimestamp?: boolean
  /** Show secondary text */
  showSecondary?: boolean
  /** Additional className */
  className?: string
}

export const ListItemSkeleton = memo(function ListItemSkeleton({
  showAvatar = true,
  showTimestamp = true,
  showSecondary = true,
  className,
}: ListItemSkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3',
        'border-b border-white/5 last:border-0',
        className
      )}
    >
      {showAvatar && <SkeletonCircle size={40} />}

      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton width="70%" height={14} radius={7} />
        {showSecondary && <Skeleton width="50%" height={12} radius={6} />}
      </div>

      {showTimestamp && (
        <Skeleton width={60} height={12} radius={6} className="flex-shrink-0" />
      )}
    </div>
  )
})

// ============================================================================
// ACTIVITY FEED SKELETON
// ============================================================================

export interface ActivityFeedSkeletonProps {
  /** Number of items */
  items?: number
  /** Additional className */
  className?: string
}

export const ActivityFeedSkeleton = memo(function ActivityFeedSkeleton({
  items = 5,
  className,
}: ActivityFeedSkeletonProps) {
  return (
    <div className={cn('skeleton-glass-card rounded-[20px] p-5', className)}>
      {/* Header */}
      <div className="mb-4">
        <Skeleton width={180} height={18} radius={9} className="mb-2" />
        <Skeleton width={240} height={14} radius={7} />
      </div>

      {/* Items */}
      <div className="divide-y divide-white/5">
        {Array.from({ length: items }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
})

// ============================================================================
// HEADER SKELETON - Page header with icon
// ============================================================================

export interface HeaderSkeletonProps {
  /** Show icon */
  showIcon?: boolean
  /** Show button */
  showButton?: boolean
  /** Additional className */
  className?: string
}

export const HeaderSkeleton = memo(function HeaderSkeleton({
  showIcon = true,
  showButton = true,
  className,
}: HeaderSkeletonProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex items-center gap-4">
        {showIcon && (
          <Skeleton width={64} height={64} radius={20} />
        )}
        <div className="space-y-2">
          <Skeleton width={200} height={28} radius={8} />
          <Skeleton width={280} height={16} radius={6} />
        </div>
      </div>

      {showButton && (
        <Skeleton width={140} height={44} radius={12} />
      )}
    </div>
  )
})

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  StatCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  ChartSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  ActivityFeedSkeleton,
  HeaderSkeleton,
}
