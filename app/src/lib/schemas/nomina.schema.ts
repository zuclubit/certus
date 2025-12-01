/**
 * NOMINA Schema Definition
 *
 * Field definitions and validators for NOMINA file type
 * Based on Circular 19-8 (Archivo de Nómina)
 *
 * @module nomina-schema
 */

import type { CONSARSchema, FieldDefinition, ValidatorDefinition } from './consar-schema'
import { commonValidators } from './consar-schema'

/**
 * NOMINA Header Fields (Record Type 01)
 * Line format: 77 characters fixed width
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
    end: 9,
    length: 7,
    type: 'string',
    required: true,
    trim: true,
    allowedValues: ['NOMINA'],
    description: 'Tipo de archivo: NOMINA',
  },
  {
    name: 'companyRFC',
    label: 'RFC del Patrón',
    start: 10,
    end: 22,
    length: 13,
    type: 'string',
    required: true,
    trim: true,
    pattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/,
    description: 'RFC del patrón (12-13 caracteres)',
  },
  {
    name: 'fileDate',
    label: 'Fecha del Archivo',
    start: 23,
    end: 30,
    length: 8,
    type: 'date',
    required: true,
    trim: false,
    dateFormat: 'YYYYMMDD',
    description: 'Fecha de generación del archivo',
  },
  {
    name: 'sequenceNumber',
    label: 'Número de Secuencia',
    start: 31,
    end: 34,
    length: 4,
    type: 'number',
    required: true,
    trim: false,
    padding: '0',
    description: 'Número de secuencia del archivo (0001-9999)',
  },
  {
    name: 'afore',
    label: 'Clave de AFORE',
    start: 35,
    end: 36,
    length: 2,
    type: 'string',
    required: true,
    trim: false,
    description: 'Clave de la AFORE destino',
  },
  {
    name: 'filler',
    label: 'Relleno',
    start: 37,
    end: 77,
    length: 41,
    type: 'string',
    required: false,
    trim: false,
    padding: ' ',
    description: 'Espacios en blanco',
  },
]

/**
 * NOMINA Detail Fields (Record Type 02)
 * Employee contribution record
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
    name: 'nss',
    label: 'NSS',
    start: 3,
    end: 13,
    length: 11,
    type: 'string',
    required: true,
    trim: false,
    pattern: /^\d{11}$/,
    description: 'Número de Seguridad Social',
  },
  {
    name: 'curp',
    label: 'CURP',
    start: 14,
    end: 31,
    length: 18,
    type: 'string',
    required: true,
    trim: false,
    pattern: /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/,
    description: 'Clave Única de Registro de Población',
  },
  {
    name: 'employeeName',
    label: 'Nombre del Trabajador',
    start: 32,
    end: 71,
    length: 40,
    type: 'string',
    required: true,
    trim: true,
    description: 'Nombre completo del trabajador',
  },
  {
    name: 'amount',
    label: 'Importe',
    start: 72,
    end: 80,
    length: 9,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Importe de la aportación (7 enteros + 2 decimales)',
  },
  {
    name: 'movementType',
    label: 'Tipo de Movimiento',
    start: 81,
    end: 81,
    length: 1,
    type: 'string',
    required: true,
    trim: false,
    allowedValues: ['A', 'B', 'M'],
    description: 'A=Alta, B=Baja, M=Modificación',
  },
  {
    name: 'paymentDate',
    label: 'Fecha de Pago',
    start: 82,
    end: 89,
    length: 8,
    type: 'date',
    required: true,
    trim: false,
    dateFormat: 'YYYYMMDD',
    description: 'Fecha de pago de la nómina',
  },
  {
    name: 'account',
    label: 'Cuenta Individual',
    start: 90,
    end: 100,
    length: 11,
    type: 'string',
    required: true,
    trim: false,
    pattern: /^\d{11}$/,
    description: 'Número de cuenta individual',
  },
]

/**
 * NOMINA Footer Fields (Record Type 03)
 * Summary totals
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
    description: 'Total de registros tipo 02 en el archivo',
  },
  {
    name: 'totalAmount',
    label: 'Importe Total',
    start: 11,
    end: 22,
    length: 12,
    type: 'currency',
    required: true,
    trim: false,
    padding: '0',
    description: 'Suma total de importes (10 enteros + 2 decimales)',
  },
  {
    name: 'filler',
    label: 'Relleno',
    start: 23,
    end: 77,
    length: 55,
    type: 'string',
    required: false,
    trim: false,
    padding: ' ',
    description: 'Espacios en blanco',
  },
]

/**
 * NOMINA Validators
 */
const validators: ValidatorDefinition[] = [
  {
    code: 'NOMINA_VAL_01',
    field: 'nss',
    validate: (value) => commonValidators.isValidNSS(value),
    message: 'NSS inválido: debe contener 11 dígitos numéricos',
    reference: 'Circular 19-8, Art. 3.2.1',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_02',
    field: 'curp',
    validate: (value) => commonValidators.isValidCURP(value),
    message: 'CURP inválido: formato incorrecto',
    reference: 'Circular 19-8, Art. 3.2.2',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_03',
    field: 'companyRFC',
    validate: (value) => commonValidators.isValidRFC(value),
    message: 'RFC del patrón inválido',
    reference: 'Circular 19-8, Art. 3.1.3',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_04',
    field: 'paymentDate',
    validate: (value) => commonValidators.isValidDate(value),
    message: 'Fecha de pago inválida: formato debe ser YYYYMMDD',
    reference: 'Circular 19-8, Art. 3.2.7',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_05',
    field: 'paymentDate',
    validate: (value) => commonValidators.isNotFutureDate(value),
    message: 'Fecha de pago no puede ser futura',
    reference: 'Circular 19-8, Art. 3.2.7',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_06',
    field: 'amount',
    validate: (value) => commonValidators.isValidAmount(value),
    message: 'Importe inválido: debe ser numérico de 9 dígitos',
    reference: 'Circular 19-8, Art. 3.2.5',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_07',
    field: 'amount',
    validate: (value) => commonValidators.isPositiveAmount(value),
    message: 'Importe debe ser mayor a cero',
    reference: 'Circular 19-8, Art. 3.2.5',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_08',
    field: 'account',
    validate: (value) => commonValidators.isValidAccount(value),
    message: 'Cuenta individual inválida: debe contener 11 dígitos',
    reference: 'Circular 19-8, Art. 3.2.8',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_09',
    field: 'employeeName',
    validate: (value) => commonValidators.isNotEmpty(value),
    message: 'Nombre del trabajador es obligatorio',
    reference: 'Circular 19-8, Art. 3.2.4',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_10',
    field: 'movementType',
    validate: (value) => ['A', 'B', 'M'].includes(value.trim()),
    message: 'Tipo de movimiento debe ser A, B o M',
    reference: 'Circular 19-8, Art. 3.2.6',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_11',
    field: 'fileDate',
    validate: (value) => commonValidators.isValidDate(value),
    message: 'Fecha del archivo inválida',
    reference: 'Circular 19-8, Art. 3.1.4',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_12',
    field: 'sequenceNumber',
    validate: (value) => {
      const num = parseInt(value.trim(), 10)
      return !isNaN(num) && num >= 1 && num <= 9999
    },
    message: 'Número de secuencia debe estar entre 0001 y 9999',
    reference: 'Circular 19-8, Art. 3.1.5',
    severity: 'error',
  },
  {
    code: 'NOMINA_VAL_13',
    field: 'employeeName',
    validate: (value) => value.trim().length >= 5,
    message: 'Nombre del trabajador debe tener al menos 5 caracteres',
    reference: 'Circular 19-8, Art. 3.2.4',
    severity: 'warning',
  },
  {
    code: 'NOMINA_VAL_14',
    field: 'employeeName',
    validate: (value) => /^[A-ZÁÉÍÓÚÑ\s]+$/i.test(value.trim()),
    message: 'Nombre del trabajador contiene caracteres no permitidos',
    reference: 'Circular 19-8, Art. 3.2.4',
    severity: 'warning',
  },
]

/**
 * NOMINA Schema
 *
 * Line length: 100 characters for detail records (position 1-100)
 * Based on field definitions where 'account' ends at position 100
 */
export const nominaSchema: CONSARSchema = {
  type: 'NOMINA',
  name: 'Archivo de Nómina',
  description: 'Archivo de aportaciones patronales a cuentas individuales',
  fields: {
    '01': headerFields,
    '02': detailFields,
    '03': footerFields,
  },
  validators,
  lineLength: 100, // Based on detail record ending at position 100
}
