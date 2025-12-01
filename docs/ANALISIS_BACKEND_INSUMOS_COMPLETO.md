# Análisis Completo del Backend - Hergon Certus
## Mapeo de Insumos de Información vs Implementación Actual

**Fecha de análisis:** 2025-11-26
**Versión:** 1.0

---

## Resumen Ejecutivo

El proyecto Hergon Certus tiene una arquitectura sólida de .NET 8 con 13 scrapers implementados de 22 fuentes definidas. Sin embargo, existe una brecha significativa entre los **38 insumos requeridos** y la implementación actual.

### Estado General

| Categoría | Implementado | Faltante | Cobertura |
|-----------|--------------|----------|-----------|
| Scrapers Normativos | 4/4 | 0 | 100% |
| Scrapers Regulatorios | 5/8 | 3 | 62.5% |
| Scrapers PLD | 3/3 | 0 | 100% |
| Catálogos/Datos | 1/7 | 6 | 14% |
| Parser Archivos CONSAR | 6/15+ | 9+ | ~40% |
| Integración APIs Tiempo Real | 0/3 | 3 | 0% |

---

## 1. Scrapers Implementados (13 de 22)

### 1.1 Fuentes Normativas CONSAR (4/4 - 100%)

| Fuente | Archivo | Líneas | Estado | Descripción |
|--------|---------|--------|--------|-------------|
| **DOF** | `DofScraperHandler.cs` | 397 | ✅ Completo | Diario Oficial de la Federación |
| **SIDOF** | `SidofScraperHandler.cs` | 845 | ✅ Completo | Sistema de Información DOF (API AJAX + HTML) |
| **SINOR** | `SinorConsarScraperHandler.cs` | 324 | ✅ Completo | API oficial CONSAR normatividad |
| **GobMxConsar** | `GobMxScraperHandler.cs` | 392 | ✅ Completo | Portal gob.mx CONSAR |

### 1.2 Fuentes Regulatorias (5/8 - 62.5%)

| Fuente | Archivo | Líneas | Estado | Descripción |
|--------|---------|--------|--------|-------------|
| **CNBV** | `CnbvScraperHandler.cs` | 317 | ✅ Completo | Criterios contables AFORE/SIEFORE |
| **SHCP** | `ShcpScraperHandler.cs` | 305 | ✅ Completo | Normativa financiera |
| **BANXICO** | `BanxicoScraperHandler.cs` | 251 | ✅ Completo | Catálogos IFs, calendarios |
| **SAT** | `SatScraperHandler.cs` | 262 | ✅ Completo | Lista 69B, RFC |
| **SEPOMEX** | `SepomexScraperHandler.cs` | 190 | ✅ Completo | Códigos postales |
| **RENAPO** | - | - | ❌ Solo enum | Validación CURP |
| **IMSS** | - | - | ❌ Solo enum | Validación NSS |
| **INFONAVIT** | - | - | ❌ Solo enum | Aportaciones |

### 1.3 Fuentes PLD (3/3 - 100%)

| Fuente | Archivo | Líneas | Estado | Descripción |
|--------|---------|--------|--------|-------------|
| **OFAC** | `OfacScraperHandler.cs` | 193 | ✅ Completo | Lista SDN USA |
| **UIF** | `UifScraperHandler.cs` | 284 | ✅ Completo | Personas bloqueadas MX |
| **ONU** | `OnuScraperHandler.cs` | 195 | ✅ Completo | Sanciones ONU |

---

## 2. Scrapers Faltantes (9 Críticos)

### 2.1 Con Enum Definido pero Sin Handler

```csharp
// En ScraperEnums.cs están definidos pero NO tienen handler:
RENAPO = 14,     // ❌ Sin implementación
IMSS = 15,       // ❌ Sin implementación
INFONAVIT = 16,  // ❌ Sin implementación
INEGI = 17,      // ❌ Sin implementación
SPEI = 19,       // ❌ Sin implementación
RssFeed = 5,     // ❌ Sin implementación
Custom = 99      // ❌ Sin implementación
```

### 2.2 Sin Enum ni Handler (Nuevos Requeridos)

| Fuente | Prioridad | Tipo Insumo | Formato | Frecuencia |
|--------|-----------|-------------|---------|------------|
| **CONSAR Portal** | ALTA | Layouts XSD/ZIP | ZIP/XSD | Mensual |
| **CONSAR SIAFORE** | ALTA | Catálogos SAR | CSV/HTML | Semanal |
| **VALMER/PIP** | ALTA | Curvas valuación | XLS/CSV | Diaria |
| **BMV/BIVA** | ALTA | Precios mercado | HTML/CSV | Diaria |
| **SINDO/SAR** | ALTA | Histórico SAR | JSON/CSV | Semanal |

---

## 3. Parser de Archivos CONSAR - Estado Actual

### 3.1 Tipos de Archivo Implementados (6)

```csharp
// En FileType.cs:
public enum FileType
{
    Nomina = 0,           // ✅ Parser implementado
    Contable = 1,         // ✅ Parser implementado
    Regularizacion = 2,   // ✅ Parser implementado
    Retiros = 3,          // ✅ Parser implementado
    Traspasos = 4,        // ✅ Parser implementado
    Aportaciones = 5,     // ✅ Parser implementado
    Otro = 99             // ⚠️ Sin parser específico
}
```

### 3.2 Archivos Ejemplo Analizados

De la carpeta `/archivos/`:

| Archivo | Tipo | Registros | Parser |
|---------|------|-----------|--------|
| `20251127_PS_430_000010.0300` | Cartera SIEFORE | ~1000+ | ❌ NO HAY |
| `20251127_PS_430_000010.0314` | Derivados (FWD, SWP) | ~100+ | ❌ NO HAY |
| `20251127_PS_430_000010.0317` | Control/Sumario | 1 | ❌ NO HAY |
| `20251127_PS_430_000010.0321` | Valuación BMRPREV | 14 | ❌ NO HAY |
| `20251127_PS_430_000010.1101` | Otro tipo | ? | ❌ NO HAY |
| `20251127_SB_530_001000.0300` | Cartera Subcuenta | ~1000+ | ❌ NO HAY |

### 3.3 Estructura de Archivos Detectada

**Nomenclatura:** `YYYYMMDD_TT_CCC_SSSSSS.EEEE`
- `YYYYMMDD` - Fecha del archivo
- `TT` - Tipo (PS=Procesar SIEFORE, SB=Subcuenta Básica)
- `CCC` - Código AFORE (430, 530, etc.)
- `SSSSSS` - Identificador SIEFORE/subcuenta
- `EEEE` - Extensión/tipo de layout

**Layout .0300 (Cartera SIEFORE):**
```
Encabezado (línea 1): 00000314343030000443000001020251126...
- Pos 1-5: Número de registros
- Pos 6-15: Tipo layout (343 = 0300)
- Pos 16-18: Código AFORE
- ...

Detalle (línea 2+): 301MXBIGO000X350...
- Pos 1-3: Tipo registro (301=RV, 302=Derivados, 303=Acciones)
- Pos 4-20: ISIN/Clave instrumento
- Pos 21-30: Subclave
- Pos 31-36: Tipo instrumento (BI=CETES, M=BONOS, etc.)
- ...
```

**Layout .0314 (Derivados):**
```
Encabezado: 00000175738031400443000001020251126...
Detalle: 3010... (Forwards, Futuros, Swaps)
- Pos 1-4: Tipo registro (3010=Forward, 3020=Futuro, 3040=Swap)
- Pos 5-30: Identificador operación
- ...
```

---

## 4. Mapeo Completo: 38 Insumos vs Implementación

### 4.1 Insumos con Scraper/Integración ✅

| # | Origen | Tipo Insumo | Estado | Handler |
|---|--------|-------------|--------|---------|
| 1 | DOF | Normatividad | ✅ | `DofScraperHandler` |
| 2 | DOF | DCG y lineamientos | ✅ | `DofScraperHandler` |
| 3 | GobMxConsar | Normatividad técnica | ✅ | `GobMxScraperHandler` |
| 4 | GobMxConsar | Manuales SAR | ✅ | `GobMxScraperHandler` |
| 5 | SIDOF | Disposiciones | ✅ | `SidofScraperHandler` |
| 6 | SIDOF | Resoluciones | ✅ | `SidofScraperHandler` |
| 7 | SINOR | Normas CONSAR | ✅ | `SinorConsarScraperHandler` |
| 8 | SINOR | Histórico | ✅ | `SinorConsarScraperHandler` |
| 9 | CNBV | Criterios contables | ✅ | `CnbvScraperHandler` |
| 10 | CNBV | Plantillas R04/R08 | ✅ | `CnbvScraperHandler` |
| 11 | SHCP | Normativa financiera | ✅ | `ShcpScraperHandler` |
| 12 | BANXICO | Calendarios | ✅ | `BanxicoScraperHandler` |
| 13 | BANXICO | Catálogo IFs | ✅ | `BanxicoScraperHandler` |
| 14 | SAT | Lista 69B | ✅ | `SatScraperHandler` |
| 15 | SAT | Catálogo RFC | ✅ | `SatScraperHandler` |
| 16 | SEPOMEX | Códigos postales | ✅ | `SepomexScraperHandler` |
| 17 | OFAC | Lista sanciones | ✅ | `OfacScraperHandler` |
| 18 | UIF | Personas bloqueadas | ✅ | `UifScraperHandler` |
| 19 | ONU | Sanciones ONU | ✅ | `OnuScraperHandler` |

### 4.2 Insumos SIN Scraper/Integración ❌

| # | Origen | Tipo Insumo | Formato | Frecuencia | Prioridad | Complejidad |
|---|--------|-------------|---------|------------|-----------|-------------|
| 20 | **CONSAR Portal** | Comunicados | PDF/HTML | Diaria | ALTA | Media |
| 21 | **CONSAR Portal** | Layouts XSD/ZIP | ZIP/PDF | Mensual | ALTA | Alta |
| 22 | **CONSAR Portal** | Esquemas XSD | XSD | Mensual | ALTA | Media |
| 23 | **CONSAR SIAFORE** | Catálogos SAR | CSV/HTML | Semanal | ALTA | Alta |
| 24 | **CONSAR SIAFORE** | Histórico layouts | CSV/XML | Mensual | ALTA | Alta |
| 25 | **RENAPO** | Validación CURP | JSON/PDF | Eventual | ALTA | Media |
| 26 | **IMSS** | Validación NSS | PDF | Eventual | MEDIA | Baja |
| 27 | **INFONAVIT** | Aportaciones | PDF | Mensual | MEDIA | Baja |
| 28 | **INEGI** | Catálogo geografía | CSV | Mensual | BAJA | Baja |
| 29 | **SPEI/BANXICO** | CLABE específico | CSV/XLS | Semanal | ALTA | Media |
| 30 | **VALMER/PIP** | Curvas rendimiento | XLS/CSV | Diaria | ALTA | Alta |
| 31 | **BMV/BIVA** | Precios mercado | HTML/CSV | Diaria | ALTA | Alta |
| 32 | **SINDO/SAR** | Histórico SAR | JSON/CSV | Semanal | ALTA | Alta |
| 33 | **SAT** | CFDI (tiempo real) | JSON | Real-time | ALTA | MUY Alta |
| 34 | **SHCP/PLD** | Lineamientos AML/KYC | PDF | Mensual | ALTA | Baja |
| 35 | **AFORE Interno** | Historial contable | JSON/CSV | Diaria | ALTA | Media* |
| 36 | **AFORE Interno** | Aportaciones | JSON/CSV | Diaria | ALTA | Media* |
| 37 | **AFORE Interno** | Metadatos (hash) | JSON | Real-time | ALTA | Alta* |
| 38 | **SIAFORE** | XSD/Layouts R1..R200+ | XML/XSD | Mensual | ALTA | MUY Alta |

\* Los insumos "AFORE Interno" no son scrapers sino integraciones con sistemas internos de la AFORE cliente.

---

## 5. Parser de Archivos - Layouts Faltantes

### 5.1 Layouts SIEFORE (Cartera) - CRÍTICO

| Layout | Descripción | Registros | Complejidad |
|--------|-------------|-----------|-------------|
| `.0300` | Cartera de inversiones | 301, 302, 303, 304, 305 | MUY ALTA |
| `.0301` | Posición individual | - | ALTA |
| `.0314` | Derivados (FWD, FUT, SWP, OPT) | 3010, 3020, 3040 | MUY ALTA |
| `.0317` | Control/sumario | Header only | BAJA |
| `.0321` | Valuación BMRPREV | 301 | MEDIA |
| `.1101` | Otros reportes | Variable | ALTA |

### 5.2 Tipos de Registro Detectados en .0300

```
301 - Renta Variable Nacional
302 - Instrumentos de Deuda
303 - Acciones
304 - Derivados (referencia)
305 - ETFs/Trackers
3010 - Forward (en .0314)
3020 - Futuro (en .0314)
3040 - Swap (en .0314)
```

### 5.3 Campos Críticos para Validación

De los archivos ejemplo, se identificaron campos críticos:

**Instrumentos (.0300):**
- ISIN/Clave emisora
- Tipo instrumento (BI, M, S, EF, etc.)
- Fecha vencimiento
- Valor nominal
- Precio valuación
- Contraparte

**Derivados (.0314):**
- LEI contraparte
- Monto nocional
- Fecha inicio/vencimiento
- Tipo derivado
- Subyacente
- Precio pactado

---

## 6. Gaps Críticos Identificados

### 6.1 Gap 1: Parser Archivos SIEFORE
**Impacto:** CRÍTICO
**Descripción:** Los archivos ejemplo (.0300, .0314) no tienen parser implementado
**Acción:** Implementar parsers para layouts de cartera SIEFORE

### 6.2 Gap 2: Scraper CONSAR Portal/SIAFORE
**Impacto:** CRÍTICO
**Descripción:** No hay scraper para obtener layouts XSD actualizados
**Acción:** Implementar scraper para descargar especificaciones CONSAR

### 6.3 Gap 3: Validación CURP/NSS
**Impacto:** ALTO
**Descripción:** RENAPO e IMSS tienen enum pero no handler
**Acción:** Implementar scrapers/APIs para validación de identidad

### 6.4 Gap 4: Datos de Mercado
**Impacto:** ALTO
**Descripción:** Sin integración VALMER/PIP/BMV para valuación
**Acción:** Implementar scrapers o integraciones API

### 6.5 Gap 5: CFDI Tiempo Real
**Impacto:** ALTO
**Descripción:** Validación de CFDI requiere API SAT
**Acción:** Implementar cliente API SAT para validación UUID

---

## 7. Plan de Implementación Recomendado

### Fase 1: Parsers Archivos SIEFORE (Semana 1-2)
1. Parser .0300 (Cartera inversiones)
2. Parser .0314 (Derivados)
3. Parser .0321 (Valuación BMRPREV)
4. Parser .0317 (Control)
5. Agregar FileTypes al enum

### Fase 2: Scrapers Faltantes Críticos (Semana 3-4)
1. `ConsarPortalScraperHandler` - Layouts XSD/ZIP
2. `SiaforesScraperHandler` - Catálogos SAR
3. `RenapoScraperHandler` - Validación CURP (API)
4. `SpeiScraperHandler` - Catálogo CLABE específico

### Fase 3: Datos de Mercado (Semana 5-6)
1. `ValmerScraperHandler` - Curvas de rendimiento
2. `BmvBivaScraperHandler` - Precios de mercado
3. Integración API tiempo real

### Fase 4: Integraciones API (Semana 7-8)
1. API SAT CFDI - Validación UUID
2. API RENAPO - Validación CURP
3. API IMSS - Validación NSS (si disponible)

### Fase 5: Integraciones AFORE (Según cliente)
1. API AFORE Interna - Historial contable
2. API AFORE Interna - Operaciones
3. Sistema de hash/firmas

---

## 8. Estructura de Archivos del Backend

```
api/
├── src/
│   ├── Certus.Api/
│   │   ├── Controllers/
│   │   │   ├── ScrapersController.cs
│   │   │   ├── ValidationsController.cs
│   │   │   ├── CatalogsController.cs
│   │   │   └── ...
│   │   └── Hubs/
│   │       ├── ScraperHub.cs (SignalR)
│   │       └── ValidationHub.cs
│   │
│   ├── Certus.Application/
│   │   ├── Common/Interfaces/
│   │   │   ├── INormativeScraperService.cs
│   │   │   └── IScraperNotificationService.cs
│   │   └── Features/
│   │       └── Validations/ (Commands, Queries)
│   │
│   ├── Certus.Domain/
│   │   ├── Entities/
│   │   │   ├── ScraperSource.cs
│   │   │   ├── ScrapedDocument.cs
│   │   │   └── Validation.cs
│   │   ├── Enums/
│   │   │   ├── ScraperEnums.cs (22 tipos definidos)
│   │   │   └── FileType.cs (6 tipos implementados)
│   │   └── ValueObjects/
│   │       ├── Curp.cs ✅
│   │       ├── Nss.cs ✅
│   │       ├── Rfc.cs ✅
│   │       └── ...
│   │
│   └── Certus.Infrastructure/
│       ├── Services/
│       │   ├── Scrapers/ (13 handlers)
│       │   │   ├── DofScraperHandler.cs
│       │   │   ├── SidofScraperHandler.cs
│       │   │   ├── ...
│       │   │   └── NormativeScraperService.cs
│       │   └── FileValidation/
│       │       ├── ConsarFileParser.cs (6 tipos)
│       │       └── ConsarFileValidationService.cs
│       └── Data/
│           └── Repositories/
```

---

## 9. Resumen de Cobertura

| Categoría | Total Requerido | Implementado | Faltante | % |
|-----------|-----------------|--------------|----------|---|
| Scrapers Normativos | 8 | 8 | 0 | 100% |
| Scrapers Regulatorios | 12 | 7 | 5 | 58% |
| Scrapers PLD | 3 | 3 | 0 | 100% |
| Scrapers Mercado | 2 | 0 | 2 | 0% |
| Parser Archivos | 15+ | 6 | 9+ | ~40% |
| APIs Tiempo Real | 3 | 0 | 3 | 0% |
| **TOTAL** | **43+** | **24** | **19+** | **~56%** |

---

## 10. Conclusiones

### Fortalezas Actuales:
- Arquitectura de scrapers bien diseñada y extensible
- Cobertura completa de fuentes normativas (DOF, SIDOF, SINOR)
- Cobertura completa de listas PLD (OFAC, UIF, ONU)
- Value Objects para validación (CURP, NSS, RFC)
- SignalR implementado para tiempo real

### Debilidades Críticas:
- Parser de archivos SIEFORE incompleto (.0300, .0314)
- Sin integración de datos de mercado (VALMER, BMV)
- Sin validación CFDI en tiempo real
- Sin scraper para layouts XSD actualizados

### Prioridad Inmediata:
1. **Parsers .0300 y .0314** - Sin esto no se pueden validar archivos de cartera
2. **Scraper CONSAR Portal** - Necesario para mantener layouts actualizados
3. **Integración VALMER** - Necesario para validar valuaciones

---

*Documento generado automáticamente - Claude Code Analysis*
