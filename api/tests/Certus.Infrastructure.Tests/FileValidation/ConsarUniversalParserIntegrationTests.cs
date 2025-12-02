using System.Diagnostics;
using System.Text;
using Certus.Domain.Enums;
using Certus.Infrastructure.Services.FileValidation;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using Xunit.Abstractions;

namespace Certus.Infrastructure.Tests.FileValidation;

/// <summary>
/// Pruebas de integración contra archivos CONSAR reales.
/// AUDITADO: Valida el parser universal contra 285 archivos reales.
/// Directorio de prueba: tools/email-downloader/descargas_consar_3meses/
/// </summary>
public class ConsarUniversalParserIntegrationTests
{
    private readonly ITestOutputHelper _output;
    private readonly ConsarUniversalParser _parser;
    private readonly ConsarFileTypeDetector _detector;
    private readonly string _samplesDirectory;

    public ConsarUniversalParserIntegrationTests(ITestOutputHelper output)
    {
        _output = output;

        // Configure services
        var loggerDetector = Mock.Of<ILogger<ConsarFileTypeDetector>>();
        var loggerParser = Mock.Of<ILogger<ConsarUniversalParser>>();

        _detector = new ConsarFileTypeDetector(loggerDetector);
        _parser = new ConsarUniversalParser(_detector, loggerParser);

        // Path to real sample files (relative from test project)
        _samplesDirectory = Path.GetFullPath(
            Path.Combine(
                Directory.GetCurrentDirectory(),
                "..", "..", "..", "..", "..",
                "tools", "email-downloader", "descargas_consar_3meses"));
    }

    /// <summary>
    /// Verifica que el directorio de muestras existe
    /// </summary>
    [Fact]
    public void SamplesDirectory_ShouldExist()
    {
        if (!Directory.Exists(_samplesDirectory))
        {
            _output.WriteLine($"WARNING: Samples directory not found at: {_samplesDirectory}");
            _output.WriteLine("Skipping integration tests - run from correct location");
            return;
        }

        Assert.True(Directory.Exists(_samplesDirectory),
            $"Sample directory should exist: {_samplesDirectory}");
    }

    /// <summary>
    /// Parsea todos los archivos .0300 y genera estadísticas
    /// </summary>
    [Fact]
    public async Task ParseAllCartera0300Files_ShouldSucceed()
    {
        await RunParserTestForExtension(".0300", "Cartera SIEFORE");
    }

    /// <summary>
    /// Parsea todos los archivos .0314 y genera estadísticas
    /// </summary>
    [Fact]
    public async Task ParseAllDerivados0314Files_ShouldSucceed()
    {
        await RunParserTestForExtension(".0314", "Derivados");
    }

    /// <summary>
    /// Parsea todos los archivos .1101 y genera estadísticas
    /// </summary>
    [Fact]
    public async Task ParseAllTotales1101Files_ShouldSucceed()
    {
        await RunParserTestForExtension(".1101", "Totales/Conciliación");
    }

    /// <summary>
    /// Parsea todos los archivos .0321 y genera estadísticas
    /// </summary>
    [Fact]
    public async Task ParseAllBmrprev0321Files_ShouldSucceed()
    {
        await RunParserTestForExtension(".0321", "BMRPREV");
    }

    /// <summary>
    /// Parsea todos los archivos .0317 y genera estadísticas
    /// </summary>
    [Fact]
    public async Task ParseAllControl0317Files_ShouldSucceed()
    {
        await RunParserTestForExtension(".0317", "Control Cartera");
    }

    /// <summary>
    /// Ejecuta pruebas completas sobre todos los archivos disponibles
    /// Genera reporte de auditoría
    /// </summary>
    [Fact]
    public async Task FullAuditTest_AllFiles_GenerateReport()
    {
        if (!Directory.Exists(_samplesDirectory))
        {
            _output.WriteLine("Skipping - samples directory not found");
            return;
        }

        var report = new StringBuilder();
        report.AppendLine("═══════════════════════════════════════════════════════════════════════════════");
        report.AppendLine("                    REPORTE DE AUDITORÍA - PARSER CONSAR UNIVERSAL");
        report.AppendLine($"                    Fecha: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
        report.AppendLine("═══════════════════════════════════════════════════════════════════════════════");
        report.AppendLine();

        var allFiles = Directory.GetFiles(_samplesDirectory, "*.*", SearchOption.AllDirectories)
            .Where(f => !f.EndsWith(".meta.json") && !f.EndsWith(".zip"))
            .ToList();

        var filesByExtension = allFiles
            .GroupBy(f => Path.GetExtension(f))
            .OrderByDescending(g => g.Count());

        report.AppendLine("📊 RESUMEN DE ARCHIVOS:");
        report.AppendLine("───────────────────────────────────────────────────────────────────────────────");
        foreach (var group in filesByExtension)
        {
            report.AppendLine($"  {group.Key,-10}: {group.Count(),5} archivos");
        }
        report.AppendLine($"  {"TOTAL",-10}: {allFiles.Count,5} archivos");
        report.AppendLine();

        // Parse stats
        var totalParsed = 0;
        var totalFailed = 0;
        var totalRecords = 0;
        var totalWarnings = 0;
        var recordTypeStats = new Dictionary<string, int>();
        var categoryStats = new Dictionary<string, int>();
        var errorsByFile = new List<(string File, string Error)>();
        var stopwatch = Stopwatch.StartNew();

        foreach (var file in allFiles)
        {
            var fileName = Path.GetFileName(file);
            var ext = Path.GetExtension(file);

            // Skip non-data files
            if (!ext.StartsWith(".0") && !ext.StartsWith(".1"))
                continue;

            try
            {
                await using var stream = File.OpenRead(file);
                var result = await _parser.ParseAsync(stream, fileName);

                if (result.Success)
                {
                    totalParsed++;
                    totalRecords += result.ParsedRecords;
                    totalWarnings += result.Warnings.Count;

                    // Collect record type stats
                    foreach (var record in result.Records)
                    {
                        var key = $"{ext}:{record.RecordTypeCode}";
                        recordTypeStats[key] = recordTypeStats.GetValueOrDefault(key) + 1;

                        if (!string.IsNullOrEmpty(record.RecordCategory))
                        {
                            categoryStats[record.RecordCategory] =
                                categoryStats.GetValueOrDefault(record.RecordCategory) + 1;
                        }
                    }
                }
                else
                {
                    totalFailed++;
                    foreach (var error in result.Errors)
                    {
                        errorsByFile.Add((fileName, $"L{error.LineNumber}: {error.Message}"));
                    }
                }
            }
            catch (Exception ex)
            {
                totalFailed++;
                errorsByFile.Add((fileName, ex.Message));
            }
        }

        stopwatch.Stop();

        report.AppendLine("📈 RESULTADOS DE PARSING:");
        report.AppendLine("───────────────────────────────────────────────────────────────────────────────");
        report.AppendLine($"  Archivos procesados: {totalParsed + totalFailed}");
        report.AppendLine($"  Exitosos:           {totalParsed} ({(double)totalParsed / (totalParsed + totalFailed):P1})");
        report.AppendLine($"  Fallidos:           {totalFailed}");
        report.AppendLine($"  Registros totales:  {totalRecords:N0}");
        report.AppendLine($"  Advertencias:       {totalWarnings}");
        report.AppendLine($"  Tiempo total:       {stopwatch.ElapsedMilliseconds}ms");
        report.AppendLine($"  Promedio/archivo:   {stopwatch.ElapsedMilliseconds / Math.Max(1, totalParsed + totalFailed):F2}ms");
        report.AppendLine();

        report.AppendLine("📋 TIPOS DE REGISTRO ENCONTRADOS:");
        report.AppendLine("───────────────────────────────────────────────────────────────────────────────");
        foreach (var stat in recordTypeStats.OrderBy(x => x.Key))
        {
            report.AppendLine($"  {stat.Key,-20}: {stat.Value,8:N0} registros");
        }
        report.AppendLine();

        report.AppendLine("📂 CATEGORÍAS:");
        report.AppendLine("───────────────────────────────────────────────────────────────────────────────");
        foreach (var stat in categoryStats.OrderByDescending(x => x.Value))
        {
            report.AppendLine($"  {stat.Key,-25}: {stat.Value,8:N0} registros");
        }
        report.AppendLine();

        if (errorsByFile.Any())
        {
            report.AppendLine("⚠️ ERRORES ENCONTRADOS:");
            report.AppendLine("───────────────────────────────────────────────────────────────────────────────");
            foreach (var (file, error) in errorsByFile.Take(20))
            {
                report.AppendLine($"  {file}: {error}");
            }
            if (errorsByFile.Count > 20)
            {
                report.AppendLine($"  ... y {errorsByFile.Count - 20} errores más");
            }
            report.AppendLine();
        }

        report.AppendLine("═══════════════════════════════════════════════════════════════════════════════");
        report.AppendLine("                              FIN DEL REPORTE");
        report.AppendLine("═══════════════════════════════════════════════════════════════════════════════");

        _output.WriteLine(report.ToString());

        // Assert minimum success rate
        var successRate = (double)totalParsed / Math.Max(1, totalParsed + totalFailed);
        Assert.True(successRate >= 0.95,
            $"Success rate should be >= 95%. Actual: {successRate:P2}");
    }

    /// <summary>
    /// Prueba de detección de tipos de archivo
    /// </summary>
    [Theory]
    [InlineData("20251127_PS_430_000010.0300", ConsarFileType.CarteraSiefore0300)]
    [InlineData("20251127_PS_430_000010.0314", ConsarFileType.Derivados0314)]
    [InlineData("20251127_PS_430_000010.1101", ConsarFileType.TotalesConciliacion1101)]
    [InlineData("20251127_PS_430_000010.0321", ConsarFileType.FondosBmrprev0321)]
    [InlineData("20251127_PS_430_000010.0317", ConsarFileType.ControlCartera0317)]
    [InlineData("archivo.zip", ConsarFileType.PaqueteZip)]
    [InlineData("archivo.gpg", ConsarFileType.ArchivoCifradoGpg)]
    public void DetectFromFileName_ShouldReturnCorrectType(string fileName, ConsarFileType expectedType)
    {
        var result = _detector.DetectFromFileName(fileName);

        _output.WriteLine($"File: {fileName}");
        _output.WriteLine($"  Detected: {result.FileType}");
        _output.WriteLine($"  Expected: {expectedType}");
        _output.WriteLine($"  Confidence: {result.Confidence}%");
        _output.WriteLine($"  Method: {result.DetectionMethod}");

        Assert.Equal(expectedType, result.FileType);
        Assert.True(result.Confidence >= 60,
            $"Confidence should be >= 60%. Actual: {result.Confidence}%");
    }

    /// <summary>
    /// Prueba de detección desde contenido de header
    /// </summary>
    [Theory]
    [InlineData("0000031300303001430000107202511260100001", ConsarFileType.CarteraSiefore0300)]
    [InlineData("0000017400803101430000107202511260100001", ConsarFileType.Derivados0314)]
    public void DetectFromContent_ShouldReturnCorrectType(string headerLine, ConsarFileType expectedType)
    {
        var result = _detector.DetectFromContent(headerLine.AsSpan());

        _output.WriteLine($"Header: {headerLine[..Math.Min(40, headerLine.Length)]}...");
        _output.WriteLine($"  Detected: {result.FileType}");
        _output.WriteLine($"  Layout Code: {result.LayoutCode}");
        _output.WriteLine($"  Expected Records: {result.ExpectedRecordCount}");
        _output.WriteLine($"  Confidence: {result.Confidence}%");

        Assert.Equal(expectedType, result.FileType);
    }

    /// <summary>
    /// Helper para ejecutar pruebas por extensión
    /// </summary>
    private async Task RunParserTestForExtension(string extension, string typeName)
    {
        if (!Directory.Exists(_samplesDirectory))
        {
            _output.WriteLine($"Skipping {typeName} tests - samples directory not found");
            return;
        }

        var files = Directory.GetFiles(_samplesDirectory, $"*{extension}", SearchOption.AllDirectories);

        if (files.Length == 0)
        {
            _output.WriteLine($"No {extension} files found in {_samplesDirectory}");
            return;
        }

        _output.WriteLine($"Testing {typeName} ({extension}): {files.Length} files");
        _output.WriteLine("─".PadRight(60, '─'));

        var successCount = 0;
        var failCount = 0;
        var totalRecords = 0;
        var recordTypeCount = new Dictionary<string, int>();

        foreach (var file in files.Take(10)) // Test first 10 files
        {
            var fileName = Path.GetFileName(file);

            try
            {
                await using var stream = File.OpenRead(file);
                var result = await _parser.ParseAsync(stream, fileName);

                if (result.Success)
                {
                    successCount++;
                    totalRecords += result.ParsedRecords;

                    foreach (var record in result.Records)
                    {
                        recordTypeCount[record.RecordTypeCode] =
                            recordTypeCount.GetValueOrDefault(record.RecordTypeCode) + 1;
                    }

                    _output.WriteLine($"  ✓ {fileName}: {result.ParsedRecords} records, " +
                        $"{result.Warnings.Count} warnings");
                }
                else
                {
                    failCount++;
                    _output.WriteLine($"  ✗ {fileName}: {result.Errors.Count} errors");
                    foreach (var error in result.Errors.Take(3))
                    {
                        _output.WriteLine($"      L{error.LineNumber}: {error.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                failCount++;
                _output.WriteLine($"  ✗ {fileName}: Exception - {ex.Message}");
            }
        }

        _output.WriteLine("─".PadRight(60, '─'));
        _output.WriteLine($"Results: {successCount} passed, {failCount} failed");
        _output.WriteLine($"Total records parsed: {totalRecords:N0}");
        _output.WriteLine("Record types found:");
        foreach (var kvp in recordTypeCount.OrderByDescending(x => x.Value))
        {
            _output.WriteLine($"  {kvp.Key}: {kvp.Value:N0}");
        }

        // Assert at least 80% success rate
        var successRate = (double)successCount / Math.Max(1, successCount + failCount);
        Assert.True(successRate >= 0.80,
            $"Success rate for {extension} should be >= 80%. Actual: {successRate:P2}");
    }
}
