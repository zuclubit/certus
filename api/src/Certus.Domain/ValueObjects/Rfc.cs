using System.Text.RegularExpressions;
using Certus.Domain.Common;

namespace Certus.Domain.ValueObjects;

/// <summary>
/// RFC - Registro Federal de Contribuyentes (México)
/// 12 caracteres para personas morales, 13 para personas físicas
/// </summary>
public sealed partial class Rfc : ValueObject
{
    // Personas físicas: 4 letras + 6 dígitos + 3 homoclave
    private static readonly Regex RfcFisicaRegex = GenerateRfcFisicaRegex();

    // Personas morales: 3 letras + 6 dígitos + 3 homoclave
    private static readonly Regex RfcMoralRegex = GenerateRfcMoralRegex();

    // RFC genérico para extranjeros y operaciones específicas
    private static readonly HashSet<string> GenericRfcs = new(StringComparer.OrdinalIgnoreCase)
    {
        "XAXX010101000", // Operaciones con público en general
        "XEXX010101000", // Operaciones con extranjeros sin RFC
        "XOXX010101000"  // Operaciones especiales
    };

    private Rfc(string value, RfcType type)
    {
        Value = value.ToUpperInvariant();
        Type = type;
    }

    public string Value { get; }
    public RfcType Type { get; }
    public bool IsGeneric => GenericRfcs.Contains(Value);

    // Extracted components for Persona Física
    public string? FirstSurnameInitials => Type == RfcType.PersonaFisica ? Value[..2] : null;
    public string? SecondSurnameInitial => Type == RfcType.PersonaFisica ? Value.Substring(2, 1) : null;
    public string? FirstNameInitial => Type == RfcType.PersonaFisica ? Value.Substring(3, 1) : null;

    // Extracted components for Persona Moral
    public string? CompanyInitials => Type == RfcType.PersonaMoral ? Value[..3] : null;

    // Common components
    public DateTime? ConstitutionDate => ParseConstitutionDate();
    public string Homoclave => Value[^3..];

    public static Result<Rfc> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<Rfc>(Error.Validation.InvalidRfc("vacío"));

        var normalized = value.Trim().ToUpperInvariant();

        // Check if it's a generic RFC
        if (GenericRfcs.Contains(normalized))
            return Result.Success(new Rfc(normalized, RfcType.Generico));

        // Persona Física (13 characters)
        if (normalized.Length == 13)
        {
            if (!RfcFisicaRegex.IsMatch(normalized))
                return Result.Failure<Rfc>(Error.Validation.InvalidRfc(normalized));

            if (!IsValidDate(normalized.Substring(4, 6)))
                return Result.Failure<Rfc>(Error.Validation.InvalidRfc("fecha inválida"));

            // Validate verification digit
            var calculatedDigit = CalculateVerificationDigit(normalized[..12]);
            if (calculatedDigit != normalized[12])
                return Result.Failure<Rfc>(Error.Validation.InvalidRfc("dígito verificador incorrecto"));

            return Result.Success(new Rfc(normalized, RfcType.PersonaFisica));
        }

        // Persona Moral (12 characters)
        if (normalized.Length == 12)
        {
            if (!RfcMoralRegex.IsMatch(normalized))
                return Result.Failure<Rfc>(Error.Validation.InvalidRfc(normalized));

            if (!IsValidDate(normalized.Substring(3, 6)))
                return Result.Failure<Rfc>(Error.Validation.InvalidRfc("fecha inválida"));

            // Validate verification digit
            var calculatedDigit = CalculateVerificationDigit(normalized[..11]);
            if (calculatedDigit != normalized[11])
                return Result.Failure<Rfc>(Error.Validation.InvalidRfc("dígito verificador incorrecto"));

            return Result.Success(new Rfc(normalized, RfcType.PersonaMoral));
        }

        return Result.Failure<Rfc>(Error.Validation.InvalidRfc($"longitud incorrecta: {normalized.Length}"));
    }

    /// <summary>
    /// Validates RFC without creating instance (for batch validation)
    /// </summary>
    public static bool IsValid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var normalized = value.Trim().ToUpperInvariant();

        if (GenericRfcs.Contains(normalized))
            return true;

        if (normalized.Length == 13)
        {
            if (!RfcFisicaRegex.IsMatch(normalized))
                return false;
            if (!IsValidDate(normalized.Substring(4, 6)))
                return false;
            return CalculateVerificationDigit(normalized[..12]) == normalized[12];
        }

        if (normalized.Length == 12)
        {
            if (!RfcMoralRegex.IsMatch(normalized))
                return false;
            if (!IsValidDate(normalized.Substring(3, 6)))
                return false;
            return CalculateVerificationDigit(normalized[..11]) == normalized[11];
        }

        return false;
    }

    private static bool IsValidDate(string dateStr)
    {
        try
        {
            var year = int.Parse(dateStr[..2]);
            var month = int.Parse(dateStr.Substring(2, 2));
            var day = int.Parse(dateStr.Substring(4, 2));

            var fullYear = year <= 30 ? 2000 + year : 1900 + year;

            if (month < 1 || month > 12)
                return false;

            if (day < 1 || day > DateTime.DaysInMonth(fullYear, month))
                return false;

            return true;
        }
        catch
        {
            return false;
        }
    }

    private DateTime? ParseConstitutionDate()
    {
        try
        {
            var startIndex = Type == RfcType.PersonaFisica ? 4 : 3;
            var dateStr = Value.Substring(startIndex, 6);

            var year = int.Parse(dateStr[..2]);
            var month = int.Parse(dateStr.Substring(2, 2));
            var day = int.Parse(dateStr.Substring(4, 2));

            var fullYear = year <= 30 ? 2000 + year : 1900 + year;
            return new DateTime(fullYear, month, day);
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Calculate RFC verification digit using SAT algorithm (Mod 11)
    /// </summary>
    private static char CalculateVerificationDigit(string rfcWithoutDigit)
    {
        const string validChars = "0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ";
        var sum = 0;
        var length = rfcWithoutDigit.Length;

        // Pad with space if 11 chars (persona moral)
        var padded = rfcWithoutDigit.Length == 11 ? " " + rfcWithoutDigit : rfcWithoutDigit;

        for (var i = 0; i < 12; i++)
        {
            var charIndex = validChars.IndexOf(padded[i]);
            if (charIndex < 0) charIndex = 0;
            sum += charIndex * (13 - i);
        }

        var remainder = sum % 11;

        return remainder switch
        {
            0 => '0',
            1 => 'A', // Special case: 1 becomes 'A'
            _ => validChars[11 - remainder]
        };
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(Rfc rfc) => rfc.Value;

    [GeneratedRegex(@"^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$", RegexOptions.Compiled)]
    private static partial Regex GenerateRfcFisicaRegex();

    [GeneratedRegex(@"^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$", RegexOptions.Compiled)]
    private static partial Regex GenerateRfcMoralRegex();
}

public enum RfcType
{
    PersonaFisica,
    PersonaMoral,
    Generico
}
