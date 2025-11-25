/**
 * Excel Exporter Service
 *
 * Export CONSAR data to Excel format with styling using ExcelJS
 *
 * @module excel-exporter
 */

import ExcelJS from 'exceljs'
import type { AnyRecord, ParsedFile, ExportOptions } from '@/lib/types/consar-record'
import { formatAmount } from '@/lib/schemas/consar-schema'

/**
 * Export data to Excel
 */
export async function exportToExcel(
  parsedFile: ParsedFile,
  options: ExportOptions = { format: 'excel' }
): Promise<void> {
  const {
    filteredOnly = false,
    includeErrors = true,
    includeWarnings = true,
    filename,
    includeSummary = true,
    applyFormatting = true,
  } = options

  // Create workbook
  const workbook = new ExcelJS.Workbook()

  workbook.creator = 'Certus - Sistema de Validación CONSAR'
  workbook.created = new Date()
  workbook.modified = new Date()

  // Add summary sheet
  if (includeSummary) {
    addSummarySheet(workbook, parsedFile)
  }

  // Add data sheet
  addDataSheet(workbook, parsedFile, applyFormatting)

  // Add errors sheet (if there are errors)
  if (includeErrors && parsedFile.invalidRecords > 0) {
    addErrorsSheet(workbook, parsedFile, applyFormatting)
  }

  // Generate filename
  const finalFilename = filename || generateFilename(parsedFile)

  // Generate blob and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  downloadBlob(blob, `${finalFilename}.xlsx`)
}

/**
 * Add summary sheet
 */
function addSummarySheet(workbook: ExcelJS.Workbook, parsedFile: ParsedFile): void {
  const sheet = workbook.addWorksheet('Resumen', {
    views: [{ showGridLines: false }],
  })

  // Title
  sheet.mergeCells('A1:D1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = 'Resumen de Validación CONSAR'
  titleCell.font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  sheet.getRow(1).height = 30

  // Metadata section
  sheet.getCell('A3').value = 'Información del Archivo'
  sheet.getCell('A3').font = { bold: true, size: 12 }

  const metadata = [
    ['Archivo:', parsedFile.metadata.originalName],
    ['Tipo:', parsedFile.metadata.type],
    ['RFC:', parsedFile.metadata.rfc],
    ['Fecha:', parsedFile.metadata.date],
    ['Secuencia:', parsedFile.metadata.sequence],
    ['Tamaño:', `${(parsedFile.fileSize / 1024).toFixed(2)} KB`],
    ['Tiempo de Procesamiento:', `${(parsedFile.parseTime / 1000).toFixed(2)}s`],
  ]

  let row = 4
  metadata.forEach(([label, value]) => {
    sheet.getCell(`A${row}`).value = label
    sheet.getCell(`A${row}`).font = { bold: true }
    sheet.getCell(`B${row}`).value = value
    row++
  })

  // Statistics section
  row += 2
  sheet.getCell(`A${row}`).value = 'Estadísticas'
  sheet.getCell(`A${row}`).font = { bold: true, size: 12 }
  row++

  const stats = [
    ['Total de Registros:', parsedFile.totalRecords],
    ['Registros Válidos:', parsedFile.validRecords],
    ['Registros con Errores:', parsedFile.invalidRecords],
    ['Registros con Advertencias:', parsedFile.warningRecords],
    [
      'Tasa de Éxito:',
      `${((parsedFile.validRecords / parsedFile.totalRecords) * 100).toFixed(2)}%`,
    ],
  ]

  stats.forEach(([label, value]) => {
    sheet.getCell(`A${row}`).value = label
    sheet.getCell(`A${row}`).font = { bold: true }
    sheet.getCell(`B${row}`).value = value

    // Color-code statistics
    if (label.includes('Válidos')) {
      sheet.getCell(`B${row}`).font = { bold: true, color: { argb: 'FF059669' } }
    } else if (label.includes('Errores')) {
      sheet.getCell(`B${row}`).font = { bold: true, color: { argb: 'FFDC2626' } }
    } else if (label.includes('Advertencias')) {
      sheet.getCell(`B${row}`).font = { bold: true, color: { argb: 'FFCA8A04' } }
    }

    row++
  })

  // Column widths
  sheet.getColumn('A').width = 30
  sheet.getColumn('B').width = 30
}

/**
 * Add data sheet
 */
function addDataSheet(
  workbook: ExcelJS.Workbook,
  parsedFile: ParsedFile,
  applyFormatting: boolean
): void {
  const sheet = workbook.addWorksheet('Datos')

  // Determine columns based on file type
  const headers = getHeadersForFileType(parsedFile.metadata.type)

  // Add headers
  const headerRow = sheet.addRow(headers.map(h => h.label))

  // Style headers
  if (applyFormatting) {
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' },
    }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
    headerRow.height = 25
  }

  // Add data
  parsedFile.records.forEach(record => {
    const rowData = headers.map(header => {
      const value = (record as Record<string, unknown>)[header.key]

      // Format currency fields
      if (header.key.includes('amount') || header.key.includes('Amount')) {
        return typeof value === 'number' ? value / 100 : 0
      }

      return value !== null && value !== undefined ? String(value) : ''
    })

    const dataRow = sheet.addRow(rowData)

    // Apply conditional formatting
    if (applyFormatting) {
      if (!record.isValid) {
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEE2E2' },
        }
      } else if (record.warnings.length > 0) {
        dataRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' },
        }
      }
    }
  })

  // Set column widths
  headers.forEach((header, index) => {
    sheet.getColumn(index + 1).width = header.width || 15
  })

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
}

/**
 * Add errors sheet
 */
function addErrorsSheet(
  workbook: ExcelJS.Workbook,
  parsedFile: ParsedFile,
  applyFormatting: boolean
): void {
  const sheet = workbook.addWorksheet('Errores')

  // Headers
  const headers = ['Línea', 'Código', 'Campo', 'Mensaje', 'Referencia', 'Línea Original']
  const headerRow = sheet.addRow(headers)

  // Style headers
  if (applyFormatting) {
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' },
    }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
    headerRow.height = 25
  }

  // Add error records
  parsedFile.records
    .filter(record => !record.isValid)
    .forEach(record => {
      record.errors.forEach(error => {
        sheet.addRow([
          record.lineNumber,
          error.code,
          error.field || '-',
          error.message,
          error.reference || '-',
          record.rawLine,
        ])
      })
    })

  // Set column widths
  sheet.getColumn(1).width = 10
  sheet.getColumn(2).width = 20
  sheet.getColumn(3).width = 15
  sheet.getColumn(4).width = 50
  sheet.getColumn(5).width = 25
  sheet.getColumn(6).width = 80

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
}

/**
 * Get headers for file type
 */
function getHeadersForFileType(
  fileType: string
): Array<{ key: string; label: string; width?: number }> {
  const baseHeaders = [
    { key: 'lineNumber', label: 'Línea', width: 10 },
    { key: 'recordType', label: 'Tipo', width: 10 },
  ]

  if (fileType === 'NOMINA') {
    return [
      ...baseHeaders,
      { key: 'nss', label: 'NSS', width: 15 },
      { key: 'curp', label: 'CURP', width: 20 },
      { key: 'employeeName', label: 'Nombre', width: 35 },
      { key: 'amount', label: 'Importe', width: 15 },
      { key: 'movementType', label: 'Tipo Mov.', width: 12 },
      { key: 'account', label: 'Cuenta', width: 15 },
      { key: 'isValid', label: 'Válido', width: 10 },
    ]
  }

  if (fileType === 'CONTABLE') {
    return [
      ...baseHeaders,
      { key: 'accountCode', label: 'Cuenta', width: 12 },
      { key: 'date', label: 'Fecha', width: 12 },
      { key: 'concept', label: 'Concepto', width: 40 },
      { key: 'debitAmount', label: 'Cargo', width: 15 },
      { key: 'creditAmount', label: 'Abono', width: 15 },
      { key: 'currency', label: 'Moneda', width: 10 },
      { key: 'isValid', label: 'Válido', width: 10 },
    ]
  }

  if (fileType === 'REGULARIZACION') {
    return [
      ...baseHeaders,
      { key: 'account', label: 'Cuenta', width: 15 },
      { key: 'originalDate', label: 'Fecha Original', width: 15 },
      { key: 'correctionDate', label: 'Fecha Corrección', width: 15 },
      { key: 'originalAmount', label: 'Importe Original', width: 18 },
      { key: 'correctedAmount', label: 'Importe Corregido', width: 18 },
      { key: 'reason', label: 'Motivo', width: 35 },
      { key: 'isValid', label: 'Válido', width: 10 },
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
 * Download blob as file
 */
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
