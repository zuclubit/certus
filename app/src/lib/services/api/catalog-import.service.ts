/**
 * Catalog Import Service - Real API Implementation
 *
 * Handles catalog import operations:
 * - Parse Excel, CSV, XML files
 * - Validate data structure
 * - Send entries to backend API
 */

import * as ExcelJS from 'exceljs'
import Papa from 'papaparse'
import apiClient from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { Catalog, CatalogEntry, ApiResponse } from '@/types'

// ============================================
// TYPES
// ============================================

export type ImportFormat = 'excel' | 'csv' | 'xml'

export interface ImportValidationResult {
  isValid: boolean
  recordsFound: number
  errors: ImportError[]
  warnings: ImportWarning[]
  preview: ParsedEntry[]
}

export interface ImportError {
  row: number
  column?: string
  message: string
  value?: string
}

export interface ImportWarning {
  row: number
  column?: string
  message: string
}

export interface ParsedEntry {
  key: string
  value: string
  displayName?: string
  description?: string
  sortOrder?: number
  parentKey?: string
}

export interface ImportResult {
  success: boolean
  totalRecords: number
  imported: number
  failed: number
  errors: ImportError[]
}

export interface ImportProgress {
  current: number
  total: number
  status: 'parsing' | 'validating' | 'importing' | 'completed' | 'error'
  message: string
}

// ============================================
// PARSER FUNCTIONS
// ============================================

/**
 * Parse Excel file and extract catalog entries
 */
async function parseExcelFile(file: File): Promise<ParsedEntry[]> {
  const workbook = new ExcelJS.Workbook()
  const arrayBuffer = await file.arrayBuffer()
  await workbook.xlsx.load(arrayBuffer)

  const entries: ParsedEntry[] = []
  const worksheet = workbook.worksheets[0]

  if (!worksheet) {
    throw new Error('El archivo Excel no contiene hojas de trabajo')
  }

  // Get headers from first row
  const headerRow = worksheet.getRow(1)
  const headers: Record<number, string> = {}

  headerRow.eachCell((cell, colNumber) => {
    const value = cell.value?.toString().toLowerCase().trim() || ''
    headers[colNumber] = value
  })

  // Map column names to our fields
  const columnMap: Record<string, string> = {
    'key': 'key',
    'clave': 'key',
    'codigo': 'key',
    'code': 'key',
    'value': 'value',
    'valor': 'value',
    'nombre': 'value',
    'name': 'value',
    'displayname': 'displayName',
    'display_name': 'displayName',
    'nombre_mostrar': 'displayName',
    'description': 'description',
    'descripcion': 'description',
    'sortorder': 'sortOrder',
    'sort_order': 'sortOrder',
    'orden': 'sortOrder',
    'parentkey': 'parentKey',
    'parent_key': 'parentKey',
    'clave_padre': 'parentKey',
  }

  // Find column indices
  const fieldColumns: Record<string, number> = {}
  for (const [colNum, header] of Object.entries(headers)) {
    const mappedField = columnMap[header]
    if (mappedField) {
      fieldColumns[mappedField] = parseInt(colNum)
    }
  }

  // Validate required columns
  if (!fieldColumns['key'] || !fieldColumns['value']) {
    throw new Error('El archivo debe contener las columnas "key" (o "clave") y "value" (o "valor")')
  }

  // Parse data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return // Skip header

    const entry: ParsedEntry = {
      key: '',
      value: '',
    }

    // Extract values based on column mapping
    if (fieldColumns['key']) {
      entry.key = row.getCell(fieldColumns['key']).value?.toString().trim() || ''
    }
    if (fieldColumns['value']) {
      entry.value = row.getCell(fieldColumns['value']).value?.toString().trim() || ''
    }
    if (fieldColumns['displayName']) {
      entry.displayName = row.getCell(fieldColumns['displayName']).value?.toString().trim()
    }
    if (fieldColumns['description']) {
      entry.description = row.getCell(fieldColumns['description']).value?.toString().trim()
    }
    if (fieldColumns['sortOrder']) {
      const sortValue = row.getCell(fieldColumns['sortOrder']).value
      entry.sortOrder = sortValue ? parseInt(sortValue.toString()) : undefined
    }
    if (fieldColumns['parentKey']) {
      entry.parentKey = row.getCell(fieldColumns['parentKey']).value?.toString().trim()
    }

    // Only add if key and value are present
    if (entry.key && entry.value) {
      entries.push(entry)
    }
  })

  return entries
}

/**
 * Parse CSV file and extract catalog entries
 */
async function parseCsvFile(file: File): Promise<ParsedEntry[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      complete: (results) => {
        const entries: ParsedEntry[] = []

        // Column name mappings
        const columnMap: Record<string, string> = {
          'key': 'key',
          'clave': 'key',
          'codigo': 'key',
          'code': 'key',
          'value': 'value',
          'valor': 'value',
          'nombre': 'value',
          'name': 'value',
          'displayname': 'displayName',
          'display_name': 'displayName',
          'nombre_mostrar': 'displayName',
          'description': 'description',
          'descripcion': 'description',
          'sortorder': 'sortOrder',
          'sort_order': 'sortOrder',
          'orden': 'sortOrder',
          'parentkey': 'parentKey',
          'parent_key': 'parentKey',
          'clave_padre': 'parentKey',
        }

        // Check required columns
        const fields = results.meta.fields || []
        const hasKey = fields.some((f) => ['key', 'clave', 'codigo', 'code'].includes(f))
        const hasValue = fields.some((f) => ['value', 'valor', 'nombre', 'name'].includes(f))

        if (!hasKey || !hasValue) {
          reject(new Error('El archivo debe contener las columnas "key" (o "clave") y "value" (o "valor")'))
          return
        }

        // Parse each row
        for (const row of results.data as Record<string, string>[]) {
          const entry: ParsedEntry = {
            key: '',
            value: '',
          }

          // Map columns to entry fields
          for (const [colName, value] of Object.entries(row)) {
            const mappedField = columnMap[colName]
            if (mappedField && value) {
              if (mappedField === 'sortOrder') {
                entry.sortOrder = parseInt(value) || undefined
              } else {
                ;(entry as Record<string, string | number | undefined>)[mappedField] = value.trim()
              }
            }
          }

          // Only add if key and value are present
          if (entry.key && entry.value) {
            entries.push(entry)
          }
        }

        resolve(entries)
      },
      error: (error) => {
        reject(new Error(`Error al parsear CSV: ${error.message}`))
      },
    })
  })
}

/**
 * Parse XML file and extract catalog entries
 */
async function parseXmlFile(file: File): Promise<ParsedEntry[]> {
  const text = await file.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(text, 'text/xml')

  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror')
  if (parseError) {
    throw new Error('El archivo XML no es válido')
  }

  const entries: ParsedEntry[] = []

  // Try different XML structures
  // Structure 1: <entries><entry><key>...</key><value>...</value></entry></entries>
  let entryNodes = xmlDoc.querySelectorAll('entry, Entry, registro, Registro, item, Item')

  if (entryNodes.length === 0) {
    // Structure 2: <root><row>...</row></root>
    entryNodes = xmlDoc.querySelectorAll('row, Row, record, Record')
  }

  entryNodes.forEach((node) => {
    const entry: ParsedEntry = {
      key: '',
      value: '',
    }

    // Try to find key
    const keyNode = node.querySelector('key, Key, clave, Clave, codigo, Codigo, code, Code')
    if (keyNode) {
      entry.key = keyNode.textContent?.trim() || ''
    }

    // Try to find value
    const valueNode = node.querySelector('value, Value, valor, Valor, nombre, Nombre, name, Name')
    if (valueNode) {
      entry.value = valueNode.textContent?.trim() || ''
    }

    // Optional fields
    const displayNameNode = node.querySelector('displayName, DisplayName, nombre_mostrar')
    if (displayNameNode) {
      entry.displayName = displayNameNode.textContent?.trim()
    }

    const descriptionNode = node.querySelector('description, Description, descripcion, Descripcion')
    if (descriptionNode) {
      entry.description = descriptionNode.textContent?.trim()
    }

    const sortOrderNode = node.querySelector('sortOrder, SortOrder, orden, Orden')
    if (sortOrderNode) {
      entry.sortOrder = parseInt(sortOrderNode.textContent || '') || undefined
    }

    const parentKeyNode = node.querySelector('parentKey, ParentKey, clave_padre')
    if (parentKeyNode) {
      entry.parentKey = parentKeyNode.textContent?.trim()
    }

    // Only add if key and value are present
    if (entry.key && entry.value) {
      entries.push(entry)
    }
  })

  if (entries.length === 0) {
    throw new Error('No se encontraron entradas válidas en el archivo XML')
  }

  return entries
}

// ============================================
// SERVICE CLASS
// ============================================

export class CatalogImportService {
  /**
   * Parse a file and extract catalog entries
   */
  static async parseFile(file: File, format: ImportFormat): Promise<ParsedEntry[]> {
    switch (format) {
      case 'excel':
        return parseExcelFile(file)
      case 'csv':
        return parseCsvFile(file)
      case 'xml':
        return parseXmlFile(file)
      default:
        throw new Error(`Formato no soportado: ${format}`)
    }
  }

  /**
   * Validate parsed entries before import
   */
  static validateEntries(entries: ParsedEntry[]): ImportValidationResult {
    const errors: ImportError[] = []
    const warnings: ImportWarning[] = []
    const seenKeys = new Set<string>()

    entries.forEach((entry, index) => {
      const row = index + 2 // Account for header row

      // Check for empty key
      if (!entry.key) {
        errors.push({
          row,
          column: 'key',
          message: 'La clave es requerida',
        })
      }

      // Check for empty value
      if (!entry.value) {
        errors.push({
          row,
          column: 'value',
          message: 'El valor es requerido',
        })
      }

      // Check for duplicate keys
      if (entry.key && seenKeys.has(entry.key)) {
        errors.push({
          row,
          column: 'key',
          message: `Clave duplicada: ${entry.key}`,
          value: entry.key,
        })
      } else if (entry.key) {
        seenKeys.add(entry.key)
      }

      // Check key format (alphanumeric, underscore, hyphen)
      if (entry.key && !/^[A-Za-z0-9_-]+$/.test(entry.key)) {
        warnings.push({
          row,
          column: 'key',
          message: 'La clave contiene caracteres especiales',
        })
      }

      // Check sortOrder is valid number
      if (entry.sortOrder !== undefined && isNaN(entry.sortOrder)) {
        warnings.push({
          row,
          column: 'sortOrder',
          message: 'El orden debe ser un número',
        })
      }
    })

    return {
      isValid: errors.length === 0,
      recordsFound: entries.length,
      errors,
      warnings,
      preview: entries.slice(0, 10), // First 10 for preview
    }
  }

  /**
   * Import entries to a catalog via API
   */
  static async importToCatalog(
    catalogId: string,
    entries: ParsedEntry[],
    onProgress?: (progress: ImportProgress) => void
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRecords: entries.length,
      imported: 0,
      failed: 0,
      errors: [],
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]

      onProgress?.({
        current: i + 1,
        total: entries.length,
        status: 'importing',
        message: `Importando entrada ${i + 1} de ${entries.length}`,
      })

      try {
        await apiClient.post(API_ENDPOINTS.CATALOGS.ENTRIES(catalogId), {
          key: entry.key,
          value: entry.value,
          displayName: entry.displayName || entry.value,
          description: entry.description,
          sortOrder: entry.sortOrder,
          parentKey: entry.parentKey,
        })

        result.imported++
      } catch (error: unknown) {
        result.failed++
        const axiosError = error as { response?: { data?: { error?: string; message?: string } } }
        result.errors.push({
          row: i + 2,
          message: axiosError.response?.data?.error || axiosError.response?.data?.message || 'Error al importar entrada',
          value: entry.key,
        })
      }
    }

    result.success = result.failed === 0

    onProgress?.({
      current: entries.length,
      total: entries.length,
      status: result.success ? 'completed' : 'error',
      message: result.success
        ? `Importación completada: ${result.imported} entradas`
        : `Importación con errores: ${result.imported} éxitos, ${result.failed} fallos`,
    })

    return result
  }

  /**
   * Get available catalogs for import
   */
  static async getAvailableCatalogs(): Promise<Catalog[]> {
    const response = await apiClient.get<Catalog[]>(API_ENDPOINTS.CATALOGS.LIST)
    return response.data
  }

  /**
   * Create a new catalog and import entries
   */
  static async createAndImport(
    catalogData: {
      code: string
      name: string
      description?: string
      source?: string
    },
    entries: ParsedEntry[],
    onProgress?: (progress: ImportProgress) => void
  ): Promise<{ catalog: Catalog; importResult: ImportResult }> {
    onProgress?.({
      current: 0,
      total: entries.length + 1,
      status: 'importing',
      message: 'Creando catálogo...',
    })

    // Create the catalog first
    const catalogResponse = await apiClient.post<Catalog>(API_ENDPOINTS.CATALOGS.CREATE, {
      code: catalogData.code,
      name: catalogData.name,
      description: catalogData.description,
      source: catalogData.source || 'INTERNO',
    })

    const catalog = catalogResponse.data

    // Then import entries
    const importResult = await this.importToCatalog(catalog.id, entries, onProgress)

    return {
      catalog,
      importResult,
    }
  }
}

export default CatalogImportService
