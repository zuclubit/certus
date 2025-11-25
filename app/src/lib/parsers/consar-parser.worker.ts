/**
 * CONSAR Parser Web Worker
 *
 * Performs file parsing in background thread to keep UI responsive
 * Reports progress during parsing of large files
 *
 * @module consar-parser-worker
 */

import type { CONSARFileType, ParsedFile, ParsingProgress } from '@/lib/types/consar-record'
import { CONSARParser } from './consar-parser'

/**
 * Message types
 */
interface WorkerRequest {
  type: 'parse'
  file: File
  fileType: CONSARFileType
  reportProgressEvery?: number // Report progress every N lines (default: 1000)
}

interface WorkerResponse {
  type: 'progress' | 'complete' | 'error'
  progress?: ParsingProgress
  result?: ParsedFile
  error?: string
}

/**
 * Worker message handler
 */
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { type, file, fileType, reportProgressEvery = 1000 } = event.data

  if (type !== 'parse') {
    postError('Unknown message type')
    return
  }

  try {
    // Create parser
    const parser = new CONSARParser(fileType)

    // Read file first to get total lines
    const content = await readFileAsText(file)
    const lines = content.split(/\r?\n/).filter(line => line.length > 0)
    const totalLines = lines.length

    // Report initial progress
    postProgress({
      totalLines,
      processedLines: 0,
      percentage: 0,
      phase: 'reading',
    })

    // Start parsing
    const startTime = performance.now()

    postProgress({
      totalLines,
      processedLines: 0,
      percentage: 0,
      phase: 'parsing',
    })

    // Parse with progress reporting
    const result = await parseWithProgress(
      parser,
      lines,
      totalLines,
      reportProgressEvery,
      file
    )

    const parseTime = performance.now() - startTime

    // Add parse time to result
    result.parseTime = parseTime

    // Report completion
    postProgress({
      totalLines,
      processedLines: totalLines,
      percentage: 100,
      phase: 'complete',
    })

    postComplete(result)
  } catch (error) {
    postError(error instanceof Error ? error.message : 'Unknown error')
  }
}

/**
 * Parse file with progress reporting
 */
async function parseWithProgress(
  parser: CONSARParser,
  lines: string[],
  totalLines: number,
  reportEvery: number,
  file: File
): Promise<ParsedFile> {
  const records = []
  const errors = []

  // Extract metadata
  const metadata = parser.extractMetadata(file.name)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    try {
      const record = parser.parseLine(line, lineNumber)
      records.push(record)
    } catch (error) {
      errors.push({
        code: 'PARSE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown parsing error',
        severity: 'error' as const,
        field: 'line',
        position: lineNumber,
      })
    }

    // Report progress every N lines
    if (lineNumber % reportEvery === 0 || lineNumber === totalLines) {
      const percentage = Math.round((lineNumber / totalLines) * 100)

      postProgress({
        totalLines,
        processedLines: lineNumber,
        percentage,
        phase: 'parsing',
      })
    }
  }

  // Calculate statistics
  const validRecords = records.filter(r => r.isValid).length
  const invalidRecords = records.filter(r => !r.isValid && r.errors.length > 0).length
  const warningRecords = records.filter(r => r.warnings.length > 0).length

  return {
    metadata,
    records,
    totalRecords: records.length,
    validRecords,
    invalidRecords,
    warningRecords,
    parseTime: 0, // Will be set by caller
    fileSize: file.size,
    errors,
  }
}

/**
 * Read file as text
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result as string
      resolve(content)
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * Post progress update
 */
function postProgress(progress: ParsingProgress): void {
  const response: WorkerResponse = {
    type: 'progress',
    progress,
  }
  self.postMessage(response)
}

/**
 * Post completion
 */
function postComplete(result: ParsedFile): void {
  const response: WorkerResponse = {
    type: 'complete',
    result,
  }
  self.postMessage(response)
}

/**
 * Post error
 */
function postError(error: string): void {
  const response: WorkerResponse = {
    type: 'error',
    error,
  }
  self.postMessage(response)
}

// Export empty object to make this a module
export {}
