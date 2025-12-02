using System;
using System.IO;
using System.Threading.Tasks;
using Certus.Domain.Enums;
using Certus.Infrastructure.Services.FileValidation;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

/// <summary>
/// Simple test to verify SIEFORE file parsers work correctly
/// Run with: dotnet run --project tests/ParserTest.csproj
/// </summary>
public class ParserTest
{
    public static async Task Main(string[] args)
    {
        Console.WriteLine("=== CONSAR SIEFORE Parser Test ===\n");

        var logger = NullLogger<ConsarFileParser>.Instance;
        var parser = new ConsarFileParser(logger);

        // Test file paths
        var baseDir = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", ".."));
        var archivosDir = Path.Combine(baseDir, "archivos");

        // Test .0300 Cartera SIEFORE
        await TestCarteraSiefereParser(parser, archivosDir);

        // Test .0314 Derivados
        await TestDerivadosParser(parser, archivosDir);

        Console.WriteLine("\n=== Test Complete ===");
    }

    static async Task TestCarteraSiefereParser(ConsarFileParser parser, string archivosDir)
    {
        Console.WriteLine("--- Testing .0300 Cartera SIEFORE Parser ---\n");

        var files = Directory.GetFiles(archivosDir, "*.0300");
        if (files.Length == 0)
        {
            Console.WriteLine("No .0300 files found in archivos directory");
            return;
        }

        foreach (var file in files)
        {
            Console.WriteLine($"Parsing: {Path.GetFileName(file)}");

            using var stream = File.OpenRead(file);
            var result = await parser.ParseAsync(stream, FileType.CarteraSiefore, null);

            if (result.IsSuccess)
            {
                var parsed = result.Value;
                Console.WriteLine($"  Total Lines: {parsed.TotalLines}");
                Console.WriteLine($"  Total Records: {parsed.Records.Count}");
                Console.WriteLine($"  Detail Records: {parsed.DetailRecordCount}");
                Console.WriteLine($"  Parse Errors: {parsed.ParseErrorCount}");
                Console.WriteLine($"  Is Valid: {parsed.IsValid}");

                if (parsed.HeaderRecord != null)
                {
                    Console.WriteLine($"  Header - AFORE: {parsed.HeaderRecord.GetFieldValue("CodigoAfore")}");
                    Console.WriteLine($"  Header - Date: {parsed.HeaderRecord.GetFieldValue("FechaGeneracion")}");
                    Console.WriteLine($"  Header - Expected Records: {parsed.HeaderRecord.GetFieldValue("TotalRegistros")}");
                }

                // Sample first 3 detail records
                Console.WriteLine("  Sample Records:");
                for (int i = 0; i < Math.Min(3, parsed.DetailRecords.Count); i++)
                {
                    var rec = parsed.DetailRecords[i];
                    var tipo = rec.GetFieldValue("TipoRegistro");
                    var isin = rec.GetFieldValue("ISIN");
                    var emisora = rec.GetFieldValue("Emisora") ?? rec.GetFieldValue("NombreInstrumento");
                    Console.WriteLine($"    [{tipo}] ISIN: {isin}, Emisora: {emisora}");
                }

                // Count by record type
                var byType = parsed.DetailRecords
                    .GroupBy(r => r.GetFieldValue("TipoRegistro")?.ToString() ?? "?")
                    .Select(g => $"{g.Key}: {g.Count()}")
                    .ToList();
                Console.WriteLine($"  Records by Type: {string.Join(", ", byType)}");

                // Show any parse errors
                if (parsed.ParseErrors.Any())
                {
                    Console.WriteLine("  Parse Errors (first 3):");
                    foreach (var err in parsed.ParseErrors.Take(3))
                    {
                        Console.WriteLine($"    Line {err.LineNumber}: {err.Message}");
                    }
                }
            }
            else
            {
                Console.WriteLine($"  FAILED: {result.Error.Message}");
            }
            Console.WriteLine();
        }
    }

    static async Task TestDerivadosParser(ConsarFileParser parser, string archivosDir)
    {
        Console.WriteLine("--- Testing .0314 Derivados Parser ---\n");

        var files = Directory.GetFiles(archivosDir, "*.0314");
        if (files.Length == 0)
        {
            Console.WriteLine("No .0314 files found in archivos directory");
            return;
        }

        foreach (var file in files)
        {
            Console.WriteLine($"Parsing: {Path.GetFileName(file)}");

            using var stream = File.OpenRead(file);
            var result = await parser.ParseAsync(stream, FileType.Derivados, null);

            if (result.IsSuccess)
            {
                var parsed = result.Value;
                Console.WriteLine($"  Total Lines: {parsed.TotalLines}");
                Console.WriteLine($"  Total Records: {parsed.Records.Count}");
                Console.WriteLine($"  Detail Records: {parsed.DetailRecordCount}");
                Console.WriteLine($"  Parse Errors: {parsed.ParseErrorCount}");
                Console.WriteLine($"  Is Valid: {parsed.IsValid}");

                if (parsed.HeaderRecord != null)
                {
                    Console.WriteLine($"  Header - AFORE: {parsed.HeaderRecord.GetFieldValue("CodigoAfore")}");
                    Console.WriteLine($"  Header - Date: {parsed.HeaderRecord.GetFieldValue("FechaGeneracion")}");
                }

                // Sample first 3 detail records
                Console.WriteLine("  Sample Records:");
                for (int i = 0; i < Math.Min(3, parsed.DetailRecords.Count); i++)
                {
                    var rec = parsed.DetailRecords[i];
                    var tipo = rec.GetFieldValue("TipoRegistro");
                    var derivType = rec.GetFieldValue("TipoDerivado");
                    var currPair = rec.GetFieldValue("ParDivisas");
                    var lei = rec.GetFieldValue("LEIContraparte");
                    Console.WriteLine($"    [{tipo}] Type: {derivType}, Pair: {currPair}, LEI: {lei?.ToString()?.Substring(0, Math.Min(10, lei?.ToString()?.Length ?? 0))}...");
                }

                // Count by record type
                var byType = parsed.DetailRecords
                    .GroupBy(r => r.GetFieldValue("TipoRegistro")?.ToString() ?? "?")
                    .Select(g => $"{g.Key}: {g.Count()}")
                    .ToList();
                Console.WriteLine($"  Records by Type: {string.Join(", ", byType)}");

                // Show unique currency pairs
                var uniquePairs = parsed.DetailRecords
                    .Select(r => r.GetFieldValue("ParDivisas")?.ToString())
                    .Where(p => !string.IsNullOrEmpty(p))
                    .Distinct()
                    .Take(10)
                    .ToList();
                Console.WriteLine($"  Unique Currency Pairs: {string.Join(", ", uniquePairs)}");

                // Show any parse errors
                if (parsed.ParseErrors.Any())
                {
                    Console.WriteLine("  Parse Errors (first 3):");
                    foreach (var err in parsed.ParseErrors.Take(3))
                    {
                        Console.WriteLine($"    Line {err.LineNumber}: {err.Message}");
                    }
                }
            }
            else
            {
                Console.WriteLine($"  FAILED: {result.Error.Message}");
            }
            Console.WriteLine();
        }
    }
}
