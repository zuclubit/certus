/**
 * Compliance Risks Page - VisionOS Enterprise Design
 *
 * Risk management with:
 * - Risk register with filtering
 * - Risk matrix visualization
 * - Risk treatment workflow
 * - Mitigation tracking
 *
 * @version 1.0.0
 * @compliance SOC 2 Type II, ISO 27001:2022
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Shield,
  Target,
  User,
  Calendar,
  Building,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Eye,
  Edit2,
  Plus,
  Loader2,
  Info,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Grid,
  List,
  BarChart3,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRisks } from '@/hooks/useCompliance'
import type { Risk, RiskSeverity, RiskStatus, RiskCategory } from '@/types/compliance.types'

// ============================================================================
// CONSTANTS
// ============================================================================

const severityConfig: Record<RiskSeverity, { color: string; bg: string; label: string; level: number }> = {
  critical: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Crítico', level: 5 },
  high: { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Alto', level: 4 },
  medium: { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Medio', level: 3 },
  low: { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Bajo', level: 2 },
  info: { color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800', label: 'Info', level: 1 },
}

const statusConfig: Record<RiskStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  identified: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Identificado' },
  assessed: { icon: Target, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Evaluado' },
  mitigating: { icon: Activity, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Mitigando' },
  mitigated: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Mitigado' },
  accepted: { icon: Shield, color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800', label: 'Aceptado' },
  closed: { icon: XCircle, color: 'text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800', label: 'Cerrado' },
}

const categoryConfig: Record<RiskCategory, { icon: React.ElementType; color: string; label: string }> = {
  security: { icon: Shield, color: 'text-red-500', label: 'Seguridad' },
  operational: { icon: Activity, color: 'text-blue-500', label: 'Operacional' },
  compliance: { icon: FileText, color: 'text-purple-500', label: 'Cumplimiento' },
  financial: { icon: BarChart3, color: 'text-emerald-500', label: 'Financiero' },
  reputational: { icon: Target, color: 'text-amber-500', label: 'Reputacional' },
  strategic: { icon: TrendingUp, color: 'text-indigo-500', label: 'Estratégico' },
  technology: { icon: AlertTriangle, color: 'text-orange-500', label: 'Tecnología' },
}

const treatmentLabels: Record<string, { label: string; color: string }> = {
  mitigate: { label: 'Mitigar', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  accept: { label: 'Aceptar', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400' },
  transfer: { label: 'Transferir', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  avoid: { label: 'Evitar', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SeverityBadge({ severity }: { severity: RiskSeverity }) {
  const config = severityConfig[severity]

  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', config.bg, config.color)}>
      {config.label}
    </span>
  )
}

function StatusBadge({ status }: { status: RiskStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: RiskCategory }) {
  const config = categoryConfig[category]
  const Icon = config.icon

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
      <Icon className={cn('w-3.5 h-3.5', config.color)} />
      {config.label}
    </span>
  )
}

function MitigationProgress({ progress }: { progress: number }) {
  const getColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500'
    if (p >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor(progress))}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 w-10 text-right">{progress}%</span>
    </div>
  )
}

function RiskMatrix({ risks }: { risks: Risk[] }) {
  const matrix = useMemo(() => {
    const grid: { likelihood: number; impact: number; count: number; severity: RiskSeverity }[][] = []

    for (let i = 1; i <= 5; i++) {
      grid[i] = []
      for (let j = 1; j <= 5; j++) {
        const score = i * j
        let severity: RiskSeverity = 'info'
        if (score >= 20) severity = 'critical'
        else if (score >= 12) severity = 'high'
        else if (score >= 6) severity = 'medium'
        else if (score >= 2) severity = 'low'

        const count = risks.filter(r => r.likelihood === j && r.impact === i).length

        grid[i][j] = { likelihood: j, impact: i, count, severity }
      }
    }

    return grid
  }, [risks])

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-purple-500" />
        Matriz de Riesgos
      </h3>
      <div className="relative">
        {/* Y-axis label */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-neutral-500 whitespace-nowrap">
          Impacto
        </div>

        {/* Matrix Grid */}
        <div className="ml-4">
          <div className="grid grid-cols-5 gap-1">
            {[5, 4, 3, 2, 1].map(impact => (
              [1, 2, 3, 4, 5].map(likelihood => {
                const cell = matrix[impact]?.[likelihood]
                if (!cell) return null

                return (
                  <div
                    key={`${impact}-${likelihood}`}
                    className={cn(
                      'aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all hover:scale-105 cursor-pointer',
                      cell.count > 0 ? severityConfig[cell.severity].bg : 'bg-neutral-100 dark:bg-neutral-800',
                      cell.count > 0 ? severityConfig[cell.severity].color : 'text-neutral-300 dark:text-neutral-600'
                    )}
                    title={`Probabilidad: ${likelihood}, Impacto: ${impact} - ${cell.count} riesgos`}
                  >
                    {cell.count > 0 ? cell.count : ''}
                  </div>
                )
              })
            ))}
          </div>

          {/* X-axis label */}
          <div className="text-center mt-2 text-xs font-medium text-neutral-500">
            Probabilidad
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(severityConfig) as RiskSeverity[]).filter(s => s !== 'info').map(severity => (
            <div key={severity} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded', severityConfig[severity].bg)} />
              <span className="text-xs text-neutral-500">{severityConfig[severity].label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RiskCard({ risk, onSelect, isSelected }: { risk: Risk; onSelect: () => void; isSelected: boolean }) {
  const categoryCfg = categoryConfig[risk.category]
  const CategoryIcon = categoryCfg.icon

  return (
    <div
      onClick={onSelect}
      className={cn(
        'glass-card p-4 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group',
        isSelected && 'ring-2 ring-primary-500 shadow-lg'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={risk.inherentSeverity} />
          <span className="text-xs text-neutral-500">→</span>
          <SeverityBadge severity={risk.residualSeverity} />
        </div>
        <StatusBadge status={risk.status} />
      </div>

      {/* Title */}
      <h4 className="font-medium text-neutral-900 dark:text-white text-sm mb-2">{risk.title}</h4>

      {/* Description */}
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">{risk.description}</p>

      {/* Category & Treatment */}
      <div className="flex items-center gap-2 mb-3">
        <CategoryBadge category={risk.category} />
        <span className={cn('text-xs px-2 py-0.5 rounded-full', treatmentLabels[risk.treatmentStrategy].color)}>
          {treatmentLabels[risk.treatmentStrategy].label}
        </span>
      </div>

      {/* Mitigation Progress */}
      {risk.status === 'mitigating' && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-neutral-500">Progreso de Mitigación</span>
          </div>
          <MitigationProgress progress={risk.mitigationProgress} />
        </div>
      )}

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          <span className="text-xs text-neutral-500 block">Score Inherente</span>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">{risk.inherentScore}</span>
        </div>
        <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          <span className="text-xs text-neutral-500 block">Score Residual</span>
          <span className="text-lg font-bold text-neutral-900 dark:text-white">{risk.residualScore}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <User className="w-3 h-3" />
          {risk.owner}
        </div>
        {risk.dueDate && (
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Calendar className="w-3 h-3" />
            {new Date(risk.dueDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  )
}

function RiskDetailPanel({ risk, onClose }: { risk: Risk; onClose: () => void }) {
  const categoryCfg = categoryConfig[risk.category]
  const CategoryIcon = categoryCfg.icon

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SeverityBadge severity={risk.inherentSeverity} />
              <StatusBadge status={risk.status} />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">{risk.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Descripción</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{risk.description}</p>
        </div>

        {/* Category & Treatment */}
        <div className="flex items-center gap-3">
          <CategoryBadge category={risk.category} />
          <span className={cn('text-xs px-2.5 py-1 rounded-full', treatmentLabels[risk.treatmentStrategy].color)}>
            Estrategia: {treatmentLabels[risk.treatmentStrategy].label}
          </span>
        </div>

        {/* Risk Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <h5 className="text-xs text-neutral-500 mb-2">Riesgo Inherente</h5>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">{risk.inherentScore}</span>
              <SeverityBadge severity={risk.inherentSeverity} />
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              Probabilidad: {risk.likelihood} | Impacto: {risk.impact}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <h5 className="text-xs text-neutral-500 mb-2">Riesgo Residual</h5>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">{risk.residualScore}</span>
              <SeverityBadge severity={risk.residualSeverity} />
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              Después de controles
            </div>
          </div>
        </div>

        {/* Mitigation Progress */}
        {risk.status === 'mitigating' && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Progreso de Mitigación</h4>
            <MitigationProgress progress={risk.mitigationProgress} />
            {risk.mitigationPlan && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h5 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Plan de Mitigación</h5>
                <p className="text-sm text-blue-600 dark:text-blue-400">{risk.mitigationPlan}</p>
              </div>
            )}
          </div>
        )}

        {/* Owner & Department */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Responsable</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{risk.owner}</p>
            <p className="text-xs text-neutral-500">{risk.ownerEmail}</p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Departamento</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{risk.department}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Identificado</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {new Date(risk.identifiedDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          {risk.dueDate && (
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-xs text-neutral-500">Fecha Límite</span>
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {new Date(risk.dueDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Related Controls */}
        {risk.relatedControls.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Controles Relacionados</h4>
            <div className="flex flex-wrap gap-2">
              {risk.relatedControls.map(control => (
                <span key={control} className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-xs font-mono text-blue-700 dark:text-blue-400">
                  {control}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acceptance Info */}
        {risk.status === 'accepted' && risk.acceptanceJustification && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">Aceptación del Riesgo</h4>
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">{risk.acceptanceJustification}</p>
            {risk.acceptedBy && (
              <p className="text-xs text-amber-500">
                Aceptado por {risk.acceptedBy} el {new Date(risk.acceptedDate!).toLocaleDateString('es-MX')}
              </p>
            )}
          </div>
        )}

        {/* Review Schedule */}
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Programación de Revisión</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-neutral-500">Frecuencia</span>
              <p className="text-sm font-medium text-neutral-900 dark:text-white capitalize">{risk.reviewFrequency}</p>
            </div>
            {risk.nextReviewDate && (
              <div>
                <span className="text-xs text-neutral-500">Próxima Revisión</span>
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {new Date(risk.nextReviewDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
            <Edit2 className="w-4 h-4" />
            Editar Riesgo
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium">
            <FileText className="w-4 h-4" />
            Historial
          </button>
        </div>
      </div>
    </div>
  )
}

function QuickStats({ risks }: { risks: Risk[] }) {
  const stats = useMemo(() => {
    const total = risks.length
    const critical = risks.filter(r => r.inherentSeverity === 'critical').length
    const high = risks.filter(r => r.inherentSeverity === 'high').length
    const mitigating = risks.filter(r => r.status === 'mitigating').length
    const avgMitigation = risks.filter(r => r.status === 'mitigating').length > 0
      ? Math.round(risks.filter(r => r.status === 'mitigating').reduce((acc, r) => acc + r.mitigationProgress, 0) / risks.filter(r => r.status === 'mitigating').length)
      : 0

    return { total, critical, high, mitigating, avgMitigation }
  }, [risks])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-neutral-500">Total Riesgos</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.critical}</p>
            <p className="text-xs text-neutral-500">Críticos</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.high}</p>
            <p className="text-xs text-neutral-500">Altos</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.mitigating}</p>
            <p className="text-xs text-neutral-500">En Mitigación</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.avgMitigation}%</p>
            <p className="text-xs text-neutral-500">Progreso Prom.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComplianceRisks() {
  const { data: risksResponse, isLoading } = useRisks()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [severityFilter, setSeverityFilter] = useState<RiskSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<RiskStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<RiskCategory | 'all'>('all')

  const risks = risksResponse?.data || []

  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      const matchesSearch = !searchQuery ||
        risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSeverity = severityFilter === 'all' || risk.inherentSeverity === severityFilter
      const matchesStatus = statusFilter === 'all' || risk.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || risk.category === categoryFilter

      return matchesSearch && matchesSeverity && matchesStatus && matchesCategory
    })
  }, [risks, searchQuery, severityFilter, statusFilter, categoryFilter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Cargando riesgos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
            <Link to="/compliance" className="hover:text-primary-600">Portal de Cumplimiento</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-neutral-900 dark:text-white">Riesgos</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Gestión de Riesgos
          </h1>
          <p className="text-neutral-500 mt-1">
            {filteredRisks.length} de {risks.length} riesgos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Nuevo Riesgo
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats risks={risks} />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar riesgos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as RiskSeverity | 'all')}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todas las severidades</option>
            {(Object.keys(severityConfig) as RiskSeverity[]).map(severity => (
              <option key={severity} value={severity}>{severityConfig[severity].label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RiskStatus | 'all')}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los estados</option>
            {(Object.keys(statusConfig) as RiskStatus[]).map(status => (
              <option key={status} value={status}>{statusConfig[status].label}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as RiskCategory | 'all')}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todas las categorías</option>
            {(Object.keys(categoryConfig) as RiskCategory[]).map(category => (
              <option key={category} value={category}>{categoryConfig[category].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risks List */}
        <div className={cn(selectedRisk ? 'lg:col-span-2' : 'lg:col-span-3')}>
          {/* Risk Matrix */}
          {!selectedRisk && risks.length > 0 && (
            <div className="mb-6">
              <RiskMatrix risks={risks} />
            </div>
          )}

          {/* Risks Grid */}
          <div className={cn(
            'grid gap-4',
            selectedRisk ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          )}>
            {filteredRisks.map(risk => (
              <RiskCard
                key={risk.id}
                risk={risk}
                onSelect={() => setSelectedRisk(selectedRisk?.id === risk.id ? null : risk)}
                isSelected={selectedRisk?.id === risk.id}
              />
            ))}
          </div>

          {filteredRisks.length === 0 && (
            <div className="glass-card p-12 rounded-2xl text-center">
              <AlertTriangle className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No se encontraron riesgos
              </h3>
              <p className="text-neutral-500 text-sm mb-4">
                {searchQuery || severityFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                  : 'No hay riesgos registrados en el sistema'}
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
                Registrar Primer Riesgo
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedRisk && (
          <div className="lg:col-span-1">
            <RiskDetailPanel
              risk={selectedRisk}
              onClose={() => setSelectedRisk(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplianceRisks
