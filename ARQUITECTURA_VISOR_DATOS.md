# 🏗️ ARQUITECTURA DEL VISOR DE DATOS TABULAR

**Proyecto**: Certus - Sistema de Validación CONSAR
**Fecha**: 22 de Enero de 2025
**Versión**: 1.0.0
**Arquitecto**: Claude (Anthropic)

---

## 📋 DECISIONES ARQUITECTÓNICAS BASADAS EN INVESTIGACIÓN 2025

### Investigación Realizada

He investigado las tecnologías más modernas y apropiadas para 2025:

1. **[TanStack Table v8](https://tanstack.com/table/v8/docs/guide/virtualization)** - Librería headless de tablas
2. **[TanStack Virtual](https://tanstack.com/virtual)** - Virtual scrolling para 100k+ filas
3. **Parsers posicionales**: [fixed-width-ts-decorator](https://github.com/vcfvct/fixed-width-ts-decorator), [@evologi/fixed-width](https://github.com/evologi/fixed-width)
4. **[ExcelJS](https://github.com/exceljs/exceljs)** vs XLSX - Para exportación
5. **[Web Workers](https://medium.com/@pankajpatil822/how-web-workers-helped-me-keep-the-ui-responsive-while-processing-large-csv-data-a266b466f2e2)** - Para parsing asíncrono

---

## 🎯 DECISIONES FINALES

### ✅ Stack Tecnológico Seleccionado

| Componente | Tecnología | Razón |
|------------|------------|-------|
| **Tabla** | TanStack Table v8 | Headless, flexible, ya instalado en proyecto |
| **Virtual Scrolling** | TanStack Virtual | Mejor integración con TanStack Table, 60fps |
| **Parser** | Custom TypeScript | Máximo control, type-safe, CONSAR-specific |
| **Web Worker** | Vite Worker | Zero-config, TypeScript support |
| **Export Excel** | ExcelJS | Styling avanzado, open-source completo |
| **Export CSV** | Papa Parse | Industry standard, streaming support |
| **Búsqueda** | Fuse.js | Fuzzy search, 0 dependencies |

**Fuentes de investigación**:
- [TanStack Table Virtualization Guide](https://tanstack.com/table/v8/docs/guide/virtualization)
- [TanStack Table vs AG Grid Comparison 2025](https://www.simple-table.com/blog/tanstack-table-vs-ag-grid-comparison)
- [Web Workers for Large CSV Processing](https://medium.com/@pankajpatil822/how-web-workers-helped-me-keep-the-ui-responsive-while-processing-large-csv-data-a266b466f2e2)
- [ExcelJS vs XLSX Performance](https://medium.com/@manishasiram/exceljs-alternate-for-xlsx-package-fc1d36b2e743)

---

## 🏛️ ARQUITECTURA DE 3 CAPAS

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DataViewer Component (React + TanStack Table)       │  │
│  │  ├─ DataViewerHeader (Search, Filters, Export)      │  │
│  │  ├─ VirtualizedTable (TanStack Virtual)             │  │
│  │  ├─ DataViewerFooter (Pagination, Stats)            │  │
│  │  └─ RowDetailModal (Drill-down)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CONSARParser Service                                │  │
│  │  ├─ parseFile(file) → CONSARRecord[]                │  │
│  │  ├─ validateRecord(record) → ValidationResult       │  │
│  │  └─ getRecordSchema(fileType) → Schema              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  DataExporter Service                                │  │
│  │  ├─ exportToCSV(records)                            │  │
│  │  ├─ exportToExcel(records, config)                  │  │
│  │  └─ exportToPDF(records, config)                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  DataFilter Service                                  │  │
│  │  ├─ searchRecords(query) → CONSARRecord[]           │  │
│  │  ├─ filterByColumn(column, value)                   │  │
│  │  └─ filterByErrors() → CONSARRecord[]               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CONSAR Parser Worker (Web Worker)                   │  │
│  │  ├─ Streaming file reader                           │  │
│  │  ├─ Positional format parser (77-char)              │  │
│  │  ├─ Chunk processing (1MB chunks)                   │  │
│  │  └─ Progress reporting                              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  IndexedDB Cache (opcional)                         │  │
│  │  ├─ Cache parsed records                            │  │
│  │  └─ Incremental updates                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 SCHEMA DE DATOS CONSAR

### Interface Principal

```typescript
/**
 * Representa un registro parseado del archivo CONSAR
 * Basado en Circular 19-8 (formato posicional 77 caracteres)
 */
interface CONSARRecord {
  // Metadata
  lineNumber: number
  rawLine: string
  fileType: 'NOMINA' | 'CONTABLE' | 'REGULARIZACION'

  // Campos comunes (posiciones fijas)
  recordType: string        // [01-02] Tipo de registro
  account: string          // [03-10] Número de cuenta (8 dígitos)
  subAccount: string       // [11-14] Subcuenta (4 dígitos)
  date: Date               // [15-22] Fecha YYYYMMDD
  reference: string        // [23-32] Referencia (10 caracteres)

  // Campos específicos por tipo
  nomina?: NominaFields
  contable?: ContableFields
  regularizacion?: RegularizacionFields

  // Validación
  validations: RecordValidation[]
  errors: ValidationError[]
  isValid: boolean

  // UI
  _highlighted?: boolean   // Para búsqueda
  _expanded?: boolean      // Para detail view
}

/**
 * Campos específicos para archivo NOMINA
 */
interface NominaFields {
  employeeId: string       // [33-42] ID empleado (10 dígitos)
  employeeName: string     // [43-62] Nombre (20 caracteres)
  salary: number          // [63-77] Salario (15 caracteres: 13 enteros + 2 decimales)
  currency: 'MXN' | 'USD'
}

/**
 * Campos específicos para archivo CONTABLE
 */
interface ContableFields {
  debit: number           // [33-47] Debe (15 caracteres)
  credit: number          // [48-62] Haber (15 caracteres)
  balance: number         // [63-77] Saldo (15 caracteres)
  currency: 'MXN' | 'USD'
  exchangeRate?: number   // Para cuenta 7115 (conversión divisas)
}

/**
 * Campos específicos para archivo REGULARIZACION
 */
interface RegularizacionFields {
  originalAmount: number
  adjustedAmount: number
  adjustmentReason: string
  approvedBy: string
}

/**
 * Resultado de validación de un registro
 */
interface RecordValidation {
  validatorCode: string    // V001, V002, etc.
  validatorName: string
  field: string           // Campo validado
  status: 'pass' | 'fail' | 'warning'
  message?: string
  expected?: any
  received?: any
}
```

---

## 🔧 COMPONENTES PRINCIPALES

### 1. CONSARParser Service

```typescript
/**
 * Parser de archivos CONSAR con formato posicional
 * Soporta streaming y Web Workers para performance
 */
class CONSARParser {
  private schemas: Map<FileType, CONSARSchema>

  constructor() {
    this.schemas = new Map([
      ['NOMINA', NOMINA_SCHEMA],
      ['CONTABLE', CONTABLE_SCHEMA],
      ['REGULARIZACION', REGULARIZACION_SCHEMA],
    ])
  }

  /**
   * Parsea archivo completo usando Web Worker
   */
  async parseFile(
    file: File,
    fileType: FileType,
    onProgress?: (progress: ParseProgress) => void
  ): Promise<CONSARRecord[]> {
    // Crear worker
    const worker = new Worker(
      new URL('./workers/consar-parser.worker.ts', import.meta.url),
      { type: 'module' }
    )

    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        const { type, data } = e.data

        if (type === 'progress') {
          onProgress?.(data)
        } else if (type === 'complete') {
          resolve(data.records)
          worker.terminate()
        } else if (type === 'error') {
          reject(new Error(data.message))
          worker.terminate()
        }
      }

      // Enviar archivo y schema al worker
      worker.postMessage({
        file,
        schema: this.schemas.get(fileType),
        fileType,
      })
    })
  }

  /**
   * Parsea una sola línea (sin worker)
   */
  parseLine(
    line: string,
    lineNumber: number,
    schema: CONSARSchema,
    fileType: FileType
  ): CONSARRecord {
    // Validar longitud
    if (line.length !== 77) {
      throw new Error(
        `Línea ${lineNumber}: longitud inválida (${line.length}/77 caracteres)`
      )
    }

    // Extraer campos según schema
    const record: Partial<CONSARRecord> = {
      lineNumber,
      rawLine: line,
      fileType,
      recordType: line.substring(0, 2).trim(),
      account: line.substring(2, 10).trim(),
      subAccount: line.substring(10, 14).trim(),
      date: this.parseDate(line.substring(14, 22)),
      reference: line.substring(22, 32).trim(),
    }

    // Extraer campos específicos por tipo
    if (fileType === 'NOMINA') {
      record.nomina = {
        employeeId: line.substring(32, 42).trim(),
        employeeName: line.substring(42, 62).trim(),
        salary: this.parseNumber(line.substring(62, 77)),
        currency: 'MXN',
      }
    } else if (fileType === 'CONTABLE') {
      record.contable = {
        debit: this.parseNumber(line.substring(32, 47)),
        credit: this.parseNumber(line.substring(47, 62)),
        balance: this.parseNumber(line.substring(62, 77)),
        currency: 'MXN',
      }
    }

    // Validar registro
    const validations = this.validateRecord(record as CONSARRecord, schema)
    const errors = validations.filter(v => v.status === 'fail')

    return {
      ...record,
      validations,
      errors,
      isValid: errors.length === 0,
    } as CONSARRecord
  }

  private parseDate(str: string): Date {
    // YYYYMMDD → Date
    const year = parseInt(str.substring(0, 4))
    const month = parseInt(str.substring(4, 6)) - 1
    const day = parseInt(str.substring(6, 8))
    return new Date(year, month, day)
  }

  private parseNumber(str: string): number {
    // Remover espacios y convertir
    // Formato: 13 enteros + 2 decimales
    const clean = str.trim().replace(/[^0-9.-]/g, '')
    return parseFloat(clean) / 100
  }

  private validateRecord(
    record: CONSARRecord,
    schema: CONSARSchema
  ): RecordValidation[] {
    // TODO: Aplicar 37 validadores CONSAR
    // Por ahora, validaciones básicas
    return []
  }
}

/**
 * Schema definition para cada tipo de archivo
 */
interface CONSARSchema {
  name: string
  fields: FieldDefinition[]
  validators: ValidatorDefinition[]
}

interface FieldDefinition {
  name: string
  start: number
  end: number
  type: 'string' | 'number' | 'date'
  required: boolean
  format?: string
}
```

---

### 2. Web Worker (consar-parser.worker.ts)

```typescript
/**
 * Web Worker para parsing de archivos CONSAR
 * Procesa archivo en chunks para evitar bloquear UI
 */

interface WorkerMessage {
  file: File
  schema: CONSARSchema
  fileType: FileType
}

interface ParseProgress {
  linesProcessed: number
  totalLines: number
  errorsFound: number
  warningsFound: number
  percentage: number
  estimatedTimeRemaining: number
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { file, schema, fileType } = e.data

  try {
    const startTime = Date.now()
    const records: CONSARRecord[] = []
    const CHUNK_SIZE = 1024 * 1024 // 1MB chunks

    // Leer archivo en chunks
    const fileReader = new FileReader()
    let offset = 0
    let lineNumber = 0
    let buffer = ''

    while (offset < file.size) {
      const chunk = file.slice(offset, offset + CHUNK_SIZE)
      const text = await readChunk(chunk)
      buffer += text

      // Procesar líneas completas
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Guardar línea incompleta

      for (const line of lines) {
        if (line.trim()) {
          lineNumber++

          try {
            const record = parseLine(line, lineNumber, schema, fileType)
            records.push(record)

            // Reportar progreso cada 1000 líneas
            if (lineNumber % 1000 === 0) {
              const elapsed = Date.now() - startTime
              const linesPerMs = lineNumber / elapsed
              const remaining = (file.size - offset) / CHUNK_SIZE
              const estimatedTimeRemaining = remaining / linesPerMs

              self.postMessage({
                type: 'progress',
                data: {
                  linesProcessed: lineNumber,
                  totalLines: Math.floor(file.size / 77), // Estimado
                  errorsFound: records.filter(r => !r.isValid).length,
                  percentage: (offset / file.size) * 100,
                  estimatedTimeRemaining,
                } as ParseProgress,
              })
            }
          } catch (error) {
            // Log error pero continuar
            console.error(`Error en línea ${lineNumber}:`, error)
          }
        }
      }

      offset += CHUNK_SIZE
    }

    // Procesar última línea
    if (buffer.trim()) {
      lineNumber++
      const record = parseLine(buffer, lineNumber, schema, fileType)
      records.push(record)
    }

    // Enviar resultados completos
    self.postMessage({
      type: 'complete',
      data: {
        records,
        totalLines: lineNumber,
        errors: records.filter(r => !r.isValid).length,
        parseTime: Date.now() - startTime,
      },
    })
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: {
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
    })
  }
}

async function readChunk(chunk: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(chunk, 'UTF-8')
  })
}

function parseLine(
  line: string,
  lineNumber: number,
  schema: CONSARSchema,
  fileType: FileType
): CONSARRecord {
  // Usar misma lógica que CONSARParser.parseLine
  // (copiar código aquí para evitar dependencias)
}
```

---

### 3. DataViewer Component (React)

```tsx
/**
 * Componente principal del visor de datos
 * Usa TanStack Table + TanStack Virtual para performance
 */

import { useReactTable, getCoreRowModel, ColumnDef } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'react'

interface DataViewerProps {
  validationId: string
  file: File
  fileType: FileType
}

export function DataViewer({ validationId, file, fileType }: DataViewerProps) {
  const [records, setRecords] = useState<CONSARRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [parseProgress, setParseProgress] = useState<ParseProgress | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<DataFilter>({ showErrorsOnly: false })

  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Parsear archivo al montar componente
  useEffect(() => {
    const parser = new CONSARParser()

    parser.parseFile(file, fileType, (progress) => {
      setParseProgress(progress)
    }).then((parsedRecords) => {
      setRecords(parsedRecords)
      setIsLoading(false)
    }).catch((error) => {
      console.error('Error parsing file:', error)
      setIsLoading(false)
    })
  }, [file, fileType])

  // Filtrar y buscar
  const filteredRecords = useMemo(() => {
    let result = records

    // Filtro de errores
    if (filter.showErrorsOnly) {
      result = result.filter(r => !r.isValid)
    }

    // Búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r =>
        r.account.toLowerCase().includes(query) ||
        r.rawLine.toLowerCase().includes(query) ||
        r.lineNumber.toString().includes(query)
      )
    }

    return result
  }, [records, filter, searchQuery])

  // Columnas de la tabla
  const columns = useMemo<ColumnDef<CONSARRecord>[]>(() => [
    {
      id: 'lineNumber',
      header: '#',
      accessorKey: 'lineNumber',
      size: 60,
      cell: ({ row }) => (
        <div className="text-center font-mono text-sm">
          {row.original.lineNumber}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      accessorKey: 'isValid',
      size: 80,
      cell: ({ row }) => (
        row.original.isValid ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )
      ),
    },
    {
      id: 'recordType',
      header: 'Tipo',
      accessorKey: 'recordType',
      size: 80,
    },
    {
      id: 'account',
      header: 'Cuenta',
      accessorKey: 'account',
      size: 100,
    },
    {
      id: 'date',
      header: 'Fecha',
      accessorKey: 'date',
      size: 120,
      cell: ({ row }) => format(row.original.date, 'dd/MM/yyyy'),
    },
    // Columnas dinámicas según tipo de archivo
    ...(fileType === 'NOMINA' ? [
      {
        id: 'employeeName',
        header: 'Empleado',
        accessorFn: (row: CONSARRecord) => row.nomina?.employeeName,
        size: 200,
      },
      {
        id: 'salary',
        header: 'Salario',
        accessorFn: (row: CONSARRecord) => row.nomina?.salary,
        size: 120,
        cell: ({ row }: any) => (
          <div className="text-right font-mono">
            ${row.original.nomina?.salary.toFixed(2)}
          </div>
        ),
      },
    ] : []),
    ...(fileType === 'CONTABLE' ? [
      {
        id: 'debit',
        header: 'Debe',
        accessorFn: (row: CONSARRecord) => row.contable?.debit,
        size: 120,
      },
      {
        id: 'credit',
        header: 'Haber',
        accessorFn: (row: CONSARRecord) => row.contable?.credit,
        size: 120,
      },
      {
        id: 'balance',
        header: 'Saldo',
        accessorFn: (row: CONSARRecord) => row.contable?.balance,
        size: 120,
      },
    ] : []),
  ], [fileType])

  // TanStack Table instance
  const table = useReactTable({
    data: filteredRecords,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Mantener referencias estables para performance
    enableRowSelection: true,
    enableMultiRowSelection: true,
  })

  // TanStack Virtual instance (para virtual scrolling)
  const rowVirtualizer = useVirtualizer({
    count: filteredRecords.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, // Altura estimada de fila en px
    overscan: 10, // Precargar 10 filas arriba/abajo
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  if (isLoading) {
    return (
      <LoadingState progress={parseProgress} />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con búsqueda y filtros */}
      <DataViewerHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        totalRecords={records.length}
        filteredRecords={filteredRecords.length}
        errorRecords={records.filter(r => !r.isValid).length}
        onExport={handleExport}
      />

      {/* Tabla virtualizada */}
      <div
        ref={tableContainerRef}
        className="h-[600px] overflow-auto border rounded-lg"
      >
        <div style={{ height: `${totalSize}px`, position: 'relative' }}>
          <table className="w-full">
            <thead className="sticky top-0 bg-white dark:bg-gray-900 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {virtualRows.map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index]
                return (
                  <tr
                    key={row.id}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      position: 'absolute',
                      width: '100%',
                    }}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
                      !row.original.isValid && 'bg-red-50 dark:bg-red-900/20'
                    )}
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="px-3 py-2 text-sm border-b"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer con stats */}
      <DataViewerFooter
        showing={virtualRows.length}
        total={filteredRecords.length}
        allRecords={records.length}
      />
    </div>
  )
}
```

---

## ⚡ OPTIMIZACIONES DE PERFORMANCE

### 1. Virtual Scrolling
```typescript
// Configuración óptima para 100k+ filas
const rowVirtualizer = useVirtualizer({
  count: filteredRecords.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 40,      // Altura fija de fila
  overscan: 10,                 // Precargar 10 filas
  measureElement: undefined,    // NO medir dinámicamente (más rápido)
})
```

**Beneficio**: Solo renderiza ~30 filas a la vez, independientemente del tamaño del dataset.

### 2. Memo y Callbacks Estables
```typescript
// Columnas memoizadas
const columns = useMemo<ColumnDef<CONSARRecord>[]>(() => [...], [fileType])

// Filtrado memoizado
const filteredRecords = useMemo(() => {
  // ...lógica de filtrado
}, [records, filter, searchQuery])
```

### 3. Web Worker para Parsing
- Evita bloquear UI thread
- Streaming de chunks (1MB a la vez)
- Progress reporting cada 1000 líneas

### 4. Debounce en Búsqueda
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => setSearchQuery(query), 300),
  []
)
```

---

## 📤 EXPORTACIÓN DE DATOS

### ExcelJS Export

```typescript
async function exportToExcel(records: CONSARRecord[], config: ExportConfig) {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()

  // Sheet 1: Resumen
  const summarySheet = workbook.addWorksheet('Resumen')
  summarySheet.addRow(['Total de registros', records.length])
  summarySheet.addRow(['Registros válidos', records.filter(r => r.isValid).length])
  summarySheet.addRow(['Registros con errores', records.filter(r => !r.isValid).length])

  // Sheet 2: Datos completos
  const dataSheet = workbook.addWorksheet('Datos')

  // Headers con estilo
  const headerRow = dataSheet.addRow([
    '#', 'Tipo', 'Cuenta', 'Subcuenta', 'Fecha', 'Referencia', 'Estado'
  ])
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  }

  // Datos con formato condicional
  records.forEach(record => {
    const row = dataSheet.addRow([
      record.lineNumber,
      record.recordType,
      record.account,
      record.subAccount,
      format(record.date, 'dd/MM/yyyy'),
      record.reference,
      record.isValid ? 'OK' : 'ERROR'
    ])

    // Resaltar errores en rojo
    if (!record.isValid) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' }
      }
    }
  })

  // Auto-width de columnas
  dataSheet.columns.forEach(column => {
    column.width = 15
  })

  // Generar blob y descargar
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  // Trigger download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `validacion-${Date.now()}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
```

---

## 🧪 TESTING STRATEGY

```typescript
// Mock data generator para testing
export function generateMockCONSARRecords(count: number): CONSARRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    lineNumber: i + 1,
    rawLine: generateMockLine(),
    fileType: 'CONTABLE',
    recordType: '01',
    account: `1101${String(i).padStart(4, '0')}`,
    subAccount: '0001',
    date: new Date(2025, 0, i % 28 + 1),
    reference: `REF${i}`,
    contable: {
      debit: Math.random() * 10000,
      credit: Math.random() * 10000,
      balance: Math.random() * 10000,
      currency: 'MXN',
    },
    validations: [],
    errors: i % 10 === 0 ? [generateMockError()] : [],
    isValid: i % 10 !== 0,
  }))
}

// Performance benchmark
describe('DataViewer Performance', () => {
  it('should render 100k rows in < 2 seconds', async () => {
    const records = generateMockCONSARRecords(100000)
    const start = performance.now()

    render(<DataViewer records={records} />)

    const end = performance.now()
    expect(end - start).toBeLessThan(2000)
  })

  it('should support search with < 300ms latency', async () => {
    const records = generateMockCONSARRecords(10000)
    const { getByPlaceholderText } = render(<DataViewer records={records} />)

    const start = performance.now()
    fireEvent.change(getByPlaceholderText('Buscar...'), {
      target: { value: '1101' }
    })
    const end = performance.now()

    expect(end - start).toBeLessThan(300)
  })
})
```

---

## 📦 DEPENDENCIAS A INSTALAR

```bash
# Core (ya instaladas)
# @tanstack/react-table
# @tanstack/react-virtual

# Exportación
npm install exceljs
npm install papaparse
npm install @types/papaparse --save-dev

# Búsqueda fuzzy (opcional)
npm install fuse.js

# Utilidades
npm install date-fns  # Ya instalado
```

---

## 🎯 CRITERIOS DE ÉXITO

### Performance
- ✅ Renderizar 100k filas sin lag (< 2s initial render)
- ✅ 60fps scrolling constante
- ✅ Búsqueda con latencia < 300ms
- ✅ Export Excel < 5 segundos para 10k filas

### Funcionalidad
- ✅ Parseo correcto de formato posicional 77-char
- ✅ Detección automática de errores por línea
- ✅ Búsqueda global funcional
- ✅ Filtro por errores
- ✅ Export CSV/Excel con formato

### UX
- ✅ Feedback visual durante parsing (progress bar)
- ✅ Highlight de filas con errores
- ✅ Click en fila abre detalle
- ✅ Keyboard navigation (↑↓ arrow keys)
- ✅ Responsive (table scroll en mobile)

---

## 📚 PRÓXIMOS PASOS

1. ✅ Implementar CONSARParser con schemas
2. ✅ Crear Web Worker para parsing
3. ✅ Implementar DataViewer con TanStack Table
4. ✅ Agregar búsqueda y filtros
5. ✅ Implementar exportación Excel
6. ✅ Testing con archivos reales CONSAR
7. ✅ Optimización de performance
8. ✅ Documentación de usuario

---

**Fuentes de Investigación**:

- [TanStack Table Virtualization Guide](https://tanstack.com/table/v8/docs/guide/virtualization)
- [TanStack Table Virtual Scrolling Example](https://tanstack.com/table/v8/docs/framework/react/examples/virtualized-rows)
- [TanStack Table vs AG Grid 2025](https://www.simple-table.com/blog/tanstack-table-vs-ag-grid-comparison)
- [React Table Performance Guide](https://strapi.io/blog/table-in-react-performance-guide)
- [Web Workers for CSV Processing](https://medium.com/@pankajpatil822/how-web-workers-helped-me-keep-the-ui-responsive-while-processing-large-csv-data-a266b466f2e2)
- [ExcelJS vs XLSX Performance](https://medium.com/@manishasiram/exceljs-alternate-for-xlsx-package-fc1d36b2e743)
- [Fixed-Width File Parsers](https://github.com/SteveyPugs/fixy)
- [Advanced Scrolling with TanStack Virtual](https://borstch.com/blog/development/advanced-scrolling-techniques-with-tanstack-virtual-a-guide-for-react-developers)

---

**Última actualización**: 22 de Enero de 2025
**Versión**: 1.0.0
**Status**: ✅ DISEÑO COMPLETO - LISTO PARA IMPLEMENTACIÓN
