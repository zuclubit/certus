using Certus.Api.Commands;
using Certus.Api.Configuration;
using Certus.Api.Hubs;
using Certus.Api.Middleware;
using Certus.Application;
using Certus.Application.Common.Interfaces;
using Certus.Infrastructure;
using Certus.Infrastructure.BackgroundJobs;
using Certus.Infrastructure.Data;
using Certus.Infrastructure.Data.Seed;
using Hangfire;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

// Early startup logging for container debugging with explicit flush
try
{
    Console.Error.WriteLine($"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] Certus API Starting...");
    Console.Error.Flush();
    Console.Error.WriteLine($"Environment: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Not Set"}");
    Console.Error.WriteLine($"Runtime: {System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription}");
    Console.Error.WriteLine($"OS: {System.Runtime.InteropServices.RuntimeInformation.OSDescription}");
    Console.Error.Flush();

    // Validate critical environment variables early
    var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
    var jwtSecretEnv = Environment.GetEnvironmentVariable("Jwt__SecretKey");

    Console.Error.WriteLine($"Connection String: {(string.IsNullOrEmpty(connStr) ? "NOT SET" : "SET (length: " + connStr.Length + ")")}");
    Console.Error.WriteLine($"JWT Secret: {(string.IsNullOrEmpty(jwtSecretEnv) ? "NOT SET" : "SET (length: " + jwtSecretEnv.Length + ")")}");
    Console.Error.Flush();
}
catch (Exception ex)
{
    Console.Error.WriteLine($"Early startup error: {ex.Message}");
    Console.Error.Flush();
}

// Handle command-line arguments
if (args.Contains("--test-azure") || args.Contains("-ta"))
{
    var testBuilder = WebApplication.CreateBuilder(args);
    var result = await AzureConnectivityTest.RunAsync(testBuilder.Configuration, testBuilder.Environment);
    return result;
}

// Update passwords command for development
if (args.Contains("--update-passwords"))
{
    var tempBuilder = WebApplication.CreateBuilder(args);
    tempBuilder.Services.AddInfrastructure(tempBuilder.Configuration);
    var tempApp = tempBuilder.Build();
    using var scope = tempApp.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<Certus.Infrastructure.Data.ApplicationDbContext>();
    await UpdatePasswordsCommand.ExecuteAsync(context);
    return 0;
}

Console.WriteLine("Creating WebApplication builder...");
var builder = WebApplication.CreateBuilder(args);
Console.WriteLine("WebApplication builder created successfully.");

// Serilog configuration with Azure Application Insights
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentName()
    .Enrich.WithProperty("Application", "Certus.Api")
    .Enrich.WithProperty("Version", "1.0.0")
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .WriteTo.File(
        path: "logs/certus-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}")
    .CreateLogger();

builder.Host.UseSerilog();

// Add services - Clean Architecture layers
Console.WriteLine("Adding Application services...");
try
{
    builder.Services.AddApplication();
    Console.WriteLine("Application services added successfully.");
}
catch (Exception ex)
{
    Console.WriteLine($"ERROR adding Application services: {ex.Message}");
    throw;
}

Console.WriteLine("Adding Infrastructure services...");
try
{
    builder.Services.AddInfrastructure(builder.Configuration);
    Console.WriteLine("Infrastructure services added successfully.");
}
catch (Exception ex)
{
    Console.WriteLine($"ERROR adding Infrastructure services: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    throw;
}

// API Versioning (2025 best practice)
builder.Services.AddApiVersioningConfiguration();

// Problem Details (RFC 7807)
builder.Services.AddProblemDetailsConfiguration();

// Controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = builder.Environment.IsDevelopment();
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Output caching for high-performance endpoints
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(builder => builder.Cache());
    options.AddPolicy("Dashboard", builder => builder.Expire(TimeSpan.FromMinutes(5)));
    options.AddPolicy("Statistics", builder => builder.Expire(TimeSpan.FromMinutes(2)));
});

// CORS - Support both config and environment variables
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Get origins from config, env vars, or use defaults
        var configOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
        var envOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")?.Split(',', StringSplitOptions.RemoveEmptyEntries);

        var origins = configOrigins?.Length > 0
            ? configOrigins
            : envOrigins?.Length > 0
                ? envOrigins
                : new[] { "http://localhost:5173", "http://localhost:3000" };

        Console.WriteLine($"CORS configured for origins: {string.Join(", ", origins)}");

        policy.WithOrigins(origins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("X-Pagination", "X-Total-Count", "X-Request-Id");
    });
});

// SignalR with Azure SignalR Service support
var signalRConnectionString = builder.Configuration.GetConnectionString("AzureSignalR");
if (!string.IsNullOrEmpty(signalRConnectionString))
{
    builder.Services.AddSignalR()
        .AddAzureSignalR(signalRConnectionString);
}
else
{
    builder.Services.AddSignalR(options =>
    {
        options.EnableDetailedErrors = builder.Environment.IsDevelopment();
        options.MaximumReceiveMessageSize = 64 * 1024; // 64KB
        options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    });
}

// Register SignalR notification services
builder.Services.AddScoped<Certus.Application.Common.Interfaces.IValidationNotificationService, Certus.Api.Hubs.ValidationNotificationService>();
builder.Services.AddScoped<IScraperNotificationService, ScraperNotificationService>();
builder.Services.AddScoped<Certus.Domain.Services.IApprovalNotificationService, Certus.Api.Hubs.ApprovalNotificationService>();

// Swagger/OpenAPI with versioning support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Certus API",
        Version = "v1.0",
        Description = """
            API para el Sistema de Validación CONSAR - Certus

            ## Características
            - Validación automática de archivos CONSAR (Circular 19-8)
            - Soporte para múltiples tipos de archivo (Nómina, Contable, Regularización, etc.)
            - Exportación de reportes en PDF, Excel, CSV, JSON
            - Notificaciones en tiempo real via SignalR
            - Métricas y analytics de cumplimiento

            ## Autenticación
            Utiliza JWT Bearer tokens. Obtenga un token en `/api/v1/auth/login`.

            ## Rate Limiting
            - 100 requests por minuto (general)
            - 10 uploads por minuto
            """,
        Contact = new OpenApiContact
        {
            Name = "Certus Team",
            Email = "soporte@certus.mx",
            Url = new Uri("https://certus.mx")
        },
        License = new OpenApiLicense
        {
            Name = "Proprietary",
            Url = new Uri("https://certus.mx/license")
        }
    });

    // Add XML documentation
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        options.IncludeXmlComments(xmlPath);

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = """
            JWT Authorization header using the Bearer scheme.

            Enter 'Bearer' [space] and then your token in the text input below.

            Example: "Bearer eyJhbGciOiJIUzI1NiIs..."
            """,
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Enable annotations
    options.EnableAnnotations();
});

// Rate Limiting (2025 best practice - sliding window + token bucket)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.ContentType = "application/problem+json";
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            type = "https://certus.mx/errors/rate-limit",
            title = "Too Many Requests",
            status = 429,
            detail = "Has excedido el límite de solicitudes. Intenta de nuevo más tarde.",
            retryAfter = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter)
                ? retryAfter.TotalSeconds
                : 60
        }, token);
    };

    // Global rate limit
    options.AddSlidingWindowLimiter("global", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.SegmentsPerWindow = 6;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 10;
    });

    // Upload rate limit (more restrictive)
    options.AddTokenBucketLimiter("upload", limiterOptions =>
    {
        limiterOptions.TokenLimit = 10;
        limiterOptions.ReplenishmentPeriod = TimeSpan.FromMinutes(1);
        limiterOptions.TokensPerPeriod = 5;
        limiterOptions.AutoReplenishment = true;
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 2;
    });

    // API rate limit per user
    options.AddPolicy("per-user", context =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: context.User?.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 50,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 6
            }));
});

// Note: Health checks are configured in Infrastructure layer (DependencyInjection.cs)
// with conditional PostgreSQL health check based on token auth configuration

// Response compression
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.BrotliCompressionProvider>();
    options.Providers.Add<Microsoft.AspNetCore.ResponseCompression.GzipCompressionProvider>();
});

Console.WriteLine("Building WebApplication...");
var app = builder.Build();
Console.WriteLine("WebApplication built successfully.");

// Database initialization with enhanced error handling for container debugging
Console.WriteLine("Starting database initialization...");
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        Console.WriteLine("Getting ApplicationDbContext...");
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        Console.WriteLine("Testing database connection...");
        // Test connection first
        var canConnect = await context.Database.CanConnectAsync();
        Console.WriteLine($"Database connection test: {(canConnect ? "SUCCESS" : "FAILED")}");

        if (!canConnect)
        {
            Log.Error("Cannot connect to database. Skipping migrations and seed.");
            Console.WriteLine("ERROR: Cannot connect to database!");
        }
        else
        {
            // Apply pending migrations
            var pendingMigrations = context.Database.GetPendingMigrations().ToList();
            Console.WriteLine($"Pending migrations: {pendingMigrations.Count}");

            if (pendingMigrations.Any())
            {
                Log.Information("Applying database migrations...");
                Console.WriteLine("Applying migrations...");
                await context.Database.MigrateAsync();
                Log.Information("Database migrations applied successfully");
                Console.WriteLine("Migrations applied successfully.");
            }

            // Seed initial data
            if (app.Configuration.GetValue<bool>("Database:SeedData"))
            {
                Log.Information("Seeding database...");
                Console.WriteLine("Seeding database...");
                await SeedData.InitializeAsync(context, logger);
                Log.Information("Database seeding completed");
                Console.WriteLine("Database seeding completed.");
            }
        }
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while initializing the database");
        Console.WriteLine($"DATABASE INITIALIZATION ERROR: {ex.GetType().Name}: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"Inner exception: {ex.InnerException.GetType().Name}: {ex.InnerException.Message}");
        }
        // Don't throw - let the app continue and fail gracefully
        // throw;
    }
}
Console.WriteLine("Database initialization complete.");

// Pipeline configuration
app.UseResponseCompression();

// Development-only middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Certus API v1");
        c.RoutePrefix = "swagger";
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        c.EnableDeepLinking();
        c.EnableFilter();
        c.DisplayRequestDuration();
    });
}
else
{
    // Production: Use HSTS
    app.UseHsts();
}

// Problem Details exception handler (RFC 7807)
app.UseProblemDetailsExceptionHandler(app.Environment);

// Correlation ID middleware
app.UseMiddleware<CorrelationIdMiddleware>();

// Serilog request logging with enhanced context
app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
        diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
        diagnosticContext.Set("ClientIP", httpContext.Connection.RemoteIpAddress?.ToString());

        if (httpContext.User.Identity?.IsAuthenticated == true)
        {
            diagnosticContext.Set("UserId", httpContext.User.FindFirst("sub")?.Value);
            diagnosticContext.Set("TenantId", httpContext.User.FindFirst("tenant_id")?.Value);
        }
    };
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
});

// Only use HTTPS redirection in production with proper SSL setup
// Skip for development/staging on HTTP-only containers
var forceHttps = app.Configuration.GetValue<bool>("ForceHttpsRedirection", false);
if (forceHttps || app.Environment.IsProduction())
{
    var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "";
    if (urls.Contains("https://"))
    {
        app.UseHttpsRedirection();
    }
}

app.UseCors("AllowFrontend");

// Output caching
app.UseOutputCache();

app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

// Map controllers and hubs
app.MapControllers();
app.MapHub<ValidationHub>("/hubs/validation").RequireCors("AllowFrontend");
app.MapHub<ScraperHub>("/hubs/scrapers").RequireCors("AllowFrontend");

// Hangfire Dashboard
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = app.Environment.IsDevelopment()
        ? new[] { new Hangfire.Dashboard.LocalRequestsOnlyAuthorizationFilter() }
        : new[] { new HangfireAuthorizationFilter() },
    DashboardTitle = "Certus Jobs Dashboard",
    DisplayStorageConnectionString = false
});

// Register recurring Hangfire jobs for normative scraping
var recurringJobManager = app.Services.GetRequiredService<IRecurringJobManager>();
recurringJobManager.RegisterScraperJobs();

// Health check endpoints
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            totalDuration = report.TotalDuration.TotalMilliseconds,
            entries = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                duration = e.Value.Duration.TotalMilliseconds,
                description = e.Value.Description,
                tags = e.Value.Tags
            })
        };
        await context.Response.WriteAsJsonAsync(response);
    }
});

app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db")
});

app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("self")
});

// Minimal API endpoints for quick operations
app.MapGet("/api/v1/ping", () => Results.Ok(new { message = "pong", timestamp = DateTime.UtcNow }))
    .WithName("Ping")
    .WithOpenApi()
    .AllowAnonymous();

app.MapGet("/api/v1/version", () => Results.Ok(new
{
    version = "1.0.0",
    environment = app.Environment.EnvironmentName,
    framework = System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription,
    os = System.Runtime.InteropServices.RuntimeInformation.OSDescription
}))
    .WithName("Version")
    .WithOpenApi()
    .AllowAnonymous();

// Startup log
Console.WriteLine("Application configured. Starting HTTP server...");
Log.Information(
    "Certus API starting on {Environment} | Version: {Version} | Framework: {Framework}",
    app.Environment.EnvironmentName,
    "1.0.0",
    System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription);

try
{
    Console.WriteLine($"Listening on: {Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "default ports"}");
    Console.WriteLine("Starting Kestrel server...");
    await app.RunAsync();
    return 0;
}
catch (Exception ex)
{
    Log.Fatal(ex, "Certus API terminated unexpectedly");
    Console.WriteLine($"FATAL ERROR: {ex.GetType().Name}: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    return 1;
}
finally
{
    await Log.CloseAndFlushAsync();
}
