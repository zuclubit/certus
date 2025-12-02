using System.Text.RegularExpressions;
using Certus.Domain.Common;

namespace Certus.Domain.ValueObjects;

/// <summary>
/// CURP - Clave Única de Registro de Población (México)
/// 18 caracteres alfanuméricos con algoritmo de validación RENAPO
/// </summary>
public sealed partial class Curp : ValueObject
{
    // Regex pattern for CURP validation
    // Format: AAAA000000HAAAAA00
    // - 4 letters (apellido paterno, materno, nombre)
    // - 6 digits (fecha nacimiento AAMMDD)
    // - 1 letter (sexo H/M/X)
    // - 2 letters (estado)
    // - 3 consonantes internas
    // - 1 dígito homoclave
    // - 1 dígito verificador
    private static readonly Regex CurpRegex = GenerateCurpRegex();

    // Estados válidos de México
    private static readonly HashSet<string> ValidStates = new(StringComparer.OrdinalIgnoreCase)
    {
        "AS", "BC", "BS", "CC", "CL", "CM", "CS", "CH", "DF", "DG",
        "GT", "GR", "HG", "JC", "MC", "MN", "MS", "NT", "NL", "OC",
        "PL", "QT", "QR", "SP", "SL", "SR", "TC", "TS", "TL", "VZ",
        "YN", "ZS", "NE" // NE = Nacido en el Extranjero
    };

    private Curp(string value)
    {
        Value = value.ToUpperInvariant();
    }

    public string Value { get; }

    // Extracted components
    public string FirstSurname => Value[..2];
    public string SecondSurname => Value.Substring(2, 1);
    public string FirstName => Value.Substring(3, 1);
    public DateTime BirthDate => ParseBirthDate();
    public char Gender => Value[10]; // H = Hombre, M = Mujer, X = No binario
    public string StateCode => Value.Substring(11, 2);
    public string InternalConsonants => Value.Substring(13, 3);
    public char HomoclaveDigit => Value[16];
    public char VerificationDigit => Value[17];

    public static Result<Curp> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<Curp>(Error.Validation.InvalidCurp("vacío"));

        var normalized = value.Trim().ToUpperInvariant();

        if (normalized.Length != 18)
            return Result.Failure<Curp>(Error.Validation.InvalidCurp($"longitud incorrecta: {normalized.Length}"));

        if (!CurpRegex.IsMatch(normalized))
            return Result.Failure<Curp>(Error.Validation.InvalidCurp(normalized));

        // Validate state code
        var stateCode = normalized.Substring(11, 2);
        if (!ValidStates.Contains(stateCode))
            return Result.Failure<Curp>(Error.Validation.InvalidCurp($"estado inválido: {stateCode}"));

        // Validate birth date
        if (!IsValidBirthDate(normalized))
            return Result.Failure<Curp>(Error.Validation.InvalidCurp("fecha de nacimiento inválida"));

        // Validate verification digit using algorithm
        var calculatedDigit = CalculateVerificationDigit(normalized[..17]);
        if (calculatedDigit != normalized[17])
            return Result.Failure<Curp>(Error.Validation.InvalidCurp($"dígito verificador incorrecto"));

        return Result.Success(new Curp(normalized));
    }

    /// <summary>
    /// Validates CURP without creating instance (for batch validation)
    /// </summary>
    public static bool IsValid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var normalized = value.Trim().ToUpperInvariant();

        if (normalized.Length != 18)
            return false;

        if (!CurpRegex.IsMatch(normalized))
            return false;

        var stateCode = normalized.Substring(11, 2);
        if (!ValidStates.Contains(stateCode))
            return false;

        if (!IsValidBirthDate(normalized))
            return false;

        var calculatedDigit = CalculateVerificationDigit(normalized[..17]);
        return calculatedDigit == normalized[17];
    }

    private static bool IsValidBirthDate(string curp)
    {
        try
        {
            var yearStr = curp.Substring(4, 2);
            var monthStr = curp.Substring(6, 2);
            var dayStr = curp.Substring(8, 2);

            if (!int.TryParse(yearStr, out var year) ||
                !int.TryParse(monthStr, out var month) ||
                !int.TryParse(dayStr, out var day))
                return false;

            // Determine century (00-30 = 2000s, 31-99 = 1900s)
            var fullYear = year <= 30 ? 2000 + year : 1900 + year;

            if (month < 1 || month > 12)
                return false;

            if (day < 1 || day > DateTime.DaysInMonth(fullYear, month))
                return false;

            var birthDate = new DateTime(fullYear, month, day);
            return birthDate <= DateTime.Today && birthDate >= new DateTime(1900, 1, 1);
        }
        catch
        {
            return false;
        }
    }

    private DateTime ParseBirthDate()
    {
        var yearStr = Value.Substring(4, 2);
        var monthStr = Value.Substring(6, 2);
        var dayStr = Value.Substring(8, 2);

        var year = int.Parse(yearStr);
        var month = int.Parse(monthStr);
        var day = int.Parse(dayStr);

        var fullYear = year <= 30 ? 2000 + year : 1900 + year;
        return new DateTime(fullYear, month, day);
    }

    /// <summary>
    /// Calculate verification digit using RENAPO algorithm (Luhn-based)
    /// </summary>
    private static char CalculateVerificationDigit(string curp17)
    {
        const string validChars = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        var sum = 0;

        for (var i = 0; i < 17; i++)
        {
            var charIndex = validChars.IndexOf(curp17[i]);
            if (charIndex < 0) charIndex = 0;
            sum += charIndex * (18 - i);
        }

        var digit = (10 - (sum % 10)) % 10;
        return digit.ToString()[0];
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }

    public override string ToString() => Value;

    public static implicit operator string(Curp curp) => curp.Value;

    [GeneratedRegex(@"^[A-Z][AEIOUX][A-Z]{2}\d{6}[HMX][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$", RegexOptions.Compiled)]
    private static partial Regex GenerateCurpRegex();
}
