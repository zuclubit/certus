using Certus.Application.Common.Interfaces;
using Hangfire;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.BackgroundJobs;

/// <summary>
/// Hangfire job para ejecutar el scraping de cambios normativos CONSAR
/// Se ejecuta de forma programada según la configuración de cada fuente
/// </summary>
public class NormativeScraperJob
{
    private readonly INormativeScraperService _scraperService;
    private readonly ILogger<NormativeScraperJob> _logger;

    public NormativeScraperJob(
        INormativeScraperService scraperService,
        ILogger<NormativeScraperJob> logger)
    {
        _scraperService = scraperService;
        _logger = logger;
    }

    /// <summary>
    /// Ejecuta el scraping para todas las fuentes programadas
    /// Este método es llamado por Hangfire según el cron configurado
    /// </summary>
    [AutomaticRetry(Attempts = 2, DelaysInSeconds = new[] { 60, 300 })]
    [DisableConcurrentExecution(timeoutInSeconds: 3600)] // 1 hora máximo
    [Queue("scrapers")]
    public async Task ExecuteScheduledScrapingAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting scheduled normative scraping job");

        try
        {
            var results = await _scraperService.ExecuteAllScheduledAsync(cancellationToken);
            var resultList = results.ToList();

            var successCount = resultList.Count(r => r.Success);
            var failedCount = resultList.Count(r => !r.Success);
            var totalDocs = resultList.Sum(r => r.DocumentsNew);

            _logger.LogInformation(
                "Scheduled scraping completed. Sources: Success={Success}, Failed={Failed}, NewDocuments={NewDocs}",
                successCount, failedCount, totalDocs);

            // Log detalles de cada ejecución
            foreach (var result in resultList)
            {
                if (result.Success)
                {
                    _logger.LogInformation(
                        "Source {SourceName}: Found={Found}, New={New}, Duplicate={Dup}, Duration={Duration}ms",
                        result.SourceName, result.DocumentsFound, result.DocumentsNew,
                        result.DocumentsDuplicate, result.DurationMs);
                }
                else
                {
                    _logger.LogWarning(
                        "Source {SourceName} failed: {Error}",
                        result.SourceName, result.ErrorMessage);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Scheduled scraping job failed: {Message}", ex.Message);
            throw; // Re-throw para que Hangfire maneje el retry
        }
    }

    /// <summary>
    /// Ejecuta el scraping para una fuente específica
    /// Puede ser llamado manualmente o encolado por Hangfire
    /// </summary>
    [AutomaticRetry(Attempts = 3, DelaysInSeconds = new[] { 30, 60, 120 })]
    [Queue("scrapers")]
    public async Task ExecuteSourceScrapingAsync(
        Guid sourceId,
        string triggeredBy = "manual",
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Starting scraping for source {SourceId}, triggered by {TriggeredBy}",
            sourceId, triggeredBy);

        try
        {
            var result = await _scraperService.ExecuteScrapingAsync(sourceId, triggeredBy, cancellationToken);

            if (result.Success)
            {
                _logger.LogInformation(
                    "Scraping for {SourceName} completed: Found={Found}, New={New}, Duration={Duration}ms",
                    result.SourceName, result.DocumentsFound, result.DocumentsNew, result.DurationMs);
            }
            else
            {
                _logger.LogWarning(
                    "Scraping for {SourceName} failed: {Error}",
                    result.SourceName, result.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Scraping for source {SourceId} failed: {Message}", sourceId, ex.Message);
            throw;
        }
    }

    /// <summary>
    /// Procesa los documentos pendientes y los convierte a NormativeChanges
    /// </summary>
    [AutomaticRetry(Attempts = 2)]
    [Queue("scrapers")]
    public async Task ProcessPendingDocumentsAsync(
        Guid? executionId = null,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Starting pending documents processing{ExecutionFilter}",
            executionId.HasValue ? $" for execution {executionId}" : "");

        try
        {
            var result = await _scraperService.ProcessPendingDocumentsAsync(
                executionId,
                autoAssignPriority: true,
                cancellationToken);

            _logger.LogInformation(
                "Document processing completed: Total={Total}, Success={Success}, Ignored={Ignored}, Errors={Errors}",
                result.TotalProcessed, result.SuccessCount, result.IgnoredCount, result.ErrorCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Document processing failed: {Message}", ex.Message);
            throw;
        }
    }
}

/// <summary>
/// Extensiones para registrar los jobs de Hangfire
/// </summary>
public static class HangfireScraperJobExtensions
{
    /// <summary>
    /// Registra los jobs recurrentes de scraping en Hangfire
    /// </summary>
    public static void RegisterScraperJobs(this IRecurringJobManager recurringJobManager)
    {
        // Job principal que ejecuta todas las fuentes programadas
        // Se ejecuta cada hora para verificar qué fuentes necesitan ejecutarse
        recurringJobManager.AddOrUpdate<NormativeScraperJob>(
            "normative-scraper-scheduled",
            job => job.ExecuteScheduledScrapingAsync(CancellationToken.None),
            "0 * * * *", // Cada hora en el minuto 0
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City"),
                MisfireHandling = MisfireHandlingMode.Relaxed
            });

        // Job de procesamiento de documentos pendientes
        // Se ejecuta cada 30 minutos para convertir documentos scrapeados a NormativeChanges
        recurringJobManager.AddOrUpdate<NormativeScraperJob>(
            "normative-document-processor",
            job => job.ProcessPendingDocumentsAsync(null, CancellationToken.None),
            "*/30 * * * *", // Cada 30 minutos
            new RecurringJobOptions
            {
                TimeZone = TimeZoneInfo.FindSystemTimeZoneById("America/Mexico_City"),
                MisfireHandling = MisfireHandlingMode.Ignorable
            });
    }

    /// <summary>
    /// Encola un job de scraping para una fuente específica
    /// </summary>
    public static string EnqueueSourceScraping(
        this IBackgroundJobClient jobClient,
        Guid sourceId,
        string triggeredBy = "manual")
    {
        return jobClient.Enqueue<NormativeScraperJob>(
            job => job.ExecuteSourceScrapingAsync(sourceId, triggeredBy, CancellationToken.None));
    }

    /// <summary>
    /// Encola el procesamiento de documentos pendientes
    /// </summary>
    public static string EnqueueDocumentProcessing(
        this IBackgroundJobClient jobClient,
        Guid? executionId = null)
    {
        return jobClient.Enqueue<NormativeScraperJob>(
            job => job.ProcessPendingDocumentsAsync(executionId, CancellationToken.None));
    }
}
