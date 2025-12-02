using Certus.Application.Common.Interfaces;
using MediatR;

namespace Certus.Application.Common.Behaviors;

/// <summary>
/// Interfaz para requests que requieren tenant
/// </summary>
public interface ITenantRequest
{
    Guid TenantId { get; set; }
}

/// <summary>
/// Pipeline behavior para inyectar TenantId automáticamente
/// </summary>
public class TenantBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : ITenantRequest
{
    private readonly ICurrentUserService _currentUserService;

    public TenantBehavior(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Si el TenantId no está establecido, usar el del usuario actual
        if (request.TenantId == Guid.Empty && _currentUserService.User.TenantId.HasValue)
        {
            request.TenantId = _currentUserService.User.TenantId.Value;
        }

        return await next();
    }
}
