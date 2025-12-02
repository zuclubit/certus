using Certus.Domain.Common;

namespace Certus.Domain.ValueObjects;

/// <summary>
/// Money value object for handling currency amounts with proper precision
/// </summary>
public sealed class Money : ValueObject, IComparable<Money>
{
    public static readonly Money Zero = new(0m, Currency.MXN);

    private Money(decimal amount, Currency currency)
    {
        Amount = Math.Round(amount, 2, MidpointRounding.ToEven); // Banker's rounding
        Currency = currency;
    }

    public decimal Amount { get; }
    public Currency Currency { get; }

    public static Result<Money> Create(decimal amount, Currency currency = Currency.MXN)
    {
        return Result.Success(new Money(amount, currency));
    }

    public static Money From(decimal amount, Currency currency = Currency.MXN) =>
        new(amount, currency);

    /// <summary>
    /// Create from cents/centavos (integer amount * 100)
    /// </summary>
    public static Money FromCents(long cents, Currency currency = Currency.MXN) =>
        new(cents / 100m, currency);

    /// <summary>
    /// Parse from CONSAR format (15 digits, 2 decimals implied)
    /// Format: 000000000000000 = 0000000000000.00
    /// </summary>
    public static Result<Money> FromConsarFormat(string? value, Currency currency = Currency.MXN)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<Money>(Error.AsValidation("Money.Empty", "El monto está vacío"));

        // Remove leading zeros and parse
        var trimmed = value.TrimStart('0');
        if (string.IsNullOrEmpty(trimmed))
            return Result.Success(Zero);

        if (!long.TryParse(value, out var cents))
            return Result.Failure<Money>(Error.AsValidation("Money.InvalidFormat", $"Formato de monto inválido: {value}"));

        return Result.Success(FromCents(cents, currency));
    }

    public long ToCents() => (long)(Amount * 100);

    /// <summary>
    /// Convert to CONSAR format (15 digits, right-justified with zeros)
    /// </summary>
    public string ToConsarFormat() =>
        ToCents().ToString().PadLeft(15, '0');

    public Money Add(Money other)
    {
        EnsureSameCurrency(other);
        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        EnsureSameCurrency(other);
        return new Money(Amount - other.Amount, Currency);
    }

    public Money Multiply(decimal factor) =>
        new(Amount * factor, Currency);

    public Money Divide(decimal divisor)
    {
        if (divisor == 0)
            throw new DivideByZeroException("Cannot divide money by zero");
        return new Money(Amount / divisor, Currency);
    }

    public Money Negate() =>
        new(-Amount, Currency);

    public Money Abs() =>
        new(Math.Abs(Amount), Currency);

    public bool IsZero => Amount == 0;
    public bool IsPositive => Amount > 0;
    public bool IsNegative => Amount < 0;

    private void EnsureSameCurrency(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException($"Cannot operate on different currencies: {Currency} vs {other.Currency}");
    }

    public int CompareTo(Money? other)
    {
        if (other == null) return 1;
        EnsureSameCurrency(other);
        return Amount.CompareTo(other.Amount);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    public override string ToString() => $"{Currency} {Amount:N2}";

    public string ToDisplayString() => Currency switch
    {
        Currency.MXN => $"${Amount:N2} MXN",
        Currency.USD => $"${Amount:N2} USD",
        Currency.EUR => $"€{Amount:N2}",
        _ => $"{Amount:N2} {Currency}"
    };

    // Operator overloads
    public static Money operator +(Money a, Money b) => a.Add(b);
    public static Money operator -(Money a, Money b) => a.Subtract(b);
    public static Money operator *(Money a, decimal b) => a.Multiply(b);
    public static Money operator /(Money a, decimal b) => a.Divide(b);
    public static Money operator -(Money a) => a.Negate();
    public static bool operator <(Money a, Money b) => a.CompareTo(b) < 0;
    public static bool operator >(Money a, Money b) => a.CompareTo(b) > 0;
    public static bool operator <=(Money a, Money b) => a.CompareTo(b) <= 0;
    public static bool operator >=(Money a, Money b) => a.CompareTo(b) >= 0;
}

public enum Currency
{
    MXN, // Mexican Peso
    USD, // US Dollar
    EUR, // Euro
    UDI  // Unidad de Inversión (Mexico)
}
