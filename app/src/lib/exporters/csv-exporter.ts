/**
 * CSV Exporter Service
 *
 * Export CONSAR data to CSV format using Papa Parse
 *
 * @module csv-exporter
 */

import Papa from 'papaparse'
import type { AnyRecord, ParsedFile, ExportOptions } from '@/lib/types/consar-record'
import { formatAmount } from '@/lib/schemas/consar-schema'

/**
 * Export data to CSV
 */
export function exportToCSV(
  parsedFile: ParsedFile,
  options: ExportOptions = { format: 'csv' }
): void {
  const {
    filteredOnly = false,
    includeErrors = true,
    filename,
  } = options

  // Get headers based on file type
  const headers = getHeadersForFileType(parsedFile.metadata.type)

  // Convert records to CSV rows
  const rows = parsedFile.records.map(record => {
    const row: Record<string, string | number> = {}

    headers.forEach(header => {
      const value = (record as Record<string, unknown>)[header.key]

      // Format currency fields
      if (header.key.includes('amount') || header.key.includes('Amount')) {
        row[header.label] = typeof value === 'number' ? formatAmount(value) : '$0.00'
      }
      // Format boolean fields
      else if (typeof value === 'boolean') {
        row[header.label] = value ? 'Sí' : 'No'
      }
      // Default
      else {
        row[header.label] = value !== null && value !== undefined ? String(value) : ''
      }
    })

    return row
  })

  // Convert to CSV using Papa Parse
  const csv = Papa.unparse(rows, {
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ',',
    header: true,
    newline: '\r\n',
  })

  // Generate filename
  const finalFilename = filename || generateFilename(parsedFile)

  // Download
  downloadCSV(csv, `${finalFilename}.csv`)
}

/**
 * Export errors to CSV
 */
export function exportErrorsToCSV(parsedFile: ParsedFile, filename?: string): void {
  const headers = ['Línea', 'Código', 'Campo', 'Mensaje', 'Referencia', 'Severidad']

  const rows = parsedFile.records
    .filter(record => !record.isValid)
    .flatMap(record =>
      record.errors.map(error => ({
        Línea: record.lineNumber,
        Código: error.code,
        Campo: error.field || '-',
        Mensaje: error.message,
        Referencia: error.reference || '-',
        Severidad: error.severity,
      }))
    )

  const csv = Papa.unparse(rows, {
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ',',
    header: true,
    newline: '\r\n',
  })

  const finalFilename = filename || `${parsedFile.metadata.type}_Errores_${Date.now()}`
  downloadCSV(csv, `${finalFilename}.csv`)
}

/**
 * Get headers for file type
 */
function getHeadersForFileType(
  fileType: string
): Array<{ key: string; label: string }> {
  const baseHeaders = [
    { key: 'lineNumber', label: 'Línea' },
    { key: 'recordType', label: 'Tipo Registro' },
  ]

  if (fileType === 'NOMINA') {
    return [
      ...baseHeaders,
      { key: 'nss', label: 'NSS' },
      { key: 'curp', label: 'CURP' },
      { key: 'employeeName', label: 'Nombre Trabajador' },
      { key: 'amount', label: 'Importe' },
      { key: 'movementType', label: 'Tipo Movimiento' },
      { key: 'paymentDate', label: 'Fecha Pago' },
      { key: 'account', label: 'Cuenta Individual' },
      { key: 'companyRFC', label: 'RFC Patrón' },
      { key: 'isValid', label: 'Válido' },
    ]
  }

  if (fileType === 'CONTABLE') {
    return [
      ...baseHeaders,
      { key: 'accountCode', label: 'Código Cuenta' },
      { key: 'subAccountCode', label: 'Subcuenta' },
      { key: 'date', label: 'Fecha' },
      { key: 'debitAmount', label: 'Cargo' },
      { key: 'creditAmount', label: 'Abono' },
      { key: 'reference', label: 'Referencia' },
      { key: 'concept', label: 'Concepto' },
      { key: 'currency', label: 'Moneda' },
      { key: 'isValid', label: 'Válido' },
    ]
  }

  if (fileType === 'REGULARIZACION') {
    return [
      ...baseHeaders,
      { key: 'account', label: 'Cuenta Individual' },
      { key: 'nss', label: 'NSS' },
      { key: 'originalDate', label: 'Fecha Original' },
      { key: 'correctionDate', label: 'Fecha Corrección' },
      { key: 'originalAmount', label: 'Importe Original' },
      { key: 'correctedAmount', label: 'Importe Corregido' },
      { key: 'reason', label: 'Motivo Regularización' },
      { key: 'authReference', label: 'Referencia Autorización' },
      { key: 'isValid', label: 'Válido' },
    ]
  }

  return baseHeaders
}

/**
 * Generate filename
 */
function generateFilename(parsedFile: ParsedFile): string {
  const { type, rfc, date } = parsedFile.metadata
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
  return `${type}_${rfc}_${date}_Export_${timestamp}`
}

/**
 * Download CSV content as file
 */
function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
