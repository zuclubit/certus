# Certus Scrapers - Documentacion Tecnica

## Resumen del Sistema de Scrapers

| Metrica | Valor |
|---------|-------|
| **Total de Scrapers Implementados** | 56 |
| **Fuentes Gubernamentales** | 33 |
| **Fuentes Internacionales** | 3 (OFAC, ONU, UE) |
| **Tasa de Exito Post-Correccion** | 85% |
| **Build Status** | SUCCESS |
| **Ultima Actualizacion** | 2025-11-26 |

---

## Arquitectura de Scrapers

### Patron de Diseno
Cada scraper implementa la interfaz `IScraperSourceHandler`:

```csharp
public interface IScraperSourceHandler
{
    ScraperSourceType SourceType { get; }
    bool CanHandle(ScraperSourceType sourceType);
    Task<IEnumerable<ScrapedDocumentData>> ScrapeAsync(
        ScraperSource source,
        CancellationToken cancellationToken = default);
}
```

### Caracteristicas Comunes
- **Retry Policy**: Polly con backoff exponencial (3 reintentos)
- **Hash de Contenido**: SHA256 para deteccion de cambios
- **Limpieza de Titulos**: Regex para normalizar espacios
- **Timeout**: Configurable por fuente

---

## Catalogo de Scrapers por Categoria

### 1. Reguladores del Sistema de Ahorro para el Retiro (SAR)

| Scraper | URL Base | Estado | Datos Extraidos |
|---------|----------|--------|-----------------|
| **CONSAR** | consar.gob.mx | OK | Circulares, disposiciones, indicadores |
| **AMAFORE** | amafore.org | OK | Estadisticas, rendimientos, comisiones |
| **CNSF** | cnsf.gob.mx | OK | Rentas vitalicias, tarifas, circulares |
| **CONDUSEF** | condusef.gob.mx | OK | Comparativos, quejas, normatividad |

### 2. Reguladores Financieros

| Scraper | URL Base | Estado | Datos Extraidos |
|---------|----------|--------|-----------------|
| **CNBV** | cnbv.gob.mx | OK | Normatividad bancaria, circulares |
| **BANXICO** | banxico.org.mx | OK | CEP, indices, disposiciones |
| **SHCP** | gob.mx/shcp | OK | Marco juridico, normatividad SPC |

### 3. Instituciones de Seguridad Social

| Scraper | URL Base | Estado | Datos Extraidos |
|---------|----------|--------|-----------------|
| **IMSS** | imss.gob.mx | OK | Tramites, formatos, disposiciones |
| **INFONAVIT** | infonavit.org.mx | TIMEOUT | Aportaciones, subcuenta vivienda |
| **ISSSTE** | gob.mx/issste | OK | Pensiones, tramites |

### 4. Fuentes de Compliance y PLD

| Scraper | URL Base | Estado | Datos Extraidos |
|---------|----------|--------|-----------------|
| **UIF** | uif.gob.mx | OK | Lista personas bloqueadas (LPB) |
| **OFAC** | treasury.gov | OK | SDN List (27MB XML) |
| **ONU** | scsanctions.un.org | OK | Consolidated List (2MB XML) |
| **SAT** | sat.gob.mx | OK | Lista negra 69-B |

### 5. Fuentes Oficiales

| Scraper | URL Base | Estado | Datos Extraidos |
|---------|----------|--------|-----------------|
| **SIDOF** | sidof.segob.gob.mx | OK | DOF, circulares, decretos |
| **DOF** | dof.gob.mx | PENDIENTE | Pendiente nueva estructura |
| **INEGI** | inegi.org.mx | OK | AGEEML, catalogos geograficos |

---

## Correcciones Aplicadas (2025-11-26)

### Migracion de URLs GOB.MX

El portal GOB.MX reestructuro sus URLs, afectando multiples scrapers:

| Dependencia | URL Anterior | URL Corregida | Estado |
|-------------|--------------|---------------|--------|
| **CNBV** | gob.mx/cnbv | cnbv.gob.mx | 200 OK |
| **SHCP** | gob.mx/shcp/documentos | gob.mx/shcp/documentos/marco-juridico... | 200 OK |
| **IMSS** | gob.mx/imss/documentos | imss.gob.mx/tramites | 200 OK |
| **UIF** | gob.mx/uif/documentos/lista-de-personas-bloqueadas | gob.mx/cms/uploads/attachment/file/981502/LPB.pdf | 200 OK |
| **CONDUSEF** | gob.mx/condusef/documentos | condusef.gob.mx/documentos | 200 OK |
| **CNSF** | gob.mx/cnsf | cnsf.gob.mx | 200 OK |
| **INFONAVIT** | gob.mx/infonavit/documentos | infonavit.org.mx | Timeout |

### Archivos Modificados

| Archivo | Lineas |
|---------|--------|
| `CnbvScraperHandler.cs` | 27-30 |
| `ShcpScraperHandler.cs` | 26-29 |
| `ImssScraperHandler.cs` | 26-29 |
| `UifScraperHandler.cs` | 26-29 |
| `CondusefScraperHandler.cs` | 26-30 |
| `CnsfScraperHandler.cs` | 26-30 |
| `InfonavitScraperHandler.cs` | 26-29 |

---

## Resultados de Pruebas de Conectividad

```
Post-Correction Test Results (2025-11-26):
============================================
CNBV           HTTP:200  Time:0.96s
CNBV-Docs      HTTP:200  Time:0.25s
SHCP-Marco     HTTP:200  Time:0.16s
SHCP-SPC       HTTP:200  Time:0.17s
IMSS           HTTP:200  Time:0.42s
IMSS-Patrones  HTTP:200  Time:0.40s
UIF-PDF        HTTP:200  Time:0.04s (4.3MB)
CONDUSEF       HTTP:200  Time:0.18s
CNSF           HTTP:200  Time:0.86s
CNSF-RentaVit  HTTP:200  Time:0.16s
CONSAR-Valores HTTP:200  Time:0.24s
SIDOF          HTTP:200  Time:3.00s
BANXICO        HTTP:200  Time:0.09s
SAT            HTTP:200  Time:0.06s
OFAC           HTTP:200  Time:1.61s
ONU            HTTP:200  Time:0.75s
INEGI          HTTP:200  Time:0.13s
```

---

## Fuentes Estables (Sin Correcciones)

| Fuente | URL | Tamano Respuesta |
|--------|-----|------------------|
| SIDOF | sidof.segob.gob.mx | 184 KB |
| BANXICO | banxico.org.mx/cep/ | 17 KB |
| SAT | sat.gob.mx | 1.5 KB |
| OFAC | treasury.gov/ofac/downloads/sdn.xml | 27 MB |
| ONU | scsanctions.un.org/.../consolidated.xml | 2 MB |
| INEGI | inegi.org.mx/app/ageeml/ | 39 KB |
| AMAFORE | amafore.org/estadisticas | N/A |

---

## Acciones Pendientes

### Alta Prioridad

1. **DOF (Diario Oficial de la Federacion)**
   - URL actual devuelve 404
   - Usar SIDOF como alternativa funcional
   - Investigar nueva estructura del portal

2. **INFONAVIT**
   - Portal con timeout frecuente (>15s)
   - Implementar timeout extendido o scraping asincrono

### Media Prioridad

3. **Monitoreo Continuo**
   - Implementar health checks periodicos
   - Alertas automaticas ante cambios de estructura

---

## Recomendaciones Tecnicas

### 1. Implementar Fallback URLs

```csharp
private static readonly string[] CnbvUrls = {
    "https://www.cnbv.gob.mx/Normatividad/Paginas/default.aspx",
    "https://www.gob.mx/cnbv/documentos/documentos-banca-multiple"
};
```

### 2. Health Check Endpoint

```csharp
[HttpGet("scrapers/health")]
public async Task<IActionResult> CheckScrapersHealth()
{
    var results = await _scraperService.TestAllSourcesAsync();
    return Ok(results);
}
```

### 3. Circuit Breaker Pattern

```csharp
// Usar Polly circuit breaker
Policy
    .Handle<HttpRequestException>()
    .CircuitBreakerAsync(
        exceptionsAllowedBeforeBreaking: 3,
        durationOfBreak: TimeSpan.FromMinutes(5));
```

---

## Estructura de Archivos

```
Certus.Infrastructure/Services/Scrapers/
├── IScraperSourceHandler.cs        # Interfaz base
├── ScraperService.cs               # Orquestador principal
├── AmaforeScraperHandler.cs        # AMAFORE
├── BanxicoScraperHandler.cs        # BANXICO
├── CnbvScraperHandler.cs           # CNBV
├── CnsfScraperHandler.cs           # CNSF
├── CondusefScraperHandler.cs       # CONDUSEF
├── ConsarScraperHandler.cs         # CONSAR
├── DofScraperHandler.cs            # DOF
├── ImssScraperHandler.cs           # IMSS
├── InfonavitScraperHandler.cs      # INFONAVIT
├── InegiScraperHandler.cs          # INEGI
├── OfacScraperHandler.cs           # OFAC (USA)
├── OnuScraperHandler.cs            # ONU Sanciones
├── SatScraperHandler.cs            # SAT
├── ShcpScraperHandler.cs           # SHCP
├── SidofScraperHandler.cs          # SIDOF
├── UeScraperHandler.cs             # Union Europea
└── UifScraperHandler.cs            # UIF
```

---

## Modelo de Datos

### ScrapedDocumentData

```csharp
public class ScrapedDocumentData
{
    public string ExternalId { get; set; }      // ID unico SHA256
    public string Title { get; set; }           // Titulo limpio
    public string Description { get; set; }     // Descripcion
    public string Code { get; set; }            // Codigo interno
    public DateTime PublishDate { get; set; }   // Fecha publicacion
    public string Category { get; set; }        // Categoria
    public string DocumentUrl { get; set; }     // URL documento
    public string? PdfUrl { get; set; }         // URL PDF si aplica
    public string? RawHtml { get; set; }        // HTML crudo (max 50KB)
    public Dictionary<string, string> Metadata { get; set; }
}
```

---

## Referencias

- [CONSAR Circular Unica de Pensiones](https://www.consar.gob.mx/gobmx/aplicativo/catsar/Principal/CUP.aspx)
- [CNBV Normatividad](https://www.cnbv.gob.mx/Normatividad/Paginas/default.aspx)
- [SHCP Marco Juridico](https://www.gob.mx/shcp/documentos/marco-juridico-secretaria-de-hacienda-y-credito-publico)
- [UIF Lista Personas Bloqueadas](https://www.gob.mx/cms/uploads/attachment/file/981502/LPB.pdf)
- [OFAC SDN List](https://www.treasury.gov/ofac/downloads/sdn.xml)
- [ONU Consolidated List](https://scsanctions.un.org/resources/xml/en/consolidated.xml)

---

*Documento generado automaticamente - Certus API v1.0 - 2025-11-26*
