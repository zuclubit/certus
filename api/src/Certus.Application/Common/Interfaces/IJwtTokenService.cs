using Certus.Domain.Entities;

namespace Certus.Application.Common.Interfaces;

/// <summary>
/// Interface para el servicio de generación y validación de JWT tokens
/// </summary>
public interface IJwtTokenService
{
    /// <summary>
    /// Genera un access token para el usuario
    /// </summary>
    /// <param name="user">Usuario para el cual generar el token</param>
    /// <returns>Access token JWT</returns>
    string GenerateAccessToken(User user);

    /// <summary>
    /// Genera un refresh token aleatorio
    /// </summary>
    /// <returns>Refresh token</returns>
    string GenerateRefreshToken();

    /// <summary>
    /// Valida un access token y extrae los claims
    /// </summary>
    /// <param name="token">Token a validar</param>
    /// <returns>Claims del token si es válido, null si no</returns>
    TokenValidationResult? ValidateAccessToken(string token);

    /// <summary>
    /// Obtiene el ID de usuario de un token (sin validar completamente)
    /// </summary>
    /// <param name="token">Token JWT</param>
    /// <returns>ID del usuario o null si no se puede extraer</returns>
    Guid? GetUserIdFromToken(string token);

    /// <summary>
    /// Obtiene el ID del tenant de un token
    /// </summary>
    /// <param name="token">Token JWT</param>
    /// <returns>ID del tenant o null si no se puede extraer</returns>
    Guid? GetTenantIdFromToken(string token);

    /// <summary>
    /// Verifica si el token está próximo a expirar
    /// </summary>
    /// <param name="token">Token JWT</param>
    /// <param name="thresholdMinutes">Minutos antes de expiración para considerar "próximo"</param>
    /// <returns>True si está próximo a expirar</returns>
    bool IsTokenExpiringSoon(string token, int thresholdMinutes = 5);
}

/// <summary>
/// Resultado de validación de token
/// </summary>
public sealed record TokenValidationResult
{
    /// <summary>
    /// ID del usuario
    /// </summary>
    public Guid UserId { get; init; }

    /// <summary>
    /// Email del usuario
    /// </summary>
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// Nombre del usuario
    /// </summary>
    public string Name { get; init; } = string.Empty;

    /// <summary>
    /// Rol del usuario
    /// </summary>
    public string Role { get; init; } = string.Empty;

    /// <summary>
    /// ID del tenant
    /// </summary>
    public Guid? TenantId { get; init; }

    /// <summary>
    /// Permisos del usuario
    /// </summary>
    public IReadOnlyList<string> Permissions { get; init; } = Array.Empty<string>();

    /// <summary>
    /// Fecha de expiración del token
    /// </summary>
    public DateTime ExpiresAt { get; init; }

    /// <summary>
    /// Indica si el token está expirado
    /// </summary>
    public bool IsExpired => ExpiresAt <= DateTime.UtcNow;
}
