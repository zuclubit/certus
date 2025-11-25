/**
 * Distribution Chart Component - Donut/Pie Chart
 *
 * Visualización de distribución de datos basada en best practices:
 * - Clear data representation
 * - Color-coded segments
 * - Interactive hover states
 * - Accessibility support
 */

import { useMemo } from 'react'
import { useAppStore, selectTheme } from '@/stores/appStore'

export interface DistributionData {
  label: string
  value: number
  color: string
}

export interface DistributionChartProps {
  data: DistributionData[]
  size?: number
  innerRadius?: number
  showPercentages?: boolean
}

export function DistributionChart({
  data,
  size = 200,
  innerRadius = 60,
  showPercentages = true
}: DistributionChartProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const { total, segments } = useMemo(() => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0)

    let currentAngle = -90 // Start at top
    const segs = data.map(item => {
      const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0
      const angle = totalValue > 0 ? (item.value / totalValue) * 360 : 0

      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle += angle

      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
      }
    })

    return { total: totalValue, segments: segs }
  }, [data])

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    ].join(' ')
  }

  const center = size / 2
  const radius = (size / 2) - 10

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
          Sin datos
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} role="img" aria-label="Gráfico de distribución">
        <defs>
          {segments.map((segment, i) => (
            <filter key={i} id={`glow-${i}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 2}
          fill={isDark ? 'rgba(20, 20, 25, 0.6)' : 'rgba(255, 255, 255, 0.9)'}
          stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
          strokeWidth="1"
        />

        {/* Segments */}
        {segments.map((segment, i) => {
          const outerPath = describeArc(center, center, radius, segment.startAngle, segment.endAngle)
          const innerPath = describeArc(center, center, innerRadius, segment.endAngle, segment.startAngle)

          return (
            <g key={i}>
              <path
                d={`${outerPath} L ${polarToCartesian(center, center, innerRadius, segment.startAngle).x} ${polarToCartesian(center, center, innerRadius, segment.startAngle).y} ${innerPath} Z`}
                fill={segment.color}
                stroke={isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'}
                strokeWidth="2"
                filter={`url(#glow-${i})`}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                role="img"
                aria-label={`${segment.label}: ${segment.value} (${segment.percentage.toFixed(1)}%)`}
              />
            </g>
          )
        })}

        {/* Center text */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className={`text-2xl font-bold ${isDark ? 'fill-neutral-100' : 'fill-neutral-900'}`}
        >
          {total}
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          className={`text-xs ${isDark ? 'fill-neutral-400' : 'fill-neutral-600'}`}
        >
          Total
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center justify-between gap-4 min-w-[200px]">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: segment.color,
                  boxShadow: `0 0 8px ${segment.color}`,
                }}
              />
              <span className={`text-xs font-medium ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                {segment.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${isDark ? 'text-neutral-100' : 'text-neutral-900'}`}>
                {segment.value}
              </span>
              {showPercentages && (
                <span className={`text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                  ({segment.percentage.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
