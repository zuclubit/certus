/**
 * Dashboard Enterprise - CONSAR Regulatory Compliance 2025
 *
 * Dashboard conectado al backend real mediante DashboardController
 * Endpoints utilizados:
 * - GET /v1/dashboard/statistics - Estadísticas generales
 * - GET /v1/dashboard/recent-validations - Validaciones recientes
 * - GET /v1/dashboard/alerts - Alertas de cumplimiento
 * - GET /v1/dashboard/trends - Datos de tendencia
 *
 * Sin datos hardcodeados - Todo proviene del API
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  FileText,
  Activity,
  Calendar,
  Shield,
  Database,
  Settings as SettingsIcon,
  Bell,
  Target,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'
import { PremiumButtonV2 } from '@/components/ui'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { TrendChart, type TrendDataPoint } from '@/components/charts/TrendChart'
import { DistributionChart, type DistributionData } from '@/components/charts/DistributionChart'
import {
  useDashboard,
  useDashboardStatistics,
  useDashboardAlerts,
} from '@/hooks/useDashboard'
import type { DashboardAlert as DashboardAlertType } from '@/lib/services/api/dashboard.service'

// ============================================================================
// TYPES
// ============================================================================

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan' | 'indigo'
  trend?: {
    value: string
    isPositive: boolean
  }
  loading?: boolean
  onClick?: () => void
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ElementType
  path: string
  color: string
}

// ============================================================================
// STAT CARD COMPONENT - Premium Glass Design
// ============================================================================

function StatCard({ label, value, icon: Icon, color, trend, loading, onClick }: StatCardProps) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const colorConfig = {
    blue: {
      icon: isDark ? 'text-blue-400' : 'text-blue-600',
      bg: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
      glow: 'rgba(59, 130, 246, 0.4)',
    },
    green: {
      icon: isDark ? 'text-green-400' : 'text-green-600',
      bg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
      glow: 'rgba(34, 197, 94, 0.4)',
    },
    yellow: {
      icon: isDark ? 'text-yellow-400' : 'text-yellow-600',
      bg: isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
      glow: 'rgba(251, 146, 60, 0.4)',
    },
    red: {
      icon: isDark ? 'text-red-400' : 'text-red-600',
      bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    purple: {
      icon: isDark ? 'text-purple-400' : 'text-purple-600',
      bg: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
      glow: 'rgba(168, 85, 247, 0.4)',
    },
    cyan: {
      icon: isDark ? 'text-cyan-400' : 'text-cyan-600',
      bg: isDark ? 'rgba(34, 211, 238, 0.15)' : 'rgba(34, 211, 238, 0.1)',
      glow: 'rgba(34, 211, 238, 0.4)',
    },
    indigo: {
      icon: isDark ? 'text-indigo-400' : 'text-indigo-600',
      bg: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
      glow: 'rgba(99, 102, 241, 0.4)',
    },
  }

  const config = colorConfig[color]

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-ultra-premium depth-layer-3 fresnel-edge',
        'p-5 rounded-[20px] transition-all duration-300',
        onClick && 'hover:scale-[1.02] hover:shadow-lg cursor-pointer'
      )}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, rgba(20,20,25,0.6) 0%, rgba(15,15,20,0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(255,255,255,0.4)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium mb-2',
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'text-3xl font-bold mb-1',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}
          >
            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : value}
          </p>
          {trend && !loading && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-semibold',
                  trend.isPositive
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-red-400' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '↗' : '↘'} {trend.value}
              </span>
              <span className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-400')}>
                vs periodo anterior
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-[16px]',
            'glass-ultra-clear depth-layer-2 fresnel-edge'
          )}
          style={{
            background: config.bg,
            backdropFilter: 'blur(12px)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: `0 0 20px ${config.glow}`,
          }}
        >
          <Icon className={cn('h-7 w-7', config.icon)} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ALERT CARD COMPONENT - Connected to Backend
// ============================================================================

function AlertCard({ alert, onClick }: { alert: DashboardAlertType; onClick?: () => void }) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const severityConfig = {
    info: {
      bg: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      border: 'rgba(59, 130, 246, 0.3)',
      icon: 'text-blue-500',
    },
    warning: {
      bg: isDark ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.05)',
      border: 'rgba(251, 146, 60, 0.3)',
      icon: 'text-orange-500',
    },
    error: {
      bg: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
      border: 'rgba(239, 68, 68, 0.3)',
      icon: 'text-red-500',
    },
    success: {
      bg: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
      border: 'rgba(34, 197, 94, 0.3)',
      icon: 'text-green-500',
    },
  }

  const config = severityConfig[alert.type] || severityConfig.info

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
  }

  return (
    <div
      className="p-4 rounded-[16px] transition-all duration-300 border cursor-pointer hover:scale-[1.01]"
      style={{
        background: config.bg,
        borderColor: config.border,
      }}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Bell className={cn('h-5 w-5 flex-shrink-0', config.icon)} />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold mb-1', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
            {alert.title}
          </p>
          <p className={cn('text-xs mb-2', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
            {alert.message}
          </p>
          <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
            {formatTimestamp(alert.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// QUICK ACTION CARD
// ============================================================================

function QuickActionCard({ action, onClick }: { action: QuickAction; onClick: () => void }) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const Icon = action.icon

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 rounded-[16px] border transition-all duration-300 cursor-pointer',
        'hover:scale-[1.02] hover:shadow-lg',
        isDark ? 'border-neutral-700 bg-neutral-800/30' : 'border-neutral-200 bg-white/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-3 rounded-[12px]"
          style={{
            background: action.color,
            boxShadow: `0 0 16px ${action.color}`,
          }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold mb-0.5', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
            {action.title}
          </p>
          <p className={cn('text-xs', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
            {action.description}
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ERROR STATE COMPONENT
// ============================================================================

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-[24px] border',
        isDark ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-200'
      )}
    >
      <AlertCircle className={cn('h-12 w-12 mb-4', isDark ? 'text-red-400' : 'text-red-500')} />
      <p className={cn('text-sm mb-4 text-center', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
        {message}
      </p>
      <button
        onClick={onRetry}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
          isDark
            ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300'
            : 'bg-red-100 hover:bg-red-200 text-red-700'
        )}
      >
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  )
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export function DashboardEnterprise() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const dashboardAnimationData = getAnimation('home')

  // Fetch all dashboard data from backend
  const {
    statistics,
    alerts,
    isLoading,
    isError,
    refetchAll,
  } = useDashboard()

  // Computed metrics from real backend data
  const metrics = useMemo(() => {
    if (!statistics) {
      return {
        successRate: '0.0',
        complianceScore: '0',
        avgProcessingTime: '0',
        retransmissionRequired: 0,
        todayValidations: 0,
        slaComplianceRate: '0',
        criticalErrors: 0,
      }
    }

    // Success rate from backend
    const successRate = statistics.successRate.toFixed(1)

    // Compliance score based on approved validations
    const complianceScore = statistics.totalValidations > 0
      ? Math.min(100, (statistics.approvedValidations / statistics.totalValidations) * 100).toFixed(0)
      : '0'

    // Processing time in minutes (backend returns ms)
    const avgProcessingTime = (statistics.averageProcessingTimeMs / 60000).toFixed(1)

    // Files requiring retransmission
    const retransmissionRequired = statistics.failedValidations + statistics.rejectedValidations

    // SLA compliance (based on completion rate)
    const completedAndApproved = statistics.completedValidations + statistics.approvedValidations
    const slaComplianceRate = statistics.totalValidations > 0
      ? ((completedAndApproved / statistics.totalValidations) * 100).toFixed(1)
      : '0'

    // Critical errors count
    const criticalErrors = statistics.failedValidations

    return {
      successRate,
      complianceScore,
      avgProcessingTime,
      retransmissionRequired,
      todayValidations: statistics.pendingValidations + statistics.processingValidations,
      slaComplianceRate,
      criticalErrors,
    }
  }, [statistics])

  // Calculate trend from backend trendData
  const calculateTrend = useMemo(() => {
    if (!statistics?.trendData || statistics.trendData.length < 2) {
      return null
    }

    const recent = statistics.trendData.slice(-7)
    const previous = statistics.trendData.slice(-14, -7)

    if (previous.length === 0) return null

    const recentTotal = recent.reduce((sum, d) => sum + d.total, 0)
    const previousTotal = previous.reduce((sum, d) => sum + d.total, 0)

    if (previousTotal === 0) return null

    const change = ((recentTotal - previousTotal) / previousTotal) * 100
    return {
      value: `${Math.abs(change).toFixed(1)}%`,
      isPositive: change >= 0,
    }
  }, [statistics?.trendData])

  // Transform trend data for chart
  const trendData: TrendDataPoint[] = useMemo(() => {
    if (!statistics?.trendData) return []

    return statistics.trendData.slice(-7).map(d => ({
      date: new Date(d.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
      exitosas: d.approved,
      errores: d.withErrors,
      advertencias: Math.max(0, d.total - d.approved - d.withErrors),
    }))
  }, [statistics?.trendData])

  // Distribution data by file type from backend
  const fileTypeDistribution: DistributionData[] = useMemo(() => {
    if (!statistics?.byFileType) return []

    const colors: Record<string, string> = {
      NOMINA: '#3B82F6',
      Nomina: '#3B82F6',
      CONTABLE: '#10B981',
      Contable: '#10B981',
      REGULARIZACION: '#F59E0B',
      Regularizacion: '#F59E0B',
    }

    return Object.entries(statistics.byFileType).map(([label, stats]) => ({
      label,
      value: stats.total,
      color: colors[label] || '#8B5CF6',
    }))
  }, [statistics?.byFileType])

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Subir Archivo',
      description: 'Validar nuevo archivo CONSAR',
      icon: Upload,
      path: '/validations',
      color: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    },
    {
      id: '2',
      title: 'Generar Reporte',
      description: 'Crear reporte de cumplimiento',
      icon: FileText,
      path: '/reports',
      color: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    },
    {
      id: '3',
      title: 'Catálogos',
      description: 'Gestionar catálogos CONSAR',
      icon: Database,
      path: '/catalogs',
      color: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    },
    {
      id: '4',
      title: 'Configuración',
      description: 'Ajustes y preferencias',
      icon: SettingsIcon,
      path: '/settings',
      color: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    },
  ]

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />
  }

  // Show error state if API failed
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
            Dashboard Enterprise
          </h1>
        </div>
        <ErrorState
          message="No se pudieron cargar los datos del dashboard. Verifica tu conexión e intenta nuevamente."
          onRetry={refetchAll}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {dashboardAnimationData && (
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-[20px]',
                'glass-ultra-premium depth-layer-4 fresnel-edge',
                'glass-gpu-accelerated spring-bounce'
              )}
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    #0066FF 0%,
                    #5856D6 35%,
                    #7C3AED 65%,
                    #AF52DE 100%
                  )
                `,
                backgroundSize: '300% 300%',
                animation: 'mesh-flow 8s ease-in-out infinite',
                border: '1.5px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `
                  0 0 40px rgba(88, 86, 214, 0.4),
                  0 8px 32px rgba(0, 102, 255, 0.3),
                  0 4px 16px rgba(124, 58, 237, 0.25),
                  inset 0 0 40px rgba(255, 255, 255, 0.2),
                  inset 0 2px 0 rgba(255, 255, 255, 0.5)
                `,
              }}
            >
              <div className="w-8 h-8">
                <LottieIcon
                  animationData={dashboardAnimationData}
                  isActive={true}
                  loop={false}
                  autoplay={true}
                  speed={1.0}
                  className="transition-all duration-300"
                />
              </div>
            </div>
          )}
          <div>
            <h1
              className={cn(
                'ios-heading-title1 ios-text-glass-subtle lg:ios-heading-large',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
              data-text="Dashboard Enterprise"
            >
              Dashboard Enterprise
            </h1>
            <p
              className={cn(
                'mt-1 ios-text-footnote ios-font-medium lg:ios-text-callout',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Sistema de Analítica y Cumplimiento Normativo CONSAR
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetchAll}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isDark
                ? 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                : 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700'
            )}
            title="Actualizar datos"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <PremiumButtonV2
            label="Subir Archivo"
            icon={Upload}
            size="lg"
            onClick={() => navigate('/validations')}
          />
        </div>
      </div>

      {/* KPI Stats Grid - 3x4 Grid (12 KPIs) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          label="Total Validaciones"
          value={statistics?.totalValidations || 0}
          icon={FileCheck}
          color="blue"
          trend={calculateTrend || undefined}
          loading={isLoading}
          onClick={() => navigate('/validations')}
        />
        <StatCard
          label="Tasa de Éxito"
          value={`${metrics.successRate}%`}
          icon={TrendingUp}
          color="green"
          loading={isLoading}
        />
        <StatCard
          label="Compliance Score"
          value={`${metrics.complianceScore}/100`}
          icon={Shield}
          color="purple"
          loading={isLoading}
        />
        <StatCard
          label="Tiempo Promedio"
          value={`${metrics.avgProcessingTime}m`}
          icon={Clock}
          color="yellow"
          loading={isLoading}
        />

        <StatCard
          label="En Proceso"
          value={statistics?.processingValidations || 0}
          icon={Calendar}
          color="cyan"
          loading={isLoading}
        />
        <StatCard
          label="SLA Compliance"
          value={`${metrics.slaComplianceRate}%`}
          icon={Target}
          color="green"
          loading={isLoading}
        />
        <StatCard
          label="Procesando"
          value={statistics?.processingValidations || 0}
          icon={Activity}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          label="Errores Críticos"
          value={metrics.criticalErrors}
          icon={XCircle}
          color="red"
          loading={isLoading}
        />

        <StatCard
          label="Retransmisiones"
          value={metrics.retransmissionRequired}
          icon={AlertTriangle}
          color="yellow"
          loading={isLoading}
          onClick={() => navigate('/validations?status=Failed,Rejected')}
        />
        <StatCard
          label="Pendientes"
          value={statistics?.pendingValidations || 0}
          icon={Clock}
          color="indigo"
          loading={isLoading}
        />
        <StatCard
          label="Rechazadas"
          value={statistics?.rejectedValidations || 0}
          icon={XCircle}
          color="red"
          loading={isLoading}
        />
        <StatCard
          label="Aprobadas"
          value={statistics?.approvedValidations || 0}
          icon={CheckCircle}
          color="green"
          loading={isLoading}
        />
      </div>

      {/* Charts Section - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div
          className={cn(
            'glass-ultra-premium depth-layer-3 fresnel-edge',
            'p-6 rounded-[24px]'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.6) 0%, rgba(15,15,20,0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            backdropFilter: 'blur(24px)',
            border: isDark
              ? '1.5px solid rgba(255,255,255,0.1)'
              : '1.5px solid rgba(255,255,255,0.4)',
          }}
        >
          <h3 className={cn('text-lg font-bold mb-4', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
            Tendencia Semanal
          </h3>
          <p className={cn('text-sm mb-6', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
            Validaciones de los últimos 7 días
          </p>
          <TrendChart data={trendData} height={220} />
        </div>

        {/* Distribution Chart */}
        <div
          className={cn(
            'glass-ultra-premium depth-layer-3 fresnel-edge',
            'p-6 rounded-[24px]'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.6) 0%, rgba(15,15,20,0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            backdropFilter: 'blur(24px)',
            border: isDark
              ? '1.5px solid rgba(255,255,255,0.1)'
              : '1.5px solid rgba(255,255,255,0.4)',
          }}
        >
          <h3 className={cn('text-lg font-bold mb-4', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
            Distribución por Tipo
          </h3>
          <p className={cn('text-sm mb-6', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
            Archivos procesados por categoría
          </p>
          <div className="flex justify-center">
            <DistributionChart data={fileTypeDistribution} size={240} innerRadius={70} />
          </div>
        </div>
      </div>

      {/* Alerts & Quick Actions - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Alerts - From Backend */}
        <div
          className={cn(
            'glass-ultra-premium depth-layer-3 fresnel-edge',
            'p-6 rounded-[24px]'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.6) 0%, rgba(15,15,20,0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            backdropFilter: 'blur(24px)',
            border: isDark
              ? '1.5px solid rgba(255,255,255,0.1)'
              : '1.5px solid rgba(255,255,255,0.4)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={cn('text-lg font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                Alertas de Cumplimiento
              </h3>
              <p className={cn('text-sm mt-1', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                Notificaciones CONSAR y regulatorias
              </p>
            </div>
            <Bell className={cn('h-5 w-5', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
          </div>

          <div className="space-y-3">
            {!alerts || alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className={cn('h-12 w-12 mx-auto mb-3', isDark ? 'text-green-500' : 'text-green-600')} />
                <p className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                  Todo en orden. Sin alertas de cumplimiento.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClick={() => alert.actionUrl && navigate(alert.actionUrl)}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className={cn(
            'glass-ultra-premium depth-layer-3 fresnel-edge',
            'p-6 rounded-[24px]'
          )}
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(20,20,25,0.6) 0%, rgba(15,15,20,0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,250,255,0.95) 100%)',
            backdropFilter: 'blur(24px)',
            border: isDark
              ? '1.5px solid rgba(255,255,255,0.1)'
              : '1.5px solid rgba(255,255,255,0.4)',
          }}
        >
          <div className="mb-6">
            <h3 className={cn('text-lg font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
              Acciones Rápidas
            </h3>
            <p className={cn('text-sm mt-1', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
              Acceso directo a módulos principales
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.id}
                action={action}
                onClick={() => navigate(action.path)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes mesh-flow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  )
}

export default DashboardEnterprise
