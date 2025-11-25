import { useState } from 'react'
import { GitBranch, Play, Pause, Edit, Trash2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock data de flujos de validación
const mockFlows = [
  {
    id: '1',
    name: 'Flujo NOMINA Estándar',
    description: 'Validación completa de archivos NOMINA con 37 validadores',
    validators: 37,
    status: 'active',
    lastModified: '2025-11-15T10:30:00',
    executions: 1245,
    successRate: 94.2,
  },
  {
    id: '2',
    name: 'Flujo CONTABLE Completo',
    description: 'Validación de archivos CONTABLE con validadores especializados',
    validators: 28,
    status: 'active',
    lastModified: '2025-11-10T14:22:00',
    executions: 856,
    successRate: 97.5,
  },
  {
    id: '3',
    name: 'Flujo REGULARIZACION',
    description: 'Validación específica para archivos de regularización',
    validators: 22,
    status: 'active',
    lastModified: '2025-11-08T09:15:00',
    executions: 423,
    successRate: 89.3,
  },
  {
    id: '4',
    name: 'Flujo Express (Pruebas)',
    description: 'Flujo reducido para pruebas rápidas con validadores críticos',
    validators: 12,
    status: 'paused',
    lastModified: '2025-10-28T16:45:00',
    executions: 89,
    successRate: 92.1,
  },
]

export function ValidationFlows() {
  const [flows, setFlows] = useState(mockFlows)

  const handleCreateFlow = () => {
    // TODO: Implementar creación de flujo
    console.log('Create new flow')
  }

  const handleEditFlow = (flowId: string) => {
    // TODO: Implementar edición
    console.log('Edit flow:', flowId)
  }

  const handleToggleFlow = (flowId: string) => {
    // TODO: Implementar toggle
    setFlows((prevFlows) =>
      prevFlows.map((flow) =>
        flow.id === flowId
          ? {
              ...flow,
              status: flow.status === 'active' ? 'paused' : 'active',
            }
          : flow
      )
    )
  }

  const handleDeleteFlow = (flowId: string) => {
    // TODO: Implementar eliminación con confirmación
    console.log('Delete flow:', flowId)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flujos de Validación"
        description="Gestión de workflows y secuencias de validadores"
        icon={GitBranch}
        actions={
          <Button variant="primary" size="sm" onClick={handleCreateFlow}>
            <Plus className="h-4 w-4" />
            Nuevo flujo
          </Button>
        }
      />

      {flows.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={GitBranch}
              title="No hay flujos configurados"
              description="Crea tu primer flujo de validación para automatizar tus procesos"
              action={{
                label: 'Crear flujo',
                onClick: handleCreateFlow,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {flows.map((flow) => (
            <Card key={flow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{flow.name}</CardTitle>
                    <p className="text-sm text-neutral-500 mt-1">
                      {flow.description}
                    </p>
                  </div>
                  <Badge
                    variant={flow.status === 'active' ? 'success' : 'warning'}
                  >
                    {flow.status === 'active' ? 'Activo' : 'Pausado'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-primary-600">
                      {flow.validators}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">Validadores</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-neutral-900">
                      {flow.executions.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">Ejecuciones</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-2xl font-bold text-success-600">
                      {flow.successRate}%
                    </p>
                    <p className="text-xs text-neutral-600 mt-1">Éxito</p>
                  </div>
                </div>

                {/* Info adicional */}
                <div className="flex items-center justify-between text-sm pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500">Última modificación:</span>
                  <span className="text-neutral-900">
                    {new Date(flow.lastModified).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 justify-end bg-neutral-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditFlow(flow.id)}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleFlow(flow.id)}
                >
                  {flow.status === 'active' ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Activar
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFlow(flow.id)}
                  className="text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
