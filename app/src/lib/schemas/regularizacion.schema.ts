/**
 * REGULARIZACION Schema Definition
 *
 * Field definitions and validators for REGULARIZACION file type
 * Based on Circular 19-8 (Archivo de Regularización)
 *
 * @module regularizacion-schema
 */

import type { CONSARSchema, FieldDefinition, ValidatorDefinition } from './consar-schema'
import { commonValidators } from './consar-schema'

/**
 * REGULARIZACION Header Fields (Record Type 01)
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
    end: 16,
    length: 14,
    type: 'string',
    required: true,
    trim: true,
    allowedValues: ['REGULARIZACION'],
    description: 'Tipo de archivo: REGULARIZACION',
  },
  {
    name: 'companyRFC',
    label: 'RFC del Patrón',
    start: 17,
    end: 29,
    length: 13,
    type: 'string',
    required: true,
    trim: true,
    pattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/,
    description: 'RFC del patrón',
  },
  {
    name: 'fileDate',
    label: 'Fecha del Archivo',
    start: 30,
    end: 37,
    length: 8,
    type: 'date',
    required: true,
    trim: false,
    dateFormat: 'YYYYMMDD',
    description: 'Fecha de generación del archivo',
  },
  {
    name: 'afore',
    label: 'Clave de AFORE',
    start: 38,
    end: 39,
    length: 2,
    type: 'string',
    required: true,
    trim: false,
    description: 'Clave de la AFORE',
  },
  {
    name: 'filler',
    label: 'Relleno',
    start: 40,
    end: 77,
    length: 38,
    type: 'string',
    required: false,
    trim: false,
    padding: ' ',
    description: 'Espacios en blanco',
  },
]

/**
 * REGULARIZACION Detail Fields (Record Type 02)
 * Regularization movement record
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
    name: 'account',
    label: 'Cuenta Individual',
    start: 3,
    end: 13,
    length: 11,
    type: 'string',
    required: true,
    trim: false,
    pattern: /^\d{11}$/,
    description: 'Número de cuenta individual',
  },
  {
    name: 'nss',
    label: 'NSS',
    start: 14,
    end: 24,
    length: 11,
    type: 'string',
    required: true,
    trim: false,
    pattern: /^\d{11}$/,
    description: 'Número de Seguridad Social',
  },
  {
    name: 'originalDate',
    label: 'Fecha Original',
    start: 25,
    end: 32,
    length: 8,
    type: 'date',
    required: true,
    trim: false,
    dateFormat: 'YYYYMMDD',
    description: 'Fecha del movimiento original',
  },
  {
    name: 'correctionDate',
    label: 'Fecha de Corrección',
    start: 33,
    end: 40,
    length: 8,
    type: 'date',
    required: true,
    trim: false,
    dateFormat: 'YYYYMMDD',
    description: 'Fecha de la corrección',
  },
  {
    name: 'originalAmount',
    label: 'Importe Original',
    start: 41,
    end: 49,
    length: 9,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Importe original (7 enteros + 2 decimales)',
  },
  {
    name: 'correctedAmount',
    label: 'Importe Corregido',
    start: 50,
    end: 58,
    length: 9,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Importe corregido (7 enteros + 2 decimales)',
  },
  {
    name: 'reason',
    label: 'Motivo de Regularización',
    start: 59,
    end: 88,
    length: 30,
    type: 'string',
    required: true,
    trim: true,
    description: 'Descripción del motivo',
  },
  {
    name: 'authReference',
    label: 'Referencia de Autorización',
    start: 89,
    end: 108,
    length: 20,
    type: 'string',
    required: true,
    trim: true,
    description: 'Número de autorización',
  },
]

/**
 * REGULARIZACION Footer Fields (Record Type 03)
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
    name: 'totalOriginalAmount',
    label: 'Total Importe Original',
    start: 11,
    end: 22,
    length: 12,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Suma total de importes originales (10 enteros + 2 decimales)',
  },
  {
    name: 'totalCorrectedAmount',
    label: 'Total Importe Corregido',
    start: 23,
    end: 34,
    length: 12,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Suma total de importes corregidos (10 enteros + 2 decimales)',
  },
  {
    name: 'filler',
    label: 'Relleno',
    start: 35,
    end: 77,
    length: 43,
    type: 'string',
    required: false,
    trim: false,
    padding: ' ',
    description: 'Espacios en blanco',
  },
]

/**
 * REGULARIZACION Validators
 */
const validators: ValidatorDefinition[] = [
  {
    code: 'REGULARIZACION_VAL_01',
    field: 'account',
    validate: (value) => commonValidators.isValidAccount(value),
    message: 'Cuenta individual inválida: debe contener 11 dígitos',
    reference: 'Circular 19-8, Art. 5.2.1',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_02',
    field: 'nss',
    validate: (value) => commonValidators.isValidNSS(value),
    message: 'NSS inválido: debe contener 11 dígitos numéricos',
    reference: 'Circular 19-8, Art. 5.2.2',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_03',
    field: 'originalDate',
    validate: (value) => commonValidators.isValidDate(value),
    message: 'Fecha original inválida: formato debe ser YYYYMMDD',
    reference: 'Circular 19-8, Art. 5.2.3',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_04',
    field: 'correctionDate',
    validate: (value) => commonValidators.isValidDate(value),
    message: 'Fecha de corrección inválida: formato debe ser YYYYMMDD',
    reference: 'Circular 19-8, Art. 5.2.4',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_05',
    field: 'correctionDate',
    validate: (value, record) => {
      if (!commonValidators.isValidDate(value)) return false
      const originalDate = record.originalDate as string
      if (!originalDate || !commonValidators.isValidDate(originalDate)) return true

      return value >= originalDate
    },
    message: 'Fecha de corrección debe ser posterior o igual a la fecha original',
    reference: 'Circular 19-8, Art. 5.2.4',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_06',
    field: 'correctionDate',
    validate: (value) => commonValidators.isNotFutureDate(value),
    message: 'Fecha de corrección no puede ser futura',
    reference: 'Circular 19-8, Art. 5.2.4',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_07',
    field: 'originalAmount',
    validate: (value) => commonValidators.isValidAmount(value),
    message: 'Importe original inválido: debe ser numérico de 9 dígitos',
    reference: 'Circular 19-8, Art. 5.2.5',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_08',
    field: 'correctedAmount',
    validate: (value) => commonValidators.isValidAmount(value),
    message: 'Importe corregido inválido: debe ser numérico de 9 dígitos',
    reference: 'Circular 19-8, Art. 5.2.6',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_09',
    field: 'correctedAmount',
    validate: (value, record) => {
      const original = parseInt((record.originalAmount as string || '0').trim(), 10)
      const corrected = parseInt(value.trim(), 10)
      return corrected !== original
    },
    message: 'Importe corregido debe ser diferente al importe original',
    reference: 'Circular 19-8, Art. 5.2.6',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_10',
    field: 'reason',
    validate: (value) => commonValidators.isNotEmpty(value),
    message: 'Motivo de regularización es obligatorio',
    reference: 'Circular 19-8, Art. 5.2.7',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_11',
    field: 'authReference',
    validate: (value) => commonValidators.isNotEmpty(value),
    message: 'Referencia de autorización es obligatoria',
    reference: 'Circular 19-8, Art. 5.2.8',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_12',
    field: 'companyRFC',
    validate: (value) => commonValidators.isValidRFC(value),
    message: 'RFC del patrón inválido',
    reference: 'Circular 19-8, Art. 5.1.3',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_13',
    field: 'fileDate',
    validate: (value) => commonValidators.isValidDate(value),
    message: 'Fecha del archivo inválida',
    reference: 'Circular 19-8, Art. 5.1.4',
    severity: 'error',
  },
  {
    code: 'REGULARIZACION_VAL_14',
    field: 'reason',
    validate: (value) => value.trim().length >= 10,
    message: 'Motivo debe tener al menos 10 caracteres',
    reference: 'Circular 19-8, Art. 5.2.7',
    severity: 'warning',
  },
  {
    code: 'REGULARIZACION_VAL_15',
    field: 'authReference',
    validate: (value) => /^[A-Z0-9\-]+$/i.test(value.trim()),
    message: 'Referencia de autorización contiene caracteres no permitidos',
    reference: 'Circular 19-8, Art. 5.2.8',
    severity: 'warning',
  },
]

/**
 * REGULARIZACION Schema
 */
export const regularizacionSchema: CONSARSchema = {
  type: 'REGULARIZACION',
  name: 'Archivo de Regularización',
  description: 'Archivo de correcciones y ajustes a movimientos previos',
  fields: {
    '01': headerFields,
    '02': detailFields,
    '03': footerFields,
  },
  validators,
  lineLength: 77,
}
