using System.Text.Json;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Services.Scrapers;

/// <summary>
/// Servicio principal de scraping para cambios normativos CONSAR
/// Coordina la ejecución de scrapers específicos por fuente
/// </summary>
public class NormativeScraperService : INormativeScraperService
{
    private readonly IApplicationDbContext _context;
    private readonly IEnumerable<IScraperSourceHandler> _handlers;
    private readonly IScraperNotificationService _notificationService;
    private readonly ILogger<NormativeScraperService> _logger;
    private readonly Dictionary<Guid, CancellationTokenSource> _runningExecutions = new();

    public NormativeScraperService(
        IApplicationDbContext context,
        IEnumerable<IScraperSourceHandler> handlers,
        IScraperNotificationService notificationService,
        ILogger<NormativeScraperService> logger)
    {
        _context = context;
        _handlers = handlers;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<ScraperExecutionResult> ExecuteScrapingAsync(
        Guid sourceId,
        string triggeredBy = "system",
        CancellationToken cancellationToken = default)
    {
        var source = await _context.ScraperSources
            .FirstOrDefaultAsync(s => s.Id == sourceId && !s.IsDeleted, cancellationToken);

        if (source == null)
        {
            return new ScraperExecutionResult
            {
                SourceId = sourceId,
                Success = false,
                Status = ScraperExecutionStatus.Failed,
                ErrorMessage = "Source not found"
            };
        }

        // Crear registro de ejecución
        var execution = ScraperExecution.Start(sourceId, triggeredBy);
        _context.ScraperExecutions.Add(execution);
        source.RecordExecutionStart();
        await _context.SaveChangesAsync(cancellationToken);

        // Notificar inicio via SignalR
        await _notificationService.NotifyExecutionStarted(new ScraperExecutionStartedMessage(
            ExecutionId: execution.Id,
            SourceId: sourceId,
            SourceName: source.Name,
            Status: execution.Status.ToString(),
            StartedAt: execution.StartedAt,
            TriggeredBy: triggeredBy
        ));

        // Crear CancellationTokenSource para poder cancelar esta ejecución específica
        var executionCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        _runningExecutions[execution.Id] = executionCts;

        try
        {
            execution.AppendLog($"Starting scraping for source: {source.Name} ({source.SourceType})");
            await _notificationService.NotifyExecutionLog(execution.Id, sourceId, $"Starting scraping for source: {source.Name} ({source.SourceType})", "Info");
            execution.AppendLog($"URL: {source.GetFullUrl()}");

            // Obtener el handler apropiado para este tipo de fuente
            var handler = _handlers.FirstOrDefault(h => h.CanHandle(source.SourceType));

            if (handler == null)
            {
                throw new InvalidOperationException($"No handler found for source type: {source.SourceType}");
            }

            execution.AppendLog($"Using handler: {handler.GetType().Name}");

            // Ejecutar scraping
            var documents = await handler.ScrapeAsync(source, executionCts.Token);
            var documentList = documents.ToList();

            execution.AppendLog($"Scraping completed. Found {documentList.Count} documents");
            await _notificationService.NotifyExecutionLog(execution.Id, sourceId, $"Scraping completed. Found {documentList.Count} documents", "Info");

            // Notify progress: scraping done, starting document processing
            await _notificationService.NotifyExecutionProgress(new ScraperExecutionProgressMessage(
                ExecutionId: execution.Id,
                SourceId: sourceId,
                Status: "Processing",
                DocumentsFound: documentList.Count,
                DocumentsNew: 0,
                DocumentsDuplicate: 0,
                DocumentsError: 0,
                CurrentActivity: "Processing documents..."
            ));

            int newCount = 0, duplicateCount = 0, errorCount = 0;

            foreach (var docData in documentList)
            {
                try
                {
                    executionCts.Token.ThrowIfCancellationRequested();

                    // Verificar duplicado
                    var isDuplicate = await IsDuplicateAsync(docData.ExternalId, sourceId, executionCts.Token);

                    if (isDuplicate)
                    {
                        duplicateCount++;
                        execution.AppendLog($"Duplicate: {docData.Code ?? docData.ExternalId}");
                        continue;
                    }

                    // Crear documento
                    var scrapedDoc = ScrapedDocument.Create(
                        execution.Id,
                        sourceId,
                        docData.ExternalId,
                        docData.Title);

                    scrapedDoc.SetDetails(
                        docData.Description,
                        docData.Code,
                        docData.PublishDate,
                        docData.EffectiveDate,
                        docData.Category);

                    scrapedDoc.SetUrls(docData.DocumentUrl, docData.PdfUrl);

                    if (!string.IsNullOrEmpty(docData.RawHtml))
                    {
                        // Limitar tamaño del HTML raw
                        var html = docData.RawHtml.Length > 50000
                            ? docData.RawHtml[..50000]
                            : docData.RawHtml;
                        scrapedDoc.SetRawContent(html, null);
                    }

                    if (docData.Metadata != null)
                    {
                        scrapedDoc.SetMetadata(JsonSerializer.Serialize(docData.Metadata));
                    }

                    _context.ScrapedDocuments.Add(scrapedDoc);
                    newCount++;

                    execution.AppendLog($"New document: {docData.Code ?? docData.ExternalId} - {docData.Title}");

                    // Notify document found via SignalR
                    await _notificationService.NotifyDocumentFound(new ScraperDocumentFoundMessage(
                        ExecutionId: execution.Id,
                        SourceId: sourceId,
                        DocumentId: scrapedDoc.Id,
                        Title: scrapedDoc.Title,
                        Code: scrapedDoc.Code,
                        Category: scrapedDoc.Category,
                        IsNew: true,
                        FoundAt: DateTime.UtcNow
                    ));

                    // Send progress update every new document
                    await _notificationService.NotifyExecutionProgress(new ScraperExecutionProgressMessage(
                        ExecutionId: execution.Id,
                        SourceId: sourceId,
                        Status: "Processing",
                        DocumentsFound: documentList.Count,
                        DocumentsNew: newCount,
                        DocumentsDuplicate: duplicateCount,
                        DocumentsError: errorCount,
                        CurrentActivity: $"Found new: {docData.Code ?? docData.ExternalId}"
                    ));
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    errorCount++;
                    execution.AppendLog($"Error processing document {docData.ExternalId}: {ex.Message}");
                    _logger.LogWarning(ex, "Error processing scraped document {ExternalId}", docData.ExternalId);
                }
            }

            // Actualizar contadores
            execution.SetDocumentCounts(documentList.Count, newCount, duplicateCount, errorCount);

            // Completar ejecución
            if (errorCount > 0)
            {
                execution.CompleteWithWarnings(
                    documentList.Count, newCount, duplicateCount, errorCount,
                    $"{errorCount} documents had processing errors");
                source.RecordExecutionSuccess(newCount);
            }
            else
            {
                execution.Complete(documentList.Count, newCount, duplicateCount);
                source.RecordExecutionSuccess(newCount);
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Notify execution completed via SignalR
            await _notificationService.NotifyExecutionCompleted(new ScraperExecutionCompletedMessage(
                ExecutionId: execution.Id,
                SourceId: sourceId,
                SourceName: source.Name,
                Status: execution.Status.ToString(),
                CompletedAt: execution.CompletedAt ?? DateTime.UtcNow,
                DocumentsFound: documentList.Count,
                DocumentsNew: newCount,
                DocumentsDuplicate: duplicateCount,
                DocumentsError: errorCount,
                Duration: TimeSpan.FromMilliseconds(execution.DurationMs)
            ));

            _logger.LogInformation(
                "Scraping completed for {SourceName}: Found={Found}, New={New}, Duplicate={Duplicate}, Errors={Errors}",
                source.Name, documentList.Count, newCount, duplicateCount, errorCount);

            return new ScraperExecutionResult
            {
                ExecutionId = execution.Id,
                SourceId = sourceId,
                SourceName = source.Name,
                Success = true,
                Status = execution.Status,
                DocumentsFound = documentList.Count,
                DocumentsNew = newCount,
                DocumentsDuplicate = duplicateCount,
                DocumentsError = errorCount,
                DurationMs = execution.DurationMs,
                StartedAt = execution.StartedAt,
                CompletedAt = execution.CompletedAt
            };
        }
        catch (OperationCanceledException)
        {
            execution.Cancel();
            await _context.SaveChangesAsync(CancellationToken.None);

            // Notify execution cancelled (as failed with specific message)
            await _notificationService.NotifyExecutionFailed(new ScraperExecutionFailedMessage(
                ExecutionId: execution.Id,
                SourceId: sourceId,
                SourceName: source.Name,
                Status: "Cancelled",
                FailedAt: DateTime.UtcNow,
                ErrorMessage: "Execution was cancelled by user",
                ErrorDetails: null
            ));

            _logger.LogInformation("Scraping cancelled for source {SourceId}", sourceId);

            return new ScraperExecutionResult
            {
                ExecutionId = execution.Id,
                SourceId = sourceId,
                SourceName = source.Name,
                Success = false,
                Status = ScraperExecutionStatus.Cancelled,
                ErrorMessage = "Execution was cancelled",
                StartedAt = execution.StartedAt,
                CompletedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            execution.Fail(ex.Message, ex.StackTrace);
            source.RecordExecutionFailure(ex.Message);
            await _context.SaveChangesAsync(CancellationToken.None);

            // Notify execution failed via SignalR
            await _notificationService.NotifyExecutionFailed(new ScraperExecutionFailedMessage(
                ExecutionId: execution.Id,
                SourceId: sourceId,
                SourceName: source.Name,
                Status: "Failed",
                FailedAt: DateTime.UtcNow,
                ErrorMessage: ex.Message,
                ErrorDetails: ex.StackTrace
            ));

            _logger.LogError(ex, "Scraping failed for source {SourceId}: {Error}", sourceId, ex.Message);

            return new ScraperExecutionResult
            {
                ExecutionId = execution.Id,
                SourceId = sourceId,
                SourceName = source.Name,
                Success = false,
                Status = ScraperExecutionStatus.Failed,
                ErrorMessage = ex.Message,
                DurationMs = execution.DurationMs,
                StartedAt = execution.StartedAt,
                CompletedAt = execution.CompletedAt
            };
        }
        finally
        {
            _runningExecutions.Remove(execution.Id);
            executionCts.Dispose();
        }
    }

    public async Task<IEnumerable<ScraperExecutionResult>> ExecuteAllScheduledAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var scheduledSources = await _context.ScraperSources
            .Where(s => s.IsEnabled && !s.IsDeleted && s.NextScheduledAt <= now)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Found {Count} sources scheduled for execution", scheduledSources.Count);

        var results = new List<ScraperExecutionResult>();

        foreach (var source in scheduledSources)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var result = await ExecuteScrapingAsync(source.Id, "scheduled", cancellationToken);
            results.Add(result);

            // Pequeña pausa entre fuentes para no sobrecargar
            await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
        }

        return results;
    }

    public async Task<ProcessDocumentResult> ProcessDocumentAsync(
        Guid documentId,
        string processedBy,
        NormativePriority priority = NormativePriority.Medium,
        string[]? affectedValidators = null,
        CancellationToken cancellationToken = default)
    {
        var document = await _context.ScrapedDocuments
            .FirstOrDefaultAsync(d => d.Id == documentId, cancellationToken);

        if (document == null)
        {
            return new ProcessDocumentResult
            {
                DocumentId = documentId,
                Success = false,
                ErrorMessage = "Document not found",
                Status = ScrapedDocumentStatus.Error
            };
        }

        if (document.Status != ScrapedDocumentStatus.New &&
            document.Status != ScrapedDocumentStatus.NeedsReview)
        {
            return new ProcessDocumentResult
            {
                DocumentId = documentId,
                Success = false,
                ErrorMessage = $"Document already processed with status: {document.Status}",
                Status = document.Status
            };
        }

        try
        {
            // Verificar si ya existe un NormativeChange con el mismo código
            var code = document.Code ?? document.ExternalId;
            var existingChange = await _context.NormativeChanges
                .FirstOrDefaultAsync(n => n.Code == code.ToUpperInvariant() && !n.IsDeleted, cancellationToken);

            if (existingChange != null)
            {
                document.MarkAsIgnored($"NormativeChange already exists with code: {code}");
                await _context.SaveChangesAsync(cancellationToken);

                return new ProcessDocumentResult
                {
                    DocumentId = documentId,
                    Success = false,
                    ErrorMessage = $"Duplicate: NormativeChange already exists with code {code}",
                    Status = ScrapedDocumentStatus.Ignored
                };
            }

            // Crear el NormativeChange
            var normativeChange = document.ToNormativeChange(priority, affectedValidators);
            _context.NormativeChanges.Add(normativeChange);

            // Marcar documento como procesado
            document.MarkAsProcessed(normativeChange.Id, processedBy);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Document {DocumentId} processed to NormativeChange {NormativeChangeId}",
                documentId, normativeChange.Id);

            return new ProcessDocumentResult
            {
                DocumentId = documentId,
                Success = true,
                NormativeChangeId = normativeChange.Id,
                Status = ScrapedDocumentStatus.Processed
            };
        }
        catch (Exception ex)
        {
            document.MarkAsError(ex.Message);
            await _context.SaveChangesAsync(CancellationToken.None);

            _logger.LogError(ex, "Failed to process document {DocumentId}", documentId);

            return new ProcessDocumentResult
            {
                DocumentId = documentId,
                Success = false,
                ErrorMessage = ex.Message,
                Status = ScrapedDocumentStatus.Error
            };
        }
    }

    public async Task<ProcessBatchResult> ProcessPendingDocumentsAsync(
        Guid? executionId = null,
        bool autoAssignPriority = true,
        CancellationToken cancellationToken = default)
    {
        var query = _context.ScrapedDocuments
            .Where(d => d.Status == ScrapedDocumentStatus.New);

        if (executionId.HasValue)
        {
            query = query.Where(d => d.ExecutionId == executionId.Value);
        }

        var pendingDocuments = await query.ToListAsync(cancellationToken);

        var result = new ProcessBatchResult
        {
            TotalProcessed = 0,
            SuccessCount = 0,
            ErrorCount = 0,
            IgnoredCount = 0,
            Results = new List<ProcessDocumentResult>()
        };

        foreach (var doc in pendingDocuments)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var priority = autoAssignPriority ? DeterminePriority(doc) : NormativePriority.Medium;
            var validators = DetermineAffectedValidators(doc);

            var processResult = await ProcessDocumentAsync(
                doc.Id,
                "system-batch",
                priority,
                validators,
                cancellationToken);

            result.Results.Add(processResult);
            result.TotalProcessed++;

            if (processResult.Success)
                result.SuccessCount++;
            else if (processResult.Status == ScrapedDocumentStatus.Ignored)
                result.IgnoredCount++;
            else
                result.ErrorCount++;
        }

        _logger.LogInformation(
            "Batch processing completed: Total={Total}, Success={Success}, Ignored={Ignored}, Errors={Errors}",
            result.TotalProcessed, result.SuccessCount, result.IgnoredCount, result.ErrorCount);

        return result;
    }

    public async Task<bool> IsDuplicateAsync(
        string externalId,
        Guid sourceId,
        CancellationToken cancellationToken = default)
    {
        return await _context.ScrapedDocuments
            .AnyAsync(d =>
                d.SourceId == sourceId &&
                d.ExternalId == externalId,
                cancellationToken);
    }

    public async Task CancelExecutionAsync(
        Guid executionId,
        CancellationToken cancellationToken = default)
    {
        if (_runningExecutions.TryGetValue(executionId, out var cts))
        {
            cts.Cancel();
            _logger.LogInformation("Cancellation requested for execution {ExecutionId}", executionId);
        }
        else
        {
            // Si no está en memoria, intentar actualizar en BD
            var execution = await _context.ScraperExecutions
                .FirstOrDefaultAsync(e => e.Id == executionId, cancellationToken);

            if (execution != null && execution.Status == ScraperExecutionStatus.Running)
            {
                execution.Cancel();
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }

    private static NormativePriority DeterminePriority(ScrapedDocument doc)
    {
        var title = doc.Title.ToLowerInvariant();
        var description = doc.Description?.ToLowerInvariant() ?? "";
        var combined = $"{title} {description}";

        // Keywords para alta prioridad
        if (combined.Contains("urgente") ||
            combined.Contains("inmediata") ||
            combined.Contains("obligatorio") ||
            combined.Contains("sanción") ||
            combined.Contains("multa"))
        {
            return NormativePriority.High;
        }

        // Keywords para baja prioridad
        if (combined.Contains("informativo") ||
            combined.Contains("aclaración") ||
            combined.Contains("fe de erratas"))
        {
            return NormativePriority.Low;
        }

        return NormativePriority.Medium;
    }

    private static string[]? DetermineAffectedValidators(ScrapedDocument doc)
    {
        var validators = new List<string>();
        var combined = $"{doc.Title} {doc.Description} {doc.Category}".ToLowerInvariant();

        // Detectar validadores afectados basándose en keywords
        if (combined.Contains("nomina") || combined.Contains("nómina"))
            validators.Add("NOMINA");

        if (combined.Contains("contable"))
            validators.Add("CONTABLE");

        if (combined.Contains("regularización") || combined.Contains("regularizacion"))
            validators.Add("REGULARIZACION");

        if (combined.Contains("siefore") || combined.Contains("inversión"))
            validators.AddRange(new[] { "V21", "V22", "V23" });

        if (combined.Contains("formato") || combined.Contains("anexo"))
            validators.AddRange(new[] { "V01", "V02", "V03" });

        return validators.Count > 0 ? validators.Distinct().ToArray() : null;
    }
}
