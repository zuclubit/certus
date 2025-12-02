using System.Diagnostics;
using Certus.Application.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace Certus.Application.Common.Behaviors;

/// <summary>
/// Pipeline behavior para monitoreo de rendimiento
/// </summary>
public class PerformanceBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly Stopwatch _timer;
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUserService;

    private const int WarningThresholdMs = 500;

    public PerformanceBehavior(
        ILogger<PerformanceBehavior<TRequest, TResponse>> logger,
        ICurrentUserService currentUserService)
    {
        _timer = new Stopwatch();
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        _timer.Start();

        var response = await next();

        _timer.Stop();

        var elapsedMilliseconds = _timer.ElapsedMilliseconds;

        if (elapsedMilliseconds > WarningThresholdMs)
        {
            var requestName = typeof(TRequest).Name;
            var userId = _currentUserService.User.UserId;
            var tenantId = _currentUserService.User.TenantId;

            _logger.LogWarning(
                "Certus Long Running Request: {Name} | Duration: {Duration}ms | UserId: {UserId} | TenantId: {TenantId}",
                requestName, elapsedMilliseconds, userId, tenantId);
        }

        return response;
    }
}
