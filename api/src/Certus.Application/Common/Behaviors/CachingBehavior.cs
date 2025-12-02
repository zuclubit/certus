using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Certus.Application.Common.Behaviors;

/// <summary>
/// Marker interface for cacheable queries
/// </summary>
public interface ICacheableQuery
{
    string CacheKey { get; }
    TimeSpan? CacheDuration { get; }
}

/// <summary>
/// MediatR pipeline behavior for distributed caching
/// Caches query results to reduce database load
/// </summary>
public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger;
    private static readonly TimeSpan DefaultCacheDuration = TimeSpan.FromMinutes(5);

    public CachingBehavior(
        IDistributedCache cache,
        ILogger<CachingBehavior<TRequest, TResponse>> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Only cache queries that implement ICacheableQuery
        if (request is not ICacheableQuery cacheableQuery)
        {
            return await next();
        }

        var cacheKey = cacheableQuery.CacheKey;
        var cachedResponse = await _cache.GetStringAsync(cacheKey, cancellationToken);

        if (!string.IsNullOrEmpty(cachedResponse))
        {
            _logger.LogDebug("Cache hit for {CacheKey}", cacheKey);
            return JsonSerializer.Deserialize<TResponse>(cachedResponse)!;
        }

        _logger.LogDebug("Cache miss for {CacheKey}", cacheKey);

        var response = await next();

        // Don't cache null responses
        if (response is null)
        {
            return response;
        }

        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = cacheableQuery.CacheDuration ?? DefaultCacheDuration
        };

        var serializedResponse = JsonSerializer.Serialize(response);
        await _cache.SetStringAsync(cacheKey, serializedResponse, cacheOptions, cancellationToken);

        _logger.LogDebug("Cached response for {CacheKey}", cacheKey);

        return response;
    }
}

/// <summary>
/// Marker interface for commands that should invalidate cache
/// </summary>
public interface ICacheInvalidatingCommand
{
    string[] CacheKeysToInvalidate { get; }
}

/// <summary>
/// MediatR pipeline behavior for cache invalidation
/// Invalidates relevant cache entries after command execution
/// </summary>
public class CacheInvalidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CacheInvalidationBehavior<TRequest, TResponse>> _logger;

    public CacheInvalidationBehavior(
        IDistributedCache cache,
        ILogger<CacheInvalidationBehavior<TRequest, TResponse>> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var response = await next();

        if (request is ICacheInvalidatingCommand command)
        {
            foreach (var key in command.CacheKeysToInvalidate)
            {
                await _cache.RemoveAsync(key, cancellationToken);
                _logger.LogDebug("Invalidated cache key: {CacheKey}", key);
            }
        }

        return response;
    }
}
