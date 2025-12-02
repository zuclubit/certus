using System.Net;
using System.Text.Json;
using Certus.Domain.Exceptions;
using FluentValidation;

namespace Certus.Api.Middleware;

/// <summary>
/// Middleware para manejo centralizado de excepciones
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var correlationId = context.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();

        _logger.LogError(exception,
            "Error handling request {Method} {Path} | CorrelationId: {CorrelationId}",
            context.Request.Method,
            context.Request.Path,
            correlationId);

        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = exception switch
        {
            ValidationException validationEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.BadRequest,
                Code = "VALIDATION_ERROR",
                Message = "Error de validación",
                Errors = validationEx.Errors
                    .Select(e => new ErrorDetail(e.PropertyName, e.ErrorMessage))
                    .ToList(),
                CorrelationId = correlationId
            },

            EntityNotFoundException notFoundEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.NotFound,
                Code = notFoundEx.Code,
                Message = notFoundEx.Message,
                CorrelationId = correlationId
            },

            DuplicateEntityException duplicateEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.Conflict,
                Code = duplicateEx.Code,
                Message = duplicateEx.Message,
                CorrelationId = correlationId
            },

            BusinessValidationException businessEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.UnprocessableEntity,
                Code = businessEx.Code,
                Message = businessEx.Message,
                Errors = businessEx.Errors
                    .Select(e => new ErrorDetail(e.Field, e.Message))
                    .ToList(),
                CorrelationId = correlationId
            },

            InvalidStateException stateEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.Conflict,
                Code = stateEx.Code,
                Message = stateEx.Message,
                CorrelationId = correlationId
            },

            OperationNotAllowedException opEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.Forbidden,
                Code = opEx.Code,
                Message = opEx.Message,
                CorrelationId = correlationId
            },

            TenantAccessException tenantEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.Forbidden,
                Code = tenantEx.Code,
                Message = tenantEx.Message,
                CorrelationId = correlationId
            },

            UnauthorizedAccessException => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.Unauthorized,
                Code = "UNAUTHORIZED",
                Message = "No autorizado",
                CorrelationId = correlationId
            },

            _ => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Code = "INTERNAL_ERROR",
                Message = _environment.IsDevelopment()
                    ? exception.Message
                    : "Ha ocurrido un error interno",
                CorrelationId = correlationId,
                StackTrace = _environment.IsDevelopment() ? exception.StackTrace : null
            }
        };

        response.StatusCode = errorResponse.StatusCode;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = _environment.IsDevelopment()
        };

        await response.WriteAsync(JsonSerializer.Serialize(errorResponse, jsonOptions));
    }
}

/// <summary>
/// Respuesta de error estándar
/// </summary>
public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<ErrorDetail>? Errors { get; set; }
    public string? CorrelationId { get; set; }
    public string? StackTrace { get; set; }
}

/// <summary>
/// Detalle de error individual
/// </summary>
public record ErrorDetail(string Field, string Message);
