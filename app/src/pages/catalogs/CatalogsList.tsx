import { useState } from 'react'
import { Database, Upload, Download, RefreshCw, Search, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Mock data - En producción vendría del API
const mockCatalogs = [
  {
    id: '1',
    code: 'CAT_AFORES',
    name: 'Catálogo de AFOREs',
    description: 'Listado oficial de AFOREs registradas ante CONSAR',
    recordCount: 145,
    lastUpdate: '2025-11-20T10:30:00',
    status: 'active',
    version: '2025.11',
  },
  {
    id: '2',
    code: 'CAT_MUNICIPIOS',
    name: 'Catálogo de Municipios',
    description: 'Catálogo completo de municipios de México',
    recordCount: 2469,
    lastUpdate: '2025-11-15T14:22:00',
    status: 'active',
    version: '2025.11',
  },
  {
    id: '3',
    code: 'CAT_ENTIDADES',
    name: 'Catálogo de Entidades Federativas',
    description: 'Estados de la República Mexicana',
    recordCount: 32,
    lastUpdate: '2025-11-10T09:15:00',
    status: 'active',
    version: '2025.11',
  },
  {
    id: '4',
    code: 'CAT_TIPOS_TRABAJADOR',
    name: 'Tipos de Trabajador',
    description: 'Clasificación de tipos de trabajador según normativa',
    recordCount: 12,
    lastUpdate: '2025-10-28T16:45:00',
    status: 'outdated',
    version: '2025.10',
  },
  {
    id: '5',
    code: 'CAT_MOVIMIENTOS',
    name: 'Catálogo de Movimientos',
    description: 'Tipos de movimientos afiliatorios permitidos',
    recordCount: 28,
    lastUpdate: '2025-11-18T11:20:00',
    status: 'active',
    version: '2025.11',
  },
]

export function CatalogsList() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCatalogs = mockCatalogs.filter(
    (catalog) =>
      catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalog.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleImport = () => {
    // TODO: Implementar importación
    console.log('Import catalogs')
  }

  const handleExport = () => {
    // TODO: Implementar exportación
    console.log('Export catalogs')
  }

  const handleRefresh = () => {
    // TODO: Implementar refresh
    console.log('Refresh catalogs')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogos CONSAR"
        description="Gestión de catálogos normativos y de referencia"
        icon={Database}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="primary" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4" />
              Importar
            </Button>
          </>
        }
      />

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar catálogos por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="ghost" size="sm">
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Catalogs grid */}
      {filteredCatalogs.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Database}
              title="No se encontraron catálogos"
              description="No hay catálogos que coincidan con tu búsqueda. Intenta con otros términos."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCatalogs.map((catalog) => (
            <Card key={catalog.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{catalog.name}</CardTitle>
                    <p className="text-sm text-neutral-500 mt-1">
                      {catalog.code}
                    </p>
                  </div>
                  <Badge
                    variant={catalog.status === 'active' ? 'success' : 'warning'}
                  >
                    {catalog.status === 'active' ? 'Vigente' : 'Desactualizado'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-600">{catalog.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Registros:</span>
                  <span className="font-semibold text-neutral-900">
                    {catalog.recordCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Versión:</span>
                  <span className="font-semibold text-neutral-900">
                    {catalog.version}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">Actualizado:</span>
                  <span className="text-neutral-600">
                    {new Date(catalog.lastUpdate).toLocaleDateString('es-MX')}
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    Ver detalles
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
