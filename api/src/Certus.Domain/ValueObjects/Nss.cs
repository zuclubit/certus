using System.Text.RegularExpressions;
using Certus.Domain.Common;

namespace Certus.Domain.ValueObjects;

/// <summary>
/// NSS - Número de Seguro Social (México - IMSS)
/// 11 dígitos con validación de dígito verificador
/// </summary>
public sealed partial class Nss : ValueObject
{
    private static readonly Regex NssRegex = GenerateNssRegex();

    private Nss(string value)
    {
        Value = value;
    }

    public string Value { get; }

    // Extracted components
    public string SubdelegacionRegistro => Value[..2];  // Delegación IMSS donde se registró
    public string AñoAfiliacion => Value.Substring(2, 2); // Últimos 2 dígitos del año
    public string AñoNacimiento => Value.Substring(4, 2); // Últimos 2 dígitos del año nacimiento
    public string ConsecutivoAfiliacion => Value.Substring(6, 4); // Número consecutivo
    public char DigitoVerificador => Value[10];

    public static Result<Nss> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<Nss>(Error.Validation.InvalidNss("vacío"));

        // Remove any spaces or hyphens
        var normalized = value.Trim().Replace(" ", "").Replace("-", "");

        if (normalized.Length != 11)
            return Result.Failure<Nss>(Error.Validation.InvalidNss($"longitud incorrecta: {normalized.Length}"));

        if (!NssRegex.IsMatch(normalized))
            return Result.Failure<Nss>(Error.Validation.InvalidNss(normalized));

        // Validate subdelegación (01-99)
        var subdelegacion = int.Parse(normalized[..2]);
        if (subdelegacion < 1 || subdelegacion > 99)
            return Result.Failure<Nss>(Error.Validation.InvalidNss("subdelegación inválida"));

        // Validate verification digit using IMSS algorithm (Luhn variant)
        var calculatedDigit = CalculateVerificationDigit(normalized[..10]);
        if (calculatedDigit != normalized[10])
            return Result.Failure<Nss>(Error.Validation.InvalidNss("dígito verificador incorrecto"));

        return Result.Success(new Nss(normalized));
    }

    /// <summary>
    /// Validates NSS without creating instance (for batch validation)
    /// </summary>
    public static bool IsValid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var normalized = value.Trim().Replace(" ", "").Replace("-", "");

        if (normalized.Length != 11 || !NssRegex.IsMatch(normalized))
            return false;

        var subdelegacion = int.Parse(normalized[..2]);
        if (subdelegacion < 1 || subdelegacion > 99)
            return false;

        return CalculateVerificationDigit(normalized[..10]) == normalized[10];
    }

    /// <summary>
    /// Calculate verification digit using IMSS algorithm (Luhn variant)
    /// </summary>
    private static char CalculateVerificationDigit(string nss10)
    {
        var sum = 0;

        for (var i = 0; i < 10; i++)
        {
            var digit = nss10[i] - '0';

            // Multiply by 2 for even positions (0-indexed)
            if (i % 2 == 0)
            {
                digit *= 2;
                if (digit > 9)
                    digit -= 9;
            }

            sum += digit;
        }

        var checkDigit = (10 - (sum % 10)) % 10;
        return checkDigit.ToString()[0];
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    /// <summary>
    /// Format NSS with separators for display: XX-XX-XX-XXXX-X
    /// </summary>
    public string ToFormattedString() =>
        $"{Value[..2]}-{Value.Substring(2, 2)}-{Value.Substring(4, 2)}-{Value.Substring(6, 4)}-{Value[10]}";

    public static implicit operator string(Nss nss) => nss.Value;

    [GeneratedRegex(@"^\d{11}$", RegexOptions.Compiled)]
    private static partial Regex GenerateNssRegex();
}
