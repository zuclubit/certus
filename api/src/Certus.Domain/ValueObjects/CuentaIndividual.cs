using System.Text.RegularExpressions;
using Certus.Domain.Common;

namespace Certus.Domain.ValueObjects;

/// <summary>
/// Cuenta Individual SAR (Sistema de Ahorro para el Retiro)
/// 11 dígitos para cuentas AFORE
/// </summary>
public sealed partial class CuentaIndividual : ValueObject
{
    private static readonly Regex CuentaRegex = GenerateCuentaRegex();

    private CuentaIndividual(string value)
    {
        Value = value;
    }

    public string Value { get; }

    // Extracted components (based on CONSAR format)
    public string ClaveAfore => Value[..3];      // 3 dígitos: Clave AFORE
    public string TipoCuenta => Value.Substring(3, 1); // 1 dígito: Tipo de cuenta
    public string Consecutivo => Value.Substring(4, 6); // 6 dígitos: Consecutivo
    public char DigitoVerificador => Value[10];

    public static Result<CuentaIndividual> Create(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return Result.Failure<CuentaIndividual>(Error.Validation.InvalidAccount("vacío"));

        var normalized = value.Trim().Replace(" ", "").Replace("-", "");

        if (normalized.Length != 11)
            return Result.Failure<CuentaIndividual>(Error.Validation.InvalidAccount($"longitud incorrecta: {normalized.Length}"));

        if (!CuentaRegex.IsMatch(normalized))
            return Result.Failure<CuentaIndividual>(Error.Validation.InvalidAccount(normalized));

        // Validate clave AFORE (001-099 range for registered AFOREs)
        var claveAfore = int.Parse(normalized[..3]);
        if (claveAfore < 1 || claveAfore > 99)
            return Result.Failure<CuentaIndividual>(Error.Validation.InvalidAccount("clave AFORE inválida"));

        // Validate tipo cuenta (1-9)
        var tipoCuenta = int.Parse(normalized.Substring(3, 1));
        if (tipoCuenta < 1 || tipoCuenta > 9)
            return Result.Failure<CuentaIndividual>(Error.Validation.InvalidAccount("tipo de cuenta inválido"));

        // Validate verification digit
        var calculatedDigit = CalculateVerificationDigit(normalized[..10]);
        if (calculatedDigit != normalized[10])
            return Result.Failure<CuentaIndividual>(Error.Validation.InvalidAccount("dígito verificador incorrecto"));

        return Result.Success(new CuentaIndividual(normalized));
    }

    /// <summary>
    /// Validates account without creating instance (for batch validation)
    /// </summary>
    public static bool IsValid(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var normalized = value.Trim().Replace(" ", "").Replace("-", "");

        if (normalized.Length != 11 || !CuentaRegex.IsMatch(normalized))
            return false;

        var claveAfore = int.Parse(normalized[..3]);
        if (claveAfore < 1 || claveAfore > 99)
            return false;

        var tipoCuenta = int.Parse(normalized.Substring(3, 1));
        if (tipoCuenta < 1 || tipoCuenta > 9)
            return false;

        return CalculateVerificationDigit(normalized[..10]) == normalized[10];
    }

    /// <summary>
    /// Calculate verification digit using Mod 10 algorithm
    /// </summary>
    private static char CalculateVerificationDigit(string cuenta10)
    {
        var sum = 0;

        for (var i = 0; i < 10; i++)
        {
            var digit = cuenta10[i] - '0';

            // Multiply by 2 for odd positions (1-indexed)
            if (i % 2 == 1)
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
    /// Format account with separators for display: XXX-X-XXXXXX-X
    /// </summary>
    public string ToFormattedString() =>
        $"{Value[..3]}-{Value[3]}-{Value.Substring(4, 6)}-{Value[10]}";

    public static implicit operator string(CuentaIndividual cuenta) => cuenta.Value;

    [GeneratedRegex(@"^\d{11}$", RegexOptions.Compiled)]
    private static partial Regex GenerateCuentaRegex();
}
