# GUÍA DE VERSIONAMIENTO Y RETRANSMISIÓN CONSAR

**Sistema**: Certus - Validador CONSAR
**Base normativa**: Circular CONSAR 19-8, Artículo 8
**Versión**: 2.0
**Fecha**: Enero 2025

---

## ÍNDICE

1. [Introducción](#introducción)
2. [Principio de Inmutabilidad (WORM)](#principio-de-inmutabilidad-worm)
3. [Cuándo Crear una Versión Corregida](#cuándo-crear-una-versión-corregida)
4. [Proceso Paso a Paso](#proceso-paso-a-paso)
5. [Ventana de 30 Minutos](#ventana-de-30-minutos)
6. [Cadena de Versiones](#cadena-de-versiones)
7. [Casos de Uso Prácticos](#casos-de-uso-prácticos)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## INTRODUCCIÓN

Esta guía explica el proceso completo de versionamiento y retransmisión de archivos CONSAR cuando se detectan errores o inconsistencias en archivos previamente enviados.

### ¿Por qué existe este proceso?

El Sistema de Ahorro para el Retiro (SAR) maneja información financiera crítica que afecta directamente el patrimonio de millones de trabajadores mexicanos. Por esta razón, la CONSAR establece requisitos estrictos de:

- **Trazabilidad**: Cada cambio debe ser rastreable
- **Auditabilidad**: Todo debe quedar registrado permanentemente
- **Inmutabilidad**: Los registros históricos no pueden modificarse
- **Responsabilidad**: Cada acción debe estar justificada y autorizada

---

## PRINCIPIO DE INMUTABILIDAD (WORM)

### Write Once, Read Many

**REGLA FUNDAMENTAL**:
> **NUNCA SE PUEDE EDITAR UN ARCHIVO QUE YA FUE VALIDADO POR LA CONSAR**

Este principio, conocido como WORM (Write Once, Read Many), es obligatorio según:
- Circular CONSAR 19-8, Artículo 8.1
- NOM-151-SCFI-2016 (Conservación de documentos electrónicos)
- Ley de los Sistemas de Ahorro para el Retiro

### ¿Qué significa en la práctica?

❌ **PROHIBIDO**:
- Abrir el archivo original y modificarlo
- Eliminar el archivo con errores
- Sobrescribir el archivo
- Editar registros individuales

✅ **PERMITIDO**:
- Crear un archivo completamente nuevo que sustituya al original
- Preservar el archivo original para auditoría
- Marcar el archivo original como "superseded" (sustituido)
- Mantener un historial completo de versiones

---

## CUÁNDO CREAR UNA VERSIÓN CORREGIDA

### Escenarios que Requieren Retransmisión

Deberás crear una versión corregida cuando:

#### 1. Errores de Validación (STATUS: ERROR)
El archivo fue rechazado por uno o más validadores con severidad ERROR.

**Ejemplos comunes**:
- CURPs inválidos (NOMINA_VAL_02)
- NSS duplicados o inexistentes
- Fechas futuras o fuera de rango
- Importes con formato incorrecto
- Balanza descuadrada en archivos contables
- Códigos de cuenta contable no vigentes

**Acción**: OBLIGATORIO crear versión corregida

#### 2. Advertencias Críticas (STATUS: WARNING)
El archivo fue procesado pero contiene advertencias que requieren atención.

**Ejemplos comunes**:
- Nombres de trabajadores muy cortos (NOMINA_VAL_13)
- Conceptos contables poco descriptivos (CONTABLE_VAL_14)
- Motivos de regularización insuficientes

**Acción**: RECOMENDADO crear versión corregida

#### 3. Errores Detectados Posteriormente
Descubriste un error después de que el archivo fue procesado exitosamente.

**Ejemplos comunes**:
- Error en importes detectado por auditoría interna
- Trabajador reporta que sus aportaciones no coinciden
- Conciliación bancaria revela discrepancias
- Cambio retroactivo en nómina

**Acción**: OBLIGATORIO crear versión corregida + Archivo de REGULARIZACION

---

## PROCESO PASO A PASO

### Paso 1: Identificar el Archivo con Errores

En el sistema Certus, los archivos con errores se identifican con:
- 🔴 **Badge rojo** con texto "Con Errores"
- 🟡 **Badge amarillo** con texto "Con Advertencias"
- Contador de errores visible
- Listado detallado de validaciones fallidas

**Ubicación**:
- Página principal → Lista de validaciones
- Filtro de estado → Seleccionar "Error" o "Warning"

### Paso 2: Revisar el Reporte de Validación

Haz clic en el archivo problemático para ver el detalle completo:

**Tab "Errores"**:
- Lista de todos los errores encontrados
- Código del validador (ej: NOMINA_VAL_02)
- Línea y columna del error
- Valor encontrado vs valor esperado
- Descripción detallada del problema

**Tab "Advertencias"**:
- Warnings que no bloquearon el procesamiento
- Recomendaciones de mejora

**Tab "Resumen"**:
- Estadísticas generales
- Total de errores por categoría
- Validadores ejecutados

### Paso 3: Analizar la Causa Raíz

Antes de crear la versión corregida, identifica:

1. **¿Qué causó el error?**
   - Error en sistema origen (ERP, nómina, contabilidad)
   - Error humano en captura
   - Malinterpretación de normativa
   - Cambio en catálogos CONSAR
   - Problema en migración de datos

2. **¿Cuántos registros están afectados?**
   - Error aislado (1-5 registros)
   - Error sistemático (100+ registros)
   - Error en fórmula o cálculo (todos los registros)

3. **¿Qué archivos están relacionados?**
   - ¿El error afecta solo este archivo?
   - ¿Hay archivos de meses anteriores con el mismo error?
   - ¿Se requiere regularización de periodos pasados?

### Paso 4: Corregir el Archivo Origen

**IMPORTANTE**: La corrección debe hacerse en el **sistema origen**, NO en el archivo TXT directamente.

**Proceso recomendado**:

1. **Actualiza tus datos en el sistema origen**:
   - ERP (SAP, Oracle, etc.)
   - Sistema de nómina (Aspel, CONTPAQi, etc.)
   - Base de datos de RH
   - Sistema contable

2. **Verifica las correcciones**:
   - Ejecuta reportes de validación internos
   - Compara contra reglas CONSAR
   - Solicita revisión de supervisor

3. **Regenera el archivo COMPLETO**:
   - NO copies y pegues líneas del archivo original
   - Genera un archivo nuevo desde cero
   - Incluye TODOS los registros (no solo los corregidos)

### Paso 5: Crear Versión Corregida en Certus

En la página de detalle del archivo con errores:

1. **Verifica el requisito**:
   - Solo archivos con status "Error" o "Warning" tienen el botón
   - Archivos "Sustituidos" NO pueden crear nuevas versiones
   - Archivos "Success" NO tienen botón (no requieren corrección)

2. **Haz clic en "Crear Versión Corregida"**:
   - Botón azul ubicado junto a "Re-validar"
   - Ícono de documento con lápiz

3. **Se abre el modal de creación**:
   - Muestra información del archivo original
   - Indica versión actual y nueva versión
   - Muestra flujo visual: v1 → v2

4. **Completa la justificación** (OBLIGATORIO):

   **Requisitos**:
   - Mínimo 30 caracteres
   - Descripción detallada del error
   - Acción correctiva implementada
   - Referencia a validadores que fallaron

   **Ejemplo correcto**:
   ```
   Corrección de 120 registros con CURPs inválidas detectadas por validador
   NOMINA_VAL_02. Se actualizaron campos CURP en líneas 234-354 para cumplir
   con formato oficial de 18 caracteres establecido por RENAPO. Error causado
   por actualización pendiente en base de datos de RH. Se implementó validación
   adicional en sistema origen para prevenir recurrencia.
   ```

   **Ejemplo incorrecto** (muy genérico):
   ```
   Se corrigieron errores
   ```

5. **Confirma la creación**:
   - El sistema crea un nuevo registro (v2)
   - El archivo original (v1) se marca como "Sustituido"
   - Eres redirigido automáticamente a la nueva versión (v2)

### Paso 6: Subir el Archivo Corregido

**IMPORTANTE**: Hasta este punto solo creaste el REGISTRO de la versión v2. Ahora debes subir el archivo corregido.

1. **En la nueva versión (v2)**:
   - Status inicial: "Pendiente"
   - Sin archivo adjunto todavía

2. **Sube el archivo**:
   - Click en "Cargar Archivo"
   - Selecciona el archivo TXT corregido
   - Verifica que el nombre siga la nomenclatura CONSAR

3. **El sistema iniciará la validación automática**:
   - Status cambia a "Procesando"
   - Barra de progreso visible
   - Actualización en tiempo real

### Paso 7: Verificar la Nueva Validación

Una vez completado el procesamiento:

**Si Status = SUCCESS** ✅:
- ¡Felicidades! La corrección fue exitosa
- Archivo listo para envío a CONSAR
- Versión anterior queda como referencia histórica

**Si Status = WARNING** ⚠️:
- Archivo procesado pero con advertencias
- Revisa si las advertencias son aceptables
- Considera crear v3 si es crítico

**Si Status = ERROR** ❌:
- La corrección no fue suficiente
- Revisa los nuevos errores
- Repite el proceso para crear v3

### Paso 8: Navegar en el Historial de Versiones

En la página de detalle de cualquier versión:

**Tab "Versiones"** (solo visible si hay 2+ versiones):
- Timeline visual de todas las versiones
- v1 (Original) → v2 (Corrección 1) → v3 (Corrección 2)
- Status de cada versión
- Razón de cada corrección
- Directorio CONSAR (RECEPCION/RETRANSMISION)
- Badges: "Original", "Sustituido", "Actual"

**Click en cualquier versión**:
- Ver detalles completos
- Descargar archivo TXT
- Ver reporte de validación
- Comparar con otras versiones

---

## VENTANA DE 30 MINUTOS

### Artículo 8.2.3 - Circular CONSAR 19-8

La CONSAR establece un periodo de **30 minutos** desde la recepción del reporte de validación durante el cual las correcciones pueden realizarse sin autorización adicional.

### ¿Cómo Funciona?

#### Dentro de 30 Minutos ✅

**Características**:
- NO requiere autorización de Dirección General de Vigilancia
- Proceso automático
- Marca: `requiresAuthorization = false`
- Directorio: RETRANSMISION
- Trámite inmediato

**Ejemplo**:
```
Reporte recibido: 10:00 AM
Ventana de corrección: 10:00 AM - 10:30 AM
Archivo v2 enviado: 10:15 AM → ✅ Autorización automática
```

#### Después de 30 Minutos ⏰

**Características**:
- REQUIERE autorización expresa de CONSAR
- Marca: `requiresAuthorization = true`
- Directorio: RETRANSMISION
- Trámite formal mediante oficio
- Tiempo de respuesta: Máximo 5 días hábiles

**Ejemplo**:
```
Reporte recibido: 10:00 AM
Ventana de corrección: 10:00 AM - 10:30 AM
Archivo v2 enviado: 14:00 PM → ❌ Requiere autorización CONSAR
```

**Proceso de autorización**:
1. Solicitar autorización mediante oficio formal
2. Incluir justificación detallada
3. Esperar respuesta de CONSAR (máx. 5 días hábiles)
4. Una vez autorizado, subir archivo v2
5. Sistema marca como `authorizationStatus = 'approved'`

### Recomendaciones

🚀 **Actúa rápido**: Si detectas un error, corrige dentro de los 30 minutos para evitar trámites

⏱️ **Monitorea el tiempo**: El sistema Certus muestra un contador regresivo

📋 **Prepara documentación**: Incluso dentro de ventana, justifica bien la corrección

---

## CADENA DE VERSIONES

### Concepto

Una "cadena de versiones" es la secuencia completa de iteraciones de un mismo archivo conforme se van realizando correcciones.

```
v1 (Original) → v2 (1ra Corrección) → v3 (2da Corrección) → v4 (3ra Corrección)
```

### Estructura de Metadatos

Cada versión mantiene:

```typescript
{
  version: 2,                    // Número secuencial
  isOriginal: false,             // true solo para v1
  isSubstitute: true,            // true para v2+
  replacesId: "abc123",          // ID de v1 que sustituye
  replacedById: "def456",        // ID de v3 que la sustituye (si existe)
  substitutionReason: "...",     // Justificación obligatoria
  supersededAt: "2025-01-15",    // Cuándo fue sustituida
  consarDirectory: "RETRANSMISION"
}
```

### Visualización en Certus

El componente `<VersionChain>` muestra:

**Timeline vertical**:
```
┌─────────────────────────────────────┐
│ v3 - Versión Corregida       [ACTUAL]│
│ ✅ Success • 0 errores               │
│ Hace 1 día                           │
│ "Corrección final de advertencias..." │
│ Directorio: RETRANSMISION            │
└─────────────────────────────────────┘
          ↑
┌─────────────────────────────────────┐
│ v2 - Versión Corregida   [SUSTITUIDO]│
│ ⚠️ Warning • 35 advertencias         │
│ Hace 3 días                          │
│ "Corrección de CURPs inválidas..."   │
│ Directorio: RETRANSMISION            │
└─────────────────────────────────────┘
          ↑
┌─────────────────────────────────────┐
│ v1 - Archivo Original    [SUSTITUIDO]│
│ ❌ Error • 120 errores               │
│ Hace 5 días                          │
│ Directorio: RECEPCION                │
└─────────────────────────────────────┘
```

### Límite de Versiones

**Recomendación CONSAR**: Máximo 5 versiones por archivo

Si llegas a v5 y aún hay errores, considera:
- Revisar proceso de generación de archivos
- Capacitar al personal
- Actualizar sistemas origen
- Solicitar asesoría técnica a CONSAR

---

## CASOS DE USO PRÁCTICOS

### Caso 1: CURPs Inválidos en Nómina

**Situación**:
Enviaste archivo de nómina bimestral con 5,000 trabajadores. El reporte de validación indica 120 errores por CURPs que no cumplen el formato de 18 caracteres.

**Causa**:
Base de datos de RH no actualizó CURPs de trabajadores que cambiaron de estado civil.

**Solución**:

1. **Revisa errores** (Tab "Errores"):
   ```
   Línea 234: CURP "AAAA85030" inválido - NOMINA_VAL_02
   Línea 235: CURP "BBBB90050" inválido - NOMINA_VAL_02
   ...
   (120 errores similares)
   ```

2. **Corrige en sistema RH**:
   - Actualiza los 120 CURPs con formato completo
   - Valida contra base RENAPO

3. **Regenera archivo**:
   - Exporta nómina completa (5,000 registros)
   - Verifica que los 120 CURPs ahora sean válidos

4. **Crea v2 en Certus**:
   - Click "Crear Versión Corregida"
   - Justificación: "Corrección de 120 registros con CURPs inválidas detectadas por validador NOMINA_VAL_02. Se actualizaron campos CURP en líneas 234-354 para cumplir con formato oficial de 18 caracteres establecido por RENAPO. Error causado por actualización pendiente en base de datos de RH."
   - Sube archivo corregido

5. **Resultado**:
   - v2 procesada con SUCCESS ✅
   - 0 errores, 0 advertencias
   - Lista para envío a CONSAR

**Timeline**:
- 09:00 - Envío v1
- 10:30 - Recepción reporte con errores
- 11:00 - Corrección en RH
- 11:15 - Envío v2 (fuera de ventana de 30 min)
- 11:20 - Requiere autorización CONSAR
- 16/01 - Autorización recibida
- 16/01 - v2 aceptada

### Caso 2: Balanza Descuadrada en Contable

**Situación**:
Archivo contable mensual rechazado. La suma de cargos ($12,500,000.00) no coincide con la suma de abonos ($12,450,000.00). Diferencia de $50,000.00.

**Causa**:
Error en exportación de sistema contable. Un asiento de $50,000 fue registrado solo como cargo sin su abono correspondiente.

**Solución**:

1. **Identifica discrepancia**:
   ```
   Error: Balanza no cuadrada
   Total cargos: $12,500,000.00
   Total abonos: $12,450,000.00
   Diferencia: $50,000.00
   ```

2. **Encuentra asiento faltante**:
   - Revisa movimientos en sistema contable
   - Identifica asiento #REF-ENE-245 con abono faltante
   - Fecha: 25 de enero de 2025
   - Concepto: "Traspaso entre SIEFORES"

3. **Corrige en sistema contable**:
   - Completa el asiento con su abono correspondiente
   - Verifica que ahora cuadre: Cargos = Abonos

4. **Regenera archivo**:
   - Exporta contabilidad completa del mes
   - Verifica sumaria:
     ```
     Total cargos: $12,500,000.00
     Total abonos: $12,500,000.00 ✓
     ```

5. **Crea v2 en Certus**:
   - Dentro de ventana de 30 minutos (09:45 - 10:15)
   - Justificación: "Corrección de balanza descuadrada. Se completó asiento REF-ENE-245 con abono faltante de $50,000.00 correspondiente a traspaso entre SIEFORES. Error causado por interrupción en proceso de exportación de sistema SAP."
   - Sube archivo corregido

6. **Resultado**:
   - v2 procesada AUTOMÁTICAMENTE (dentro de ventana) ✅
   - Balanza cuadrada
   - 0 errores

### Caso 3: Error Detectado Después de Envío Exitoso

**Situación**:
Archivo de nómina fue procesado con SUCCESS. Dos semanas después, un trabajador reporta que sus aportaciones están incorrectas. Al revisar, descubres que 15 trabajadores tienen importes erróneos.

**Causa**:
Error en fórmula de cálculo de aportaciones voluntarias. El sistema calculó 6% en lugar de 8%.

**Solución**:

1. **Documenta el error**:
   - 15 trabajadores afectados
   - Importe incorrecto: 6% en lugar de 8%
   - Diferencia total: $12,500.00

2. **Crea archivo de REGULARIZACION**:
   - Tipo: REGULARIZACION
   - 15 registros (uno por trabajador)
   - Cada registro indica:
     - Importe original (6%)
     - Importe corregido (8%)
     - Motivo detallado
     - Referencia de autorización interna

3. **Crea v2 del archivo NOMINA original** (opcional):
   - Para tener historial completo
   - Justificación: "Corrección de importes de aportaciones voluntarias. 15 trabajadores tenían cálculo erróneo del 6% en lugar del 8% pactado. Error detectado en auditoría posterior. Se envía archivo de REGULARIZACION complementario."

4. **Envía ambos archivos**:
   - REGULARIZACION: Corrige los importes
   - NOMINA v2: Actualiza historial (opcional)

---

## PREGUNTAS FRECUENTES

### ¿Puedo editar el archivo TXT original con un editor de texto?

**NO**. Aunque técnicamente es posible abrir un archivo TXT con Notepad o similar, está PROHIBIDO por normativa CONSAR. Debes:
1. Corregir en sistema origen (ERP, nómina, etc.)
2. Regenerar el archivo completo
3. Enviar como nueva versión

### ¿Qué pasa si subo un archivo v2 idéntico al v1?

El sistema lo detectará y mostrará una advertencia. La versión v2 debe tener al menos una corrección visible. Si el validador falla, el archivo será rechazado.

### ¿Puedo eliminar la versión v1 después de crear v2?

**NO**. Todas las versiones deben preservarse por 10 años. El sistema Certus marca v1 como "Sustituido" pero NUNCA lo elimina.

### ¿Cuántas versiones puedo crear?

Técnicamente no hay límite, pero la CONSAR recomienda máximo 5 versiones. Si necesitas más, considera revisar tu proceso de generación de archivos.

### ¿Qué pasa si mi v2 también tiene errores?

Deberás crear v3 repitiendo el mismo proceso. Es común requerir 2-3 iteraciones en archivos muy complejos.

### ¿La ventana de 30 minutos aplica a todas horas del día?

Sí, incluyendo fines de semana y días festivos. Sin embargo, la autorización fuera de ventana solo se procesa en días hábiles.

### ¿Puedo crear v3 si v2 aún está en procesamiento?

**NO**. Debes esperar a que v2 complete su validación antes de decidir si necesitas v3.

### ¿El directorio RETRANSMISION es diferente físicamente?

Sí. Son directorios separados en el sistema CONSAR para facilitar auditorías y cumplimiento normativo.

### ¿Qué sucede con las aportaciones que ya se aplicaron antes de la corrección?

Las aportaciones aplicadas con datos erróneos deben regularizarse mediante archivo tipo REGULARIZACION. La versión corregida del archivo NOMINA no ajusta retroactivamente las cuentas individuales.

### ¿Puedo ver el historial de versiones de archivos de otros usuarios?

Depende de tus permisos. Los administradores pueden ver todas las versiones. Los usuarios regulares solo ven las versiones de archivos que ellos subieron.

---

## DIAGRAMA DE FLUJO

```
┌─────────────────────────┐
│ Archivo Enviado (v1)    │
│ Directorio: RECEPCION   │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│ Validación Automática   │
│ 37 validadores          │
└────────────┬────────────┘
             │
        ┌────┴────┐
        │         │
    ❌ ERROR   ✅ SUCCESS
        │         │
        │         └──→ Archivo aceptado
        │              No requiere corrección
        ↓
┌─────────────────────────┐
│ Reporte de Errores      │
│ Enviado a usuario       │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────┐
│ ¿Dentro de 30 min?      │
└────────────┬────────────┘
        ┌────┴────┐
        │         │
      SÍ ✅     NO ❌
        │         │
        │         ↓
        │  ┌─────────────────────┐
        │  │ Solicitar           │
        │  │ Autorización CONSAR │
        │  └──────────┬──────────┘
        │             │
        │             ↓
        │  ┌─────────────────────┐
        │  │ Esperar aprobación  │
        │  │ (máx. 5 días)       │
        │  └──────────┬──────────┘
        │             │
        └─────────────┤
                      ↓
        ┌─────────────────────────┐
        │ Crear Versión v2        │
        │ En Certus               │
        └────────────┬────────────┘
                     │
                     ↓
        ┌─────────────────────────┐
        │ Corregir en Sistema     │
        │ Origen (ERP/Nómina)     │
        └────────────┬────────────┘
                     │
                     ↓
        ┌─────────────────────────┐
        │ Regenerar Archivo TXT   │
        │ Completo                │
        └────────────┬────────────┘
                     │
                     ↓
        ┌─────────────────────────┐
        │ Subir a Certus          │
        │ Versión v2              │
        └────────────┬────────────┘
                     │
                     ↓
        ┌─────────────────────────┐
        │ Nueva Validación        │
        │ Automática              │
        └────────────┬────────────┘
                     │
             ┌───────┴───────┐
             │               │
          ❌ ERROR       ✅ SUCCESS
             │               │
             │               └──→ ¡Corrección exitosa!
             │                   v1 = Sustituido
             │                   v2 = Actual
             ↓
    ¿Crear v3?
        Repetir proceso
```

---

## CONTACTO Y SOPORTE

### Soporte Técnico Certus
- **Email**: soporte@certus.com.mx
- **Teléfono**: 55 1234 5678
- **Horario**: Lunes a viernes, 9:00 - 18:00

### CONSAR
- **Teléfono**: 55 3000 2000
- **Email**: atencion.consar@consar.gob.mx
- **Portal**: www.gob.mx/consar

---

**Documento generado por**: Sistema Certus
**Última actualización**: Enero 2025
**Versión**: 2.0

© 2025 Certus - Sistema de Validación CONSAR
Todos los derechos reservados
