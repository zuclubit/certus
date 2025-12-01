/**
 * Mexican Document Validators
 *
 * Complete validation algorithms for Mexican official documents:
 * - CURP (Clave Única de Registro de Población)
 * - NSS (Número de Seguridad Social)
 * - RFC (Registro Federal de Contribuyentes)
 * - Cuenta CLABE (Cuenta Bancaria Estandarizada)
 *
 * Based on official RENAPO, IMSS, SAT, and Banxico specifications.
 *
 * @module mexican-validators
 */

// Mexican state codes for CURP validation
const ENTIDAD_FEDERATIVA_CODES: Record<string, string> = {
  AS: 'Aguascalientes',
  BC: 'Baja California',
  BS: 'Baja California Sur',
  CC: 'Campeche',
  CL: 'Coahuila',
  CM: 'Colima',
  CS: 'Chiapas',
  CH: 'Chihuahua',
  DF: 'Ciudad de México',
  DG: 'Durango',
  GT: 'Guanajuato',
  GR: 'Guerrero',
  HG: 'Hidalgo',
  JC: 'Jalisco',
  MC: 'México',
  MN: 'Michoacán',
  MS: 'Morelos',
  NT: 'Nayarit',
  NL: 'Nuevo León',
  OC: 'Oaxaca',
  PL: 'Puebla',
  QT: 'Querétaro',
  QR: 'Quintana Roo',
  SP: 'San Luis Potosí',
  SL: 'Sinaloa',
  SR: 'Sonora',
  TC: 'Tabasco',
  TS: 'Tamaulipas',
  TL: 'Tlaxcala',
  VZ: 'Veracruz',
  YN: 'Yucatán',
  ZS: 'Zacatecas',
  NE: 'Nacido en el Extranjero',
}

// Forbidden words in CURP (offensive combinations that are replaced)
const PALABRAS_INCONVENIENTES = [
  'BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO',
  'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO', 'COLA', 'CULO', 'FALO', 'FETO',
  'GETA', 'GUEI', 'GUEY', 'JETA', 'JOTO', 'KACA', 'KACO', 'KAGA', 'KAGO', 'KAKA',
  'KAKO', 'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI', 'KOJO', 'KOLA', 'KULO', 'LILO',
  'LOCA', 'LOCO', 'LOKA', 'LOKO', 'MAME', 'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR',
  'MION', 'MOCO', 'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA', 'PEDO', 'PENE',
  'PIPI', 'PITO', 'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO',
  'RUIN', 'SENO', 'TETA', 'VUEI', 'VUEY', 'WUEI', 'WUEY'
]

/**
 * Character dictionary for CURP verification digit calculation
 * 0-9 = 0-9, A-Z (including Ñ) = 10-36
 */
const CURP_DICTIONARY = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  details?: CURPData | NSSData | RFCData | CLABEData
}

/**
 * CURP parsed data
 */
export interface CURPData {
  apellidoPaterno: string
  apellidoMaterno: string
  nombre: string
  fechaNacimiento: Date | null
  sexo: 'H' | 'M'
  entidadFederativa: string
  entidadNombre: string
  consonantes: string
  homoclave: string
  digitoVerificador: string
}

// ============================================
// CURP VALIDATION
// ============================================

/**
 * Validates CURP format and check digit
 *
 * CURP Structure (18 characters):
 * - Positions 1-4: First surname initial + first internal vowel, second surname initial, first name initial
 * - Positions 5-10: Birth date (YYMMDD)
 * - Position 11: Sex (H/M)
 * - Positions 12-13: State code
 * - Positions 14-16: First internal consonants of surnames and name
 * - Position 17: Homonymy differentiator
 * - Position 18: Check digit
 */
export function validateCURP(curp: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Clean input
  const cleanCURP = curp.trim().toUpperCase()

  // Check length
  if (cleanCURP.length !== 18) {
    errors.push(`CURP debe tener exactamente 18 caracteres, tiene ${cleanCURP.length}`)
    return { isValid: false, errors, warnings }
  }

  // Basic format validation
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/
  if (!curpRegex.test(cleanCURP)) {
    errors.push('Formato de CURP inválido')
    return { isValid: false, errors, warnings }
  }

  // Extract components
  const firstFourChars = cleanCURP.substring(0, 4)
  const birthDateStr = cleanCURP.substring(4, 10)
  const sex = cleanCURP.substring(10, 11)
  const stateCode = cleanCURP.substring(11, 13)
  const consonants = cleanCURP.substring(13, 16)
  const homoclave = cleanCURP.substring(16, 17)
  const checkDigit = cleanCURP.substring(17, 18)

  // Validate state code
  if (!ENTIDAD_FEDERATIVA_CODES[stateCode]) {
    errors.push(`Código de entidad federativa inválido: ${stateCode}`)
  }

  // Validate birth date
  const year = parseInt(birthDateStr.substring(0, 2), 10)
  const month = parseInt(birthDateStr.substring(2, 4), 10)
  const day = parseInt(birthDateStr.substring(4, 6), 10)

  // Determine century based on homoclave
  const fullYear = homoclave >= 'A' ? 2000 + year : 1900 + year
  const birthDate = new Date(fullYear, month - 1, day)

  if (isNaN(birthDate.getTime()) ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day) {
    errors.push('Fecha de nacimiento inválida en CURP')
  }

  // Check for forbidden words
  if (PALABRAS_INCONVENIENTES.includes(firstFourChars)) {
    warnings.push(`Los primeros 4 caracteres contienen palabra inconveniente: ${firstFourChars}`)
  }

  // Validate check digit
  const calculatedDigit = calculateCURPCheckDigit(cleanCURP.substring(0, 17))
  if (calculatedDigit !== checkDigit) {
    errors.push(`Dígito verificador inválido: esperado ${calculatedDigit}, encontrado ${checkDigit}`)
  }

  const details: CURPData = {
    apellidoPaterno: firstFourChars.substring(0, 2),
    apellidoMaterno: firstFourChars.substring(2, 3),
    nombre: firstFourChars.substring(3, 4),
    fechaNacimiento: birthDate,
    sexo: sex as 'H' | 'M',
    entidadFederativa: stateCode,
    entidadNombre: ENTIDAD_FEDERATIVA_CODES[stateCode] || 'Desconocido',
    consonantes: consonants,
    homoclave,
    digitoVerificador: checkDigit,
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details,
  }
}

/**
 * Calculate CURP check digit (dígito verificador)
 * Algorithm:
 * 1. Assign each character a value (0-36) based on CURP_DICTIONARY
 * 2. Multiply each value by its weight (18, 17, 16... down to 2)
 * 3. Sum all products
 * 4. Check digit = 10 - (sum % 10), if result is 10, digit is 0
 */
export function calculateCURPCheckDigit(curp17: string): string {
  let sum = 0

  for (let i = 0; i < 17; i++) {
    const char = curp17.charAt(i)
    const value = CURP_DICTIONARY.indexOf(char)
    if (value === -1) {
      return '0' // Invalid character
    }
    const weight = 18 - i
    sum += value * weight
  }

  const remainder = sum % 10
  const digit = remainder === 0 ? 0 : 10 - remainder

  return digit.toString()
}

/**
 * Quick CURP format check (without check digit validation)
 */
export function isValidCURPFormat(curp: string): boolean {
  const cleanCURP = curp.trim().toUpperCase()
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/
  return curpRegex.test(cleanCURP)
}

// ============================================
// NSS VALIDATION
// ============================================

/**
 * NSS parsed data
 */
export interface NSSData {
  subdelegacion: string
  añoAlta: string
  añoNacimiento: string
  numeroConsecutivo: string
  digitoVerificador: string
}

/**
 * Validates NSS (Número de Seguridad Social)
 *
 * NSS Structure (11 digits):
 * - Positions 1-2: Subdelegation code (01-97)
 * - Positions 3-4: Year of registration (00-99)
 * - Positions 5-6: Year of birth (00-99)
 * - Positions 7-10: Sequential number (0001-9999)
 * - Position 11: Check digit (Luhn algorithm)
 */
export function validateNSS(nss: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Clean input
  const cleanNSS = nss.trim().replace(/\D/g, '')

  // Check length
  if (cleanNSS.length !== 11) {
    errors.push(`NSS debe tener exactamente 11 dígitos, tiene ${cleanNSS.length}`)
    return { isValid: false, errors, warnings }
  }

  // Validate it's all digits
  if (!/^\d{11}$/.test(cleanNSS)) {
    errors.push('NSS debe contener solo dígitos numéricos')
    return { isValid: false, errors, warnings }
  }

  // Extract components
  const subdelegacion = cleanNSS.substring(0, 2)
  const añoAlta = cleanNSS.substring(2, 4)
  const añoNacimiento = cleanNSS.substring(4, 6)
  const numeroConsecutivo = cleanNSS.substring(6, 10)
  const digitoVerificador = cleanNSS.substring(10, 11)

  // Validate subdelegation (01-97)
  const subdelNum = parseInt(subdelegacion, 10)
  if (subdelNum < 1 || subdelNum > 97) {
    errors.push(`Código de subdelegación inválido: ${subdelegacion} (debe ser 01-97)`)
  }

  // Validate check digit using Luhn algorithm
  const calculatedDigit = calculateNSSCheckDigit(cleanNSS.substring(0, 10))
  if (calculatedDigit !== digitoVerificador) {
    errors.push(`Dígito verificador inválido: esperado ${calculatedDigit}, encontrado ${digitoVerificador}`)
  }

  const details: NSSData = {
    subdelegacion,
    añoAlta,
    añoNacimiento,
    numeroConsecutivo,
    digitoVerificador,
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details,
  }
}

/**
 * Calculate NSS check digit using Luhn algorithm (mod 10)
 */
export function calculateNSSCheckDigit(nss10: string): string {
  let sum = 0

  for (let i = 0; i < 10; i++) {
    let digit = parseInt(nss10.charAt(i), 10)

    // Double every second digit from the right (positions 9, 7, 5, 3, 1 in 0-indexed)
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
  }

  const remainder = sum % 10
  const checkDigit = remainder === 0 ? 0 : 10 - remainder

  return checkDigit.toString()
}

/**
 * Quick NSS format check
 */
export function isValidNSSFormat(nss: string): boolean {
  const cleanNSS = nss.trim().replace(/\D/g, '')
  return /^\d{11}$/.test(cleanNSS)
}

// ============================================
// RFC VALIDATION
// ============================================

/**
 * RFC parsed data
 */
export interface RFCData {
  tipo: 'persona_fisica' | 'persona_moral'
  letrasIniciales: string
  fechaConstitucion: Date | null
  homoclave: string
  digitoVerificador: string
}

/**
 * Validates RFC (Registro Federal de Contribuyentes)
 *
 * RFC Structure:
 * - Persona Moral (12 characters): 3 letters + 6 digits (date) + 3 homoclave
 * - Persona Física (13 characters): 4 letters + 6 digits (date) + 3 homoclave
 */
export function validateRFC(rfc: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Clean input
  const cleanRFC = rfc.trim().toUpperCase().replace(/[^A-ZÑ&0-9]/g, '')

  // Check length (12 for moral, 13 for física)
  if (cleanRFC.length !== 12 && cleanRFC.length !== 13) {
    errors.push(`RFC debe tener 12 (moral) o 13 (física) caracteres, tiene ${cleanRFC.length}`)
    return { isValid: false, errors, warnings }
  }

  const isPersonaFisica = cleanRFC.length === 13

  // Validate format
  const rfcRegexFisica = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/
  const rfcRegexMoral = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/

  if (isPersonaFisica && !rfcRegexFisica.test(cleanRFC)) {
    errors.push('Formato de RFC persona física inválido')
    return { isValid: false, errors, warnings }
  }

  if (!isPersonaFisica && !rfcRegexMoral.test(cleanRFC)) {
    errors.push('Formato de RFC persona moral inválido')
    return { isValid: false, errors, warnings }
  }

  // Extract date
  const dateOffset = isPersonaFisica ? 4 : 3
  const dateStr = cleanRFC.substring(dateOffset, dateOffset + 6)

  const year = parseInt(dateStr.substring(0, 2), 10)
  const month = parseInt(dateStr.substring(2, 4), 10)
  const day = parseInt(dateStr.substring(4, 6), 10)

  // Validate date
  if (month < 1 || month > 12) {
    errors.push(`Mes inválido en RFC: ${month}`)
  }

  if (day < 1 || day > 31) {
    errors.push(`Día inválido en RFC: ${day}`)
  }

  // Calculate century (assume 20th century for now, could be 21st for recent)
  const fullYear = year > 30 ? 1900 + year : 2000 + year
  const date = new Date(fullYear, month - 1, day)

  if (isNaN(date.getTime()) || date.getMonth() !== month - 1 || date.getDate() !== day) {
    warnings.push('Fecha en RFC podría ser inválida')
  }

  // Validate check digit
  const homoclave = cleanRFC.substring(cleanRFC.length - 3)
  const checkDigit = homoclave.charAt(2)
  const calculatedDigit = calculateRFCCheckDigit(cleanRFC.substring(0, cleanRFC.length - 1))

  if (calculatedDigit !== checkDigit) {
    warnings.push(`Dígito verificador posiblemente inválido: esperado ${calculatedDigit}, encontrado ${checkDigit}`)
  }

  const details: RFCData = {
    tipo: isPersonaFisica ? 'persona_fisica' : 'persona_moral',
    letrasIniciales: cleanRFC.substring(0, dateOffset),
    fechaConstitucion: date,
    homoclave: homoclave.substring(0, 2),
    digitoVerificador: checkDigit,
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details,
  }
}

/**
 * RFC character values for check digit calculation
 */
const RFC_CHAR_VALUES: Record<string, number> = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17, 'I': 18,
  'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, '&': 24, 'O': 25, 'P': 26, 'Q': 27,
  'R': 28, 'S': 29, 'T': 30, 'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 36,
  ' ': 37, 'Ñ': 38,
}

/**
 * Calculate RFC check digit
 */
export function calculateRFCCheckDigit(rfc: string): string {
  // Pad to 12 characters for calculation (persona moral already 12, física needs trimming)
  const rfcPadded = rfc.length === 12 ? '0' + rfc : rfc

  let sum = 0
  for (let i = 0; i < 12; i++) {
    const char = rfcPadded.charAt(i)
    const value = RFC_CHAR_VALUES[char] ?? 0
    const weight = 13 - i
    sum += value * weight
  }

  const remainder = sum % 11

  if (remainder === 0) return '0'
  if (remainder === 10) return 'A'
  return (11 - remainder).toString()
}

/**
 * Quick RFC format check
 */
export function isValidRFCFormat(rfc: string): boolean {
  const cleanRFC = rfc.trim().toUpperCase()
  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/
  return rfcRegex.test(cleanRFC)
}

// ============================================
// CLABE VALIDATION
// ============================================

/**
 * CLABE bank codes (major banks)
 */
const CLABE_BANK_CODES: Record<string, string> = {
  '002': 'BANAMEX',
  '012': 'BBVA BANCOMER',
  '014': 'SANTANDER',
  '021': 'HSBC',
  '030': 'BAJÍO',
  '032': 'IXE',
  '036': 'INBURSA',
  '037': 'INTERACCIONES',
  '042': 'MIFEL',
  '044': 'SCOTIABANK',
  '058': 'BANREGIO',
  '059': 'INVEX',
  '060': 'BANSI',
  '062': 'AFIRME',
  '072': 'BANORTE',
  '106': 'BANK OF AMERICA',
  '112': 'BMONEX',
  '113': 'VE POR MAS',
  '127': 'AZTECA',
  '130': 'STP',
  '131': 'SERFIN',
  '133': 'ACTINVER',
  '136': 'INTERCAM BANCO',
  '137': 'BANCOPPEL',
  '140': 'CONSUBANCO',
  '141': 'VOLKSWAGEN',
  '143': 'CIBanco',
  '145': 'BBASE',
  '166': 'BANSEFI',
  '168': 'HIPOTECARIA FEDERAL',
  '600': 'MONEXCB',
  '601': 'GBM',
  '602': 'MASARI',
  '606': 'INDEVAL',
  '608': 'VECTOR',
  '610': 'B&B',
  '614': 'ACCIVAL',
  '616': 'FINAMEX',
  '617': 'VALMEX',
  '618': 'UNICA',
  '619': 'MAPFRE',
  '620': 'PROFUTURO',
  '630': 'CB INTERCAM',
  '631': 'CI BOLSA',
  '634': 'FINCOMUN',
  '636': 'HDI SEGUROS',
  '637': 'ORDER',
  '638': 'NU MEXICO',
  '640': 'JP MORGAN',
  '646': 'STP',
  '647': 'TELECOMM',
  '648': 'EVERCORE',
  '649': 'SKANDIA',
  '651': 'SEGUROS INBURSA',
  '652': 'ASEA',
  '653': 'KUSPIT',
  '655': 'UNAGRA',
  '656': 'SOFIEXPRESS',
  '659': 'ASP INTEGRA OPC',
  '670': 'LIBERTAD',
  '677': 'CAJA POP MEXICANA',
  '680': 'CRISTOBAL COLON',
  '683': 'CAJA TELEFONISTAS',
  '684': 'TRANSFER',
  '685': 'FONDO (FIRA)',
  '686': 'INVERCAP',
  '689': 'FOMPED',
  '699': 'COOPDESARROLLO',
  '701': 'ADVANCIS',
  '703': 'BANCO FORJADORES',
  '706': 'ARCUS',
  '710': 'NVIO',
  '812': 'BBVA BANCOMER (2)',
  '899': 'CLS'
}

/**
 * CLABE parsed data
 */
export interface CLABEData {
  bancoCode: string
  bancoNombre: string
  plazaCode: string
  cuentaCode: string
  digitoVerificador: string
}

/**
 * Validates CLABE (Clave Bancaria Estandarizada)
 *
 * CLABE Structure (18 digits):
 * - Positions 1-3: Bank code
 * - Positions 4-6: Plaza code (branch location)
 * - Positions 7-17: Account number
 * - Position 18: Check digit
 */
export function validateCLABE(clabe: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Clean input
  const cleanCLABE = clabe.trim().replace(/\D/g, '')

  // Check length
  if (cleanCLABE.length !== 18) {
    errors.push(`CLABE debe tener exactamente 18 dígitos, tiene ${cleanCLABE.length}`)
    return { isValid: false, errors, warnings }
  }

  // Extract components
  const bancoCode = cleanCLABE.substring(0, 3)
  const plazaCode = cleanCLABE.substring(3, 6)
  const cuentaCode = cleanCLABE.substring(6, 17)
  const digitoVerificador = cleanCLABE.substring(17, 18)

  // Validate bank code
  const bancoNombre = CLABE_BANK_CODES[bancoCode]
  if (!bancoNombre) {
    warnings.push(`Código de banco no reconocido: ${bancoCode}`)
  }

  // Validate check digit
  const calculatedDigit = calculateCLABECheckDigit(cleanCLABE.substring(0, 17))
  if (calculatedDigit !== digitoVerificador) {
    errors.push(`Dígito verificador inválido: esperado ${calculatedDigit}, encontrado ${digitoVerificador}`)
  }

  const details: CLABEData = {
    bancoCode,
    bancoNombre: bancoNombre || 'Desconocido',
    plazaCode,
    cuentaCode,
    digitoVerificador,
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    details,
  }
}

/**
 * CLABE weights for check digit calculation
 */
const CLABE_WEIGHTS = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7]

/**
 * Calculate CLABE check digit
 */
export function calculateCLABECheckDigit(clabe17: string): string {
  let sum = 0

  for (let i = 0; i < 17; i++) {
    const digit = parseInt(clabe17.charAt(i), 10)
    const product = (digit * CLABE_WEIGHTS[i]) % 10
    sum += product
  }

  const checkDigit = (10 - (sum % 10)) % 10

  return checkDigit.toString()
}

/**
 * Quick CLABE format check
 */
export function isValidCLABEFormat(clabe: string): boolean {
  const cleanCLABE = clabe.trim().replace(/\D/g, '')
  return /^\d{18}$/.test(cleanCLABE)
}

// ============================================
// EXPORT ALL VALIDATORS
// ============================================

export const mexicanValidators = {
  // CURP
  validateCURP,
  calculateCURPCheckDigit,
  isValidCURPFormat,

  // NSS
  validateNSS,
  calculateNSSCheckDigit,
  isValidNSSFormat,

  // RFC
  validateRFC,
  calculateRFCCheckDigit,
  isValidRFCFormat,

  // CLABE
  validateCLABE,
  calculateCLABECheckDigit,
  isValidCLABEFormat,

  // Constants
  ENTIDAD_FEDERATIVA_CODES,
  CLABE_BANK_CODES,
}

export default mexicanValidators
