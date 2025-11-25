/**
 * Raw File Exporter
 *
 * Export parsed data back to original CONSAR format (77 characters per line)
 *
 * @module raw-exporter
 */

import type { ParsedFile } from '@/lib/types/consar-record'

/**
 * Export parsed data as raw CONSAR file (77 characters per line)
 */
export function exportToRaw(parsedFile: ParsedFile, filename?: string): void {
  // Reconstruct file from raw lines
  const lines = parsedFile.records.map(record => record.rawLine)
  const content = lines.join('\n')

  // Generate filename
  const finalFilename = filename || generateFilename(parsedFile)

  // Download
  downloadRaw(content, finalFilename)
}

/**
 * Generate filename
 */
function generateFilename(parsedFile: ParsedFile): string {
  const { type, rfc, date, sequence } = parsedFile.metadata
  return `${type}_${rfc}_${date}_${sequence}.txt`
}

/**
 * Download raw content as file
 */
function downloadRaw(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Get file content as string (for preview)
 */
export function getRawContent(parsedFile: ParsedFile): string {
  return parsedFile.records.map(record => record.rawLine).join('\n')
}

/**
 * Download specific records as raw file
 */
export function exportRecordsToRaw(
  records: Array<{ rawLine: string }>,
  filename: string
): void {
  const content = records.map(record => record.rawLine).join('\n')
  downloadRaw(content, filename)
}
