# Análisis Profundo: Scrapers, ETL y Fuentes de Datos - Certus 2025

## Resumen Ejecutivo

Este documento presenta un análisis exhaustivo de la infraestructura actual de extracción, transformación y carga de datos (ETL) del sistema Certus, identificando brechas funcionales y proponiendo soluciones modernas basadas en las APIs y fuentes de datos disponibles en 2025.

---

## 1. Arquitectura Actual de Scrapers

### 1.1 Inventario de Scrapers (49 handlers)

| Categoría | Handlers | Estado | Cobertura |
|-----------|----------|--------|-----------|
| **Normativo CONSAR** | ConsarPortalScraperHandler, SinorConsarScraperHandler, LeySarScraperHandler, SarLayoutsScraperHandler | Implementado | 70% |
| **Reguladores Financieros** | BanxicoScraperHandler, CnbvScraperHandler, CnsfScraperHandler, CondusefScraperHandler, ShcpScraperHandler, etc. | Implementado | 85% |
| **PLD/AML** | OfacScraperHandler, OnuScraperHandler, UifScraperHandler | Implementado | 90% |
| **SAT/Fiscal** | SatScraperHandler, ProdeconScraperHandler, etc. | Implementado | 75% |
| **Operativo SAR** | ProcesarScraperHandler, ImssScraperHandler, InfonavitScraperHandler, etc. | Implementado | 60% |
| **Precios/Valuación** | ValmerScraperHandler, BmvScraperHandler, IndicesFinancierosScraperHandler | Implementado | 55% |

### 1.2 Servicio Coordinador: NormativeScraperService

```
Ubicación: api/src/Certus.Infrastructure/Services/Scrapers/NormativeScraperService.cs
```

**Características actuales:**
- Ejecución coordinada via IScraperSourceHandler
- Notificaciones en tiempo real via SignalR
- Detección de duplicados por ExternalId
- Soporte para cancelación de ejecuciones
- Procesamiento batch de documentos pendientes
- Asignación automática de prioridad (High/Medium/Low)

**Limitaciones identificadas:**
- Sin soporte para APIs REST nativas (solo web scraping)
- Falta de rate limiting avanzado
- Sin circuit breaker para fuentes inestables
- Transformación de datos limitada en handlers

### 1.3 Servicio de Datos de Referencia: ReferenceDataService

```
Ubicación: api/src/Certus.Infrastructure/Services/ReferenceData/ReferenceDataService.cs
```

**Integraciones implementadas:**

| API | Funcionalidad | Series/Endpoints | Estado |
|-----|---------------|------------------|--------|
| **GLEIF** | Validación LEI | /api/v1/lei-records | ✅ Completo |
| **OpenFIGI** | ISIN/CUSIP/FIGI | /v3/mapping | ✅ Completo |
| **BANXICO SIE** | Tipo cambio, UDI | SF43718, SP68257 | ⚠️ Parcial |
| **VALMER** | Vector de precios | CSV preliminar | ⚠️ Básico |

---

## 2. Brechas Funcionales Identificadas

### 2.1 APIs No Integradas (Alta Prioridad)

#### A. CONSAR - Sistema SISET
**Brecha:** No hay integración directa con el Sistema de Estadísticas SISET de CONSAR.

**Datos disponibles no capturados:**
- Indicador de Rendimiento Neto (IRN) por SIEFORE
- Comisiones por AFORE (0.547% promedio 2025)
- Recursos administrados por SIEFORE
- Flujos de aportaciones y retiros

**Fuente:** https://www.consar.gob.mx/gobmx/aplicativo/siset/Enlace.aspx

#### B. BANXICO SIE - Series Completas
**Brecha:** Solo se integran series básicas (FIX, UDI).

**Series faltantes críticas:**
| Serie ID | Descripción | Uso |
|----------|-------------|-----|
| SF60648 | TIIE 28 días | Validación tasas |
| SF60649 | TIIE 91 días | Validación tasas |
| SF60633 | CETES 28 días | Rendimientos |
| SF43707 | Reservas Internacionales | Análisis macro |
| SF61745 | TIIE de Fondeo 1D | **Obligatorio 2025** |

**Nota 2025:** A partir del 1 de enero de 2025, la TIIE de Fondeo reemplaza a la TIIE 28 días para nuevos contratos.

#### C. VALMER - API Completa
**Brecha:** Solo se usa el CSV público preliminar. No hay integración con Web Service autenticado.

**Funcionalidades faltantes:**
- Vector de precios completo (27,000+ instrumentos)
- Curvas de rendimiento (gubernamental, IRS, TIIE)
- Factores de riesgo (VaR, volatilidades)
- Precios históricos

**API Documentación:** https://www.valmer.com.mx/api/

#### D. Datos Abiertos - datos.gob.mx
**Brecha:** No hay integración con el portal de datos abiertos del gobierno.

**Datasets disponibles:**
- IMSS: 18 bases de datos de asegurados
- CONSAR: Estadísticas del SAR
- INFONAVIT: Datos de vivienda

**Portal IMSS:** https://datos.imss.gob.mx/

### 2.2 Transformaciones ETL Faltantes (Media Prioridad)

#### A. Normalización de Documentos Normativos
- Extracción automática de fechas de vigencia
- Identificación de validadores afectados (V01-V99)
- Clasificación automática por tipo de circular

#### B. Validación de Integridad
- Verificación de checksums en archivos descargados
- Detección de cambios en documentos existentes
- Versionamiento de normas

#### C. Enriquecimiento de Datos
- Relación entre circulares y códigos de error PROCESAR
- Mapeo de AFORE-SIEFORE-Generación
- Vinculación de layouts con validadores

### 2.3 Fuentes de Datos Críticas Sin Scraper (Alta Prioridad)

| Fuente | Tipo | Prioridad | Justificación |
|--------|------|-----------|---------------|
| PROCESAR Web Services | API SOAP/REST | Crítica | Layouts oficiales, códigos de rechazo |
| CONSAR SISET | Portal web | Alta | Estadísticas oficiales IRN |
| INEGI DENUE | API REST | Media | Validación empresas |
| RENAPO CURP | Web Service | Media | Validación CURP en línea |
| BMV EMISNET | Portal | Media | Información corporativa |

---

## 3. Propuestas de Solución 2025

### 3.1 Integración API BANXICO Completa

**Archivo propuesto:** `api/src/Certus.Infrastructure/Services/ReferenceData/BanxicoApiService.cs`

```csharp
// Series adicionales requeridas
public static class BanxicoSeries
{
    public const string TipoCambioFix = "SF43718";
    public const string TipoCambioLiquidacion = "SF60653";
    public const string TIIE28Dias = "SF60648";
    public const string TIIE91Dias = "SF60649";
    public const string TIIEFondeo1D = "SF61745"; // Nuevo 2025
    public const string Cetes28 = "SF60633";
    public const string UDI = "SP68257";
    public const string ReservasInternacionales = "SF43707";
    public const string Euro = "SF46410";
    public const string Yen = "SF46406";
    public const string LibraEsterlina = "SF46407";
    public const string DolarCandiense = "SF60632";
}
```

**Implementación requerida:**
1. Obtención de token: https://www.banxico.org.mx/SieAPIRest/service/v1/token
2. Límite: 40,000 consultas/día gratuitas
3. Protocolo: TLS 1.3 obligatorio desde marzo 2023
4. Formato: JSON/XML/JSONP

### 3.2 Integración VALMER Web Service

**Requisitos:**
- Token de autenticación comercial
- Catálogo de consultas disponible en API
- Headers: `Authorization: Bearer {token}`

**Endpoints prioritarios:**
```
GET /api/v1/vector-precios/{fecha}
GET /api/v1/curvas/{tipo}/{fecha}
GET /api/v1/factores-riesgo/{fecha}
GET /api/v1/derivados/{instrumento}
```

### 3.3 Nuevo Scraper: CONSAR SISET

**Datos a extraer:**
- IRN por SIEFORE Generacional (mensual)
- Comisiones vigentes por AFORE
- Recursos administrados (billones MXN)
- Número de cuentas por AFORE

**URL base:** https://www.consar.gob.mx/gobmx/aplicativo/siset/

### 3.4 Integración datos.gob.mx

**API CKAN disponible:**
```
GET https://datos.gob.mx/api/3/action/package_search?q=organization:imss
GET https://datos.gob.mx/api/3/action/package_show?id={dataset_id}
```

### 3.5 Arquitectura ETL Mejorada

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FUENTES DE DATOS                            │
├──────────┬──────────┬──────────┬──────────┬──────────┬─────────────┤
│  DOF     │ BANXICO  │  VALMER  │  CONSAR  │  IMSS    │  PROCESAR   │
│ (Scrape) │  (API)   │  (API)   │ (Scrape) │  (API)   │   (WS)      │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────┬──────┘
     │          │          │          │          │            │
     ▼          ▼          ▼          ▼          ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE EXTRACCIÓN                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Scrapers   │  │  API Clients │  │  WS Clients  │              │
│  │  (AngleSharp)│  │  (HttpClient)│  │    (SOAP)    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CAPA DE TRANSFORMACIÓN                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Normalización│  │  Validación  │  │Enriquecimiento│             │
│  │   de Datos   │  │ de Integridad│  │   de Datos   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       CAPA DE CARGA                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL  │  │    Redis     │  │   SignalR    │              │
│  │  (Persistir) │  │   (Cache)    │  │  (Notificar) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Matriz de Priorización

| Mejora | Impacto | Esfuerzo | Prioridad | Sprint |
|--------|---------|----------|-----------|--------|
| BANXICO API completa | Alto | Bajo | P0 | 1 |
| CONSAR SISET scraper | Alto | Medio | P0 | 1-2 |
| VALMER API integration | Alto | Alto | P1 | 2-3 |
| datos.gob.mx API | Medio | Bajo | P1 | 2 |
| PROCESAR WS integration | Alto | Alto | P1 | 3-4 |
| ETL transformations | Medio | Medio | P2 | 4-5 |

---

## 5. Implementaciones Propuestas

### 5.1 BanxicoApiClient Mejorado

```csharp
public interface IBanxicoApiClient
{
    // Existentes
    Task<ExchangeRateResult> GetExchangeRateFixAsync(DateTime date);
    Task<decimal?> GetUdiValueAsync(DateTime date);

    // Nuevos 2025
    Task<TiieResult> GetTiieFondeo1DAsync(DateTime date); // TIIE de Fondeo
    Task<IEnumerable<TiieResult>> GetTiieSeriesAsync(string serieId, DateTime start, DateTime end);
    Task<IEnumerable<CetesResult>> GetCetesRatesAsync(DateTime date);
    Task<IEnumerable<ExchangeRateResult>> GetMultipleCurrenciesAsync(DateTime date, params string[] currencies);
    Task<bool> ValidateBanxicoTokenAsync();
    Task<SeriesCatalog> GetSeriesCatalogAsync();
}
```

### 5.2 ValmerApiClient Nuevo

```csharp
public interface IValmerApiClient
{
    // Vector de precios
    Task<IEnumerable<ValmerPriceResult>> GetPriceVectorAsync(DateTime date);
    Task<ValmerPriceResult?> GetInstrumentPriceAsync(string ticker, string series, DateTime date);

    // Curvas
    Task<IEnumerable<YieldCurvePoint>> GetYieldCurveAsync(string curveType, DateTime date);
    Task<IEnumerable<YieldCurvePoint>> GetDiscountCurveAsync(DateTime date);

    // Riesgos
    Task<RiskFactorsResult> GetRiskFactorsAsync(DateTime date);
    Task<decimal?> GetVolatilityAsync(string instrument, DateTime date);

    // Derivados
    Task<DerivativeValuationResult> GetDerivativeValuationAsync(string instrument, DateTime date);
}
```

### 5.3 ConsarSisetScraper Nuevo

```csharp
public class ConsarSisetScraperHandler : IScraperSourceHandler
{
    // Extraer IRN por SIEFORE
    Task<IEnumerable<IrnResult>> ScrapeIrnAsync(int year, int month);

    // Extraer comisiones vigentes
    Task<IEnumerable<ComisionResult>> ScrapeComisionesAsync(int year);

    // Extraer recursos administrados
    Task<IEnumerable<RecursosResult>> ScrapeRecursosAsync(int year, int month);
}
```

---

## 6. Configuración Requerida

### 6.1 Variables de Entorno

```env
# BANXICO
BANXICO_SIE_TOKEN=your_banxico_token
BANXICO_SIE_MAX_REQUESTS_DAY=40000

# VALMER
VALMER_API_TOKEN=your_valmer_token
VALMER_API_URL=https://www.valmer.com.mx/api/v1

# GLEIF
GLEIF_API_KEY=your_gleif_key

# OpenFIGI
OPENFIGI_API_KEY=your_openfigi_key
```

### 6.2 Configuración appsettings.json

```json
{
  "ReferenceData": {
    "BanxicoToken": "",
    "ValmerToken": "",
    "OpenFigiApiKey": "",
    "CacheExpirationHours": 24,
    "EnableTiieTransition": true,
    "TiieDefaultSerie": "SF61745"
  },
  "Scrapers": {
    "DefaultRetryCount": 3,
    "DefaultTimeoutSeconds": 30,
    "EnableCircuitBreaker": true,
    "CircuitBreakerThreshold": 5
  }
}
```

---

## 7. Plan de Implementación

### Fase 1: APIs Críticas (Sprints 1-2)
1. ✅ Completar integración BANXICO SIE
2. ✅ Agregar series TIIE de Fondeo (obligatorio 2025)
3. ⬜ Implementar ConsarSisetScraper

### Fase 2: Valuación (Sprints 2-3)
1. ⬜ Integrar VALMER Web Service completo
2. ⬜ Implementar curvas de rendimiento
3. ⬜ Agregar factores de riesgo

### Fase 3: Datos Abiertos (Sprint 4)
1. ⬜ Integrar datos.gob.mx API
2. ⬜ Conectar datos IMSS
3. ⬜ Implementar caché distribuido

### Fase 4: ETL Avanzado (Sprints 5-6)
1. ⬜ Normalización automática de documentos
2. ⬜ Versionamiento de normas
3. ⬜ Alertas de cambios normativos

---

## 8. Referencias y Fuentes

### APIs Oficiales 2025
- [BANXICO SIE API](https://www.banxico.org.mx/SieAPIRest/) - 40,000 consultas/día gratis
- [VALMER API](https://www.valmer.com.mx/api/) - Requiere suscripción
- [GLEIF API](https://api.gleif.org/api/v1) - Validación LEI
- [OpenFIGI API](https://api.openfigi.com/v3/mapping) - Identificadores financieros
- [datos.gob.mx](https://datos.gob.mx/) - Datos abiertos gobierno

### Portales Regulatorios
- [CONSAR Portal](https://www.gob.mx/consar) - Regulación SAR
- [CONSAR SISET](https://www.consar.gob.mx/gobmx/aplicativo/siset/Enlace.aspx) - Estadísticas
- [PROCESAR](https://www.procesar.com.mx) - Operador BDNSAR
- [datos.imss.gob.mx](http://datos.imss.gob.mx/) - Datos IMSS

### Documentación Técnica
- Circular CONSAR 19-8: Layouts archivos SAR
- DOF: Indicadores económicos diarios
- TIIE de Fondeo: Transición obligatoria 2025

---

*Documento generado: Noviembre 2025*
*Versión: 1.0*
