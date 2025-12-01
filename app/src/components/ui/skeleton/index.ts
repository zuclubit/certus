/**
 * Skeleton System - VisionOS Enterprise 2025
 *
 * Sistema modular de skeleton loaders para estados de carga.
 * Exporta componentes base, compuestos y de página.
 *
 * @example
 * // Base components
 * import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/skeleton'
 *
 * @example
 * // Composite components
 * import { StatCardSkeleton, TableSkeleton, ChartSkeleton } from '@/components/ui/skeleton'
 *
 * @example
 * // Page skeletons
 * import { DashboardSkeleton, ValidationsSkeleton } from '@/components/ui/skeleton'
 */

// ============================================================================
// BASE COMPONENTS
// ============================================================================

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonImage,
  SkeletonButton,
  SkeletonBadge,
  type SkeletonProps,
  type SkeletonTextProps,
  type SkeletonCircleProps,
  type SkeletonImageProps,
  type SkeletonButtonProps,
  type SkeletonAnimation,
  type SkeletonVariant,
} from './skeleton'

// ============================================================================
// COMPOSITE COMPONENTS
// ============================================================================

export {
  StatCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  ChartSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  ActivityFeedSkeleton,
  HeaderSkeleton,
  type StatCardSkeletonProps,
  type TableRowSkeletonProps,
  type TableSkeletonProps,
  type ChartSkeletonProps,
  type CardSkeletonProps,
  type ListItemSkeletonProps,
  type ActivityFeedSkeletonProps,
  type HeaderSkeletonProps,
} from './skeletons.composite'

// ============================================================================
// PAGE SKELETONS
// ============================================================================

export {
  DashboardSkeleton,
  ValidationsSkeleton,
  ValidationDetailSkeleton,
  CatalogsSkeleton,
  ReportsSkeleton,
  UsersSkeleton,
  ApprovalsSkeleton,
  SettingsSkeleton,
  type DashboardSkeletonProps,
  type ValidationsSkeletonProps,
  type ValidationDetailSkeletonProps,
  type CatalogsSkeletonProps,
  type ReportsSkeletonProps,
  type UsersSkeletonProps,
  type ApprovalsSkeletonProps,
  type SettingsSkeletonProps,
} from './skeletons.pages'
