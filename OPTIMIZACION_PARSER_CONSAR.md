# ⚡ OPTIMIZACIÓN PARSER CONSAR

**Proyecto**: Certus - Sistema de Validación CONSAR
**Fecha**: 22 de Enero de 2025
**Objetivo**: Optimizar parser para archivos de 100MB+ con 60-80% mejora de performance

---

## 📊 ESTADO ACTUAL

### Parser Existente (Implementado)

✅ **Fortalezas**:
- Diseño schema-based (mantenible)
- Web Worker para background processing
- Reporte de progreso
- Type-safe con TypeScript
- Validación field-level y record-level
- Manejo robusto de errores

⚠️ **Limitaciones**:
- Carga archivo completo en memoria
- Usa `split('\n')` (genera garbage collection)
- Sin cache de operaciones costosas
- Un solo worker (no pool)
- Sin batching de errores

---

## 🎯 OPTIMIZACIONES PLANIFICADAS

### Fase 1: Quick Wins (15-25% mejora) - 4h

#### 1.1 Integración Zod para Validación
```typescript
// Ya instalado: zod@3.24.0
import { z } from 'zod'

const nominaRecordSchema = z.object({
  nss: z.string().regex(/^\d{11}$/),
  curp: z.string().regex(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/),
  amount: z.number().min(0),
  // ... más campos
}).strict()

// Runtime validation + mejor error messages
const validateRecord = (data: unknown) => {
  return nominaRecordSchema.safeParse(data)
}
```

#### 1.2 Pre-compilar Regex Patterns
```typescript
// Antes: new RegExp cada vez
if (value.match(/^\d{11}$/)) { }

// Después: compilado una vez
const NSS_PATTERN = /^\d{11}$/
const CURP_PATTERN = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/
const RFC_PATTERN = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/

if (NSS_PATTERN.test(value)) { }
```

#### 1.3 Cache de Parseo de Fechas
```typescript
const dateCache = new Map<string, Date>()

function parseDateCached(dateStr: string): Date | null {
  if (dateCache.has(dateStr)) {
    return dateCache.get(dateStr)!
  }

  const date = parseDate(dateStr)
  if (date) {
    dateCache.set(dateStr, date)
  }
  return date
}
```

#### 1.4 Usar substring() en lugar de slice()
```typescript
// Más rápido para extraer campos
function extractField(line: string, start: number, length: number): string {
  return line.substring(start - 1, start - 1 + length)
}
```

#### 1.5 Batching de Errores en UI
```typescript
const ERROR_BATCH_SIZE = 100
let errorBatch: ValidationError[] = []

function reportError(error: ValidationError) {
  errorBatch.push(error)

  if (errorBatch.length >= ERROR_BATCH_SIZE) {
    self.postMessage({ type: 'errors', errors: errorBatch })
    errorBatch = []
  }
}
```

**Resultado Esperado**: 15-25% mejora de performance

---

### Fase 2: Streaming Architecture (40-60% mejora) - 8h

#### 2.1 Buffer-Based Line Reading

**Problema Actual**:
```typescript
// Carga todo en memoria
const content = await this.readFile(file)
const lines = content.split(/\r?\n/)  // Genera basura GC
```

**Solución Optimizada**:
```typescript
async function* readLinesStreaming(file: File): AsyncGenerator<string> {
  const stream = file.stream()
  const reader = stream.getReader()

  let buffer = ''
  const decoder = new TextDecoder('utf-8')

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    let lineEnd
    while ((lineEnd = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, lineEnd)
      buffer = buffer.slice(lineEnd + 1)

      if (line.length > 0) {
        yield line.replace('\r', '')
      }
    }
  }

  if (buffer.length > 0) {
    yield buffer
  }
}
```

**Beneficio**: No carga todo el archivo en memoria

---

#### 2.2 Generator-Based Record Processing

```typescript
async function* parseRecordsStreaming(
  file: File,
  schema: CONSARSchema
): AsyncGenerator<ParsedRecord> {
  let lineNumber = 0

  for await (const line of readLinesStreaming(file)) {
    lineNumber++
    const record = parseLine(line, lineNumber, schema)
    yield record  // Yield individual records
  }
}

// Consumir en chunks
async function processFile(file: File) {
  const batchSize = 1000
  let batch: ParsedRecord[] = []

  for await (const record of parseRecordsStreaming(file, schema)) {
    batch.push(record)

    if (batch.length >= batchSize) {
      await processBatch(batch)
      batch = []
    }
  }

  if (batch.length > 0) {
    await processBatch(batch)
  }
}
```

**Beneficio**: Procesa y reporta incrementalmente

---

#### 2.3 Worker Pool para Paralelización

```typescript
class WorkerPool {
  private workers: Worker[] = []
  private available: Worker[] = []

  constructor(size: number = 3) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(
        new URL('./consar-parser.worker.ts', import.meta.url),
        { type: 'module' }
      )
      this.workers.push(worker)
      this.available.push(worker)
    }
  }

  async getWorker(): Promise<Worker> {
    while (this.available.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    return this.available.pop()!
  }

  releaseWorker(worker: Worker): void {
    this.available.push(worker)
  }
}

// Uso
const pool = new WorkerPool(3)

async function processChunksInParallel(chunks: string[][]) {
  const promises = chunks.map(async chunk => {
    const worker = await pool.getWorker()
    try {
      const result = await processChunkInWorker(worker, chunk)
      return result
    } finally {
      pool.releaseWorker(worker)
    }
  })

  return Promise.all(promises)
}
```

**Beneficio**: Paraleliza procesamiento CPU-bound

---

### Fase 3: Advanced Optimizations (60-80% mejora) - 12h

#### 3.1 UTF-8 Buffer Processing (78% mejora potencial)

Basado en investigación de [Node.js 14GB files processing](https://dev.to/pmbanugo/nodejs-performance-processing-14gb-files-78-faster-with-buffer-optimization-540i):

**Concepto**: Trabajar directamente con buffers UTF-8 en lugar de strings UTF-16

```typescript
class BufferLineReader {
  private buffer: Uint8Array
  private position: number = 0

  constructor(private file: File) {}

  async* readLines(): AsyncGenerator<Uint8Array> {
    const stream = this.file.stream()
    const reader = stream.getReader()

    let accumulated = new Uint8Array(0)

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // Concatenate buffers
      const temp = new Uint8Array(accumulated.length + value.length)
      temp.set(accumulated)
      temp.set(value, accumulated.length)
      accumulated = temp

      // Find newline (0x0A)
      let start = 0
      for (let i = 0; i < accumulated.length; i++) {
        if (accumulated[i] === 0x0A) {
          yield accumulated.slice(start, i)
          start = i + 1
        }
      }

      // Keep remaining
      accumulated = accumulated.slice(start)
    }

    if (accumulated.length > 0) {
      yield accumulated
    }
  }
}

// Parse directly from buffer
function parseFieldFromBuffer(
  buffer: Uint8Array,
  start: number,
  length: number
): string {
  const slice = buffer.slice(start, start + length)
  return new TextDecoder('utf-8').decode(slice).trim()
}
```

**Beneficio**: Reduce uso de memoria a la mitad, 50-78% más rápido

---

#### 3.2 Parallel Chunk Processing

```typescript
async function parseFileParallel(file: File): Promise<ParsedFile> {
  // 1. Split file into chunks by line count
  const chunkSize = 10000  // 10k lines per chunk
  const chunks: string[][] = []

  let currentChunk: string[] = []
  for await (const line of readLinesStreaming(file)) {
    currentChunk.push(line)

    if (currentChunk.length >= chunkSize) {
      chunks.push(currentChunk)
      currentChunk = []
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  // 2. Process chunks in parallel workers
  const results = await processChunksInParallel(chunks)

  // 3. Merge results
  return mergeResults(results)
}
```

**Beneficio**: Utiliza múltiples cores CPU

---

## 📦 NUEVOS ARCHIVOS A CREAR

```
app/src/lib/optimizations/
├── streaming-parser.ts          # Parser con streaming
├── buffer-reader.ts              # Lectura basada en buffers
├── validation-cache.ts           # Cache para validaciones
├── worker-pool.ts                # Pool de workers
├── zod-validators.ts             # Schemas Zod
└── performance-monitor.ts        # Métricas de performance
```

---

## 🧪 BENCHMARKS ESPERADOS

| Optimización | Archivo 10MB | Archivo 50MB | Archivo 100MB |
|--------------|--------------|--------------|---------------|
| **Actual** | 5s | 25s | 50s |
| **Fase 1** | 4s | 20s | 40s |
| **Fase 2** | 2.5s | 12s | 25s |
| **Fase 3** | 1.5s | 7s | 15s |

**Mejora Total Esperada**: **70% más rápido**

---

## 🎯 PRIORIZACIÓN

### Implementación Inmediata (Fase 1)
- ✅ Zod integration
- ✅ Pre-compilar regex
- ✅ Cache de fechas
- ✅ Substring en lugar de slice
- ✅ Batching de errores

**Esfuerzo**: 4 horas
**Beneficio**: 20% mejora
**ROI**: ⭐⭐⭐⭐⭐

### Implementación Corto Plazo (Fase 2)
- ✅ Streaming line reader
- ✅ Generator-based processing
- ✅ Worker pool

**Esfuerzo**: 8 horas
**Beneficio**: 40% mejora adicional
**ROI**: ⭐⭐⭐⭐

### Implementación Futuro (Fase 3)
- ⏰ Buffer-based processing
- ⏰ Parallel chunking

**Esfuerzo**: 12 horas
**Beneficio**: 20% mejora adicional
**ROI**: ⭐⭐⭐

---

## 📋 PLAN DE IMPLEMENTACIÓN

1. **Ahora**: Implementar PDF Generation (32h)
2. **Siguiente Sprint**: Fase 1 de optimizaciones (4h)
3. **Sprint +1**: Fase 2 de optimizaciones (8h)
4. **Futuro**: Fase 3 si necesario

**Razón**: PDF es funcionalidad crítica del usuario. Optimizaciones son mejora de performance.

---

**Última actualización**: 22 de Enero de 2025
**Estado**: 📋 PLAN COMPLETO - FASE 1 LISTA PARA IMPLEMENTAR
