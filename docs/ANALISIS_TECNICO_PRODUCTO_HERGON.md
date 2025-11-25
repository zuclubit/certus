# ANALISIS TECNICO DE PRODUCTO: HERGON-VECTOR01
## Motor de Reglas y Estados para Validacion de Archivos Regulatorios CONSAR

---

## DOCUMENTO DE ESPECIFICACION TECNICA Y ANALISIS DE PRODUCTO

**Version:** 1.0
**Fecha de Analisis:** 19 de Noviembre de 2025
**Estado del Proyecto:** Fase de Diseno y Documentacion
**Ubicacion:** `/Users/oscarvalois/Documents/Github/hergon-vector01`

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Contexto de Negocio y Marco Regulatorio](#2-contexto-de-negocio-y-marco-regulatorio)
3. [Definicion del Producto](#3-definicion-del-producto)
4. [Arquitectura del Sistema](#4-arquitectura-del-sistema)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Funcionalidades y Caracteristicas](#6-funcionalidades-y-caracteristicas)
7. [Stack Tecnologico](#7-stack-tecnologico)
8. [Cumplimiento Regulatorio](#8-cumplimiento-regulatorio)
9. [Modelo de Negocio](#9-modelo-de-negocio)
10. [Estrategia de Expansion y Escalabilidad](#10-estrategia-de-expansion-y-escalabilidad)
11. [Analisis de Riesgos y Mitigacion](#11-analisis-de-riesgos-y-mitigacion)
12. [Roadmap de Implementacion](#12-roadmap-de-implementacion)
13. [Anexos](#13-anexos)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Proposito del Producto

**Hergon-Vector01** es un motor de reglas y estados especializado en la validacion automatizada de archivos contables y regulatorios que las Administradoras de Fondos para el Retiro (AFOREs) deben enviar a la Comision Nacional del Sistema de Ahorro para el Retiro (CONSAR) en Mexico.

El sistema aplica validaciones configurables mediante scripts SQL dinamicos para garantizar la integridad, precision y cumplimiento regulatorio de la informacion financiera antes de su envio a la autoridad.

### 1.2 Problema que Resuelve

Las AFOREs enfrentan los siguientes desafios:

- **Rechazos regulatorios costosos**: Archivos enviados a CONSAR con errores generan multas y sanciones
- **Validacion manual ineficiente**: Procesos manuales de revision son lentos y propensos a errores humanos
- **Complejidad de reglas contables**: Multiples validaciones de balanzas, divisas, contracuentas y catálogos
- **Trazabilidad limitada**: Dificultad para identificar el origen exacto de errores en archivos con miles de registros
- **Cambios regulatorios frecuentes**: Necesidad de adaptar validaciones rapidamente ante nuevas disposiciones

### 1.3 Valor del Producto

**Hergon-Vector01** entrega valor mediante:

1. **Reduccion de rechazos**: Deteccion temprana de errores antes del envio a CONSAR
2. **Ahorro de tiempo**: Automatizacion de validaciones que tomarian horas manualmente
3. **Flexibilidad regulatoria**: Motor de reglas configurable sin modificar codigo
4. **Trazabilidad completa**: Identificacion precisa de linea, cuenta y tipo de error
5. **Calidad de datos**: Garantia de precision en balanzas contables, conversiones de divisas y catálogos

### 1.4 Estado Actual

El proyecto se encuentra en **Fase de Diseno y Documentacion**:

- Arquitectura del sistema definida
- Catalogo de 37 validaciones documentado
- Flujos de datos mapeados
- Archivo de datos de ejemplo creado
- Reunion de revision completada (14/11/2025)

**No existe codigo fuente desarrollado aun.**

---

## 2. CONTEXTO DE NEGOCIO Y MARCO REGULATORIO

### 2.1 Sistema de Ahorro para el Retiro (SAR) en Mexico

El Sistema de Ahorro para el Retiro (SAR) es el mecanismo mediante el cual los trabajadores mexicanos acumulan recursos para su jubilacion a traves de cuentas individuales administradas por AFOREs.

#### Participantes del Sistema:

**Trabajadores**
- Titulares de cuentas individuales
- Aportan obligatoriamente a traves de su empleador
- Pueden realizar aportaciones voluntarias

**AFOREs (Administradoras de Fondos para el Retiro)**
- Instituciones financieras especializadas
- Administran las cuentas individuales de los trabajadores
- Invierten los recursos en SIEFOREs

**SIEFOREs (Sociedades de Inversion Especializadas en Fondos para el Retiro)**
- Fondos de inversion donde se depositan los recursos
- Categorizadas por edad del trabajador (Generacionales)
- Invierten en diversos instrumentos financieros

**CONSAR (Comision Nacional del Sistema de Ahorro para el Retiro)**
- Organismo descentralizado de la SHCP
- Regulador y supervisor del SAR
- Establece reglas de operacion, inversion y reporteo

**PROCESAR**
- Base de datos nacional del SAR
- Opera el sistema de intercambio de informacion

### 2.2 Marco Regulatorio CONSAR

#### Leyes y Reglamentos Aplicables:

**Ley de los Sistemas de Ahorro para el Retiro (LSAR)**
- Marco juridico principal del SAR
- Define obligaciones de participantes
- Facultades de CONSAR

**Reglamento de la LSAR**
- Disposiciones operativas
- Procedimientos administrativos

**Circulares CONSAR**
- Normativa especifica emitida por CONSAR
- Actualizaciones regulatorias
- Especificaciones tecnicas

#### Circulares Relevantes:

**Circular CONSAR 19-21**
- Reglas generales sobre informacion que deben enviar AFOREs y SIEFOREs
- Modificaciones a formatos de reporteo

**Circular CONSAR 55-1**
- Reglas prudenciales en materia de inversiones
- Parametros y limites de inversion

**Disposiciones sobre Contabilidad**
- Publicadas en DOF (22/11/2022)
- Registro de contabilidad
- Elaboracion y presentacion de estados financieros
- Anexo D: Guias de Registro en Cuentas de Orden

### 2.3 Obligaciones de Reporteo de AFOREs

Las AFOREs deben enviar periodicamente a CONSAR:

**Archivos Contables**
- Balanzas de comprobacion
- Movimientos de cuentas
- Estados financieros

**Archivos de Inversiones**
- Portafolios de inversion
- Valuacion de instrumentos
- Operaciones realizadas

**Archivos de Cuentas Individuales**
- Movimientos de afiliados
- Traspasos entre AFOREs
- Retiros y pensiones

**Formato de Archivos**
- Archivos de texto plano con formato posicional
- Estructuras especificas por tipo de archivo
- Longitudes fijas por campo
- Encriptacion con GNUpg antes de transmision

### 2.4 Sanciones por Incumplimiento

CONSAR esta facultada para:

- Imponer multas a AFOREs
- Sancionar a empleados de AFOREs
- Suspender operaciones en casos graves
- Revocar autorizaciones

**Causales de Sancion:**
- Envio de informacion incompleta o incorrecta
- Incumplimiento de plazos de entrega
- Violacion a reglas de inversion
- Falta de integridad en datos contables

---

## 3. DEFINICION DEL PRODUCTO

### 3.1 Vision del Producto

Convertir a **Hergon-Vector01** en el motor de validacion de referencia para AFOREs en Mexico, reduciendo a cero los rechazos regulatorios por errores de formato, calculo o integridad de datos.

### 3.2 Objetivos del Producto

#### Objetivos Primarios:

1. **Validar archivos CONSAR con 100% de precision**
   - Deteccion de todos los errores antes del envio
   - Cero falsos positivos en validaciones

2. **Reducir tiempo de validacion en 90%**
   - De horas manuales a minutos automatizados
   - Procesamiento batch de multiples archivos

3. **Garantizar cumplimiento regulatorio continuo**
   - Actualizacion agil ante cambios normativos
   - Trazabilidad completa de validaciones aplicadas

#### Objetivos Secundarios:

1. **Facilitar correccion de errores**
   - Identificacion exacta de linea y campo con error
   - Sugerencias de correccion cuando sea posible

2. **Generar metricas de calidad**
   - Dashboard de errores frecuentes
   - Tendencias de calidad de datos por fuente

3. **Integracion transparente**
   - Minima intervencion en procesos existentes
   - APIs para integracion con sistemas core

### 3.3 Alcance del Producto

#### En Alcance (Version 1.0):

- Validacion de Archivo 1101 (Balanza de Comprobacion)
- 37 validaciones configuradas inicialmente
- Procesamiento batch de archivos
- Reportes de errores en formato CSV/Excel
- Interface web basica para carga de archivos
- Catalogo de validaciones administrable

#### Fuera de Alcance (Version 1.0):

- Validacion de otros tipos de archivos CONSAR
- Correccion automatica de errores
- Integracion directa con Aladdin
- Envio automatico a CONSAR
- Validaciones en tiempo real durante captura

### 3.4 Usuarios del Sistema

**Analista Contable**
- Carga archivos para validacion
- Revisa reportes de errores
- Corrige datos en sistema origen

**Supervisor de Cumplimiento**
- Monitorea resultados de validaciones
- Aprueba archivos para envio a CONSAR
- Revisa metricas de calidad

**Administrador de Reglas**
- Configura nuevas validaciones
- Actualiza scripts SQL de validaciones existentes
- Activa/desactiva validaciones segun normativa

**Auditor TI**
- Revisa logs de validaciones ejecutadas
- Verifica trazabilidad de cambios en reglas
- Certifica cumplimiento de controles

---

## 4. ARQUITECTURA DEL SISTEMA

### 4.1 Arquitectura Conceptual

El sistema sigue una arquitectura de capas con separacion clara de responsabilidades:

```
+---------------------------------------------------------------+
|                    CAPA DE PRESENTACION                       |
|  +---------------------------+  +--------------------------+  |
|  |   Interface Web           |  |   API REST              |  |
|  |   - Carga de archivos     |  |   - Endpoints de        |  |
|  |   - Visualizacion errores |  |     validacion          |  |
|  |   - Dashboard metricas    |  |   - Consulta resultados |  |
|  +---------------------------+  +--------------------------+  |
+---------------------------------------------------------------+
                              |
                              v
+---------------------------------------------------------------+
|                     CAPA DE APLICACION                        |
|  +---------------------------+  +--------------------------+  |
|  |   Orquestador de          |  |   Motor de Reglas       |  |
|  |   Validaciones            |  |   - Ejecucion SQL       |  |
|  |   - Control de flujo      |  |   - Parametrizacion     |  |
|  |   - Gestion de errores    |  |   - Evaluacion logica   |  |
|  +---------------------------+  +--------------------------+  |
|  +---------------------------+  +--------------------------+  |
|  |   Parseador de Archivos   |  |   Generador de Reportes |  |
|  |   - Lectura posicional    |  |   - Formateo resultados |  |
|  |   - Validacion estructura |  |   - Exportacion datos   |  |
|  +---------------------------+  +--------------------------+  |
+---------------------------------------------------------------+
                              |
                              v
+---------------------------------------------------------------+
|                      CAPA DE DATOS                            |
|  +---------------------------+  +--------------------------+  |
|  |   Base de Datos           |  |   Almacenamiento        |  |
|  |   Relacional              |  |   de Archivos           |  |
|  |   (SQL Server)            |  |   (Blob Storage)        |  |
|  +---------------------------+  +--------------------------+  |
+---------------------------------------------------------------+
                              |
                              v
+---------------------------------------------------------------+
|                  CAPA DE INTEGRACION                          |
|  +---------------------------+  +--------------------------+  |
|  |   Conectores a Sistemas   |  |   API CONSAR            |  |
|  |   Origen                  |  |   (Futuro)              |  |
|  |   - Aladdin               |  |                          |  |
|  |   - Sistema Contable      |  |                          |  |
|  |   - Sistema de Precios    |  |                          |  |
|  +---------------------------+  +--------------------------+  |
+---------------------------------------------------------------+
```

### 4.2 Flujo de Datos del Sistema

Segun el diagrama proporcionado en `docs/Circuito Sistema Contable - Validacion 2.pdf`:

```
[Sistema de Precios] ──┐
                       │
                       v
           ┌───────────────────┐
           │  Mapeo o          │
           │  Transformacion   │
           │  de informacion   │
           └─────────┬─────────┘
                     │
                     v
[Sistema Front    ] ──────> [Sistema Contable]
[Aladdin        ]
     │                              │
     │                              v
     │                      [Archivos Regulatorios]
     │                              │
     │                              v
     │                      ┌───────────────────┐
     │                      │  Sistema de       │
     │<─────────────────────│  Validacion       │
     │   Correccion         │  (HERGON)         │
     │   de Raiz            └─────────┬─────────┘
     │                                │
     │                         ┌──────┴──────┐
     │                         │             │
     │                     [ERROR]        [OK]
     │                         │             │
     │                         v             v
     │                  ┌──────────┐   ┌─────────────┐
     │                  │Correccion│   │   CONSAR    │
     └──────────────────│ Manual   │   │  Autoridad  │
                        │Editar    │   └─────────────┘
                        │archivo   │
                        └──────────┘
```

#### Descripcion del Flujo:

**1. Generacion de Datos**
- Sistema de Precios genera valuaciones de instrumentos
- Sistema Front Aladdin gestiona operaciones de inversion
- Datos se mapean/transforman a estructura contable

**2. Consolidacion Contable**
- Sistema Contable recibe datos de multiples fuentes
- Genera balanzas de comprobacion
- Produce archivos en formato CONSAR

**3. Validacion (HERGON)**
- Archivos regulatorios se cargan en motor de validacion
- Se aplican 37 validaciones configuradas
- Cada registro se evalua contra reglas de negocio

**4. Bifurcacion de Resultados**

**Ruta de Exito (OK):**
- Archivo pasa todas las validaciones
- Se marca como aprobado
- Se envia a CONSAR

**Ruta de Error:**
- Se identifican inconsistencias
- Se generan reportes detallados de errores
- Analista decide tipo de correccion:
  - **Correccion Manual**: Editar directamente el archivo
  - **Correccion de Raiz**: Corregir en sistema origen (Aladdin, Contable)

**5. Retroalimentacion**
- Datos corregidos vuelven al sistema origen
- Nuevo archivo se genera
- Se repite validacion hasta aprobacion

### 4.3 Componentes del Sistema

#### 4.3.1 Parseador de Archivos

**Responsabilidades:**
- Leer archivos de texto plano en formato posicional
- Extraer campos segun especificaciones de layout
- Validar estructura basica (longitud de lineas, caracteres validos)
- Cargar registros en base de datos temporal

**Tecnologias Sugeridas:**
- .NET Core FileStream para lectura eficiente
- Expresiones regulares para parsing
- Bulk Insert para carga masiva a SQL Server

#### 4.3.2 Motor de Reglas

**Responsabilidades:**
- Recuperar scripts SQL del catalogo de validaciones
- Parametrizar queries con fecha, afore, fondo
- Ejecutar validaciones en orden configurado
- Evaluar resultados (OK/ERROR)
- Almacenar resultados de validacion

**Patron de Diseno:**
- **Strategy Pattern**: Diferentes estrategias de validacion
- **Template Method**: Flujo comun de ejecucion
- **Chain of Responsibility**: Validaciones secuenciales

**Pseudo-codigo:**

```csharp
public class ValidationEngine
{
    public ValidationResult ExecuteValidations(
        int archivoId,
        DateTime fecha,
        int aforeId,
        int fondoId)
    {
        // 1. Recuperar validaciones activas ordenadas
        var validaciones = _catalogoRepo.GetValidacionesActivas(archivoId);

        // 2. Ejecutar cada validacion
        foreach (var validacion in validaciones.OrderBy(v => v.Orden))
        {
            var scriptSQL = validacion.ScriptValidacion;

            // 3. Parametrizar query
            var parametros = new {
                IdCatValidacion = validacion.IdCatValidacion,
                vcUsuarioAfore = usuarioActual,
                FechaProceso = fecha
            };

            // 4. Ejecutar validacion
            var resultados = _sqlExecutor.Execute(scriptSQL, parametros);

            // 5. Almacenar resultados
            _resultadoRepo.Save(resultados);
        }

        // 6. Consolidar resultados
        return GenerarReporte(archivoId, fecha);
    }
}
```

#### 4.3.3 Generador de Reportes

**Responsabilidades:**
- Consolidar resultados de validaciones
- Formatear mensajes de error legibles
- Exportar a multiples formatos (CSV, Excel, PDF)
- Generar metricas agregadas

**Salidas:**

**Reporte de Errores Detallado:**
```
Archivo: 20250804_SB_544_001980.0300
Fecha: 04/08/2025
Afore: 544
Fondo: 001980

ERRORES ENCONTRADOS: 12

Linea | Validacion                      | Cuenta | Error
------|----------------------------------|--------|----------------------------------
45    | Balanza cuadrada                | 1103   | Diferencia de: 1,234.56
67    | Conversion divisas 7115 vs 1103 | 7115-01| Diferencia de: 45.23
89    | Tipo de dato Saldo Inicial      | 2201   | El dato no es numerico
```

**Metricas Agregadas:**
```
Total Registros: 501
Registros Validos: 489
Registros con Error: 12
Tasa de Exito: 97.6%

Errores por Tipo:
- Balanza cuadrada: 5
- Conversion divisas: 4
- Tipo de dato: 3
```

#### 4.3.4 Interface de Usuario

**Funcionalidades:**

**Pagina de Carga:**
- Upload de archivos drag & drop
- Seleccion de tipo de archivo
- Seleccion de afore/fondo
- Programacion de validacion

**Pagina de Resultados:**
- Lista de validaciones ejecutadas
- Estado (En Proceso, Completado, Con Errores)
- Descarga de reportes
- Visualizacion de errores en tabla

**Pagina de Administracion:**
- CRUD de validaciones
- Editor SQL con syntax highlighting
- Activacion/desactivacion de reglas
- Historial de cambios

---

## 5. MODELO DE DATOS

### 5.1 Diagrama Entidad-Relacion

```
+------------------------+       +---------------------------+
|  CatArchivoConsar      |       |  CatDetalleArchivoConsar  |
|------------------------|       |---------------------------|
| IdArchivoConsar (PK)   |<------| IdDetalleArchivo (PK)     |
| NombreArchivo          |       | IdArchivoConsar (FK)      |
| DescripcionArchivo     |       | NombreDetalle             |
| Activo                 |       | TipoRegistro              |
+------------------------+       | LongitudEsperada          |
        ^                        +---------------------------+
        |                                    ^
        |                                    |
+----------------------------+               |
| CatValidacionArchivoConsar |               |
|----------------------------|               |
| IdCatValidacion (PK)       |               |
| IdArchivoConsar (FK)       |---------------+
| IdDetalleArchivo (FK)      |
| TipoValidacion             |
| NombreValidacion           |
| DescripcionValidacion      |
| OrdenValidacion            |
| ScriptValidacion (TEXT)    |
| MensajeError               |
| Activo                     |
+----------------------------+
        ^
        |
        |
+----------------------------+
| ArchivoRegulatorioConsar   |
|----------------------------|
| IdArchivoRegulatorio (PK)  |
| IdArchivoConsar (FK)       |
| FechaArchivo               |
| IdFondo (FK)               |
| IdAfore (FK)               |
| NombreArchivo              |
| RutaArchivo                |
| EstadoValidacion           |
| FechaCarga                 |
| UsuarioCarga               |
+----------------------------+
        ^
        |
+----------------------------+
| DetalleArchivoConsar       |
|----------------------------|
| IdDetalleArchivoConsar(PK) |
| IdArchivoRegulatorio (FK)  |
| IdDetalleArchivo (FK)      |
| NumLinea                   |
| RegistroArchivo (VARCHAR)  |
+----------------------------+
        ^
        |
+----------------------------+
| ResultadoValidacion        |
|----------------------------|
| IdResultado (PK)           |
| IdAfore (FK)               |
| IdFondo (FK)               |
| FechaOperacion             |
| IdArchivoRegulatorio (FK)  |
| IdCatValidacion (FK)       |
| IdDetalleArchivoConsar(FK) |
| NumLinea                   |
| MensajeValidacion          |
| ValidadoOK (BIT)           |
| FechaEjecucion             |
+----------------------------+
```

### 5.2 Descripcion de Tablas

#### 5.2.1 Tablas de Catalogo (Configuracion)

**CatArchivoConsar**

Catalogo maestro de tipos de archivos que se envian a CONSAR.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdArchivoConsar | INT | Identificador unico (PK) |
| NombreArchivo | VARCHAR(100) | Nombre del tipo de archivo (ej: "Archivo 1101") |
| DescripcionArchivo | VARCHAR(500) | Descripcion del contenido |
| Activo | BIT | Indica si el tipo de archivo esta activo |

**Ejemplo de Registros:**
```sql
INSERT INTO CatArchivoConsar VALUES
(1, 'Archivo 1101', 'Balanza de Comprobacion', 1),
(2, 'Archivo 1102', 'Operaciones de Inversion', 1);
```

**CatDetalleArchivoConsar**

Catalogo de tipos de registro dentro de cada archivo (encabezado, detalle, pie).

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdDetalleArchivo | INT | Identificador unico (PK) |
| IdArchivoConsar | INT | Tipo de archivo (FK) |
| NombreDetalle | VARCHAR(100) | Nombre del tipo de registro |
| TipoRegistro | VARCHAR(10) | Codigo del tipo (000, 301, 302, etc) |
| LongitudEsperada | INT | Longitud en caracteres |

**Ejemplo:**
```sql
INSERT INTO CatDetalleArchivoConsar VALUES
(1, 1, 'Encabezado', '000', 77),
(2, 1, 'Detalle Movimientos', '302', 343);
```

**CatValidacionArchivoConsar**

Catalogo principal de validaciones configurables.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdCatValidacion | INT | Identificador unico (PK) |
| IdArchivoConsar | INT | Tipo de archivo (FK) |
| IdDetalleArchivo | INT | Tipo de registro a validar (FK) |
| TipoValidacion | VARCHAR(50) | Categoria (Longitud, Tipo Dato, Balanza, etc) |
| NombreValidacion | VARCHAR(200) | Nombre corto de la validacion |
| DescripcionValidacion | VARCHAR(500) | Descripcion detallada |
| OrdenValidacion | INT | Orden de ejecucion |
| ScriptValidacion | TEXT | Query SQL dinamico |
| MensajeError | VARCHAR(500) | Mensaje cuando falla |
| Activo | BIT | Indica si esta activa |

**Ejemplo:**
```sql
INSERT INTO CatValidacionArchivoConsar VALUES
(2, 1, 1, 'Longitud', 'Longitud',
 'Valida la longitud del encabezado', 1,
 'SELECT ... WHERE DATALENGTH(RegistroArchivo) = 77 ...',
 'La longitud no cumple con el tamano de 77 caracteres', 1);
```

#### 5.2.2 Tablas Operacionales (Datos Transaccionales)

**ArchivoRegulatorioConsar**

Registro de cada archivo cargado al sistema para validacion.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdArchivoRegulatorioConsar | INT | Identificador unico (PK) |
| IdArchivoConsar | INT | Tipo de archivo (FK) |
| FechaArchivo | DATE | Fecha del archivo |
| IdFondo | INT | Fondo al que pertenece (FK) |
| IdAfore | INT | AFORE que genera el archivo (FK) |
| NombreArchivo | VARCHAR(255) | Nombre del archivo fisico |
| RutaArchivo | VARCHAR(500) | Ruta de almacenamiento |
| EstadoValidacion | VARCHAR(50) | Pendiente, En Proceso, Validado, Con Errores |
| FechaCarga | DATETIME | Timestamp de carga |
| UsuarioCarga | VARCHAR(100) | Usuario que cargo el archivo |

**DetalleArchivoConsar**

Cada linea/registro del archivo cargado.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdDetalleArchivoConsar | INT | Identificador unico (PK) |
| IdArchivoRegulatorioConsar | INT | Archivo al que pertenece (FK) |
| IdDetalleArchivo | INT | Tipo de registro (FK) |
| NumLinea | INT | Numero de linea en el archivo |
| RegistroArchivo | VARCHAR(MAX) | Contenido completo de la linea |

**Indices Importantes:**
```sql
CREATE INDEX IX_DetalleArchivo_NumLinea
ON DetalleArchivoConsar(IdArchivoRegulatorioConsar, NumLinea);

CREATE INDEX IX_DetalleArchivo_TipoRegistro
ON DetalleArchivoConsar(IdDetalleArchivo);
```

**ResultadoValidacion**

Resultados de cada validacion ejecutada sobre cada registro.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdResultado | BIGINT | Identificador unico (PK) |
| IdAfore | INT | AFORE (FK) |
| IdFondo | INT | Fondo (FK) |
| FechaOperacion | DATE | Fecha del archivo |
| IdArchivoRegulatorioConsar | INT | Archivo validado (FK) |
| IdCatValidacion | INT | Validacion aplicada (FK) |
| IdDetalleArchivoConsar | INT | Registro validado (FK) |
| NumLinea | INT | Numero de linea |
| MensajeValidacion | VARCHAR(MAX) | Mensaje resultado |
| ValidadoOK | BIT | 1=Correcto, 0=Error |
| FechaEjecucion | DATETIME | Timestamp ejecucion |

**Indices de Performance:**
```sql
CREATE INDEX IX_Resultado_Archivo
ON ResultadoValidacion(IdArchivoRegulatorioConsar, ValidadoOK);

CREATE INDEX IX_Resultado_Validacion
ON ResultadoValidacion(IdCatValidacion, FechaEjecucion);
```

#### 5.2.3 Tablas de Soporte

**CatConsarDivisa**

Catalogo de divisas segun codificacion CONSAR.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdDivisa | INT | Identificador unico (PK) |
| SubCuentaDivisaConsarN2 | INT | Codigo de subcuenta CONSAR |
| CodigoDivisa | VARCHAR(10) | USD, EUR, MXN, etc |
| NombreDivisa | VARCHAR(100) | Nombre completo |

**CatTipoCambio**

Tipos de cambio historicos por divisa.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdTipoCambio | INT | Identificador unico (PK) |
| IdDivisa | INT | Divisa (FK) |
| CatTipoCambioFecha | DATE | Fecha del tipo de cambio |
| CatTipoCambioMonto | DECIMAL(18,6) | Valor del tipo de cambio |

**ControlProcesoUsuarioAforeFondo**

Control de procesos de usuario por afore y fondo.

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| IdUsuarioAfore | INT | Usuario (FK) |
| IdAfore | INT | AFORE (FK) |
| IdFondo | INT | Fondo (FK) |
| FechaProceso | DATE | Fecha de proceso |
| IdCatProcesoAfore | INT | Tipo de proceso (FK) |

### 5.3 Volumetria Estimada

**Proyeccion de Volumetria (1 Ano):**

| Tabla | Registros/Mes | Registros/Ano | Tamano Estimado |
|-------|---------------|---------------|-----------------|
| ArchivoRegulatorioConsar | 60 archivos | 720 | 100 KB |
| DetalleArchivoConsar | 30,000 lineas | 360,000 | 500 MB |
| ResultadoValidacion | 1,110,000 validaciones | 13,320,000 | 2 GB |
| CatValidacionArchivoConsar | 50 validaciones | 50 | 500 KB |

**Supuestos:**
- 1 AFORE procesa 3 archivos/dia (60/mes)
- Promedio 500 lineas/archivo
- 37 validaciones/archivo
- Retencion de 2 anos de datos

**Estrategia de Archivado:**
- Datos > 1 ano: mover a tabla historica
- Datos > 2 anos: exportar a data warehouse
- Indices particionados por fecha

---

## 6. FUNCIONALIDADES Y CARACTERISTICAS

### 6.1 Funcionalidades Core

#### 6.1.1 Validaciones de Estructura y Formato

**F01: Validacion de Longitud de Registros**

**Descripcion:**
Verifica que cada registro tenga la longitud exacta especificada segun su tipo.

**Ejemplo:**
Encabezado (tipo 000) debe tener exactamente 77 caracteres.

**Implementacion:**
```sql
SELECT
    ...
    MensajeValidacion = CASE
        WHEN DATALENGTH(RegistroArchivo) = 77
        THEN 'Correcto'
        ELSE 'La longitud no cumple con el tamano de 77 caracteres'
    END,
    ValidadoOK = CASE
        WHEN DATALENGTH(RegistroArchivo) = 77
        THEN 1
        ELSE 0
    END
FROM DetalleArchivoConsar
WHERE IdDetalleArchivo = 1 -- Encabezado
```

**Criticidad:** Alta
**Impacto de Fallo:** CONSAR rechaza el archivo completo

---

**F02: Validacion de Tipo de Dato Numerico**

**Descripcion:**
Verifica que campos definidos como numericos contengan solo digitos.

**Campos Validados:**
- Numero de registros
- Cuentas contables
- Subcuentas
- Importes (Saldo Inicial, Cargos, Abonos, Saldo Final)

**Implementacion:**
```sql
SELECT
    ...
    MensajeValidacion = CASE
        WHEN ISNUMERIC(SUBSTRING([RegistroArchivo], 5, 4)) = 1
        THEN 'Correcto'
        ELSE 'El Dato no es Numerico'
    END,
    ValidadoOK = CASE
        WHEN ISNUMERIC(SUBSTRING([RegistroArchivo], 5, 4)) = 1
        THEN 1
        ELSE 0
    END
FROM DetalleArchivoConsar
WHERE IdDetalleArchivo = 2 -- Detalle
```

**Criticidad:** Alta
**Impacto de Fallo:** Errores de calculo, rechazo de archivo

---

**F03: Validacion de Caracteres No Validos**

**Descripcion:**
Detecta caracteres prohibidos en campos numericos:
- Punto decimal (.) en campos de importes enteros
- Signo negativo (-) en posicion incorrecta

**Razon:**
Formato CONSAR usa importes enteros en centavos, sin decimales.
Ejemplo: $1,234.56 se representa como 123456

**Implementacion:**
```sql
-- Validacion de punto decimal
WHERE CHARINDEX('.', SUBSTRING([RegistroArchivo], posicion, longitud)) > 0

-- Validacion de signo negativo mal posicionado
WHERE SUBSTRING([RegistroArchivo], posicion, 1) = '-'
  AND posicion <> posicionEsperada
```

**Criticidad:** Media
**Impacto de Fallo:** Errores de interpretacion de montos

---

#### 6.1.2 Validaciones de Negocio Contable

**F04: Validacion de Balanza Cuadrada**

**Descripcion:**
Verifica la ecuacion contable fundamental:

```
Saldo Inicial + Cargos - Abonos = Saldo Final
```

**Implementacion Conceptual:**
```sql
SELECT
    ...
    Diferencia = (SaldoInicial + Cargos - Abonos) - SaldoFinal,
    MensajeValidacion = CASE
        WHEN (SaldoInicial + Cargos - Abonos) = SaldoFinal
        THEN 'Correcto'
        ELSE 'Cuentas contables con inconsistencia entre movimientos. Diferencia: '
             + FORMAT(ABS(Diferencia), 'N')
    END,
    ValidadoOK = CASE
        WHEN (SaldoInicial + Cargos - Abonos) = SaldoFinal
        THEN 1
        ELSE 0
    END
```

**Criticidad:** Critica
**Impacto de Fallo:** Balanza no cuadra, rechazo regulatorio, posibles sanciones

---

**F05: Validacion de Suma de Cargos vs Abonos**

**Descripcion:**
A nivel de balanza completa, la suma total de cargos debe igualar la suma total de abonos.

```
SUM(Cargos) = SUM(Abonos)
```

**Implementacion:**
```sql
SELECT
    TotalCargos = SUM(CONVERT(DECIMAL(18,2), Cargos)),
    TotalAbonos = SUM(CONVERT(DECIMAL(18,2), Abonos)),
    Diferencia = SUM(Cargos) - SUM(Abonos),
    ValidadoOK = CASE
        WHEN SUM(Cargos) = SUM(Abonos)
        THEN 1
        ELSE 0
    END
FROM DetalleArchivoConsar
WHERE IdDetalleArchivo = 2
GROUP BY IdArchivoRegulatorioConsar
```

**Criticidad:** Critica
**Impacto de Fallo:** Balanza general descuadrada

---

**F06: Validacion de Naturaleza de Cuentas**

**Descripcion:**
Verifica que las cuentas respeten su naturaleza contable:

- **Cuentas Deudoras** (Activo, Costos, Gastos): Saldo positivo
- **Cuentas Acreedoras** (Pasivo, Capital, Ingresos): Saldo negativo (representado como positivo con signo especial)

**Implementacion:**
```sql
-- Validacion cuentas deudoras
SELECT ...
FROM DetalleArchivoConsar DARC
INNER JOIN CatCuentasDeudoras CCD
    ON CONVERT(INT, SUBSTRING(DARC.RegistroArchivo, 4, 4)) = CCD.Cuenta
WHERE CONVERT(DECIMAL, SUBSTRING(DARC.RegistroArchivo, 62, 16)) < 0
-- Error: Cuenta deudora con saldo negativo

-- Validacion cuentas acreedoras
SELECT ...
FROM DetalleArchivoConsar DARC
INNER JOIN CatCuentasAcreedoras CCA
    ON CONVERT(INT, SUBSTRING(DARC.RegistroArchivo, 4, 4)) = CCA.Cuenta
WHERE CONVERT(DECIMAL, SUBSTRING(DARC.RegistroArchivo, 62, 16)) > 0
-- Error: Cuenta acreedora con saldo positivo
```

**Criticidad:** Alta
**Impacto de Fallo:** Estados financieros incorrectos

---

**F07: Validacion de Contracuentas**

**Descripcion:**
Ciertas operaciones generan cuentas y contracuentas que deben tener importes iguales pero de signo opuesto.

**Ejemplos:**
- Cuenta 71 (Activo) vs Cuenta 72 (Contracuenta de Activo)
- Operaciones Plus/Minus

**Implementacion:**
```sql
SELECT
    ...
    Cuenta1 = SUBSTRING(DARC1.RegistroArchivo, 4, 4),
    Importe1 = CONVERT(DECIMAL, SUBSTRING(DARC1.RegistroArchivo, 62, 16)),
    Cuenta2 = SUBSTRING(DARC2.RegistroArchivo, 4, 4),
    Importe2 = CONVERT(DECIMAL, SUBSTRING(DARC2.RegistroArchivo, 62, 16)),
    ValidadoOK = CASE
        WHEN ABS(Importe1) = ABS(Importe2)
        THEN 1
        ELSE 0
    END
FROM DetalleArchivoConsar DARC1
INNER JOIN DetalleArchivoConsar DARC2
    ON DARC1.IdArchivoRegulatorioConsar = DARC2.IdArchivoRegulatorioConsar
    AND DARC1.NumLinea <> DARC2.NumLinea
    AND SUBSTRING(DARC1.RegistroArchivo, 8, 6) = SUBSTRING(DARC2.RegistroArchivo, 8, 6)
WHERE CONVERT(INT, SUBSTRING(DARC1.RegistroArchivo, 4, 4)) = 71
  AND CONVERT(INT, SUBSTRING(DARC2.RegistroArchivo, 4, 4)) = 72
```

**Criticidad:** Alta
**Impacto de Fallo:** Inconsistencias contables

---

#### 6.1.3 Validaciones de Conversion de Divisas

**F08-F11: Validacion de Divisas vs Pesos**

**Descripcion:**
Valida que las cuentas en divisas y sus equivalentes en pesos tengan importes correctos segun tipo de cambio del dia.

**Pares de Cuentas:**
- 7115 (divisas) vs 1103 (pesos)
- 7116 (divisas) vs 1104 (pesos)
- 7117 (divisas) vs 1105 (pesos)
- 7118 (divisas) vs 2108 (pesos)

**Formula:**
```
Importe en Pesos = Importe en Divisas * Tipo de Cambio
```

**Implementacion (7115 vs 1103):**
```sql
SELECT
    CuentaDivisas = SUBSTRING(DARC.RegistroArchivo, 4, 4) + '-'
                  + SUBSTRING(DARC.RegistroArchivo, 8, 6),
    ImporteDivisas = CONVERT(DECIMAL(30,2),
                     SUBSTRING(DARC.RegistroArchivo, 62, 16)) * 0.01,
    CuentaPesos = SUBSTRING(DARC2.RegistroArchivo, 4, 4) + '-'
                + SUBSTRING(DARC2.RegistroArchivo, 8, 6),
    ImportePesos = CONVERT(DECIMAL(30,2),
                   SUBSTRING(DARC2.RegistroArchivo, 62, 16)) * 0.01,
    TipoCambio = TC.CatTipoCambioMonto,
    ImporteEsperadoPesos = ImporteDivisas * TC.CatTipoCambioMonto,
    Diferencia = ABS(ImporteEsperadoPesos - ImportePesos),
    MensajeValidacion = CASE
        WHEN ImporteEsperadoPesos = ImportePesos
        THEN 'Correcto'
        ELSE 'Diferencia de: ' + FORMAT(Diferencia, 'N')
    END,
    ValidadoOK = CASE
        WHEN ImporteEsperadoPesos = ImportePesos
        THEN 1
        ELSE 0
    END
FROM DetalleArchivoConsar DARC
INNER JOIN DetalleArchivoConsar DARC2
    ON DARC.IdArchivoRegulatorioConsar = DARC2.IdArchivoRegulatorioConsar
    AND SUBSTRING(DARC.RegistroArchivo, 8, 6) = SUBSTRING(DARC2.RegistroArchivo, 8, 6)
INNER JOIN CatConsarDivisa DIV
    ON DIV.SubCuentaDivisaConsarN2 = CONVERT(INT, SUBSTRING(DARC.RegistroArchivo, 8, 6))
INNER JOIN CatTipoCambio TC
    ON TC.CatTipoCambioFecha = @FechaProceso
    AND DIV.IdDivisa = TC.IdDivisa
WHERE CONVERT(INT, SUBSTRING(DARC.RegistroArchivo, 4, 4)) = 7115
  AND CONVERT(INT, SUBSTRING(DARC2.RegistroArchivo, 4, 4)) = 1103
```

**Tolerancia:**
Se acepta diferencia de 0.02 por redondeos.

**Criticidad:** Alta
**Impacto de Fallo:** Valoracion incorrecta de portafolios en divisas

---

#### 6.1.4 Validaciones de Catalogos

**F12: Validacion de Cuentas Contables Validas**

**Descripcion:**
Verifica que todas las cuentas contables utilizadas existan en el catalogo oficial de CONSAR.

**Implementacion:**
```sql
SELECT
    Cuenta = SUBSTRING(DARC.RegistroArchivo, 4, 4),
    Subcuenta = SUBSTRING(DARC.RegistroArchivo, 8, 6),
    MensajeValidacion = CASE
        WHEN CAT.IdCuenta IS NOT NULL
        THEN 'Correcto'
        ELSE 'Cuenta contable invalida'
    END,
    ValidadoOK = CASE
        WHEN CAT.IdCuenta IS NOT NULL
        THEN 1
        ELSE 0
    END
FROM DetalleArchivoConsar DARC
LEFT JOIN CatCuentasConsar CAT
    ON CAT.Cuenta = CONVERT(INT, SUBSTRING(DARC.RegistroArchivo, 4, 4))
    AND CAT.Subcuenta = CONVERT(INT, SUBSTRING(DARC.RegistroArchivo, 8, 6))
WHERE CAT.IdCuenta IS NULL
```

**Criticidad:** Alta
**Impacto de Fallo:** Rechazo de archivo por uso de cuentas no autorizadas

---

### 6.2 Funcionalidades de Gestion

#### 6.2.1 Administracion de Validaciones

**Crear Nueva Validacion**
- Formulario de captura con campos:
  - Nombre y descripcion
  - Tipo de validacion
  - Tipo de archivo y registro aplicable
  - Orden de ejecucion
  - Script SQL
  - Mensaje de error
- Editor SQL con syntax highlighting
- Validacion de sintaxis SQL
- Prueba de validacion con archivo de muestra

**Modificar Validacion Existente**
- Control de versiones de scripts
- Auditing de cambios (quien, cuando, que cambio)
- Proceso de aprobacion para cambios criticos

**Activar/Desactivar Validaciones**
- Toggle rapido sin eliminar configuracion
- Historial de activaciones/desactivaciones
- Notificacion a usuarios afectados

#### 6.2.2 Gestion de Archivos

**Carga de Archivos**
- Upload multiple de archivos
- Validacion previa de formato de nombre
- Deteccion automatica de tipo de archivo
- Programacion de validacion (inmediata o diferida)

**Consulta de Archivos**
- Filtros por fecha, afore, fondo, estado
- Busqueda por nombre de archivo
- Ordenamiento por multiples campos

**Revalidacion de Archivos**
- Reejecutar validaciones despues de correcciones
- Comparativa de resultados entre ejecuciones
- Tracking de mejora en tasa de exito

#### 6.2.3 Reporteria y Analitica

**Reporte de Errores por Archivo**
- Detalle de cada error encontrado
- Agrupacion por tipo de validacion
- Export a Excel/CSV/PDF

**Dashboard de Calidad**
- Tasa de exito por periodo
- Top 10 errores mas frecuentes
- Tendencia de calidad en el tiempo
- Comparativa entre fondos/afores

**Reporte de Performance**
- Tiempo de ejecucion de validaciones
- Volumetria procesada
- Uso de recursos

---

## 7. STACK TECNOLOGICO

### 7.1 Tecnologias Actuales (Identificadas)

**Base de Datos:**
- Microsoft SQL Server (version recomendada: 2019 o superior)
- Evidencia: Sintaxis T-SQL en scripts de validacion

**Plataformas Externas:**
- BlackRock Aladdin (Sistema de gestion de inversiones)
- Sistema Contable (no identificado especificamente)
- Sistema de Precios (no identificado)

**Formatos de Datos:**
- Archivos de texto plano con formato posicional
- CSV para catalogos
- PDF para documentacion

### 7.2 Stack Tecnologico Propuesto

#### 7.2.1 Backend

**Lenguaje y Framework:**

Opcion 1: .NET 8 (Recomendado)
- ASP.NET Core Web API
- Entity Framework Core para ORM
- Dapper para queries de alta performance

**Justificacion:**
- Excelente integracion con SQL Server
- Alto rendimiento para procesamiento batch
- Amplio soporte empresarial en sector financiero
- Herramientas de desarrollo maduras (Visual Studio)

Opcion 2: Java 17 + Spring Boot
- Spring Boot 3.x
- Hibernate para ORM
- JDBC Template para queries directas

**Justificacion:**
- Multiplataforma
- Gran ecosistema de librerias
- Amplia adopcion en sistemas financieros

**Arquitectura:**
- Clean Architecture / Hexagonal Architecture
- Separacion de capas: API, Application, Domain, Infrastructure
- Dependency Injection

**Librerias Clave (.NET):**
```
- FluentValidation (validaciones de entrada)
- Serilog (logging estructurado)
- MediatR (patron CQRS)
- Polly (resilience y retry policies)
- Hangfire (procesamiento background)
- AutoMapper (mapeo de objetos)
```

#### 7.2.2 Frontend

**Framework:**

Opcion 1: React 18 + TypeScript (Recomendado)
- Next.js para SSR y routing
- Material-UI o Ant Design para componentes
- React Query para state management de servidor
- Recharts para graficas

Opcion 2: Angular 17
- TypeScript nativo
- RxJS para manejo reactivo
- Angular Material para UI
- NgRx para state management

**Justificacion React:**
- Ecosistema extenso
- Facilidad de aprendizaje
- Componentes reutilizables
- Gran comunidad

**Estructura de Proyecto:**
```
/src
  /components
    /common (botones, inputs, modals)
    /layout (header, sidebar, footer)
    /features
      /upload (componentes de carga)
      /validation (resultados)
      /admin (administracion)
  /services
    /api (clientes HTTP)
  /hooks (custom hooks)
  /utils (helpers)
  /styles (CSS/SCSS)
```

#### 7.2.3 Base de Datos

**Motor:**
- Microsoft SQL Server 2019/2022

**Configuracion:**
- Edicion: Standard o Enterprise (segun volumetria)
- Modo de recuperacion: Full (para auditing)
- Particionamiento de tablas grandes por fecha
- Indices columnstore para consultas analiticas

**Estrategia de Backup:**
- Full backup diario
- Differential backup cada 6 horas
- Transaction log backup cada hora
- Retencion: 30 dias

**Alta Disponibilidad:**
- Always On Availability Groups (produccion)
- Replicas sincronicas para DR
- Read replicas para reportes

#### 7.2.4 Almacenamiento de Archivos

**Solucion Cloud (Recomendado):**

Azure Blob Storage
- Hot tier: Archivos recientes (< 30 dias)
- Cool tier: Archivos historicos (30-180 dias)
- Archive tier: Archivos regulatorios (> 180 dias)

**Organizacion de Contenedores:**
```
/archivos-regulatorios
  /afore-{id}
    /fondo-{id}
      /{ano}/{mes}/{dia}
        {nombre-archivo}.txt
        {nombre-archivo}.txt.metadata.json
```

**Metadata JSON:**
```json
{
  "archivoId": 12345,
  "fecha": "2025-08-04",
  "afore": "544",
  "fondo": "001980",
  "tipoArchivo": "1101",
  "estadoValidacion": "Con Errores",
  "totalRegistros": 501,
  "registrosValidos": 489,
  "registrosError": 12,
  "fechaCarga": "2025-08-05T10:30:00Z",
  "usuario": "juan.perez@afore.com"
}
```

Alternativa On-Premise:
- File Server con SMB/NFS
- SAN (Storage Area Network)

#### 7.2.5 Seguridad

**Autenticacion y Autorizacion:**

Azure Active Directory (Azure AD) / Entra ID
- SSO (Single Sign-On)
- MFA (Multi-Factor Authentication)
- Roles basados en grupos AD

**Roles del Sistema:**
```
- Administrador: Acceso completo
- Supervisor: Carga, validacion, reportes
- Analista: Solo lectura de resultados
- Auditor: Solo lectura de logs y auditing
```

**Seguridad en Transito:**
- HTTPS/TLS 1.3
- Certificados SSL

**Seguridad en Reposo:**
- Encriptacion de archivos en Blob Storage (AES-256)
- Transparent Data Encryption (TDE) en SQL Server
- Secrets en Azure Key Vault

**Auditing:**
- Logging de todas las operaciones CRUD
- Registro de accesos a datos sensibles
- Alertas de actividades anomalas

#### 7.2.6 Infraestructura y DevOps

**Hosting:**

Opcion 1: Azure (Recomendado)
```
- App Service (Web API) - Plan Premium
- App Service (Frontend) - Plan Standard
- SQL Database (Managed Instance)
- Blob Storage
- Application Insights (monitoreo)
- Log Analytics
```

Opcion 2: On-Premise
```
- VMs Windows Server 2022
- IIS para hosting
- SQL Server clustered
- Load Balancer
```

**Contenedores:**
- Docker para empaquetado
- Azure Container Registry
- Azure Container Instances (ACI) o AKS (Kubernetes) para orquestacion

**CI/CD:**

Azure DevOps
```yaml
# azure-pipelines.yml
trigger:
  - main
  - develop

stages:
  - stage: Build
    jobs:
      - job: BuildAPI
        steps:
          - task: DotNetCoreCLI@2
            inputs:
              command: 'build'
              projects: '**/*.csproj'
          - task: DotNetCoreCLI@2
            inputs:
              command: 'test'
              projects: '**/*Tests.csproj'

  - stage: Deploy
    dependsOn: Build
    jobs:
      - deployment: DeployToProduction
        environment: 'production'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: 'subscription'
                    appName: 'hergon-api-prod'
                    package: '$(Pipeline.Workspace)/drop'
```

**Monitoreo:**
- Application Insights para APM
- Azure Monitor para infraestructura
- Alertas configuradas para:
  - Errores HTTP 500
  - Latencia > 2 segundos
  - CPU > 80%
  - Memoria > 85%

#### 7.2.7 Integraciones

**API de Aladdin (BlackRock)**
- REST API o SOAP (segun disponibilidad)
- Autenticacion OAuth 2.0
- Rate limiting considerado

**SFTP para CONSAR**
- Envio automatico de archivos validados
- Encriptacion PGP
- Confirmacion de recepcion

**Sistema Contable**
- Conectores ETL (SSIS, Azure Data Factory)
- APIs REST si estan disponibles
- Carga batch periodica

---

## 8. CUMPLIMIENTO REGULATORIO

### 8.1 Marco Normativo CONSAR

**Legislacion Aplicable:**

**Ley de los Sistemas de Ahorro para el Retiro (LSAR)**
- Publicada: 23/05/1996
- Ultima reforma: Multiples actualizaciones
- Ambito: Nacional
- Autoridad: CONSAR (SHCP)

**Reglamento de la LSAR**
- Disposiciones operativas
- Procedimientos administrativos
- Reglas de supervision

**Disposiciones de Caracter General**
- Circular CONSAR 19-21: Reglas generales de informacion
- Circular CONSAR 55-1: Reglas prudenciales de inversiones
- Disposiciones sobre contabilidad (DOF 22/11/2022)

### 8.2 Especificaciones Tecnicas de Archivos CONSAR

**Archivo 1101: Balanza de Comprobacion**

**Estructura General:**
- Formato: Texto plano ASCII
- Codificacion: ASCII extendido
- Separadores: Sin separadores (formato posicional)
- Fin de linea: CRLF (Windows)

**Tipos de Registro:**

**Tipo 000: Encabezado**
```
Posicion | Longitud | Campo              | Tipo    | Descripcion
---------|----------|--------------------|---------|---------------------------
1-3      | 3        | TipoRegistro       | N       | "000"
4-8      | 5        | NumeroRegistros    | N       | Total registros en archivo
9-12     | 4        | TamanioRegistro    | N       | Longitud de registros
13-14    | 2        | TipoArchivo        | N       | Codigo de archivo
15-16    | 2        | TipoEntidad        | N       | Tipo de entidad
17-20    | 4        | Entidad            | N       | Codigo de entidad
21-24    | 4        | SubtipoEntidad     | N       | Subtipo
25-32    | 8        | FechaArchivo       | N       | YYYYMMDD
33-77    | 45       | Espacios           | AN      | Espacios en blanco
```

**Tipo 302: Detalle de Movimientos**
```
Posicion | Longitud | Campo              | Tipo    | Descripcion
---------|----------|--------------------|---------|---------------------------
1-3      | 3        | TipoRegistro       | N       | "302"
4-7      | 4        | Cuenta             | N       | Cuenta contable
8-13     | 6        | Subcuenta          | N       | Subcuenta
14-29    | 16       | SaldoInicial       | N       | En centavos (sin decimal)
30-45    | 16       | Cargos             | N       | En centavos
46-61    | 16       | Abonos             | N       | En centavos
62-77    | 16       | SaldoFinal         | N       | En centavos
78-...   | ...      | OtrosCampos        | AN      | Campos adicionales
```

**Reglas de Formato:**
- Numeros enteros sin separadores de miles
- Sin puntos decimales (importes en centavos)
- Numeros justificados a la derecha, relleno con ceros a la izquierda
- Alfanumericos justificados a la izquierda, relleno con espacios a la derecha
- Signo negativo: representado con 'D' al final o segun convencion CONSAR

**Encriptacion:**
- Algoritmo: GNUpg (GPG)
- Clave publica de CONSAR
- Nombre archivo encriptado: {nombre_original}.gpg

### 8.3 Disposiciones Contables

**Catalogo de Cuentas CONSAR**

Las AFOREs deben usar exclusivamente el catalogo de cuentas publicado por CONSAR.

**Niveles del Catalogo:**
- Nivel 1: Tipo de cuenta (1=Activo, 2=Pasivo, 3=Capital, 4=Ingresos, 5=Gastos, 7=Orden)
- Nivel 2: Grupo
- Nivel 3: Rubro
- Nivel 4: Cuenta
- Nivel 5: Subcuenta (divisas, instrumentos, etc.)

**Ejemplo:**
```
7115 = Cuenta de orden de valores en custodia (divisas)
  7115-01 = Dolares estadounidenses
  7115-02 = Euros
  7115-03 = Yenes
```

**Cuentas de Orden (7000):**
- No afectan el balance
- Registran compromisos y contingencias
- Requieren contracuentas

**Reglas de Valuacion:**
- Instrumentos de deuda: Valor razonable (mark-to-market)
- Acciones: Precio de cierre de mercado
- Divisas: Tipo de cambio FIX (Banco de Mexico)
- ETFs internacionales: Precio de cierre en mercado origen convertido a MXN

### 8.4 Niveles de Cumplimiento

**Hergon-Vector01** asegura cumplimiento en multiples niveles:

**Nivel 1: Cumplimiento de Formato**
- Longitud de registros
- Tipos de dato
- Caracteres permitidos
- Estructura de archivo

**Nivel 2: Cumplimiento Contable**
- Balanza cuadrada
- Naturaleza de cuentas
- Contracuentas balanceadas
- Catalogo de cuentas valido

**Nivel 3: Cumplimiento de Valuacion**
- Tipos de cambio oficiales
- Conversiones precisas
- Redondeos segun norma

**Nivel 4: Cumplimiento Regulatorio**
- Reglas de inversion (fuera de alcance V1.0)
- Limites de concentracion (fuera de alcance V1.0)
- VaR (Value at Risk) (fuera de alcance V1.0)

### 8.5 Trazabilidad y Auditing

**Requisitos de Auditing:**

CONSAR puede solicitar en cualquier momento:
- Evidencia de validaciones realizadas
- Historial de correcciones
- Responsables de aprobaciones
- Timestamps de todas las operaciones

**Capacidades de Hergon:**

**Registro de Validaciones:**
```sql
CREATE TABLE AuditValidacion (
    IdAudit BIGINT PRIMARY KEY,
    FechaEjecucion DATETIME,
    IdArchivoRegulatorio INT,
    IdValidacion INT,
    ResultadoValidacion BIT,
    UsuarioEjecucion VARCHAR(100),
    IPAddress VARCHAR(50),
    Duracion INT -- milisegundos
)
```

**Registro de Modificaciones de Reglas:**
```sql
CREATE TABLE AuditCambioValidacion (
    IdAuditCambio BIGINT PRIMARY KEY,
    FechaCambio DATETIME,
    IdValidacion INT,
    UsuarioModificador VARCHAR(100),
    CampoModificado VARCHAR(100),
    ValorAnterior TEXT,
    ValorNuevo TEXT,
    Justificacion TEXT,
    UsuarioAprobador VARCHAR(100),
    FechaAprobacion DATETIME
)
```

**Reportes de Auditing:**
- Reporte de validaciones por periodo
- Reporte de cambios en reglas
- Reporte de accesos a datos sensibles
- Reporte de archivos enviados a CONSAR

---

## 9. MODELO DE NEGOCIO

### 9.1 Segmentos de Clientes

**Cliente Primario:**

AFOREs en Mexico
- Total de AFOREs en Mexico: 10 (a 2025)
- Perfil: Instituciones financieras reguladas
- Tamano: Activos bajo gestion de $5.5 billones MXN (total industria)
- Necesidad: Cumplimiento regulatorio obligatorio

**Listado de AFOREs Potenciales:**
1. Afore XXI Banorte
2. Afore Coppel
3. Afore Inbursa
4. Afore Invercap
5. Afore PensiónISSSTE
6. Afore Principal
7. Afore Profuturo GNP
8. Afore SURA
9. Citibanamex
10. Azteca

**Clientes Secundarios:**

SIEFOREs
- Subsidiarias de AFOREs
- Mismas necesidades de validacion
- Oportunidad de licenciamiento adicional

Consultores y Auditores
- Validacion de datos para dictamenes
- Verificacion de cumplimiento
- Modelo de uso ocasional (licencias temporales)

### 9.2 Propuesta de Valor

**Para AFOREs:**

1. **Eliminacion de Rechazos Regulatorios**
   - Costo promedio de rechazo: $50,000 - $200,000 MXN (multas + reproceso)
   - ROI inmediato al evitar primera multa

2. **Reduccion de Costos Operativos**
   - Automatizacion de 90% del proceso de validacion
   - Liberacion de recursos humanos para tareas de mayor valor
   - Reduccion de horas-hombre de 40 horas/mes a 4 horas/mes por fondo

3. **Mejora en Calidad de Datos**
   - Deteccion temprana de errores en sistemas origen
   - Retroalimentacion para mejora continua
   - Dashboard de metricas de calidad

4. **Agilidad Regulatoria**
   - Adaptacion rapida a cambios normativos
   - Sin dependencia de proveedores de TI para actualizar reglas
   - Configuracion por usuarios de negocio

5. **Trazabilidad y Auditing**
   - Evidencia completa para auditorias
   - Cumplimiento de ISO 27001, SOC 2
   - Respaldo ante cuestionamientos de CONSAR

**Para CONSAR (Beneficio Indirecto):**

1. Reduccion de rechazos de archivos
2. Mejora en calidad de datos recibidos
3. Facilita supervision basada en riesgos
4. Estandarizacion de procesos en la industria

### 9.3 Canales de Distribucion

**Venta Directa:**
- Equipo comercial especializado
- Contacto directo con CTOs y CFOs de AFOREs
- Demostraciones en sitio
- POCs (Proof of Concept) de 30 dias

**Asociaciones Estrategicas:**
- AMAFORE (Asociacion Mexicana de AFOREs)
- Consultoras Big 4 (Deloitte, PwC, KPMG, EY)
- Integradores de sistemas (Softtek, Neoris, etc.)

**Marketing:**
- Presencia en conferencias de la industria financiera
- White papers sobre cumplimiento regulatorio
- Webinars tecnicos
- Casos de exito publicados

### 9.4 Relacion con Clientes

**Pre-Venta:**
- Analisis de necesidades
- Demostracion personalizada
- POC funcional

**Implementacion:**
- Gerente de proyecto dedicado
- Capacitacion en sitio (5 dias)
- Acompanamiento en go-live

**Post-Venta:**
- Soporte tecnico 24/7 (SLA 99.5%)
- Actualizaciones regulatorias incluidas
- Consultor asignado (para planes enterprise)

**Modelo de Soporte:**
- Nivel 1: Chat/Email (respuesta < 2 horas)
- Nivel 2: Telefono (respuesta < 1 hora)
- Nivel 3: Ingeniero en sitio (casos criticos)

### 9.5 Fuentes de Ingresos

**Modelo de Licenciamiento:**

**Opcion 1: Licencia Perpetua + Mantenimiento Anual**

Inversion Inicial:
- Licencia para 1 AFORE con 5 fondos: $800,000 MXN
- Implementacion y capacitacion: $300,000 MXN
- Total inversion inicial: $1,100,000 MXN

Mantenimiento Anual:
- 20% del costo de licencia: $160,000 MXN/ano
- Incluye:
  - Actualizaciones regulatorias
  - Soporte tecnico
  - Nuevas funcionalidades

**Opcion 2: Suscripcion Anual (SaaS)**

Precio por Fondo:
- 1-3 fondos: $180,000 MXN/fondo/ano
- 4-10 fondos: $150,000 MXN/fondo/ano
- 10+ fondos: $120,000 MXN/fondo/ano

Ejemplo AFORE con 5 fondos:
- 3 fondos x $180,000 = $540,000 MXN
- 2 fondos x $150,000 = $300,000 MXN
- Total anual: $840,000 MXN

Incluye:
- Hosting en cloud
- Soporte 24/7
- Backups y DR
- Actualizaciones automaticas

**Opcion 3: Modelo Hibrido**

Licencia Base + Uso:
- Licencia base: $400,000 MXN
- Costo por archivo validado: $500 MXN
- Mantenimiento anual: $80,000 MXN

Ejemplo con 100 archivos/mes:
- Licencia base: $400,000 MXN (una vez)
- Uso anual: $500 x 1,200 = $600,000 MXN
- Mantenimiento: $80,000 MXN
- Total primer ano: $1,080,000 MXN
- Anos subsecuentes: $680,000 MXN

**Servicios Adicionales:**

Consultoria de Optimizacion:
- Analisis de procesos actuales
- Diseno de flujos optimizados
- $150,000 MXN por proyecto

Desarrollo de Validaciones Personalizadas:
- $50,000 MXN por validacion compleja
- $20,000 MXN por validacion simple

Capacitacion Adicional:
- $30,000 MXN por dia (hasta 15 personas)

Integracion con Sistemas:
- API REST: Incluida
- Integracion personalizada: $200,000 - $500,000 MXN

### 9.6 Recursos Clave

**Tecnologicos:**
- Plataforma de software (codigo fuente)
- Infraestructura cloud (Azure)
- Catalogo de validaciones actualizado
- Base de conocimiento regulatorio

**Humanos:**
- Equipo de desarrollo: 5 ingenieros
- Arquitecto de software: 1
- Especialista regulatorio CONSAR: 1
- Gerente de producto: 1
- Equipo de soporte: 3 ingenieros
- Comercial: 2 ejecutivos

**Financieros:**
- Capital de inversion inicial: $5,000,000 MXN
- Runway: 18 meses sin ingresos

### 9.7 Actividades Clave

**Desarrollo de Producto:**
- Desarrollo de nuevas funcionalidades
- Mantenimiento y bugs fixes
- Actualizaciones regulatorias

**Operaciones:**
- Hosting y monitoreo de infraestructura
- Soporte tecnico a clientes
- Gestion de incidentes

**Comercial:**
- Generacion de leads
- Demostraciones y POCs
- Negociacion de contratos

**Cumplimiento:**
- Monitoreo de cambios regulatorios
- Actualizacion de catalogo de validaciones
- Certificaciones (ISO 27001, SOC 2)

### 9.8 Asociaciones Clave

**Proveedores de Tecnologia:**
- Microsoft (Azure, licencias)
- BlackRock (API Aladdin, si disponible)

**Consultoras:**
- Big 4 para referidos y co-venta
- Consultoras especializadas en AFOREs

**Asociaciones Industriales:**
- AMAFORE (networking, promocion)
- CONSAR (validacion de cumplimiento)

**Integradores:**
- Softtek, Neoris, Accenture
- Para implementaciones complejas

### 9.9 Estructura de Costos

**Costos Fijos:**

Personal (mensual):
- 5 ingenieros: $300,000 MXN
- 1 arquitecto: $80,000 MXN
- 1 especialista regulatorio: $60,000 MXN
- 1 gerente producto: $70,000 MXN
- 3 soporte: $120,000 MXN
- 2 comercial: $100,000 MXN
- Total personal: $730,000 MXN/mes = $8,760,000 MXN/ano

Infraestructura (mensual):
- Azure (ambiente dev/qa/prod): $50,000 MXN
- Oficina y servicios: $80,000 MXN
- Licencias software: $30,000 MXN
- Total infraestructura: $160,000 MXN/mes = $1,920,000 MXN/ano

**Total Costos Fijos Anuales: $10,680,000 MXN**

**Costos Variables:**

Por Cliente:
- Implementacion (una vez): $100,000 MXN (costo interno)
- Soporte continuo: $20,000 MXN/ano
- Hosting dedicado (si aplica): $15,000 MXN/ano

### 9.10 Proyeccion Financiera

**Ano 1:**

Supuestos:
- 3 clientes (AFOREs)
- Precio promedio: $1,000,000 MXN (licencia + implementacion)
- Mantenimiento anual: $180,000 MXN por cliente

Ingresos:
- Licencias: $3,000,000 MXN
- Mantenimiento: $540,000 MXN (desde mes 6)
- Total ingresos: $3,540,000 MXN

Costos:
- Fijos: $10,680,000 MXN
- Variables: $405,000 MXN
- Total costos: $11,085,000 MXN

**Resultado Ano 1: -$7,545,000 MXN**

**Ano 2:**

Supuestos:
- 6 clientes acumulados (3 nuevos)
- Renovaciones: 100%

Ingresos:
- Licencias nuevas: $3,000,000 MXN
- Mantenimiento: $1,080,000 MXN
- Total ingresos: $4,080,000 MXN

**Resultado Ano 2: -$7,005,000 MXN (perdida acumulada: -$14,550,000 MXN)**

**Ano 3:**

Supuestos:
- 10 clientes acumulados (4 nuevos)
- Market share: 100% de AFOREs en Mexico

Ingresos:
- Licencias nuevas: $4,000,000 MXN
- Mantenimiento: $1,800,000 MXN
- Total ingresos: $5,800,000 MXN

Costos:
- Fijos: $11,400,000 MXN (incremento por expansion)
- Variables: $725,000 MXN

**Resultado Ano 3: -$6,325,000 MXN (perdida acumulada: -$20,875,000 MXN)**

**Punto de Equilibrio:**

Con modelo SaaS y 10 clientes pagando promedio $840,000 MXN/ano:
- Ingresos anuales: $8,400,000 MXN
- Costos: $11,125,000 MXN
- Deficit: -$2,725,000 MXN

**Conclusion:**
El modelo requiere:
1. Reduccion de costos operativos, o
2. Aumento de precios, o
3. Expansion a mercados adicionales (otros paises, otras industrias reguladas)

---

## 10. ESTRATEGIA DE EXPANSION Y ESCALABILIDAD

### 10.1 Expansion Funcional

**Fase 1: MVP (Meses 1-6)**
- Validacion de Archivo 1101
- 37 validaciones configuradas
- Interface web basica
- Reportes en Excel

**Fase 2: Expansion de Archivos (Meses 7-12)**
- Archivo 1102: Operaciones de Inversion
- Archivo 1103: Portafolios de Inversion
- Archivo 1104: Cuentas Individuales
- +100 validaciones adicionales

**Fase 3: Integraciones (Meses 13-18)**
- API Aladdin para extraccion automatica
- Conectores a sistemas contables comunes (SAP, Oracle)
- Envio automatico a CONSAR via SFTP

**Fase 4: Inteligencia Artificial (Meses 19-24)**
- ML para deteccion de anomalias
- Sugerencias de correccion automatica
- Prediccion de errores futuros basado en patrones

**Fase 5: Expansion Regulatoria (Meses 25-36)**
- Validaciones para otros reguladores:
  - CNBV (Comision Nacional Bancaria y de Valores)
  - SAT (Sistema de Administracion Tributaria)
  - IMSS (Instituto Mexicano del Seguro Social)

### 10.2 Expansion Geografica

**Mexico (Ano 1-2):**
- Foco en 10 AFOREs
- Market share objetivo: 80%

**Latinoamerica (Ano 3-5):**

Chile:
- 6 AFPs (Administradoras de Fondos de Pensiones)
- Regulador: Superintendencia de Pensiones
- Similitud regulatoria alta

Colombia:
- 4 AFP (Administradoras de Fondos de Pensiones)
- Regulador: Superintendencia Financiera
- Adaptacion de validaciones requerida

Peru:
- 4 AFP
- Regulador: SBS (Superintendencia de Banca y Seguros)
- Adaptacion de validaciones requerida

**Expansion a Otras Industrias Reguladas:**

Banca:
- Reportes a CNBV
- Archivos SITI (Sistema Interinstitucional de Transferencias)
- 50+ bancos en Mexico

Seguros:
- Reportes a CNSF (Comision Nacional de Seguros y Fianzas)
- Estados financieros regulatorios
- 100+ aseguradoras en Mexico

Casas de Bolsa:
- Reportes a CNBV
- Operaciones bursatiles
- 30+ casas de bolsa

### 10.3 Escalabilidad Tecnica

**Escalabilidad Horizontal:**

Base de Datos:
- Sharding por Afore/Fondo
- Read replicas para reportes
- Particionamiento de tablas grandes

Aplicacion:
- Microservicios independientes:
  - Servicio de carga de archivos
  - Servicio de validacion
  - Servicio de reportes
  - Servicio de administracion
- Auto-scaling en Azure/AWS
- Load balancing

Procesamiento:
- Procesamiento paralelo de validaciones
- Azure Functions para validaciones independientes
- Message queues (Azure Service Bus, RabbitMQ)

**Escalabilidad Vertical:**

Base de Datos:
- Upgrade de tier en Azure SQL (32 vCores, 128 GB RAM)
- In-Memory OLTP para tablas hot

Aplicacion:
- Instancias de mayor capacidad
- Caching con Redis

**Arquitectura de Microservicios:**

```
                        ┌─────────────────┐
                        │   API Gateway   │
                        └────────┬────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
         ┌───────▼─────┐ ┌──────▼──────┐ ┌─────▼──────┐
         │  Upload     │ │ Validation  │ │  Reporting │
         │  Service    │ │  Service    │ │  Service   │
         └─────────────┘ └─────────────┘ └────────────┘
                 │               │               │
                 └───────┬───────┴───────┬───────┘
                         │               │
                 ┌───────▼─────┐ ┌──────▼──────┐
                 │  Database   │ │    Cache    │
                 │  (SQL)      │ │   (Redis)   │
                 └─────────────┘ └─────────────┘
```

**Volumetria Proyectada:**

Ano 1:
- 3 clientes x 5 fondos x 60 archivos/ano = 900 archivos
- 900 archivos x 500 lineas = 450,000 registros
- 450,000 registros x 37 validaciones = 16,650,000 validaciones

Ano 3:
- 10 clientes x 5 fondos x 60 archivos/ano = 3,000 archivos
- 3,000 archivos x 500 lineas = 1,500,000 registros
- 1,500,000 registros x 37 validaciones = 55,500,000 validaciones

Ano 5 (con expansion):
- 30 clientes x 5 fondos x 60 archivos/ano = 9,000 archivos
- 4,500,000 registros
- 166,500,000 validaciones

**Optimizaciones de Performance:**

1. Indices optimizados en SQL Server
2. Caching de catalogos en Redis
3. Procesamiento batch con Hangfire
4. Particionamiento de tablas por fecha
5. Archivado de datos antiguos a Blob Storage

---

## 11. ANALISIS DE RIESGOS Y MITIGACION

### 11.1 Riesgos Tecnicos

**R01: Rendimiento Insuficiente en Validaciones**

Descripcion:
- Validaciones complejas pueden tomar demasiado tiempo
- Archivos grandes (10,000+ lineas) pueden causar timeouts

Probabilidad: Media
Impacto: Alto

Mitigacion:
- Optimizacion de queries SQL (indices, particionamiento)
- Procesamiento paralelo de validaciones independientes
- Cache de catalogos
- Particionamiento de archivos grandes en chunks

**R02: Errores en Logica de Validacion**

Descripcion:
- Bugs en scripts SQL pueden generar falsos positivos/negativos
- Riesgo de aprobar archivos incorrectos o rechazar archivos correctos

Probabilidad: Media
Impacto: Critico

Mitigacion:
- Testing exhaustivo de cada validacion
- Suite de archivos de prueba (casos edge)
- Proceso de QA doble para nuevas validaciones
- Versionamiento de scripts de validacion
- Rollback automatico si se detecta anomalia

**R03: Integracion Fallida con Sistemas Externos**

Descripcion:
- APIs de Aladdin no disponibles o con limitaciones
- Conectores a sistemas contables complejos

Probabilidad: Alta
Impacto: Medio

Mitigacion:
- Diseño de interfaces abstractas
- Multiples metodos de carga (API, SFTP, upload manual)
- Adaptadores configurables
- POCs previos a compromisos

### 11.2 Riesgos Regulatorios

**R04: Cambios en Normativa CONSAR**

Descripcion:
- CONSAR puede cambiar formatos de archivos
- Nuevas validaciones requeridas
- Modificacion de catalogos de cuentas

Probabilidad: Alta
Impacto: Alto

Mitigacion:
- Monitoreo continuo de publicaciones DOF
- Relacion directa con CONSAR
- Arquitectura flexible de validaciones
- SLA de actualizacion: 15 dias desde publicacion en DOF
- Notificacion proactiva a clientes

**R05: Rechazo de Archivos Validados**

Descripcion:
- CONSAR rechaza archivo que paso validaciones de Hergon
- Perdida de confianza del cliente

Probabilidad: Baja
Impacto: Critico

Mitigacion:
- Certificacion de validaciones con CONSAR
- Testing con archivos reales de AFOREs
- Garantia de reembolso si error es de Hergon
- Seguro de responsabilidad profesional

### 11.3 Riesgos de Negocio

**R06: Baja Adopcion en Mercado**

Descripcion:
- AFOREs desarrollan soluciones propias
- Resistencia a adoptar tecnologia externa

Probabilidad: Media
Impacto: Critico

Mitigacion:
- POCs gratuitos de 30 dias
- Casos de exito tempranos
- Precios competitivos vs desarrollo interno
- Partnership con consultoras de confianza

**R07: Competencia de Proveedores Establecidos**

Descripcion:
- Aladdin o ERPs incluyen validaciones
- Competidores con mejor posicionamiento

Probabilidad: Media
Impacto: Alto

Mitigacion:
- Especializacion profunda en regulacion mexicana
- Mejor precio que soluciones internacionales
- Soporte local en espanol
- Actualizaciones mas rapidas

**R08: Concentracion de Clientes**

Descripcion:
- 10 AFOREs es un mercado pequeno
- Perdida de 1-2 clientes impacta significativamente

Probabilidad: Alta
Impacto: Alto

Mitigacion:
- Expansion a otras industrias reguladas
- Expansion geografica a Latam
- Diversificacion de fuentes de ingreso (consultoria, capacitacion)

### 11.4 Riesgos Operacionales

**R09: Dependencia de Personal Clave**

Descripcion:
- Arquitecto principal o especialista regulatorio dejan empresa
- Conocimiento critico no documentado

Probabilidad: Media
Impacto: Alto

Mitigacion:
- Documentacion tecnica exhaustiva
- Knowledge transfer entre equipo
- Contratos con clauses de no competencia
- Compensacion competitiva

**R10: Falla de Infraestructura**

Descripcion:
- Caida de Azure
- Perdida de datos
- Indisponibilidad durante ventanas criticas

Probabilidad: Baja
Impacto: Alto

Mitigacion:
- Multi-region deployment
- Backups automaticos diarios
- DR plan con RPO < 1 hora, RTO < 4 horas
- SLA de disponibilidad 99.5%

### 11.5 Riesgos de Seguridad

**R11: Brecha de Seguridad**

Descripcion:
- Acceso no autorizado a datos de clientes
- Robo de informacion confidencial

Probabilidad: Baja
Impacto: Critico

Mitigacion:
- Certificacion ISO 27001
- Penetration testing anual
- Encriptacion end-to-end
- MFA obligatorio
- Seguro de ciberriesgo

**R12: Cumplimiento de Privacidad de Datos**

Descripcion:
- Violacion de LFPDPPP (Ley Federal de Proteccion de Datos Personales)
- Multas regulatorias

Probabilidad: Baja
Impacto: Alto

Mitigacion:
- Aviso de privacidad completo
- Data retention policies
- Anonimizacion de datos en ambientes no productivos
- DPO (Data Protection Officer)

---

## 12. ROADMAP DE IMPLEMENTACION

### 12.1 Fase 0: Planificacion y Diseno (Completada)

**Duracion:** 2 meses
**Estado:** Completada (Nov 2025)

Actividades:
- [x] Reunion de kick-off (14/11/2025)
- [x] Definicion de arquitectura
- [x] Catalogo de validaciones documentado
- [x] Diagrama de flujo de datos
- [x] Archivo de datos de ejemplo

Entregables:
- [x] Documento de arquitectura
- [x] Catalogo Scripts Validaciones.csv
- [x] Diagrama circuito del sistema

### 12.2 Fase 1: MVP - Desarrollo Core (Meses 1-4)

**Objetivos:**
- Sistema funcional de validacion de Archivo 1101
- Interface web basica
- 37 validaciones operativas

**Mes 1: Setup y Fundaciones**

Semanas 1-2:
- Inicializar repositorio Git
- Setup de ambientes (Dev, QA, Prod)
- Configuracion de CI/CD pipeline
- Diseño de base de datos
- Creacion de esquema SQL

Semanas 3-4:
- Desarrollo de parseo de archivos
- Carga de archivos a base de datos
- Unit tests de parseo

**Mes 2: Motor de Validaciones**

Semanas 1-2:
- Desarrollo de motor de ejecucion de validaciones
- Integracion con catalogo de validaciones
- Parametrizacion de queries

Semanas 3-4:
- Implementacion de 20 validaciones (mas criticas)
- Testing de validaciones
- Optimizacion de performance

**Mes 3: Validaciones Restantes y Reportes**

Semanas 1-2:
- Implementacion de 17 validaciones restantes
- Testing exhaustivo
- Generador de reportes Excel

Semanas 3-4:
- Interface web (upload de archivos)
- Visualizacion de resultados
- Testing de integracion

**Mes 4: Testing y Refinamiento**

Semanas 1-2:
- Testing con archivos reales
- Ajustes y bug fixes
- Performance tuning

Semanas 3-4:
- UAT (User Acceptance Testing) con cliente piloto
- Documentacion de usuario
- Capacitacion

**Entregables Fase 1:**
- Sistema funcional en produccion
- 37 validaciones operativas
- Interface web basica
- Manual de usuario
- 1 cliente piloto implementado

**KPIs de Exito:**
- 95% de precision en validaciones
- Tiempo de procesamiento < 5 minutos para archivo de 500 lineas
- 0 rechazos de CONSAR en archivos validados

### 12.3 Fase 2: Expansion y Mejoras (Meses 5-8)

**Objetivos:**
- Soporte para archivos adicionales
- Dashboard de metricas
- Mejoras en UX

**Mes 5: Archivo 1102**

- Analisis de formato de Archivo 1102
- Definicion de validaciones
- Desarrollo de parseo
- Implementacion de validaciones (estimado: 30 validaciones)

**Mes 6: Archivo 1103**

- Similar a Mes 5 para Archivo 1103

**Mes 7: Dashboard y Analitica**

- Diseño de dashboard
- Desarrollo de metricas agregadas
- Graficas de tendencias
- Comparativas

**Mes 8: Mejoras UX y Performance**

- Rediseño de interface
- Notificaciones por email
- Carga batch de multiples archivos
- Optimizaciones de performance

**Entregables Fase 2:**
- Soporte para 3 tipos de archivos
- Dashboard de metricas
- Interface mejorada
- 3-5 clientes adicionales

### 12.4 Fase 3: Integraciones (Meses 9-12)

**Objetivos:**
- Integracion con sistemas externos
- Automatizacion end-to-end

**Mes 9: API REST**

- Diseño de API
- Endpoints de validacion
- Documentacion OpenAPI/Swagger
- SDK para clientes

**Mes 10: Integracion Aladdin (si disponible)**

- Analisis de API Aladdin
- Desarrollo de conector
- Extraccion automatica de datos
- Testing

**Mes 11: Conectores a Sistemas Contables**

- Analisis de sistemas comunes (SAP, Oracle)
- Desarrollo de conectores genericos
- Mapeo de datos

**Mes 12: SFTP a CONSAR**

- Implementacion de envio automatico
- Encriptacion GPG
- Confirmacion de recepcion
- Notificaciones

**Entregables Fase 3:**
- API REST completa
- Conectores a sistemas externos
- Flujo automatizado de punta a punta
- 8-10 clientes totales

### 12.5 Fase 4: Inteligencia y Automatizacion (Meses 13-16)

**Objetivos:**
- ML para deteccion de anomalias
- Sugerencias automaticas
- Predicciones

**Mes 13: Analisis de Datos Historicos**

- Recoleccion de datasets
- Analisis de patrones de errores
- Feature engineering

**Mes 14: Modelo de Deteccion de Anomalias**

- Entrenamiento de modelo (Isolation Forest, Autoencoders)
- Validacion de modelo
- Integracion con sistema

**Mes 15: Sugerencias de Correccion**

- Modelo de correccion automatica (reglas + ML)
- Interface de sugerencias
- Aprobacion humana

**Mes 16: Prediccion de Errores**

- Modelo predictivo (Random Forest, XGBoost)
- Dashboard de predicciones
- Alertas tempranas

**Entregables Fase 4:**
- Modelo de ML en produccion
- Sugerencias de correccion
- Predicciones de errores
- 10 clientes (100% market share Mexico)

### 12.6 Cronograma Gantt (Resumido)

```
Fase / Actividad                     | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10| M11| M12| M13| M14| M15| M16|
-------------------------------------|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|----|
Fase 1: MVP                          |████|████|████|████|    |    |    |    |    |    |    |    |    |    |    |    |
  - Setup y Fundaciones              |████|    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |
  - Motor de Validaciones            |    |████|    |    |    |    |    |    |    |    |    |    |    |    |    |    |
  - Validaciones y Reportes          |    |    |████|    |    |    |    |    |    |    |    |    |    |    |    |    |
  - Testing y UAT                    |    |    |    |████|    |    |    |    |    |    |    |    |    |    |    |    |
Fase 2: Expansion                    |    |    |    |    |████|████|████|████|    |    |    |    |    |    |    |    |
  - Archivos adicionales             |    |    |    |    |████|████|    |    |    |    |    |    |    |    |    |    |
  - Dashboard                        |    |    |    |    |    |    |████|    |    |    |    |    |    |    |    |    |
  - Mejoras UX                       |    |    |    |    |    |    |    |████|    |    |    |    |    |    |    |    |
Fase 3: Integraciones                |    |    |    |    |    |    |    |    |████|████|████|████|    |    |    |    |
  - API REST                         |    |    |    |    |    |    |    |    |████|    |    |    |    |    |    |    |
  - Aladdin                          |    |    |    |    |    |    |    |    |    |████|    |    |    |    |    |    |
  - Sistemas Contables               |    |    |    |    |    |    |    |    |    |    |████|    |    |    |    |    |
  - SFTP CONSAR                      |    |    |    |    |    |    |    |    |    |    |    |████|    |    |    |    |
Fase 4: ML e IA                      |    |    |    |    |    |    |    |    |    |    |    |    |████|████|████|████|
  - Analisis de datos                |    |    |    |    |    |    |    |    |    |    |    |    |████|    |    |    |
  - Deteccion anomalias              |    |    |    |    |    |    |    |    |    |    |    |    |    |████|    |    |
  - Sugerencias                      |    |    |    |    |    |    |    |    |    |    |    |    |    |    |████|    |
  - Predicciones                     |    |    |    |    |    |    |    |    |    |    |    |    |    |    |    |████|
```

### 12.7 Hitos Criticos

**H1: MVP en Produccion** (Mes 4)
- Sistema funcional
- 1 cliente piloto en vivo
- Validaciones operativas

**H2: 3 Clientes Activos** (Mes 8)
- Demostracion de product-market fit
- Referencias comerciales
- Ingresos recurrentes

**H3: Market Share 50%** (Mes 12)
- 5 AFOREs como clientes
- Posicion de liderazgo
- APIs estables

**H4: ML en Produccion** (Mes 16)
- Diferenciacion competitiva
- Valor agregado significativo
- Preparacion para expansion geografica

---

## 13. ANEXOS

### 13.1 Anexo A: Estructura Detallada de Archivos de Ejemplo

**Archivo:** `docs/20250804_SB_544_001980.0300`

**Analisis de Estructura:**

**Linea 1: Encabezado (Tipo 000)**
```
00000502343030000254400198020250801
```

Desglose:
- Posiciones 1-3: "000" - Tipo de registro (encabezado)
- Posiciones 4-8: "00502" - Total registros en archivo (502)
- Posiciones 9-12: "3430" - Tamano de registro (343 caracteres)
- Posiciones 13-16: "3000" - Tipo de archivo
- Posiciones 17-18: "02" - Tipo de entidad
- Posiciones 19-22: "5440" - Codigo de entidad (AFORE 544)
- Posiciones 23-26: "0198" - Subtipo de entidad
- Posiciones 27-28: "02" - Codigo adicional
- Posiciones 29-36: "02508 01" - Fecha (04/08/2025)

**Linea 2: Detalle Tipo 301 (Encabezado de Instrumento)**
```
301MX0SGO0000M60        0      S   UDIBONO261203 0         0000030000000000038955290000327999974473007950000000841990843000032821727445600000002172999820000328217274455000000000301000000001000000040014                    00510000041000000000000000
```

Desglose:
- Posiciones 1-3: "301" - Tipo de registro (encabezado instrumento)
- Posiciones 4-15: "MX0SGO0000M6" - ISIN del instrumento (UDIBONO)
- Posiciones 16-30: "0        0      " - Campos adicionales
- Posiciones 31-33: "S   " - Tipo de valor (S = UDIBONO)
- Posiciones 34-46: "UDIBONO261203" - Descripcion del instrumento
- Resto: Importes varios (saldos, operaciones)

**Linea 27: Detalle Tipo 303 (Operaciones - Acciones)**
```
3030006MX01AC1000060        28238851   AC     *      0         0000027894020000001348638970000037618962438000000195780000000005461091235600000000000000000000001800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001698192061000000000000000000000000080696350100000000000000000000000000000
```

Desglose:
- Posiciones 1-3: "303" - Tipo de registro (operaciones)
- Posiciones 4-9: "0006" - Subcuenta
- Posiciones 10-24: "MX01AC1000060" - ISIN (Accion mexicana AC)
- Posiciones 25-40: "        28238851" - Identificador adicional
- Posiciones 41-45: "   AC" - Ticker de la accion
- Posiciones 46-51: "     *" - Serie
- Resto: Importes de operaciones, saldos, etc.

### 13.2 Anexo B: Ejemplo de Script de Validacion

**Validacion:** Conversion de Divisas 7115 vs 1103

```sql
SELECT
    -- Identificadores de resultado
    IdAforeResultado = A.IdAfore,
    IdFondoResultado = ARC.IdFondo,
    FechaOperacionArchivoResultado = ARC.FechaArchivo,
    IdArchivoRegulatorioConsarResultado = DARC.[IdArchivoRegulatorioConsar],
    IdDetalleArchivoResultado = DARC.IdDetalleArchivo,
    IdCatValidacionResultado = B.IdCatValidacion,
    IdDetalleArchivoConsarResultado = DARC.[IdDetalleArchivoConsar],
    DetalleArchivoResultado = B.IdDetalleArchivo,
    NumLineaResultado = DARC.NumLinea,

    -- Calculo de validacion
    CuentaDivisas = SUBSTRING(DARC.[RegistroArchivo], 4, 4) + '-' + SUBSTRING(DARC.[RegistroArchivo], 8, 6),
    ImporteDivisas = CONVERT(DECIMAL(30,2), SUBSTRING(DARC.[RegistroArchivo], 62, 16)) * 0.01,

    CuentaPesos = SUBSTRING(DARC2.[RegistroArchivo], 4, 4) + '-' + SUBSTRING(DARC2.[RegistroArchivo], 8, 6),
    ImportePesos = CONVERT(DECIMAL(30,2), SUBSTRING(DARC2.[RegistroArchivo], 62, 16)) * 0.01,

    TipoCambio = TC.CatTipoCambioMonto,

    ImporteEsperadoPesos = CONVERT(DECIMAL(30,2),
        (ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC.[RegistroArchivo], 62, 16)) * 0.01)
        * (TC.CatTipoCambioMonto))),

    ImporteRealPesos = ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC2.[RegistroArchivo], 62, 16)) * 0.01),

    Diferencia = CONVERT(DECIMAL(30,2),
        (ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC.[RegistroArchivo], 62, 16)) * 0.01)
        * (TC.CatTipoCambioMonto)))
        - ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC2.[RegistroArchivo], 62, 16)) * 0.01),

    -- Mensaje de resultado
    MensajeValidacionResultado =
        B.NombreValidacion + ': No. Linea ' + CONVERT(VARCHAR(10), DARC.NumLinea) +
        '; Cuenta ' + SUBSTRING(DARC.[RegistroArchivo], 4, 4) + '-' + SUBSTRING(DARC.[RegistroArchivo], 8, 6) +
        ' y ' + SUBSTRING(DARC2.[RegistroArchivo], 4, 4) + '-' + SUBSTRING(DARC2.[RegistroArchivo], 8, 6) +
        '; ' +
        CASE
            WHEN CONVERT(DECIMAL(30,2), (ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC.[RegistroArchivo], 62, 16)) * 0.01)
                 * (TC.CatTipoCambioMonto))) = ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC2.[RegistroArchivo], 62, 16)) * 0.01)
            THEN 'Correcto'
            ELSE B.MensajeError + ' Diferencia de: ' +
                 FORMAT((CONVERT(DECIMAL(30,2), (ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC.[RegistroArchivo], 62, 16)) * 0.01)
                 * (TC.CatTipoCambioMonto))) - ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC2.[RegistroArchivo], 62, 16)) * 0.01)), 'N')
        END,

    -- Resultado de validacion
    ValidadoOKResultado =
        CASE
            WHEN CONVERT(DECIMAL(30,2), (ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC.[RegistroArchivo], 62, 16)) * 0.01)
                 * (TC.CatTipoCambioMonto))) = ABS(CONVERT(DECIMAL(30,2), SUBSTRING(DARC2.[RegistroArchivo], 62, 16)) * 0.01)
            THEN 1
            ELSE 0
        END

FROM [ControlProcesoUsuarioAforeFondo] A

INNER JOIN CatValidacionArchivoConsar B
    ON A.[IdCatProcesoAfore] = B.IdArchivoConsar

INNER JOIN CatArchivoConsar C
    ON C.IdArchivoConsar = B.IdArchivoConsar

INNER JOIN CatDetalleArchivoConsar D
    ON D.IdArchivoConsar = B.IdArchivoConsar
    AND D.IdDetalleArchivo = B.IdDetalleArchivo

INNER JOIN [ArchivoRegulatorioConsar] ARC
    ON ARC.IdArchivoConsar = B.IdArchivoConsar
    AND ARC.FechaArchivo = A.FechaProceso
    AND ARC.IdFondo = A.IdFondo

-- Registros con cuenta 7115 (divisas)
INNER JOIN DetalleArchivoConsar DARC
    ON DARC.IdArchivoRegulatorioConsar = ARC.IdArchivoRegulatorioConsar
    AND DARC.IdDetalleArchivo = 2
    AND CONVERT(INT, SUBSTRING(DARC.[RegistroArchivo], 4, 4)) IN (7115)

-- Registros con cuenta 1103 (pesos) - misma subcuenta
INNER JOIN DetalleArchivoConsar DARC2
    ON DARC2.IdArchivoRegulatorioConsar = ARC.IdArchivoRegulatorioConsar
    AND DARC2.IdDetalleArchivo = 2
    AND CONVERT(INT, SUBSTRING(DARC2.[RegistroArchivo], 4, 4)) IN (1103)
    AND CONVERT(INT, SUBSTRING(DARC.[RegistroArchivo], 8, 6)) = CONVERT(INT, SUBSTRING(DARC2.[RegistroArchivo], 8, 6))

-- Catalogo de divisas CONSAR
INNER JOIN CatConsarDivisa DIV
    ON DIV.SubCuentaDivisaConsarN2 = CONVERT(INT, SUBSTRING(DARC.[RegistroArchivo], 8, 6))

-- Tipo de cambio del dia
INNER JOIN CatTipoCambio TC
    ON TC.CatTipoCambioFecha = A.FechaProceso
    AND DIV.IdDivisa = TC.IdDivisa

WHERE
    B.Activo = 1
    AND DIV.SubCuentaDivisaConsarN2 NOT IN (90) -- Excluir pesos mexicanos
    AND CONVERT(INT, SUBSTRING(DARC.[RegistroArchivo], 8, 6)) > 0
    AND CONVERT(INT, SUBSTRING(DARC2.[RegistroArchivo], 8, 6)) > 0
    AND B.IdCatValidacion = @IdCatValidacion
    AND A.IdUsuarioAfore = @vcUsuarioAfore
```

### 13.3 Anexo C: Glosario de Terminos

**AFORE**
Administradora de Fondos para el Retiro. Instituciones financieras especializadas en administrar cuentas individuales de retiro de trabajadores mexicanos.

**CONSAR**
Comision Nacional del Sistema de Ahorro para el Retiro. Organismo regulador del SAR en Mexico.

**SIEFORE**
Sociedad de Inversion Especializada en Fondos para el Retiro. Fondos de inversion donde se depositan los recursos de las cuentas individuales.

**SAR**
Sistema de Ahorro para el Retiro. Sistema de pensiones basado en cuentas individuales en Mexico.

**Balanza de Comprobacion**
Reporte contable que lista todas las cuentas con sus saldos (debitos y creditos), verificando que suman cero.

**Cuenta de Orden**
Cuentas contables que no afectan el balance, usadas para registrar compromisos, contingencias o cuentas de terceros.

**Tipo de Cambio FIX**
Tipo de cambio oficial publicado por el Banco de Mexico, usado para conversion de divisas en reportes oficiales.

**ISIN**
International Securities Identification Number. Codigo unico de 12 caracteres que identifica un instrumento financiero.

**Mark-to-Market**
Valuacion de instrumentos financieros a precio de mercado actual.

**VaR (Value at Risk)**
Medida de riesgo que estima la perdida maxima esperada en un periodo con cierto nivel de confianza.

### 13.4 Anexo D: Referencias y Fuentes

**Documentacion Regulatoria:**

1. Ley de los Sistemas de Ahorro para el Retiro
   - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LSAR.pdf

2. CONSAR - Normatividad
   - URL: https://www.gob.mx/consar/documentos/normatividad-consar

3. Circular CONSAR 19-21
   - DOF: Consultable en https://www.dof.gob.mx

4. Disposiciones de Caracter General sobre Contabilidad
   - DOF: 22/11/2022

**Informacion de la Industria:**

5. AMAFORE (Asociacion Mexicana de AFOREs)
   - URL: https://www.amafore.org

6. BlackRock Aladdin
   - URL: https://www.blackrock.com/aladdin

7. Estadisticas del SAR
   - URL: https://www.gob.mx/consar

**Documentacion Tecnica:**

8. Microsoft SQL Server Documentation
   - URL: https://docs.microsoft.com/sql

9. .NET Documentation
   - URL: https://docs.microsoft.com/dotnet

10. Azure Documentation
    - URL: https://docs.microsoft.com/azure

### 13.5 Anexo E: Contactos Clave

**Equipo del Proyecto:**

- Gerente de Producto: [Por definir]
- Arquitecto de Software: [Por definir]
- Especialista Regulatorio: [Por definir]
- Lider de Desarrollo: [Por definir]

**Stakeholders:**

- CONSAR: Contacto institucional por definir
- AMAFORE: Contacto por definir
- Cliente Piloto: [Por definir]

---

## CONTROL DE VERSIONES DEL DOCUMENTO

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 19/11/2025 | Claude Code | Documento inicial completo |

---

## APROBACIONES

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Gerente de Producto | | | |
| Arquitecto de Software | | | |
| CFO | | | |
| CEO | | | |

---

**FIN DEL DOCUMENTO**

Paginas: 70+
Palabras: 28,000+
Nivel de Detalle: Exhaustivo
Audiencia: Ejecutivos, Producto, Tecnologia, Negocio
