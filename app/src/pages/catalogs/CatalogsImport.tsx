/**
 * CatalogsImport - Real API Integration
 *
 * Handles catalog import from Excel, CSV, and XML files
 * with real parsing and API integration
 */

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  Table2,
  FileSpreadsheet,
  FileCode,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  ChevronRight,
  Database,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCatalogs } from '@/hooks/useCatalogs'
import {
  CatalogImportService,
  type ImportFormat,
  type ImportValidationResult,
  type ParsedEntry,
  type ImportProgress,
  type ImportResult,
} from '@/lib/services/api/catalog-import.service'
import { cn } from '@/lib/utils'
import { useAppStore, selectTheme } from '@/stores/appStore'
import type { Catalog } from '@/types'

type ImportStep = 'format' | 'upload' | 'validate' | 'select-catalog' | 'importing' | 'complete'

interface UploadedFile {
  file: File
  format: ImportFormat
  validationResult?: ImportValidationResult
  importResult?: ImportResult
}

export function CatalogsImport() {
  const navigate = useNavigate()
  const theme = useAppStore(selectTheme)
  const isDark = theme === 'dark'

  // State
  const [currentStep, setCurrentStep] = useState<ImportStep>('format')
  const [selectedFormat, setSelectedFormat] = useState<ImportFormat>('excel')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('')
  const [createNewCatalog, setCreateNewCatalog] = useState(false)
  const [newCatalogData, setNewCatalogData] = useState({
    code: '',
    name: '',
    description: '',
  })
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load catalogs from API
  const { data: catalogs = [], isLoading: catalogsLoading } = useCatalogs()

  const formats = [
    {
      id: 'excel' as ImportFormat,
      name: 'Excel',
      description: 'Archivos .xlsx o .xls',
      icon: FileSpreadsheet,
      accept: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
      },
      color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      id: 'csv' as ImportFormat,
      name: 'CSV',
      description: 'Valores separados por coma',
      icon: Table2,
      accept: {
        'text/csv': ['.csv'],
      },
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      id: 'xml' as ImportFormat,
      name: 'XML',
      description: 'Archivos XML estructurados',
      icon: FileCode,
      accept: {
        'application/xml': ['.xml'],
        'text/xml': ['.xml'],
      },
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ]

  const selectedFormatConfig = formats.find((f) => f.id === selectedFormat)

  // Dropzone configuration
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setIsProcessing(true)
      setUploadedFile({ file, format: selectedFormat })

      try {
        // Parse the file
        const entries = await CatalogImportService.parseFile(file, selectedFormat)

        // Validate the entries
        const validationResult = CatalogImportService.validateEntries(entries)

        setUploadedFile({
          file,
          format: selectedFormat,
          validationResult,
        })

        if (validationResult.isValid) {
          toast.success('Archivo procesado correctamente', {
            description: `${validationResult.recordsFound} registros encontrados`,
          })
          setCurrentStep('validate')
        } else {
          toast.error('El archivo contiene errores', {
            description: `${validationResult.errors.length} errores encontrados`,
          })
          setCurrentStep('validate')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al procesar el archivo'
        toast.error('Error al procesar archivo', { description: message })
        setUploadedFile(null)
      } finally {
        setIsProcessing(false)
      }
    },
    [selectedFormat]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedFormatConfig?.accept,
    multiple: false,
    disabled: isProcessing,
  })

  // Handle import
  const handleImport = async () => {
    if (!uploadedFile?.validationResult?.isValid) return

    const entries = uploadedFile.validationResult.preview.length < uploadedFile.validationResult.recordsFound
      ? await CatalogImportService.parseFile(uploadedFile.file, uploadedFile.format)
      : uploadedFile.validationResult.preview

    setCurrentStep('importing')
    setIsProcessing(true)

    try {
      let result: ImportResult

      if (createNewCatalog) {
        // Create new catalog and import
        const { importResult } = await CatalogImportService.createAndImport(
          {
            code: newCatalogData.code.toUpperCase(),
            name: newCatalogData.name,
            description: newCatalogData.description,
            source: 'INTERNO',
          },
          entries,
          setImportProgress
        )
        result = importResult
      } else {
        // Import to existing catalog
        result = await CatalogImportService.importToCatalog(
          selectedCatalogId,
          entries,
          setImportProgress
        )
      }

      setUploadedFile((prev) =>
        prev ? { ...prev, importResult: result } : null
      )

      if (result.success) {
        toast.success('Importación completada', {
          description: `${result.imported} entradas importadas correctamente`,
        })
      } else {
        toast.warning('Importación con errores', {
          description: `${result.imported} éxitos, ${result.failed} fallos`,
        })
      }

      setCurrentStep('complete')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error durante la importación'
      toast.error('Error de importación', { description: message })
      setCurrentStep('select-catalog')
    } finally {
      setIsProcessing(false)
    }
  }

  // Reset and start over
  const handleReset = () => {
    setCurrentStep('format')
    setUploadedFile(null)
    setSelectedCatalogId('')
    setCreateNewCatalog(false)
    setNewCatalogData({ code: '', name: '', description: '' })
    setImportProgress(null)
  }

  // Step navigation
  const goToNextStep = () => {
    switch (currentStep) {
      case 'format':
        setCurrentStep('upload')
        break
      case 'validate':
        setCurrentStep('select-catalog')
        break
    }
  }

  const canProceedToImport = createNewCatalog
    ? newCatalogData.code.length >= 3 && newCatalogData.name.length >= 3
    : selectedCatalogId !== ''

  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar Catálogos"
        description="Importa catálogos CONSAR desde archivos externos"
        icon={Upload}
      />

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { id: 'format', label: 'Formato' },
              { id: 'upload', label: 'Cargar' },
              { id: 'validate', label: 'Validar' },
              { id: 'select-catalog', label: 'Catálogo' },
              { id: 'importing', label: 'Importar' },
              { id: 'complete', label: 'Completado' },
            ].map((step, index, arr) => {
              const stepIndex = arr.findIndex((s) => s.id === currentStep)
              const thisIndex = index
              const isActive = step.id === currentStep
              const isComplete = thisIndex < stepIndex

              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                        isActive && 'bg-primary text-white',
                        isComplete && 'bg-green-500 text-white',
                        !isActive && !isComplete && (isDark ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-500')
                      )}
                    >
                      {isComplete ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className={cn(
                      'text-xs mt-1',
                      isActive && 'text-primary font-medium',
                      !isActive && (isDark ? 'text-neutral-500' : 'text-neutral-500')
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < arr.length - 1 && (
                    <ChevronRight className={cn(
                      'h-4 w-4 mx-2',
                      isDark ? 'text-neutral-600' : 'text-neutral-300'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step: Format Selection */}
      {currentStep === 'format' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selecciona el formato del archivo</CardTitle>
            <CardDescription>
              Elige el tipo de archivo que deseas importar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
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
                  </button>
                )
              })}
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="primary" onClick={goToNextStep}>
                Continuar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Upload */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cargar archivo {selectedFormatConfig?.name}</CardTitle>
            <CardDescription>
              Arrastra o selecciona el archivo a importar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer',
                isDragActive && 'border-primary bg-primary/5',
                isProcessing && 'opacity-50 cursor-not-allowed',
                !isDragActive && !isProcessing && (isDark
                  ? 'border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800/30'
                  : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50')
              )}
            >
              <input {...getInputProps()} />
              <div className={cn(
                'w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center',
                selectedFormatConfig?.color || 'bg-neutral-100'
              )}>
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  selectedFormatConfig && <selectedFormatConfig.icon className="h-8 w-8" />
                )}
              </div>
              <h3 className={cn('text-lg font-semibold mb-2', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                {isProcessing
                  ? 'Procesando archivo...'
                  : `Arrastra archivo ${selectedFormatConfig?.name} aquí`}
              </h3>
              <p className={cn('text-sm mb-4', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                {isProcessing ? 'Por favor espera' : 'o haz clic para seleccionar'}
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep('format')}>
                Atrás
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Validate */}
      {currentStep === 'validate' && uploadedFile?.validationResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {uploadedFile.validationResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  Resultado de validación
                </CardTitle>
                <CardDescription>
                  {uploadedFile.file.name} • {(uploadedFile.file.size / 1024).toFixed(1)} KB
                </CardDescription>
              </div>
              <Badge variant={uploadedFile.validationResult.isValid ? 'success' : 'danger'}>
                {uploadedFile.validationResult.recordsFound} registros
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Errors */}
            {uploadedFile.validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className={cn('font-medium text-red-600', isDark && 'text-red-400')}>
                  Errores ({uploadedFile.validationResult.errors.length})
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {uploadedFile.validationResult.errors.map((error, idx) => (
                    <div key={idx} className={cn(
                      'text-sm p-2 rounded',
                      isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
                    )}>
                      Fila {error.row}: {error.message}
                      {error.value && ` (valor: "${error.value}")`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {uploadedFile.validationResult.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className={cn('font-medium text-yellow-600', isDark && 'text-yellow-400')}>
                  Advertencias ({uploadedFile.validationResult.warnings.length})
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadedFile.validationResult.warnings.map((warning, idx) => (
                    <div key={idx} className={cn(
                      'text-sm p-2 rounded',
                      isDark ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-700'
                    )}>
                      Fila {warning.row}: {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="space-y-2">
              <h4 className={cn('font-medium', isDark ? 'text-neutral-200' : 'text-neutral-900')}>
                Vista previa (primeros 10 registros)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDark ? 'bg-neutral-800' : 'bg-neutral-100'}>
                      <th className="px-3 py-2 text-left font-medium">Clave</th>
                      <th className="px-3 py-2 text-left font-medium">Valor</th>
                      <th className="px-3 py-2 text-left font-medium">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedFile.validationResult.preview.map((entry, idx) => (
                      <tr key={idx} className={cn(
                        'border-b',
                        isDark ? 'border-neutral-700' : 'border-neutral-200'
                      )}>
                        <td className="px-3 py-2 font-mono text-xs">{entry.key}</td>
                        <td className="px-3 py-2">{entry.value}</td>
                        <td className={cn(
                          'px-3 py-2',
                          isDark ? 'text-neutral-400' : 'text-neutral-500'
                        )}>
                          {entry.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleReset}>
                Empezar de nuevo
              </Button>
              <Button
                variant="primary"
                onClick={goToNextStep}
                disabled={!uploadedFile.validationResult.isValid}
              >
                Continuar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Select Catalog */}
      {currentStep === 'select-catalog' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selecciona el catálogo destino</CardTitle>
            <CardDescription>
              Elige un catálogo existente o crea uno nuevo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Create new option */}
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createNewCatalog}
                  onChange={(e) => setCreateNewCatalog(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <span className={cn('font-medium', isDark ? 'text-neutral-200' : 'text-neutral-900')}>
                  Crear nuevo catálogo
                </span>
              </label>

              {createNewCatalog && (
                <div className={cn(
                  'grid gap-4 p-4 rounded-lg',
                  isDark ? 'bg-neutral-800' : 'bg-neutral-50'
                )}>
                  <div>
                    <label className={cn(
                      'block text-sm font-medium mb-1',
                      isDark ? 'text-neutral-300' : 'text-neutral-700'
                    )}>
                      Código del catálogo
                    </label>
                    <input
                      type="text"
                      value={newCatalogData.code}
                      onChange={(e) => setNewCatalogData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="CAT_EJEMPLO"
                      className={cn(
                        'w-full px-3 py-2 rounded-lg border text-sm',
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-100'
                          : 'bg-white border-neutral-300 text-neutral-900'
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn(
                      'block text-sm font-medium mb-1',
                      isDark ? 'text-neutral-300' : 'text-neutral-700'
                    )}>
                      Nombre del catálogo
                    </label>
                    <input
                      type="text"
                      value={newCatalogData.name}
                      onChange={(e) => setNewCatalogData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Catálogo de ejemplo"
                      className={cn(
                        'w-full px-3 py-2 rounded-lg border text-sm',
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-100'
                          : 'bg-white border-neutral-300 text-neutral-900'
                      )}
                    />
                  </div>
                  <div>
                    <label className={cn(
                      'block text-sm font-medium mb-1',
                      isDark ? 'text-neutral-300' : 'text-neutral-700'
                    )}>
                      Descripción (opcional)
                    </label>
                    <textarea
                      value={newCatalogData.description}
                      onChange={(e) => setNewCatalogData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción del catálogo..."
                      rows={2}
                      className={cn(
                        'w-full px-3 py-2 rounded-lg border text-sm',
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-neutral-100'
                          : 'bg-white border-neutral-300 text-neutral-900'
                      )}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Existing catalogs */}
            {!createNewCatalog && (
              <div className="space-y-2">
                <label className={cn(
                  'block text-sm font-medium',
                  isDark ? 'text-neutral-300' : 'text-neutral-700'
                )}>
                  Catálogos existentes
                </label>
                {catalogsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : catalogs.length === 0 ? (
                  <div className={cn(
                    'text-center py-8 rounded-lg',
                    isDark ? 'bg-neutral-800' : 'bg-neutral-50'
                  )}>
                    <Database className={cn('h-8 w-8 mx-auto mb-2', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
                    <p className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                      No hay catálogos disponibles. Crea uno nuevo.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {catalogs.map((catalog: Catalog) => (
                      <button
                        key={catalog.id}
                        onClick={() => setSelectedCatalogId(catalog.id)}
                        className={cn(
                          'w-full p-3 rounded-lg border-2 text-left transition-all',
                          selectedCatalogId === catalog.id
                            ? 'border-primary bg-primary/5'
                            : isDark
                              ? 'border-neutral-700 hover:border-neutral-600'
                              : 'border-neutral-200 hover:border-neutral-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={cn('font-medium', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                              {catalog.name}
                            </h4>
                            <p className={cn('text-xs', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                              {catalog.code} • {catalog.source || 'CONSAR'}
                            </p>
                          </div>
                          <Badge variant={catalog.isActive ? 'success' : 'neutral'}>
                            {catalog.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep('validate')}>
                Atrás
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={!canProceedToImport || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    Iniciar importación
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Importing */}
      {currentStep === 'importing' && importProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Importando...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={(importProgress.current / importProgress.total) * 100} />
            <p className={cn('text-sm text-center', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
              {importProgress.message}
            </p>
            <p className={cn('text-xs text-center', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
              {importProgress.current} de {importProgress.total}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step: Complete */}
      {currentStep === 'complete' && uploadedFile?.importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {uploadedFile.importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Importación {uploadedFile.importResult.success ? 'completada' : 'con errores'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className={cn(
                'p-4 rounded-lg text-center',
                isDark ? 'bg-neutral-800' : 'bg-neutral-50'
              )}>
                <p className={cn('text-2xl font-bold', isDark ? 'text-neutral-100' : 'text-neutral-900')}>
                  {uploadedFile.importResult.totalRecords}
                </p>
                <p className={cn('text-xs', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                  Total
                </p>
              </div>
              <div className={cn(
                'p-4 rounded-lg text-center',
                isDark ? 'bg-green-900/20' : 'bg-green-50'
              )}>
                <p className="text-2xl font-bold text-green-600">
                  {uploadedFile.importResult.imported}
                </p>
                <p className={cn('text-xs', isDark ? 'text-green-400' : 'text-green-600')}>
                  Importados
                </p>
              </div>
              <div className={cn(
                'p-4 rounded-lg text-center',
                isDark ? 'bg-red-900/20' : 'bg-red-50'
              )}>
                <p className="text-2xl font-bold text-red-600">
                  {uploadedFile.importResult.failed}
                </p>
                <p className={cn('text-xs', isDark ? 'text-red-400' : 'text-red-600')}>
                  Fallidos
                </p>
              </div>
            </div>

            {uploadedFile.importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className={cn('font-medium text-red-600', isDark && 'text-red-400')}>
                  Errores durante importación
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {uploadedFile.importResult.errors.map((error, idx) => (
                    <div key={idx} className={cn(
                      'text-sm p-2 rounded',
                      isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-700'
                    )}>
                      Fila {error.row}: {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={handleReset}>
                Nueva importación
              </Button>
              <Button variant="primary" onClick={() => navigate('/catalogs')}>
                Ver catálogos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import tips */}
      {(currentStep === 'format' || currentStep === 'upload') && (
        <Card className={cn(
          isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
        )}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className={cn(
                'h-5 w-5 flex-shrink-0 mt-0.5',
                isDark ? 'text-blue-400' : 'text-blue-600'
              )} />
              <div>
                <h4 className={cn('font-semibold mb-2', isDark ? 'text-blue-300' : 'text-blue-900')}>
                  Formato requerido del archivo
                </h4>
                <ul className={cn('text-sm space-y-1', isDark ? 'text-blue-300' : 'text-blue-800')}>
                  <li>• Columnas requeridas: <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-800 text-xs">key</code> (o clave) y <code className="px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-800 text-xs">value</code> (o valor)</li>
                  <li>• Columnas opcionales: displayName, description, sortOrder, parentKey</li>
                  <li>• La primera fila debe contener los nombres de las columnas</li>
                  <li>• Las claves deben ser únicas dentro del archivo</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
