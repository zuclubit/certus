using Certus.Domain.Entities;
using Certus.Domain.Enums;

namespace Certus.Domain.Interfaces;

/// <summary>
/// Repositorio específico para Usuarios
/// </summary>
public interface IUserRepository : ITenantRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByEmployeeIdAsync(
        Guid tenantId,
        string employeeId,
        CancellationToken cancellationToken = default);

    Task<User?> GetByRefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> GetByRoleAsync(
        Guid tenantId,
        UserRole role,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> GetActiveUsersAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> GetApproversAsync(
        Guid tenantId,
        ApprovalLevel level,
        CancellationToken cancellationToken = default);

    Task<bool> EmailExistsAsync(
        string email,
        Guid? excludeUserId = null,
        CancellationToken cancellationToken = default);

    Task<bool> EmployeeIdExistsAsync(
        Guid tenantId,
        string employeeId,
        Guid? excludeUserId = null,
        CancellationToken cancellationToken = default);

    Task<PagedResult<User>> GetPagedAsync(
        Guid tenantId,
        int page,
        int pageSize,
        UserRole? role = null,
        UserStatus? status = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default);
}
