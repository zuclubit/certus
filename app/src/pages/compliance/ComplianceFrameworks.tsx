/**
 * Compliance Frameworks Page - VisionOS Enterprise Design
 *
 * Lists all compliance frameworks with:
 * - Framework cards with progress
 * - Category breakdown
 * - Control status distribution
 * - Quick actions
 *
 * @version 1.0.0
 * @compliance SOC 2 Type II, ISO 27001:2022
 */

import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MinusCircle,
  Calendar,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  FileCheck,
  Users,
  Settings,
  ExternalLink,
  Loader2,
  Info,
  BookOpen,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFrameworks } from '@/hooks/useCompliance'
import type { Framework, ComplianceFramework, ControlStatus } from '@/types/compliance.types'

// ============================================================================
// CONSTANTS
// ============================================================================

const frameworkDescriptions: Record<ComplianceFramework, string> = {
  SOC2: 'Criterios de Servicios de Confianza para seguridad, disponibilidad, integridad de procesamiento, confidencialidad y privacidad.',
  ISO27001: 'Estándar internacional para sistemas de gestión de seguridad de la información (SGSI).',
  NIST_CSF: 'Marco de Ciberseguridad del NIST para gestionar y reducir el riesgo de ciberseguridad.',
  CIS_V8: 'Controles de Seguridad Crítica del Center for Internet Security para defensa cibernética.',
  CONSAR: 'Regulaciones de la Comisión Nacional del Sistema de Ahorro para el Retiro.',
  CNBV: 'Disposiciones de la Comisión Nacional Bancaria y de Valores.',
  GDPR: 'Reglamento General de Protección de Datos de la Unión Europea.',
  LFPDPPP: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
  PCI_DSS: 'Estándar de Seguridad de Datos para la Industria de Tarjetas de Pago.',
}

const frameworkIcons: Record<ComplianceFramework, string> = {
  SOC2: '🛡️',
  ISO27001: '📋',
  NIST_CSF: '🔒',
  CIS_V8: '🎯',
  CONSAR: '🏦',
  CNBV: '📊',
  GDPR: '🇪🇺',
  LFPDPPP: '🇲🇽',
  PCI_DSS: '💳',
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function ScoreBar({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-emerald-500'
    if (s >= 60) return 'bg-amber-500'
    if (s >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  return (
    <div className={cn('w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden', heights[size])}>
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', getColor(score))}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

function StatusBadge({ status, count }: { status: ControlStatus; count: number }) {
  const config: Record<ControlStatus, { icon: React.ElementType; color: string; label: string }> = {
    implemented: { icon: CheckCircle2, color: 'text-emerald-500', label: 'Implementados' },
    in_progress: { icon: Clock, color: 'text-amber-500', label: 'En Progreso' },
    not_implemented: { icon: XCircle, color: 'text-red-500', label: 'No Implementados' },
    not_applicable: { icon: MinusCircle, color: 'text-neutral-400', label: 'N/A' },
    failed: { icon: AlertCircle, color: 'text-red-600', label: 'Fallidos' },
  }

  const { icon: Icon, color, label } = config[status]

  return (
    <div className="flex items-center gap-2">
      <Icon className={cn('w-4 h-4', color)} />
      <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
      <span className="text-sm font-semibold text-neutral-900 dark:text-white">{count}</span>
    </div>
  )
}

function FrameworkCard({ framework, onSelect }: { framework: Framework; onSelect: () => void }) {
  const getStatusColor = (score: number) => {
    if (score >= 80) return 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10'
    if (score >= 60) return 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10'
    if (score >= 40) return 'border-orange-500/30 bg-orange-50/50 dark:bg-orange-900/10'
    return 'border-red-500/30 bg-red-50/50 dark:bg-red-900/10'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div
      onClick={onSelect}
      className="glass-card p-6 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-transparent hover:border-l-primary-500"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{frameworkIcons[framework.code]}</div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {framework.name}
            </h3>
            <p className="text-xs text-neutral-500">v{framework.version}</p>
          </div>
        </div>
        <div className={cn('px-3 py-1.5 rounded-full text-sm font-bold', getStatusColor(framework.complianceScore))}>
          <span className={getScoreColor(framework.complianceScore)}>{framework.complianceScore}%</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
        {frameworkDescriptions[framework.code]}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-neutral-500">Progreso General</span>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {framework.implementedControls} / {framework.totalControls} controles
          </span>
        </div>
        <ScoreBar score={framework.complianceScore} />
      </div>

      {/* Control Status */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">Implementados</span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-auto">{framework.implementedControls}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">En Progreso</span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-auto">{framework.inProgressControls}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">Pendientes</span>
          <span className="text-xs font-bold text-red-600 dark:text-red-400 ml-auto">{framework.notImplementedControls}</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
          <MinusCircle className="w-4 h-4 text-neutral-400" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400">N/A</span>
          <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 ml-auto">{framework.notApplicableControls}</span>
        </div>
      </div>

      {/* Dates */}
      {(framework.certificationDate || framework.nextAssessmentDate) && (
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
          {framework.certificationDate && (
            <div className="flex items-center gap-2 text-xs">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-neutral-500">Certificado:</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                {new Date(framework.certificationDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
          {framework.nextAssessmentDate && (
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-neutral-500">Próxima Evaluación:</span>
              <span className="text-neutral-700 dark:text-neutral-300">
                {new Date(framework.nextAssessmentDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
        <span className={cn(
          'text-xs font-medium px-2 py-1 rounded-full',
          framework.isActive
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
        )}>
          {framework.isActive ? 'Activo' : 'Inactivo'}
        </span>
        <div className="flex items-center text-sm text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Ver detalles <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  )
}

function CategoryBreakdown({ framework }: { framework: Framework }) {
  return (
    <div className="glass-card p-6 rounded-2xl">
      <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-primary-500" />
        Categorías - {framework.name}
      </h4>
      <div className="space-y-3">
        {framework.categories.map(category => (
          <div key={category.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-500">{category.code}</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">{category.name}</span>
              </div>
              <span className={cn(
                'text-sm font-bold',
                category.complianceScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                category.complianceScore >= 60 ? 'text-amber-600 dark:text-amber-400' :
                category.complianceScore >= 40 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
              )}>
                {category.complianceScore}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <ScoreBar score={category.complianceScore} size="sm" />
              </div>
              <span className="text-xs text-neutral-500">{category.controlCount} controles</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonChart({ frameworks }: { frameworks: Framework[] }) {
  const maxScore = 100

  return (
    <div className="glass-card p-6 rounded-2xl">
      <h4 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-500" />
        Comparación de Frameworks
      </h4>
      <div className="space-y-4">
        {frameworks.map(fw => (
          <div key={fw.id} className="flex items-center gap-4">
            <div className="w-24 flex items-center gap-2">
              <span className="text-lg">{frameworkIcons[fw.code]}</span>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{fw.code}</span>
            </div>
            <div className="flex-1 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden relative">
              <div
                className={cn(
                  'h-full transition-all duration-700 ease-out rounded-lg flex items-center justify-end pr-2',
                  fw.complianceScore >= 80 ? 'bg-emerald-500' :
                  fw.complianceScore >= 60 ? 'bg-amber-500' :
                  fw.complianceScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                )}
                style={{ width: `${(fw.complianceScore / maxScore) * 100}%` }}
              >
                {fw.complianceScore > 10 && (
                  <span className="text-xs font-bold text-white">{fw.complianceScore}%</span>
                )}
              </div>
              {fw.complianceScore <= 10 && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                  {fw.complianceScore}%
                </span>
              )}
            </div>
            <div className="w-20 text-right">
              <span className="text-xs text-neutral-500">
                {fw.implementedControls}/{fw.totalControls}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickStats({ frameworks }: { frameworks: Framework[] }) {
  const stats = useMemo(() => {
    const totalControls = frameworks.reduce((acc, fw) => acc + fw.totalControls, 0)
    const implementedControls = frameworks.reduce((acc, fw) => acc + fw.implementedControls, 0)
    const inProgressControls = frameworks.reduce((acc, fw) => acc + fw.inProgressControls, 0)
    const avgScore = frameworks.length > 0
      ? Math.round(frameworks.reduce((acc, fw) => acc + fw.complianceScore, 0) / frameworks.length)
      : 0

    return {
      totalFrameworks: frameworks.length,
      activeFrameworks: frameworks.filter(fw => fw.isActive).length,
      totalControls,
      implementedControls,
      inProgressControls,
      avgScore,
      implementationRate: totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 0,
    }
  }, [frameworks])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.activeFrameworks}</p>
            <p className="text-xs text-neutral-500">Frameworks Activos</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.totalControls}</p>
            <p className="text-xs text-neutral-500">Controles Totales</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.implementedControls}</p>
            <p className="text-xs text-neutral-500">Implementados</p>
          </div>
        </div>
      </div>
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.avgScore}%</p>
            <p className="text-xs text-neutral-500">Score Promedio</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ComplianceFrameworks() {
  const navigate = useNavigate()
  const { data: frameworksResponse, isLoading } = useFrameworks()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null)
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  const frameworks = frameworksResponse?.data || []

  const filteredFrameworks = useMemo(() => {
    return frameworks.filter(fw => {
      const matchesSearch = !searchQuery ||
        fw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fw.code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesActive = !showActiveOnly || fw.isActive
      return matchesSearch && matchesActive
    })
  }, [frameworks, searchQuery, showActiveOnly])

  const handleFrameworkSelect = (framework: Framework) => {
    setSelectedFramework(selectedFramework?.id === framework.id ? null : framework)
  }

  const handleNavigateToFramework = (framework: Framework) => {
    navigate(`/compliance/controls?framework=${framework.code}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-sm text-neutral-500">Cargando frameworks...</p>
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
            <span className="text-neutral-900 dark:text-white">Frameworks</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Frameworks de Cumplimiento
          </h1>
          <p className="text-neutral-500 mt-1">
            Gestiona y monitorea el cumplimiento de estándares regulatorios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/compliance"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats frameworks={frameworks} />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar frameworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
        <button
          onClick={() => setShowActiveOnly(!showActiveOnly)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
            showActiveOnly
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
          )}
        >
          <Filter className="w-4 h-4" />
          {showActiveOnly ? 'Solo Activos' : 'Todos'}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Frameworks Grid */}
        <div className={cn('space-y-4', selectedFramework ? 'lg:col-span-2' : 'lg:col-span-3')}>
          <div className={cn(
            'grid gap-4',
            selectedFramework ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          )}>
            {filteredFrameworks.map(framework => (
              <FrameworkCard
                key={framework.id}
                framework={framework}
                onSelect={() => handleFrameworkSelect(framework)}
              />
            ))}
          </div>

          {filteredFrameworks.length === 0 && (
            <div className="glass-card p-12 rounded-2xl text-center">
              <Info className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No se encontraron frameworks
              </h3>
              <p className="text-neutral-500 text-sm">
                {searchQuery
                  ? 'Intenta con otros términos de búsqueda'
                  : 'No hay frameworks configurados en el sistema'}
              </p>
            </div>
          )}
        </div>

        {/* Side Panel - Category Breakdown */}
        {selectedFramework && (
          <div className="space-y-4">
            <CategoryBreakdown framework={selectedFramework} />
            <div className="glass-card p-4 rounded-2xl">
              <button
                onClick={() => handleNavigateToFramework(selectedFramework)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Ver Controles
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Chart */}
      {frameworks.length > 1 && !selectedFramework && (
        <ComparisonChart frameworks={frameworks} />
      )}

      {/* Information Banner */}
      <div className="glass-card p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Info className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Sobre los Frameworks de Cumplimiento
            </h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Cada framework contiene un conjunto de controles y requisitos que deben implementarse para alcanzar la certificación.
              El score de cumplimiento se calcula automáticamente basándose en los controles implementados y su efectividad.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> 80%+ Cumplimiento Óptimo
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" /> 60-79% En Progreso
              </span>
              <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> &lt;60% Requiere Atención
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplianceFrameworks
