import { useState } from 'react'
import { FileText, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// Mock data de cambios normativos
const mockNormativeChanges = [
  {
    id: '1',
    code: 'CIRC-28-25',
    title: 'Circular 28-25: Modificación a disposiciones de aportaciones voluntarias',
    description:
      'Se modifican los criterios para el manejo de aportaciones voluntarias y complementarias de retiro',
    effectiveDate: '2025-12-01',
    publishDate: '2025-11-15',
    status: 'pending',
    priority: 'high',
    affectedValidators: ['V12', 'V15', 'V23'],
    category: 'Aportaciones',
  },
  {
    id: '2',
    code: 'CIRC-27-25',
    title: 'Circular 27-25: Actualización de catálogos de municipios',
    description:
      'Actualización del catálogo de municipios conforme al Marco Geoestadístico 2025',
    effectiveDate: '2025-11-20',
    publishDate: '2025-11-01',
    status: 'active',
    priority: 'medium',
    affectedValidators: ['V06', 'V07'],
    category: 'Catálogos',
  },
  {
    id: '3',
    code: 'CIRC-26-25',
    title: 'Circular 26-25: Nuevos requisitos para traspaso entre AFOREs',
    description:
      'Se establecen nuevos requisitos y validaciones para procesos de traspaso',
    effectiveDate: '2025-10-15',
    publishDate: '2025-09-30',
    status: 'active',
    priority: 'high',
    affectedValidators: ['V18', 'V19', 'V20', 'V21'],
    category: 'Traspasos',
  },
  {
    id: '4',
    code: 'CIRC-25-25',
    title: 'Circular 25-25: Modificación al formato de archivo NOMINA',
    description:
      'Actualización de estructura y longitud de campos en archivos NOMINA',
    effectiveDate: '2025-09-01',
    publishDate: '2025-08-15',
    status: 'archived',
    priority: 'high',
    affectedValidators: ['V01', 'V02', 'V03', 'V04'],
    category: 'Estructura',
  },
]

export function NormativeChanges() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredChanges = mockNormativeChanges.filter((change) => {
    const matchesSearch =
      change.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      change.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || change.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Vigente
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        )
      case 'archived':
        return (
          <Badge variant="neutral" className="flex items-center gap-1">
            Archivado
          </Badge>
        )
      default:
        return null
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="danger">Alta</Badge>
      case 'medium':
        return <Badge variant="warning">Media</Badge>
      case 'low':
        return <Badge variant="neutral">Baja</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cambios Normativos CONSAR"
        description="Seguimiento y gestión de disposiciones normativas"
        icon={FileText}
        actions={
          <Button variant="primary" size="sm">
            Registrar cambio
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Buscar cambios normativos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 rounded-lg border border-neutral-300 px-4 text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="active">Vigentes</option>
                <option value="archived">Archivados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changes list */}
      <div className="space-y-4">
        {filteredChanges.map((change) => (
          <Card key={change.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">{change.code}</CardTitle>
                    {getStatusBadge(change.status)}
                    {getPriorityBadge(change.priority)}
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    {change.title}
                  </h3>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-600">{change.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-neutral-100">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Categoría</p>
                  <Badge variant="neutral">{change.category}</Badge>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Fecha de publicación</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {new Date(change.publishDate).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Fecha de vigencia</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {new Date(change.effectiveDate).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">
                    Validadores afectados
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {change.affectedValidators.map((validator) => (
                      <Badge
                        key={validator}
                        variant="primary"
                        className="text-xs"
                      >
                        {validator}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm">
                  Ver detalle
                </Button>
                <Button variant="ghost" size="sm">
                  Descargar circular
                </Button>
                {change.status === 'pending' && (
                  <Button variant="primary" size="sm">
                    Aplicar cambios
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChanges.length === 0 && (
        <Card>
          <CardContent>
            <div className="text-center py-12 text-neutral-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <p>No se encontraron cambios normativos que coincidan con tu búsqueda</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
