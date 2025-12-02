using Certus.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace Certus.Api.Controllers;

/// <summary>
/// Controlador base con funcionalidad común y soporte para Result pattern (2025)
/// </summary>
[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[Produces("application/json")]
public abstract class BaseController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    /// <summary>
    /// Obtener ID del usuario actual
    /// </summary>
    protected Guid? CurrentUserId
    {
        get
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    /// <summary>
    /// Obtener ID del tenant actual
    /// </summary>
    protected Guid? CurrentTenantId
    {
        get
        {
            var claim = User.FindFirst("tenant_id")?.Value;
            return Guid.TryParse(claim, out var id) ? id : null;
        }
    }

    /// <summary>
    /// Obtener email del usuario actual
    /// </summary>
    protected string? CurrentUserEmail =>
        User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

    /// <summary>
    /// Obtener rol del usuario actual
    /// </summary>
    protected string? CurrentUserRole =>
        User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

    /// <summary>
    /// Handle Result pattern response - converts Result to appropriate HTTP response
    /// </summary>
    protected ActionResult HandleResult(Result result)
    {
        if (result.IsSuccess)
            return NoContent();

        return HandleError(result.Error);
    }

    /// <summary>
    /// Handle Result pattern response with value - converts Result to appropriate HTTP response
    /// </summary>
    /// <typeparam name="T">The type of the result value</typeparam>
    protected ActionResult<T> HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Ok(result.Value);

        return HandleError(result.Error);
    }

    /// <summary>
    /// Handle Result pattern response with created resource
    /// </summary>
    protected ActionResult<T> HandleCreatedResult<T>(
        Result<T> result,
        string actionName,
        object? routeValues = null)
    {
        if (result.IsSuccess)
            return CreatedAtAction(actionName, routeValues, result.Value);

        return HandleError(result.Error);
    }

    /// <summary>
    /// Convert Error to appropriate ProblemDetails response
    /// </summary>
    private ActionResult HandleError(Error error)
    {
        var statusCode = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            ErrorType.Failure => StatusCodes.Status500InternalServerError,
            _ => StatusCodes.Status500InternalServerError
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = GetErrorTitle(error.Type),
            Detail = error.Message,
            Type = $"https://certus.mx/errors/{error.Code.ToLowerInvariant().Replace('.', '/')}",
            Instance = HttpContext.Request.Path
        };

        problemDetails.Extensions["code"] = error.Code;
        problemDetails.Extensions["traceId"] = HttpContext.TraceIdentifier;

        return new ObjectResult(problemDetails) { StatusCode = statusCode };
    }

    private static string GetErrorTitle(ErrorType type) => type switch
    {
        ErrorType.Validation => "Validation Error",
        ErrorType.NotFound => "Resource Not Found",
        ErrorType.Conflict => "Resource Conflict",
        ErrorType.Unauthorized => "Unauthorized",
        ErrorType.Forbidden => "Forbidden",
        ErrorType.Failure => "Internal Server Error",
        _ => "Error"
    };

    /// <summary>
    /// Create a validation problem response from FluentValidation errors
    /// </summary>
    protected ActionResult ValidationProblem(IDictionary<string, string[]> errors)
    {
        return new BadRequestObjectResult(new ValidationProblemDetails(errors)
        {
            Type = "https://certus.mx/errors/validation",
            Title = "One or more validation errors occurred.",
            Status = StatusCodes.Status400BadRequest,
            Instance = HttpContext.Request.Path
        });
    }
}
