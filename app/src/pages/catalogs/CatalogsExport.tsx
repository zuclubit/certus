import { useState } from 'react'
import { Download, FileSpreadsheet, Table2, FileCode, Database, Filter, Calendar } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type ExportFormat = 'excel' | 'csv' | 'xml' | 'json'

interface CatalogOption {
  id: string
  code: string
  name: string
  recordCount: number
  version: string
  selected: boolean
}

export function CatalogsExport() {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel')
  const [searchQuery, setSearchQuery] = useState('')
  const [includeHistory, setIncludeHistory] = useState(false)
  const [dateRange, setDateRange] = useState<'all' | 'current' | 'custom'>('current')

  const [catalogs, setCatalogs] = useState<CatalogOption[]>([
    {
      id: '1',
      code: 'CAT_AFORES',
      name: 'Catálogo de AFOREs',
      recordCount: 145,
      version: '2025.11',
      selected: true,
    },
    {
      id: '2',
      code: 'CAT_MUNICIPIOS',
      name: 'Catálogo de Municipios',
      recordCount: 2469,
      version: '2025.11',
      selected: true,
    },
    {
      id: '3',
      code: 'CAT_ENTIDADES',
      name: 'Catálogo de Entidades Federativas',
      recordCount: 32,
      version: '2025.11',
      selected: false,
    },
    {
      id: '4',
      code: 'CAT_TIPOS_TRABAJADOR',
      name: 'Tipos de Trabajador',
      recordCount: 12,
      version: '2025.10',
      selected: false,
    },
    {
      id: '5',
      code: 'CAT_MOVIMIENTOS',
      name: 'Catálogo de Movimientos',
      recordCount: 28,
      version: '2025.11',
      selected: true,
    },
    {
      id: '6',
      code: 'CAT_NACIONALIDADES',
      name: 'Catálogo de Nacionalidades',
      recordCount: 195,
      version: '2025.11',
      selected: false,
    },
    {
      id: '7',
      code: 'CAT_BANCOS',
      name: 'Catálogo de Instituciones Bancarias',
      recordCount: 48,
      version: '2025.11',
      selected: false,
    },
    {
      id: '8',
      code: 'CAT_REGIMENES',
      name: 'Catálogo de Regímenes',
      recordCount: 8,
      version: '2025.11',
      selected: false,
    },
  ])

  const formats = [
    {
      id: 'excel' as ExportFormat,
      name: 'Excel',
      description: 'Archivo .xlsx con formato',
      icon: FileSpreadsheet,
      extension: '.xlsx',
      color: 'bg-green-50 text-green-600',
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV',
      description: 'Valores separados por coma',
      icon: Table2,
      extension: '.csv',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'xml' as ExportFormat,
      name: 'XML',
      description: 'Formato XML estructurado',
      icon: FileCode,
      extension: '.xml',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      description: 'JavaScript Object Notation',
      icon: FileCode,
      extension: '.json',
      color: 'bg-amber-50 text-amber-600',
    },
  ]

  const filteredCatalogs = catalogs.filter(
    (catalog) =>
      catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalog.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleCatalog = (id: string) => {
    setCatalogs((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, selected: !cat.selected } : cat))
    )
  }

  const selectAll = () => {
    setCatalogs((prev) => prev.map((cat) => ({ ...cat, selected: true })))
  }

  const deselectAll = () => {
    setCatalogs((prev) => prev.map((cat) => ({ ...cat, selected: false })))
  }

  const handleExport = () => {
    // TODO: Implementar exportación real
    const selectedCatalogs = catalogs.filter((cat) => cat.selected)
    console.log('Exporting:', {
      format: selectedFormat,
      catalogs: selectedCatalogs.map((c) => c.code),
      includeHistory,
      dateRange,
    })
  }

  const selectedCount = catalogs.filter((c) => c.selected).length
  const totalRecords = catalogs
    .filter((c) => c.selected)
    .reduce((sum, cat) => sum + cat.recordCount, 0)
  const selectedFormatConfig = formats.find((f) => f.id === selectedFormat)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exportar Catálogos"
        description="Exporta catálogos CONSAR en diferentes formatos"
        icon={Download}
      />

      {/* Format selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selecciona el formato de exportación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            {formats.map((format) => {
              const Icon = format.icon
              const isSelected = selectedFormat === format.id
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${format.color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-neutral-900 mb-1">{format.name}</h3>
                  <p className="text-xs text-neutral-600">{format.description}</p>
                  <Badge variant="neutral" className="mt-2 text-xs">
                    {format.extension}
                  </Badge>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opciones de exportación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date range */}
          <div>
            <label className="text-sm font-medium text-neutral-700 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Rango de versiones
            </label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setDateRange('all')}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  dateRange === 'all'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                Todas las versiones
              </button>
              <button
                onClick={() => setDateRange('current')}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  dateRange === 'current'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                Solo versión actual
              </button>
              <button
                onClick={() => setDateRange('custom')}
                className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                  dateRange === 'custom'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                Personalizado
              </button>
            </div>
          </div>

          {/* Include history */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50">
            <input
              type="checkbox"
              id="include-history"
              checked={includeHistory}
              onChange={(e) => setIncludeHistory(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="include-history" className="text-sm text-neutral-700 cursor-pointer">
              Incluir historial de cambios y auditoría
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Catalog selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Selecciona catálogos a exportar</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Seleccionar todos
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                Deseleccionar todos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar catálogos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Catalog list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCatalogs.map((catalog) => (
              <button
                key={catalog.id}
                onClick={() => toggleCatalog(catalog.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  catalog.selected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={catalog.selected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <Database className="h-5 w-5 text-neutral-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-neutral-900">{catalog.name}</h4>
                      <Badge variant="neutral" className="text-xs">
                        {catalog.code}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>{catalog.recordCount.toLocaleString()} registros</span>
                      <span>v{catalog.version}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export summary */}
      {selectedCount > 0 && (
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-primary-900 mb-2">Resumen de exportación</h3>
                <div className="space-y-1 text-sm text-primary-800">
                  <p>
                    • <strong>{selectedCount}</strong> {selectedCount === 1 ? 'catálogo seleccionado' : 'catálogos seleccionados'}
                  </p>
                  <p>
                    • <strong>{totalRecords.toLocaleString()}</strong> registros totales
                  </p>
                  <p>
                    • Formato: <strong>{selectedFormatConfig?.name}</strong> ({selectedFormatConfig?.extension})
                  </p>
                  {includeHistory && <p>• Incluye historial de cambios</p>}
                </div>
              </div>
              <Button variant="primary" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Exportar ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
