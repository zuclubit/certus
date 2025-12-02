namespace Certus.Application.Common.Interfaces;

/// <summary>
/// ETL Service for processing ScrapedDocument data into CatalogEntry records
/// Transforms raw scraped data into structured catalog entries for validation
/// </summary>
public interface IScrapedDataProcessor
{
    /// <summary>
    /// Processes a single scraped document and creates/updates catalog entries
    /// </summary>
    Task<ScrapedDataProcessingResult> ProcessDocumentAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes all pending scraped documents for a specific source type
    /// </summary>
    Task<ScrapedDataBatchResult> ProcessPendingDocumentsAsync(
        Domain.Enums.ScraperSourceType sourceType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Processes all pending scraped documents across all sources
    /// </summary>
    Task<ScrapedDataBatchResult> ProcessAllPendingAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts and creates catalog entries from BANXICO data (CLABE, calendars)
    /// </summary>
    Task<CatalogExtractionResult> ExtractBanxicoCatalogsAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts and creates catalog entries from INEGI geographic data
    /// </summary>
    Task<CatalogExtractionResult> ExtractInegiCatalogsAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts SAT Lista 69B entries for RFC blacklist
    /// </summary>
    Task<CatalogExtractionResult> ExtractSatLista69BAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts OFAC/UIF/ONU sanctions lists for PLD validation
    /// </summary>
    Task<CatalogExtractionResult> ExtractSanctionsListsAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts financial index data (UDI, TIIE, exchange rates)
    /// </summary>
    Task<CatalogExtractionResult> ExtractFinancialIndicesAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Extracts SIEFORE price data
    /// </summary>
    Task<CatalogExtractionResult> ExtractSieforePricesAsync(
        Guid documentId,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Result of processing a single scraped document
/// </summary>
public record ScrapedDataProcessingResult
{
    public Guid DocumentId { get; init; }
    public bool Success { get; init; }
    public int CatalogEntriesCreated { get; init; }
    public int CatalogEntriesUpdated { get; init; }
    public string? CatalogCode { get; init; }
    public string? ErrorMessage { get; init; }
    public TimeSpan ProcessingTime { get; init; }
    public IReadOnlyList<string> Warnings { get; init; } = Array.Empty<string>();
}

/// <summary>
/// Result of processing a batch of scraped documents
/// </summary>
public record ScrapedDataBatchResult
{
    public int TotalDocuments { get; init; }
    public int SuccessfullyProcessed { get; init; }
    public int Failed { get; init; }
    public int Skipped { get; init; }
    public int TotalEntriesCreated { get; init; }
    public int TotalEntriesUpdated { get; init; }
    public TimeSpan TotalProcessingTime { get; init; }
    public IReadOnlyList<ScrapedDataProcessingResult> Results { get; init; } = Array.Empty<ScrapedDataProcessingResult>();
    public IReadOnlyList<string> Errors { get; init; } = Array.Empty<string>();
}

/// <summary>
/// Result of extracting catalog data from a scraped document
/// </summary>
public record CatalogExtractionResult
{
    public bool Success { get; init; }
    public string CatalogCode { get; init; } = string.Empty;
    public string CatalogName { get; init; } = string.Empty;
    public int EntriesExtracted { get; init; }
    public int EntriesCreated { get; init; }
    public int EntriesUpdated { get; init; }
    public int EntriesSkipped { get; init; }
    public string? ErrorMessage { get; init; }
    public IReadOnlyList<ExtractedCatalogEntry> Entries { get; init; } = Array.Empty<ExtractedCatalogEntry>();
}

/// <summary>
/// Individual catalog entry extracted from scraped data
/// </summary>
public record ExtractedCatalogEntry
{
    public string Key { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
    public string? DisplayName { get; init; }
    public string? Description { get; init; }
    public string? ParentKey { get; init; }
    public int? SortOrder { get; init; }
    public Dictionary<string, string>? Metadata { get; init; }
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
}
