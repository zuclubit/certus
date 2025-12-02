using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Certus.Infrastructure.Data.Repositories;

/// <summary>
/// Repository for ValidatorRule entity operations
/// </summary>
public class ValidatorRuleRepository : BaseRepository<ValidatorRule>, IValidatorRuleRepository
{
    public ValidatorRuleRepository(ApplicationDbContext context) : base(context) { }

    public async Task<List<ValidatorRule>> GetByIdsAsync(
        List<Guid> ids,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => ids.Contains(v.Id))
            .OrderBy(v => v.RunOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ValidatorRule>> GetByFileTypeAsync(
        FileType fileType,
        string? afore = null,
        CancellationToken cancellationToken = default)
    {
        var fileTypeString = fileType.ToString();
        var jsonArrayToMatch = $"[\"{fileTypeString}\"]";

        // Use PostgreSQL jsonb @> operator via FromSqlInterpolated for proper jsonb array containment check
        // This avoids the "operator does not exist: jsonb ~~ jsonb" error from using Contains()
        // Note: Column names are PascalCase as defined by EF Core migrations
        var validators = await Context.Set<ValidatorRule>()
            .FromSqlInterpolated($@"
                SELECT * FROM validator_rules
                WHERE ""IsEnabled"" = true
                AND ""Status"" = {(int)ValidatorStatus.Active}
                AND ""FileTypes"" @> {jsonArrayToMatch}::jsonb")
            .ToListAsync(cancellationToken);

        // Filter by AFORE in memory (typically small result set)
        if (!string.IsNullOrEmpty(afore))
        {
            validators = validators.Where(v =>
                v.Afores == null ||
                v.Afores == "[]" ||
                v.GetAfores()?.Contains(afore) == true).ToList();
        }

        return validators
            .OrderBy(v => v.RunOrder)
            .ThenBy(v => v.Code)
            .ToList();
    }

    public async Task<List<ValidatorRule>> GetByPresetIdAsync(
        Guid presetId,
        CancellationToken cancellationToken = default)
    {
        // First get the preset
        var preset = await Context.Set<ValidatorPreset>()
            .FirstOrDefaultAsync(p => p.Id == presetId, cancellationToken);

        if (preset == null)
            return new List<ValidatorRule>();

        var validatorIds = preset.GetValidatorIds();

        return await DbSet
            .Where(v => validatorIds.Contains(v.Id))
            .Where(v => v.IsEnabled)
            .OrderBy(v => v.RunOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ValidatorRule>> GetByGroupCodeAsync(
        string groupCode,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => v.Category == groupCode)
            .OrderBy(v => v.RunOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ValidatorRule>> GetByCodePatternAsync(
        string pattern,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(v => EF.Functions.ILike(v.Code, $"%{pattern}%") ||
                       EF.Functions.ILike(v.Name, $"%{pattern}%"))
            .OrderBy(v => v.Code)
            .Take(50)
            .ToListAsync(cancellationToken);
    }

    public async Task<Dictionary<FileType, int>> GetActiveCountByFileTypeAsync(
        CancellationToken cancellationToken = default)
    {
        var validators = await DbSet
            .Where(v => v.IsEnabled && v.Status == ValidatorStatus.Active)
            .Select(v => v.FileTypes)
            .ToListAsync(cancellationToken);

        var counts = new Dictionary<FileType, int>();

        foreach (var fileTypes in validators)
        {
            var types = System.Text.Json.JsonSerializer.Deserialize<List<string>>(fileTypes) ?? new();
            foreach (var type in types)
            {
                if (Enum.TryParse<FileType>(type, out var ft))
                {
                    counts[ft] = counts.GetValueOrDefault(ft, 0) + 1;
                }
            }
        }

        return counts;
    }

    public async Task<List<ValidatorPreset>> GetPresetsAsync(
        FileType? fileType = null,
        CancellationToken cancellationToken = default)
    {
        var query = Context.Set<ValidatorPreset>()
            .Where(p => p.IsEnabled);

        if (fileType.HasValue)
        {
            query = query.Where(p => p.FileType == fileType.Value);
        }

        return await query
            .OrderBy(p => p.FileType)
            .ThenByDescending(p => p.IsDefault)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ValidatorGroup>> GetGroupsAsync(
        CancellationToken cancellationToken = default)
    {
        return await Context.Set<ValidatorGroup>()
            .Where(g => g.IsEnabled)
            .OrderBy(g => g.SortOrder)
            .ThenBy(g => g.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ValidatorRule>> GetWithStatisticsAsync(
        int top = 10,
        bool orderByFailRate = true,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Where(v => v.ExecutionCount > 0);

        if (orderByFailRate)
        {
            // Order by failure rate (highest first)
            query = query.OrderByDescending(v =>
                v.ExecutionCount > 0 ? (double)v.FailCount / v.ExecutionCount : 0);
        }
        else
        {
            // Order by execution count (most used first)
            query = query.OrderByDescending(v => v.ExecutionCount);
        }

        return await query
            .Take(top)
            .ToListAsync(cancellationToken);
    }
}
