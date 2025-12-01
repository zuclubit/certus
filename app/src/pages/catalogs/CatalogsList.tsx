import { useState, useMemo } from 'react'
import { Database, Upload, Download, RefreshCw, Search, AlertCircle, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useCatalogs } from '@/hooks/useCatalogs'
import type { Catalog } from '@/types'

export function CatalogsList() {
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch catalogs from real API
  const { data: catalogs = [], isLoading, error, refetch } = useCatalogs()

  // Filter catalogs based on search query
  const filteredCatalogs = useMemo(() => {
    if (!searchQuery) return catalogs
    const query = searchQuery.toLowerCase()
    return catalogs.filter(
      (catalog: Catalog) =>
        catalog.name.toLowerCase().includes(query) ||
        catalog.code.toLowerCase().includes(query)
    )
  }, [catalogs, searchQuery])

  const handleImport = () => {
    // TODO: Implement import functionality
    console.log('Import catalogs')
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export catalogs')
  }

  const handleRefresh = () => {
    refetch()
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

      {/* Loading state */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-neutral-600">Cargando catálogos...</span>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center py-6">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div className="ml-4">
              <p className="font-medium text-red-800">Error al cargar catálogos</p>
              <p className="text-sm text-red-600">{error.message}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Catalogs grid */}
      {!isLoading && !error && filteredCatalogs.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Database}
              title="No se encontraron catálogos"
              description={searchQuery
                ? "No hay catálogos que coincidan con tu búsqueda. Intenta con otros términos."
                : "No hay catálogos disponibles. Contacta al administrador del sistema."}
            />
          </CardContent>
        </Card>
      ) : !isLoading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCatalogs.map((catalog: Catalog) => (
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
                    variant={catalog.isActive ? 'success' : 'warning'}
                  >
                    {catalog.isActive ? 'Vigente' : 'Inactivo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-600">{catalog.description || 'Sin descripción'}</p>

                {catalog.source && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Fuente:</span>
                    <span className="font-semibold text-neutral-900">
                      {catalog.source}
                    </span>
                  </div>
                )}

                {catalog.version && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Versión:</span>
                    <span className="font-semibold text-neutral-900">
                      {catalog.version}
                    </span>
                  </div>
                )}

                {catalog.effectiveFrom && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Vigente desde:</span>
                    <span className="text-neutral-600">
                      {new Date(catalog.effectiveFrom).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                )}

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
