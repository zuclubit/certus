using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Certus.Infrastructure.Data.Repositories;

/// <summary>
/// Implementación del repositorio de Usuarios
/// Optimized for .NET 8 and Clean Architecture (2025)
/// </summary>
public class UserRepository : TenantRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(u => u.Tenant)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<User?> GetByEmployeeIdAsync(
        Guid tenantId,
        string employeeId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(u =>
                u.TenantId == tenantId &&
                u.EmployeeNumber != null &&
                u.EmployeeNumber.ToLower() == employeeId.ToLower(),
                cancellationToken);
    }

    public async Task<User?> GetByRefreshTokenAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken, cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetByRoleAsync(
        Guid tenantId,
        UserRole role,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => u.TenantId == tenantId && u.Role == role)
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetActiveUsersAsync(
        Guid tenantId,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(u => u.TenantId == tenantId && u.Status == UserStatus.Active)
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetApproversAsync(
        Guid tenantId,
        ApprovalLevel level,
        CancellationToken cancellationToken = default)
    {
        // Map approval level to roles
        var roles = level switch
        {
            ApprovalLevel.Analyst => new[] { UserRole.AforeAnalyst, UserRole.Supervisor, UserRole.SystemAdmin },
            ApprovalLevel.Supervisor => new[] { UserRole.Supervisor, UserRole.AforeAdmin, UserRole.SystemAdmin },
            ApprovalLevel.Manager or ApprovalLevel.Director => new[] { UserRole.AforeAdmin, UserRole.SystemAdmin },
            _ => new[] { UserRole.SystemAdmin }
        };

        return await DbSet
            .Where(u => u.TenantId == tenantId &&
                        u.Status == UserStatus.Active &&
                        roles.Contains(u.Role))
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(
        string email,
        Guid? excludeUserId = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(u => u.Email.ToLower() == email.ToLower());

        if (excludeUserId.HasValue)
            query = query.Where(u => u.Id != excludeUserId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> EmployeeIdExistsAsync(
        Guid tenantId,
        string employeeId,
        Guid? excludeUserId = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(u =>
            u.TenantId == tenantId &&
            u.EmployeeNumber != null &&
            u.EmployeeNumber.ToLower() == employeeId.ToLower());

        if (excludeUserId.HasValue)
            query = query.Where(u => u.Id != excludeUserId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<PagedResult<User>> GetPagedAsync(
        Guid tenantId,
        int page,
        int pageSize,
        UserRole? role = null,
        UserStatus? status = null,
        string? searchTerm = null,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(u => u.TenantId == tenantId);

        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        if (status.HasValue)
            query = query.Where(u => u.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var term = searchTerm.ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(term) ||
                u.Name.ToLower().Contains(term) ||
                (u.EmployeeNumber != null && u.EmployeeNumber.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<User>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }
}
