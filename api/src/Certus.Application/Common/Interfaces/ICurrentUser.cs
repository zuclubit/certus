namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Información del usuario actual
/// </summary>
public interface ICurrentUser
{
    Guid? UserId { get; }
    Guid? TenantId { get; }
    string? Email { get; }
    string? Name { get; }
    IReadOnlyList<string> Roles { get; }
    IReadOnlyList<string> Permissions { get; }
    bool IsAuthenticated { get; }

    bool HasRole(string role);
    bool HasPermission(string permission);
    bool HasAnyRole(params string[] roles);
    bool HasAnyPermission(params string[] permissions);
}

/// <summary>
/// Servicio de contexto del usuario
/// </summary>
public interface ICurrentUserService
{
    ICurrentUser User { get; }
}
