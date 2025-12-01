/**
 * CONSAR/PROCESAR Error Catalog
 *
 * Complete catalog of error codes, rejection reasons, and validation rules
 * based on Circular CONSAR 19-8, 26-11, and PROCESAR technical specifications.
 *
 * This module provides:
 * - Batch rejection codes (Rechazo de Lote)
 * - Record rejection codes (Rechazo de Registro)
 * - Structure validation codes
 * - Data validation codes
 * - AFORE catalog
 * - Movement type catalog
 *
 * @module consar-error-catalog
 */

// ============================================
// ERROR SEVERITY LEVELS
// ============================================

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info'

export interface ErrorDefinition {
  code: string
  severity: ErrorSeverity
  message: string
  description: string
  category: string
  subcategory?: string
  reference?: string
  suggestion?: string
  expectedFormat?: string
}

// ============================================
// BATCH REJECTION CODES (RECHAZO DE LOTE)
// Up to 3 codes per batch as per Circular 19-8
// ============================================

export const BATCH_REJECTION_CODES: Record<string, ErrorDefinition> = {
  // Structure errors
  'LOTE_001': {
    code: 'LOTE_001',
    severity: 'critical',
    message: 'Archivo sin registro de encabezado',
    description: 'El archivo no contiene un registro de encabezado válido (tipo 01)',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5.1',
    suggestion: 'Asegúrese de que el archivo inicie con un registro tipo 01',
  },
  'LOTE_002': {
    code: 'LOTE_002',
    severity: 'critical',
    message: 'Archivo sin registro de sumaria',
    description: 'El archivo no contiene un registro de sumaria válido (tipo 03)',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5.3',
    suggestion: 'Asegúrese de que el archivo termine con un registro tipo 03',
  },
  'LOTE_003': {
    code: 'LOTE_003',
    severity: 'critical',
    message: 'Longitud de línea incorrecta',
    description: 'Una o más líneas no tienen la longitud esperada de 77 caracteres',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 4.1',
    suggestion: 'Verifique que todas las líneas tengan exactamente 77 caracteres',
    expectedFormat: '77 caracteres por línea',
  },
  'LOTE_004': {
    code: 'LOTE_004',
    severity: 'critical',
    message: 'Tipo de archivo no reconocido',
    description: 'El tipo de archivo especificado en el encabezado no es válido',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 3.1.2',
    suggestion: 'Tipos válidos: NOMINA, CONTABLE, REGULARIZACION',
  },
  'LOTE_005': {
    code: 'LOTE_005',
    severity: 'critical',
    message: 'Conteo de registros no coincide',
    description: 'El número de registros en sumaria no coincide con los registros procesados',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5.3.1',
    suggestion: 'Verifique el conteo de registros tipo 02 en el campo TotalRegistros de sumaria',
  },
  'LOTE_006': {
    code: 'LOTE_006',
    severity: 'critical',
    message: 'Suma de importes no coincide',
    description: 'La suma de importes en sumaria no coincide con la suma de importes de detalle',
    category: 'Cálculos',
    reference: 'Circular 19-8, Art. 5.3.2',
    suggestion: 'Recalcule la suma de todos los importes de registros tipo 02',
  },
  'LOTE_007': {
    code: 'LOTE_007',
    severity: 'critical',
    message: 'RFC del patrón inválido',
    description: 'El RFC del patrón en el encabezado no tiene formato válido',
    category: 'Datos',
    reference: 'Circular 19-8, Art. 3.1.3',
    suggestion: 'RFC debe tener 12 (moral) o 13 (física) caracteres con formato válido',
    expectedFormat: '[A-ZÑ&]{3,4}YYMMDD[A-Z0-9]{3}',
  },
  'LOTE_008': {
    code: 'LOTE_008',
    severity: 'critical',
    message: 'Fecha del archivo inválida',
    description: 'La fecha en el encabezado no es válida o está en formato incorrecto',
    category: 'Datos',
    reference: 'Circular 19-8, Art. 3.1.4',
    suggestion: 'Formato de fecha: YYYYMMDD (ejemplo: 20250122)',
    expectedFormat: 'YYYYMMDD',
  },
  'LOTE_009': {
    code: 'LOTE_009',
    severity: 'critical',
    message: 'Clave de AFORE inválida',
    description: 'La clave de AFORE no existe en el catálogo autorizado',
    category: 'Datos',
    reference: 'Circular 19-8, Art. 3.1.6',
    suggestion: 'Consulte el catálogo de AFOREs autorizadas por CONSAR',
  },
  'LOTE_010': {
    code: 'LOTE_010',
    severity: 'error',
    message: 'Archivo duplicado',
    description: 'Ya existe un archivo con la misma clave de identificación',
    category: 'Duplicidad',
    reference: 'Circular 19-8, Art. 6.2',
    suggestion: 'Verifique el número de secuencia en el nombre del archivo',
  },
  'LOTE_011': {
    code: 'LOTE_011',
    severity: 'error',
    message: 'Archivo fuera de horario',
    description: 'El archivo se envió fuera del horario permitido sin usar RETRANSMISION',
    category: 'Proceso',
    reference: 'Circular 19-8, Art. 7.1',
    suggestion: 'Horario normal: 18:00-6:00 hrs. Fuera de horario use directorio RETRANSMISION',
  },
  'LOTE_012': {
    code: 'LOTE_012',
    severity: 'critical',
    message: 'Archivo vacío',
    description: 'El archivo no contiene registros de detalle',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5.2',
    suggestion: 'El archivo debe contener al menos un registro tipo 02',
  },
  'LOTE_013': {
    code: 'LOTE_013',
    severity: 'error',
    message: 'Nomenclatura de archivo incorrecta',
    description: 'El nombre del archivo no cumple con el formato establecido',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 4.2',
    suggestion: 'Formato: TIPO_RFC_YYYYMMDD_SECUENCIA.txt',
    expectedFormat: 'TIPO_RFC_YYYYMMDD_NNNN.txt',
  },
  'LOTE_014': {
    code: 'LOTE_014',
    severity: 'critical',
    message: 'Caracteres no ASCII',
    description: 'El archivo contiene caracteres fuera del código ASCII estándar',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 4.3',
    suggestion: 'Use solo caracteres ASCII (código 32-126) y salto de línea (código 10)',
  },
  'LOTE_015': {
    code: 'LOTE_015',
    severity: 'error',
    message: 'Secuencia de registros incorrecta',
    description: 'Los registros no siguen la secuencia esperada (01, 02..., 03)',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5',
    suggestion: 'El archivo debe iniciar con 01, seguir con 02s y terminar con 03',
  },
}

// ============================================
// RECORD REJECTION CODES (RECHAZO DE REGISTRO)
// Up to 5 codes per record as per Circular 19-8
// ============================================

export const RECORD_REJECTION_CODES: Record<string, ErrorDefinition> = {
  // CURP validation
  'REG_001': {
    code: 'REG_001',
    severity: 'error',
    message: 'CURP inválido - Formato',
    description: 'El CURP no tiene el formato correcto de 18 caracteres',
    category: 'Identificación',
    subcategory: 'CURP',
    reference: 'Circular 19-8, Art. 3.2.2',
    suggestion: 'CURP debe tener 18 caracteres con formato: AAAA######XAAAAA##',
    expectedFormat: '[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]',
  },
  'REG_002': {
    code: 'REG_002',
    severity: 'error',
    message: 'CURP inválido - Dígito verificador',
    description: 'El dígito verificador del CURP no coincide con el calculado',
    category: 'Identificación',
    subcategory: 'CURP',
    reference: 'Circular 19-8, Art. 3.2.2',
    suggestion: 'Verifique el último dígito del CURP según algoritmo RENAPO',
  },
  'REG_003': {
    code: 'REG_003',
    severity: 'error',
    message: 'CURP inválido - Entidad federativa',
    description: 'El código de entidad federativa en el CURP no es válido',
    category: 'Identificación',
    subcategory: 'CURP',
    reference: 'Circular 19-8, Art. 3.2.2',
    suggestion: 'Use códigos de entidad válidos (AS, BC, BS, CC, etc.)',
  },
  'REG_004': {
    code: 'REG_004',
    severity: 'warning',
    message: 'CURP - Fecha nacimiento futura',
    description: 'La fecha de nacimiento derivada del CURP es posterior a la fecha actual',
    category: 'Identificación',
    subcategory: 'CURP',
    reference: 'Circular 19-8, Art. 3.2.2',
  },

  // NSS validation
  'REG_010': {
    code: 'REG_010',
    severity: 'error',
    message: 'NSS inválido - Formato',
    description: 'El NSS no tiene el formato correcto de 11 dígitos',
    category: 'Identificación',
    subcategory: 'NSS',
    reference: 'Circular 19-8, Art. 3.2.1',
    suggestion: 'NSS debe ser numérico de exactamente 11 dígitos',
    expectedFormat: '[0-9]{11}',
  },
  'REG_011': {
    code: 'REG_011',
    severity: 'error',
    message: 'NSS inválido - Dígito verificador',
    description: 'El dígito verificador del NSS no coincide con el calculado',
    category: 'Identificación',
    subcategory: 'NSS',
    reference: 'Circular 19-8, Art. 3.2.1',
    suggestion: 'Verifique el último dígito del NSS según algoritmo Luhn',
  },
  'REG_012': {
    code: 'REG_012',
    severity: 'error',
    message: 'NSS inválido - Subdelegación',
    description: 'El código de subdelegación del NSS no es válido (debe ser 01-97)',
    category: 'Identificación',
    subcategory: 'NSS',
    reference: 'Circular 19-8, Art. 3.2.1',
    suggestion: 'Los primeros 2 dígitos deben estar entre 01 y 97',
  },
  'REG_013': {
    code: 'REG_013',
    severity: 'warning',
    message: 'NSS no coincide con CURP',
    description: 'El NSS y CURP podrían no corresponder al mismo trabajador',
    category: 'Identificación',
    reference: 'Circular 19-8, Art. 3.2',
  },

  // RFC validation
  'REG_020': {
    code: 'REG_020',
    severity: 'error',
    message: 'RFC inválido - Formato',
    description: 'El RFC no tiene el formato correcto (12 o 13 caracteres)',
    category: 'Identificación',
    subcategory: 'RFC',
    reference: 'Circular 19-8, Art. 3.1.3',
    suggestion: 'RFC persona física: 13 caracteres. RFC persona moral: 12 caracteres',
    expectedFormat: '[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}',
  },
  'REG_021': {
    code: 'REG_021',
    severity: 'warning',
    message: 'RFC inválido - Dígito verificador',
    description: 'El dígito verificador del RFC podría ser incorrecto',
    category: 'Identificación',
    subcategory: 'RFC',
    reference: 'Circular 19-8, Art. 3.1.3',
  },
  'REG_022': {
    code: 'REG_022',
    severity: 'error',
    message: 'RFC inválido - Fecha constitución',
    description: 'La fecha derivada del RFC no es válida',
    category: 'Identificación',
    subcategory: 'RFC',
    reference: 'Circular 19-8, Art. 3.1.3',
  },

  // Account validation
  'REG_030': {
    code: 'REG_030',
    severity: 'error',
    message: 'Cuenta individual inválida - Formato',
    description: 'El número de cuenta individual no tiene el formato correcto',
    category: 'Cuenta',
    reference: 'Circular 19-8, Art. 3.2.8',
    suggestion: 'Cuenta debe ser numérica de exactamente 11 dígitos',
    expectedFormat: '[0-9]{11}',
  },
  'REG_031': {
    code: 'REG_031',
    severity: 'error',
    message: 'Cuenta no registrada',
    description: 'La cuenta individual no existe en la BDNSAR',
    category: 'Cuenta',
    reference: 'Circular 19-8, Art. 3.2.8',
  },
  'REG_032': {
    code: 'REG_032',
    severity: 'error',
    message: 'Cuenta asignada a otra AFORE',
    description: 'La cuenta individual está registrada en otra AFORE',
    category: 'Cuenta',
    reference: 'Circular 19-8, Art. 3.2.8',
  },
  'REG_033': {
    code: 'REG_033',
    severity: 'error',
    message: 'Cuenta en proceso de traspaso',
    description: 'La cuenta tiene un traspaso pendiente de conclusión',
    category: 'Cuenta',
    reference: 'Circular 26-11, Art. 4.5',
  },

  // Amount validation
  'REG_040': {
    code: 'REG_040',
    severity: 'error',
    message: 'Importe inválido - Formato',
    description: 'El importe no tiene el formato numérico correcto',
    category: 'Importes',
    reference: 'Circular 19-8, Art. 3.2.5',
    suggestion: 'Importe debe ser numérico de 9 dígitos (7 enteros + 2 decimales)',
    expectedFormat: '[0-9]{9} (centavos)',
  },
  'REG_041': {
    code: 'REG_041',
    severity: 'error',
    message: 'Importe negativo o cero',
    description: 'El importe debe ser mayor a cero',
    category: 'Importes',
    reference: 'Circular 19-8, Art. 3.2.5',
  },
  'REG_042': {
    code: 'REG_042',
    severity: 'warning',
    message: 'Importe fuera de rango esperado',
    description: 'El importe está fuera del rango típico para este tipo de movimiento',
    category: 'Importes',
    reference: 'Circular 19-8, Art. 3.2.5',
    suggestion: 'Verifique que el importe sea correcto',
  },
  'REG_043': {
    code: 'REG_043',
    severity: 'error',
    message: 'Importe excede límite máximo',
    description: 'El importe excede el límite máximo permitido',
    category: 'Importes',
    reference: 'Circular 19-8, Art. 3.2.5',
  },

  // Date validation
  'REG_050': {
    code: 'REG_050',
    severity: 'error',
    message: 'Fecha inválida - Formato',
    description: 'La fecha no tiene el formato YYYYMMDD correcto',
    category: 'Fechas',
    reference: 'Circular 19-8, Art. 3.2.7',
    suggestion: 'Use formato YYYYMMDD (ejemplo: 20250122)',
    expectedFormat: 'YYYYMMDD',
  },
  'REG_051': {
    code: 'REG_051',
    severity: 'error',
    message: 'Fecha futura no permitida',
    description: 'La fecha no puede ser posterior a la fecha actual',
    category: 'Fechas',
    reference: 'Circular 19-8, Art. 3.2.7',
  },
  'REG_052': {
    code: 'REG_052',
    severity: 'warning',
    message: 'Fecha muy antigua',
    description: 'La fecha es anterior al inicio del SAR (1997)',
    category: 'Fechas',
    reference: 'Circular 19-8, Art. 3.2.7',
  },
  'REG_053': {
    code: 'REG_053',
    severity: 'error',
    message: 'Mes inválido',
    description: 'El mes debe estar entre 01 y 12',
    category: 'Fechas',
    reference: 'Circular 19-8, Art. 3.2.7',
  },
  'REG_054': {
    code: 'REG_054',
    severity: 'error',
    message: 'Día inválido',
    description: 'El día no es válido para el mes especificado',
    category: 'Fechas',
    reference: 'Circular 19-8, Art. 3.2.7',
  },

  // Movement type validation
  'REG_060': {
    code: 'REG_060',
    severity: 'error',
    message: 'Tipo de movimiento inválido',
    description: 'El tipo de movimiento no es válido para este tipo de archivo',
    category: 'Movimientos',
    reference: 'Circular 19-8, Art. 3.2.6',
    suggestion: 'Tipos válidos para NOMINA: A (Alta), B (Baja), M (Modificación)',
  },
  'REG_061': {
    code: 'REG_061',
    severity: 'error',
    message: 'Movimiento duplicado',
    description: 'Ya existe un movimiento idéntico para este trabajador en el periodo',
    category: 'Movimientos',
    reference: 'Circular 19-8, Art. 6.2',
  },
  'REG_062': {
    code: 'REG_062',
    severity: 'warning',
    message: 'Movimiento inconsistente con historia',
    description: 'El movimiento no es coherente con la historia del trabajador',
    category: 'Movimientos',
    reference: 'Circular 19-8, Art. 3.2.6',
  },

  // Name validation
  'REG_070': {
    code: 'REG_070',
    severity: 'error',
    message: 'Nombre vacío',
    description: 'El nombre del trabajador no puede estar vacío',
    category: 'Datos personales',
    reference: 'Circular 19-8, Art. 3.2.4',
  },
  'REG_071': {
    code: 'REG_071',
    severity: 'warning',
    message: 'Nombre muy corto',
    description: 'El nombre del trabajador parece incompleto',
    category: 'Datos personales',
    reference: 'Circular 19-8, Art. 3.2.4',
  },
  'REG_072': {
    code: 'REG_072',
    severity: 'warning',
    message: 'Caracteres inválidos en nombre',
    description: 'El nombre contiene caracteres no permitidos',
    category: 'Datos personales',
    reference: 'Circular 19-8, Art. 3.2.4',
    suggestion: 'Use solo letras mayúsculas, espacios y caracteres acentuados',
  },
  'REG_073': {
    code: 'REG_073',
    severity: 'warning',
    message: 'Nombre no coincide con CURP',
    description: 'Las iniciales del nombre no coinciden con el CURP',
    category: 'Datos personales',
    reference: 'Circular 19-8, Art. 3.2.4',
  },

  // Record type validation
  'REG_080': {
    code: 'REG_080',
    severity: 'error',
    message: 'Tipo de registro desconocido',
    description: 'El tipo de registro no es válido (debe ser 01, 02 o 03)',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5',
  },
  'REG_081': {
    code: 'REG_081',
    severity: 'error',
    message: 'Encabezado duplicado',
    description: 'Se encontró más de un registro de encabezado (tipo 01)',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5.1',
  },
  'REG_082': {
    code: 'REG_082',
    severity: 'error',
    message: 'Sumaria duplicada',
    description: 'Se encontró más de un registro de sumaria (tipo 03)',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5.3',
  },
  'REG_083': {
    code: 'REG_083',
    severity: 'error',
    message: 'Sumaria antes de fin de archivo',
    description: 'El registro de sumaria debe ser el último del archivo',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 5.3',
  },

  // Field length validation
  'REG_090': {
    code: 'REG_090',
    severity: 'error',
    message: 'Campo truncado',
    description: 'El campo no tiene la longitud esperada',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 4',
  },
  'REG_091': {
    code: 'REG_091',
    severity: 'warning',
    message: 'Campo con espacios inesperados',
    description: 'El campo contiene espacios donde no deberían existir',
    category: 'Estructura',
    reference: 'Circular 19-8, Art. 4',
  },
}

// ============================================
// AFORE CATALOG
// Official AFORE codes as per CONSAR
// ============================================

export interface AFOREInfo {
  code: string
  name: string
  rfc: string
  active: boolean
}

export const AFORE_CATALOG: Record<string, AFOREInfo> = {
  '01': { code: '01', name: 'AFORE AZTECA', rfc: 'AAZ0701085J4', active: true },
  '02': { code: '02', name: 'AFORE BANAMEX', rfc: 'ABA9704236Z6', active: true },
  '03': { code: '03', name: 'AFORE BANCOMER', rfc: 'ABB970523GA5', active: false }, // Merged with XXI Banorte
  '04': { code: '04', name: 'AFORE COPPEL', rfc: 'ACO060327PX1', active: true },
  '05': { code: '05', name: 'AFORE INBURSA', rfc: 'AIN970618NT6', active: true },
  '06': { code: '06', name: 'AFORE INVERCAP', rfc: 'AIV0806165V4', active: true },
  '07': { code: '07', name: 'AFORE PENSIONISSSTE', rfc: 'APE080103RG8', active: true },
  '08': { code: '08', name: 'AFORE PRINCIPAL', rfc: 'APR970710S33', active: true },
  '09': { code: '09', name: 'AFORE PROFUTURO', rfc: 'APG970422F37', active: true },
  '10': { code: '10', name: 'AFORE SURA', rfc: 'ASU0712127N4', active: true },
  '11': { code: '11', name: 'AFORE XXI BANORTE', rfc: 'AXX020711I49', active: true },
  // Legacy/merged AFOREs
  '12': { code: '12', name: 'AFORE METLIFE', rfc: 'AME060118HT3', active: false }, // Merged
  '13': { code: '13', name: 'AFORE SANTANDER', rfc: 'ASA9712016X3', active: false }, // Merged with Profuturo
  '99': { code: '99', name: 'PROCESAR (Operadora)', rfc: 'PRO9705205T8', active: true },
}

// ============================================
// MOVEMENT TYPE CATALOG
// ============================================

export interface MovementTypeInfo {
  code: string
  name: string
  description: string
  requiresAmount: boolean
  fileTypes: string[]
}

export const MOVEMENT_TYPE_CATALOG: Record<string, MovementTypeInfo> = {
  'A': {
    code: 'A',
    name: 'Alta',
    description: 'Alta de trabajador en el sistema',
    requiresAmount: true,
    fileTypes: ['NOMINA'],
  },
  'B': {
    code: 'B',
    name: 'Baja',
    description: 'Baja de trabajador del sistema',
    requiresAmount: false,
    fileTypes: ['NOMINA'],
  },
  'M': {
    code: 'M',
    name: 'Modificación',
    description: 'Modificación de datos o importes',
    requiresAmount: true,
    fileTypes: ['NOMINA'],
  },
  'R': {
    code: 'R',
    name: 'Regularización',
    description: 'Regularización de aportaciones',
    requiresAmount: true,
    fileTypes: ['REGULARIZACION'],
  },
  'C': {
    code: 'C',
    name: 'Corrección',
    description: 'Corrección de datos previos',
    requiresAmount: true,
    fileTypes: ['REGULARIZACION'],
  },
}

// ============================================
// SUBCUENTA TYPES (SAR Subcuentas)
// ============================================

export interface SubcuentaInfo {
  code: string
  name: string
  description: string
  percentage?: number
}

export const SUBCUENTA_CATALOG: Record<string, SubcuentaInfo> = {
  'RCV': {
    code: 'RCV',
    name: 'Retiro, Cesantía y Vejez',
    description: 'Subcuenta principal de ahorro para el retiro',
    percentage: 6.5,
  },
  'VIV': {
    code: 'VIV',
    name: 'Vivienda',
    description: 'Subcuenta de aportaciones INFONAVIT',
    percentage: 5.0,
  },
  'AVO': {
    code: 'AVO',
    name: 'Aportaciones Voluntarias',
    description: 'Aportaciones voluntarias del trabajador',
  },
  'CVO': {
    code: 'CVO',
    name: 'Complementarias de Vivienda',
    description: 'Aportaciones complementarias de vivienda',
  },
  'SOL': {
    code: 'SOL',
    name: 'Ahorro Solidario',
    description: 'Subcuenta de ahorro solidario (trabajadores del Estado)',
  },
}

// ============================================
// FILE TYPE CONFIGURATION
// ============================================

export interface FileTypeConfig {
  code: string
  name: string
  description: string
  lineLength: number
  recordTypes: string[]
  extensions: string[]
  maxSizeMB: number
  maxRecords: number
}

export const FILE_TYPE_CONFIG: Record<string, FileTypeConfig> = {
  'NOMINA': {
    code: 'NOMINA',
    name: 'Archivo de Nómina',
    description: 'Aportaciones patronales a cuentas individuales',
    lineLength: 77,
    recordTypes: ['01', '02', '03'],
    extensions: ['.txt', '.csv'],
    maxSizeMB: 100,
    maxRecords: 500000,
  },
  'CONTABLE': {
    code: 'CONTABLE',
    name: 'Archivo Contable',
    description: 'Movimientos contables de las SIEFORES',
    lineLength: 77,
    recordTypes: ['01', '02', '03'],
    extensions: ['.txt', '.csv'],
    maxSizeMB: 50,
    maxRecords: 100000,
  },
  'REGULARIZACION': {
    code: 'REGULARIZACION',
    name: 'Archivo de Regularización',
    description: 'Correcciones y ajustes a aportaciones previas',
    lineLength: 77,
    recordTypes: ['01', '02', '03'],
    extensions: ['.txt', '.csv'],
    maxSizeMB: 50,
    maxRecords: 100000,
  },
  'TRASPASOS': {
    code: 'TRASPASOS',
    name: 'Archivo de Traspasos',
    description: 'Solicitudes de traspaso entre AFOREs',
    lineLength: 77,
    recordTypes: ['01', '02', '03'],
    extensions: ['.txt', '.csv'],
    maxSizeMB: 100,
    maxRecords: 200000,
  },
  'RETIROS': {
    code: 'RETIROS',
    name: 'Archivo de Retiros',
    description: 'Solicitudes de retiro parcial o total',
    lineLength: 77,
    recordTypes: ['01', '02', '03'],
    extensions: ['.txt', '.csv'],
    maxSizeMB: 50,
    maxRecords: 100000,
  },
  'CARTERA_SIEFORE': {
    code: 'CARTERA_SIEFORE',
    name: 'Cartera de Inversión SIEFORE',
    description: 'Portafolio de inversiones de las SIEFORES',
    lineLength: 150,
    recordTypes: ['301', '302', '303', '307'],
    extensions: ['.0300'],
    maxSizeMB: 200,
    maxRecords: 50000,
  },
  'DERIVADOS': {
    code: 'DERIVADOS',
    name: 'Portafolio de Derivados',
    description: 'Posiciones en instrumentos derivados',
    lineLength: 150,
    recordTypes: ['3010', '3020', '3030', '3040'],
    extensions: ['.0314'],
    maxSizeMB: 100,
    maxRecords: 20000,
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get error definition by code
 */
export function getErrorDefinition(code: string): ErrorDefinition | null {
  return BATCH_REJECTION_CODES[code] || RECORD_REJECTION_CODES[code] || null
}

/**
 * Get all errors by category
 */
export function getErrorsByCategory(category: string): ErrorDefinition[] {
  const allErrors = { ...BATCH_REJECTION_CODES, ...RECORD_REJECTION_CODES }
  return Object.values(allErrors).filter(e => e.category === category)
}

/**
 * Get all errors by severity
 */
export function getErrorsBySeverity(severity: ErrorSeverity): ErrorDefinition[] {
  const allErrors = { ...BATCH_REJECTION_CODES, ...RECORD_REJECTION_CODES }
  return Object.values(allErrors).filter(e => e.severity === severity)
}

/**
 * Validate AFORE code
 */
export function isValidAFORECode(code: string): boolean {
  const afore = AFORE_CATALOG[code]
  return afore !== undefined && afore.active
}

/**
 * Get AFORE name by code
 */
export function getAFOREName(code: string): string {
  return AFORE_CATALOG[code]?.name || 'Desconocida'
}

/**
 * Validate movement type for file type
 */
export function isValidMovementType(movementCode: string, fileType: string): boolean {
  const movement = MOVEMENT_TYPE_CATALOG[movementCode]
  return movement !== undefined && movement.fileTypes.includes(fileType)
}

// ============================================
// EXPORT ALL
// ============================================

export const consarErrorCatalog = {
  BATCH_REJECTION_CODES,
  RECORD_REJECTION_CODES,
  AFORE_CATALOG,
  MOVEMENT_TYPE_CATALOG,
  SUBCUENTA_CATALOG,
  FILE_TYPE_CONFIG,
  getErrorDefinition,
  getErrorsByCategory,
  getErrorsBySeverity,
  isValidAFORECode,
  getAFOREName,
  isValidMovementType,
}

export default consarErrorCatalog
