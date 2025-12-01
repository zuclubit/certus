/**
 * Compliance Audits Page - VisionOS Enterprise Design
 *
 * Audit management with:
 * - Audit calendar and timeline
 * - Audit details and findings
 * - Evidence tracking
 * - Report management
 *
 * @version 1.0.0
 * @compliance SOC 2 Type II, ISO 27001:2022
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardCheck,
  Search,
  ChevronRight,
  Calendar,
  User,
  Users,
  Building,
  FileText,
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Play,
  Pause,
  X,
  Eye,
  Edit2,
  Plus,
  Download,
  ExternalLink,
  Loader2,
  Info,
  Target,
  BarChart3,
  FolderOpen,
  FileCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAudits } from '@/hooks/useCompliance'
import type { Audit, AuditStatus, AuditType, ComplianceFramework, FindingSeverity } from '@/types/compliance.types'

// ============================================================================
// CONSTANTS
// ============================================================================

const statusConfig: Record<AuditStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  planned: { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Planificada' },
  in_progress: { icon: Play, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'En Progreso' },
  fieldwork: { icon: ClipboardCheck, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Trabajo de Campo' },
  review: { icon: Eye, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'En Revisión' },
  completed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Completada' },
  cancelled: { icon: XCircle, color: 'text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800', label: 'Cancelada' },
}

const typeConfig: Record<AuditType, { icon: React.ElementType; color: string; label: string }> = {
  internal: { icon: Building, color: 'text-blue-500', label: 'Interna' },
  external: { icon: ExternalLink, color: 'text-purple-500', label: 'Externa' },
  certification: { icon: Shield, color: 'text-emerald-500', label: 'Certificación' },
  surveillance: { icon: Eye, color: 'text-amber-500', label: 'Vigilancia' },
  special: { icon: AlertTriangle, color: 'text-orange-500', label: 'Especial' },
}

const frameworkColors: Record<ComplianceFramework, string> = {
  SOC2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ISO27001: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  NIST_CSF: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CIS_V8: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  CONSAR: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  CNBV: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  GDPR: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  LFPDPPP: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  PCI_DSS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

const findingSeverityColors: Record<FindingSeverity, { bg: string; color: string }> = {
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600' },
  major: { bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600' },
  minor: { bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600' },
  observation: { bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600' },
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: AuditStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

function TypeBadge({ type }: { type: AuditType }) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
      <Icon className={cn('w-3.5 h-3.5', config.color)} />
      {config.label}
    </span>
  )
}

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-neutral-500">{label}</span>
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{current}/{total}</span>
      </div>
      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function FindingsSummary({ critical, major, minor, observations }: { critical: number; major: number; minor: number; observations: number }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <div className={cn('p-2 rounded-lg text-center', findingSeverityColors.critical.bg)}>
        <span className={cn('text-lg font-bold', findingSeverityColors.critical.color)}>{critical}</span>
        <p className="text-xs text-neutral-500">Críticos</p>
      </div>
      <div className={cn('p-2 rounded-lg text-center', findingSeverityColors.major.bg)}>
        <span className={cn('text-lg font-bold', findingSeverityColors.major.color)}>{major}</span>
        <p className="text-xs text-neutral-500">Mayores</p>
      </div>
      <div className={cn('p-2 rounded-lg text-center', findingSeverityColors.minor.bg)}>
        <span className={cn('text-lg font-bold', findingSeverityColors.minor.color)}>{minor}</span>
        <p className="text-xs text-neutral-500">Menores</p>
      </div>
      <div className={cn('p-2 rounded-lg text-center', findingSeverityColors.observation.bg)}>
        <span className={cn('text-lg font-bold', findingSeverityColors.observation.color)}>{observations}</span>
        <p className="text-xs text-neutral-500">Observ.</p>
      </div>
    </div>
  )
}

function AuditTimeline({ audit }: { audit: Audit }) {
  const phases = [
    { label: 'Planificación', date: audit.plannedStartDate, completed: !!audit.actualStartDate },
    { label: 'Trabajo de Campo', date: audit.fieldworkStartDate, completed: !!audit.fieldworkEndDate },
    { label: 'Revisión', date: audit.fieldworkEndDate, completed: audit.status === 'review' || audit.status === 'completed' },
    { label: 'Reporte', date: audit.reportIssuedDate, completed: !!audit.reportIssuedDate },
  ]

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
      <div className="space-y-4">
        {phases.map((phase, idx) => (
          <div key={idx} className="relative flex items-center gap-4 pl-10">
            <div className={cn(
              'absolute left-2.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-neutral-900',
              phase.completed
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-neutral-300 dark:border-neutral-600'
            )} />
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                phase.completed ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'
              )}>
                {phase.label}
              </p>
              {phase.date && (
                <p className="text-xs text-neutral-500">
                  {new Date(phase.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
            {phase.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>
        ))}
      </div>
    </div>
  )
}

function AuditCard({ audit, onSelect, isSelected }: { audit: Audit; onSelect: () => void; isSelected: boolean }) {
  const typeCfg = typeConfig[audit.type]
  const TypeIcon = typeCfg.icon

  const getDaysRemaining = () => {
    const endDate = new Date(audit.plannedEndDate)
    const today = new Date()
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div
      onClick={onSelect}
      className={cn(
        'glass-card p-5 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group',
        isSelected && 'ring-2 ring-primary-500 shadow-lg'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2.5 rounded-xl', statusConfig[audit.status].bg)}>
            <TypeIcon className={cn('w-5 h-5', typeCfg.color)} />
          </div>
          <div>
            <TypeBadge type={audit.type} />
          </div>
        </div>
        <StatusBadge status={audit.status} />
      </div>

      {/* Title */}
      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">{audit.name}</h4>

      {/* Description */}
      <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{audit.description}</p>

      {/* Frameworks */}
      <div className="flex flex-wrap gap-1 mb-4">
        {audit.frameworkIds.map(fw => (
          <span key={fw} className={cn('px-2 py-0.5 rounded text-xs font-medium', frameworkColors[fw])}>
            {fw}
          </span>
        ))}
      </div>

      {/* Findings Summary */}
      {audit.findingsCount > 0 && (
        <div className="mb-4">
          <FindingsSummary
            critical={audit.criticalFindings}
            major={audit.majorFindings}
            minor={audit.minorFindings}
            observations={audit.observations}
          />
        </div>
      )}

      {/* Progress */}
      {audit.status !== 'completed' && audit.status !== 'cancelled' && (
        <div className="mb-4">
          <ProgressBar
            current={audit.evidenceProvided}
            total={audit.evidenceRequested}
            label="Evidencia Recopilada"
          />
        </div>
      )}

      {/* Dates & Team */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-neutral-500">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(audit.plannedStartDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} - {new Date(audit.plannedEndDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </div>
          {audit.status !== 'completed' && audit.status !== 'cancelled' && daysRemaining >= 0 && (
            <span className={cn(
              'px-2 py-0.5 rounded-full font-medium',
              daysRemaining <= 7 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
              daysRemaining <= 30 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            )}>
              {daysRemaining}d restantes
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <User className="w-3.5 h-3.5" />
          {audit.leadAuditor}
          {audit.auditorFirm && <span className="text-neutral-400">• {audit.auditorFirm}</span>}
        </div>
      </div>
    </div>
  )
}

function AuditDetailPanel({ audit, onClose }: { audit: Audit; onClose: () => void }) {
  const typeCfg = typeConfig[audit.type]
  const TypeIcon = typeCfg.icon

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TypeBadge type={audit.type} />
              <StatusBadge status={audit.status} />
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white">{audit.name}</h3>
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
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{audit.description}</p>
        </div>

        {/* Scope */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Alcance</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{audit.scope}</p>
        </div>

        {/* Objectives */}
        {audit.objectives.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Objetivos</h4>
            <ul className="space-y-1">
              {audit.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Target className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Frameworks */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Frameworks</h4>
          <div className="flex flex-wrap gap-2">
            {audit.frameworkIds.map(fw => (
              <span key={fw} className={cn('px-2.5 py-1 rounded-lg text-xs font-medium', frameworkColors[fw])}>
                {fw}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Línea de Tiempo</h4>
          <AuditTimeline audit={audit} />
        </div>

        {/* Findings */}
        {audit.findingsCount > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Hallazgos ({audit.findingsCount})</h4>
            <FindingsSummary
              critical={audit.criticalFindings}
              major={audit.majorFindings}
              minor={audit.minorFindings}
              observations={audit.observations}
            />
          </div>
        )}

        {/* Evidence Progress */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Evidencia</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-center">
              <FileCheck className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{audit.evidenceProvided}</p>
              <p className="text-xs text-neutral-500">Proporcionada</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 text-center">
              <FolderOpen className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">{audit.evidenceRequested}</p>
              <p className="text-xs text-neutral-500">Solicitada</p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar
              current={audit.evidenceProvided}
              total={audit.evidenceRequested}
              label="Progreso de Recopilación"
            />
          </div>
        </div>

        {/* Controls Tested */}
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Controles Evaluados</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{audit.controlsTested}</p>
            </div>
          </div>
        </div>

        {/* Audit Team */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Equipo de Auditoría</h4>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-neutral-400" />
                <span className="text-xs text-neutral-500">Auditor Líder</span>
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{audit.leadAuditor}</p>
              {audit.auditorFirm && (
                <p className="text-xs text-neutral-500">{audit.auditorFirm}</p>
              )}
            </div>
            {audit.auditTeam.length > 0 && (
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs text-neutral-500">Equipo ({audit.auditTeam.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {audit.auditTeam.map((member, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Building className="w-4 h-4 text-neutral-400" />
                <span className="text-xs text-neutral-500">Contacto Interno</span>
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{audit.internalContact}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Fecha Inicio</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {new Date(audit.plannedStartDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {audit.actualStartDate && (
              <p className="text-xs text-emerald-500">
                Real: {new Date(audit.actualStartDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Fecha Fin</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {new Date(audit.plannedEndDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {audit.actualEndDate && (
              <p className="text-xs text-emerald-500">
                Real: {new Date(audit.actualEndDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>

        {/* Report */}
        {audit.reportUrl && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Reporte Final</p>
                  {audit.reportIssuedDate && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Emitido: {new Date(audit.reportIssuedDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
              <button className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        {audit.notes && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Notas</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              {audit.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
            <Edit2 className="w-4 h-4" />
            Editar Auditoría
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium">
            <FileText className="w-4 h-4" />
            Hallazgos
          </button>
        </div>
      </div>
    </div>
  )
}

function QuickStats({ audits }: { audits: Audit[] }) {
  const stats = useMemo(() => {
    const total = audits.length
    const inProgress = audits.filter(a => a.status === 'in_progress' || a.status === 'fieldwork').length
    const completed = audits.filter(a => a.status === 'completed').length
    const totalFindings = audits.reduce((acc, a) => acc + a.findingsCount, 0)
    const criticalFindings = audits.reduce((acc, a) => acc + a.criticalFindings, 0)

    return { total, inProgress, completed, totalFindings, criticalFindings }
  }, [audits])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-neutral-500">Total Auditorías</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.inProgress}</p>
            <p className="text-xs text-neutral-500">En Progreso</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.completed}</p>
            <p className="text-xs text-neutral-500">Completadas</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalFindings}</p>
            <p className="text-xs text-neutral-500">Hallazgos Total</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.criticalFindings}</p>
            <p className="text-xs text-neutral-500">Críticos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComplianceAudits() {
  const { data: auditsResponse, isLoading } = useAudits()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)
  const [statusFilter, setStatusFilter] = useState<AuditStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<AuditType | 'all'>('all')

  const audits = auditsResponse?.data || []

  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const matchesSearch = !searchQuery ||
        audit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audit.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || audit.status === statusFilter
      const matchesType = typeFilter === 'all' || audit.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [audits, searchQuery, statusFilter, typeFilter])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Cargando auditorías...</p>
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
            <span className="text-neutral-900 dark:text-white">Auditorías</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Gestión de Auditorías
          </h1>
          <p className="text-neutral-500 mt-1">
            {filteredAudits.length} de {audits.length} auditorías
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" />
            Nueva Auditoría
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats audits={audits} />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar auditorías..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AuditStatus | 'all')}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los estados</option>
            {(Object.keys(statusConfig) as AuditStatus[]).map(status => (
              <option key={status} value={status}>{statusConfig[status].label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AuditType | 'all')}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los tipos</option>
            {(Object.keys(typeConfig) as AuditType[]).map(type => (
              <option key={type} value={type}>{typeConfig[type].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audits List */}
        <div className={cn(selectedAudit ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <div className={cn(
            'grid gap-4',
            selectedAudit ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          )}>
            {filteredAudits.map(audit => (
              <AuditCard
                key={audit.id}
                audit={audit}
                onSelect={() => setSelectedAudit(selectedAudit?.id === audit.id ? null : audit)}
                isSelected={selectedAudit?.id === audit.id}
              />
            ))}
          </div>

          {filteredAudits.length === 0 && (
            <div className="glass-card p-12 rounded-2xl text-center">
              <ClipboardCheck className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No se encontraron auditorías
              </h3>
              <p className="text-neutral-500 text-sm mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                  : 'No hay auditorías programadas en el sistema'}
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
                <Plus className="w-4 h-4" />
                Programar Primera Auditoría
              </button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedAudit && (
          <div className="lg:col-span-1">
            <AuditDetailPanel
              audit={selectedAudit}
              onClose={() => setSelectedAudit(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplianceAudits
