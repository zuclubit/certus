namespace Certus.Domain.Common;

/// <summary>
/// Base class for Value Objects following DDD principles
/// Value Objects are immutable and compared by their values, not identity
/// </summary>
public abstract class ValueObject : IEquatable<ValueObject>
{
    /// <summary>
    /// Override in derived classes to define equality components
    /// </summary>
    protected abstract IEnumerable<object> GetEqualityComponents();

    public override bool Equals(object? obj)
    {
        if (obj == null || obj.GetType() != GetType())
            return false;

        var other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    public bool Equals(ValueObject? other)
    {
        return Equals((object?)other);
    }

    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Select(x => x?.GetHashCode() ?? 0)
            .Aggregate((x, y) => x ^ y);
    }

    public static bool operator ==(ValueObject? a, ValueObject? b)
    {
        if (a is null && b is null)
            return true;

        if (a is null || b is null)
            return false;

        return a.Equals(b);
    }

    public static bool operator !=(ValueObject? a, ValueObject? b)
    {
        return !(a == b);
    }
}

/// <summary>
/// Value Object with a single typed value
/// </summary>
public abstract class SingleValueObject<T> : ValueObject where T : IComparable<T>
{
    protected SingleValueObject(T value)
    {
        Value = value;
    }

    public T Value { get; }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value!;
    }

    public override string ToString() => Value?.ToString() ?? string.Empty;

    public static implicit operator T(SingleValueObject<T> vo) => vo.Value;
}
