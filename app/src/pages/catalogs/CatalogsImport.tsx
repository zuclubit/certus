import { useState } from 'react'
import { Upload, FileText, Table2, FileSpreadsheet, FileCode, AlertCircle, CheckCircle, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type FileFormat = 'excel' | 'csv' | 'xml'
type ImportStatus = 'idle' | 'uploading' | 'validating' | 'success' | 'error'

interface ImportFile {
  file: File
  format: FileFormat
  status: ImportStatus
  recordsFound?: number
  errors?: string[]
}

export function CatalogsImport() {
  const [selectedFormat, setSelectedFormat] = useState<FileFormat>('excel')
  const [uploadedFiles, setUploadedFiles] = useState<ImportFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const formats = [
    {
      id: 'excel' as FileFormat,
      name: 'Excel',
      description: 'Archivos .xlsx o .xls',
      icon: FileSpreadsheet,
      accept: '.xlsx,.xls',
      color: 'bg-green-50 text-green-600',
    },
    {
      id: 'csv' as FileFormat,
      name: 'CSV',
      description: 'Valores separados por coma',
      icon: Table2,
      accept: '.csv',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'xml' as FileFormat,
      name: 'XML',
      description: 'Archivos XML estructurados',
      icon: FileCode,
      accept: '.xml',
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      processFiles(files)
    }
  }

  const processFiles = (files: File[]) => {
    const newFiles: ImportFile[] = files.map((file) => ({
      file,
      format: selectedFormat,
      status: 'uploading',
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Simulate file processing
    newFiles.forEach((importFile, index) => {
      setTimeout(() => {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === importFile.file
              ? {
                  ...f,
                  status: 'validating',
                }
              : f
          )
        )

        setTimeout(() => {
          // Simulate validation result (90% success rate)
          const isSuccess = Math.random() > 0.1
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.file === importFile.file
                ? {
                    ...f,
                    status: isSuccess ? 'success' : 'error',
                    recordsFound: isSuccess ? Math.floor(Math.random() * 500) + 50 : undefined,
                    errors: isSuccess
                      ? undefined
                      : [
                          'Formato de columna inválido en fila 15',
                          'Código CONSAR no encontrado en catálogo',
                        ],
                  }
                : f
            )
          )
        }, 1500)
      }, 1000 * index)
    })
  }

  const removeFile = (file: File) => {
    setUploadedFiles((prev) => prev.filter((f) => f.file !== file))
  }

  const getStatusIcon = (status: ImportStatus) => {
    switch (status) {
      case 'uploading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      case 'validating':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-danger-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: ImportStatus) => {
    switch (status) {
      case 'uploading':
        return <Badge variant="neutral">Subiendo...</Badge>
      case 'validating':
        return <Badge variant="warning">Validando...</Badge>
      case 'success':
        return <Badge variant="success">Listo para importar</Badge>
      case 'error':
        return <Badge variant="danger">Error</Badge>
      default:
        return null
    }
  }

  const selectedFormatConfig = formats.find((f) => f.id === selectedFormat)
  const successfulFiles = uploadedFiles.filter((f) => f.status === 'success')
  const totalRecords = successfulFiles.reduce((sum, f) => sum + (f.recordsFound || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar Catálogos"
        description="Importa catálogos CONSAR desde archivos externos"
        icon={Upload}
      />

      {/* Format selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selecciona el formato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
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
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upload area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cargar archivos</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
            }`}
          >
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              selectedFormatConfig?.color || 'bg-neutral-100'
            }`}>
              {selectedFormatConfig && <selectedFormatConfig.icon className="h-8 w-8" />}
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Arrastra archivos {selectedFormatConfig?.name} aquí
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              o haz clic para seleccionar archivos
            </p>
            <input
              type="file"
              accept={selectedFormatConfig?.accept}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button variant="primary" size="sm" asChild>
                <span>Seleccionar archivos</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Archivos cargados ({uploadedFiles.length})</CardTitle>
              {successfulFiles.length > 0 && (
                <Badge variant="success">
                  {totalRecords.toLocaleString()} registros listos
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((importFile) => (
                <div
                  key={importFile.file.name}
                  className="p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getStatusIcon(importFile.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-neutral-900 truncate">
                            {importFile.file.name}
                          </h4>
                          {getStatusBadge(importFile.status)}
                        </div>
                        <p className="text-xs text-neutral-500">
                          {(importFile.file.size / 1024).toFixed(1)} KB • {importFile.format.toUpperCase()}
                        </p>
                        {importFile.recordsFound && (
                          <p className="text-xs text-success-600 mt-2">
                            ✓ {importFile.recordsFound.toLocaleString()} registros encontrados
                          </p>
                        )}
                        {importFile.errors && (
                          <div className="mt-2 space-y-1">
                            {importFile.errors.map((error, idx) => (
                              <p key={idx} className="text-xs text-danger-600 flex items-start gap-1">
                                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                {error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(importFile.file)}
                      className="p-1 hover:bg-neutral-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-neutral-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {successfulFiles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200 flex gap-3 justify-end">
                <Button variant="ghost" size="sm">
                  Cancelar
                </Button>
                <Button variant="primary" size="sm">
                  <Upload className="h-4 w-4" />
                  Importar {successfulFiles.length} {successfulFiles.length === 1 ? 'archivo' : 'archivos'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Recomendaciones para importar</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Asegúrate de que los archivos sigan el formato estándar CONSAR</li>
                <li>• Los catálogos duplicados serán actualizados automáticamente</li>
                <li>• Valida que los códigos de catálogo sean correctos antes de importar</li>
                <li>• Los archivos Excel deben tener las columnas en el orden especificado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
