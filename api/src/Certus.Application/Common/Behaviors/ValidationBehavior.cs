using Certus.Domain.Common;
using FluentValidation;
using MediatR;

namespace Certus.Application.Common.Behaviors;

/// <summary>
/// Pipeline behavior para validación automática con FluentValidation
/// Supports both exception-based and Result pattern error handling
/// </summary>
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .Where(r => r.Errors.Any())
            .SelectMany(r => r.Errors)
            .ToList();

        if (!failures.Any())
        {
            return await next();
        }

        // Convert FluentValidation errors to domain errors
        var errors = failures
            .Select(f => Error.AsValidation($"Validation.{f.PropertyName}", f.ErrorMessage))
            .ToArray();

        // If the response type is a Result<T>, return validation failure
        var responseType = typeof(TResponse);

        if (responseType.IsGenericType &&
            responseType.GetGenericTypeDefinition() == typeof(Result<>))
        {
            var valueType = responseType.GetGenericArguments()[0];
            var failureMethod = typeof(Result)
                .GetMethod(nameof(Result.Failure), 1, new[] { typeof(Error) })!
                .MakeGenericMethod(valueType);

            return (TResponse)failureMethod.Invoke(null, new object[] { errors[0] })!;
        }

        // If the response type is Result, return validation failure
        if (responseType == typeof(Result))
        {
            return (TResponse)(object)Result.Failure(errors[0]);
        }

        // For non-Result types, throw validation exception
        throw new ValidationException(failures);
    }
}
