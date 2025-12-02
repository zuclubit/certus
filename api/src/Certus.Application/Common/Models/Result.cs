namespace Certus.Application.Common.Models;

/// <summary>
/// Resultado de operación genérico
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string? Error { get; }
    public string? ErrorCode { get; }
    public IReadOnlyList<string> Errors { get; }

    protected Result(bool isSuccess, string? error, string? errorCode = null, IEnumerable<string>? errors = null)
    {
        IsSuccess = isSuccess;
        Error = error;
        ErrorCode = errorCode;
        Errors = errors?.ToList().AsReadOnly() ?? (IReadOnlyList<string>)Array.Empty<string>();
    }

    public static Result Success() => new(true, null);
    public static Result Failure(string error, string? errorCode = null) => new(false, error, errorCode);
    public static Result Failure(IEnumerable<string> errors) => new(false, errors.FirstOrDefault(), null, errors);

    public static Result<T> Success<T>(T value) => new(value, true, null);
    public static Result<T> Failure<T>(string error, string? errorCode = null) => new(default, false, error, errorCode);
    public static Result<T> Failure<T>(IEnumerable<string> errors) => new(default, false, errors.FirstOrDefault(), null, errors);
}

/// <summary>
/// Resultado de operación con valor
/// </summary>
public class Result<T> : Result
{
    public T? Value { get; }

    internal Result(T? value, bool isSuccess, string? error, string? errorCode = null, IEnumerable<string>? errors = null)
        : base(isSuccess, error, errorCode, errors)
    {
        Value = value;
    }

    public static implicit operator Result<T>(T value) => Success(value);
}

/// <summary>
/// Resultado paginado
/// </summary>
public class PaginatedResult<T>
{
    public IReadOnlyList<T> Items { get; }
    public int Page { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;

    public PaginatedResult(IReadOnlyList<T> items, int page, int pageSize, int totalCount)
    {
        Items = items;
        Page = page;
        PageSize = pageSize;
        TotalCount = totalCount;
    }

    public static PaginatedResult<T> Create(IReadOnlyList<T> items, int page, int pageSize, int totalCount)
    {
        return new PaginatedResult<T>(items, page, pageSize, totalCount);
    }
}
