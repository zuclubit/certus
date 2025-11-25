import { useState } from 'react'
import { Settings as SettingsIcon, Shield, Database, Bell, Save, RotateCcw } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ValidationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  severity: 'error' | 'warning' | 'info'
}

interface CatalogConfig {
  id: string
  code: string
  name: string
  autoUpdate: boolean
  strictValidation: boolean
  notifyChanges: boolean
  validationRules: ValidationRule[]
}

export function CatalogsConfig() {
  const [configs, setConfigs] = useState<CatalogConfig[]>([
    {
      id: '1',
      code: 'CAT_AFORES',
      name: 'Catálogo de AFOREs',
      autoUpdate: true,
      strictValidation: true,
      notifyChanges: true,
      validationRules: [
        {
          id: 'r1',
          name: 'Validar código único',
          description: 'Verifica que no existan códigos duplicados',
          enabled: true,
          severity: 'error',
        },
        {
          id: 'r2',
          name: 'Validar formato RFC',
          description: 'Valida que el RFC tenga formato correcto',
          enabled: true,
          severity: 'error',
        },
        {
          id: 'r3',
          name: 'Verificar registro CONSAR',
          description: 'Confirma que la AFORE esté registrada',
          enabled: true,
          severity: 'warning',
        },
      ],
    },
    {
      id: '2',
      code: 'CAT_MUNICIPIOS',
      name: 'Catálogo de Municipios',
      autoUpdate: false,
      strictValidation: true,
      notifyChanges: false,
      validationRules: [
        {
          id: 'r4',
          name: 'Validar clave INEGI',
          description: 'Verifica formato de clave INEGI',
          enabled: true,
          severity: 'error',
        },
        {
          id: 'r5',
          name: 'Validar entidad federativa',
          description: 'Confirma que la entidad existe',
          enabled: true,
          severity: 'error',
        },
        {
          id: 'r6',
          name: 'Verificar cambios recientes',
          description: 'Alerta sobre municipios creados recientemente',
          enabled: false,
          severity: 'info',
        },
      ],
    },
  ])

  const [hasChanges, setHasChanges] = useState(false)

  const toggleConfig = (catalogId: string, field: keyof CatalogConfig) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.id === catalogId
          ? { ...config, [field]: !config[field as string] }
          : config
      )
    )
    setHasChanges(true)
  }

  const toggleRule = (catalogId: string, ruleId: string) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.id === catalogId
          ? {
              ...config,
              validationRules: config.validationRules.map((rule) =>
                rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
              ),
            }
          : config
      )
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    // TODO: Implementar guardado
    console.log('Saving configs:', configs)
    setHasChanges(false)
  }

  const handleReset = () => {
    // TODO: Implementar reset
    console.log('Resetting to defaults')
    setHasChanges(false)
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración de Catálogos"
        description="Configura validaciones y reglas de integridad"
        icon={SettingsIcon}
        actions={
          hasChanges && (
            <>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
                Descartar cambios
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </>
          )
        }
      />

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
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50">
            <div>
              <h4 className="font-medium text-neutral-900">Modo de validación estricto</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Rechaza automáticamente registros con errores de validación
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50">
            <div>
              <h4 className="font-medium text-neutral-900">Detección de duplicados</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Busca automáticamente registros duplicados en importaciones
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50">
            <div>
              <h4 className="font-medium text-neutral-900">Versionamiento automático</h4>
              <p className="text-sm text-neutral-600 mt-1">
                Crea versiones automáticamente al actualizar catálogos
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Catalog-specific configs */}
      <div className="space-y-4">
        {configs.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {config.name}
                  </CardTitle>
                  <CardDescription>{config.code}</CardDescription>
                </div>
                <Badge variant="neutral">{config.validationRules.length} reglas</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Catalog options */}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">Auto-actualizar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.autoUpdate}
                    onChange={() => toggleConfig(config.id, 'autoUpdate')}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">Validación estricta</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.strictValidation}
                    onChange={() => toggleConfig(config.id, 'strictValidation')}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">Notificar cambios</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.notifyChanges}
                    onChange={() => toggleConfig(config.id, 'notifyChanges')}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Validation rules */}
              <div>
                <h4 className="font-medium text-neutral-900 mb-3">Reglas de validación</h4>
                <div className="space-y-2">
                  {config.validationRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-lg border transition-all ${
                        rule.enabled
                          ? 'border-primary-200 bg-primary-50'
                          : 'border-neutral-200 bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => toggleRule(config.id, rule.id)}
                            className="h-4 w-4 mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-neutral-900">{rule.name}</h5>
                              {getSeverityBadge(rule.severity)}
                            </div>
                            <p className="text-sm text-neutral-600">{rule.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save reminder */}
      {hasChanges && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">Tienes cambios sin guardar</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    No olvides guardar tus cambios antes de salir
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Descartar
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4" />
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
