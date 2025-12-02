using Certus.Domain.Entities;
using Certus.Domain.Enums;

namespace Certus.Domain.Interfaces;

/// <summary>
/// Repository interface for ValidatorRule entity operations
/// </summary>
public interface IValidatorRuleRepository : IRepository<ValidatorRule>
{
    /// <summary>
    /// Get validators by their IDs
    /// </summary>
    Task<List<ValidatorRule>> GetByIdsAsync(List<Guid> ids, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get validators applicable to a specific file type and optionally AFORE
    /// </summary>
    Task<List<ValidatorRule>> GetByFileTypeAsync(
        FileType fileType,
        string? afore = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get validators from a specific preset
    /// </summary>
    Task<List<ValidatorRule>> GetByPresetIdAsync(Guid presetId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get validators by group code
    /// </summary>
    Task<List<ValidatorRule>> GetByGroupCodeAsync(string groupCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get validators by code pattern (for searching)
    /// </summary>
    Task<List<ValidatorRule>> GetByCodePatternAsync(string pattern, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get active validators count by file type
    /// </summary>
    Task<Dictionary<FileType, int>> GetActiveCountByFileTypeAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get validator presets by file type
    /// </summary>
    Task<List<ValidatorPreset>> GetPresetsAsync(FileType? fileType = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get validator groups
    /// </summary>
    Task<List<ValidatorGroup>> GetGroupsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get validators with execution statistics
    /// </summary>
    Task<List<ValidatorRule>> GetWithStatisticsAsync(
        int top = 10,
        bool orderByFailRate = true,
        CancellationToken cancellationToken = default);
}
