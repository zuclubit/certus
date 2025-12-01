/**
 * CatalogsConfig - Real API Integration
 *
 * Configuration page for catalog validation rules
 * Loads catalogs from API and persists settings locally
 */

import { useState, useEffect, useMemo } from 'react'
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Bell,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useCatalogs } from '@/hooks/useCatalogs'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { Catalog } from '@/types'

// ============================================
// TYPES
// ============================================

interface ValidationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  severity: 'error' | 'warning' | 'info'
}

interface CatalogConfig {
  catalogId: string
  autoUpdate: boolean
  strictValidation: boolean
  notifyChanges: boolean
  validationRules: ValidationRule[]
}

interface GlobalConfig {
  strictMode: boolean
  detectDuplicates: boolean
  autoVersioning: boolean
  notifyOnChanges: boolean
}

// Default validation rules for each catalog
const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'unique_key',
    name: 'Validar clave única',
    description: 'Verifica que no existan claves duplicadas en el catálogo',
    enabled: true,
    severity: 'error',
  },
  {
    id: 'required_fields',
    name: 'Campos requeridos',
    description: 'Valida que las entradas tengan todos los campos requeridos',
    enabled: true,
    severity: 'error',
  },
  {
    id: 'key_format',
    name: 'Formato de clave',
    description: 'Verifica que las claves sigan el formato establecido',
    enabled: true,
    severity: 'warning',
  },
  {
    id: 'consar_registry',
    name: 'Registro CONSAR',
    description: 'Confirma el registro contra catálogos CONSAR oficiales',
    enabled: false,
    severity: 'warning',
  },
  {
    id: 'date_validity',
    name: 'Vigencia de fechas',
    description: 'Valida que las fechas de vigencia sean correctas',
    enabled: true,
    severity: 'info',
  },
]

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  strictMode: true,
  detectDuplicates: true,
  autoVersioning: true,
  notifyOnChanges: false,
}

// Storage keys
const STORAGE_KEY_CATALOG_CONFIGS = 'certus_catalog_configs'
const STORAGE_KEY_GLOBAL_CONFIG = 'certus_catalog_global_config'

// ============================================
// HELPER FUNCTIONS
// ============================================

function loadCatalogConfigs(): Record<string, CatalogConfig> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATALOG_CONFIGS)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveCatalogConfigs(configs: Record<string, CatalogConfig>): void {
  localStorage.setItem(STORAGE_KEY_CATALOG_CONFIGS, JSON.stringify(configs))
}

function loadGlobalConfig(): GlobalConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_GLOBAL_CONFIG)
    return stored ? JSON.parse(stored) : DEFAULT_GLOBAL_CONFIG
  } catch {
    return DEFAULT_GLOBAL_CONFIG
  }
}

function saveGlobalConfig(config: GlobalConfig): void {
  localStorage.setItem(STORAGE_KEY_GLOBAL_CONFIG, JSON.stringify(config))
}

function getDefaultConfigForCatalog(catalogId: string): CatalogConfig {
  return {
    catalogId,
    autoUpdate: false,
    strictValidation: true,
    notifyChanges: false,
    validationRules: DEFAULT_VALIDATION_RULES.map((rule) => ({ ...rule })),
  }
}

// ============================================
// COMPONENT
// ============================================

export function CatalogsConfig() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // Load catalogs from API
  const { data: catalogs = [], isLoading, error, refetch } = useCatalogs()

  // State
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(loadGlobalConfig)
  const [catalogConfigs, setCatalogConfigs] = useState<Record<string, CatalogConfig>>(loadCatalogConfigs)
  const [expandedCatalogs, setExpandedCatalogs] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Initialize configs for catalogs that don't have one
  useEffect(() => {
    if (catalogs.length > 0) {
      const existingConfigs = loadCatalogConfigs()
      let updated = false

      catalogs.forEach((catalog) => {
        if (!existingConfigs[catalog.id]) {
          existingConfigs[catalog.id] = getDefaultConfigForCatalog(catalog.id)
          updated = true
        }
      })

      if (updated) {
        setCatalogConfigs(existingConfigs)
      }
    }
  }, [catalogs])

  // Get config for a specific catalog
  const getCatalogConfig = (catalogId: string): CatalogConfig => {
    return catalogConfigs[catalogId] || getDefaultConfigForCatalog(catalogId)
  }

  // Handlers
  const toggleGlobalConfig = (key: keyof GlobalConfig) => {
    setGlobalConfig((prev) => ({ ...prev, [key]: !prev[key] }))
    setHasChanges(true)
  }

  const toggleCatalogConfig = (catalogId: string, key: keyof Omit<CatalogConfig, 'catalogId' | 'validationRules'>) => {
    setCatalogConfigs((prev) => {
      const config = prev[catalogId] || getDefaultConfigForCatalog(catalogId)
      return {
        ...prev,
        [catalogId]: {
          ...config,
          [key]: !config[key],
        },
      }
    })
    setHasChanges(true)
  }

  const toggleRule = (catalogId: string, ruleId: string) => {
    setCatalogConfigs((prev) => {
      const config = prev[catalogId] || getDefaultConfigForCatalog(catalogId)
      return {
        ...prev,
        [catalogId]: {
          ...config,
          validationRules: config.validationRules.map((rule) =>
            rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
          ),
        },
      }
    })
    setHasChanges(true)
  }

  const toggleCatalogExpanded = (catalogId: string) => {
    setExpandedCatalogs((prev) => {
      const next = new Set(prev)
      if (next.has(catalogId)) {
        next.delete(catalogId)
      } else {
        next.add(catalogId)
      }
      return next
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      saveGlobalConfig(globalConfig)
      saveCatalogConfigs(catalogConfigs)

      setHasChanges(false)
      toast.success('Configuración guardada', {
        description: 'Los cambios se han guardado correctamente',
      })
    } catch (error) {
      toast.error('Error al guardar', {
        description: 'No se pudieron guardar los cambios',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setGlobalConfig(loadGlobalConfig())
    setCatalogConfigs(loadCatalogConfigs())
    setHasChanges(false)
    toast.info('Cambios descartados', {
      description: 'Se han restaurado los valores guardados',
    })
  }

  const handleResetToDefaults = () => {
    setGlobalConfig(DEFAULT_GLOBAL_CONFIG)

    const defaultConfigs: Record<string, CatalogConfig> = {}
    catalogs.forEach((catalog) => {
      defaultConfigs[catalog.id] = getDefaultConfigForCatalog(catalog.id)
    })
    setCatalogConfigs(defaultConfigs)

    setHasChanges(true)
    toast.info('Valores predeterminados', {
      description: 'Se han restaurado los valores por defecto',
    })
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Badge variant="danger">Error</Badge>
      case 'warning':
        return <Badge variant="warning">Advertencia</Badge>
      case 'info':
        return <Badge variant="neutral">Información</Badge>
      default:
        return null
    }
  }

  // Stats
  const stats = useMemo(() => {
    const activeCatalogs = catalogs.filter((c) => c.isActive).length
    const configuredCatalogs = Object.keys(catalogConfigs).length
    const totalRulesEnabled = Object.values(catalogConfigs).reduce(
      (sum, config) => sum + config.validationRules.filter((r) => r.enabled).length,
      0
    )

    return {
      activeCatalogs,
      configuredCatalogs,
      totalRulesEnabled,
    }
  }, [catalogs, catalogConfigs])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración de Catálogos"
        description="Configura validaciones y reglas de integridad"
        icon={SettingsIcon}
        actions={
          hasChanges && (
            <>
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={isSaving}>
                <RotateCcw className="h-4 w-4" />
                Descartar cambios
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </>
          )
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-3 rounded-lg',
                isDark ? 'bg-blue-900/30' : 'bg-blue-50'
              )}>
                <Database className={cn('h-5 w-5', isDark ? 'text-blue-400' : 'text-blue-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                  {stats.activeCatalogs}
                </p>
                <p className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                  Catálogos activos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-3 rounded-lg',
                isDark ? 'bg-green-900/30' : 'bg-green-50'
              )}>
                <Shield className={cn('h-5 w-5', isDark ? 'text-green-400' : 'text-green-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                  {stats.totalRulesEnabled}
                </p>
                <p className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                  Reglas activas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-3 rounded-lg',
                isDark ? 'bg-purple-900/30' : 'bg-purple-50'
              )}>
                <SettingsIcon className={cn('h-5 w-5', isDark ? 'text-purple-400' : 'text-purple-600')} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                  {stats.configuredCatalogs}
                </p>
                <p className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                  Configurados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuración global
          </CardTitle>
          <CardDescription>
            Configuraciones que aplican a todos los catálogos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            'flex items-center justify-between p-4 rounded-lg',
            isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
          )}>
            <div>
              <h4 className={cn('font-medium', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                Modo de validación estricto
              </h4>
              <p className={cn('text-sm mt-1', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                Rechaza automáticamente registros con errores de validación
              </p>
            </div>
            <Switch
              checked={globalConfig.strictMode}
              onCheckedChange={() => toggleGlobalConfig('strictMode')}
            />
          </div>

          <div className={cn(
            'flex items-center justify-between p-4 rounded-lg',
            isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
          )}>
            <div>
              <h4 className={cn('font-medium', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                Detección de duplicados
              </h4>
              <p className={cn('text-sm mt-1', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                Busca automáticamente registros duplicados en importaciones
              </p>
            </div>
            <Switch
              checked={globalConfig.detectDuplicates}
              onCheckedChange={() => toggleGlobalConfig('detectDuplicates')}
            />
          </div>

          <div className={cn(
            'flex items-center justify-between p-4 rounded-lg',
            isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
          )}>
            <div>
              <h4 className={cn('font-medium', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                Versionamiento automático
              </h4>
              <p className={cn('text-sm mt-1', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                Crea versiones automáticamente al actualizar catálogos
              </p>
            </div>
            <Switch
              checked={globalConfig.autoVersioning}
              onCheckedChange={() => toggleGlobalConfig('autoVersioning')}
            />
          </div>

          <div className={cn(
            'flex items-center justify-between p-4 rounded-lg',
            isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
          )}>
            <div>
              <h4 className={cn('font-medium', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                Notificaciones de cambios
              </h4>
              <p className={cn('text-sm mt-1', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                Recibe notificaciones cuando se modifiquen catálogos
              </p>
            </div>
            <Switch
              checked={globalConfig.notifyOnChanges}
              onCheckedChange={() => toggleGlobalConfig('notifyOnChanges')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className={cn('ml-2', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              Cargando catálogos...
            </span>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className={cn(isDark ? 'border-red-800 bg-red-900/20' : 'border-red-200 bg-red-50')}>
          <CardContent className="flex items-center py-6">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div className="ml-4">
              <p className={cn('font-medium', isDark ? 'text-red-300' : 'text-red-800')}>
                Error al cargar catálogos
              </p>
              <p className={cn('text-sm', isDark ? 'text-red-400' : 'text-red-600')}>
                {error.message}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Catalog-specific configs */}
      {!isLoading && !error && catalogs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={cn(
              'text-lg font-semibold',
              isDark ? 'text-neutral-100' : 'text-neutral-900'
            )}>
              Configuración por catálogo
            </h2>
            <Button variant="ghost" size="sm" onClick={handleResetToDefaults}>
              Restaurar valores predeterminados
            </Button>
          </div>

          {catalogs.map((catalog: Catalog) => {
            const config = getCatalogConfig(catalog.id)
            const isExpanded = expandedCatalogs.has(catalog.id)
            const enabledRulesCount = config.validationRules.filter((r) => r.enabled).length

            return (
              <Card key={catalog.id}>
                <CardHeader className="cursor-pointer" onClick={() => toggleCatalogExpanded(catalog.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        isDark ? 'bg-neutral-800' : 'bg-neutral-100'
                      )}>
                        <Database className={cn('h-5 w-5', isDark ? 'text-neutral-400' : 'text-neutral-600')} />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {catalog.name}
                          {catalog.isActive ? (
                            <Badge variant="success" className="ml-2">Activo</Badge>
                          ) : (
                            <Badge variant="neutral" className="ml-2">Inactivo</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{catalog.code}</span>
                          <span>•</span>
                          <span>{catalog.source || 'CONSAR'}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral">{enabledRulesCount} reglas activas</Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-6 pt-0">
                    {/* Catalog options */}
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        isDark ? 'border-neutral-700 bg-neutral-800/30' : 'border-neutral-200'
                      )}>
                        <div className="flex items-center gap-2">
                          <RotateCcw className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-500')} />
                          <span className={cn('text-sm font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                            Auto-actualizar
                          </span>
                        </div>
                        <Switch
                          checked={config.autoUpdate}
                          onCheckedChange={() => toggleCatalogConfig(catalog.id, 'autoUpdate')}
                        />
                      </div>

                      <div className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        isDark ? 'border-neutral-700 bg-neutral-800/30' : 'border-neutral-200'
                      )}>
                        <div className="flex items-center gap-2">
                          <Shield className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-500')} />
                          <span className={cn('text-sm font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                            Validación estricta
                          </span>
                        </div>
                        <Switch
                          checked={config.strictValidation}
                          onCheckedChange={() => toggleCatalogConfig(catalog.id, 'strictValidation')}
                        />
                      </div>

                      <div className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        isDark ? 'border-neutral-700 bg-neutral-800/30' : 'border-neutral-200'
                      )}>
                        <div className="flex items-center gap-2">
                          <Bell className={cn('h-4 w-4', isDark ? 'text-neutral-500' : 'text-neutral-500')} />
                          <span className={cn('text-sm font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
                            Notificar cambios
                          </span>
                        </div>
                        <Switch
                          checked={config.notifyChanges}
                          onCheckedChange={() => toggleCatalogConfig(catalog.id, 'notifyChanges')}
                        />
                      </div>
                    </div>

                    {/* Validation rules */}
                    <div>
                      <h4 className={cn('font-medium mb-3', isDark ? 'text-neutral-200' : 'text-neutral-900')}>
                        Reglas de validación
                      </h4>
                      <div className="space-y-2">
                        {config.validationRules.map((rule) => (
                          <div
                            key={rule.id}
                            className={cn(
                              'p-4 rounded-lg border transition-all',
                              rule.enabled
                                ? isDark
                                  ? 'border-primary/30 bg-primary/5'
                                  : 'border-primary/30 bg-primary/5'
                                : isDark
                                  ? 'border-neutral-700 bg-neutral-800/30'
                                  : 'border-neutral-200 bg-neutral-50'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Switch
                                  checked={rule.enabled}
                                  onCheckedChange={() => toggleRule(catalog.id, rule.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className={cn(
                                      'font-medium',
                                      isDark ? 'text-neutral-100' : 'text-neutral-900'
                                    )}>
                                      {rule.name}
                                    </h5>
                                    {getSeverityBadge(rule.severity)}
                                  </div>
                                  <p className={cn(
                                    'text-sm',
                                    isDark ? 'text-neutral-400' : 'text-neutral-600'
                                  )}>
                                    {rule.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && catalogs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className={cn('h-12 w-12 mb-4', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
            <h3 className={cn('text-lg font-medium mb-2', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
              No hay catálogos disponibles
            </h3>
            <p className={cn('text-sm text-center', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
              Crea un catálogo para comenzar a configurar las reglas de validación
            </p>
          </CardContent>
        </Card>
      )}

      {/* Save reminder */}
      {hasChanges && (
        <Card className={cn(
          isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  isDark ? 'bg-amber-900/50' : 'bg-amber-100'
                )}>
                  <Bell className={cn('h-5 w-5', isDark ? 'text-amber-400' : 'text-amber-600')} />
                </div>
                <div>
                  <h4 className={cn('font-semibold', isDark ? 'text-amber-300' : 'text-amber-900')}>
                    Tienes cambios sin guardar
                  </h4>
                  <p className={cn('text-sm mt-1', isDark ? 'text-amber-400' : 'text-amber-700')}>
                    No olvides guardar tus cambios antes de salir
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset} disabled={isSaving}>
                  Descartar
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar ahora
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
