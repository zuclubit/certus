/**
 * Validation Report Charts
 *
 * Recharts components for validation reports
 */

import React from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CONSARColors } from '../types'

// ============================================================================
// Types
// ============================================================================

interface ErrorByTypeData {
  type: string
  count: number
  percentage: number
  severity: 'critical' | 'error' | 'warning'
}

interface ErrorByFieldData {
  field: string
  count: number
  percentage: number
}

interface ValidationOverviewData {
  name: string
  value: number
  color: string
}

// ============================================================================
// Error Distribution by Type Chart
// ============================================================================

interface ErrorsByTypeChartProps {
  data: ErrorByTypeData[]
  width?: number
  height?: number
}

export const ErrorsByTypeChart: React.FC<ErrorsByTypeChartProps> = ({
  data,
  width = 600,
  height = 400,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return CONSARColors.critical
      case 'error':
        return CONSARColors.error
      case 'warning':
        return CONSARColors.warning
      default:
        return CONSARColors.primary
    }
  }

  return (
    <div style={{ width, height, backgroundColor: 'white', padding: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CONSARColors.border} />
          <XAxis
            dataKey="type"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${CONSARColors.border}`,
              borderRadius: '4px',
            }}
          />
          <Legend />
          <Bar
            dataKey="count"
            name="Cantidad de Errores"
            fill={CONSARColors.error}
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================================
// Error Distribution by Field Chart
// ============================================================================

interface ErrorsByFieldChartProps {
  data: ErrorByFieldData[]
  width?: number
  height?: number
  maxFields?: number
}

export const ErrorsByFieldChart: React.FC<ErrorsByFieldChartProps> = ({
  data,
  width = 600,
  height = 400,
  maxFields = 10,
}) => {
  const topFields = data.slice(0, maxFields)

  return (
    <div style={{ width, height, backgroundColor: 'white', padding: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topFields}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CONSARColors.border} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="field"
            tick={{ fontSize: 12 }}
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${CONSARColors.border}`,
              borderRadius: '4px',
            }}
          />
          <Legend />
          <Bar
            dataKey="count"
            name="Cantidad de Errores"
            fill={CONSARColors.error}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================================
// Validation Overview Pie Chart
// ============================================================================

interface ValidationOverviewChartProps {
  validRecords: number
  invalidRecords: number
  width?: number
  height?: number
}

export const ValidationOverviewChart: React.FC<ValidationOverviewChartProps> = ({
  validRecords,
  invalidRecords,
  width = 600,
  height = 400,
}) => {
  const data: ValidationOverviewData[] = [
    {
      name: 'Registros Válidos',
      value: validRecords,
      color: CONSARColors.success,
    },
    {
      name: 'Registros Inválidos',
      value: invalidRecords,
      color: CONSARColors.error,
    },
  ]

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  return (
    <div style={{ width, height, backgroundColor: 'white', padding: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${CONSARColors.border}`,
              borderRadius: '4px',
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================================
// Error Severity Distribution Chart
// ============================================================================

interface ErrorSeverityData {
  severity: string
  count: number
  percentage: number
}

interface ErrorSeverityChartProps {
  data: ErrorSeverityData[]
  width?: number
  height?: number
}

export const ErrorSeverityChart: React.FC<ErrorSeverityChartProps> = ({
  data,
  width = 600,
  height = 400,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return CONSARColors.critical
      case 'error':
        return CONSARColors.error
      case 'warning':
        return CONSARColors.warning
      default:
        return CONSARColors.primary
    }
  }

  const chartData = data.map(item => ({
    ...item,
    color: getSeverityColor(item.severity),
  }))

  return (
    <div style={{ width, height, backgroundColor: 'white', padding: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${CONSARColors.border}`,
              borderRadius: '4px',
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
