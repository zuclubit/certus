# CIRCULAR CONSAR 19-8
## Reglas para el Envío de Información al Sistema de Ahorro para el Retiro

**Comisión Nacional del Sistema de Ahorro para el Retiro (CONSAR)**
**Vigencia**: 2025
**Última actualización**: Enero 2025

---

## ÍNDICE

1. [Objeto y Alcance](#objeto-y-alcance)
2. [Definiciones](#definiciones)
3. [Tipos de Archivos](#tipos-de-archivos)
4. [Nomenclatura de Archivos](#nomenclatura-de-archivos)
5. [Estructura de Registros](#estructura-de-registros)
6. [Directorios de Envío](#directorios-de-envío)
7. [Proceso de Validación](#proceso-de-validación)
8. [Proceso de Retransmisión](#proceso-de-retransmisión)
9. [Plazos y Sanciones](#plazos-y-sanciones)

---

## OBJETO Y ALCANCE

### Artículo 1.1 - Objeto
La presente circular establece las reglas, formatos y procedimientos que deberán observar las Administradoras de Fondos para el Retiro (AFORE) y demás entidades participantes en el Sistema de Ahorro para el Retiro (SAR) para el envío de información a la CONSAR.

### Artículo 1.2 - Ámbito de Aplicación
Esta circular aplica a:
- Administradoras de Fondos para el Retiro (AFORE)
- Sociedades de Inversión Especializadas de Fondos para el Retiro (SIEFORE)
- Empresas Operadoras de la Base de Datos Nacional SAR (PROCESAR)
- Patrones y entidades obligadas al entero de aportaciones

### Artículo 1.3 - Vigencia
Esta circular entra en vigor a partir de su publicación en el Diario Oficial de la Federación y deroga disposiciones anteriores que se opongan a la misma.

---

## DEFINICIONES

Para efectos de esta circular, se entenderá por:

**AFORE**: Administradora de Fondos para el Retiro
**CONSAR**: Comisión Nacional del Sistema de Ahorro para el Retiro
**CURP**: Clave Única de Registro de Población
**NSS**: Número de Seguridad Social
**RFC**: Registro Federal de Contribuyentes
**SAR**: Sistema de Ahorro para el Retiro
**SIEFORE**: Sociedad de Inversión Especializada de Fondos para el Retiro
**WORM**: Write Once, Read Many (principio de inmutabilidad)

---

## TIPOS DE ARCHIVOS

### Artículo 3.1 - Archivos Obligatorios

La CONSAR establece tres tipos de archivos de envío obligatorio:

#### 3.1.1 ARCHIVO DE NÓMINA
**Código**: NOMINA
**Propósito**: Registro de aportaciones patronales a cuentas individuales
**Periodicidad**: Bimestral
**Plazo**: 17 del segundo mes siguiente al bimestre reportado

**Contenido mínimo**:
- Datos del patrón (RFC)
- Datos del trabajador (NSS, CURP, nombre completo)
- Periodo de pago
- Importes de aportaciones por subcuenta
- Tipo de movimiento (Alta, Baja, Modificación)

#### 3.1.2 ARCHIVO CONTABLE
**Código**: CONTABLE
**Propósito**: Movimientos contables de la AFORE y SIEFORE
**Periodicidad**: Mensual
**Plazo**: Día 10 del mes siguiente

**Contenido mínimo**:
- Código de cuenta contable (SAT)
- Código de subcuenta (opcional)
- Fecha del movimiento
- Importes de cargos y abonos
- Referencia y concepto del movimiento
- Tipo de moneda

#### 3.1.3 ARCHIVO DE REGULARIZACIÓN
**Código**: REGULARIZACION
**Propósito**: Corrección de movimientos previamente enviados
**Periodicidad**: Según necesidad
**Plazo**: Ver artículo 8.2

**Contenido mínimo**:
- Cuenta individual afectada
- NSS del trabajador
- Fecha del movimiento original
- Fecha de la corrección
- Importe original e importe corregido
- Motivo de la regularización
- Referencia de autorización

---

## NOMENCLATURA DE ARCHIVOS

### Artículo 4.1 - Formato de Nombre

Todos los archivos deberán seguir estrictamente la siguiente nomenclatura:

```
[TIPO]_[RFC]_[YYYYMMDD]_[SECUENCIA].txt
```

**Donde**:
- **TIPO**: Tipo de archivo (NOMINA, CONTABLE, REGULARIZACION)
- **RFC**: RFC de la entidad emisora (12-13 caracteres)
- **YYYYMMDD**: Fecha de generación del archivo (8 dígitos)
- **SECUENCIA**: Número consecutivo del día (4 dígitos: 0001-9999)
- **Extensión**: Siempre `.txt` (formato texto plano)

**Ejemplos válidos**:
```
NOMINA_ABC010101ABC_20250115_0001.txt
CONTABLE_XYZ990101XYZ_20250115_0023.txt
REGULARIZACION_DEF850303DEF_20250115_0005.txt
```

### Artículo 4.2 - Restricciones
- Los nombres de archivo NO deberán contener espacios
- Todos los caracteres deberán ser MAYÚSCULAS
- No se permiten caracteres especiales excepto guión bajo (_) y punto (.)
- El RFC debe estar registrado ante CONSAR

---

## ESTRUCTURA DE REGISTROS

### Artículo 5.1 - Formato Posicional

Todos los archivos utilizarán **formato posicional de ancho fijo** (NO delimitado por comas o tabuladores).

### Artículo 5.2 - Tipos de Registro

Cada archivo contendrá exactamente tres tipos de registro en el siguiente orden:

1. **Tipo 01 - ENCABEZADO**: Un registro único al inicio
2. **Tipo 02 - DETALLE**: Uno o más registros con la información de movimientos
3. **Tipo 03 - SUMARIA**: Un registro único al final con totales de control

### Artículo 5.3 - Longitud de Registro

**Archivo NOMINA**:
- Encabezado (01): 77 caracteres
- Detalle (02): Variable según especificación técnica
- Sumaria (03): 77 caracteres

**Archivo CONTABLE**:
- Encabezado (01): 77 caracteres
- Detalle (02): 115 caracteres
- Sumaria (03): 77 caracteres

**Archivo REGULARIZACION**:
- Encabezado (01): 77 caracteres
- Detalle (02): 108 caracteres
- Sumaria (03): 77 caracteres

### Artículo 5.4 - Campos Obligatorios

Todos los campos marcados como obligatorios deberán estar presentes y con valores válidos. Los campos numéricos deberán estar alineados a la derecha con ceros a la izquierda. Los campos alfabéticos deberán estar alineados a la izquierda con espacios a la derecha.

### Artículo 5.5 - Formato de Fechas

Todas las fechas deberán expresarse en formato `YYYYMMDD` (8 dígitos):
- YYYY: Año (4 dígitos)
- MM: Mes (2 dígitos: 01-12)
- DD: Día (2 dígitos: 01-31)

Ejemplo: `20250115` = 15 de enero de 2025

### Artículo 5.6 - Formato de Importes

Los importes deberán expresarse como enteros en centavos, sin punto decimal:
- 7 dígitos enteros + 2 dígitos decimales implícitos
- Alineados a la derecha con ceros a la izquierda
- Sin signo (valores negativos no permitidos)

Ejemplo: `000012345` representa $123.45

---

## DIRECTORIOS DE ENVÍO

### Artículo 6.1 - Directorio RECEPCION

**Propósito**: Recepción de archivos originales (primera transmisión)

**Características**:
- Archivos nuevos sin historial previo
- Versión 1 (v1) implícita
- Marca `isOriginal = true`
- Directorio asignado: `RECEPCION`

### Artículo 6.2 - Directorio RETRANSMISION

**Propósito**: Recepción de archivos sustitutos (correcciones)

**Características**:
- Archivos que sustituyen a versiones anteriores
- Versión 2+ (v2, v3, etc.)
- Marca `isSubstitute = true`
- Directorio asignado: `RETRANSMISION`
- Requiere justificación obligatoria

### Artículo 6.3 - Segregación de Directorios

Los archivos en RECEPCION y RETRANSMISION deberán mantenerse segregados físicamente para efectos de auditoría y cumplimiento normativo. No se permite la mezcla de archivos de ambos directorios.

---

## PROCESO DE VALIDACIÓN

### Artículo 7.1 - Validaciones Automáticas

Todos los archivos recibidos serán sometidos a un proceso de validación automática que incluye:

#### 7.1.1 Validaciones de Estructura
- Longitud de registro
- Tipo de registro válido (01, 02, 03)
- Presencia de encabezado y sumaria
- Orden secuencial de registros

#### 7.1.2 Validaciones de Formato
- RFC válido (12-13 caracteres alfanuméricos)
- CURP válido (18 caracteres)
- NSS válido (11 dígitos)
- Fechas válidas (formato y rango)
- Importes numéricos válidos

#### 7.1.3 Validaciones de Catálogo
- Códigos de cuenta contable SAT
- Claves AFORE vigentes
- Códigos de moneda ISO 4217
- Tipos de movimiento permitidos

#### 7.1.4 Validaciones de Negocio
- Balanza cuadrada (partida doble)
- Suma de detalles = total en sumaria
- Fechas no futuras
- Rangos de importes razonables
- Referencias cruzadas con otros archivos

### Artículo 7.2 - Niveles de Severidad

Las validaciones generarán resultados con tres niveles de severidad:

**ERROR**: Bloquea el procesamiento del archivo. Requiere corrección obligatoria.
**WARNING**: Alerta sobre inconsistencias. No bloquea pero requiere revisión.
**INFO**: Información adicional. No requiere acción inmediata.

### Artículo 7.3 - Reporte de Validación

La CONSAR emitirá un reporte de validación detallado que incluirá:
- Identificación del archivo
- Fecha y hora de recepción
- Fecha y hora de procesamiento
- Status general (SUCCESS, ERROR, WARNING)
- Lista detallada de errores encontrados (línea, columna, código de validación)
- Número total de registros procesados
- Número de registros válidos e inválidos

### Artículo 7.4 - Plazo de Validación

La CONSAR se compromete a emitir el reporte de validación en un plazo no mayor a:
- Archivos NOMINA: 24 horas hábiles
- Archivos CONTABLE: 12 horas hábiles
- Archivos REGULARIZACION: 48 horas hábiles

---

## PROCESO DE RETRANSMISIÓN

### Artículo 8.1 - Principio de Inmutabilidad

**IMPORTANTE**: Conforme al principio WORM (Write Once, Read Many) establecido por la normativa financiera mexicana:

> **NO SE PERMITE EDITAR ARCHIVOS VALIDADOS**

Una vez que un archivo ha sido procesado y validado por la CONSAR, este se considera inmutable y no puede ser modificado. Cualquier corrección deberá realizarse mediante el proceso de retransmisión.

### Artículo 8.2 - Proceso de Retransmisión

#### 8.2.1 Definición
La retransmisión es el proceso mediante el cual una entidad envía un archivo **COMPLETO** que sustituye a un archivo previamente enviado que contenía errores o inconsistencias.

#### 8.2.2 Requisitos
Para realizar una retransmisión, la entidad deberá:

1. **Crear un archivo completamente nuevo** con todos los registros (no solo los erróneos)
2. **Incluir referencia al archivo original** que está siendo sustituido
3. **Proporcionar justificación detallada** de la corrección (mínimo 30 caracteres)
4. **Enviar al directorio RETRANSMISION**
5. **Incrementar el número de versión** (v1 → v2 → v3, etc.)

#### 8.2.3 Ventana de Corrección sin Autorización

**Artículo 8.2.3.1 - Correcciones dentro de 30 minutos**

Las correcciones realizadas dentro de los **30 minutos posteriores** a la recepción del reporte de validación NO requerirán autorización de la Dirección General de Vigilancia de la CONSAR.

**Características**:
- Plazo: Desde recepción de reporte hasta 30 minutos después
- Autorización: No requerida
- Directorio: RETRANSMISION
- Marca: `requiresAuthorization = false`
- Trámite: Automático

**Artículo 8.2.3.2 - Correcciones fuera de ventana**

Las correcciones realizadas **después de 30 minutos** requerirán autorización expresa de la Dirección General de Vigilancia.

**Características**:
- Plazo: Después de 30 minutos desde reporte
- Autorización: Requerida
- Directorio: RETRANSMISION
- Marca: `requiresAuthorization = true`
- Trámite: Solicitud formal mediante oficio
- Tiempo de respuesta: Máximo 5 días hábiles

#### 8.2.4 Contenido de la Justificación

La justificación de retransmisión deberá incluir:

1. **Descripción del error detectado**
   - Validador(es) que fallaron
   - Número de registros afectados
   - Líneas específicas con errores

2. **Causa raíz del error**
   - Error en sistema origen
   - Error humano en captura
   - Interpretación errónea de normativa
   - Cambio en catálogos

3. **Acción correctiva implementada**
   - Qué se corrigió exactamente
   - Cómo se verificó la corrección
   - Medidas para prevenir recurrencia

**Ejemplo de justificación válida**:
```
Corrección de 120 registros con CURPs inválidas detectadas por validador
NOMINA_VAL_02. Se actualizaron campos CURP en líneas 234-354 para cumplir
con formato oficial de 18 caracteres establecido por RENAPO. Error causado
por actualización pendiente en base de datos de RH. Se implementó validación
adicional en sistema origen para prevenir recurrencia.
```

### Artículo 8.3 - Cadena de Versiones

#### 8.3.1 Concepto
Cada archivo puede tener múltiples versiones conforme se realizan correcciones sucesivas. El conjunto de estas versiones se denomina "cadena de versiones".

#### 8.3.2 Estructura de la Cadena
```
Versión 1 (Original) → Versión 2 (Corrección 1) → Versión 3 (Corrección 2) → ...
```

#### 8.3.3 Metadatos de Versión
Cada versión deberá mantener los siguientes metadatos:

- `version`: Número de versión (1, 2, 3, ...)
- `isOriginal`: true solo para v1
- `isSubstitute`: true para v2+
- `replacesId`: ID del archivo que sustituye
- `replacedById`: ID del archivo que lo sustituye (si aplica)
- `substitutionReason`: Justificación de la corrección
- `supersededAt`: Fecha/hora en que fue sustituido
- `consarDirectory`: RECEPCION o RETRANSMISION

#### 8.3.4 Consulta de Historial
Las entidades podrán consultar en cualquier momento la cadena completa de versiones de un archivo para efectos de auditoría y trazabilidad.

### Artículo 8.4 - Preservación del Original

**IMPORTANTE**: El archivo original (v1) NUNCA será eliminado, incluso después de ser sustituido.

Todos los archivos (originales y sustitutos) deberán preservarse por un periodo mínimo de:
- **Archivos NOMINA**: 10 años
- **Archivos CONTABLE**: 10 años
- **Archivos REGULARIZACION**: 10 años

Este periodo se cuenta a partir de la fecha de envío del archivo original.

### Artículo 8.5 - Auditabilidad

Cada operación de retransmisión deberá generar un registro de auditoría que incluya:
- ID del archivo original
- ID del archivo sustituto
- Usuario que autorizó la retransmisión
- Fecha y hora de la retransmisión
- Justificación completa
- Status de autorización
- Oficina que autorizó (si aplica)

Estos registros deberán estar disponibles para auditorías de la CONSAR y de la Comisión Nacional Bancaria y de Valores (CNBV).

---

## PLAZOS Y SANCIONES

### Artículo 9.1 - Plazos de Envío

Las entidades deberán enviar sus archivos dentro de los siguientes plazos:

**Archivo NOMINA**:
- Periodicidad: Bimestral
- Plazo: Día 17 del segundo mes siguiente al bimestre reportado
- Ejemplo: Bimestre enero-febrero → Envío antes del 17 de abril

**Archivo CONTABLE**:
- Periodicidad: Mensual
- Plazo: Día 10 del mes siguiente
- Ejemplo: Mes de enero → Envío antes del 10 de febrero

**Archivo REGULARIZACION**:
- Periodicidad: Según necesidad
- Plazo: Ver artículo 8.2.3 (ventana de 30 minutos)

### Artículo 9.2 - Días Inhábiles

Cuando el día de vencimiento coincida con día inhábil bancario, el plazo se prorrogará hasta el siguiente día hábil.

### Artículo 9.3 - Sanciones por Incumplimiento

El incumplimiento de esta circular será sancionado conforme a lo establecido en la Ley de los Sistemas de Ahorro para el Retiro, pudiendo incluir:

**Sanciones administrativas**:
- Amonestación por escrito
- Multa de 100 a 2,000 días de salario mínimo general vigente
- Suspensión temporal de operaciones
- Revocación de autorización (casos graves)

**Agravantes**:
- Reincidencia
- Envío de información falsa o alterada
- Falta de cooperación en auditorías
- Incumplimientos sistemáticos

### Artículo 9.4 - Atenuantes

Se considerarán como atenuantes:
- Primera vez en incumplimiento
- Corrección inmediata dentro de ventana de 30 minutos
- Colaboración proactiva
- Implementación de medidas preventivas

---

## DISPOSICIONES TRANSITORIAS

### Primera
Esta circular entra en vigor el día de su publicación en el Diario Oficial de la Federación.

### Segunda
Se otorga un periodo de 90 días naturales a partir de la entrada en vigor para que las entidades realicen las adecuaciones tecnológicas necesarias.

### Tercera
Durante el periodo de transición, la CONSAR podrá autorizar dispensas temporales para casos específicos, previa solicitud justificada.

---

## REFERENCIAS NORMATIVAS

- Ley de los Sistemas de Ahorro para el Retiro
- Ley del Seguro Social
- Ley del Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado
- Código Fiscal de la Federación
- NOM-151-SCFI-2016 (Requisitos que deben observarse para la conservación de mensajes de datos)
- Circular CONSAR 28-2025 (Conversión de divisas - Cuenta 7115)
- Disposiciones de carácter general en materia financiera de la CONSAR

---

## GLOSARIO TÉCNICO

**Aportación**: Cantidad que el patrón entera a la cuenta individual del trabajador.

**Cuenta Individual**: Cuenta personal del trabajador donde se depositan sus aportaciones.

**Formato Posicional**: Formato de archivo donde cada campo ocupa posiciones específicas de caracteres.

**Partida Doble**: Principio contable donde cada cargo tiene su abono correspondiente.

**PROCESAR**: Empresa Operadora de la Base de Datos Nacional SAR.

**Sumaria**: Registro de control que contiene totales calculados de los registros de detalle.

**Versión**: Iteración de un archivo que sustituye a una versión anterior.

**WORM**: Write Once, Read Many - Principio de inmutabilidad de registros.

---

## CONTACTO

**Comisión Nacional del Sistema de Ahorro para el Retiro (CONSAR)**

Camino a Santa Teresa 1040
Colonia Jardines en la Montaña
Tlalpan, 14210
Ciudad de México

**Teléfono**: 55 3000 2000
**Correo electrónico**: atencion.consar@consar.gob.mx
**Sitio web**: www.gob.mx/consar

**Horario de atención**: Lunes a viernes de 9:00 a 15:00 horas

---

**Documento generado por**: Sistema Certus - Validador CONSAR
**Fecha de generación**: Enero 2025
**Versión del documento**: 2.0

---

© 2025 Comisión Nacional del Sistema de Ahorro para el Retiro (CONSAR)
Todos los derechos reservados.
