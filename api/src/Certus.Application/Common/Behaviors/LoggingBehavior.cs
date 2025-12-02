using System.Diagnostics;
using Certus.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Common.Behaviors;

/// <summary>
/// Pipeline behavior para logging de requests
/// </summary>
public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUserService;

    public LoggingBehavior(
        ILogger<LoggingBehavior<TRequest, TResponse>> logger,
        ICurrentUserService currentUserService)
    {
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUserService.User.UserId;
        var tenantId = _currentUserService.User.TenantId;

        _logger.LogInformation(
            "Certus Request: {Name} | UserId: {UserId} | TenantId: {TenantId}",
            requestName, userId, tenantId);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();

            stopwatch.Stop();

            _logger.LogInformation(
                "Certus Response: {Name} | Duration: {Duration}ms | UserId: {UserId}",
                requestName, stopwatch.ElapsedMilliseconds, userId);

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            _logger.LogError(ex,
                "Certus Request Error: {Name} | Duration: {Duration}ms | UserId: {UserId} | Error: {Error}",
                requestName, stopwatch.ElapsedMilliseconds, userId, ex.Message);

            throw;
        }
    }
}
