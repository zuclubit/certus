/**
 * Compliance Dashboard - VisionOS Enterprise Design
 *
 * Main dashboard for the Compliance Portal showing:
 * - Overall compliance score
 * - Framework status
 * - Control overview
 * - Risk summary
 * - Task progress
 * - Recent activity
 * - Upcoming deadlines
 * - Alerts
 *
 * @version 1.0.0
 * @compliance SOC 2 Type II, ISO 27001:2022
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  FileCheck,
  AlertTriangle,
  ClipboardList,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Bell,
  X,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Info,
  FileText,
  Target,
  Activity,
  BarChart3,
  Users,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useComplianceDashboard, useFrameworks, useTaskMetrics, useRiskMetrics } from '@/hooks/useCompliance'
import type { ComplianceFramework, TaskPriority, UpcomingDeadline, ComplianceAlert } from '@/types/compliance.types'

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ScoreRing({ score, size = 140, strokeWidth = 10 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500'
    if (s >= 60) return 'text-amber-500'
    if (s >= 40) return 'text-orange-500'
    return 'text-red-500'
  }

  const getStrokeColor = (s: number) => {
    if (s >= 80) return 'stroke-emerald-500'
    if (s >= 60) return 'stroke-amber-500'
    if (s >= 40) return 'stroke-orange-500'
    return 'stroke-red-500'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-neutral-200 dark:stroke-neutral-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn('transition-all duration-1000 ease-out', getStrokeColor(score))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-3xl font-bold', getScoreColor(score))}>{score}%</span>
        <span className="text-xs text-neutral-500">Cumplimiento</span>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  trend,
  link,
}: {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  iconColor: string
  trend?: 'up' | 'down' | 'neutral'
  link?: string
}) {
  const content = (
    <div className="glass-card p-5 rounded-2xl hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
            'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
        <p className="text-sm text-neutral-500">{title}</p>
      </div>
      {link && (
        <div className="mt-3 flex items-center text-xs text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Ver detalles <ChevronRight className="w-3 h-3 ml-1" />
        </div>
      )}
    </div>
  )

  if (link) {
    return <Link to={link}>{content}</Link>
  }
  return content
}

function FrameworkCard({ framework, score, status, total, implemented }: {
  framework: ComplianceFramework
  score: number
  status: 'on_track' | 'at_risk' | 'behind'
  total: number
  implemented: number
}) {
  const frameworkNames: Record<ComplianceFramework, string> = {
    SOC2: 'SOC 2 Type II',
    ISO27001: 'ISO 27001:2022',
    NIST_CSF: 'NIST CSF 2.0',
    CIS_V8: 'CIS Controls v8',
    CONSAR: 'CONSAR',
    CNBV: 'CNBV',
    GDPR: 'GDPR',
    LFPDPPP: 'LFPDPPP',
    PCI_DSS: 'PCI DSS',
  }

  const statusConfig = {
    on_track: { label: 'En camino', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    at_risk: { label: 'En riesgo', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    behind: { label: 'Atrasado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  }

  return (
    <Link
      to={`/compliance/frameworks/${framework.toLowerCase()}`}
      className="glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">
          {frameworkNames[framework]}
        </h4>
        <span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusConfig[status].color)}>
          {statusConfig[status].label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{score}%</span>
            <span className="text-xs text-neutral-500">{implemented}/{total} controles</span>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                score >= 80 ? 'bg-emerald-500' :
                score >= 60 ? 'bg-amber-500' :
                score >= 40 ? 'bg-orange-500' : 'bg-red-500'
              )}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

function TaskCard({ task }: { task: UpcomingDeadline }) {
  const priorityConfig: Record<TaskPriority, { color: string; icon: React.ElementType }> = {
    critical: { color: 'text-red-500', icon: AlertCircle },
    high: { color: 'text-orange-500', icon: AlertTriangle },
    medium: { color: 'text-amber-500', icon: Clock },
    low: { color: 'text-blue-500', icon: Info },
  }

  const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
    task: { icon: ClipboardList, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    evidence: { icon: FileCheck, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    audit: { icon: Shield, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    risk_review: { icon: AlertTriangle, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    policy_review: { icon: FileText, color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' },
  }

  const config = typeConfig[task.type] || typeConfig.task
  const priority = priorityConfig[task.priority]
  const PriorityIcon = priority.icon
  const TypeIcon = config.icon

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
      <div className={cn('p-2 rounded-lg', config.color)}>
        <TypeIcon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-neutral-500">
            {task.daysUntilDue === 0 ? 'Hoy' :
             task.daysUntilDue === 1 ? 'Manana' :
             task.daysUntilDue < 0 ? `${Math.abs(task.daysUntilDue)} dias atrasado` :
             `${task.daysUntilDue} dias`}
          </span>
          {task.assignedTo && (
            <>
              <span className="text-neutral-300 dark:text-neutral-600">·</span>
              <span className="text-xs text-neutral-500 truncate">{task.assignedTo}</span>
            </>
          )}
        </div>
      </div>
      <PriorityIcon className={cn('w-4 h-4 flex-shrink-0', priority.color)} />
    </div>
  )
}

function ActivityItem({ activity }: { activity: { type: string; action: string; description: string; user: string; timestamp: string } }) {
  const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
    control: { icon: Shield, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    evidence: { icon: FileCheck, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    risk: { icon: AlertTriangle, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    audit: { icon: ClipboardList, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
    task: { icon: CheckCircle2, color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' },
    policy: { icon: FileText, color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
  }

  const config = typeConfig[activity.type] || typeConfig.task
  const Icon = config.icon

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <div className={cn('p-2 rounded-lg flex-shrink-0', config.color)}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{activity.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-neutral-500">{activity.user}</span>
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          <span className="text-xs text-neutral-400">{formatTime(activity.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

function AlertBanner({ alert, onDismiss }: { alert: ComplianceAlert; onDismiss: () => void }) {
  const config = {
    warning: { icon: AlertTriangle, bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-800 dark:text-amber-200' },
    error: { icon: AlertCircle, bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-200' },
    info: { icon: Info, bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200' },
  }

  const { icon: Icon, bg, border, text } = config[alert.type]

  return (
    <div className={cn('rounded-xl p-4 border', bg, border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', text)} />
        <div className="flex-1">
          <h4 className={cn('font-semibold text-sm', text)}>{alert.title}</h4>
          <p className={cn('text-sm mt-1 opacity-80', text)}>{alert.message}</p>
          {alert.link && (
            <Link to={alert.link} className={cn('text-sm font-medium mt-2 inline-flex items-center gap-1', text)}>
              Ver mas <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        {alert.dismissible && (
          <button onClick={onDismiss} className={cn('p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5', text)}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComplianceDashboard() {
  const { data: dashboardData, isLoading: isDashboardLoading } = useComplianceDashboard()
  const { data: frameworksData } = useFrameworks()
  const { data: taskMetricsData } = useTaskMetrics()
  const { data: riskMetricsData } = useRiskMetrics()

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  const dashboard = dashboardData?.data
  const frameworks = frameworksData?.data || []

  if (isDashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Cargando dashboard de cumplimiento...</p>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-neutral-500">No se pudo cargar el dashboard</p>
        </div>
      </div>
    )
  }

  const activeAlerts = dashboard.alerts.filter(a => !dismissedAlerts.includes(a.id))

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Portal de Cumplimiento
          </h1>
          <p className="text-neutral-500 mt-1">
            Gestion integral de cumplimiento regulatorio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/compliance/tasks"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <ClipboardList className="w-4 h-4" />
            Mis Tareas
          </Link>
          <Link
            to="/compliance/reports"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <BarChart3 className="w-4 h-4" />
            Reportes
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          {activeAlerts.map(alert => (
            <AlertBanner
              key={alert.id}
              alert={alert}
              onDismiss={() => setDismissedAlerts(prev => [...prev, alert.id])}
            />
          ))}
        </div>
      )}

      {/* Main Score & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Score Card */}
        <div className="glass-card p-6 rounded-2xl lg:row-span-2">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Score General
          </h3>
          <div className="flex justify-center mb-4">
            <ScoreRing score={dashboard.overallScore} />
          </div>
          <div className="text-center">
            <div className={cn(
              'inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full',
              dashboard.scoreChange > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
              dashboard.scoreChange < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            )}>
              {dashboard.scoreChange > 0 ? <TrendingUp className="w-4 h-4" /> :
               dashboard.scoreChange < 0 ? <TrendingDown className="w-4 h-4" /> :
               <Minus className="w-4 h-4" />}
              {dashboard.scoreChange > 0 ? '+' : ''}{dashboard.scoreChange}% vs mes anterior
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 text-center">
              {dashboard.overallScore === 0 ? (
                'Inicia implementando controles para mejorar tu score'
              ) : dashboard.overallScore < 50 ? (
                'Enfocate en los controles criticos primero'
              ) : dashboard.overallScore < 80 ? (
                'Buen progreso, continua con la implementacion'
              ) : (
                'Excelente! Mantén los controles actualizados'
              )}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <StatCard
          title="Controles Totales"
          value={dashboard.controlsOverview.total}
          icon={Shield}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          link="/compliance/controls"
        />
        <StatCard
          title="Implementados"
          value={dashboard.controlsOverview.implemented}
          change={0}
          trend="neutral"
          icon={CheckCircle2}
          iconColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          link="/compliance/controls?status=implemented"
        />
        <StatCard
          title="En Progreso"
          value={dashboard.controlsOverview.inProgress}
          icon={Activity}
          iconColor="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          link="/compliance/controls?status=in_progress"
        />
        <StatCard
          title="Riesgos Activos"
          value={dashboard.risksOverview.total}
          icon={AlertTriangle}
          iconColor="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          link="/compliance/risks"
        />
        <StatCard
          title="Tareas Pendientes"
          value={dashboard.tasksOverview.pending + dashboard.tasksOverview.inProgress}
          icon={ClipboardList}
          iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          link="/compliance/tasks"
        />
        <StatCard
          title="Evidencias"
          value={dashboard.evidenceOverview.total}
          icon={FileCheck}
          iconColor="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
          link="/compliance/evidence"
        />
      </div>

      {/* Frameworks */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Frameworks de Cumplimiento
          </h3>
          <Link
            to="/compliance/frameworks"
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboard.frameworkScores.slice(0, 4).map(fw => (
            <FrameworkCard
              key={fw.framework}
              framework={fw.framework}
              score={fw.score}
              status={fw.status}
              total={fw.controlsTotal}
              implemented={fw.controlsImplemented}
            />
          ))}
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              Proximos Vencimientos
            </h3>
            <Link
              to="/compliance/tasks"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-2">
            {dashboard.upcomingDeadlines.slice(0, 5).map(deadline => (
              <TaskCard key={deadline.id} task={deadline} />
            ))}
            {dashboard.upcomingDeadlines.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay vencimientos proximos</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Actividad Reciente
            </h3>
          </div>
          <div className="space-y-1">
            {dashboard.recentActivity.slice(0, 5).map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
            {dashboard.recentActivity.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin actividad reciente</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Risk Overview */}
        <div className="space-y-6">
          {/* Risk Summary */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              Resumen de Riesgos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                <span className="text-sm font-medium text-red-700 dark:text-red-400">Criticos</span>
                <span className="text-lg font-bold text-red-700 dark:text-red-400">{dashboard.risksOverview.critical}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Altos</span>
                <span className="text-lg font-bold text-orange-700 dark:text-orange-400">{dashboard.risksOverview.high}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Medios</span>
                <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{dashboard.risksOverview.medium}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Bajos</span>
                <span className="text-lg font-bold text-blue-700 dark:text-blue-400">{dashboard.risksOverview.low}</span>
              </div>
            </div>
            <Link
              to="/compliance/risks"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
            >
              Ver todos los riesgos
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Audits */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-purple-500" />
              Auditorias
            </h3>
            <div className="space-y-3">
              {dashboard.auditsOverview.upcomingAudits.map((audit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{audit.name}</p>
                    <p className="text-xs text-neutral-500">{new Date(audit.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              ))}
              {dashboard.auditsOverview.upcomingAudits.length === 0 && (
                <div className="text-center py-4 text-neutral-500">
                  <p className="text-sm">Sin auditorias programadas</p>
                </div>
              )}
            </div>
            <Link
              to="/compliance/audits"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
            >
              Ver auditorias
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplianceDashboard
