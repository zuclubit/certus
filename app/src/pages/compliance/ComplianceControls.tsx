/**
 * Compliance Controls Page - VisionOS Enterprise Design
 *
 * Comprehensive control management with:
 * - Control listing with advanced filtering
 * - Status management
 * - Control detail view
 * - Evidence linking
 * - Testing history
 *
 * @version 1.0.0
 * @compliance SOC 2 Type II, ISO 27001:2022
 */

import { useState, useMemo, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Shield,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MinusCircle,
  Calendar,
  User,
  Tag,
  FileCheck,
  AlertTriangle,
  Activity,
  X,
  MoreVertical,
  Eye,
  Edit2,
  Link2,
  RefreshCw,
  Download,
  Loader2,
  Info,
  Building,
  Zap,
  Target,
  CheckSquare,
  SortAsc,
  SortDesc,
  Grid,
  List,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useControls, useUpdateControlStatus } from '@/hooks/useCompliance'
import type { Control, ControlStatus, ControlEffectiveness, ComplianceFramework } from '@/types/compliance.types'

// ============================================================================
// CONSTANTS
// ============================================================================

const statusConfig: Record<ControlStatus, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  implemented: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Implementado' },
  in_progress: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'En Progreso' },
  not_implemented: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'No Implementado' },
  not_applicable: { icon: MinusCircle, color: 'text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800', label: 'N/A' },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Fallido' },
}

const effectivenessConfig: Record<ControlEffectiveness, { color: string; bg: string; label: string }> = {
  not_tested: { color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800', label: 'Sin Probar' },
  ineffective: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Inefectivo' },
  partially_effective: { color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Parcialmente Efectivo' },
  effective: { color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Efectivo' },
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

const automationLabels: Record<string, { label: string; color: string }> = {
  manual: { label: 'Manual', color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' },
  semi_automated: { label: 'Semi-Automatizado', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  fully_automated: { label: 'Automatizado', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: ControlStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}

function EffectivenessBadge({ effectiveness }: { effectiveness: ControlEffectiveness }) {
  const config = effectivenessConfig[effectiveness]

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.bg, config.color)}>
      {config.label}
    </span>
  )
}

function FrameworkBadge({ framework }: { framework: ComplianceFramework }) {
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', frameworkColors[framework])}>
      {framework}
    </span>
  )
}

function ControlCard({ control, onSelect, isSelected }: { control: Control; onSelect: () => void; isSelected: boolean }) {
  const statusCfg = statusConfig[control.status]
  const StatusIcon = statusCfg.icon

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
          <div className={cn('p-2 rounded-lg', statusCfg.bg)}>
            <StatusIcon className={cn('w-4 h-4', statusCfg.color)} />
          </div>
          <div>
            <span className="text-xs font-mono text-neutral-500">{control.code}</span>
            <FrameworkBadge framework={control.frameworkCode} />
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation() }}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      {/* Title */}
      <h4 className="font-medium text-neutral-900 dark:text-white text-sm mb-2 line-clamp-2">
        {control.name}
      </h4>

      {/* Description */}
      <p className="text-xs text-neutral-500 mb-3 line-clamp-2">
        {control.description}
      </p>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 mb-3">
        <EffectivenessBadge effectiveness={control.effectiveness} />
        <span className={cn('text-xs px-2 py-0.5 rounded-full', automationLabels[control.automationLevel].color)}>
          {automationLabels[control.automationLevel].label}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-1">
          <FileCheck className="w-3.5 h-3.5" />
          {control.evidenceCount} evidencias
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          {control.riskCount} riesgos
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-neutral-500">
          <User className="w-3 h-3" />
          {control.owner.name}
        </div>
        {control.nextTestDate && (
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Calendar className="w-3 h-3" />
            {new Date(control.nextTestDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>
    </div>
  )
}

function ControlRow({ control, onSelect, isSelected }: { control: Control; onSelect: () => void; isSelected: boolean }) {
  const statusCfg = statusConfig[control.status]
  const StatusIcon = statusCfg.icon

  return (
    <tr
      onClick={onSelect}
      className={cn(
        'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors',
        isSelected && 'bg-primary-50 dark:bg-primary-900/10'
      )}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('w-4 h-4', statusCfg.color)} />
          <span className="text-xs font-mono text-neutral-500">{control.code}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="max-w-xs">
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{control.name}</p>
          <p className="text-xs text-neutral-500 truncate">{control.categoryName}</p>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <FrameworkBadge framework={control.frameworkCode} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={control.status} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <EffectivenessBadge effectiveness={control.effectiveness} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{control.owner.name}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{control.evidenceCount}</span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect() }}
          className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-600"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

function ControlDetailPanel({ control, onClose, onStatusUpdate }: {
  control: Control
  onClose: () => void
  onStatusUpdate: (status: ControlStatus) => void
}) {
  const statusCfg = statusConfig[control.status]
  const StatusIcon = statusCfg.icon

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-xl', statusCfg.bg)}>
              <StatusIcon className={cn('w-5 h-5', statusCfg.color)} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-neutral-500">{control.code}</span>
                <FrameworkBadge framework={control.frameworkCode} />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">{control.name}</h3>
            </div>
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
        {/* Status Actions */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Estado del Control</h4>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statusConfig) as ControlStatus[]).map((status) => {
              const cfg = statusConfig[status]
              const Icon = cfg.icon
              return (
                <button
                  key={status}
                  onClick={() => onStatusUpdate(status)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    control.status === status
                      ? cn(cfg.bg, cfg.color, 'ring-2 ring-offset-2', `ring-${cfg.color.split('-')[1]}-500`)
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cfg.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Descripción</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{control.description}</p>
        </div>

        {/* Objective */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Objetivo</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{control.objective}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Responsable</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{control.owner.name}</p>
            <p className="text-xs text-neutral-500">{control.owner.department}</p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Categoría</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{control.categoryName}</p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Frecuencia</span>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white capitalize">{control.frequency.replace('_', ' ')}</p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-neutral-400" />
              <span className="text-xs text-neutral-500">Automatización</span>
            </div>
            <span className={cn('text-xs px-2 py-1 rounded-full', automationLabels[control.automationLevel].color)}>
              {automationLabels[control.automationLevel].label}
            </span>
          </div>
        </div>

        {/* Testing Info */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Información de Pruebas</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Efectividad</span>
              <EffectivenessBadge effectiveness={control.effectiveness} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Frecuencia de Prueba</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white capitalize">{control.testingFrequency.replace('_', ' ')}</span>
            </div>
            {control.lastTestedDate && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Última Prueba</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {new Date(control.lastTestedDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
            {control.nextTestDate && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Próxima Prueba</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {new Date(control.nextTestDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div>
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Estadísticas</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
              <FileCheck className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{control.evidenceCount}</p>
              <p className="text-xs text-neutral-500">Evidencias</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{control.riskCount}</p>
              <p className="text-xs text-neutral-500">Riesgos</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
              <Target className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{control.findingCount}</p>
              <p className="text-xs text-neutral-500">Hallazgos</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {control.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Etiquetas</h4>
            <div className="flex flex-wrap gap-2">
              {control.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Implementation Notes */}
        {control.implementationNotes && (
          <div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2">Notas de Implementación</h4>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">{control.implementationNotes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
            <Edit2 className="w-4 h-4" />
            Editar Control
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium">
            <Link2 className="w-4 h-4" />
            Vincular Evidencia
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterPanel({ isOpen, onClose, filters, onFiltersChange }: {
  isOpen: boolean
  onClose: () => void
  filters: {
    status: ControlStatus[]
    effectiveness: ControlEffectiveness[]
    framework: ComplianceFramework | null
  }
  onFiltersChange: (filters: any) => void
}) {
  if (!isOpen) return null

  const toggleStatus = (status: ControlStatus) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    onFiltersChange({ ...filters, status: newStatuses })
  }

  const toggleEffectiveness = (eff: ControlEffectiveness) => {
    const newEff = filters.effectiveness.includes(eff)
      ? filters.effectiveness.filter(e => e !== eff)
      : [...filters.effectiveness, eff]
    onFiltersChange({ ...filters, effectiveness: newEff })
  }

  const frameworks: ComplianceFramework[] = ['SOC2', 'ISO27001', 'NIST_CSF', 'CIS_V8', 'CONSAR']

  return (
    <div className="glass-card p-4 rounded-xl mb-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-neutral-900 dark:text-white">Filtros</h4>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <X className="w-4 h-4 text-neutral-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div>
          <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Estado</h5>
          <div className="space-y-2">
            {(Object.keys(statusConfig) as ControlStatus[]).map(status => {
              const cfg = statusConfig[status]
              const Icon = cfg.icon
              return (
                <label key={status} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <Icon className={cn('w-4 h-4', cfg.color)} />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">{cfg.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Effectiveness Filter */}
        <div>
          <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Efectividad</h5>
          <div className="space-y-2">
            {(Object.keys(effectivenessConfig) as ControlEffectiveness[]).map(eff => {
              const cfg = effectivenessConfig[eff]
              return (
                <label key={eff} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.effectiveness.includes(eff)}
                    onChange={() => toggleEffectiveness(eff)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className={cn('text-sm', cfg.color)}>{cfg.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Framework Filter */}
        <div>
          <h5 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Framework</h5>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="framework"
                checked={filters.framework === null}
                onChange={() => onFiltersChange({ ...filters, framework: null })}
                className="border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Todos</span>
            </label>
            {frameworks.map(fw => (
              <label key={fw} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="framework"
                  checked={filters.framework === fw}
                  onChange={() => onFiltersChange({ ...filters, framework: fw })}
                  className="border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className={cn('text-xs px-2 py-0.5 rounded-full', frameworkColors[fw])}>{fw}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => onFiltersChange({ status: [], effectiveness: [], framework: null })}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComplianceControls() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: controlsResponse, isLoading } = useControls({
    frameworkId: searchParams.get('framework') as ComplianceFramework | undefined,
  })
  const updateStatusMutation = useUpdateControlStatus()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedControl, setSelectedControl] = useState<Control | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortField, setSortField] = useState<'code' | 'name' | 'status'>('code')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<{
    status: ControlStatus[]
    effectiveness: ControlEffectiveness[]
    framework: ComplianceFramework | null
  }>({
    status: [],
    effectiveness: [],
    framework: searchParams.get('framework') as ComplianceFramework | null,
  })

  const controls = controlsResponse?.data || []

  const filteredAndSortedControls = useMemo(() => {
    let result = controls.filter(control => {
      const matchesSearch = !searchQuery ||
        control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        control.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = filters.status.length === 0 || filters.status.includes(control.status)
      const matchesEffectiveness = filters.effectiveness.length === 0 || filters.effectiveness.includes(control.effectiveness)
      const matchesFramework = !filters.framework || control.frameworkCode === filters.framework

      return matchesSearch && matchesStatus && matchesEffectiveness && matchesFramework
    })

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code)
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === 'status') {
        const statusOrder: ControlStatus[] = ['failed', 'not_implemented', 'in_progress', 'implemented', 'not_applicable']
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [controls, searchQuery, filters, sortField, sortDirection])

  const handleStatusUpdate = useCallback((controlId: string, status: ControlStatus) => {
    updateStatusMutation.mutate({ id: controlId, status })
    if (selectedControl?.id === controlId) {
      setSelectedControl({ ...selectedControl, status })
    }
  }, [updateStatusMutation, selectedControl])

  const activeFiltersCount = filters.status.length + filters.effectiveness.length + (filters.framework ? 1 : 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Cargando controles...</p>
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
            <span className="text-neutral-900 dark:text-white">Controles</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Controles de Cumplimiento
          </h1>
          <p className="text-neutral-500 mt-1">
            {filteredAndSortedControls.length} de {controls.length} controles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Search & View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar controles por código, nombre o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
              showFilters || activeFiltersCount > 0
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            )}
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full">{activeFiltersCount}</span>
            )}
          </button>
          <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-white dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'list' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-white dark:bg-neutral-800 text-neutral-400 hover:text-neutral-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls List/Grid */}
        <div className={cn(selectedControl ? 'lg:col-span-2' : 'lg:col-span-3')}>
          {viewMode === 'grid' ? (
            <div className={cn(
              'grid gap-4',
              selectedControl ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            )}>
              {filteredAndSortedControls.map(control => (
                <ControlCard
                  key={control.id}
                  control={control}
                  onSelect={() => setSelectedControl(selectedControl?.id === control.id ? null : control)}
                  isSelected={selectedControl?.id === control.id}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Framework</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Efectividad</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Responsable</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Evidencias</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {filteredAndSortedControls.map(control => (
                    <ControlRow
                      key={control.id}
                      control={control}
                      onSelect={() => setSelectedControl(selectedControl?.id === control.id ? null : control)}
                      isSelected={selectedControl?.id === control.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredAndSortedControls.length === 0 && (
            <div className="glass-card p-12 rounded-2xl text-center">
              <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No se encontraron controles
              </h3>
              <p className="text-neutral-500 text-sm">
                {searchQuery || activeFiltersCount > 0
                  ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                  : 'No hay controles configurados en el sistema'}
              </p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedControl && (
          <div className="lg:col-span-1">
            <ControlDetailPanel
              control={selectedControl}
              onClose={() => setSelectedControl(null)}
              onStatusUpdate={(status) => handleStatusUpdate(selectedControl.id, status)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ComplianceControls
