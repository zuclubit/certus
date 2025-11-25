using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace ValidationService.RulesEngine
{
    /// <summary>
    /// Motor de reglas dinámico que ejecuta validaciones configurables sin recompilar código
    /// </summary>
    public class DynamicRulesEngine
    {
        private readonly IRulesRepository _rulesRepository;
        private readonly ICatalogService _catalogService;
        private readonly ILogger<DynamicRulesEngine> _logger;
        private readonly Dictionary<string, Func<ValidationContext, Task<ValidationResult>>> _compiledRules;

        public DynamicRulesEngine(
            IRulesRepository rulesRepository,
            ICatalogService catalogService,
            ILogger<DynamicRulesEngine> logger)
        {
            _rulesRepository = rulesRepository;
            _catalogService = catalogService;
            _logger = logger;
            _compiledRules = new Dictionary<string, Func<ValidationContext, Task<ValidationResult>>>();
        }

        /// <summary>
        /// Ejecuta todas las reglas activas sobre un archivo
        /// </summary>
        public async Task<FileValidationResult> ValidateFileAsync(Guid fileId, DateTime validationDate)
        {
            _logger.LogInformation($"Iniciando validación de archivo {fileId}");

            // 1. Obtener reglas activas para la fecha
            var activeRules = await _rulesRepository.GetActiveRulesAsync(validationDate);
            _logger.LogInformation($"Reglas activas encontradas: {activeRules.Count}");

            // 2. Cargar datos del archivo
            var fileData = await LoadFileDataAsync(fileId);

            // 3. Crear contexto de validación
            var context = new ValidationContext
            {
                FileId = fileId,
                FileType = fileData.FileType,
                FileDate = fileData.FechaOperativa,
                Records = fileData.Records,
                Catalogs = await _catalogService.GetCatalogsAsync(fileData.FechaOperativa)
            };

            // 4. Ejecutar reglas en paralelo (máximo 10 concurrentes para no saturar)
            var results = new List<ValidationResult>();
            var semaphore = new System.Threading.SemaphoreSlim(10);

            var tasks = activeRules.Select(async rule =>
            {
                await semaphore.WaitAsync();
                try
                {
                    return await ExecuteRuleAsync(rule, context);
                }
                finally
                {
                    semaphore.Release();
                }
            });

            results = (await Task.WhenAll(tasks)).ToList();

            // 5. Agregar resultados
            var fileResult = new FileValidationResult
            {
                FileId = fileId,
                TotalRules = activeRules.Count,
                PassedRules = results.Count(r => r.Passed),
                FailedRules = results.Count(r => !r.Passed),
                ValidationResults = results,
                OverallStatus = results.All(r => r.Passed) ? ValidationStatus.Pass : ValidationStatus.Fail,
                ExecutionTimeMs = results.Sum(r => r.ExecutionTimeMs)
            };

            _logger.LogInformation($"Validación completada. Status: {fileResult.OverallStatus}, " +
                $"Passed: {fileResult.PassedRules}/{fileResult.TotalRules}, " +
                $"Tiempo total: {fileResult.ExecutionTimeMs}ms");

            return fileResult;
        }

        /// <summary>
        /// Ejecuta una regla individual
        /// </summary>
        private async Task<ValidationResult> ExecuteRuleAsync(RuleDefinition rule, ValidationContext context)
        {
            var startTime = DateTime.UtcNow;
            var result = new ValidationResult
            {
                RuleId = rule.RuleId,
                RuleCode = rule.RuleCode,
                RuleName = rule.RuleName,
                Errors = new List<ValidationError>()
            };

            try
            {
                _logger.LogDebug($"Ejecutando regla {rule.RuleCode}: {rule.RuleName}");

                // Verificar condiciones de aplicabilidad
                if (!EvaluateCondition(rule.Condition, context))
                {
                    result.Passed = true;
                    result.Skipped = true;
                    result.SkipReason = "Condición de aplicabilidad no cumplida";
                    return result;
                }

                // Ejecutar validación según tipo
                switch (rule.Validation.Type)
                {
                    case "FieldLength":
                        result = await ValidateFieldLengthAsync(rule, context);
                        break;

                    case "CustomExpression":
                        result = await ValidateCustomExpressionAsync(rule, context);
                        break;

                    case "LookupExists":
                        result = await ValidateLookupExistsAsync(rule, context);
                        break;

                    case "CrossFileValidation":
                        result = await ValidateCrossFileAsync(rule, context);
                        break;

                    case "RegexPattern":
                        result = await ValidateRegexPatternAsync(rule, context);
                        break;

                    case "RangeCheck":
                        result = await ValidateRangeCheckAsync(rule, context);
                        break;

                    default:
                        throw new NotSupportedException($"Tipo de validación no soportado: {rule.Validation.Type}");
                }

                result.RuleId = rule.RuleId;
                result.RuleCode = rule.RuleCode;
                result.RuleName = rule.RuleName;

                // Ejecutar acciones según resultado
                if (result.Passed)
                {
                    await ExecuteActionsAsync(rule.Actions.OnPass, context);
                }
                else
                {
                    await ExecuteActionsAsync(rule.Actions.OnFail, context);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error ejecutando regla {rule.RuleCode}: {ex.Message}");
                result.Passed = false;
                result.Errors.Add(new ValidationError
                {
                    Message = $"Error interno en regla: {ex.Message}",
                    Severity = "Critical"
                });
            }
            finally
            {
                result.ExecutionTimeMs = (long)(DateTime.UtcNow - startTime).TotalMilliseconds;
            }

            return result;
        }

        /// <summary>
        /// Validación de longitud de campo
        /// </summary>
        private async Task<ValidationResult> ValidateFieldLengthAsync(RuleDefinition rule, ValidationContext context)
        {
            var config = rule.Validation.Config;
            var expectedLength = (int)config["expectedLength"];
            var field = (string)config["field"];

            var errors = new List<ValidationError>();

            for (int i = 0; i < context.Records.Count; i++)
            {
                var record = context.Records[i];
                var fieldValue = GetFieldValue(record, field);

                if (fieldValue.Length != expectedLength)
                {
                    errors.Add(new ValidationError
                    {
                        LineNumber = i + 1,
                        Message = config["errorMessage"].ToString()
                            .Replace("{actualLength}", fieldValue.Length.ToString())
                            .Replace("{expectedLength}", expectedLength.ToString()),
                        Severity = config["severity"].ToString()
                    });

                    // Si hay muchos errores, limitar para no saturar memoria
                    if (errors.Count >= 1000)
                    {
                        errors.Add(new ValidationError
                        {
                            Message = $"Límite de errores alcanzado (1000). Existen más registros con este error.",
                            Severity = "Warning"
                        });
                        break;
                    }
                }
            }

            return new ValidationResult
            {
                Passed = errors.Count == 0,
                Errors = errors,
                RecordsValidated = context.Records.Count,
                RecordsFailed = errors.Count
            };
        }

        /// <summary>
        /// Validación con expresión personalizada (balanza cuadrada, cálculos, etc.)
        /// </summary>
        private async Task<ValidationResult> ValidateCustomExpressionAsync(RuleDefinition rule, ValidationContext context)
        {
            var config = rule.Validation.Config;
            var expression = (string)config["expression"];
            var tolerance = config.ContainsKey("tolerance") ? (decimal)config["tolerance"] : 0m;
            var variables = (JObject)config["variables"];

            var errors = new List<ValidationError>();

            // Compilar expresión usando Roslyn o similar
            var compiledExpression = CompileExpression(expression, variables);

            for (int i = 0; i < context.Records.Count; i++)
            {
                var record = context.Records[i];

                try
                {
                    // Evaluar variables
                    var vars = EvaluateVariables(variables, record, context);

                    // Ejecutar expresión
                    bool passed = compiledExpression(vars);

                    if (!passed)
                    {
                        errors.Add(new ValidationError
                        {
                            LineNumber = i + 1,
                            Message = InterpolateMessage(config["errorMessage"].ToString(), vars),
                            Severity = config["severity"].ToString(),
                            RecordData = record.RegistroArchivo
                        });
                    }
                }
                catch (Exception ex)
                {
                    errors.Add(new ValidationError
                    {
                        LineNumber = i + 1,
                        Message = $"Error evaluando expresión: {ex.Message}",
                        Severity = "Error"
                    });
                }
            }

            // Ejecutar agregación si existe
            if (config.ContainsKey("aggregation"))
            {
                var aggregationResult = await ValidateAggregationAsync(rule, context, errors);
                if (!aggregationResult.Passed)
                {
                    errors.AddRange(aggregationResult.Errors);
                }
            }

            return new ValidationResult
            {
                Passed = errors.Count == 0,
                Errors = errors,
                RecordsValidated = context.Records.Count
            };
        }

        /// <summary>
        /// Validación de existencia en catálogo
        /// </summary>
        private async Task<ValidationResult> ValidateLookupExistsAsync(RuleDefinition rule, ValidationContext context)
        {
            var config = rule.Validation.Config;
            var field = (string)config["field"];
            var lookupTable = (string)config["lookupTable"];
            var lookupColumn = (string)config["lookupColumn"];

            // Cargar catálogo (con cache)
            var catalog = await _catalogService.GetCatalogAsync(lookupTable, context.FileDate);
            var validValues = new HashSet<string>(catalog.Select(c => c[lookupColumn].ToString()));

            var errors = new List<ValidationError>();

            for (int i = 0; i < context.Records.Count; i++)
            {
                var record = context.Records[i];
                var fieldValue = GetFieldValue(record, field).Trim();

                if (!validValues.Contains(fieldValue))
                {
                    errors.Add(new ValidationError
                    {
                        LineNumber = i + 1,
                        Message = config["errorMessage"].ToString()
                            .Replace("{" + field + "}", fieldValue),
                        Severity = config["severity"].ToString()
                    });
                }
            }

            return new ValidationResult
            {
                Passed = errors.Count == 0,
                Errors = errors,
                RecordsValidated = context.Records.Count
            };
        }

        /// <summary>
        /// Validación cruzada entre archivos (contracuentas)
        /// </summary>
        private async Task<ValidationResult> ValidateCrossFileAsync(RuleDefinition rule, ValidationContext context)
        {
            // Implementación de cross-file validation
            // Cargar archivo relacionado, hacer join, validar matching
            throw new NotImplementedException("Cross-file validation requiere implementación específica");
        }

        // Métodos auxiliares
        private bool EvaluateCondition(RuleCondition condition, ValidationContext context)
        {
            // Evaluar condiciones de aplicabilidad de la regla
            // Por ejemplo, verificar que FileType == "1101"
            return true; // Simplificado
        }

        private string GetFieldValue(FileRecord record, string field)
        {
            // Extraer campo del registro según configuración
            return field switch
            {
                "RegistroArchivo" => record.RegistroArchivo,
                "ClaveCuenta" => record.ClaveCuenta,
                _ => throw new ArgumentException($"Campo desconocido: {field}")
            };
        }

        private Func<Dictionary<string, object>, bool> CompileExpression(string expression, JObject variables)
        {
            // Compilar expresión usando Roslyn CodeAnalysis
            // Retornar función compilada para performance
            return (vars) => true; // Simplificado - implementar con Roslyn
        }

        private Dictionary<string, object> EvaluateVariables(JObject variableDefinitions, FileRecord record, ValidationContext context)
        {
            var result = new Dictionary<string, object>();

            foreach (var kvp in variableDefinitions)
            {
                var variableName = kvp.Key;
                var expression = kvp.Value.ToString();

                // Evaluar expresión (usando evaluador de expresiones dinámico)
                var value = EvaluateDynamicExpression(expression, record, context);
                result[variableName] = value;
            }

            return result;
        }

        private object EvaluateDynamicExpression(string expression, FileRecord record, ValidationContext context)
        {
            // Evaluar expresión como "Decimal.Parse(Record.Substring(42, 16)) / 100"
            // Implementar usando Roslyn o NCalc library
            return 0m; // Simplificado
        }

        private string InterpolateMessage(string template, Dictionary<string, object> variables)
        {
            var result = template;
            foreach (var kvp in variables)
            {
                result = result.Replace("{" + kvp.Key + "}", kvp.Value?.ToString() ?? "null");
            }
            return result;
        }

        private Task ExecuteActionsAsync(List<RuleAction> actions, ValidationContext context)
        {
            // Ejecutar acciones post-validación (logging, contadores, etc.)
            return Task.CompletedTask;
        }

        private Task<ValidationResult> ValidateAggregationAsync(RuleDefinition rule, ValidationContext context, List<ValidationError> recordErrors)
        {
            // Validaciones agregadas (suma total, promedios, etc.)
            return Task.FromResult(new ValidationResult { Passed = true });
        }

        private Task<ValidationResult> ValidateRegexPatternAsync(RuleDefinition rule, ValidationContext context)
        {
            // Validación con regex pattern
            throw new NotImplementedException();
        }

        private Task<ValidationResult> ValidateRangeCheckAsync(RuleDefinition rule, ValidationContext context)
        {
            // Validación de rangos numéricos
            throw new NotImplementedException();
        }

        private async Task<FileData> LoadFileDataAsync(Guid fileId)
        {
            // Cargar datos del archivo desde ValidationDB
            return new FileData(); // Simplificado
        }
    }

    #region Models

    public class ValidationContext
    {
        public Guid FileId { get; set; }
        public string FileType { get; set; }
        public DateTime FileDate { get; set; }
        public List<FileRecord> Records { get; set; }
        public Dictionary<string, object> Catalogs { get; set; }
    }

    public class FileRecord
    {
        public int LineNumber { get; set; }
        public string RegistroArchivo { get; set; }
        public string ClaveCuenta { get; set; }
        public string ClaveSubcuenta { get; set; }
        public decimal SaldoInicial { get; set; }
        public decimal Cargos { get; set; }
        public decimal Abonos { get; set; }
        public decimal SaldoFinal { get; set; }
    }

    public class RuleDefinition
    {
        public Guid RuleId { get; set; }
        public string RuleCode { get; set; }
        public string RuleName { get; set; }
        public string RuleCategory { get; set; }
        public RuleCondition Condition { get; set; }
        public RuleValidation Validation { get; set; }
        public RuleActions Actions { get; set; }
        public DateTime EffectiveDate { get; set; }
        public DateTime? ExpirationDate { get; set; }
    }

    public class RuleCondition
    {
        public string Type { get; set; } // "All", "Any", "None"
        public List<ConditionRule> Rules { get; set; }
    }

    public class ConditionRule
    {
        public string Field { get; set; }
        public string Operator { get; set; } // "Equals", "In", "GreaterThan", etc.
        public object Value { get; set; }
    }

    public class RuleValidation
    {
        public string Type { get; set; } // "FieldLength", "CustomExpression", etc.
        public Dictionary<string, object> Config { get; set; }
    }

    public class RuleActions
    {
        public List<RuleAction> OnPass { get; set; }
        public List<RuleAction> OnFail { get; set; }
    }

    public class RuleAction
    {
        public string Type { get; set; }
        public string Message { get; set; }
        public Dictionary<string, object> Parameters { get; set; }
    }

    public class ValidationResult
    {
        public Guid RuleId { get; set; }
        public string RuleCode { get; set; }
        public string RuleName { get; set; }
        public bool Passed { get; set; }
        public bool Skipped { get; set; }
        public string SkipReason { get; set; }
        public List<ValidationError> Errors { get; set; }
        public int RecordsValidated { get; set; }
        public int RecordsFailed { get; set; }
        public long ExecutionTimeMs { get; set; }
    }

    public class ValidationError
    {
        public int LineNumber { get; set; }
        public string Message { get; set; }
        public string Severity { get; set; } // "Error", "Warning", "Critical"
        public string RecordData { get; set; }
    }

    public class FileValidationResult
    {
        public Guid FileId { get; set; }
        public int TotalRules { get; set; }
        public int PassedRules { get; set; }
        public int FailedRules { get; set; }
        public List<ValidationResult> ValidationResults { get; set; }
        public ValidationStatus OverallStatus { get; set; }
        public long ExecutionTimeMs { get; set; }
    }

    public enum ValidationStatus
    {
        Pass,
        Fail,
        PartialFail,
        Error
    }

    public class FileData
    {
        public string FileType { get; set; }
        public DateTime FechaOperativa { get; set; }
        public List<FileRecord> Records { get; set; }
    }

    #endregion
}
