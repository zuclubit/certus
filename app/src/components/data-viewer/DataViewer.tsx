/**
 * DataViewer Component
 *
 * High-performance data viewer for CONSAR files using TanStack Table + Virtual scrolling
 * Handles 100k+ rows with 60fps performance
 *
 * @module DataViewer
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { AnyRecord, CONSARFileType, ParsedFile, ParsingProgress } from '@/lib/types/consar-record'
import { parseConsarFile } from '@/lib/parsers/consar-parser'
import { DataViewerHeader } from './DataViewerHeader'
import { DataViewerFooter } from './DataViewerFooter'
import { RowDetailModal } from './RowDetailModal'
import { LoadingState } from './LoadingState'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/schemas/consar-schema'
import { usePDFGenerator, buildValidationReportData } from '@/lib/pdf'

/**
 * DataViewer Props
 */
export interface DataViewerProps {
  /** File to display */
  file: File
  /** File type (auto-detected from filename if not provided) */
  fileType: CONSARFileType
  /** Maximum height of table (default: 600px) */
  maxHeight?: number
  /** Row height for virtual scrolling (default: 40px) */
  rowHeight?: number
  /** Enable export buttons */
  enableExport?: boolean
  /** Callback when export is triggered */
  onExport?: (format: 'csv' | 'excel') => void
}

/**
 * DataViewer Component
 */
export function DataViewer({
  file,
  fileType,
  maxHeight = 600,
  rowHeight = 40,
  enableExport = true,
  onExport,
}: DataViewerProps) {
  // State
  const [parsedData, setParsedData] = useState<ParsedFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState<ParsingProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<AnyRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // PDF Generator hook
  const { generateValidationReport, isGenerating: isPDFGenerating, error: pdfError } = usePDFGenerator()

  // Refs
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Parse file on mount
  useEffect(() => {
    parseFile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, fileType])

  // Show PDF error if any
  useEffect(() => {
    if (pdfError) {
      console.error('PDF Generation Error:', pdfError)
      // TODO: Add toast notification here
      setError(`Error al generar PDF: ${pdfError.message}`)
    }
  }, [pdfError])

  /**
   * Parse file using worker
   */
  const parseFile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setProgress({ totalLines: 0, processedLines: 0, percentage: 0, phase: 'reading' })

    try {
      // Use Web Worker for large files
      if (file.size > 500000) { // 500KB
        await parseFileWithWorker()
      } else {
        // Parse directly for small files
        const result = await parseConsarFile(file, fileType)
        setParsedData(result)
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al parsear el archivo')
      setIsLoading(false)
    }
  }, [file, fileType])

  /**
   * Parse file using Web Worker
   */
  const parseFileWithWorker = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
      const worker = new Worker(
        new URL('@/lib/parsers/consar-parser.worker.ts', import.meta.url),
        { type: 'module' }
      )

      worker.onmessage = (event) => {
        const { type, progress: workerProgress, result, error: workerError } = event.data

        if (type === 'progress' && workerProgress) {
          setProgress(workerProgress)
        } else if (type === 'complete' && result) {
          setParsedData(result)
          setIsLoading(false)
          worker.terminate()
          resolve()
        } else if (type === 'error') {
          setError(workerError || 'Error desconocido')
          setIsLoading(false)
          worker.terminate()
          reject(new Error(workerError))
        }
      }

      worker.onerror = (err) => {
        setError('Error en el worker: ' + err.message)
        setIsLoading(false)
        worker.terminate()
        reject(err)
      }

      worker.postMessage({ type: 'parse', file, fileType, reportProgressEvery: 1000 })
    })
  }, [file, fileType])

  /**
   * Download raw file
   */
  const handleDownloadRaw = useCallback(() => {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [file])

  /**
   * Generate and download PDF report
   */
  const handleDownloadPDF = useCallback(async () => {
    if (!parsedData) {
      console.error('No parsed data available')
      return
    }

    try {
      // Build report data from parsed file
      const reportData = buildValidationReportData(parsedData, file.name)

      // Generate PDF
      await generateValidationReport(reportData, {
        includeCharts: true,
        includeDetails: true,
        maxDetailRecords: 100,
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }, [parsedData, file.name, generateValidationReport])

  /**
   * Define columns based on file type
   */
  const columns = useMemo<ColumnDef<AnyRecord>[]>(() => {
    const baseColumns: ColumnDef<AnyRecord>[] = [
      {
        accessorKey: 'lineNumber',
        header: 'Línea',
        size: 80,
        cell: ({ getValue }) => (
          <span className="font-mono text-sm">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: 'recordType',
        header: 'Tipo',
        size: 80,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">{getValue() as string}</span>
        ),
      },
    ]

    // Add file-type specific columns
    if (fileType === 'NOMINA') {
      baseColumns.push(
        {
          accessorKey: 'nss',
          header: 'NSS',
          size: 120,
          cell: ({ getValue }) => (
            <span className="font-mono text-sm">{getValue() as string}</span>
          ),
        },
        {
          accessorKey: 'curp',
          header: 'CURP',
          size: 180,
          cell: ({ getValue }) => (
            <span className="font-mono text-xs">{getValue() as string}</span>
          ),
        },
        {
          accessorKey: 'employeeName',
          header: 'Nombre',
          size: 250,
        },
        {
          accessorKey: 'amount',
          header: 'Importe',
          size: 120,
          cell: ({ getValue }) => (
            <span className="font-mono text-sm tabular-nums">
              {formatAmount(getValue() as number)}
            </span>
          ),
        }
      )
    } else if (fileType === 'CONTABLE') {
      baseColumns.push(
        {
          accessorKey: 'accountCode',
          header: 'Cuenta',
          size: 100,
        },
        {
          accessorKey: 'date',
          header: 'Fecha',
          size: 100,
        },
        {
          accessorKey: 'concept',
          header: 'Concepto',
          size: 300,
        },
        {
          accessorKey: 'debitAmount',
          header: 'Cargo',
          size: 120,
          cell: ({ getValue }) => (
            <span className="font-mono text-sm tabular-nums">
              {formatAmount(getValue() as number)}
            </span>
          ),
        },
        {
          accessorKey: 'creditAmount',
          header: 'Abono',
          size: 120,
          cell: ({ getValue }) => (
            <span className="font-mono text-sm tabular-nums">
              {formatAmount(getValue() as number)}
            </span>
          ),
        }
      )
    } else if (fileType === 'REGULARIZACION') {
      baseColumns.push(
        {
          accessorKey: 'account',
          header: 'Cuenta',
          size: 120,
        },
        {
          accessorKey: 'originalDate',
          header: 'Fecha Original',
          size: 120,
        },
        {
          accessorKey: 'correctionDate',
          header: 'Fecha Corrección',
          size: 120,
        },
        {
          accessorKey: 'originalAmount',
          header: 'Importe Original',
          size: 140,
          cell: ({ getValue }) => (
            <span className="font-mono text-sm tabular-nums">
              {formatAmount(getValue() as number)}
            </span>
          ),
        },
        {
          accessorKey: 'correctedAmount',
          header: 'Importe Corregido',
          size: 140,
          cell: ({ getValue }) => (
            <span className="font-mono text-sm tabular-nums">
              {formatAmount(getValue() as number)}
            </span>
          ),
        }
      )
    }

    // Add status column
    baseColumns.push({
      accessorKey: 'isValid',
      header: 'Estado',
      size: 100,
      cell: ({ row }) => {
        const record = row.original
        if (!record.isValid) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
              Error
            </span>
          )
        }
        if (record.warnings.length > 0) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-600 dark:bg-yellow-400" />
              Advertencia
            </span>
          )
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400" />
            Válido
          </span>
        )
      },
    })

    return baseColumns
  }, [fileType])

  /**
   * Filter data
   */
  const filteredData = useMemo(() => {
    if (!parsedData) return []

    let data = parsedData.records

    // Filter by errors only
    if (showErrorsOnly) {
      data = data.filter(record => !record.isValid)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      data = data.filter(record =>
        record.rawLine.toLowerCase().includes(query)
      )
    }

    return data
  }, [parsedData, showErrorsOnly, searchQuery])

  /**
   * Table instance
   */
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  /**
   * Virtual scrolling
   */
  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0

  // Loading state
  if (isLoading) {
    return <LoadingState progress={progress} />
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold mb-2">
            Error al cargar el archivo
          </div>
          <div className="text-gray-600 dark:text-gray-400">{error}</div>
        </div>
      </div>
    )
  }

  // No data
  if (!parsedData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">No hay datos para mostrar</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with search and filters */}
      <DataViewerHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showErrorsOnly={showErrorsOnly}
        onShowErrorsOnlyChange={setShowErrorsOnly}
        enableExport={enableExport}
        onExport={onExport}
        onDownloadRaw={handleDownloadRaw}
        onDownloadPDF={handleDownloadPDF}
        isPDFGenerating={isPDFGenerating}
        totalRecords={parsedData.totalRecords}
        filteredRecords={filteredData.length}
        errorCount={parsedData.records.filter(r => !r.isValid).length}
      />

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div
          ref={tableContainerRef}
          style={{ maxHeight: `${maxHeight}px` }}
          className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
        >
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              )}
              {virtualRows.map(virtualRow => {
                const row = rows[virtualRow.index]
                return (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedRow(row.original)}
                    className={cn(
                      'border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors',
                      'hover:bg-gray-50 dark:hover:bg-gray-900/50',
                      !row.original.isValid && 'bg-red-50/30 dark:bg-red-900/10',
                      row.original.warnings.length > 0 && 'bg-yellow-50/30 dark:bg-yellow-900/10'
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })}
              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with statistics */}
      <DataViewerFooter
        totalRecords={parsedData.totalRecords}
        validRecords={parsedData.validRecords}
        invalidRecords={parsedData.invalidRecords}
        warningRecords={parsedData.warningRecords}
        parseTime={parsedData.parseTime}
        filteredRecords={filteredData.length}
      />

      {/* Row detail modal */}
      {selectedRow && (
        <RowDetailModal
          record={selectedRow}
          isOpen={!!selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  )
}
