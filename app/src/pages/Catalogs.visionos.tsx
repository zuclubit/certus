/**
 * Catalogs Page - Enterprise 2025
 *
 * Página de catálogos completamente rediseñada replicando:
 * - Estructura visual de Dashboard y Validations
 * - Componentes reutilizables y modulares
 * - Glass morphism y depth layers consistentes
 * - Header con Lottie icon animado
 * - Stats cards con el mismo diseño
 * - Navigation cards premium
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Database,
  List,
  Upload,
  Download,
  FileText,
  Settings as SettingsIcon,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { PremiumButtonV2 } from '@/components/ui'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import { LottieIcon } from '@/components/ui/LottieIcon'
import { getAnimation } from '@/lib/lottiePreloader'
import {
  CreateCatalogModal,
  type CatalogFormData,
} from '@/components/catalogs/CatalogModals.visionos'

export function CatalogsVisionOS() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const catalogsAnimationData = getAnimation('catalogs')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [catalogToDelete, setCatalogToDelete] = useState<any>(null)

  // ============================================================================
  // MOCK DATA - Matching Dashboard/Validations patterns
  // ============================================================================

  const statistics = {
    total: 12,
    active: 10,
    outdated: 2,
    records: 4523,
    updatesPending: 3,
    automationEnabled: 8,
  }

  const catalogModules = [
    {
      id: 'list',
      title: 'Gestión de Catálogos',
      description: 'Administra catálogos CONSAR con control de versiones y auditoría',
      icon: List,
      path: '/catalogs/list',
      color: 'blue',
    },
    {
      id: 'import',
      title: 'Importar Catálogos',
      description: 'Importa catálogos desde Excel, CSV o XML con validación automática',
      icon: Upload,
      path: '/catalogs/import',
      color: 'green',
    },
    {
      id: 'export',
      title: 'Exportar Catálogos',
      description: 'Exporta catálogos en múltiples formatos para respaldo y análisis',
      icon: Download,
      path: '/catalogs/export',
      color: 'purple',
    },
    {
      id: 'normative',
      title: 'Cambios Normativos',
      description: 'Revisa y aplica actualizaciones normativas CONSAR',
      icon: FileText,
      path: '/normative',
      color: 'yellow',
    },
    {
      id: 'config',
      title: 'Configuración',
      description: 'Configura validaciones, reglas de integridad y automatización',
      icon: SettingsIcon,
      path: '/catalogs/config',
      color: 'cyan',
    },
    {
      id: 'monitoring',
      title: 'Monitoreo',
      description: 'Dashboard de métricas en tiempo real y alertas',
      icon: Activity,
      path: '#monitoring',
      color: 'indigo',
    },
  ]

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateCatalog = (data: CatalogFormData) => {
    console.log('Creating catalog:', data)
    // TODO: Implement API call
  }

  const handleDeleteCatalog = (catalog: any) => {
    setCatalogToDelete(catalog)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = (justification: string) => {
    console.log('Deleting catalog:', catalogToDelete?.code, 'Justification:', justification)
    // TODO: Implement API call with audit trail
    setShowDeleteModal(false)
    setCatalogToDelete(null)
  }

  const handleModuleClick = (module: typeof catalogModules[0]) => {
    navigate(module.path)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* HEADER SECTION (Matching Validations structure) */}
      {/* ================================================================ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Lottie Icon (same as Validations) */}
          {catalogsAnimationData && (
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
                  animationData={catalogsAnimationData}
                  isActive={true}
                  loop={true}
                  autoplay={true}
                  speed={1.0}
                  className="transition-all duration-300"
                />
              </div>
            </div>
          )}

          {/* Title and Description */}
          <div>
            <h1
              className={cn(
                'ios-heading-title1 ios-text-glass-subtle lg:ios-heading-large',
                isDark ? 'text-neutral-100' : 'text-neutral-900'
              )}
              data-text="Catálogos"
            >
              Catálogos
            </h1>
            <p
              className={cn(
                'mt-1 ios-text-footnote ios-font-medium lg:ios-text-callout',
                isDark ? 'text-neutral-400' : 'text-neutral-600'
              )}
            >
              Centro de administración de catálogos CONSAR
            </p>
          </div>
        </div>

        {/* Action Button (matching Validations) */}
        <PremiumButtonV2
          label="Nuevo Catálogo"
          icon={Plus}
          size="lg"
          onClick={() => setShowCreateModal(true)}
        />
      </div>

      {/* ================================================================ */}
      {/* STATS CARDS (Matching Validations grid layout) */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Catálogos Activos',
            value: `${statistics.active}/${statistics.total}`,
            icon: Database,
            color: 'blue',
          },
          {
            label: 'Registros Totales',
            value: statistics.records.toLocaleString(),
            icon: BarChart3,
            color: 'green',
          },
          {
            label: 'Actualizaciones Pendientes',
            value: statistics.updatesPending.toString(),
            icon: Clock,
            color: 'yellow',
          },
          {
            label: 'Automatización Activa',
            value: `${statistics.automationEnabled}/${statistics.total}`,
            icon: Zap,
            color: 'purple',
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                {/* Left: Label and Value */}
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-neutral-400' : 'text-neutral-500'
                    )}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={cn(
                      'mt-2 text-3xl font-bold',
                      isDark ? 'text-neutral-100' : 'text-neutral-900'
                    )}
                  >
                    {stat.value}
                  </p>
                </div>

                {/* Right: Icon with glass effect */}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-[16px]',
                    'glass-ultra-clear depth-layer-2 fresnel-edge'
                  )}
                  style={{
                    background: isDark
                      ? 'rgba(45, 45, 55, 0.5)'
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.1)'
                      : '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <stat.icon
                    className={cn(
                      'h-6 w-6',
                      stat.color === 'blue' && (isDark ? 'text-blue-400' : 'text-blue-600'),
                      stat.color === 'green' && (isDark ? 'text-green-400' : 'text-green-600'),
                      stat.color === 'yellow' && (isDark ? 'text-yellow-400' : 'text-yellow-600'),
                      stat.color === 'purple' && (isDark ? 'text-purple-400' : 'text-purple-600')
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ================================================================ */}
      {/* MODULE CARDS (Using Card component like Validations) */}
      {/* ================================================================ */}
      <Card>
        <CardHeader>
          <CardTitle>Módulos de Catálogos</CardTitle>
          <CardDescription>
            Accede a las diferentes funcionalidades del sistema de catálogos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {catalogModules.map((module) => (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module)}
                className={cn(
                  'p-4 rounded-[16px] border-2 transition-all duration-300 cursor-pointer',
                  'hover:scale-[1.02] hover:shadow-lg',
                  isDark
                    ? 'border-neutral-700 bg-neutral-800/30 hover:border-neutral-600'
                    : 'border-neutral-200 bg-white/50 hover:border-neutral-300'
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-[14px]',
                      'glass-ultra-clear depth-layer-2 fresnel-edge'
                    )}
                    style={{
                      background: isDark
                        ? 'rgba(45, 45, 55, 0.5)'
                        : 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(12px)',
                      border: isDark
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    <module.icon
                      className={cn(
                        'h-6 w-6',
                        module.color === 'blue' && (isDark ? 'text-blue-400' : 'text-blue-600'),
                        module.color === 'green' && (isDark ? 'text-green-400' : 'text-green-600'),
                        module.color === 'purple' && (isDark ? 'text-purple-400' : 'text-purple-600'),
                        module.color === 'yellow' && (isDark ? 'text-yellow-400' : 'text-yellow-600'),
                        module.color === 'cyan' && (isDark ? 'text-cyan-400' : 'text-cyan-600'),
                        module.color === 'indigo' && (isDark ? 'text-indigo-400' : 'text-indigo-600')
                      )}
                    />
                  </div>

                  {/* Title */}
                  <div className="flex-1">
                    <h3
                      className={cn(
                        'font-semibold text-sm mb-1',
                        isDark ? 'text-neutral-100' : 'text-neutral-900'
                      )}
                    >
                      {module.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p
                  className={cn(
                    'text-xs leading-relaxed',
                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                  )}
                >
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ================================================================ */}
      {/* QUICK STATS GRID (Additional info) */}
      {/* ================================================================ */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { catalog: 'CAT_AFORES', action: 'Actualizado', time: 'Hace 2h', status: 'success' },
                { catalog: 'CAT_MUNICIPIOS', action: 'Importado', time: 'Hace 5h', status: 'success' },
                { catalog: 'CAT_TIPOS_TRABAJADOR', action: 'Validación', time: 'Hace 1d', status: 'warning' },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', isDark ? 'text-neutral-200' : 'text-neutral-900')}>
                      {activity.catalog}
                    </p>
                    <p className={cn('text-xs', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
                      {activity.action} • {activity.time}
                    </p>
                  </div>
                  {activity.status === 'success' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                  {activity.status === 'warning' && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Estado del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Sincronización', status: 'Activa', color: 'green' },
                { label: 'Validación', status: 'Normal', color: 'green' },
                { label: 'Respaldo', status: 'OK', color: 'green' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        item.color === 'green' && 'bg-green-500'
                      )}
                      style={{
                        boxShadow: item.color === 'green' ? '0 0 8px rgba(34, 197, 94, 0.6)' : undefined,
                      }}
                    />
                    <span className={cn('text-sm font-medium', isDark ? 'text-neutral-200' : 'text-neutral-900')}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button
                onClick={() => console.log('Sync all')}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors text-sm font-medium',
                  isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-900'
                )}
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Sincronizar Todos
                </div>
              </button>
              <button
                onClick={() => navigate('/catalogs/import')}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors text-sm font-medium',
                  isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-900'
                )}
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Importar Catálogo
                </div>
              </button>
              <button
                onClick={() => navigate('/catalogs/export')}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors text-sm font-medium',
                  isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-900'
                )}
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Respaldo
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================================ */}
      {/* MODALS (Using shared components) */}
      {/* ================================================================ */}
      <CreateCatalogModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateCatalog}
      />

      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Eliminar Catálogo"
        description={`¿Está seguro de eliminar el catálogo "${catalogToDelete?.name}"? Esta acción marcará el registro como eliminado y se registrará en el historial de auditoría.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        requireJustification={true}
        justificationLabel="Justificación (requerida por normatividad)"
        justificationPlaceholder="Por favor proporciona una razón detallada para eliminar este catálogo. Esta información se registrará en el historial de auditoría y es requerida por las regulaciones de CONSAR y cumplimiento normativo."
        minJustificationLength={20}
        onConfirm={handleConfirmDelete}
        isLoading={false}
      />
    </div>
  )
}
