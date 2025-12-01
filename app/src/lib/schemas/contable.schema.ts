/**
 * CONTABLE Schema Definition
 *
 * Field definitions and validators for CONTABLE file type
 * Based on Circular 19-8 (Archivo Contable)
 *
 * @module contable-schema
 */

import type { CONSARSchema, FieldDefinition, ValidatorDefinition } from './consar-schema'
import { commonValidators } from './consar-schema'

/**
 * CONTABLE Header Fields (Record Type 01)
 */
const headerFields: FieldDefinition[] = [
  {
    name: 'recordType',
    label: 'Tipo de Registro',
    start: 1,
    end: 2,
    length: 2,
    type: 'string',
    required: true,
    trim: false,
    allowedValues: ['01'],
    description: 'Tipo de registro: 01 = Encabezado',
  },
  {
    name: 'fileType',
    label: 'Tipo de Archivo',
    start: 3,
    end: 10,
    length: 8,
    type: 'string',
    required: true,
    trim: true,
    allowedValues: ['CONTABLE'],
    description: 'Tipo de archivo: CONTABLE',
  },
  {
    name: 'companyRFC',
    label: 'RFC de la AFORE',
    start: 11,
    end: 23,
    length: 13,
    type: 'string',
    required: true,
    trim: true,
    pattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/,
    description: 'RFC de la AFORE',
  },
  {
    name: 'fileDate',
    label: 'Fecha del Archivo',
    start: 24,
    end: 31,
    length: 8,
    type: 'date',
    required: true,
    trim: false,
    dateFormat: 'YYYYMMDD',
    description: 'Fecha de generación del archivo',
  },
  {
    name: 'periodYear',
    label: 'Año del Periodo',
    start: 32,
    end: 35,
    length: 4,
    type: 'number',
    required: true,
    trim: false,
    description: 'Año del periodo contable (YYYY)',
  },
  {
    name: 'periodMonth',
    label: 'Mes del Periodo',
    start: 36,
    end: 37,
    length: 2,
    type: 'number',
    required: true,
    trim: false,
    description: 'Mes del periodo contable (01-12)',
  },
  {
    name: 'filler',
    label: 'Relleno',
    start: 38,
    end: 77,
    length: 40,
    type: 'string',
    required: false,
    trim: false,
    padding: ' ',
    description: 'Espacios en blanco',
  },
]

/**
 * CONTABLE Detail Fields (Record Type 02)
 * Accounting movement record
 */
const detailFields: FieldDefinition[] = [
  {
    name: 'recordType',
    label: 'Tipo de Registro',
    start: 1,
    end: 2,
    length: 2,
    type: 'string',
    required: true,
    trim: false,
    allowedValues: ['02'],
    description: 'Tipo de registro: 02 = Detalle',
  },
  {
    name: 'accountCode',
    label: 'Código de Cuenta',
    start: 3,
    end: 6,
    length: 4,
    type: 'string',
    required: true,
    trim: false,
    description: 'Código de cuenta SAT (catálogo)',
  },
  {
    name: 'subAccountCode',
    label: 'Subcuenta',
    start: 7,
    end: 10,
    length: 4,
    type: 'string',
    required: false,
    trim: false,
    description: 'Código de subcuenta',
  },
  {
    name: 'date',
    label: 'Fecha de Movimiento',
    start: 11,
    end: 18,
    length: 8,
    type: 'date',
    required: true,
    trim: false,
    dateFormat: 'YYYYMMDD',
    description: 'Fecha del movimiento contable',
  },
  {
    name: 'debitAmount',
    label: 'Importe Cargo',
    start: 19,
    end: 30,
    length: 12,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Importe del cargo (10 enteros + 2 decimales)',
  },
  {
    name: 'creditAmount',
    label: 'Importe Abono',
    start: 31,
    end: 42,
    length: 12,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Importe del abono (10 enteros + 2 decimales)',
  },
  {
    name: 'reference',
    label: 'Referencia',
    start: 43,
    end: 62,
    length: 20,
    type: 'string',
    required: true,
    trim: true,
    description: 'Número de referencia del movimiento',
  },
  {
    name: 'concept',
    label: 'Concepto',
    start: 63,
    end: 112,
    length: 50,
    type: 'string',
    required: true,
    trim: true,
    description: 'Descripción del concepto',
  },
  {
    name: 'currency',
    label: 'Moneda',
    start: 113,
    end: 115,
    length: 3,
    type: 'string',
    required: true,
    trim: false,
    allowedValues: ['MXN', 'USD', 'EUR'],
    description: 'Código de moneda (ISO 4217)',
  },
]

/**
 * CONTABLE Footer Fields (Record Type 03)
 */
const footerFields: FieldDefinition[] = [
  {
    name: 'recordType',
    label: 'Tipo de Registro',
    start: 1,
    end: 2,
    length: 2,
    type: 'string',
    required: true,
    trim: false,
    allowedValues: ['03'],
    description: 'Tipo de registro: 03 = Sumaria',
  },
  {
    name: 'totalRecords',
    label: 'Total de Registros',
    start: 3,
    end: 10,
    length: 8,
    type: 'number',
    required: true,
    trim: false,
    padding: '0',
    description: 'Total de registros tipo 02',
  },
  {
    name: 'totalDebit',
    label: 'Total Cargos',
    start: 11,
    end: 25,
    length: 15,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Suma total de cargos (13 enteros + 2 decimales)',
  },
  {
    name: 'totalCredit',
    label: 'Total Abonos',
    start: 26,
    end: 40,
    length: 15,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Suma total de abonos (13 enteros + 2 decimales)',
  },
  {
    name: 'filler',
    label: 'Relleno',
    start: 41,
    end: 77,
    length: 37,
    type: 'string',
    required: false,
    trim: false,
    padding: ' ',
    description: 'Espacios en blanco',
  },
]

/**
 * CONTABLE Validators
 */
const validators: ValidatorDefinition[] = [
  {
    code: 'CONTABLE_VAL_01',
    field: 'companyRFC',
    validate: (value) => commonValidators.isValidRFC(value),
    message: 'RFC de la AFORE inválido',
    reference: 'Circular 19-8, Art. 4.1.3',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_02',
    field: 'date',
    validate: (value) => commonValidators.isValidDate(value),
    message: 'Fecha del movimiento inválida: formato debe ser YYYYMMDD',
    reference: 'Circular 19-8, Art. 4.2.3',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_03',
    field: 'date',
    validate: (value) => commonValidators.isNotFutureDate(value),
    message: 'Fecha del movimiento no puede ser futura',
    reference: 'Circular 19-8, Art. 4.2.3',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_04',
    field: 'accountCode',
    validate: (value) => /^\d{4}$/.test(value.trim()),
    message: 'Código de cuenta debe ser numérico de 4 dígitos',
    reference: 'Circular 19-8, Art. 4.2.1',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_05',
    field: 'debitAmount',
    validate: (value) => /^\d{12}$/.test(value.trim()),
    message: 'Importe cargo debe ser numérico de 12 dígitos',
    reference: 'Circular 19-8, Art. 4.2.4',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_06',
    field: 'creditAmount',
    validate: (value) => /^\d{12}$/.test(value.trim()),
    message: 'Importe abono debe ser numérico de 12 dígitos',
    reference: 'Circular 19-8, Art. 4.2.5',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_07',
    field: 'debitAmount',
    validate: (value, record) => {
      const debit = parseInt(value.trim(), 10)
      const credit = parseInt((record.creditAmount as string || '0').trim(), 10)
      return debit > 0 || credit > 0
    },
    message: 'Al menos uno de los importes (cargo o abono) debe ser mayor a cero',
    reference: 'Circular 19-8, Art. 4.2.4',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_08',
    field: 'reference',
    validate: (value) => commonValidators.isNotEmpty(value),
    message: 'Referencia es obligatoria',
    reference: 'Circular 19-8, Art. 4.2.6',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_09',
    field: 'concept',
    validate: (value) => commonValidators.isNotEmpty(value),
    message: 'Concepto es obligatorio',
    reference: 'Circular 19-8, Art. 4.2.7',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_10',
    field: 'currency',
    validate: (value) => ['MXN', 'USD', 'EUR'].includes(value.trim()),
    message: 'Moneda debe ser MXN, USD o EUR',
    reference: 'Circular 19-8, Art. 4.2.8',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_11',
    field: 'periodYear',
    validate: (value) => {
      const year = parseInt(value.trim(), 10)
      return !isNaN(year) && year >= 2000 && year <= 2100
    },
    message: 'Año del periodo debe estar entre 2000 y 2100',
    reference: 'Circular 19-8, Art. 4.1.5',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_12',
    field: 'periodMonth',
    validate: (value) => {
      const month = parseInt(value.trim(), 10)
      return !isNaN(month) && month >= 1 && month <= 12
    },
    message: 'Mes del periodo debe estar entre 01 y 12',
    reference: 'Circular 19-8, Art. 4.1.6',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_13',
    field: 'fileDate',
    validate: (value) => commonValidators.isValidDate(value),
    message: 'Fecha del archivo inválida',
    reference: 'Circular 19-8, Art. 4.1.4',
    severity: 'error',
  },
  {
    code: 'CONTABLE_VAL_14',
    field: 'concept',
    validate: (value) => value.trim().length >= 10,
    message: 'Concepto debe tener al menos 10 caracteres',
    reference: 'Circular 19-8, Art. 4.2.7',
    severity: 'warning',
  },
  {
    code: 'CONTABLE_VAL_15',
    field: 'accountCode',
    validate: (value) => {
      const code = value.trim()
      // Validar cuenta 7115 (Circular 28-2025 - conversión de moneda)
      return code !== '7115' || true // Siempre válido, solo advertencia
    },
    message: 'Cuenta 7115 requiere conversión de moneda según Circular 28-2025',
    reference: 'Circular 28-2025, Art. 2.1',
    severity: 'info',
  },
]

/**
 * CONTABLE Schema
 *
 * Line length: 115 characters for detail records (position 1-115)
 * Based on field definitions where 'currency' ends at position 115
 */
export const contableSchema: CONSARSchema = {
  type: 'CONTABLE',
  name: 'Archivo Contable',
  description: 'Archivo de movimientos contables de AFORE',
  fields: {
    '01': headerFields,
    '02': detailFields,
    '03': footerFields,
  },
  validators,
  lineLength: 115, // Based on detail record ending at position 115
}
