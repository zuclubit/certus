using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

using AppTokenValidationResult = Certus.Application.Common.Interfaces.TokenValidationResult;

namespace Certus.Infrastructure.Identity;

/// <summary>
/// Servicio de generación de tokens JWT
/// </summary>
public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _accessTokenExpirationMinutes;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
        _secretKey = configuration["Jwt:SecretKey"] ?? throw new ArgumentException("JWT SecretKey not configured");
        _issuer = configuration["Jwt:Issuer"] ?? "Certus";
        _audience = configuration["Jwt:Audience"] ?? "CertusApi";
        _accessTokenExpirationMinutes = int.Parse(configuration["Jwt:AccessTokenExpirationMinutes"] ?? "60");
    }

    public string GenerateAccessToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("name", user.FullName),
            new("tenant_id", user.TenantId.ToString()),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        // Agregar permisos basados en el rol
        var permissions = GetPermissionsForRole(user.Role);
        foreach (var permission in permissions)
        {
            claims.Add(new Claim("permission", permission));
        }

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_accessTokenExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public AppTokenValidationResult? ValidateAccessToken(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_secretKey);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out var validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;

            var userId = Guid.Parse(principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? string.Empty);
            var email = principal.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? string.Empty;
            var name = principal.FindFirst("name")?.Value ?? string.Empty;
            var role = principal.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
            var tenantIdClaim = principal.FindFirst("tenant_id")?.Value;
            var permissions = principal.FindAll("permission").Select(c => c.Value).ToList();

            return new AppTokenValidationResult
            {
                UserId = userId,
                Email = email,
                Name = name,
                Role = role,
                TenantId = !string.IsNullOrEmpty(tenantIdClaim) ? Guid.Parse(tenantIdClaim) : null,
                Permissions = permissions,
                ExpiresAt = jwtToken.ValidTo
            };
        }
        catch
        {
            return null;
        }
    }

    public Guid? GetUserIdFromToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            return !string.IsNullOrEmpty(userIdClaim) ? Guid.Parse(userIdClaim) : null;
        }
        catch
        {
            return null;
        }
    }

    public Guid? GetTenantIdFromToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            var tenantIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "tenant_id")?.Value;
            return !string.IsNullOrEmpty(tenantIdClaim) ? Guid.Parse(tenantIdClaim) : null;
        }
        catch
        {
            return null;
        }
    }

    public bool IsTokenExpiringSoon(string token, int thresholdMinutes = 5)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            var expirationTime = jwtToken.ValidTo;
            return expirationTime <= DateTime.UtcNow.AddMinutes(thresholdMinutes);
        }
        catch
        {
            return true;
        }
    }

    private static IEnumerable<string> GetPermissionsForRole(Domain.Enums.UserRole role)
    {
        return role switch
        {
            Domain.Enums.UserRole.SystemAdmin => new[]
            {
                "validations:read", "validations:write", "validations:delete",
                "users:read", "users:write", "users:delete",
                "approvals:read", "approvals:write", "approvals:approve",
                "catalogs:read", "catalogs:write",
                "reports:read", "reports:export",
                "settings:read", "settings:write",
                "audit:read"
            },
            Domain.Enums.UserRole.AforeAdmin => new[]
            {
                "validations:read", "validations:write", "validations:delete",
                "users:read", "users:write",
                "approvals:read", "approvals:write", "approvals:approve",
                "catalogs:read", "catalogs:write",
                "reports:read", "reports:export",
                "settings:read"
            },
            Domain.Enums.UserRole.Supervisor => new[]
            {
                "validations:read", "validations:write",
                "users:read",
                "approvals:read", "approvals:write", "approvals:approve",
                "catalogs:read",
                "reports:read", "reports:export"
            },
            Domain.Enums.UserRole.AforeAnalyst => new[]
            {
                "validations:read", "validations:write",
                "approvals:read",
                "catalogs:read",
                "reports:read"
            },
            Domain.Enums.UserRole.Auditor => new[]
            {
                "validations:read",
                "approvals:read",
                "catalogs:read",
                "reports:read",
                "audit:read"
            },
            Domain.Enums.UserRole.Viewer => new[]
            {
                "validations:read",
                "catalogs:read",
                "reports:read"
            },
            _ => Array.Empty<string>()
        };
    }
}
