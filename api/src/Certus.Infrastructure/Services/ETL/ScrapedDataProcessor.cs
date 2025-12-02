using System.Diagnostics;
using System.Text.Json;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services.ETL;

/// <summary>
/// ETL Service for processing ScrapedDocument data into CatalogEntry records
/// Implements the data transformation pipeline from raw scraped data to structured catalogs
/// </summary>
public class ScrapedDataProcessor : IScrapedDataProcessor
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<ScrapedDataProcessor> _logger;
    private readonly IBanxicoApiService _banxicoApi;

    public ScrapedDataProcessor(
        IApplicationDbContext context,
        ILogger<ScrapedDataProcessor> logger,
        IBanxicoApiService banxicoApi)
    {
        _context = context;
        _logger = logger;
        _banxicoApi = banxicoApi;
    }

    public async Task<ScrapedDataProcessingResult> ProcessDocumentAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var warnings = new List<string>();

        try
        {
            var document = await _context.ScrapedDocuments
                .Include(d => d.Source)
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);

            if (document == null)
            {
                return new ScrapedDataProcessingResult
                {
                    DocumentId = documentId,
                    Success = false,
                    ErrorMessage = "Document not found",
                    ProcessingTime = stopwatch.Elapsed
                };
            }

            // Route to appropriate processor based on source type
            var result = document.Source.SourceType switch
            {
                ScraperSourceType.BANXICO => await ExtractBanxicoCatalogsAsync(documentId, cancellationToken),
                ScraperSourceType.SPEI => await ExtractBanxicoCatalogsAsync(documentId, cancellationToken),
                ScraperSourceType.INEGI => await ExtractInegiCatalogsAsync(documentId, cancellationToken),
                ScraperSourceType.SAT => await ExtractSatLista69BAsync(documentId, cancellationToken),
                ScraperSourceType.OFAC => await ExtractSanctionsListsAsync(documentId, cancellationToken),
                ScraperSourceType.UIF => await ExtractSanctionsListsAsync(documentId, cancellationToken),
                ScraperSourceType.ONU => await ExtractSanctionsListsAsync(documentId, cancellationToken),
                ScraperSourceType.IndicesFinancieros => await ExtractFinancialIndicesAsync(documentId, cancellationToken),
                ScraperSourceType.SIEFOREPrecios => await ExtractSieforePricesAsync(documentId, cancellationToken),
                ScraperSourceType.ConsarSISET => await ExtractSieforePricesAsync(documentId, cancellationToken),
                _ => await ProcessGenericDocumentAsync(document, cancellationToken)
            };

            // Mark document as processed
            if (result.Success)
            {
                document.MarkAsProcessed(Guid.Empty, "ScrapedDataProcessor");
            }
            else
            {
                document.MarkAsError(result.ErrorMessage ?? "Processing failed");
            }

            await _context.SaveChangesAsync(cancellationToken);

            stopwatch.Stop();

            return new ScrapedDataProcessingResult
            {
                DocumentId = documentId,
                Success = result.Success,
                CatalogEntriesCreated = result.EntriesCreated,
                CatalogEntriesUpdated = result.EntriesUpdated,
                CatalogCode = result.CatalogCode,
                ErrorMessage = result.ErrorMessage,
                ProcessingTime = stopwatch.Elapsed,
                Warnings = warnings
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing document {DocumentId}", documentId);
            stopwatch.Stop();

            return new ScrapedDataProcessingResult
            {
                DocumentId = documentId,
                Success = false,
                ErrorMessage = ex.Message,
                ProcessingTime = stopwatch.Elapsed
            };
        }
    }

    public async Task<ScrapedDataBatchResult> ProcessPendingDocumentsAsync(
        ScraperSourceType sourceType,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var results = new List<ScrapedDataProcessingResult>();
        var errors = new List<string>();

        try
        {
            var pendingDocuments = await _context.ScrapedDocuments
                .Include(d => d.Source)
                .Where(d => d.Source.SourceType == sourceType && d.Status == ScrapedDocumentStatus.New)
                .OrderBy(d => d.CreatedAt)
                .Take(100) // Process in batches
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Processing {Count} pending documents for source {SourceType}",
                pendingDocuments.Count, sourceType);

            foreach (var document in pendingDocuments)
            {
                if (cancellationToken.IsCancellationRequested)
                    break;

                var result = await ProcessDocumentAsync(document.Id, cancellationToken);
                results.Add(result);

                if (!result.Success && !string.IsNullOrEmpty(result.ErrorMessage))
                {
                    errors.Add($"Document {document.Id}: {result.ErrorMessage}");
                }
            }

            stopwatch.Stop();

            return new ScrapedDataBatchResult
            {
                TotalDocuments = pendingDocuments.Count,
                SuccessfullyProcessed = results.Count(r => r.Success),
                Failed = results.Count(r => !r.Success),
                Skipped = 0,
                TotalEntriesCreated = results.Sum(r => r.CatalogEntriesCreated),
                TotalEntriesUpdated = results.Sum(r => r.CatalogEntriesUpdated),
                TotalProcessingTime = stopwatch.Elapsed,
                Results = results,
                Errors = errors
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing batch for source {SourceType}", sourceType);
            stopwatch.Stop();

            return new ScrapedDataBatchResult
            {
                TotalDocuments = 0,
                SuccessfullyProcessed = 0,
                Failed = 1,
                TotalProcessingTime = stopwatch.Elapsed,
                Errors = new[] { ex.Message }
            };
        }
    }

    public async Task<ScrapedDataBatchResult> ProcessAllPendingAsync(
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var allResults = new List<ScrapedDataProcessingResult>();
        var allErrors = new List<string>();

        // Get distinct source types with pending documents
        var sourceTypes = await _context.ScrapedDocuments
            .Where(d => d.Status == ScrapedDocumentStatus.New)
            .Select(d => d.Source.SourceType)
            .Distinct()
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Processing pending documents for {Count} source types", sourceTypes.Count);

        foreach (var sourceType in sourceTypes)
        {
            if (cancellationToken.IsCancellationRequested)
                break;

            var batchResult = await ProcessPendingDocumentsAsync(sourceType, cancellationToken);
            allResults.AddRange(batchResult.Results);
            allErrors.AddRange(batchResult.Errors);
        }

        stopwatch.Stop();

        return new ScrapedDataBatchResult
        {
            TotalDocuments = allResults.Count,
            SuccessfullyProcessed = allResults.Count(r => r.Success),
            Failed = allResults.Count(r => !r.Success),
            TotalEntriesCreated = allResults.Sum(r => r.CatalogEntriesCreated),
            TotalEntriesUpdated = allResults.Sum(r => r.CatalogEntriesUpdated),
            TotalProcessingTime = stopwatch.Elapsed,
            Results = allResults,
            Errors = allErrors
        };
    }

    public async Task<CatalogExtractionResult> ExtractBanxicoCatalogsAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var document = await _context.ScrapedDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);

            if (document == null)
            {
                return new CatalogExtractionResult
                {
                    Success = false,
                    ErrorMessage = "Document not found"
                };
            }

            var entries = new List<ExtractedCatalogEntry>();
            var catalogCode = "CLABE_BANCOS";
            var catalogName = "Catálogo de Bancos SPEI/CLABE";

            // Parse metadata for catalog type
            if (!string.IsNullOrEmpty(document.Metadata))
            {
                var metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(document.Metadata);

                if (metadata?.TryGetValue("type", out var type) == true)
                {
                    if (type.Contains("Calendario", StringComparison.OrdinalIgnoreCase))
                    {
                        catalogCode = "DIAS_INHABILES";
                        catalogName = "Días Inhábiles Bancarios";
                        entries.AddRange(ExtractCalendarEntries(document));
                    }
                    else if (type.Contains("CLABE", StringComparison.OrdinalIgnoreCase) ||
                             type.Contains("Banco", StringComparison.OrdinalIgnoreCase))
                    {
                        entries.AddRange(ExtractBankEntries(document));
                    }
                }
            }

            // Create or get catalog
            var catalog = await GetOrCreateCatalogAsync(catalogCode, catalogName, "BANXICO", cancellationToken);

            // Process entries
            var (created, updated, skipped) = await ProcessCatalogEntriesAsync(
                catalog.Id, entries, cancellationToken);

            return new CatalogExtractionResult
            {
                Success = true,
                CatalogCode = catalogCode,
                CatalogName = catalogName,
                EntriesExtracted = entries.Count,
                EntriesCreated = created,
                EntriesUpdated = updated,
                EntriesSkipped = skipped,
                Entries = entries
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting BANXICO catalogs from document {DocumentId}", documentId);
            return new CatalogExtractionResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<CatalogExtractionResult> ExtractInegiCatalogsAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var document = await _context.ScrapedDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);

            if (document == null)
            {
                return new CatalogExtractionResult
                {
                    Success = false,
                    ErrorMessage = "Document not found"
                };
            }

            var entries = new List<ExtractedCatalogEntry>();
            var catalogCode = "ENTIDADES_FEDERATIVAS";
            var catalogName = "Entidades Federativas de México";

            // Add standard geographic entries
            entries.AddRange(GetStandardEntidadesFederativas());

            var catalog = await GetOrCreateCatalogAsync(catalogCode, catalogName, "INEGI", cancellationToken);
            var (created, updated, skipped) = await ProcessCatalogEntriesAsync(
                catalog.Id, entries, cancellationToken);

            return new CatalogExtractionResult
            {
                Success = true,
                CatalogCode = catalogCode,
                CatalogName = catalogName,
                EntriesExtracted = entries.Count,
                EntriesCreated = created,
                EntriesUpdated = updated,
                EntriesSkipped = skipped,
                Entries = entries
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting INEGI catalogs from document {DocumentId}", documentId);
            return new CatalogExtractionResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<CatalogExtractionResult> ExtractSatLista69BAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var document = await _context.ScrapedDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);

            if (document == null)
            {
                return new CatalogExtractionResult
                {
                    Success = false,
                    ErrorMessage = "Document not found"
                };
            }

            var entries = new List<ExtractedCatalogEntry>();
            var catalogCode = "SAT_LISTA_69B";
            var catalogName = "Lista 69B - Contribuyentes con Operaciones Inexistentes";

            // Parse document content for RFC entries
            if (!string.IsNullOrEmpty(document.ExtractedText))
            {
                entries.AddRange(ParseLista69BText(document.ExtractedText));
            }

            var catalog = await GetOrCreateCatalogAsync(catalogCode, catalogName, "SAT", cancellationToken);
            var (created, updated, skipped) = await ProcessCatalogEntriesAsync(
                catalog.Id, entries, cancellationToken);

            return new CatalogExtractionResult
            {
                Success = true,
                CatalogCode = catalogCode,
                CatalogName = catalogName,
                EntriesExtracted = entries.Count,
                EntriesCreated = created,
                EntriesUpdated = updated,
                EntriesSkipped = skipped,
                Entries = entries
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting SAT Lista 69B from document {DocumentId}", documentId);
            return new CatalogExtractionResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<CatalogExtractionResult> ExtractSanctionsListsAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var document = await _context.ScrapedDocuments
                .Include(d => d.Source)
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);

            if (document == null)
            {
                return new CatalogExtractionResult
                {
                    Success = false,
                    ErrorMessage = "Document not found"
                };
            }

            var entries = new List<ExtractedCatalogEntry>();
            var (catalogCode, catalogName) = document.Source.SourceType switch
            {
                ScraperSourceType.OFAC => ("PLD_OFAC_SDN", "Lista OFAC SDN - Sanciones USA"),
                ScraperSourceType.UIF => ("PLD_UIF_MEXICO", "Lista UIF - Personas Bloqueadas México"),
                ScraperSourceType.ONU => ("PLD_ONU_SANCIONES", "Lista ONU - Sanciones Consejo Seguridad"),
                _ => ("PLD_GENERIC", "Lista PLD Genérica")
            };

            // Parse sanctions from document content
            if (!string.IsNullOrEmpty(document.ExtractedText) || !string.IsNullOrEmpty(document.RawHtml))
            {
                entries.AddRange(ParseSanctionsList(document));
            }

            var catalog = await GetOrCreateCatalogAsync(catalogCode, catalogName,
                document.Source.SourceType.ToString(), cancellationToken);
            var (created, updated, skipped) = await ProcessCatalogEntriesAsync(
                catalog.Id, entries, cancellationToken);

            return new CatalogExtractionResult
            {
                Success = true,
                CatalogCode = catalogCode,
                CatalogName = catalogName,
                EntriesExtracted = entries.Count,
                EntriesCreated = created,
                EntriesUpdated = updated,
                EntriesSkipped = skipped,
                Entries = entries
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting sanctions lists from document {DocumentId}", documentId);
            return new CatalogExtractionResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<CatalogExtractionResult> ExtractFinancialIndicesAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var document = await _context.ScrapedDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);

            if (document == null)
            {
                return new CatalogExtractionResult
                {
                    Success = false,
                    ErrorMessage = "Document not found"
                };
            }

            var entries = new List<ExtractedCatalogEntry>();
            var catalogCode = "INDICES_FINANCIEROS";
            var catalogName = "Índices Financieros BANXICO";

            // Parse financial indices from metadata
            if (!string.IsNullOrEmpty(document.Metadata))
            {
                var metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(document.Metadata);

                if (metadata != null)
                {
                    foreach (var kvp in metadata.Where(m =>
                        m.Key.StartsWith("SF") || m.Key.StartsWith("SP") ||
                        m.Key.Contains("UDI", StringComparison.OrdinalIgnoreCase) ||
                        m.Key.Contains("TIIE", StringComparison.OrdinalIgnoreCase)))
                    {
                        entries.Add(new ExtractedCatalogEntry
                        {
                            Key = kvp.Key,
                            Value = kvp.Value,
                            DisplayName = GetSeriesDisplayName(kvp.Key),
                            Description = $"Serie BANXICO: {kvp.Key}",
                            EffectiveFrom = document.PublishDate ?? DateTime.UtcNow
                        });
                    }
                }
            }

            // Try to get live data from BANXICO API
            try
            {
                var today = DateTime.UtcNow.Date;
                var udiValue = await _banxicoApi.GetUdiValueAsync(today, cancellationToken);
                if (udiValue.HasValue)
                {
                    entries.Add(new ExtractedCatalogEntry
                    {
                        Key = $"UDI_{today:yyyyMMdd}",
                        Value = udiValue.Value.ToString("F6"),
                        DisplayName = $"UDI - {today:yyyy-MM-dd}",
                        Description = "Unidad de Inversión",
                        EffectiveFrom = today
                    });
                }

                var exchangeRate = await _banxicoApi.GetExchangeRateFixAsync(today, cancellationToken);
                if (exchangeRate.IsValid)
                {
                    entries.Add(new ExtractedCatalogEntry
                    {
                        Key = $"FIX_USDMXN_{today:yyyyMMdd}",
                        Value = exchangeRate.Rate.ToString("F4"),
                        DisplayName = $"Tipo de Cambio FIX USD/MXN - {today:yyyy-MM-dd}",
                        Description = "Tipo de cambio FIX USD/MXN",
                        EffectiveFrom = today
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not fetch live BANXICO data");
            }

            var catalog = await GetOrCreateCatalogAsync(catalogCode, catalogName, "BANXICO", cancellationToken);
            var (created, updated, skipped) = await ProcessCatalogEntriesAsync(
                catalog.Id, entries, cancellationToken);

            return new CatalogExtractionResult
            {
                Success = true,
                CatalogCode = catalogCode,
                CatalogName = catalogName,
                EntriesExtracted = entries.Count,
                EntriesCreated = created,
                EntriesUpdated = updated,
                EntriesSkipped = skipped,
                Entries = entries
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting financial indices from document {DocumentId}", documentId);
            return new CatalogExtractionResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    public async Task<CatalogExtractionResult> ExtractSieforePricesAsync(
        Guid documentId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var document = await _context.ScrapedDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);

            if (document == null)
            {
                return new CatalogExtractionResult
                {
                    Success = false,
                    ErrorMessage = "Document not found"
                };
            }

            var entries = new List<ExtractedCatalogEntry>();
            var catalogCode = "SIEFORE_PRECIOS";
            var catalogName = "Precios de SIEFOREs Generacionales";

            // Parse SIEFORE price data from metadata
            if (!string.IsNullOrEmpty(document.Metadata))
            {
                var metadata = JsonSerializer.Deserialize<Dictionary<string, string>>(document.Metadata);

                if (metadata != null)
                {
                    foreach (var kvp in metadata.Where(m =>
                        m.Key.Contains("siefore", StringComparison.OrdinalIgnoreCase) ||
                        m.Key.Contains("irn", StringComparison.OrdinalIgnoreCase) ||
                        m.Key.Contains("comision", StringComparison.OrdinalIgnoreCase)))
                    {
                        entries.Add(new ExtractedCatalogEntry
                        {
                            Key = kvp.Key,
                            Value = kvp.Value,
                            DisplayName = kvp.Key.Replace("_", " "),
                            EffectiveFrom = document.PublishDate ?? DateTime.UtcNow
                        });
                    }
                }
            }

            var catalog = await GetOrCreateCatalogAsync(catalogCode, catalogName, "CONSAR", cancellationToken);
            var (created, updated, skipped) = await ProcessCatalogEntriesAsync(
                catalog.Id, entries, cancellationToken);

            return new CatalogExtractionResult
            {
                Success = true,
                CatalogCode = catalogCode,
                CatalogName = catalogName,
                EntriesExtracted = entries.Count,
                EntriesCreated = created,
                EntriesUpdated = updated,
                EntriesSkipped = skipped,
                Entries = entries
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting SIEFORE prices from document {DocumentId}", documentId);
            return new CatalogExtractionResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }

    #region Private Helper Methods

    private async Task<CatalogExtractionResult> ProcessGenericDocumentAsync(
        ScrapedDocument document,
        CancellationToken cancellationToken)
    {
        // Generic processing - just mark as processed without creating catalog entries
        return new CatalogExtractionResult
        {
            Success = true,
            CatalogCode = "GENERIC",
            CatalogName = "Generic Document",
            EntriesExtracted = 0,
            EntriesCreated = 0,
            EntriesUpdated = 0,
            EntriesSkipped = 0
        };
    }

    private async Task<Catalog> GetOrCreateCatalogAsync(
        string code,
        string name,
        string source,
        CancellationToken cancellationToken)
    {
        var catalog = await _context.Catalogs
            .FirstOrDefaultAsync(c => c.Code == code, cancellationToken);

        if (catalog == null)
        {
            catalog = Catalog.Create(code, name, $"Auto-generated from {source} scraper", "ETL-1.0", source);
            await _context.Catalogs.AddAsync(catalog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return catalog;
    }

    private async Task<(int created, int updated, int skipped)> ProcessCatalogEntriesAsync(
        Guid catalogId,
        IEnumerable<ExtractedCatalogEntry> entries,
        CancellationToken cancellationToken)
    {
        int created = 0, updated = 0, skipped = 0;

        foreach (var entry in entries)
        {
            var existing = await _context.CatalogEntries
                .FirstOrDefaultAsync(e => e.CatalogId == catalogId && e.Key == entry.Key, cancellationToken);

            if (existing == null)
            {
                var newEntry = CatalogEntry.Create(
                    catalogId,
                    entry.Key,
                    entry.Value,
                    entry.DisplayName,
                    entry.Description,
                    entry.SortOrder,
                    entry.ParentKey);

                await _context.CatalogEntries.AddAsync(newEntry, cancellationToken);
                created++;
            }
            else if (existing.Value != entry.Value)
            {
                existing.Update(entry.Value, entry.DisplayName, entry.Description);
                updated++;
            }
            else
            {
                skipped++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return (created, updated, skipped);
    }

    private IEnumerable<ExtractedCatalogEntry> ExtractCalendarEntries(ScrapedDocument document)
    {
        var entries = new List<ExtractedCatalogEntry>();
        var year = DateTime.UtcNow.Year;

        // Standard Mexican banking holidays
        var holidays = new[]
        {
            (Date: new DateTime(year, 1, 1), Name: "Año Nuevo"),
            (Date: new DateTime(year, 2, 5), Name: "Día de la Constitución"),
            (Date: new DateTime(year, 3, 21), Name: "Natalicio de Benito Juárez"),
            (Date: new DateTime(year, 5, 1), Name: "Día del Trabajo"),
            (Date: new DateTime(year, 9, 16), Name: "Día de la Independencia"),
            (Date: new DateTime(year, 11, 20), Name: "Revolución Mexicana"),
            (Date: new DateTime(year, 12, 25), Name: "Navidad")
        };

        foreach (var holiday in holidays)
        {
            entries.Add(new ExtractedCatalogEntry
            {
                Key = holiday.Date.ToString("yyyyMMdd"),
                Value = holiday.Name,
                DisplayName = $"{holiday.Name} - {holiday.Date:yyyy-MM-dd}",
                Description = "Día inhábil bancario",
                EffectiveFrom = holiday.Date,
                EffectiveTo = holiday.Date.AddDays(1)
            });
        }

        return entries;
    }

    private IEnumerable<ExtractedCatalogEntry> ExtractBankEntries(ScrapedDocument document)
    {
        // Standard CLABE bank codes (3-digit codes)
        var banks = new Dictionary<string, string>
        {
            ["002"] = "BANAMEX",
            ["012"] = "BBVA MEXICO",
            ["014"] = "SANTANDER",
            ["021"] = "HSBC",
            ["030"] = "BAJIO",
            ["036"] = "INBURSA",
            ["042"] = "MIFEL",
            ["044"] = "SCOTIABANK",
            ["058"] = "BANREGIO",
            ["059"] = "INVEX",
            ["060"] = "BANSI",
            ["062"] = "AFIRME",
            ["072"] = "BANORTE",
            ["106"] = "BANK OF AMERICA",
            ["108"] = "MUFG",
            ["110"] = "JP MORGAN",
            ["112"] = "BMONEX",
            ["113"] = "VE POR MAS",
            ["116"] = "ING",
            ["124"] = "DEUTSCHE BANK",
            ["126"] = "CREDIT SUISSE",
            ["127"] = "AZTECA",
            ["128"] = "AUTOFIN",
            ["129"] = "BARCLAYS",
            ["130"] = "COMPARTAMOS",
            ["131"] = "BANCO AHORRO FAMSA",
            ["132"] = "MULTIVA",
            ["133"] = "ACTINVER",
            ["134"] = "WAL-MART",
            ["135"] = "NAFIN",
            ["136"] = "INTERBANCO",
            ["137"] = "BANCOPPEL",
            ["138"] = "ABC CAPITAL",
            ["139"] = "UBS BANK",
            ["140"] = "CONSUBANCO",
            ["141"] = "VOLKSWAGEN",
            ["143"] = "CIBANCO",
            ["145"] = "BBASE",
            ["166"] = "BANSEFI",
            ["168"] = "HIPOTECARIA FEDERAL",
            ["600"] = "MONEXCB",
            ["601"] = "GBM",
            ["602"] = "MASARI",
            ["605"] = "VALUE",
            ["606"] = "ESTRUCTURADORES",
            ["607"] = "TIBER",
            ["608"] = "VECTOR",
            ["610"] = "B&B",
            ["614"] = "ACCIVAL",
            ["615"] = "MERRILL LYNCH",
            ["616"] = "FINAMEX",
            ["617"] = "VALMEX",
            ["618"] = "UNICA",
            ["619"] = "MAPFRE",
            ["620"] = "PROFUTURO",
            ["621"] = "CB ACTINVER",
            ["622"] = "OACTIN",
            ["623"] = "SKANDIA",
            ["626"] = "CBDEUTSCHE",
            ["627"] = "ZURICH",
            ["628"] = "ZURICHVI",
            ["629"] = "SU CASITA",
            ["630"] = "CB INTERCAM",
            ["631"] = "CI BOLSA",
            ["632"] = "BULLTICK CB",
            ["633"] = "STERLING",
            ["634"] = "FINCOMUN",
            ["636"] = "HDI SEGUROS",
            ["637"] = "ORDER",
            ["638"] = "AKALA",
            ["640"] = "CB JPMORGAN",
            ["642"] = "REFORMA",
            ["646"] = "STP",
            ["647"] = "TELECOMM",
            ["648"] = "EVERCORE",
            ["649"] = "SKANDIA",
            ["651"] = "SEGMTY",
            ["652"] = "ASEA",
            ["653"] = "KUSPIT",
            ["655"] = "UNAGRA",
            ["656"] = "SOFIEXPRESS",
            ["659"] = "ASP INTEGRA OPC",
            ["670"] = "LIBERTAD",
            ["901"] = "CLS",
            ["902"] = "INDEVAL"
        };

        return banks.Select((kvp, index) => new ExtractedCatalogEntry
        {
            Key = kvp.Key,
            Value = kvp.Value,
            DisplayName = $"{kvp.Key} - {kvp.Value}",
            Description = $"Código CLABE banco: {kvp.Key}",
            SortOrder = index + 1
        });
    }

    private IEnumerable<ExtractedCatalogEntry> GetStandardEntidadesFederativas()
    {
        var entidades = new Dictionary<string, string>
        {
            ["01"] = "Aguascalientes",
            ["02"] = "Baja California",
            ["03"] = "Baja California Sur",
            ["04"] = "Campeche",
            ["05"] = "Coahuila de Zaragoza",
            ["06"] = "Colima",
            ["07"] = "Chiapas",
            ["08"] = "Chihuahua",
            ["09"] = "Ciudad de México",
            ["10"] = "Durango",
            ["11"] = "Guanajuato",
            ["12"] = "Guerrero",
            ["13"] = "Hidalgo",
            ["14"] = "Jalisco",
            ["15"] = "México",
            ["16"] = "Michoacán de Ocampo",
            ["17"] = "Morelos",
            ["18"] = "Nayarit",
            ["19"] = "Nuevo León",
            ["20"] = "Oaxaca",
            ["21"] = "Puebla",
            ["22"] = "Querétaro",
            ["23"] = "Quintana Roo",
            ["24"] = "San Luis Potosí",
            ["25"] = "Sinaloa",
            ["26"] = "Sonora",
            ["27"] = "Tabasco",
            ["28"] = "Tamaulipas",
            ["29"] = "Tlaxcala",
            ["30"] = "Veracruz de Ignacio de la Llave",
            ["31"] = "Yucatán",
            ["32"] = "Zacatecas"
        };

        return entidades.Select((kvp, index) => new ExtractedCatalogEntry
        {
            Key = kvp.Key,
            Value = kvp.Value,
            DisplayName = kvp.Value,
            Description = $"Entidad federativa clave INEGI: {kvp.Key}",
            SortOrder = int.Parse(kvp.Key)
        });
    }

    private IEnumerable<ExtractedCatalogEntry> ParseLista69BText(string text)
    {
        var entries = new List<ExtractedCatalogEntry>();

        // Simple RFC pattern matching (12-13 alphanumeric characters)
        var rfcPattern = new System.Text.RegularExpressions.Regex(
            @"\b([A-ZÑ&]{3,4})(\d{6})([A-Z\d]{3})\b",
            System.Text.RegularExpressions.RegexOptions.IgnoreCase);

        var matches = rfcPattern.Matches(text);
        foreach (System.Text.RegularExpressions.Match match in matches)
        {
            var rfc = match.Value.ToUpperInvariant();
            if (!entries.Any(e => e.Key == rfc))
            {
                entries.Add(new ExtractedCatalogEntry
                {
                    Key = rfc,
                    Value = "BLOQUEADO",
                    DisplayName = rfc,
                    Description = "Contribuyente en Lista 69B - Operaciones presuntamente inexistentes",
                    EffectiveFrom = DateTime.UtcNow
                });
            }
        }

        return entries;
    }

    private IEnumerable<ExtractedCatalogEntry> ParseSanctionsList(ScrapedDocument document)
    {
        var entries = new List<ExtractedCatalogEntry>();

        // Basic parsing - in production, use proper XML/JSON parsers
        var content = document.ExtractedText ?? document.RawHtml ?? string.Empty;

        // This is a simplified implementation
        // Real implementation would parse XML/CSV formats properly

        return entries;
    }

    private string GetSeriesDisplayName(string seriesId)
    {
        return seriesId switch
        {
            "SF43718" => "Tipo de Cambio FIX USD/MXN",
            "SP68257" => "UDI",
            "SF61745" => "TIIE de Fondeo 1D",
            "SF43784" => "TIIE 28 días",
            "SF43785" => "TIIE 91 días",
            "SF43786" => "TIIE 182 días",
            _ => seriesId
        };
    }

    #endregion
}
