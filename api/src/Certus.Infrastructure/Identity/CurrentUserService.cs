using System.Security.Claims;
using Certus.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Certus.Infrastructure.Identity;

/// <summary>
/// Implementación del servicio de usuario actual
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public ICurrentUser User => new CurrentUser(_httpContextAccessor.HttpContext?.User);
}

/// <summary>
/// Implementación del usuario actual
/// </summary>
public class CurrentUser : ICurrentUser
{
    private readonly ClaimsPrincipal? _user;

    public CurrentUser(ClaimsPrincipal? user)
    {
        _user = user;
    }

    public Guid? UserId
    {
        get
        {
            var claim = _user?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? _user?.FindFirst("sub")?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    public Guid? TenantId
    {
        get
        {
            var claim = _user?.FindFirst("tenant_id")?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    public string? Email => _user?.FindFirst(ClaimTypes.Email)?.Value
                            ?? _user?.FindFirst("email")?.Value;

    public string? Name => _user?.FindFirst(ClaimTypes.Name)?.Value
                           ?? _user?.FindFirst("name")?.Value;

    public IReadOnlyList<string> Roles => _user?.FindAll(ClaimTypes.Role)
        .Select(c => c.Value)
        .ToList() ?? new List<string>();

    public IReadOnlyList<string> Permissions => _user?.FindAll("permission")
        .Select(c => c.Value)
        .ToList() ?? new List<string>();

    public bool IsAuthenticated => _user?.Identity?.IsAuthenticated ?? false;

    public bool HasRole(string role) => Roles.Contains(role, StringComparer.OrdinalIgnoreCase);

    public bool HasPermission(string permission) =>
        Permissions.Contains(permission, StringComparer.OrdinalIgnoreCase);

    public bool HasAnyRole(params string[] roles) =>
        roles.Any(r => HasRole(r));

    public bool HasAnyPermission(params string[] permissions) =>
        permissions.Any(p => HasPermission(p));
}
