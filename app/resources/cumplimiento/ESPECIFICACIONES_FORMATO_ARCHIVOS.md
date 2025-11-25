# ESPECIFICACIONES TÉCNICAS DE FORMATO DE ARCHIVOS CONSAR

**Sistema de Ahorro para el Retiro (SAR)**
**Versión**: 2.0
**Vigencia**: 2025
**Base normativa**: Circular CONSAR 19-8

---

## ÍNDICE

1. [Archivo de Nómina (NOMINA)](#archivo-de-nómina-nomina)
2. [Archivo Contable (CONTABLE)](#archivo-contable-contable)
3. [Archivo de Regularización (REGULARIZACION)](#archivo-de-regularización-regularizacion)
4. [Validaciones Comunes](#validaciones-comunes)
5. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## ARCHIVO DE NÓMINA (NOMINA)

### Descripción General
Archivo que contiene las aportaciones patronales bimestrales a las cuentas individuales de los trabajadores.

### Periodicidad
Bimestral (enero-febrero, marzo-abril, mayo-junio, julio-agosto, septiembre-octubre, noviembre-diciembre)

### Plazo de Envío
Día 17 del segundo mes siguiente al bimestre reportado

### Estructura General
```
01 - Registro de Encabezado (1 registro)
02 - Registros de Detalle (N registros)
03 - Registro de Sumaria (1 registro)
```

---

### REGISTRO TIPO 01 - ENCABEZADO NOMINA

**Longitud**: 77 caracteres

| Posición | Longitud | Campo            | Tipo   | Descripción                          | Validación          |
|----------|----------|------------------|--------|--------------------------------------|---------------------|
| 1-2      | 2        | recordType       | String | Tipo de registro = "01"              | Obligatorio, ="01"  |
| 3-9      | 7        | fileType         | String | Tipo de archivo = "NOMINA"           | Obligatorio         |
| 10-22    | 13       | companyRFC       | String | RFC del patrón                       | NOMINA_VAL_03       |
| 23-30    | 8        | fileDate         | Date   | Fecha generación (YYYYMMDD)          | NOMINA_VAL_11       |
| 31-34    | 4        | sequenceNumber   | Number | Número de secuencia (0001-9999)      | NOMINA_VAL_12       |
| 35-36    | 2        | afore            | String | Clave AFORE destino (01-99)          | Catálogo vigente    |
| 37-77    | 41       | filler           | String | Espacios en blanco                   | Opcional            |

**Ejemplo**:
```
01NOMINAABC010101ABC 202501150001054
```

---

### REGISTRO TIPO 02 - DETALLE NOMINA

**Longitud**: Variable (aproximadamente 100 caracteres)

| Posición | Longitud | Campo            | Tipo     | Descripción                           | Validación          |
|----------|----------|------------------|----------|---------------------------------------|---------------------|
| 1-2      | 2        | recordType       | String   | Tipo de registro = "02"               | Obligatorio, ="02"  |
| 3-13     | 11       | nss              | String   | Número de Seguridad Social            | NOMINA_VAL_01       |
| 14-31    | 18       | curp             | String   | CURP del trabajador                   | NOMINA_VAL_02       |
| 32-71    | 40       | employeeName     | String   | Nombre completo del trabajador        | NOMINA_VAL_09, 13   |
| 72-80    | 9        | amount           | Currency | Importe aportación (7 ent + 2 dec)    | NOMINA_VAL_06, 07   |
| 81       | 1        | movementType     | String   | Tipo: A=Alta, B=Baja, M=Modificación  | NOMINA_VAL_10       |
| 82-89    | 8        | paymentDate      | Date     | Fecha de pago nómina (YYYYMMDD)       | NOMINA_VAL_04, 05   |
| 90-100   | 11       | account          | String   | Cuenta individual (11 dígitos)        | NOMINA_VAL_08       |

**Ejemplo**:
```
0212345678901AAAA850303HDFLLL01JUAN PEREZ GOMEZ                   000050000A2025011512345678901
```

**Interpretación**:
- NSS: 12345678901
- CURP: AAAA850303HDFLLL01
- Nombre: "JUAN PEREZ GOMEZ" (completado con espacios a 40 caracteres)
- Importe: $500.00 (representado como 000050000 centavos)
- Tipo: A (Alta - nuevo trabajador)
- Fecha pago: 20250115 (15 de enero de 2025)
- Cuenta individual: 12345678901

---

### REGISTRO TIPO 03 - SUMARIA NOMINA

**Longitud**: 77 caracteres

| Posición | Longitud | Campo            | Tipo     | Descripción                              | Validación          |
|----------|----------|------------------|----------|------------------------------------------|---------------------|
| 1-2      | 2        | recordType       | String   | Tipo de registro = "03"                  | Obligatorio, ="03"  |
| 3-10     | 8        | totalRecords     | Number   | Total de registros tipo 02               | Obligatorio         |
| 11-22    | 12       | totalAmount      | Currency | Suma total de importes (10 ent + 2 dec)  | Debe cuadrar        |
| 23-77    | 55       | filler           | String   | Espacios en blanco                       | Opcional            |

**Ejemplo**:
```
0300001250000005000000
```

**Interpretación**:
- Total registros: 00001250 = 1,250 trabajadores
- Total importes: 000005000000 = $50,000.00

---

## ARCHIVO CONTABLE (CONTABLE)

### Descripción General
Archivo que contiene los movimientos contables mensuales de la AFORE y SIEFORE conforme al catálogo de cuentas SAT.

### Periodicidad
Mensual

### Plazo de Envío
Día 10 del mes siguiente

### Estructura General
```
01 - Registro de Encabezado (1 registro)
02 - Registros de Detalle (N registros)
03 - Registro de Sumaria (1 registro)
```

---

### REGISTRO TIPO 01 - ENCABEZADO CONTABLE

**Longitud**: 77 caracteres

| Posición | Longitud | Campo            | Tipo   | Descripción                          | Validación           |
|----------|----------|------------------|--------|--------------------------------------|----------------------|
| 1-2      | 2        | recordType       | String | Tipo de registro = "01"              | Obligatorio, ="01"   |
| 3-10     | 8        | fileType         | String | Tipo de archivo = "CONTABLE"         | Obligatorio          |
| 11-23    | 13       | companyRFC       | String | RFC de la AFORE                      | CONTABLE_VAL_01      |
| 24-31    | 8        | fileDate         | Date   | Fecha generación (YYYYMMDD)          | CONTABLE_VAL_13      |
| 32-35    | 4        | periodYear       | Number | Año del periodo contable (YYYY)      | CONTABLE_VAL_11      |
| 36-37    | 2        | periodMonth      | Number | Mes del periodo (01-12)              | CONTABLE_VAL_12      |
| 38-77    | 40       | filler           | String | Espacios en blanco                   | Opcional             |

**Ejemplo**:
```
01CONTABLEXYZ990101XYZ20250210202501
```

**Interpretación**:
- Tipo archivo: CONTABLE
- RFC AFORE: XYZ990101XYZ
- Fecha generación: 20250210 (10 de febrero de 2025)
- Periodo: Año 2025, Mes 01 (enero 2025)

---

### REGISTRO TIPO 02 - DETALLE CONTABLE

**Longitud**: 115 caracteres

| Posición | Longitud | Campo            | Tipo     | Descripción                           | Validación           |
|----------|----------|------------------|----------|---------------------------------------|----------------------|
| 1-2      | 2        | recordType       | String   | Tipo de registro = "02"               | Obligatorio, ="02"   |
| 3-6      | 4        | accountCode      | String   | Código cuenta SAT (4 dígitos)         | CONTABLE_VAL_04      |
| 7-10     | 4        | subAccountCode   | String   | Código subcuenta (opcional)           | Opcional, numérico   |
| 11-18    | 8        | date             | Date     | Fecha movimiento (YYYYMMDD)           | CONTABLE_VAL_02, 03  |
| 19-30    | 12       | debitAmount      | Currency | Importe cargo (10 ent + 2 dec)        | CONTABLE_VAL_05, 07  |
| 31-42    | 12       | creditAmount     | Currency | Importe abono (10 ent + 2 dec)        | CONTABLE_VAL_06, 07  |
| 43-62    | 20       | reference        | String   | Referencia del movimiento             | CONTABLE_VAL_08      |
| 63-112   | 50       | concept          | String   | Descripción del concepto              | CONTABLE_VAL_09, 14  |
| 113-115  | 3        | currency         | String   | Moneda: MXN, USD, EUR                 | CONTABLE_VAL_10      |

**Ejemplo**:
```
027115    20250115000001250000000000000000REF20250115001         Aportaciones voluntarias trabajadores enero 2025  MXN
```

**Interpretación**:
- Cuenta: 7115 (Aportaciones voluntarias)
- Subcuenta: (vacía - espacios)
- Fecha: 20250115 (15 de enero de 2025)
- Cargo: $12,500.00
- Abono: $0.00
- Referencia: "REF20250115001"
- Concepto: "Aportaciones voluntarias trabajadores enero 2025"
- Moneda: MXN

**NOTA IMPORTANTE**: La cuenta 7115 está sujeta a validación especial CONTABLE_VAL_15 conforme a Circular CONSAR 28-2025 (conversión de divisas).

---

### REGISTRO TIPO 03 - SUMARIA CONTABLE

**Longitud**: 77 caracteres

| Posición | Longitud | Campo            | Tipo     | Descripción                              | Validación          |
|----------|----------|------------------|----------|------------------------------------------|---------------------|
| 1-2      | 2        | recordType       | String   | Tipo de registro = "03"                  | Obligatorio, ="03"  |
| 3-10     | 8        | totalRecords     | Number   | Total de registros tipo 02               | Obligatorio         |
| 11-25    | 15       | totalDebit       | Currency | Total cargos (13 ent + 2 dec)            | Debe cuadrar        |
| 26-40    | 15       | totalCredit      | Currency | Total abonos (13 ent + 2 dec)            | Debe cuadrar        |
| 41-77    | 37       | filler           | String   | Espacios en blanco                       | Opcional            |

**Ejemplo**:
```
0300003500000125000000000000125000000000
```

**Interpretación**:
- Total registros: 00003500 = 3,500 movimientos
- Total cargos: 000001250000000 = $12,500,000.00
- Total abonos: 000001250000000 = $12,500,000.00
- Validación: Total cargos = Total abonos (balanza cuadrada)

---

## ARCHIVO DE REGULARIZACIÓN (REGULARIZACION)

### Descripción General
Archivo que contiene correcciones a movimientos previamente enviados. Se utiliza cuando se detectan errores en archivos ya procesados.

### Periodicidad
Según necesidad (eventual)

### Plazo de Envío
- Dentro de 30 minutos: Sin autorización
- Después de 30 minutos: Requiere autorización CONSAR

### Estructura General
```
01 - Registro de Encabezado (1 registro)
02 - Registros de Detalle (N registros)
03 - Registro de Sumaria (1 registro)
```

---

### REGISTRO TIPO 01 - ENCABEZADO REGULARIZACION

**Longitud**: 77 caracteres

| Posición | Longitud | Campo            | Tipo   | Descripción                           | Validación                |
|----------|----------|------------------|--------|---------------------------------------|---------------------------|
| 1-2      | 2        | recordType       | String | Tipo de registro = "01"               | Obligatorio, ="01"        |
| 3-16     | 14       | fileType         | String | Tipo = "REGULARIZACION"               | Obligatorio               |
| 17-29    | 13       | companyRFC       | String | RFC del patrón                        | REGULARIZACION_VAL_12     |
| 30-37    | 8        | fileDate         | Date   | Fecha generación (YYYYMMDD)           | REGULARIZACION_VAL_13     |
| 38-39    | 2        | afore            | String | Clave AFORE (01-99)                   | Catálogo vigente          |
| 40-77    | 38       | filler           | String | Espacios en blanco                    | Opcional                  |

**Ejemplo**:
```
01REGULARIZACIONDEF850303DEF2025011505
```

---

### REGISTRO TIPO 02 - DETALLE REGULARIZACION

**Longitud**: 108 caracteres

| Posición | Longitud | Campo               | Tipo     | Descripción                              | Validación                |
|----------|----------|---------------------|----------|------------------------------------------|---------------------------|
| 1-2      | 2        | recordType          | String   | Tipo de registro = "02"                  | Obligatorio, ="02"        |
| 3-13     | 11       | account             | String   | Cuenta individual (11 dígitos)           | REGULARIZACION_VAL_01     |
| 14-24    | 11       | nss                 | String   | NSS del trabajador                       | REGULARIZACION_VAL_02     |
| 25-32    | 8        | originalDate        | Date     | Fecha movimiento original (YYYYMMDD)     | REGULARIZACION_VAL_03     |
| 33-40    | 8        | correctionDate      | Date     | Fecha corrección (YYYYMMDD)              | REGULARIZACION_VAL_04, 05, 06 |
| 41-49    | 9        | originalAmount      | Currency | Importe original (7 ent + 2 dec)         | REGULARIZACION_VAL_07     |
| 50-58    | 9        | correctedAmount     | Currency | Importe corregido (7 ent + 2 dec)        | REGULARIZACION_VAL_08, 09 |
| 59-88    | 30       | reason              | String   | Motivo regularización                    | REGULARIZACION_VAL_10, 14 |
| 89-108   | 20       | authReference       | String   | Referencia de autorización               | REGULARIZACION_VAL_11, 15 |

**Ejemplo**:
```
021234567890112345678901202412152025011500004500000005000Error captura importe originAUT-CONSAR-2025-00123
```

**Interpretación**:
- Cuenta: 12345678901
- NSS: 12345678901
- Fecha original: 20241215 (15 de diciembre de 2024)
- Fecha corrección: 20250115 (15 de enero de 2025)
- Importe original: $45.00
- Importe corregido: $50.00
- Motivo: "Error captura importe origin" (30 caracteres)
- Autorización: "AUT-CONSAR-2025-00123"

---

### REGISTRO TIPO 03 - SUMARIA REGULARIZACION

**Longitud**: 77 caracteres

| Posición | Longitud | Campo                  | Tipo     | Descripción                              | Validación          |
|----------|----------|------------------------|----------|------------------------------------------|---------------------|
| 1-2      | 2        | recordType             | String   | Tipo de registro = "03"                  | Obligatorio, ="03"  |
| 3-10     | 8        | totalRecords           | Number   | Total de registros tipo 02               | Obligatorio         |
| 11-22    | 12       | totalOriginalAmount    | Currency | Total importes originales (10 ent + 2 dec) | Debe cuadrar      |
| 23-34    | 12       | totalCorrectedAmount   | Currency | Total importes corregidos (10 ent + 2 dec) | Debe cuadrar      |
| 35-77    | 43       | filler                 | String   | Espacios en blanco                       | Opcional            |

**Ejemplo**:
```
0300000125000000450000000000500000
```

**Interpretación**:
- Total registros: 00000125 = 125 correcciones
- Total original: 000000450000 = $4,500.00
- Total corregido: 000000500000 = $5,000.00

---

## VALIDACIONES COMUNES

### Formato RFC
```regex
^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$
```
- Longitud: 12-13 caracteres
- Ejemplo válido: ABC010101ABC

### Formato CURP
```regex
^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$
```
- Longitud: 18 caracteres exactos
- Ejemplo válido: AAAA850303HDFLLL01

### Formato NSS
```regex
^\d{11}$
```
- Longitud: 11 dígitos numéricos
- Ejemplo válido: 12345678901

### Formato Fecha
```regex
^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$
```
- Formato: YYYYMMDD
- Rango de años: 1900-2099
- Validación adicional de fecha real (no 20250230)
- Ejemplo válido: 20250115

### Formato Importe
- Representación: Entero en centavos
- Dígitos: Variable según campo (9, 12, o 15 dígitos)
- Alineación: Derecha con ceros a la izquierda
- Sin signo: Solo valores positivos
- Ejemplo: 000012345 = $123.45

---

## EJEMPLOS PRÁCTICOS

### Ejemplo Completo: Archivo NOMINA

**Nombre del archivo**: `NOMINA_ABC010101ABC_20250115_0001.txt`

**Contenido**:
```
01NOMINAABC010101ABC 202501150001054
0212345678901AAAA850303HDFLLL01JUAN PEREZ GOMEZ                   000050000A2025011512345678901
0298765432109BBBB900505MDFAAA02MARIA LOPEZ HERNANDEZ              000075000M2025011598765432109
0211223344556CCCC750808HDFBBB03CARLOS RAMIREZ SANCHEZ             000100000A2025011511223344556
0300000003000002250000
```

**Análisis**:
- **Línea 1 (Encabezado)**:
  - RFC patrón: ABC010101ABC
  - Fecha: 20250115
  - Secuencia: 0001
  - AFORE destino: 05

- **Líneas 2-4 (Detalles)**:
  - 3 trabajadores
  - Importes: $500.00, $750.00, $1,000.00
  - Tipos: Alta, Modificación, Alta

- **Línea 5 (Sumaria)**:
  - Total registros: 3
  - Total importes: $2,250.00 (500 + 750 + 1000)

### Ejemplo Completo: Archivo CONTABLE

**Nombre del archivo**: `CONTABLE_XYZ990101XYZ_20250210_0001.txt`

**Contenido**:
```
01CONTABLEXYZ990101XYZ20250210202501
027110    20250131000000500000000000000000REF-ENE-001               Aportaciones obligatorias enero 2025              MXN
027110    20250131000000000000000000500000REF-ENE-001               Aportaciones obligatorias enero 2025              MXN
031000    20250131000000020000000000000000REF-ENE-002               Gastos administrativos enero 2025                 MXN
031000    20250131000000000000000000020000REF-ENE-002               Gastos administrativos enero 2025                 MXN
0300000004000000520000000000000520000000
```

**Análisis**:
- **Periodo**: Enero 2025
- **Movimientos**: 4 asientos contables
- **Balanza**:
  - Total cargos: $5,200.00
  - Total abonos: $5,200.00
  - Status: Cuadrada ✓

### Ejemplo de Archivo con Errores

**Problema**: CURP inválido en línea 2

```
01NOMINAABC010101ABC 202501150001054
0212345678901AAAA85030           JUAN PEREZ GOMEZ                   000050000A2025011512345678901
```

**Error detectado**:
- Validador: NOMINA_VAL_02
- Línea: 2
- Columna: 14-31
- Valor encontrado: "AAAA85030           " (incompleto, solo 9 caracteres)
- Valor esperado: CURP válido de 18 caracteres
- Severidad: ERROR
- Mensaje: "CURP inválido. Debe tener 18 caracteres y cumplir con formato oficial RENAPO"

**Solución**: Retransmitir archivo completo con CURP corregido

---

## CÓDIGOS DE VALIDACIÓN

### NOMINA
- NOMINA_VAL_01: NSS válido (11 dígitos)
- NOMINA_VAL_02: CURP válido (18 caracteres, formato RENAPO)
- NOMINA_VAL_03: RFC patrón válido
- NOMINA_VAL_04: Fecha de pago válida
- NOMINA_VAL_05: Fecha de pago no futura
- NOMINA_VAL_06: Importe válido (numérico)
- NOMINA_VAL_07: Importe mayor a cero
- NOMINA_VAL_08: Cuenta individual válida (11 dígitos)
- NOMINA_VAL_09: Nombre trabajador obligatorio
- NOMINA_VAL_10: Tipo movimiento válido (A, B, M)
- NOMINA_VAL_11: Fecha archivo válida
- NOMINA_VAL_12: Secuencia entre 0001-9999
- NOMINA_VAL_13: WARNING - Nombre mínimo 5 caracteres
- NOMINA_VAL_14: WARNING - Nombre solo caracteres válidos

### CONTABLE
- CONTABLE_VAL_01: RFC AFORE válido
- CONTABLE_VAL_02: Fecha movimiento válida
- CONTABLE_VAL_03: Fecha no futura
- CONTABLE_VAL_04: Código cuenta numérico 4 dígitos
- CONTABLE_VAL_05: Importe cargo numérico 12 dígitos
- CONTABLE_VAL_06: Importe abono numérico 12 dígitos
- CONTABLE_VAL_07: Al menos un importe > 0 (cargo o abono)
- CONTABLE_VAL_08: Referencia obligatoria
- CONTABLE_VAL_09: Concepto obligatorio
- CONTABLE_VAL_10: Moneda válida (MXN, USD, EUR)
- CONTABLE_VAL_11: Año periodo 2000-2100
- CONTABLE_VAL_12: Mes periodo 01-12
- CONTABLE_VAL_13: Fecha archivo válida
- CONTABLE_VAL_14: WARNING - Concepto mínimo 10 caracteres
- CONTABLE_VAL_15: INFO - Cuenta 7115 requiere conversión (Circular 28-2025)

### REGULARIZACION
- REGULARIZACION_VAL_01: Cuenta individual válida (11 dígitos)
- REGULARIZACION_VAL_02: NSS válido (11 dígitos)
- REGULARIZACION_VAL_03: Fecha original válida
- REGULARIZACION_VAL_04: Fecha corrección válida
- REGULARIZACION_VAL_05: Fecha corrección >= fecha original
- REGULARIZACION_VAL_06: Fecha corrección no futura
- REGULARIZACION_VAL_07: Importe original válido
- REGULARIZACION_VAL_08: Importe corregido válido
- REGULARIZACION_VAL_09: Importe corregido ≠ importe original
- REGULARIZACION_VAL_10: Motivo obligatorio
- REGULARIZACION_VAL_11: Referencia autorización obligatoria
- REGULARIZACION_VAL_12: RFC patrón válido
- REGULARIZACION_VAL_13: Fecha archivo válida
- REGULARIZACION_VAL_14: WARNING - Motivo mínimo 10 caracteres
- REGULARIZACION_VAL_15: WARNING - Referencia solo alfanumérico y guiones

---

## NOTAS TÉCNICAS

### Codificación de Caracteres
- Codificación: UTF-8 sin BOM
- Fin de línea: CRLF (Windows) o LF (Unix)
- No incluir caracteres de control excepto saltos de línea

### Manejo de Espacios
- Campos alfabéticos: Alineación izquierda, completar con espacios a la derecha
- Campos numéricos: Alineación derecha, completar con ceros a la izquierda
- No utilizar tabuladores

### Validación de Integridad
- Checksum: No requerido
- Firma digital: No requerida para envío inicial
- Hash SHA-256: Generado automáticamente por sistema CONSAR

---

**Documento generado por**: Sistema Certus - Validador CONSAR
**Fecha de generación**: Enero 2025
**Versión**: 2.0

---

© 2025 CONSAR - Todos los derechos reservados
