namespace Certus.Domain.Common;

/// <summary>
/// Result pattern implementation for functional error handling (2025 best practices)
/// Eliminates exception-based control flow for expected failures
/// </summary>
public class Result
{
    protected Result(bool isSuccess, Error error)
    {
        if (isSuccess && error != Error.None)
            throw new InvalidOperationException("Success result cannot have error");
        if (!isSuccess && error == Error.None)
            throw new InvalidOperationException("Failure result must have error");

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    public static Result Success() => new(true, Error.None);
    public static Result Failure(Error error) => new(false, error);
    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);
    public static Result<TValue> Failure<TValue>(Error error) => new(default, false, error);

    public static Result<TValue> Create<TValue>(TValue? value) =>
        value is not null ? Success(value) : Failure<TValue>(Error.NullValue);

    public static Result FirstFailureOrSuccess(params Result[] results)
    {
        foreach (var result in results)
        {
            if (result.IsFailure)
                return result;
        }
        return Success();
    }
}

/// <summary>
/// Generic result with value
/// </summary>
public class Result<TValue> : Result
{
    private readonly TValue? _value;

    protected internal Result(TValue? value, bool isSuccess, Error error)
        : base(isSuccess, error)
    {
        _value = value;
    }

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("Cannot access value of failed result");

    public static implicit operator Result<TValue>(TValue? value) => Create(value);

    public Result<TNext> Map<TNext>(Func<TValue, TNext> mapper) =>
        IsSuccess ? Result.Success(mapper(Value)) : Result.Failure<TNext>(Error);

    public async Task<Result<TNext>> MapAsync<TNext>(Func<TValue, Task<TNext>> mapper) =>
        IsSuccess ? Result.Success(await mapper(Value)) : Result.Failure<TNext>(Error);

    public Result<TNext> Bind<TNext>(Func<TValue, Result<TNext>> binder) =>
        IsSuccess ? binder(Value) : Result.Failure<TNext>(Error);

    public async Task<Result<TNext>> BindAsync<TNext>(Func<TValue, Task<Result<TNext>>> binder) =>
        IsSuccess ? await binder(Value) : Result.Failure<TNext>(Error);

    public TValue GetValueOrDefault(TValue defaultValue = default!) =>
        IsSuccess ? Value : defaultValue;

    public Result<TValue> Ensure(Func<TValue, bool> predicate, Error error) =>
        IsSuccess && !predicate(Value) ? Result.Failure<TValue>(error) : this;

    public Result<TValue> Tap(Action<TValue> action)
    {
        if (IsSuccess)
            action(Value);
        return this;
    }
}

/// <summary>
/// Error representation with code, message, and type classification
/// </summary>
public sealed record Error(string Code, string Message, ErrorType Type = ErrorType.Failure)
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.None);
    public static readonly Error NullValue = new("Error.NullValue", "Value cannot be null", ErrorType.Validation);

    // Factory methods for common error types
    public static Error AsValidation(string code, string message) => new(code, message, ErrorType.Validation);
    public static Error NotFound(string code, string message) => new(code, message, ErrorType.NotFound);
    public static Error Conflict(string code, string message) => new(code, message, ErrorType.Conflict);
    public static Error Unauthorized(string code, string message) => new(code, message, ErrorType.Unauthorized);
    public static Error Forbidden(string code, string message) => new(code, message, ErrorType.Forbidden);
    public static Error BusinessRule(string code, string message) => new(code, message, ErrorType.BusinessRule);
    public static Error External(string code, string message) => new(code, message, ErrorType.External);

    // Domain-specific errors
    public static class Validation
    {
        public static Error InvalidCurp(string value) =>
            new("Validation.InvalidCurp", $"CURP inválida: {value}", ErrorType.Validation);
        public static Error InvalidRfc(string value) =>
            new("Validation.InvalidRfc", $"RFC inválido: {value}", ErrorType.Validation);
        public static Error InvalidNss(string value) =>
            new("Validation.InvalidNss", $"NSS inválido: {value}", ErrorType.Validation);
        public static Error InvalidAccount(string value) =>
            new("Validation.InvalidAccount", $"Cuenta inválida: {value}", ErrorType.Validation);
        public static Error FileEmpty =>
            new("Validation.FileEmpty", "El archivo está vacío", ErrorType.Validation);
        public static Error FileTooLarge(long size, long maxSize) =>
            new("Validation.FileTooLarge", $"Archivo demasiado grande: {size} bytes (máximo: {maxSize})", ErrorType.Validation);
        public static Error InvalidFileFormat(string format) =>
            new("Validation.InvalidFileFormat", $"Formato de archivo no válido: {format}", ErrorType.Validation);
    }

    public static class Domain
    {
        public static Error ValidationNotFound(Guid id) =>
            NotFound("Domain.ValidationNotFound", $"Validación no encontrada: {id}");
        public static Error ValidatorNotFound(Guid id) =>
            NotFound("Domain.ValidatorNotFound", $"Validador no encontrado: {id}");
        public static Error UserNotFound(Guid id) =>
            NotFound("Domain.UserNotFound", $"Usuario no encontrado: {id}");
        public static Error ApprovalNotFound(Guid id) =>
            NotFound("Domain.ApprovalNotFound", $"Aprobación no encontrada: {id}");
        public static Error AlreadyProcessed =>
            Conflict("Domain.AlreadyProcessed", "La validación ya fue procesada");
        public static Error CannotSubstitute =>
            BusinessRule("Domain.CannotSubstitute", "No se puede sustituir una validación en proceso");
        public static Error UnauthorizedAction =>
            Forbidden("Domain.UnauthorizedAction", "No tiene permiso para realizar esta acción");
    }
}

public enum ErrorType
{
    None = 0,
    Failure = 1,
    Validation = 2,
    NotFound = 3,
    Conflict = 4,
    Unauthorized = 5,
    Forbidden = 6,
    BusinessRule = 7,
    External = 8
}

/// <summary>
/// ValidationResult for aggregating multiple validation errors
/// </summary>
public sealed class ValidationResult : Result
{
    private ValidationResult(Error[] errors)
        : base(false, Error.AsValidation("Validation.Multiple", "Multiple validation errors occurred"))
    {
        Errors = errors;
    }

    public Error[] Errors { get; }

    public static ValidationResult WithErrors(params Error[] errors) => new(errors);
}

public sealed class ValidationResult<TValue> : Result<TValue>
{
    private ValidationResult(Error[] errors)
        : base(default, false, Error.AsValidation("Validation.Multiple", "Multiple validation errors occurred"))
    {
        Errors = errors;
    }

    public Error[] Errors { get; } = Array.Empty<Error>();

    public static ValidationResult<TValue> WithErrors(params Error[] errors) => new(errors);
}
