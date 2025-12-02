using Certus.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior for database transaction management
/// Wraps command handlers in a transaction scope
/// </summary>
public class TransactionBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ILogger<TransactionBehavior<TRequest, TResponse>> _logger;

    public TransactionBehavior(
        IApplicationDbContext dbContext,
        ILogger<TransactionBehavior<TRequest, TResponse>> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        // Only wrap commands (not queries) in transactions
        if (!requestName.EndsWith("Command"))
        {
            return await next();
        }

        // Check if we're already in a transaction
        if (_dbContext.Database.CurrentTransaction != null)
        {
            return await next();
        }

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            _logger.LogDebug("Starting transaction for {RequestName}", requestName);

            var response = await next();

            await transaction.CommitAsync(cancellationToken);

            _logger.LogDebug("Committed transaction for {RequestName}", requestName);

            return response;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);

            _logger.LogError(ex, "Transaction rolled back for {RequestName}", requestName);

            throw;
        }
    }
}
