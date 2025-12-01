/**
 * CatalogsExport - Real API Integration with Direct Download
 *
 * Exports catalogs with entries to various formats
 * Uses local generation for immediate download
 */

import { useState, useEffect, useMemo } from 'react'
import { Download, FileSpreadsheet, Table2, FileCode, Database, Filter, Calendar, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import * as ExcelJS from 'exceljs'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useCatalogs, useCatalogDetail } from '@/hooks/useCatalogs'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { Catalog, CatalogEntry } from '@/types'

type ExportFormat = 'excel' | 'csv' | 'xml' | 'json'

interface CatalogOption {
  id: string
  code: string
  name: string
  description?: string
  recordCount: number
  version: string
  selected: boolean
  isActive: boolean
}

interface ExportData {
  catalog: {
    code: string
    name: string
    version: string
    description?: string
    source?: string
  }
  entries: {
    key: string
    value: string
    displayName?: string
    description?: string
    sortOrder?: number
    parentKey?: string
  }[]
}

// ============================================
// EXPORT UTILITIES
// ============================================

async function generateExcelFile(data: ExportData[]): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Certus CONSAR'
  workbook.created = new Date()

  data.forEach((catalogData) => {
    const worksheet = workbook.addWorksheet(catalogData.catalog.code.slice(0, 31)) // Excel worksheet name limit

    // Add header info
    worksheet.addRow([`Catálogo: ${catalogData.catalog.name}`])
    worksheet.addRow([`Código: ${catalogData.catalog.code}`])
    worksheet.addRow([`Versión: ${catalogData.catalog.version}`])
    worksheet.addRow([`Exportado: ${new Date().toLocaleString()}`])
    worksheet.addRow([])

    // Add data headers
    const headerRow = worksheet.addRow(['Clave', 'Valor', 'Nombre Display', 'Descripción', 'Orden', 'Clave Padre'])
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    }

    // Add data rows
    catalogData.entries.forEach((entry) => {
      worksheet.addRow([
        entry.key,
        entry.value,
        entry.displayName || '',
        entry.description || '',
        entry.sortOrder || '',
        entry.parentKey || '',
      ])
    })

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 20
    })
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function generateCSVFile(data: ExportData[]): Blob {
  const lines: string[] = []

  data.forEach((catalogData, idx) => {
    if (idx > 0) lines.push('')
    lines.push(`# Catálogo: ${catalogData.catalog.name}`)
    lines.push(`# Código: ${catalogData.catalog.code}`)
    lines.push(`# Versión: ${catalogData.catalog.version}`)
    lines.push('')
    lines.push('Clave,Valor,Nombre Display,Descripción,Orden,Clave Padre')

    catalogData.entries.forEach((entry) => {
      const row = [
        escapeCSV(entry.key),
        escapeCSV(entry.value),
        escapeCSV(entry.displayName || ''),
        escapeCSV(entry.description || ''),
        entry.sortOrder?.toString() || '',
        escapeCSV(entry.parentKey || ''),
      ]
      lines.push(row.join(','))
    })
  })

  return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function generateXMLFile(data: ExportData[]): Blob {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<catalogos exportDate="' + new Date().toISOString() + '">\n'

  data.forEach((catalogData) => {
    xml += `  <catalogo code="${catalogData.catalog.code}" name="${escapeXML(catalogData.catalog.name)}" version="${catalogData.catalog.version}">\n`

    catalogData.entries.forEach((entry) => {
      xml += '    <entrada>\n'
      xml += `      <clave>${escapeXML(entry.key)}</clave>\n`
      xml += `      <valor>${escapeXML(entry.value)}</valor>\n`
      if (entry.displayName) xml += `      <nombreDisplay>${escapeXML(entry.displayName)}</nombreDisplay>\n`
      if (entry.description) xml += `      <descripcion>${escapeXML(entry.description)}</descripcion>\n`
      if (entry.sortOrder) xml += `      <orden>${entry.sortOrder}</orden>\n`
      if (entry.parentKey) xml += `      <clavePadre>${escapeXML(entry.parentKey)}</clavePadre>\n`
      xml += '    </entrada>\n'
    })

    xml += '  </catalogo>\n'
  })

  xml += '</catalogos>'

  return new Blob([xml], { type: 'application/xml;charset=utf-8' })
}

function escapeXML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateJSONFile(data: ExportData[]): Blob {
  const json = {
    exportDate: new Date().toISOString(),
    catalogs: data.map((catalogData) => ({
      ...catalogData.catalog,
      entries: catalogData.entries,
    })),
  }

  return new Blob([JSON.stringify(json, null, 2)], { type: 'application/json;charset=utf-8' })
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============================================
// COMPONENT
// ============================================

export function CatalogsExport() {
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel')
  const [searchQuery, setSearchQuery] = useState('')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [catalogsToFetch, setCatalogsToFetch] = useState<string[]>([])

  // Load catalogs from API
  const { data: apiCatalogs = [], isLoading: catalogsLoading, error: catalogsError } = useCatalogs()

  // Local state for selection
  const [catalogs, setCatalogs] = useState<CatalogOption[]>([])

  // Initialize catalogs from API data
  useEffect(() => {
    if (apiCatalogs.length > 0) {
      setCatalogs(
        apiCatalogs.map((cat) => ({
          id: cat.id,
          code: cat.code,
          name: cat.name,
          description: cat.description,
          recordCount: cat.entries?.length || 0,
          version: cat.version || '1.0',
          selected: false,
          isActive: cat.isActive,
        }))
      )
    }
  }, [apiCatalogs])

  const formats = [
    {
      id: 'excel' as ExportFormat,
      name: 'Excel',
      description: 'Archivo .xlsx con formato',
      icon: FileSpreadsheet,
      extension: '.xlsx',
      color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV',
      description: 'Valores separados por coma',
      icon: Table2,
      extension: '.csv',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      id: 'xml' as ExportFormat,
      name: 'XML',
      description: 'Formato XML estructurado',
      icon: FileCode,
      extension: '.xml',
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      description: 'JavaScript Object Notation',
      icon: FileCode,
      extension: '.json',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
  ]

  const filteredCatalogs = useMemo(() =>
    catalogs.filter(
      (catalog) =>
        catalog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catalog.code.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [catalogs, searchQuery]
  )

  const toggleCatalog = (id: string) => {
    setCatalogs((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, selected: !cat.selected } : cat))
    )
  }

  const selectAll = () => {
    setCatalogs((prev) =>
      prev.map((cat) =>
        filteredCatalogs.some((fc) => fc.id === cat.id) ? { ...cat, selected: true } : cat
      )
    )
  }

  const deselectAll = () => {
    setCatalogs((prev) => prev.map((cat) => ({ ...cat, selected: false })))
  }

  const handleExport = async () => {
    const selectedCatalogs = catalogs.filter((cat) => cat.selected)
    if (selectedCatalogs.length === 0) {
      toast.warning('Sin selección', {
        description: 'Selecciona al menos un catálogo para exportar',
      })
      return
    }

    setIsExporting(true)
    const loadingToast = toast.loading('Preparando exportación...', {
      description: `Procesando ${selectedCatalogs.length} catálogo(s)`,
    })

    try {
      // Fetch full catalog details with entries
      const catalogDetails = await Promise.all(
        selectedCatalogs.map(async (cat) => {
          const fullCatalog = apiCatalogs.find((c) => c.id === cat.id)
          return {
            catalog: {
              code: cat.code,
              name: cat.name,
              version: cat.version,
              description: cat.description,
              source: fullCatalog?.source,
            },
            entries: fullCatalog?.entries?.map((e) => ({
              key: e.key,
              value: e.value,
              displayName: e.displayName,
              description: e.description,
              sortOrder: e.sortOrder,
              parentKey: e.parentKey,
            })) || [],
          } as ExportData
        })
      )

      // Generate file based on format
      let blob: Blob
      const timestamp = new Date().toISOString().split('T')[0]
      let filename = `catalogos_consar_${timestamp}`

      switch (selectedFormat) {
        case 'excel':
          blob = await generateExcelFile(catalogDetails)
          filename += '.xlsx'
          break
        case 'csv':
          blob = generateCSVFile(catalogDetails)
          filename += '.csv'
          break
        case 'xml':
          blob = generateXMLFile(catalogDetails)
          filename += '.xml'
          break
        case 'json':
          blob = generateJSONFile(catalogDetails)
          filename += '.json'
          break
        default:
          throw new Error('Formato no soportado')
      }

      // Download the file
      downloadBlob(blob, filename)

      toast.dismiss(loadingToast)
      toast.success('Exportación completada', {
        description: `Archivo ${filename} descargado correctamente`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      })

      // Reset selection after successful export
      deselectAll()
    } catch (error) {
      toast.dismiss(loadingToast)
      const message = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error en la exportación', {
        description: message,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      })
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
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
          <CardDescription>
            El archivo se descargará directamente a tu dispositivo
          </CardDescription>
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
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : isDark
                        ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/50'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', format.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={cn('font-semibold mb-1', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                    {format.name}
                  </h3>
                  <p className={cn('text-xs', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                    {format.description}
                  </p>
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
          {/* Include metadata */}
          <div className={cn(
            'flex items-center gap-3 p-4 rounded-lg',
            isDark ? 'bg-neutral-800/50' : 'bg-neutral-50'
          )}>
            <input
              type="checkbox"
              id="include-metadata"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <label htmlFor="include-metadata" className={cn(
              'text-sm cursor-pointer flex-1',
              isDark ? 'text-neutral-300' : 'text-neutral-700'
            )}>
              Incluir metadatos del catálogo (código, versión, descripción)
            </label>
          </div>

          {/* Info box */}
          <div className={cn(
            'p-4 rounded-lg border',
            isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
          )}>
            <div className="flex gap-3">
              <AlertCircle className={cn('h-5 w-5 flex-shrink-0', isDark ? 'text-blue-400' : 'text-blue-600')} />
              <div>
                <h4 className={cn('font-medium', isDark ? 'text-blue-300' : 'text-blue-900')}>
                  Información de exportación
                </h4>
                <p className={cn('text-sm mt-1', isDark ? 'text-blue-400' : 'text-blue-700')}>
                  Los catálogos se exportarán con todas sus entradas activas.
                  Para Excel, cada catálogo se colocará en una hoja separada.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base">Selecciona catálogos a exportar</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Seleccionar todos
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                Deseleccionar
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

          {/* Loading state */}
          {catalogsLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className={cn('ml-2', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                Cargando catálogos...
              </span>
            </div>
          )}

          {/* Error state */}
          {catalogsError && (
            <div className={cn(
              'flex items-center p-4 rounded-lg',
              isDark ? 'bg-red-900/20' : 'bg-red-50'
            )}>
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className={cn('ml-2', isDark ? 'text-red-300' : 'text-red-700')}>
                Error al cargar catálogos: {catalogsError.message}
              </span>
            </div>
          )}

          {/* Catalog list */}
          {!catalogsLoading && !catalogsError && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCatalogs.length === 0 ? (
                <div className={cn(
                  'text-center py-8 rounded-lg',
                  isDark ? 'bg-neutral-800' : 'bg-neutral-50'
                )}>
                  <Database className={cn('h-8 w-8 mx-auto mb-2', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
                  <p className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                    {searchQuery ? 'No se encontraron catálogos' : 'No hay catálogos disponibles'}
                  </p>
                </div>
              ) : (
                filteredCatalogs.map((catalog) => (
                  <button
                    key={catalog.id}
                    onClick={() => toggleCatalog(catalog.id)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 transition-all text-left',
                      catalog.selected
                        ? 'border-primary bg-primary/5'
                        : isDark
                          ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/30'
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={catalog.selected}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                      />
                      <Database className={cn('h-5 w-5', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className={cn('font-medium', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                            {catalog.name}
                          </h4>
                          <Badge variant="neutral" className="text-xs">
                            {catalog.code}
                          </Badge>
                          {!catalog.isActive && (
                            <Badge variant="warning" className="text-xs">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        <div className={cn(
                          'flex items-center gap-4 text-xs',
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        )}>
                          <span>{catalog.recordCount.toLocaleString()} registros</span>
                          <span>v{catalog.version}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export summary */}
      {selectedCount > 0 && (
        <Card className={cn(
          'border-2',
          isDark
            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30'
            : 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200'
        )}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className={cn('font-semibold mb-2', isDark ? 'text-primary-300' : 'text-primary-900')}>
                  Resumen de exportación
                </h3>
                <div className={cn('space-y-1 text-sm', isDark ? 'text-primary-300' : 'text-primary-800')}>
                  <p>
                    <strong>{selectedCount}</strong> {selectedCount === 1 ? 'catálogo seleccionado' : 'catálogos seleccionados'}
                  </p>
                  <p>
                    <strong>{totalRecords.toLocaleString()}</strong> registros totales
                  </p>
                  <p>
                    Formato: <strong>{selectedFormatConfig?.name}</strong> ({selectedFormatConfig?.extension})
                  </p>
                </div>
              </div>
              <Button variant="primary" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Exportar ahora
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
