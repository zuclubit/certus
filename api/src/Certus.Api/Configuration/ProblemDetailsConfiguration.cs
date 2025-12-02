using System.Diagnostics;
using Certus.Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Certus.Api.Configuration;

/// <summary>
/// RFC 7807 Problem Details configuration for standardized error responses
/// Following 2025 API best practices
/// </summary>
public static class ProblemDetailsConfiguration
{
    public static IServiceCollection AddProblemDetailsConfiguration(this IServiceCollection services)
    {
        services.AddProblemDetails(options =>
        {
            options.CustomizeProblemDetails = context =>
            {
                // Add trace ID for request correlation
                context.ProblemDetails.Extensions["traceId"] =
                    Activity.Current?.Id ?? context.HttpContext.TraceIdentifier;

                // Add request path
                context.ProblemDetails.Instance = context.HttpContext.Request.Path;

                // Add timestamp
                context.ProblemDetails.Extensions["timestamp"] = DateTime.UtcNow.ToString("O");

                // Add documentation URL based on status code
                context.ProblemDetails.Type = context.ProblemDetails.Status switch
                {
                    400 => "https://certus.mx/errors/bad-request",
                    401 => "https://certus.mx/errors/unauthorized",
                    403 => "https://certus.mx/errors/forbidden",
                    404 => "https://certus.mx/errors/not-found",
                    409 => "https://certus.mx/errors/conflict",
                    422 => "https://certus.mx/errors/validation",
                    429 => "https://certus.mx/errors/rate-limit",
                    500 => "https://certus.mx/errors/internal-server-error",
                    503 => "https://certus.mx/errors/service-unavailable",
                    _ => "https://certus.mx/errors/unknown"
                };
            };
        });

        return services;
    }

    public static IApplicationBuilder UseProblemDetailsExceptionHandler(
        this IApplicationBuilder app,
        IHostEnvironment environment)
    {
        app.UseExceptionHandler(errorApp =>
        {
            errorApp.Run(async context =>
            {
                var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();
                var exception = exceptionHandlerFeature?.Error;

                if (exception == null) return;

                var problemDetails = MapExceptionToProblemDetails(exception, context, environment);

                context.Response.StatusCode = problemDetails.Status ?? 500;
                context.Response.ContentType = "application/problem+json";

                await context.Response.WriteAsJsonAsync(problemDetails);
            });
        });

        return app;
    }

    private static ProblemDetails MapExceptionToProblemDetails(
        Exception exception,
        HttpContext context,
        IHostEnvironment environment)
    {
        var problemDetails = exception switch
        {
            ValidationException validationEx => new ValidationProblemDetails(
                validationEx.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()))
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation Failed",
                Detail = "One or more validation errors occurred.",
                Type = "https://certus.mx/errors/validation"
            },

            EntityNotFoundException notFoundEx => new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title = "Resource Not Found",
                Detail = notFoundEx.Message,
                Type = "https://certus.mx/errors/not-found",
                Extensions = { ["code"] = notFoundEx.Code }
            },

            DuplicateEntityException duplicateEx => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Resource Conflict",
                Detail = duplicateEx.Message,
                Type = "https://certus.mx/errors/conflict",
                Extensions = { ["code"] = duplicateEx.Code }
            },

            BusinessValidationException businessEx => new ValidationProblemDetails(
                businessEx.Errors
                    .GroupBy(e => e.Field)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.Message).ToArray()))
            {
                Status = StatusCodes.Status422UnprocessableEntity,
                Title = "Business Validation Failed",
                Detail = businessEx.Message,
                Type = "https://certus.mx/errors/business-validation",
                Extensions = { ["code"] = businessEx.Code }
            },

            InvalidStateException stateEx => new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Invalid State",
                Detail = stateEx.Message,
                Type = "https://certus.mx/errors/invalid-state",
                Extensions = { ["code"] = stateEx.Code }
            },

            OperationNotAllowedException opEx => new ProblemDetails
            {
                Status = StatusCodes.Status403Forbidden,
                Title = "Operation Not Allowed",
                Detail = opEx.Message,
                Type = "https://certus.mx/errors/forbidden",
                Extensions = { ["code"] = opEx.Code }
            },

            TenantAccessException tenantEx => new ProblemDetails
            {
                Status = StatusCodes.Status403Forbidden,
                Title = "Tenant Access Denied",
                Detail = tenantEx.Message,
                Type = "https://certus.mx/errors/tenant-access",
                Extensions = { ["code"] = tenantEx.Code }
            },

            UnauthorizedAccessException => new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Unauthorized",
                Detail = "Authentication is required to access this resource.",
                Type = "https://certus.mx/errors/unauthorized"
            },

            OperationCanceledException => new ProblemDetails
            {
                Status = StatusCodes.Status499ClientClosedRequest,
                Title = "Request Cancelled",
                Detail = "The request was cancelled.",
                Type = "https://certus.mx/errors/cancelled"
            },

            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = environment.IsDevelopment()
                    ? exception.Message
                    : "An unexpected error occurred. Please try again later.",
                Type = "https://certus.mx/errors/internal-server-error"
            }
        };

        problemDetails.Instance = context.Request.Path;
        problemDetails.Extensions["traceId"] = Activity.Current?.Id ?? context.TraceIdentifier;
        problemDetails.Extensions["timestamp"] = DateTime.UtcNow.ToString("O");

        if (environment.IsDevelopment() && exception is not ValidationException)
        {
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;
            problemDetails.Extensions["innerException"] = exception.InnerException?.Message;
        }

        return problemDetails;
    }
}

/// <summary>
/// Extension for 499 Client Closed Request status code
/// </summary>
public static class StatusCodesExtension
{
    public const int Status499ClientClosedRequest = 499;
}
