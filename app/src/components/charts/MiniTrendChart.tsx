/**
 * Mini Trend Chart - VisionOS Enterprise 2026
 *
 * Gráfica de tendencia minimalista (sparkline) para mostrar datos históricos
 * en las tarjetas de métricas. SVG puro, sin dependencias externas.
 *
 * Características:
 * - SVG optimizado y ligero
 * - Gradientes sutiles de color
 * - Animación smooth al cargar
 * - Responsive y escalable
 * - Glow effect según variante
 */

import { useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type TrendVariant = 'success' | 'danger' | 'warning' | 'neutral'

export interface MiniTrendChartProps {
  data: number[] // Array de valores numéricos (ej. [20, 24, 22, 28, 30])
  variant?: TrendVariant
  width?: number
  height?: number
  showDots?: boolean
  animated?: boolean
  className?: string
}

// ============================================================================
// VARIANT COLORS
// ============================================================================

const VARIANT_COLORS = {
  success: {
    stroke: '#22C55E',
    fill: 'rgba(34, 197, 94, 0.15)',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  danger: {
    stroke: '#EF4444',
    fill: 'rgba(239, 68, 68, 0.15)',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  warning: {
    stroke: '#FB923C',
    fill: 'rgba(251, 146, 60, 0.15)',
    glow: 'rgba(251, 146, 60, 0.4)',
  },
  neutral: {
    stroke: '#60A5FA',
    fill: 'rgba(96, 165, 250, 0.15)',
    glow: 'rgba(96, 165, 250, 0.4)',
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function normalizeData(data: number[]): number[] {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min

  if (range === 0) return data.map(() => 0.5) // Si todos los valores son iguales

  return data.map((value) => (value - min) / range)
}

function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ''

  const firstPoint = points[0]
  if (!firstPoint) return ''

  if (points.length === 1) return `M ${firstPoint.x} ${firstPoint.y}`

  let path = `M ${firstPoint.x} ${firstPoint.y}`

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]

    if (!current || !next) continue

    // Control points for smooth curve
    const controlX1 = current.x + (next.x - current.x) / 3
    const controlY1 = current.y
    const controlX2 = current.x + (2 * (next.x - current.x)) / 3
    const controlY2 = next.y

    path += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`
  }

  return path
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MiniTrendChart({
  data,
  variant = 'neutral',
  width = 100,
  height = 32,
  showDots = false,
  animated = true,
  className = '',
}: MiniTrendChartProps) {
  const colors = VARIANT_COLORS[variant]

  const { points, linePath, areaPath } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], linePath: '', areaPath: '' }
    }

    const normalized = normalizeData(data)
    const padding = 4
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Create points
    const step = chartWidth / (data.length - 1)
    const calculatedPoints = normalized.map((value, index) => ({
      x: padding + index * step,
      y: padding + chartHeight - value * chartHeight, // Invert Y axis
    }))

    // Create smooth line path
    const line = createSmoothPath(calculatedPoints)

    // Create area path (for gradient fill)
    let area = line
    if (calculatedPoints.length > 0) {
      const lastPoint = calculatedPoints[calculatedPoints.length - 1]
      const firstPoint = calculatedPoints[0]
      if (lastPoint && firstPoint) {
        area += ` L ${lastPoint.x} ${height - padding} L ${firstPoint.x} ${height - padding} Z`
      }
    }

    return {
      points: calculatedPoints,
      linePath: line,
      areaPath: area,
    }
  }, [data, width, height])

  if (data.length === 0) {
    return null
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`mini-trend-chart ${className}`}
      style={{
        overflow: 'visible',
      }}
    >
      <defs>
        {/* Gradient for area fill */}
        <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
          <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`glow-${variant}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Area fill with gradient */}
      <path
        d={areaPath}
        fill={`url(#gradient-${variant})`}
        className={animated ? 'area-animated' : ''}
      />

      {/* Line path with glow */}
      <path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${variant})`}
        className={animated ? 'line-animated' : ''}
      />

      {/* Optional dots at data points */}
      {showDots &&
        points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={2.5}
            fill={colors.stroke}
            stroke="#FFFFFF"
            strokeWidth={1}
            className={animated ? 'dot-animated' : ''}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          />
        ))}

      <style>{`
        /* Line animation */
        @keyframes drawLine {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }

        .line-animated {
          stroke-dasharray: 1000;
          stroke-dashoffset: 0;
          animation: drawLine 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Area fade in */
        @keyframes fadeInArea {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .area-animated {
          opacity: 0;
          animation: fadeInArea 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
        }

        /* Dots pop in */
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          70% {
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .dot-animated {
          opacity: 0;
          transform-origin: center;
          animation: popIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Disable animations for reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .line-animated,
          .area-animated,
          .dot-animated {
            animation: none !important;
            opacity: 1 !important;
            stroke-dashoffset: 0 !important;
            transform: scale(1) !important;
          }
        }
      `}</style>
    </svg>
  )
}

// ============================================================================
// TREND BADGE WITH MINI CHART
// ============================================================================

export interface TrendBadgeProps {
  label: string
  trend: number // Percentage (e.g., 12 means +12%)
  data: number[]
  variant?: TrendVariant
}

export function TrendBadge({ label, trend, data, variant = 'neutral' }: TrendBadgeProps) {
  const isPositive = trend >= 0
  const colors = VARIANT_COLORS[variant]

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: `1px solid rgba(255, 255, 255, 0.08)`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            color: '#AAB4C8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: colors.stroke,
          }}
        >
          {isPositive ? '↗' : '↘'} {Math.abs(trend)}%
        </span>
      </div>
      <MiniTrendChart data={data} variant={variant} width={60} height={24} animated />
    </div>
  )
}
