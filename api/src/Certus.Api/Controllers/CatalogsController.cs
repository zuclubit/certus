using Certus.Domain.Entities;
using Certus.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Certus.Api.Controllers;

/// <summary>
/// Controller para gestión de Catálogos CONSAR
/// Proporciona acceso a catálogos normativos utilizados en validaciones
/// </summary>
[Authorize]
public class CatalogsController : BaseController
{
    private readonly ICatalogRepository _catalogRepository;
    private readonly ICatalogEntryRepository _catalogEntryRepository;
    private readonly ILogger<CatalogsController> _logger;

    public CatalogsController(
        ICatalogRepository catalogRepository,
        ICatalogEntryRepository catalogEntryRepository,
        ILogger<CatalogsController> logger)
    {
        _catalogRepository = catalogRepository;
        _catalogEntryRepository = catalogEntryRepository;
        _logger = logger;
    }

    /// <summary>
    /// Obtener lista de todos los catálogos activos
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Obtener todos los catálogos", Description = "Retorna la lista de catálogos CONSAR activos")]
    [ProducesResponseType(typeof(IEnumerable<CatalogSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CatalogSummaryDto>>> GetCatalogs(
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var catalogs = includeInactive
            ? await _catalogRepository.GetAllAsync(cancellationToken)
            : await _catalogRepository.GetActiveAsync(cancellationToken);

        var dtos = catalogs.Select(c => new CatalogSummaryDto
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            Description = c.Description,
            Version = c.Version,
            Source = c.Source,
            IsActive = c.IsActive,
            EffectiveFrom = c.EffectiveFrom,
            EffectiveTo = c.EffectiveTo
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Obtener catálogo por ID con todas sus entradas
    /// </summary>
    [HttpGet("{id:guid}")]
    [SwaggerOperation(Summary = "Obtener catálogo por ID", Description = "Retorna el catálogo con todas sus entradas")]
    [ProducesResponseType(typeof(CatalogDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CatalogDetailDto>> GetCatalog(Guid id, CancellationToken cancellationToken)
    {
        var catalog = await _catalogRepository.GetByIdAsync(id, cancellationToken);

        if (catalog == null)
            return NotFound(new { error = "Catálogo no encontrado" });

        var entries = await _catalogEntryRepository.GetActiveByCatalogAsync(id, cancellationToken);

        var dto = new CatalogDetailDto
        {
            Id = catalog.Id,
            Code = catalog.Code,
            Name = catalog.Name,
            Description = catalog.Description,
            Version = catalog.Version,
            Source = catalog.Source,
            IsActive = catalog.IsActive,
            EffectiveFrom = catalog.EffectiveFrom,
            EffectiveTo = catalog.EffectiveTo,
            Entries = entries.Select(e => new CatalogEntryDto
            {
                Id = e.Id,
                Key = e.Key,
                Value = e.Value,
                DisplayName = e.DisplayName,
                Description = e.Description,
                SortOrder = e.SortOrder,
                ParentKey = e.ParentKey,
                IsActive = e.IsActive
            }).ToList()
        };

        return Ok(dto);
    }

    /// <summary>
    /// Obtener catálogo por código
    /// </summary>
    [HttpGet("code/{code}")]
    [SwaggerOperation(Summary = "Obtener catálogo por código", Description = "Busca un catálogo por su código único")]
    [ProducesResponseType(typeof(CatalogDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CatalogDetailDto>> GetCatalogByCode(string code, CancellationToken cancellationToken)
    {
        var catalog = await _catalogRepository.GetByCodeWithEntriesAsync(code, cancellationToken);

        if (catalog == null)
            return NotFound(new { error = $"Catálogo con código '{code}' no encontrado" });

        var dto = new CatalogDetailDto
        {
            Id = catalog.Id,
            Code = catalog.Code,
            Name = catalog.Name,
            Description = catalog.Description,
            Version = catalog.Version,
            Source = catalog.Source,
            IsActive = catalog.IsActive,
            EffectiveFrom = catalog.EffectiveFrom,
            EffectiveTo = catalog.EffectiveTo,
            Entries = catalog.Entries.Select(e => new CatalogEntryDto
            {
                Id = e.Id,
                Key = e.Key,
                Value = e.Value,
                DisplayName = e.DisplayName,
                Description = e.Description,
                SortOrder = e.SortOrder,
                ParentKey = e.ParentKey,
                IsActive = e.IsActive
            }).ToList()
        };

        return Ok(dto);
    }

    /// <summary>
    /// Obtener catálogos por fuente (CONSAR, INTERNO)
    /// </summary>
    [HttpGet("source/{source}")]
    [SwaggerOperation(Summary = "Obtener catálogos por fuente", Description = "Filtra catálogos por su fuente de origen")]
    [ProducesResponseType(typeof(IEnumerable<CatalogSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CatalogSummaryDto>>> GetCatalogsBySource(
        string source,
        CancellationToken cancellationToken)
    {
        var catalogs = await _catalogRepository.GetBySourceAsync(source.ToUpperInvariant(), cancellationToken);

        var dtos = catalogs.Select(c => new CatalogSummaryDto
        {
            Id = c.Id,
            Code = c.Code,
            Name = c.Name,
            Description = c.Description,
            Version = c.Version,
            Source = c.Source,
            IsActive = c.IsActive,
            EffectiveFrom = c.EffectiveFrom,
            EffectiveTo = c.EffectiveTo
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Buscar entradas en un catálogo
    /// </summary>
    [HttpGet("{catalogId:guid}/entries/search")]
    [SwaggerOperation(Summary = "Buscar entradas de catálogo", Description = "Búsqueda de entradas por clave o valor")]
    [ProducesResponseType(typeof(IEnumerable<CatalogEntryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CatalogEntryDto>>> SearchCatalogEntries(
        Guid catalogId,
        [FromQuery] string query,
        [FromQuery] int maxResults = 50,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest(new { error = "El término de búsqueda es requerido" });

        var entries = await _catalogEntryRepository.SearchAsync(catalogId, query, maxResults, cancellationToken);

        var dtos = entries.Select(e => new CatalogEntryDto
        {
            Id = e.Id,
            Key = e.Key,
            Value = e.Value,
            DisplayName = e.DisplayName,
            Description = e.Description,
            SortOrder = e.SortOrder,
            ParentKey = e.ParentKey,
            IsActive = e.IsActive
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Obtener entrada específica de un catálogo
    /// </summary>
    [HttpGet("{catalogId:guid}/entries/{key}")]
    [SwaggerOperation(Summary = "Obtener entrada por clave", Description = "Obtiene una entrada específica por su clave")]
    [ProducesResponseType(typeof(CatalogEntryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CatalogEntryDto>> GetCatalogEntry(
        Guid catalogId,
        string key,
        CancellationToken cancellationToken)
    {
        var entry = await _catalogEntryRepository.GetByKeyAsync(catalogId, key, cancellationToken);

        if (entry == null)
            return NotFound(new { error = $"Entrada con clave '{key}' no encontrada" });

        var dto = new CatalogEntryDto
        {
            Id = entry.Id,
            Key = entry.Key,
            Value = entry.Value,
            DisplayName = entry.DisplayName,
            Description = entry.Description,
            SortOrder = entry.SortOrder,
            ParentKey = entry.ParentKey,
            IsActive = entry.IsActive
        };

        return Ok(dto);
    }

    /// <summary>
    /// Obtener entradas hijas de una clave padre
    /// </summary>
    [HttpGet("{catalogId:guid}/entries/{parentKey}/children")]
    [SwaggerOperation(Summary = "Obtener entradas hijas", Description = "Obtiene las entradas que dependen de una clave padre")]
    [ProducesResponseType(typeof(IEnumerable<CatalogEntryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CatalogEntryDto>>> GetChildEntries(
        Guid catalogId,
        string parentKey,
        CancellationToken cancellationToken)
    {
        var entries = await _catalogEntryRepository.GetByParentKeyAsync(catalogId, parentKey, cancellationToken);

        var dtos = entries.Select(e => new CatalogEntryDto
        {
            Id = e.Id,
            Key = e.Key,
            Value = e.Value,
            DisplayName = e.DisplayName,
            Description = e.Description,
            SortOrder = e.SortOrder,
            ParentKey = e.ParentKey,
            IsActive = e.IsActive
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Crear nuevo catálogo (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Crear catálogo", Description = "Crea un nuevo catálogo CONSAR")]
    [ProducesResponseType(typeof(CatalogSummaryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CatalogSummaryDto>> CreateCatalog(
        [FromBody] CreateCatalogRequest request,
        CancellationToken cancellationToken)
    {
        if (await _catalogRepository.CodeExistsAsync(request.Code, cancellationToken: cancellationToken))
            return BadRequest(new { error = $"Ya existe un catálogo con el código '{request.Code}'" });

        var catalog = Catalog.Create(
            request.Code,
            request.Name,
            request.Description,
            request.Version,
            request.Source);

        await _catalogRepository.AddAsync(catalog, cancellationToken);

        _logger.LogInformation("Catalog {CatalogCode} created by user {UserId}", request.Code, CurrentUserId);

        var dto = new CatalogSummaryDto
        {
            Id = catalog.Id,
            Code = catalog.Code,
            Name = catalog.Name,
            Description = catalog.Description,
            Version = catalog.Version,
            Source = catalog.Source,
            IsActive = catalog.IsActive,
            EffectiveFrom = catalog.EffectiveFrom,
            EffectiveTo = catalog.EffectiveTo
        };

        return CreatedAtAction(nameof(GetCatalog), new { id = catalog.Id }, dto);
    }

    /// <summary>
    /// Agregar entrada a un catálogo (Admin only)
    /// </summary>
    [HttpPost("{catalogId:guid}/entries")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Agregar entrada", Description = "Agrega una nueva entrada a un catálogo")]
    [ProducesResponseType(typeof(CatalogEntryDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CatalogEntryDto>> AddCatalogEntry(
        Guid catalogId,
        [FromBody] CreateCatalogEntryRequest request,
        CancellationToken cancellationToken)
    {
        var catalog = await _catalogRepository.GetByIdAsync(catalogId, cancellationToken);
        if (catalog == null)
            return NotFound(new { error = "Catálogo no encontrado" });

        if (await _catalogEntryRepository.KeyExistsAsync(catalogId, request.Key, cancellationToken: cancellationToken))
            return BadRequest(new { error = $"Ya existe una entrada con la clave '{request.Key}'" });

        var entry = CatalogEntry.Create(
            catalogId,
            request.Key,
            request.Value,
            request.DisplayName,
            request.Description,
            request.SortOrder,
            request.ParentKey);

        await _catalogEntryRepository.AddAsync(entry, cancellationToken);

        _logger.LogInformation(
            "Entry {EntryKey} added to catalog {CatalogId} by user {UserId}",
            request.Key, catalogId, CurrentUserId);

        var dto = new CatalogEntryDto
        {
            Id = entry.Id,
            Key = entry.Key,
            Value = entry.Value,
            DisplayName = entry.DisplayName,
            Description = entry.Description,
            SortOrder = entry.SortOrder,
            ParentKey = entry.ParentKey,
            IsActive = entry.IsActive
        };

        return CreatedAtAction(nameof(GetCatalogEntry), new { catalogId, key = entry.Key }, dto);
    }

    /// <summary>
    /// Desactivar un catálogo (Admin only)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "RequireAdmin")]
    [SwaggerOperation(Summary = "Desactivar catálogo", Description = "Desactiva un catálogo (soft delete)")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateCatalog(Guid id, CancellationToken cancellationToken)
    {
        var catalog = await _catalogRepository.GetByIdAsync(id, cancellationToken);
        if (catalog == null)
            return NotFound(new { error = "Catálogo no encontrado" });

        catalog.Deactivate();
        _catalogRepository.Update(catalog);

        _logger.LogInformation("Catalog {CatalogId} deactivated by user {UserId}", id, CurrentUserId);

        return NoContent();
    }
}

// DTOs
public record CatalogSummaryDto
{
    public Guid Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Version { get; init; }
    public string? Source { get; init; }
    public bool IsActive { get; init; }
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
}

public record CatalogDetailDto : CatalogSummaryDto
{
    public IReadOnlyList<CatalogEntryDto> Entries { get; init; } = new List<CatalogEntryDto>();
}

public record CatalogEntryDto
{
    public Guid Id { get; init; }
    public string Key { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
    public string? DisplayName { get; init; }
    public string? Description { get; init; }
    public int? SortOrder { get; init; }
    public string? ParentKey { get; init; }
    public bool IsActive { get; init; }
}

public record CreateCatalogRequest(
    string Code,
    string Name,
    string? Description = null,
    string? Version = null,
    string? Source = "CONSAR");

public record CreateCatalogEntryRequest(
    string Key,
    string Value,
    string? DisplayName = null,
    string? Description = null,
    int? SortOrder = null,
    string? ParentKey = null);
