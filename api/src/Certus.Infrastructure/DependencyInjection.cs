using System.Text;
using Azure.Core;
using Certus.Application.Common.Interfaces;
using Certus.Domain.Interfaces;
using Certus.Domain.Services;
using Certus.Infrastructure.Configuration;
using Certus.Infrastructure.Data;
using Certus.Infrastructure.Data.Interceptors;
using Certus.Infrastructure.Data.Repositories;
using Certus.Infrastructure.Identity;
using Certus.Infrastructure.Services;
using Certus.Infrastructure.Services.FileValidation;
using Certus.Infrastructure.Services.Scrapers;
using Certus.Infrastructure.Services.ExternalApis;
using Certus.Infrastructure.Services.ETL;
using Certus.Infrastructure.Services.Email;
using Certus.Infrastructure.BackgroundJobs;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure;

namespace Certus.Infrastructure;

/// <summary>
/// Configuración de inyección de dependencias para la capa de Infrastructure
/// Optimized for .NET 8 and Azure integration (2025)
/// Implements secure Azure authentication patterns with DefaultAzureCredential
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Azure PostgreSQL OAuth scope for token requests
    /// </summary>
    private const string PostgreSqlScope = "https://ossrdbms-aad.database.windows.net/.default";

    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Get environment for conditional configuration
        var environment = services.BuildServiceProvider().GetService<IHostEnvironment>();
        var isDevelopment = environment?.IsDevelopment() ?? false;

        // Database with connection pooling, interceptors, and Azure AD token auth
        services.AddScoped<AuditableEntityInterceptor>();

        // Configure PostgreSQL with Azure AD token authentication support
        var useAzureTokenAuth = configuration.GetValue<bool>("Database:UseAzureTokenAuth");
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string is required");

        if (useAzureTokenAuth)
        {
            // Register NpgsqlDataSource with automatic token refresh for Azure PostgreSQL
            services.AddSingleton(sp =>
            {
                var logger = sp.GetRequiredService<ILogger<NpgsqlDataSourceBuilder>>();
                var credential = AzureCredentialConfiguration.GetCredential(environment);

                var builder = new NpgsqlDataSourceBuilder(connectionString);

                // Configure automatic periodic token refresh
                builder.UsePeriodicPasswordProvider(
                    async (settings, cancellationToken) =>
                    {
                        try
                        {
                            var context = new TokenRequestContext(new[] { PostgreSqlScope });
                            var token = await credential.GetTokenAsync(context, cancellationToken);
                            logger.LogDebug("PostgreSQL token acquired. Expires: {ExpiresOn}", token.ExpiresOn);
                            return token.Token;
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "Failed to acquire PostgreSQL access token");
                            throw;
                        }
                    },
                    TimeSpan.FromMinutes(55), // Refresh interval (tokens valid for 1 hour)
                    TimeSpan.FromSeconds(5)    // Failure retry interval
                );

                logger.LogInformation("PostgreSQL configured with Azure AD token authentication");
                return builder.Build();
            });
        }

        // Use AddDbContext instead of AddDbContextPool for scoped interceptor support
        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            if (useAzureTokenAuth)
            {
                // Use the pre-configured NpgsqlDataSource with token auth
                var dataSource = sp.GetRequiredService<NpgsqlDataSource>();
                options.UseNpgsql(dataSource, npgsqlOptions =>
                {
                    ConfigureNpgsqlOptions(npgsqlOptions, configuration);
                });
            }
            else
            {
                // Use standard connection string
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    ConfigureNpgsqlOptions(npgsqlOptions, configuration);
                });
            }

            options.AddInterceptors(sp.GetRequiredService<AuditableEntityInterceptor>());

            if (configuration.GetValue<bool>("Database:EnableDetailedErrors"))
            {
                options.EnableDetailedErrors();
                options.EnableSensitiveDataLogging();
            }
        });

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        // Identity & Authentication
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();

        var jwtKey = configuration["Jwt:SecretKey"] ?? throw new ArgumentException("JWT SecretKey not configured");
        var jwtIssuer = configuration["Jwt:Issuer"] ?? "Certus";
        var jwtAudience = configuration["Jwt:Audience"] ?? "CertusApi";

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,
                ValidateAudience = true,
                ValidAudience = jwtAudience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            // SignalR support
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;

                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                    }

                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization(options =>
        {
            // Políticas basadas en roles - usando nombres exactos del enum UserRole
            options.AddPolicy("RequireSystemAdmin", policy => policy.RequireRole("SystemAdmin"));
            options.AddPolicy("RequireAdmin", policy => policy.RequireRole("SystemAdmin", "AforeAdmin"));
            options.AddPolicy("RequireSupervisor", policy => policy.RequireRole("SystemAdmin", "AforeAdmin", "Supervisor"));
            options.AddPolicy("RequireAnalyst", policy => policy.RequireRole("SystemAdmin", "AforeAdmin", "Supervisor", "AforeAnalyst"));

            // Políticas basadas en permisos
            options.AddPolicy("CanManageValidations", policy =>
                policy.RequireClaim("permission", "validations:write"));
            options.AddPolicy("CanApprove", policy =>
                policy.RequireClaim("permission", "approvals:approve"));
            options.AddPolicy("CanManageUsers", policy =>
                policy.RequireClaim("permission", "users:write"));
            options.AddPolicy("CanExport", policy =>
                policy.RequireClaim("permission", "reports:export"));
        });

        // Repositories
        services.AddScoped<IValidationRepository, ValidationRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IValidatorRuleRepository, ValidatorRuleRepository>();
        services.AddScoped<IApprovalRepository, ApprovalRepository>();
        services.AddScoped<ICatalogRepository, CatalogRepository>();
        services.AddScoped<ICatalogEntryRepository, CatalogEntryRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();

        // Core Services
        services.AddScoped<IDateTime, DateTimeService>();

        // Email Service - NoOp for development, Azure SendGrid for production
        // Register Infrastructure IEmailService first (NoOpEmailService implements it)
        services.AddScoped<Services.Email.IEmailService, NoOpEmailService>();
        // Register Application IEmailService using the adapter pattern
        services.AddScoped<Application.Common.Interfaces.IEmailService, ApplicationEmailServiceAdapter>();

        // File Storage - Automatic detection: Azure Storage if account name configured, otherwise local
        var azureStorageAccount = configuration["AzureStorage:AccountName"]
            ?? configuration["Azure:Storage:AccountName"];
        var azureStorageConnection = configuration["AzureStorage:ConnectionString"]
            ?? configuration.GetConnectionString("AzureStorage");

        if (!string.IsNullOrEmpty(azureStorageAccount) || !string.IsNullOrEmpty(azureStorageConnection))
        {
            services.AddScoped<IFileStorageService, AzureBlobStorageService>();
        }
        else
        {
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
        }

        // CONSAR File Validation Services
        services.AddScoped<IConsarFileParser, ConsarFileParser>();
        services.AddScoped<IFileValidationService, ConsarFileValidationService>();
        services.AddScoped<IValidationEngineService, ValidationEngineService>();

        // CONSAR Universal Parser (Refactored - Agnostic System)
        // AUDITADO: Nuevo sistema agnóstico basado en análisis de 285 archivos reales
        services.AddSingleton<IConsarLayoutSchemaProvider, ConsarLayoutSchemaProvider>();
        services.AddScoped<IConsarFileTypeDetector, ConsarFileTypeDetector>();
        services.AddScoped<IConsarUniversalParser, ConsarUniversalParser>();

        // Distributed Cache (Redis in production, in-memory for dev)
        var redisConnection = configuration.GetConnectionString("Redis");
        if (!string.IsNullOrEmpty(redisConnection))
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = redisConnection;
                options.InstanceName = "Certus_";
            });
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        // Memory cache for in-process caching (required by external API services)
        services.AddMemoryCache();

        // HTTP Context
        services.AddHttpContextAccessor();

        // ========================================
        // Normative Scraper Services
        // ========================================

        // HttpClient factory for scrapers with resilience policies
        services.AddHttpClient("Scraper", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(60);
            client.DefaultRequestHeaders.Add("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.Add("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            client.DefaultRequestHeaders.Add("Accept-Language", "es-MX,es;q=0.9,en;q=0.8");
        })
        .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate,
            AllowAutoRedirect = true,
            MaxAutomaticRedirections = 5
        });

        // Scraper source handlers (one per source type)
        // Core DOF/SIDOF handlers
        services.AddScoped<IScraperSourceHandler, DofScraperHandler>();
        services.AddScoped<IScraperSourceHandler, GobMxScraperHandler>();
        services.AddScoped<IScraperSourceHandler, SidofScraperHandler>();
        services.AddScoped<IScraperSourceHandler, SinorConsarScraperHandler>();

        // Regulatory institutions handlers
        services.AddScoped<IScraperSourceHandler, CnbvScraperHandler>();
        services.AddScoped<IScraperSourceHandler, ShcpScraperHandler>();
        services.AddScoped<IScraperSourceHandler, BanxicoScraperHandler>();
        services.AddScoped<IScraperSourceHandler, SatScraperHandler>();
        services.AddScoped<IScraperSourceHandler, SepomexScraperHandler>();

        // PLD/AML (Anti-Money Laundering) handlers
        services.AddScoped<IScraperSourceHandler, OfacScraperHandler>();
        services.AddScoped<IScraperSourceHandler, UifScraperHandler>();
        services.AddScoped<IScraperSourceHandler, OnuScraperHandler>();

        // Identity validation and catalog handlers
        services.AddScoped<IScraperSourceHandler, RenapoScraperHandler>();    // CURP validation
        services.AddScoped<IScraperSourceHandler, ImssScraperHandler>();      // NSS validation
        services.AddScoped<IScraperSourceHandler, InfonavitScraperHandler>(); // INFONAVIT contributions
        services.AddScoped<IScraperSourceHandler, InegiScraperHandler>();     // Geographic catalogs
        services.AddScoped<IScraperSourceHandler, SpeiScraperHandler>();      // CLABE/SPEI validation

        // Technical and operational CONSAR handlers
        services.AddScoped<IScraperSourceHandler, ConsarPortalScraperHandler>(); // Comunicados, Plantillas, XSD

        // SAR Market and operational handlers
        services.AddScoped<IScraperSourceHandler, ProcesarScraperHandler>();           // PROCESAR layouts, BDNSAR
        services.AddScoped<IScraperSourceHandler, AmafScraperHandler>();               // AMAFORE statistics, market data
        services.AddScoped<IScraperSourceHandler, CondusefScraperHandler>();           // CONDUSEF user protection
        services.AddScoped<IScraperSourceHandler, IndicesFinancierosScraperHandler>(); // UDI, INPC, TIIE, TC
        services.AddScoped<IScraperSourceHandler, SarLayoutsScraperHandler>();         // SAR technical layouts

        // Investment market and insurance handlers
        services.AddScoped<IScraperSourceHandler, BmvScraperHandler>();                // BMV SIEFORE prices
        services.AddScoped<IScraperSourceHandler, CnsfScraperHandler>();               // CNSF rentas vitalicias
        services.AddScoped<IScraperSourceHandler, PensionissteScraperHandler>();       // PENSIONISSSTE public sector
        services.AddScoped<IScraperSourceHandler, IpabScraperHandler>();               // IPAB deposit protection
        services.AddScoped<IScraperSourceHandler, SieforePreciosScraperHandler>();     // SIEFORE daily prices

        // Labor, housing, and financial infrastructure handlers
        services.AddScoped<IScraperSourceHandler, StpsScraperHandler>();               // STPS labor regulations
        services.AddScoped<IScraperSourceHandler, FovisssteScraperHandler>();          // FOVISSSTE housing ISSSTE
        services.AddScoped<IScraperSourceHandler, IndevalScraperHandler>();            // INDEVAL securities depository
        services.AddScoped<IScraperSourceHandler, MexderScraperHandler>();             // MEXDER derivatives
        services.AddScoped<IScraperSourceHandler, TablasActuarialesScraperHandler>();  // Actuarial tables

        // Regulatory and legal framework handlers
        services.AddScoped<IScraperSourceHandler, CofeceScraperHandler>();             // COFECE competition authority
        services.AddScoped<IScraperSourceHandler, ProdeconScraperHandler>();           // PRODECON taxpayer defense
        services.AddScoped<IScraperSourceHandler, InaiScraperHandler>();               // INAI data protection
        services.AddScoped<IScraperSourceHandler, ProfecoScraperHandler>();            // PROFECO consumer protection
        services.AddScoped<IScraperSourceHandler, LeySarScraperHandler>();             // Ley SAR legal framework

        // Complementary SAR ecosystem handlers
        services.AddScoped<IScraperSourceHandler, ConasamiScraperHandler>();           // CONASAMI minimum wages
        services.AddScoped<IScraperSourceHandler, AsfScraperHandler>();                // ASF federal auditor
        services.AddScoped<IScraperSourceHandler, CetesScraperHandler>();              // CETES government securities
        services.AddScoped<IScraperSourceHandler, ValmerScraperHandler>();             // VALMER market valuation
        services.AddScoped<IScraperSourceHandler, ShfScraperHandler>();                // SHF federal mortgage

        // Operational services and employer systems handlers
        services.AddScoped<IScraperSourceHandler, SuaScraperHandler>();                // SUA employer contributions
        services.AddScoped<IScraperSourceHandler, IdseScraperHandler>();               // IDSE employer digital services
        services.AddScoped<IScraperSourceHandler, ExpedienteAforeScraperHandler>();    // Worker electronic file
        services.AddScoped<IScraperSourceHandler, LisitScraperHandler>();              // Financial institutions list
        services.AddScoped<IScraperSourceHandler, PensionBienestarScraperHandler>();   // Universal pension program

        // Main scraper service
        services.AddScoped<INormativeScraperService, NormativeScraperService>();

        // ========================================
        // Reference Data Service (GLEIF, OpenFIGI, BANXICO, VALMER)
        // ========================================

        // Configure Reference Data options from configuration
        services.Configure<Services.ReferenceData.ReferenceDataOptions>(
            configuration.GetSection(Services.ReferenceData.ReferenceDataOptions.SectionName));

        // Register HttpClient for Reference Data APIs
        services.AddHttpClient("ReferenceData", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("User-Agent", "Certus-CONSAR-Validator/1.0");
        }).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate
        });

        // Register Reference Data Service
        services.AddScoped<IReferenceDataService, Services.ReferenceData.ReferenceDataService>();

        // ========================================
        // External Financial APIs (BANXICO, VALMER, datos.gob.mx)
        // Professional-grade integrations with Polly resilience
        // ========================================

        // Configure External APIs options from configuration
        services.Configure<Configuration.ExternalApisOptions>(
            configuration.GetSection(Configuration.ExternalApisOptions.SectionName));

        // Configure individual API options (bind from ExternalApis section)
        services.Configure<Services.ExternalApis.BanxicoApiOptions>(
            configuration.GetSection($"{Configuration.ExternalApisOptions.SectionName}:Banxico"));
        services.Configure<Services.ExternalApis.ValmerApiOptions>(
            configuration.GetSection($"{Configuration.ExternalApisOptions.SectionName}:Valmer"));
        services.Configure<Services.ExternalApis.MexicanOpenDataOptions>(
            configuration.GetSection($"{Configuration.ExternalApisOptions.SectionName}:OpenData"));

        // HttpClient for BANXICO SIE API
        services.AddHttpClient("BanxicoApi", client =>
        {
            client.BaseAddress = new Uri("https://www.banxico.org.mx/SieAPIRest/service/v1/");
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("User-Agent", "Certus-CONSAR-Validator/2.0");
        }).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate
        });

        // HttpClient for VALMER API
        services.AddHttpClient("ValmerApi", client =>
        {
            client.BaseAddress = new Uri("https://www.valmer.com.mx/");
            client.Timeout = TimeSpan.FromSeconds(60);
            client.DefaultRequestHeaders.Add("Accept", "text/csv, application/json");
            client.DefaultRequestHeaders.Add("User-Agent", "Certus-CONSAR-Validator/2.0");
        }).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate
        });

        // HttpClient for Mexican Open Data (CKAN) APIs
        services.AddHttpClient("MexicanOpenData", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(30);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("User-Agent", "Certus-CONSAR-Validator/2.0");
        }).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
        {
            AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate
        });

        // Register External API Services
        services.AddScoped<IBanxicoApiService, BanxicoApiService>();
        services.AddScoped<IValmerApiService, ValmerApiService>();
        services.AddScoped<IMexicanOpenDataService, MexicanOpenDataService>();

        // ========================================
        // ETL Services - ScrapedDocument to CatalogEntry transformation
        // ========================================
        services.AddScoped<IScrapedDataProcessor, ScrapedDataProcessor>();

        // ========================================
        // Hangfire Background Jobs
        // ========================================

        var hangfireStorageOptions = new PostgreSqlStorageOptions
        {
            SchemaName = "hangfire",
            QueuePollInterval = TimeSpan.FromSeconds(15),
            PrepareSchemaIfNecessary = true,
            EnableTransactionScopeEnlistment = true,
            InvisibilityTimeout = TimeSpan.FromMinutes(30),
            DistributedLockTimeout = TimeSpan.FromMinutes(10)
        };

        if (useAzureTokenAuth)
        {
            // Use NpgsqlDataSource for Azure AD token authentication
            // Register a custom connection factory
            services.AddSingleton<IConnectionFactory>(sp =>
            {
                var dataSource = sp.GetRequiredService<NpgsqlDataSource>();
                return new AzureAdConnectionFactory(dataSource);
            });

            services.AddHangfire((sp, config) =>
            {
                var connectionFactory = sp.GetRequiredService<IConnectionFactory>();
                config
                    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                    .UseSimpleAssemblyNameTypeSerializer()
                    .UseRecommendedSerializerSettings()
                    .UsePostgreSqlStorage(options => options
                        .UseConnectionFactory(connectionFactory), hangfireStorageOptions);
            });
        }
        else
        {
            // Use standard connection string
            var hangfireConnection = configuration.GetConnectionString("HangfireConnection")
                ?? connectionString;

            services.AddHangfire(config => config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options => options
                    .UseNpgsqlConnection(hangfireConnection), hangfireStorageOptions));
        }

        services.AddHangfireServer(options =>
        {
            options.WorkerCount = Environment.ProcessorCount * 2;
            options.Queues = new[] { "default", "scrapers", "critical" };
            options.ServerName = $"certus-{Environment.MachineName}";
            options.SchedulePollingInterval = TimeSpan.FromSeconds(15);
        });

        // Health Checks - Conditional based on token auth
        var healthChecksBuilder = services.AddHealthChecks();
        if (!useAzureTokenAuth)
        {
            // Standard connection string health check
            healthChecksBuilder.AddNpgSql(connectionString, name: "database", tags: new[] { "db" });
        }
        healthChecksBuilder.AddCheck("self", () =>
            Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy("API is healthy"),
            tags: new[] { "self" });

        return services;
    }

    /// <summary>
    /// Configures common Npgsql options for both token auth and standard connection
    /// </summary>
    private static void ConfigureNpgsqlOptions(
        NpgsqlDbContextOptionsBuilder npgsqlOptions,
        IConfiguration configuration)
    {
        npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);

        // Retry configuration for Azure resilience
        var maxRetryCount = configuration.GetValue("Database:MaxRetryCount", 3);
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: maxRetryCount,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null);

        // Performance optimizations
        var commandTimeout = configuration.GetValue("Database:CommandTimeout", 30);
        npgsqlOptions.CommandTimeout(commandTimeout);
        npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);

        // Connection pooling is handled by NpgsqlDataSource
    }
}
