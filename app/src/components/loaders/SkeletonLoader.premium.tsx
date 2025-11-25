/**
 * Skeleton Loader Premium - VisionOS Enterprise 2026
 *
 * Skeleton loaders con estilo glass premium para estados de carga.
 * Shimmer effect suave y elegante compatible con VisionOS.
 *
 * Características:
 * - Glass morphism con blur
 * - Shimmer gradient animado
 * - Colores atmosféricos coherentes
 * - Tamaños y formas variadas
 */

import { CSSProperties } from 'react'

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const SKELETON_COLORS = {
  base: 'rgba(255, 255, 255, 0.05)',
  shimmerFrom: 'rgba(255, 255, 255, 0.02)',
  shimmerVia: 'rgba(255, 255, 255, 0.08)',
  shimmerTo: 'rgba(255, 255, 255, 0.02)',
  border: 'rgba(255, 255, 255, 0.08)',
}

// ============================================================================
// METRIC CARD SKELETON
// ============================================================================

export function MetricCardSkeleton() {
  return (
    <div
      className="skeleton-metric-card"
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(165deg, #070B14 0%, #0C111C 100%)',
          opacity: 0.4,
        }}
      />

      {/* Glass card */}
      <div
        style={{
          position: 'relative',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${SKELETON_COLORS.border}`,
          borderRadius: '24px',
          padding: 'clamp(20px, 2.5vw, 28px)',
          background: SKELETON_COLORS.base,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
          {/* Left side */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Label skeleton */}
            <div
              className="skeleton-shimmer"
              style={{
                width: '60%',
                height: '12px',
                borderRadius: '6px',
                background: SKELETON_COLORS.base,
              }}
            />

            {/* Value skeleton */}
            <div
              className="skeleton-shimmer"
              style={{
                width: '80%',
                height: '36px',
                borderRadius: '8px',
                background: SKELETON_COLORS.base,
              }}
            />

            {/* Trend skeleton */}
            <div
              className="skeleton-shimmer"
              style={{
                width: '40%',
                height: '10px',
                borderRadius: '5px',
                background: SKELETON_COLORS.base,
              }}
            />
          </div>

          {/* Icon skeleton */}
          <div
            className="skeleton-shimmer"
            style={{
              width: 'clamp(52px, 6vw, 64px)',
              height: 'clamp(52px, 6vw, 64px)',
              borderRadius: '16px',
              background: SKELETON_COLORS.base,
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .skeleton-shimmer {
          background-image: linear-gradient(
            90deg,
            ${SKELETON_COLORS.shimmerFrom} 0%,
            ${SKELETON_COLORS.shimmerVia} 50%,
            ${SKELETON_COLORS.shimmerTo} 100%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// ACTIVITY ROW SKELETON
// ============================================================================

export function ActivityRowSkeleton() {
  return (
    <div
      style={{
        padding: '16px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}
    >
      {/* Left side */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* File name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="skeleton-shimmer"
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '4px',
              background: SKELETON_COLORS.base,
              flexShrink: 0,
            }}
          />
          <div
            className="skeleton-shimmer"
            style={{
              width: '60%',
              height: '14px',
              borderRadius: '7px',
              background: SKELETON_COLORS.base,
            }}
          />
        </div>

        {/* Timestamp */}
        <div
          className="skeleton-shimmer"
          style={{
            width: '40%',
            height: '12px',
            borderRadius: '6px',
            background: SKELETON_COLORS.base,
            marginLeft: '28px',
          }}
        />
      </div>

      {/* Status chip */}
      <div
        className="skeleton-shimmer"
        style={{
          width: '80px',
          height: '28px',
          borderRadius: '12px',
          background: SKELETON_COLORS.base,
          flexShrink: 0,
        }}
      />
    </div>
  )
}

// ============================================================================
// RECENT ACTIVITY PANEL SKELETON
// ============================================================================

export function RecentActivitySkeleton() {
  return (
    <div
      style={{
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(165deg, #070B14 0%, #0C111C 100%)',
          opacity: 0.6,
        }}
      />

      {/* Glass panel */}
      <div
        style={{
          position: 'relative',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div
            className="skeleton-shimmer"
            style={{
              width: '180px',
              height: '20px',
              borderRadius: '10px',
              background: SKELETON_COLORS.base,
              marginBottom: '8px',
            }}
          />
          <div
            className="skeleton-shimmer"
            style={{
              width: '240px',
              height: '14px',
              borderRadius: '7px',
              background: SKELETON_COLORS.base,
            }}
          />
        </div>

        {/* Activity rows */}
        <ActivityRowSkeleton />
        <ActivityRowSkeleton />
        <ActivityRowSkeleton />
      </div>
    </div>
  )
}

// ============================================================================
// DASHBOARD SKELETON - Full page
// ============================================================================

export function DashboardSkeleton() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #070B14 0%, #0C111C 100%)',
        padding: '32px clamp(16px, 4vw, 32px)',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header skeleton */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            className="skeleton-shimmer"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '16px',
              background: SKELETON_COLORS.base,
            }}
          />
          <div>
            <div
              className="skeleton-shimmer"
              style={{
                width: '120px',
                height: '20px',
                borderRadius: '10px',
                background: SKELETON_COLORS.base,
                marginBottom: '8px',
              }}
            />
            <div
              className="skeleton-shimmer"
              style={{
                width: '280px',
                height: '14px',
                borderRadius: '7px',
                background: SKELETON_COLORS.base,
              }}
            />
          </div>
        </div>

        {/* Metrics grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>

        {/* Activity panel */}
        <RecentActivitySkeleton />
      </div>
    </div>
  )
}

// ============================================================================
// GENERIC SKELETON BOX
// ============================================================================

export interface SkeletonBoxProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: CSSProperties
}

export function SkeletonBox({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = '',
  style = {},
}: SkeletonBoxProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius,
        background: SKELETON_COLORS.base,
        ...style,
      }}
    />
  )
}
