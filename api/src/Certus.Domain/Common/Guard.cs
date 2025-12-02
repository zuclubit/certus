using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;

namespace Certus.Domain.Common;

/// <summary>
/// Guard clauses for domain validation and preconditions
/// Provides fluent validation API with Result pattern support
/// </summary>
public static class Guard
{
    /// <summary>
    /// Throws ArgumentNullException if value is null
    /// </summary>
    public static T NotNull<T>(
        [NotNull] T? value,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (value is null)
            throw new ArgumentNullException(paramName);
        return value;
    }

    /// <summary>
    /// Throws ArgumentException if string is null or empty
    /// </summary>
    public static string NotNullOrEmpty(
        [NotNull] string? value,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (string.IsNullOrEmpty(value))
            throw new ArgumentException("Value cannot be null or empty.", paramName);
        return value;
    }

    /// <summary>
    /// Throws ArgumentException if string is null, empty, or whitespace
    /// </summary>
    public static string NotNullOrWhiteSpace(
        [NotNull] string? value,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new ArgumentException("Value cannot be null, empty, or whitespace.", paramName);
        return value;
    }

    /// <summary>
    /// Throws ArgumentException if GUID is empty
    /// </summary>
    public static Guid NotEmpty(
        Guid value,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (value == Guid.Empty)
            throw new ArgumentException("Value cannot be empty GUID.", paramName);
        return value;
    }

    /// <summary>
    /// Throws ArgumentException if collection is null or empty
    /// </summary>
    public static IEnumerable<T> NotNullOrEmpty<T>(
        [NotNull] IEnumerable<T>? value,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (value is null || !value.Any())
            throw new ArgumentException("Collection cannot be null or empty.", paramName);
        return value;
    }

    /// <summary>
    /// Throws ArgumentOutOfRangeException if value is not in range
    /// </summary>
    public static T InRange<T>(
        T value,
        T min,
        T max,
        [CallerArgumentExpression(nameof(value))] string? paramName = null) where T : IComparable<T>
    {
        if (value.CompareTo(min) < 0 || value.CompareTo(max) > 0)
            throw new ArgumentOutOfRangeException(paramName, value, $"Value must be between {min} and {max}.");
        return value;
    }

    /// <summary>
    /// Throws ArgumentOutOfRangeException if value is negative
    /// </summary>
    public static int NotNegative(
        int value,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (value < 0)
            throw new ArgumentOutOfRangeException(paramName, value, "Value cannot be negative.");
        return value;
    }

    /// <summary>
    /// Throws ArgumentOutOfRangeException if value is not positive
    /// </summary>
    public static int Positive(
        int value,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (value <= 0)
            throw new ArgumentOutOfRangeException(paramName, value, "Value must be positive.");
        return value;
    }

    /// <summary>
    /// Throws ArgumentOutOfRangeException if decimal value is negative
    /// </summary>
    public static decimal NotNegative(
        decimal value,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (value < 0)
            throw new ArgumentOutOfRangeException(paramName, value, "Value cannot be negative.");
        return value;
    }

    /// <summary>
    /// Throws ArgumentException if string exceeds max length
    /// </summary>
    public static string MaxLength(
        string value,
        int maxLength,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (value.Length > maxLength)
            throw new ArgumentException($"Value cannot exceed {maxLength} characters.", paramName);
        return value;
    }

    /// <summary>
    /// Throws ArgumentException if string is shorter than min length
    /// </summary>
    public static string MinLength(
        string value,
        int minLength,
        [CallerArgumentExpression(nameof(value))] string? paramName = null)
    {
        if (value.Length < minLength)
            throw new ArgumentException($"Value must be at least {minLength} characters.", paramName);
        return value;
    }

    /// <summary>
    /// Throws ArgumentException if condition is false
    /// </summary>
    public static void Against(
        [DoesNotReturnIf(true)] bool condition,
        string message,
        [CallerArgumentExpression(nameof(condition))] string? paramName = null)
    {
        if (condition)
            throw new ArgumentException(message, paramName);
    }

    /// <summary>
    /// Throws ArgumentException if condition is true
    /// </summary>
    public static void Ensure(
        [DoesNotReturnIf(false)] bool condition,
        string message,
        [CallerArgumentExpression(nameof(condition))] string? paramName = null)
    {
        if (!condition)
            throw new ArgumentException(message, paramName);
    }

    /// <summary>
    /// Result-based validation - returns Error if validation fails
    /// </summary>
    public static class Result
    {
        public static Common.Result<T> NotNull<T>(T? value, Error error) =>
            value is null ? Common.Result.Failure<T>(error) : Common.Result.Success(value);

        public static Common.Result NotNullOrEmpty(string? value, Error error) =>
            string.IsNullOrEmpty(value) ? Common.Result.Failure(error) : Common.Result.Success();

        public static Common.Result NotNullOrWhiteSpace(string? value, Error error) =>
            string.IsNullOrWhiteSpace(value) ? Common.Result.Failure(error) : Common.Result.Success();

        public static Common.Result NotEmpty(Guid value, Error error) =>
            value == Guid.Empty ? Common.Result.Failure(error) : Common.Result.Success();

        public static Common.Result<T> InRange<T>(T value, T min, T max, Error error) where T : IComparable<T> =>
            value.CompareTo(min) < 0 || value.CompareTo(max) > 0
                ? Common.Result.Failure<T>(error)
                : Common.Result.Success(value);

        public static Common.Result Ensure(bool condition, Error error) =>
            condition ? Common.Result.Success() : Common.Result.Failure(error);
    }
}
