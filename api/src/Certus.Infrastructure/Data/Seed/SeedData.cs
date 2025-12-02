using Certus.Domain.Entities;
using Certus.Domain.Enums;
using Certus.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Certus.Infrastructure.Data.Seed;

/// <summary>
/// Datos iniciales para el sistema CONSAR
/// Optimized for .NET 8 and CONSAR Circular 19-8 (2025)
/// </summary>
public static class SeedData
{
    public static async Task InitializeAsync(
        ApplicationDbContext context,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        // Create test tenant if none exist
        if (!await context.Tenants.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Seeding tenants...");
            await SeedTenantsAsync(context, cancellationToken);
        }

        // Create test users if none exist
        if (!await context.Users.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Seeding users...");
            await SeedUsersAsync(context, cancellationToken);
        }

        // Create CONSAR catalogs - check for version 2025.1 (PROCESAR codes)
        var hasCurrentCatalogs = await context.Catalogs
            .AnyAsync(c => c.Version == "2025.1", cancellationToken);
        if (!hasCurrentCatalogs)
        {
            logger.LogInformation("Seeding catalogs with PROCESAR codes (v2025.1)...");
            await SeedCatalogsAsync(context, cancellationToken);
        }

        // Create CONSAR validators
        if (!await context.ValidatorRules.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Seeding validators...");
            await SeedValidatorsAsync(context, cancellationToken);
        }

        // Create validator groups
        if (!await context.ValidatorGroups.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Seeding validator groups...");
            await SeedValidatorGroupsAsync(context, cancellationToken);
        }

        // Create normative changes
        if (!await context.NormativeChanges.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Seeding normative changes...");
            await SeedNormativeChangesAsync(context, cancellationToken);
        }

        // Create scraper sources
        if (!await context.ScraperSources.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Seeding scraper sources...");
            await SeedScraperSourcesAsync(context, cancellationToken);
        }

        await context.SaveChangesAsync(cancellationToken);

        // Promote specific users to SystemAdmin
        await PromoteSystemAdminsAsync(context, logger, cancellationToken);

        logger.LogInformation("Seed data completed");
    }

    /// <summary>
    /// Promotes specific users to SystemAdmin role
    /// </summary>
    private static async Task PromoteSystemAdminsAsync(
        ApplicationDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var systemAdminEmails = new[]
        {
            "admin@hergon.digital",
            "admin@certus.mx"
        };

        foreach (var email in systemAdminEmails)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);

            if (user != null && user.Role != UserRole.SystemAdmin)
            {
                user.ChangeRole(UserRole.SystemAdmin);
                await context.SaveChangesAsync(cancellationToken);
                logger.LogInformation("User {Email} promoted to SystemAdmin", email);
            }
        }
    }

    private static async Task SeedTenantsAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        var tenants = new[]
        {
            Tenant.Create("AFORE Demo", "AFORE01"),
            Tenant.Create("Certus Admin", "CERTUS")
        };

        await context.Tenants.AddRangeAsync(tenants, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedUsersAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        var tenant = await context.Tenants.FirstAsync(t => t.AforeCode == "CERTUS", cancellationToken);

        // Password hash for "Admin123!" - BCrypt (cost factor 11)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 11);

        var adminUser = User.Create(
            "admin@certus.mx",
            passwordHash,
            "Administrador Sistema",
            tenant.Id,
            UserRole.SystemAdmin);

        var analystUser = User.Create(
            "analista@certus.mx",
            passwordHash,
            "Ana García",
            tenant.Id,
            UserRole.AforeAnalyst);

        var supervisorUser = User.Create(
            "supervisor@certus.mx",
            passwordHash,
            "Carlos López",
            tenant.Id,
            UserRole.Supervisor);

        await context.Users.AddRangeAsync(new[] { adminUser, analystUser, supervisorUser }, cancellationToken);
    }

    private static async Task SeedCatalogsAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        // =============================================================================
        // CLEANUP: Remove old catalogs (version != 2025.1) to allow update
        // =============================================================================
        var oldCatalogs = await context.Catalogs
            .Where(c => c.Version != "2025.1")
            .ToListAsync(cancellationToken);

        if (oldCatalogs.Any())
        {
            // First remove all entries from old catalogs
            var oldCatalogIds = oldCatalogs.Select(c => c.Id).ToList();
            var oldEntries = await context.CatalogEntries
                .Where(e => oldCatalogIds.Contains(e.CatalogId))
                .ToListAsync(cancellationToken);
            context.CatalogEntries.RemoveRange(oldEntries);

            // Then remove the catalogs themselves
            context.Catalogs.RemoveRange(oldCatalogs);
            await context.SaveChangesAsync(cancellationToken);
        }

        // =============================================================================
        // 1. CATÁLOGO DE AFOREs - Códigos oficiales PROCESAR (Nov 2025)
        // Fuente: Archivos CONSAR y Directorio oficial CONSAR
        // =============================================================================
        var aforesCatalog = Catalog.Create("AFORES", "Catálogo de AFOREs",
            "Administradoras de Fondos para el Retiro autorizadas por CONSAR", "2025.1", "CONSAR/PROCESAR");
        await context.Catalogs.AddAsync(aforesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var afores = new[]
        {
            CatalogEntry.Create(aforesCatalog.Id, "530", "AFORE XXI Banorte", "XXI Banorte - RFC: AXB010727LE9", sortOrder: 1),
            CatalogEntry.Create(aforesCatalog.Id, "544", "AFORE Azteca", "Azteca - RFC: AAZ010423NI3", sortOrder: 2),
            CatalogEntry.Create(aforesCatalog.Id, "538", "AFORE Citibanamex", "Citibanamex - RFC: ABA970925BY4", sortOrder: 3),
            CatalogEntry.Create(aforesCatalog.Id, "568", "AFORE Coppel", "Coppel - RFC: ACO100614Q70", sortOrder: 4),
            CatalogEntry.Create(aforesCatalog.Id, "578", "AFORE Inbursa", "Inbursa - RFC: AIN970922DC5", sortOrder: 5),
            CatalogEntry.Create(aforesCatalog.Id, "562", "AFORE Invercap", "Invercap - RFC: INV010309QU9", sortOrder: 6),
            CatalogEntry.Create(aforesCatalog.Id, "519", "PensionISSSTE", "PensionISSSTE - RFC: PEN080619UC2", sortOrder: 7),
            CatalogEntry.Create(aforesCatalog.Id, "553", "AFORE Principal", "Principal - RFC: PPR010403RL6", sortOrder: 8),
            CatalogEntry.Create(aforesCatalog.Id, "527", "AFORE Profuturo", "Profuturo - RFC: PRO970701LH1", sortOrder: 9),
            CatalogEntry.Create(aforesCatalog.Id, "570", "AFORE SURA", "SURA - RFC: ASU010305QJ0", sortOrder: 10)
        };
        await context.CatalogEntries.AddRangeAsync(afores, cancellationToken);

        // =============================================================================
        // 2. CATÁLOGO DE SUBCUENTAS PROCESAR - Códigos numéricos de archivos .1101
        // Fuente: Archivos .1101 extraídos de ZIPs CONSAR Nov 2025
        // =============================================================================
        var subcuentasCatalog = Catalog.Create("SUBCUENTAS_PROCESAR", "Catálogo de Subcuentas PROCESAR",
            "Códigos numéricos de subcuentas usados en archivos .1101", "2025.1", "PROCESAR");
        await context.Catalogs.AddAsync(subcuentasCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var subcuentas = new[]
        {
            CatalogEntry.Create(subcuentasCatalog.Id, "11010", "Control/Header", "Registro de control del archivo", sortOrder: 1),
            CatalogEntry.Create(subcuentasCatalog.Id, "11020", "RCV", "RCV - Retiro, Cesantía y Vejez (aportaciones obligatorias tripartitas)", sortOrder: 2),
            CatalogEntry.Create(subcuentasCatalog.Id, "11030", "SAR 92", "SAR 1992 - Recursos del SAR anterior a 1997", sortOrder: 3),
            CatalogEntry.Create(subcuentasCatalog.Id, "11040", "SAR IMSS", "Recursos SAR administrados por IMSS", sortOrder: 4),
            CatalogEntry.Create(subcuentasCatalog.Id, "11050", "SAR ISSSTE", "Recursos SAR administrados por ISSSTE", sortOrder: 5),
            CatalogEntry.Create(subcuentasCatalog.Id, "12010", "Aportaciones Voluntarias", "AVO - Ahorro voluntario del trabajador", sortOrder: 6),
            CatalogEntry.Create(subcuentasCatalog.Id, "12020", "Aportaciones Complementarias", "AVC - Ahorro voluntario complementario", sortOrder: 7),
            CatalogEntry.Create(subcuentasCatalog.Id, "12030", "Ahorro Largo Plazo", "ALP - Ahorro voluntario largo plazo (5 años)", sortOrder: 8),
            CatalogEntry.Create(subcuentasCatalog.Id, "12060", "Ahorro Solidario", "Programa ahorro solidario ISSSTE", sortOrder: 9),
            CatalogEntry.Create(subcuentasCatalog.Id, "12070", "Cuota Social", "Aportación del Gobierno Federal", sortOrder: 10),
            CatalogEntry.Create(subcuentasCatalog.Id, "12090", "Subcuenta Adicional", "Subcuenta adicional especial", sortOrder: 11),
            CatalogEntry.Create(subcuentasCatalog.Id, "12100", "Bono Pensión ISSSTE", "Bono de pensión trabajadores ISSSTE", sortOrder: 12),
            CatalogEntry.Create(subcuentasCatalog.Id, "12110", "Vivienda", "INFONAVIT/FOVISSSTE", sortOrder: 13),
            CatalogEntry.Create(subcuentasCatalog.Id, "12130", "SAR 97", "Aportaciones SAR desde 1997", sortOrder: 14),
            CatalogEntry.Create(subcuentasCatalog.Id, "12180", "Reserva Régimen Anterior", "Reserva del régimen anterior", sortOrder: 15),
            CatalogEntry.Create(subcuentasCatalog.Id, "12240", "Otros Conceptos", "Conceptos adicionales", sortOrder: 16)
        };
        await context.CatalogEntries.AddRangeAsync(subcuentas, cancellationToken);

        // =============================================================================
        // 3. CATÁLOGO DE TIPOS DE ARCHIVO CONSAR
        // Fuente: Circular CONSAR 19-8
        // =============================================================================
        var fileTypesCatalog = Catalog.Create("TIPOS_ARCHIVO", "Tipos de Archivo CONSAR",
            "Tipos de archivos CONSAR con especificaciones técnicas", "2025.1", "CONSAR");
        await context.Catalogs.AddAsync(fileTypesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var fileTypes = new[]
        {
            CatalogEntry.Create(fileTypesCatalog.Id, "NOMINA", "Archivo de Nómina", "Aportaciones patronales - Circular 19-8", sortOrder: 1),
            CatalogEntry.Create(fileTypesCatalog.Id, "CONTABLE", "Archivo Contable", "Movimientos contables SIEFORES", sortOrder: 2),
            CatalogEntry.Create(fileTypesCatalog.Id, "REGULARIZACION", "Archivo de Regularización", "Correcciones y ajustes", sortOrder: 3),
            CatalogEntry.Create(fileTypesCatalog.Id, "TRASPASOS", "Archivo de Traspasos", "Solicitudes de traspaso entre AFOREs", sortOrder: 4),
            CatalogEntry.Create(fileTypesCatalog.Id, "RETIROS", "Archivo de Retiros", "Solicitudes de retiro parcial/total", sortOrder: 5),
            CatalogEntry.Create(fileTypesCatalog.Id, "APORTACIONES", "Archivo de Aportaciones Voluntarias", "Aportaciones voluntarias", sortOrder: 6),
            CatalogEntry.Create(fileTypesCatalog.Id, "CARTERA_SIEFORE", "Cartera de Inversión", "Portafolio de inversiones SIEFORE", sortOrder: 7),
            CatalogEntry.Create(fileTypesCatalog.Id, "DERIVADOS", "Posiciones en Derivados", "Posiciones en derivados financieros", sortOrder: 8)
        };
        await context.CatalogEntries.AddRangeAsync(fileTypes, cancellationToken);

        // =============================================================================
        // 4. CATÁLOGO DE TIPOS DE ARCHIVO PROCESAR
        // Fuente: Nombres de archivo en ZIPs CONSAR (SB_530, PS_430, AV_630)
        // =============================================================================
        var tiposArchivoProcesar = Catalog.Create("TIPOS_ARCHIVO_PROCESAR", "Tipos de Archivo PROCESAR",
            "Prefijos de archivo usados en intercambio PROCESAR", "2025.1", "PROCESAR");
        await context.Catalogs.AddAsync(tiposArchivoProcesar, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var tiposProcesar = new[]
        {
            CatalogEntry.Create(tiposArchivoProcesar.Id, "SB_530", "SIEFORE Básica", "Posiciones de inversión básica", sortOrder: 1),
            CatalogEntry.Create(tiposArchivoProcesar.Id, "PS_430", "Posiciones SIEFORE", "Portafolio de inversiones SIEFORE", sortOrder: 2),
            CatalogEntry.Create(tiposArchivoProcesar.Id, "AV_630", "Aportaciones Voluntarias", "Archivo de aportaciones voluntarias", sortOrder: 3)
        };
        await context.CatalogEntries.AddRangeAsync(tiposProcesar, cancellationToken);

        // =============================================================================
        // 5. CATÁLOGO DE EXTENSIONES PROCESAR
        // Fuente: Archivos extraídos de ZIPs CONSAR
        // =============================================================================
        var extensionesCatalog = Catalog.Create("EXTENSIONES_PROCESAR", "Extensiones PROCESAR",
            "Extensiones de archivo en intercambio PROCESAR", "2025.1", "PROCESAR");
        await context.Catalogs.AddAsync(extensionesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var extensiones = new[]
        {
            CatalogEntry.Create(extensionesCatalog.Id, "0300", "Datos principales", "Datos principales de posiciones", sortOrder: 1),
            CatalogEntry.Create(extensionesCatalog.Id, "0314", "Detalle instrumentos", "Detalle de posiciones por instrumento", sortOrder: 2),
            CatalogEntry.Create(extensionesCatalog.Id, "0316", "Header/Resumen", "Registro de encabezado del archivo", sortOrder: 3),
            CatalogEntry.Create(extensionesCatalog.Id, "0317", "Control/Totales", "Registro de control y totales", sortOrder: 4),
            CatalogEntry.Create(extensionesCatalog.Id, "0321", "Cierre", "Registro de cierre del archivo", sortOrder: 5),
            CatalogEntry.Create(extensionesCatalog.Id, "1101", "Catálogo Subcuentas", "Catálogo de subcuentas SAR", sortOrder: 6)
        };
        await context.CatalogEntries.AddRangeAsync(extensiones, cancellationToken);

        // =============================================================================
        // 6. CATÁLOGO DE SIEFORES GENERACIONALES
        // Fuente: Carpetas en ZIPs CONSAR (XXI6064, XXI6569, etc.)
        // =============================================================================
        var sieforesGenCatalog = Catalog.Create("SIEFORES_GENERACIONALES", "SIEFOREs Generacionales",
            "Fondos de inversión por generación de nacimiento", "2025.1", "CONSAR");
        await context.Catalogs.AddAsync(sieforesGenCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var sieforesGen = new[]
        {
            CatalogEntry.Create(sieforesGenCatalog.Id, "001000", "SB Inicial", "SIEFORE Básica Inicial", sortOrder: 1),
            CatalogEntry.Create(sieforesGenCatalog.Id, "000090", "SB Integrado", "SIEFORE Básica Integrada (transición)", sortOrder: 2),
            CatalogEntry.Create(sieforesGenCatalog.Id, "001960", "SB 60-64", "Nacidos entre 1960-1964", sortOrder: 3),
            CatalogEntry.Create(sieforesGenCatalog.Id, "001965", "SB 65-69", "Nacidos entre 1965-1969", sortOrder: 4),
            CatalogEntry.Create(sieforesGenCatalog.Id, "001970", "SB 70-74", "Nacidos entre 1970-1974", sortOrder: 5),
            CatalogEntry.Create(sieforesGenCatalog.Id, "001975", "SB 75-79", "Nacidos entre 1975-1979", sortOrder: 6),
            CatalogEntry.Create(sieforesGenCatalog.Id, "001980", "SB 80-84", "Nacidos entre 1980-1984", sortOrder: 7),
            CatalogEntry.Create(sieforesGenCatalog.Id, "001985", "SB 85-89", "Nacidos entre 1985-1989", sortOrder: 8),
            CatalogEntry.Create(sieforesGenCatalog.Id, "001990", "SB 90-94", "Nacidos entre 1990-1994", sortOrder: 9),
            CatalogEntry.Create(sieforesGenCatalog.Id, "001995", "SB 95-99", "Nacidos entre 1995-1999", sortOrder: 10)
        };
        await context.CatalogEntries.AddRangeAsync(sieforesGen, cancellationToken);

        // =============================================================================
        // 7. CATÁLOGO DE FONDOS ESPECIALES
        // Fuente: Carpetas especiales en ZIPs CONSAR
        // =============================================================================
        var fondosEspecialesCatalog = Catalog.Create("FONDOS_ESPECIALES", "Fondos Especiales",
            "Fondos de pensión de estados y entidades especiales", "2025.1", "PROCESAR");
        await context.Catalogs.AddAsync(fondosEspecialesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var fondosEspeciales = new[]
        {
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "1SSEMYM", "ISSEMYM", "Instituto de Seguridad Social del Estado de México y Municipios", sortOrder: 1),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "BMRPREV", "Banorte Previsión", "Fondo de previsión Banorte", sortOrder: 2),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "CJUBILA", "Caja Jubilados", "Caja de jubilaciones especial", sortOrder: 3),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "ISSEMYM", "ISSEMYM Alt", "ISSEMYM cuenta alternativa", sortOrder: 4),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "ISSSTNL", "ISSSTE NL", "ISSSTE Nuevo León", sortOrder: 5),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "PMXSAR", "Pensión México SAR", "Fondo Pensión México SAR", sortOrder: 6),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "SBRAICP", "SIEFORE RAICP", "SIEFORE Básica RAICP (Aportaciones Voluntarias)", sortOrder: 7),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "SBRPSCP", "SIEFORE PSCP", "SIEFORE Básica PSCP", sortOrder: 8),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "XXINTEA", "XXI Integrado A", "Fondo XXI Banorte Integrado A", sortOrder: 9),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "XXINTEB", "XXI Integrado B", "Fondo XXI Banorte Integrado B", sortOrder: 10),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "XXINTEC", "XXI Integrado C", "Fondo XXI Banorte Integrado C", sortOrder: 11),
            CatalogEntry.Create(fondosEspecialesCatalog.Id, "XXINTE0", "XXI Integrado 0", "Fondo XXI Banorte Integrado transición", sortOrder: 12)
        };
        await context.CatalogEntries.AddRangeAsync(fondosEspeciales, cancellationToken);

        // =============================================================================
        // 8. CATÁLOGO DE TIPOS DE MOVIMIENTO
        // Fuente: Circular CONSAR 19-8
        // =============================================================================
        var movimientosCatalog = Catalog.Create("TIPOS_MOVIMIENTO", "Tipos de Movimiento",
            "Tipos de movimiento para archivos CONSAR", "2025.1", "CONSAR");
        await context.Catalogs.AddAsync(movimientosCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var movimientos = new[]
        {
            CatalogEntry.Create(movimientosCatalog.Id, "A", "Alta", "Nuevo registro de aportación", sortOrder: 1),
            CatalogEntry.Create(movimientosCatalog.Id, "B", "Baja", "Cancelación de registro", sortOrder: 2),
            CatalogEntry.Create(movimientosCatalog.Id, "M", "Modificación", "Corrección de registro existente", sortOrder: 3),
            CatalogEntry.Create(movimientosCatalog.Id, "D", "Débito", "Cargo a cuenta", sortOrder: 4),
            CatalogEntry.Create(movimientosCatalog.Id, "C", "Crédito", "Abono a cuenta", sortOrder: 5),
            CatalogEntry.Create(movimientosCatalog.Id, "T", "Traspaso", "Transferencia entre AFOREs", sortOrder: 6),
            CatalogEntry.Create(movimientosCatalog.Id, "U", "Unificación", "Unificación de cuentas", sortOrder: 7),
            CatalogEntry.Create(movimientosCatalog.Id, "RP", "Retiro Parcial", "Retiro parcial por desempleo", sortOrder: 8),
            CatalogEntry.Create(movimientosCatalog.Id, "RT", "Retiro Total", "Retiro total por pensión", sortOrder: 9),
            CatalogEntry.Create(movimientosCatalog.Id, "RM", "Retiro Matrimonio", "Retiro por matrimonio", sortOrder: 10)
        };
        await context.CatalogEntries.AddRangeAsync(movimientos, cancellationToken);

        // =============================================================================
        // 9. CATÁLOGO DE CÓDIGOS DE RECHAZO LOTE
        // Fuente: PROCESAR - Códigos de rechazo de lote
        // =============================================================================
        var rechazosLoteCatalog = Catalog.Create("RECHAZOS_LOTE", "Rechazos de Lote",
            "Códigos de rechazo a nivel de archivo/lote PROCESAR", "2025.1", "PROCESAR");
        await context.Catalogs.AddAsync(rechazosLoteCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var rechazosLote = new[]
        {
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_001", "Falta registro encabezado", "El archivo no contiene registro tipo 01", sortOrder: 1),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_002", "Falta registro sumaria", "El archivo no contiene registro tipo 03", sortOrder: 2),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_003", "Formato de nombre inválido", "El nombre del archivo no cumple con el formato", sortOrder: 3),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_004", "Tipo de archivo no coincide", "El tipo en nombre no coincide con contenido", sortOrder: 4),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_005", "Conteo de registros incorrecto", "La sumaria no coincide con registros detalle", sortOrder: 5),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_006", "Suma de importes incorrecta", "Total de importes no coincide con sumaria", sortOrder: 6),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_007", "RFC emisor inválido", "El RFC en nombre de archivo no es válido", sortOrder: 7),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_008", "Fecha de archivo inválida", "La fecha en nombre de archivo no es válida", sortOrder: 8),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_009", "Código AFORE no autorizado", "El código de AFORE no está registrado", sortOrder: 9),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_010", "Archivo duplicado", "Ya existe un archivo con mismo nombre y fecha", sortOrder: 10),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_012", "Archivo vacío", "El archivo no contiene registros", sortOrder: 11),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_013", "Formato nombre archivo", "El formato de nombre no cumple TIPO_RFC_FECHA_SEC", sortOrder: 12),
            CatalogEntry.Create(rechazosLoteCatalog.Id, "LOTE_014", "Caracteres no ASCII", "El archivo contiene caracteres no permitidos", sortOrder: 13)
        };
        await context.CatalogEntries.AddRangeAsync(rechazosLote, cancellationToken);

        // =============================================================================
        // 10. CATÁLOGO DE CÓDIGOS DE RECHAZO REGISTRO
        // Fuente: PROCESAR - Códigos de rechazo a nivel de registro
        // =============================================================================
        var rechazosRegistroCatalog = Catalog.Create("RECHAZOS_REGISTRO", "Rechazos de Registro",
            "Códigos de rechazo a nivel de registro individual", "2025.1", "PROCESAR");
        await context.Catalogs.AddAsync(rechazosRegistroCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var rechazosRegistro = new[]
        {
            // Errores CURP
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_001", "CURP inválida", "La CURP no cumple con el formato o dígito verificador", sortOrder: 1),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_004", "CURP con advertencia", "CURP válida pero con observaciones", sortOrder: 4),
            // Errores NSS
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_010", "NSS inválido", "El NSS no cumple con formato o dígito Luhn", sortOrder: 10),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_013", "NSS vs CURP inconsistente", "El año del NSS no corresponde con CURP", sortOrder: 13),
            // Errores RFC
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_020", "RFC inválido", "El RFC no cumple con formato SAT", sortOrder: 20),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_021", "RFC advertencia", "RFC válido con observaciones", sortOrder: 21),
            // Errores Cuenta
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_030", "Número de cuenta inválido", "La cuenta no cumple con 11 dígitos", sortOrder: 30),
            // Errores Importe
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_040", "Importe no numérico", "El importe no es un valor numérico válido", sortOrder: 40),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_041", "Importe negativo o cero", "El importe debe ser mayor a cero", sortOrder: 41),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_042", "Importe inusualmente alto", "El importe supera límites normales", sortOrder: 42),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_043", "Importe excede máximo", "El importe excede el máximo permitido", sortOrder: 43),
            // Errores Fecha
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_050", "Fecha inválida", "La fecha no cumple formato YYYYMMDD", sortOrder: 50),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_051", "Fecha futura", "La fecha es posterior a hoy", sortOrder: 51),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_052", "Fecha muy antigua", "La fecha es anterior a 1997 (inicio SAR)", sortOrder: 52),
            // Errores Tipo Movimiento
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_060", "Tipo movimiento inválido", "El tipo de movimiento no es válido para este archivo", sortOrder: 60),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_061", "NSS duplicado", "El NSS aparece más de una vez en el archivo", sortOrder: 61),
            // Errores Nombre
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_070", "Nombre vacío", "El nombre del trabajador está vacío", sortOrder: 70),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_071", "Nombre muy corto", "El nombre tiene menos de 5 caracteres", sortOrder: 71),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_072", "Nombre caracteres inválidos", "El nombre contiene caracteres no permitidos", sortOrder: 72),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_073", "Nombre vs CURP inconsistente", "Las iniciales del CURP no coinciden con nombre", sortOrder: 73),
            // Errores Estructura
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_081", "Múltiples encabezados", "Hay más de un registro tipo 01", sortOrder: 81),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_082", "Múltiples sumarias", "Hay más de un registro tipo 03", sortOrder: 82),
            CatalogEntry.Create(rechazosRegistroCatalog.Id, "REG_083", "Sumaria mal ubicada", "El registro sumaria no está al final", sortOrder: 83)
        };
        await context.CatalogEntries.AddRangeAsync(rechazosRegistro, cancellationToken);

        // =============================================================================
        // 11. CATÁLOGO DE ESTADOS DE VALIDACIÓN
        // =============================================================================
        var estadosCatalog = Catalog.Create("ESTADOS_VALIDACION", "Estados de Validación",
            "Estados posibles para validaciones de archivos", "2025.1", "CERTUS");
        await context.Catalogs.AddAsync(estadosCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var estados = new[]
        {
            CatalogEntry.Create(estadosCatalog.Id, "PENDING", "Pendiente", "Validación en espera de procesamiento", sortOrder: 1),
            CatalogEntry.Create(estadosCatalog.Id, "PROCESSING", "Procesando", "Validación en proceso", sortOrder: 2),
            CatalogEntry.Create(estadosCatalog.Id, "SUCCESS", "Exitosa", "Validación completada sin errores", sortOrder: 3),
            CatalogEntry.Create(estadosCatalog.Id, "WARNING", "Con advertencias", "Validación completada con advertencias", sortOrder: 4),
            CatalogEntry.Create(estadosCatalog.Id, "ERROR", "Con errores", "Validación completada con errores", sortOrder: 5),
            CatalogEntry.Create(estadosCatalog.Id, "CRITICAL", "Crítico", "Validación fallida por errores críticos", sortOrder: 6)
        };
        await context.CatalogEntries.AddRangeAsync(estados, cancellationToken);

        // =============================================================================
        // 12. CATÁLOGO DE BANCOS PARA CLABE (BANXICO/SPEI)
        // Fuente: Catálogo oficial BANXICO https://www.banxico.org.mx/cep
        // =============================================================================
        var clabesCatalog = Catalog.Create("CLABE_BANCOS", "Bancos CLABE/SPEI",
            "Catálogo de instituciones participantes en SPEI con código CLABE de 3 dígitos", "2025.1", "BANXICO");
        await context.Catalogs.AddAsync(clabesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var clabesBancos = new[]
        {
            // Bancos Principales
            CatalogEntry.Create(clabesCatalog.Id, "002", "BANAMEX", "Banco Nacional de México", sortOrder: 1),
            CatalogEntry.Create(clabesCatalog.Id, "012", "BBVA MEXICO", "BBVA México", sortOrder: 2),
            CatalogEntry.Create(clabesCatalog.Id, "014", "SANTANDER", "Banco Santander", sortOrder: 3),
            CatalogEntry.Create(clabesCatalog.Id, "021", "HSBC", "HSBC México", sortOrder: 4),
            CatalogEntry.Create(clabesCatalog.Id, "030", "BAJIO", "Banco del Bajío", sortOrder: 5),
            CatalogEntry.Create(clabesCatalog.Id, "032", "IXE", "Banco IXE (ahora Banorte)", sortOrder: 6),
            CatalogEntry.Create(clabesCatalog.Id, "036", "INBURSA", "Banco Inbursa", sortOrder: 7),
            CatalogEntry.Create(clabesCatalog.Id, "037", "INTERACCIONES", "Banco Interacciones", sortOrder: 8),
            CatalogEntry.Create(clabesCatalog.Id, "042", "MIFEL", "Banca Mifel", sortOrder: 9),
            CatalogEntry.Create(clabesCatalog.Id, "044", "SCOTIABANK", "Scotiabank", sortOrder: 10),
            CatalogEntry.Create(clabesCatalog.Id, "058", "BANREGIO", "Banco Regional de Monterrey", sortOrder: 11),
            CatalogEntry.Create(clabesCatalog.Id, "059", "INVEX", "Banco Invex", sortOrder: 12),
            CatalogEntry.Create(clabesCatalog.Id, "060", "BANSI", "Bansi", sortOrder: 13),
            CatalogEntry.Create(clabesCatalog.Id, "062", "AFIRME", "Banca Afirme", sortOrder: 14),
            CatalogEntry.Create(clabesCatalog.Id, "072", "BANORTE", "Banco Banorte", sortOrder: 15),
            CatalogEntry.Create(clabesCatalog.Id, "106", "BANK OF AMERICA", "Bank of America México", sortOrder: 16),
            CatalogEntry.Create(clabesCatalog.Id, "108", "TOKYO", "Bank of Tokyo-Mitsubishi UFJ", sortOrder: 17),
            CatalogEntry.Create(clabesCatalog.Id, "110", "JP MORGAN", "JP Morgan", sortOrder: 18),
            CatalogEntry.Create(clabesCatalog.Id, "112", "BMONEX", "Banco Monex", sortOrder: 19),
            CatalogEntry.Create(clabesCatalog.Id, "113", "VE POR MAS", "Banco Ve por Más", sortOrder: 20),
            CatalogEntry.Create(clabesCatalog.Id, "124", "DEUTSCHE", "Deutsche Bank", sortOrder: 21),
            CatalogEntry.Create(clabesCatalog.Id, "126", "CREDIT SUISSE", "Credit Suisse", sortOrder: 22),
            CatalogEntry.Create(clabesCatalog.Id, "127", "AZTECA", "Banco Azteca", sortOrder: 23),
            CatalogEntry.Create(clabesCatalog.Id, "128", "AUTOFIN", "Banco Autofin", sortOrder: 24),
            CatalogEntry.Create(clabesCatalog.Id, "129", "BARCLAYS", "Barclays Bank", sortOrder: 25),
            CatalogEntry.Create(clabesCatalog.Id, "130", "COMPARTAMOS", "Banco Compartamos", sortOrder: 26),
            CatalogEntry.Create(clabesCatalog.Id, "131", "FAMSA", "Banco Famsa", sortOrder: 27),
            CatalogEntry.Create(clabesCatalog.Id, "132", "MULTIVA", "Banco Multiva", sortOrder: 28),
            CatalogEntry.Create(clabesCatalog.Id, "133", "ACTINVER", "Banco Actinver", sortOrder: 29),
            CatalogEntry.Create(clabesCatalog.Id, "134", "INTERCAM", "Banco Intercam", sortOrder: 30),
            CatalogEntry.Create(clabesCatalog.Id, "135", "BBASE", "Banco Base", sortOrder: 31),
            CatalogEntry.Create(clabesCatalog.Id, "136", "VOLKSWAGEN", "VW Bank", sortOrder: 32),
            CatalogEntry.Create(clabesCatalog.Id, "137", "CIBANCO", "CIBanco", sortOrder: 33),
            CatalogEntry.Create(clabesCatalog.Id, "138", "ABC CAPITAL", "ABC Capital", sortOrder: 34),
            CatalogEntry.Create(clabesCatalog.Id, "140", "CONSUBANCO", "Consubanco", sortOrder: 35),
            CatalogEntry.Create(clabesCatalog.Id, "141", "DONDÉ", "Banco Dondé", sortOrder: 36),
            CatalogEntry.Create(clabesCatalog.Id, "143", "COPPEL", "BanCoppel", sortOrder: 37),
            CatalogEntry.Create(clabesCatalog.Id, "145", "BOFAML", "BofA Securities", sortOrder: 38),
            CatalogEntry.Create(clabesCatalog.Id, "147", "BANKAOOL", "Bankaool", sortOrder: 39),
            CatalogEntry.Create(clabesCatalog.Id, "148", "INMOBILIARIO", "Banco Inmobiliario", sortOrder: 40),
            CatalogEntry.Create(clabesCatalog.Id, "150", "FORJADORES", "Banco Forjadores", sortOrder: 41),
            CatalogEntry.Create(clabesCatalog.Id, "152", "BANCREA", "Banco Bancrea", sortOrder: 42),
            CatalogEntry.Create(clabesCatalog.Id, "154", "ICBC", "Industrial and Commercial Bank of China", sortOrder: 43),
            CatalogEntry.Create(clabesCatalog.Id, "156", "SABADELL", "Banco Sabadell", sortOrder: 44),
            CatalogEntry.Create(clabesCatalog.Id, "158", "MIZUHO", "Mizuho Bank", sortOrder: 45),
            CatalogEntry.Create(clabesCatalog.Id, "159", "SHINHAN", "Shinhan Bank", sortOrder: 46),
            CatalogEntry.Create(clabesCatalog.Id, "160", "KEBA", "Keb Hana Bank", sortOrder: 47),
            CatalogEntry.Create(clabesCatalog.Id, "166", "BANCOMEXT", "Banco Nacional de Comercio Exterior", sortOrder: 48),
            CatalogEntry.Create(clabesCatalog.Id, "168", "HIPOTECARIA FED", "Sociedad Hipotecaria Federal", sortOrder: 49),
            CatalogEntry.Create(clabesCatalog.Id, "600", "BANSEFI", "Banco del Bienestar", sortOrder: 50),
            CatalogEntry.Create(clabesCatalog.Id, "602", "ARCUS", "Arcus (FinTech)", sortOrder: 51),
            CatalogEntry.Create(clabesCatalog.Id, "604", "SWNBANK", "SwnBank (FinTech)", sortOrder: 52),
            CatalogEntry.Create(clabesCatalog.Id, "610", "STP", "Sistema de Transferencias y Pagos", sortOrder: 53),
            CatalogEntry.Create(clabesCatalog.Id, "614", "ACCENDO BANCO", "Accendo Banco", sortOrder: 54),
            CatalogEntry.Create(clabesCatalog.Id, "616", "TRANSFERENCIAS INTERNALES", "Transferencias Internales", sortOrder: 55),
            CatalogEntry.Create(clabesCatalog.Id, "618", "MASARI", "Casa de Bolsa Masari", sortOrder: 56),
            CatalogEntry.Create(clabesCatalog.Id, "620", "CB INTERCAM", "Intercam Casa de Bolsa", sortOrder: 57),
            CatalogEntry.Create(clabesCatalog.Id, "630", "NVIO", "NVIO Pagos", sortOrder: 58),
            CatalogEntry.Create(clabesCatalog.Id, "631", "ASP INTEGRA OPC", "ASP Integra OPC", sortOrder: 59),
            CatalogEntry.Create(clabesCatalog.Id, "634", "KUSPIT", "Kuspit Casa de Bolsa", sortOrder: 60),
            CatalogEntry.Create(clabesCatalog.Id, "638", "NU MEXICO", "Nu México (Nubank)", sortOrder: 61),
            CatalogEntry.Create(clabesCatalog.Id, "646", "MONEXCB", "Monex Casa de Bolsa", sortOrder: 62),
            CatalogEntry.Create(clabesCatalog.Id, "648", "EVERCORE", "Evercore Casa de Bolsa", sortOrder: 63),
            CatalogEntry.Create(clabesCatalog.Id, "649", "SKANDIA", "Skandia", sortOrder: 64),
            CatalogEntry.Create(clabesCatalog.Id, "651", "CB GBM", "GBM Grupo Bursátil Mexicano", sortOrder: 65),
            CatalogEntry.Create(clabesCatalog.Id, "653", "CI BANCO", "Banco CI", sortOrder: 66),
            CatalogEntry.Create(clabesCatalog.Id, "656", "UNIPROCES", "Uniprocesos", sortOrder: 67),
            CatalogEntry.Create(clabesCatalog.Id, "670", "LIBERTAD", "Servicios Libertad", sortOrder: 68),
            CatalogEntry.Create(clabesCatalog.Id, "677", "CAJA POP MEXIC", "Caja Popular Mexicana", sortOrder: 69),
            CatalogEntry.Create(clabesCatalog.Id, "680", "CREDICAP", "Credicapital", sortOrder: 70),
            CatalogEntry.Create(clabesCatalog.Id, "683", "CAJA TELEFONIST", "Caja de Ahorro Telefonistas", sortOrder: 71),
            CatalogEntry.Create(clabesCatalog.Id, "684", "TB FINANCIERO", "Transfer Bancario Financiero", sortOrder: 72),
            CatalogEntry.Create(clabesCatalog.Id, "685", "FONDO", "Fondo (FIRA)", sortOrder: 73),
            CatalogEntry.Create(clabesCatalog.Id, "689", "FOMPED", "Financiera para el Desarrollo", sortOrder: 74),
            CatalogEntry.Create(clabesCatalog.Id, "699", "BANCO BIENESTAR", "Banco del Bienestar", sortOrder: 75),
            CatalogEntry.Create(clabesCatalog.Id, "901", "CLS", "CLS Bank", sortOrder: 76),
            CatalogEntry.Create(clabesCatalog.Id, "902", "INDEVAL", "S.D. Indeval", sortOrder: 77),
            CatalogEntry.Create(clabesCatalog.Id, "903", "MEXDER", "MexDer", sortOrder: 78),
            CatalogEntry.Create(clabesCatalog.Id, "904", "ASIGNA", "Asigna", sortOrder: 79)
        };
        await context.CatalogEntries.AddRangeAsync(clabesBancos, cancellationToken);

        // =============================================================================
        // 13. CATÁLOGO DE DÍAS INHÁBILES BANCARIOS (2025)
        // Fuente: BANXICO - Circular 3/2012
        // =============================================================================
        var diasInhabilesCatalog = Catalog.Create("DIAS_INHABILES_2025", "Días Inhábiles Bancarios 2025",
            "Días no laborables para operaciones bancarias y financieras en México", "2025.1", "BANXICO");
        await context.Catalogs.AddAsync(diasInhabilesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var diasInhabiles2025 = new[]
        {
            // Enero 2025
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-01-01", "Año Nuevo", "Día de Año Nuevo", sortOrder: 1),
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-01-06", "Reyes Magos", "Día de Reyes (No bancario, escuelas)", sortOrder: 2),
            // Febrero 2025
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-02-03", "Constitución", "Día de la Constitución (primer lunes de febrero)", sortOrder: 3),
            // Marzo 2025
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-03-17", "Natalicio Benito Juárez", "Natalicio de Benito Juárez (tercer lunes de marzo)", sortOrder: 4),
            // Abril 2025 (Semana Santa variable)
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-04-17", "Jueves Santo", "Jueves Santo - Semana Santa", sortOrder: 5),
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-04-18", "Viernes Santo", "Viernes Santo - Semana Santa", sortOrder: 6),
            // Mayo 2025
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-05-01", "Día del Trabajo", "Día del Trabajo", sortOrder: 7),
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-05-05", "Batalla de Puebla", "Batalla de Puebla", sortOrder: 8),
            // Septiembre 2025
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-09-16", "Independencia", "Día de la Independencia", sortOrder: 9),
            // Noviembre 2025
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-11-17", "Revolución", "Día de la Revolución (tercer lunes de noviembre)", sortOrder: 10),
            // Diciembre 2025
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-12-12", "Virgen de Guadalupe", "Día de la Virgen de Guadalupe (algunos estados)", sortOrder: 11),
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2025-12-25", "Navidad", "Navidad", sortOrder: 12),
            // Cada 6 años - Transmisión del Poder Ejecutivo Federal (2024)
            CatalogEntry.Create(diasInhabilesCatalog.Id, "2024-10-01", "Transmisión Poder Ejecutivo", "Transmisión del Poder Ejecutivo Federal (cada 6 años)", sortOrder: 13)
        };
        await context.CatalogEntries.AddRangeAsync(diasInhabiles2025, cancellationToken);

        // =============================================================================
        // 14. CATÁLOGO DE ÍNDICES FINANCIEROS DE REFERENCIA
        // Fuente: BANXICO SIE - Series financieras oficiales
        // =============================================================================
        var indicesRefCatalog = Catalog.Create("INDICES_FINANCIEROS_REF", "Índices Financieros de Referencia",
            "Series financieras oficiales de BANXICO para valuación y cálculos", "2025.1", "BANXICO");
        await context.Catalogs.AddAsync(indicesRefCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var indicesRef = new[]
        {
            // Tipo de Cambio
            CatalogEntry.Create(indicesRefCatalog.Id, "SF43718", "TC FIX USD/MXN", "Tipo de cambio pesos por dólar E.U.A. (FIX)", sortOrder: 1),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60653", "TC Liquidación", "Tipo de cambio pesos por dólar E.U.A. (fecha liquidación)", sortOrder: 2),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF46410", "TC EUR/MXN", "Tipo de cambio Euro", sortOrder: 3),
            // TIIE
            CatalogEntry.Create(indicesRefCatalog.Id, "SF61745", "TIIE Fondeo 1D", "TIIE de Fondeo a 1 día (obligatorio 2025)", sortOrder: 4),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60648", "TIIE 28 días", "TIIE a 28 días (deprecated nuevos contratos)", sortOrder: 5),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60649", "TIIE 91 días", "TIIE a 91 días", sortOrder: 6),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60650", "TIIE 182 días", "TIIE a 182 días", sortOrder: 7),
            // UDI e Inflación
            CatalogEntry.Create(indicesRefCatalog.Id, "SP68257", "UDI", "Valor de la Unidad de Inversión (UDI)", sortOrder: 8),
            CatalogEntry.Create(indicesRefCatalog.Id, "SP1", "INPC General", "Índice Nacional de Precios al Consumidor", sortOrder: 9),
            CatalogEntry.Create(indicesRefCatalog.Id, "SP56335", "INPC Subyacente", "INPC Subyacente", sortOrder: 10),
            // CETES
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60633", "CETES 28 días", "Tasa de CETES a 28 días", sortOrder: 11),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60634", "CETES 91 días", "Tasa de CETES a 91 días", sortOrder: 12),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60635", "CETES 182 días", "Tasa de CETES a 182 días", sortOrder: 13),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60636", "CETES 364 días", "Tasa de CETES a 364 días", sortOrder: 14),
            // Otros
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60656", "CPP", "Costo Porcentual Promedio", sortOrder: 15),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF60657", "CCP", "Costo de Captación a Plazo", sortOrder: 16),
            CatalogEntry.Create(indicesRefCatalog.Id, "SF43707", "Reservas Internacionales", "Reservas Internacionales del Banco de México", sortOrder: 17)
        };
        await context.CatalogEntries.AddRangeAsync(indicesRef, cancellationToken);

        // =============================================================================
        // 15. CATÁLOGO DE SIEFORES GENERACIONALES CON CLAVES COMPLETAS
        // Fuente: CONSAR - Circular Única
        // =============================================================================
        var sieforesClavesCatalog = Catalog.Create("SIEFORES_CLAVES", "SIEFOREs Claves por AFORE",
            "Claves completas de SIEFOREs Generacionales por AFORE", "2025.1", "CONSAR");
        await context.Catalogs.AddAsync(sieforesClavesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        // Claves de SIEFOREs generacionales por AFORE
        var sieforesClaves = new[]
        {
            // XXI Banorte (530)
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53001", "XXI Básica Inicial", "SIEFORE Básica Inicial XXI Banorte", sortOrder: 1),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53060", "XXI SB 60-64", "SIEFORE Básica 60-64 XXI Banorte", sortOrder: 2),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53065", "XXI SB 65-69", "SIEFORE Básica 65-69 XXI Banorte", sortOrder: 3),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53070", "XXI SB 70-74", "SIEFORE Básica 70-74 XXI Banorte", sortOrder: 4),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53075", "XXI SB 75-79", "SIEFORE Básica 75-79 XXI Banorte", sortOrder: 5),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53080", "XXI SB 80-84", "SIEFORE Básica 80-84 XXI Banorte", sortOrder: 6),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53085", "XXI SB 85-89", "SIEFORE Básica 85-89 XXI Banorte", sortOrder: 7),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53090", "XXI SB 90-94", "SIEFORE Básica 90-94 XXI Banorte", sortOrder: 8),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53095", "XXI SB 95-99", "SIEFORE Básica 95-99 XXI Banorte", sortOrder: 9),
            // Profuturo (527)
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52701", "Profuturo Básica Inicial", "SIEFORE Básica Inicial Profuturo", sortOrder: 10),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52760", "Profuturo SB 60-64", "SIEFORE Básica 60-64 Profuturo", sortOrder: 11),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52765", "Profuturo SB 65-69", "SIEFORE Básica 65-69 Profuturo", sortOrder: 12),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52770", "Profuturo SB 70-74", "SIEFORE Básica 70-74 Profuturo", sortOrder: 13),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52775", "Profuturo SB 75-79", "SIEFORE Básica 75-79 Profuturo", sortOrder: 14),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52780", "Profuturo SB 80-84", "SIEFORE Básica 80-84 Profuturo", sortOrder: 15),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52785", "Profuturo SB 85-89", "SIEFORE Básica 85-89 Profuturo", sortOrder: 16),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52790", "Profuturo SB 90-94", "SIEFORE Básica 90-94 Profuturo", sortOrder: 17),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "52795", "Profuturo SB 95-99", "SIEFORE Básica 95-99 Profuturo", sortOrder: 18),
            // Citibanamex (538)
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53801", "Citibanamex Básica Inicial", "SIEFORE Básica Inicial Citibanamex", sortOrder: 19),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "53860", "Citibanamex SB 60-64", "SIEFORE Básica 60-64 Citibanamex", sortOrder: 20),
            // SURA (570)
            CatalogEntry.Create(sieforesClavesCatalog.Id, "57001", "SURA Básica Inicial", "SIEFORE Básica Inicial SURA", sortOrder: 21),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "57060", "SURA SB 60-64", "SIEFORE Básica 60-64 SURA", sortOrder: 22),
            // Coppel (568)
            CatalogEntry.Create(sieforesClavesCatalog.Id, "56801", "Coppel Básica Inicial", "SIEFORE Básica Inicial Coppel", sortOrder: 23),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "56860", "Coppel SB 60-64", "SIEFORE Básica 60-64 Coppel", sortOrder: 24),
            // PensionISSSTE (519)
            CatalogEntry.Create(sieforesClavesCatalog.Id, "51901", "PensionISSSTE Básica Inicial", "SIEFORE Básica Inicial PensionISSSTE", sortOrder: 25),
            CatalogEntry.Create(sieforesClavesCatalog.Id, "51960", "PensionISSSTE SB 60-64", "SIEFORE Básica 60-64 PensionISSSTE", sortOrder: 26)
        };
        await context.CatalogEntries.AddRangeAsync(sieforesClaves, cancellationToken);

        // =============================================================================
        // 16. CATÁLOGO DE ENTIDADES FEDERATIVAS (INEGI/RENAPO)
        // Fuente: INEGI - Marco Geoestadístico Nacional
        // =============================================================================
        var entidadesCatalog = Catalog.Create("ENTIDADES_FEDERATIVAS", "Entidades Federativas de México",
            "Catálogo de entidades federativas con código INEGI de 2 dígitos (usado en CURP)", "2025.1", "INEGI/RENAPO");
        await context.Catalogs.AddAsync(entidadesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var entidades = new[]
        {
            CatalogEntry.Create(entidadesCatalog.Id, "AS", "Aguascalientes", "01 - Aguascalientes", sortOrder: 1),
            CatalogEntry.Create(entidadesCatalog.Id, "BC", "Baja California", "02 - Baja California", sortOrder: 2),
            CatalogEntry.Create(entidadesCatalog.Id, "BS", "Baja California Sur", "03 - Baja California Sur", sortOrder: 3),
            CatalogEntry.Create(entidadesCatalog.Id, "CC", "Campeche", "04 - Campeche", sortOrder: 4),
            CatalogEntry.Create(entidadesCatalog.Id, "CL", "Coahuila", "05 - Coahuila de Zaragoza", sortOrder: 5),
            CatalogEntry.Create(entidadesCatalog.Id, "CM", "Colima", "06 - Colima", sortOrder: 6),
            CatalogEntry.Create(entidadesCatalog.Id, "CS", "Chiapas", "07 - Chiapas", sortOrder: 7),
            CatalogEntry.Create(entidadesCatalog.Id, "CH", "Chihuahua", "08 - Chihuahua", sortOrder: 8),
            CatalogEntry.Create(entidadesCatalog.Id, "DF", "Ciudad de México", "09 - Ciudad de México (CDMX)", sortOrder: 9),
            CatalogEntry.Create(entidadesCatalog.Id, "DG", "Durango", "10 - Durango", sortOrder: 10),
            CatalogEntry.Create(entidadesCatalog.Id, "GT", "Guanajuato", "11 - Guanajuato", sortOrder: 11),
            CatalogEntry.Create(entidadesCatalog.Id, "GR", "Guerrero", "12 - Guerrero", sortOrder: 12),
            CatalogEntry.Create(entidadesCatalog.Id, "HG", "Hidalgo", "13 - Hidalgo", sortOrder: 13),
            CatalogEntry.Create(entidadesCatalog.Id, "JC", "Jalisco", "14 - Jalisco", sortOrder: 14),
            CatalogEntry.Create(entidadesCatalog.Id, "MC", "Estado de México", "15 - Estado de México", sortOrder: 15),
            CatalogEntry.Create(entidadesCatalog.Id, "MN", "Michoacán", "16 - Michoacán de Ocampo", sortOrder: 16),
            CatalogEntry.Create(entidadesCatalog.Id, "MS", "Morelos", "17 - Morelos", sortOrder: 17),
            CatalogEntry.Create(entidadesCatalog.Id, "NT", "Nayarit", "18 - Nayarit", sortOrder: 18),
            CatalogEntry.Create(entidadesCatalog.Id, "NL", "Nuevo León", "19 - Nuevo León", sortOrder: 19),
            CatalogEntry.Create(entidadesCatalog.Id, "OC", "Oaxaca", "20 - Oaxaca", sortOrder: 20),
            CatalogEntry.Create(entidadesCatalog.Id, "PL", "Puebla", "21 - Puebla", sortOrder: 21),
            CatalogEntry.Create(entidadesCatalog.Id, "QT", "Querétaro", "22 - Querétaro", sortOrder: 22),
            CatalogEntry.Create(entidadesCatalog.Id, "QR", "Quintana Roo", "23 - Quintana Roo", sortOrder: 23),
            CatalogEntry.Create(entidadesCatalog.Id, "SP", "San Luis Potosí", "24 - San Luis Potosí", sortOrder: 24),
            CatalogEntry.Create(entidadesCatalog.Id, "SL", "Sinaloa", "25 - Sinaloa", sortOrder: 25),
            CatalogEntry.Create(entidadesCatalog.Id, "SR", "Sonora", "26 - Sonora", sortOrder: 26),
            CatalogEntry.Create(entidadesCatalog.Id, "TC", "Tabasco", "27 - Tabasco", sortOrder: 27),
            CatalogEntry.Create(entidadesCatalog.Id, "TS", "Tamaulipas", "28 - Tamaulipas", sortOrder: 28),
            CatalogEntry.Create(entidadesCatalog.Id, "TL", "Tlaxcala", "29 - Tlaxcala", sortOrder: 29),
            CatalogEntry.Create(entidadesCatalog.Id, "VZ", "Veracruz", "30 - Veracruz de Ignacio de la Llave", sortOrder: 30),
            CatalogEntry.Create(entidadesCatalog.Id, "YN", "Yucatán", "31 - Yucatán", sortOrder: 31),
            CatalogEntry.Create(entidadesCatalog.Id, "ZS", "Zacatecas", "32 - Zacatecas", sortOrder: 32),
            CatalogEntry.Create(entidadesCatalog.Id, "NE", "Nacido en el Extranjero", "00 - Nacido en el extranjero", sortOrder: 33)
        };
        await context.CatalogEntries.AddRangeAsync(entidades, cancellationToken);

        // =============================================================================
        // 17. CATÁLOGO DE SALARIOS Y LÍMITES 2025
        // Fuente: CONASAMI, IMSS, CONSAR
        // =============================================================================
        var salariosCatalog = Catalog.Create("SALARIOS_LIMITES_2025", "Salarios y Límites 2025",
            "Salario mínimo, UMA y topes para aportaciones SAR 2025", "2025.1", "CONASAMI/IMSS");
        await context.Catalogs.AddAsync(salariosCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var salariosLimites = new[]
        {
            // Salario Mínimo General 2025
            CatalogEntry.Create(salariosCatalog.Id, "SMG_2025_DIARIO", "278.80", "Salario Mínimo General 2025 diario", sortOrder: 1),
            CatalogEntry.Create(salariosCatalog.Id, "SMG_2025_MENSUAL", "8480.65", "Salario Mínimo General 2025 mensual (30.4 días)", sortOrder: 2),
            // Salario Mínimo Zona Libre Frontera Norte 2025
            CatalogEntry.Create(salariosCatalog.Id, "SMZLFN_2025_DIARIO", "419.88", "Salario Mínimo ZLFN 2025 diario", sortOrder: 3),
            CatalogEntry.Create(salariosCatalog.Id, "SMZLFN_2025_MENSUAL", "12764.35", "Salario Mínimo ZLFN 2025 mensual", sortOrder: 4),
            // UMA 2025
            CatalogEntry.Create(salariosCatalog.Id, "UMA_2025_DIARIO", "113.14", "Unidad de Medida y Actualización 2025 diaria", sortOrder: 5),
            CatalogEntry.Create(salariosCatalog.Id, "UMA_2025_MENSUAL", "3440.65", "UMA 2025 mensual (30.4 días)", sortOrder: 6),
            CatalogEntry.Create(salariosCatalog.Id, "UMA_2025_ANUAL", "41298.69", "UMA 2025 anual", sortOrder: 7),
            // Topes SBC para aportaciones IMSS/SAR
            CatalogEntry.Create(salariosCatalog.Id, "TOPE_SBC_25_UMA", "2828.50", "Tope SBC diario 25 UMAs (límite SAR)", sortOrder: 8),
            CatalogEntry.Create(salariosCatalog.Id, "TOPE_SBC_MENSUAL", "86027.10", "Tope SBC mensual 25 UMAs", sortOrder: 9),
            // Aportaciones SAR
            CatalogEntry.Create(salariosCatalog.Id, "CUOTA_RCV_PATRON_2025", "11.875%", "Cuota patronal RCV 2025 (reforma gradual)", sortOrder: 10),
            CatalogEntry.Create(salariosCatalog.Id, "CUOTA_RCV_TRABAJADOR", "1.125%", "Cuota trabajador RCV (fija)", sortOrder: 11),
            CatalogEntry.Create(salariosCatalog.Id, "CUOTA_VIVIENDA", "5%", "Cuota patronal INFONAVIT", sortOrder: 12),
            CatalogEntry.Create(salariosCatalog.Id, "CUOTA_SOCIAL_GOBIERNO", "Variable", "Cuota social del Gobierno Federal (según SBC)", sortOrder: 13),
            // Límites IPAB
            CatalogEntry.Create(salariosCatalog.Id, "LIMITE_IPAB_UDIS", "400000", "Límite de protección IPAB en UDIs", sortOrder: 14)
        };
        await context.CatalogEntries.AddRangeAsync(salariosLimites, cancellationToken);

        // =============================================================================
        // 18. CATÁLOGO DE DIVISAS - ISO 4217 (Para Derivados y Cartera Internacional)
        // Fuente: ISO 4217 / BANXICO
        // =============================================================================
        var divisasCatalog = Catalog.Create("DIVISAS", "Catálogo de Divisas ISO 4217",
            "Divisas autorizadas para operaciones SIEFORE", "2025.1", "ISO 4217/BANXICO");
        await context.Catalogs.AddAsync(divisasCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var divisas = new[]
        {
            CatalogEntry.Create(divisasCatalog.Id, "MXN", "Peso Mexicano", "484 - Mexico", sortOrder: 1),
            CatalogEntry.Create(divisasCatalog.Id, "USD", "Dólar Estadounidense", "840 - United States", sortOrder: 2),
            CatalogEntry.Create(divisasCatalog.Id, "EUR", "Euro", "978 - European Union", sortOrder: 3),
            CatalogEntry.Create(divisasCatalog.Id, "GBP", "Libra Esterlina", "826 - United Kingdom", sortOrder: 4),
            CatalogEntry.Create(divisasCatalog.Id, "JPY", "Yen Japonés", "392 - Japan", sortOrder: 5),
            CatalogEntry.Create(divisasCatalog.Id, "CHF", "Franco Suizo", "756 - Switzerland", sortOrder: 6),
            CatalogEntry.Create(divisasCatalog.Id, "CAD", "Dólar Canadiense", "124 - Canada", sortOrder: 7),
            CatalogEntry.Create(divisasCatalog.Id, "AUD", "Dólar Australiano", "036 - Australia", sortOrder: 8),
            CatalogEntry.Create(divisasCatalog.Id, "CNY", "Yuan Chino", "156 - China", sortOrder: 9),
            CatalogEntry.Create(divisasCatalog.Id, "HKD", "Dólar Hong Kong", "344 - Hong Kong", sortOrder: 10),
            CatalogEntry.Create(divisasCatalog.Id, "SGD", "Dólar Singapur", "702 - Singapore", sortOrder: 11),
            CatalogEntry.Create(divisasCatalog.Id, "BRL", "Real Brasileño", "986 - Brazil", sortOrder: 12),
            CatalogEntry.Create(divisasCatalog.Id, "KRW", "Won Surcoreano", "410 - South Korea", sortOrder: 13),
            CatalogEntry.Create(divisasCatalog.Id, "INR", "Rupia India", "356 - India", sortOrder: 14),
            CatalogEntry.Create(divisasCatalog.Id, "SEK", "Corona Sueca", "752 - Sweden", sortOrder: 15),
            CatalogEntry.Create(divisasCatalog.Id, "NOK", "Corona Noruega", "578 - Norway", sortOrder: 16),
            CatalogEntry.Create(divisasCatalog.Id, "DKK", "Corona Danesa", "208 - Denmark", sortOrder: 17),
            CatalogEntry.Create(divisasCatalog.Id, "NZD", "Dólar Neozelandés", "554 - New Zealand", sortOrder: 18),
            CatalogEntry.Create(divisasCatalog.Id, "ZAR", "Rand Sudafricano", "710 - South Africa", sortOrder: 19),
            CatalogEntry.Create(divisasCatalog.Id, "UDI", "Unidades de Inversión", "Indexado MXN - BANXICO", sortOrder: 20)
        };
        await context.CatalogEntries.AddRangeAsync(divisas, cancellationToken);

        // =============================================================================
        // 19. CATÁLOGO DE BOLSAS DE VALORES - MIC ISO 10383
        // Fuente: ISO 10383 / CONSAR Circular 19-8
        // =============================================================================
        var bolsasCatalog = Catalog.Create("BOLSAS_VALORES", "Catálogo de Bolsas de Valores",
            "Mercados reconocidos para inversión SIEFORE", "2025.1", "ISO 10383/CONSAR");
        await context.Catalogs.AddAsync(bolsasCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var bolsas = new[]
        {
            // México
            CatalogEntry.Create(bolsasCatalog.Id, "XMEX", "Bolsa Mexicana de Valores", "BMV - México", sortOrder: 1),
            CatalogEntry.Create(bolsasCatalog.Id, "BIVA", "BIVA", "Bolsa Institucional de Valores - México", sortOrder: 2),
            // Estados Unidos
            CatalogEntry.Create(bolsasCatalog.Id, "XNYS", "New York Stock Exchange", "NYSE - USA", sortOrder: 3),
            CatalogEntry.Create(bolsasCatalog.Id, "XNAS", "NASDAQ", "NASDAQ - USA", sortOrder: 4),
            CatalogEntry.Create(bolsasCatalog.Id, "XASE", "NYSE American", "AMEX - USA", sortOrder: 5),
            CatalogEntry.Create(bolsasCatalog.Id, "ARCX", "NYSE Arca", "NYSE Arca - USA (ETFs)", sortOrder: 6),
            CatalogEntry.Create(bolsasCatalog.Id, "BATS", "CBOE BZX Exchange", "BATS - USA", sortOrder: 7),
            // Europa
            CatalogEntry.Create(bolsasCatalog.Id, "XLON", "London Stock Exchange", "LSE - UK", sortOrder: 8),
            CatalogEntry.Create(bolsasCatalog.Id, "XETR", "Deutsche Börse", "Xetra - Germany", sortOrder: 9),
            CatalogEntry.Create(bolsasCatalog.Id, "XPAR", "Euronext Paris", "Euronext - France", sortOrder: 10),
            CatalogEntry.Create(bolsasCatalog.Id, "XAMS", "Euronext Amsterdam", "Euronext - Netherlands", sortOrder: 11),
            CatalogEntry.Create(bolsasCatalog.Id, "XSWX", "SIX Swiss Exchange", "SIX - Switzerland", sortOrder: 12),
            CatalogEntry.Create(bolsasCatalog.Id, "XMAD", "Bolsa de Madrid", "BME - Spain", sortOrder: 13),
            CatalogEntry.Create(bolsasCatalog.Id, "XMIL", "Borsa Italiana", "MI - Italy", sortOrder: 14),
            // Asia
            CatalogEntry.Create(bolsasCatalog.Id, "XTKS", "Tokyo Stock Exchange", "TSE - Japan", sortOrder: 15),
            CatalogEntry.Create(bolsasCatalog.Id, "XHKG", "Hong Kong Stock Exchange", "HKEX - Hong Kong", sortOrder: 16),
            CatalogEntry.Create(bolsasCatalog.Id, "XSHG", "Shanghai Stock Exchange", "SSE - China", sortOrder: 17),
            CatalogEntry.Create(bolsasCatalog.Id, "XSHE", "Shenzhen Stock Exchange", "SZSE - China", sortOrder: 18),
            CatalogEntry.Create(bolsasCatalog.Id, "XKRX", "Korea Exchange", "KRX - South Korea", sortOrder: 19),
            CatalogEntry.Create(bolsasCatalog.Id, "XSES", "Singapore Exchange", "SGX - Singapore", sortOrder: 20),
            CatalogEntry.Create(bolsasCatalog.Id, "XASX", "Australian Securities Exchange", "ASX - Australia", sortOrder: 21),
            // Canadá
            CatalogEntry.Create(bolsasCatalog.Id, "XTSE", "Toronto Stock Exchange", "TSX - Canada", sortOrder: 22),
            // Brasil
            CatalogEntry.Create(bolsasCatalog.Id, "BVMF", "B3 - Brasil Bolsa Balcão", "B3 - Brazil", sortOrder: 23),
            // India
            CatalogEntry.Create(bolsasCatalog.Id, "XBOM", "BSE Limited", "BSE - India", sortOrder: 24),
            CatalogEntry.Create(bolsasCatalog.Id, "XNSE", "National Stock Exchange of India", "NSE - India", sortOrder: 25)
        };
        await context.CatalogEntries.AddRangeAsync(bolsas, cancellationToken);

        // =============================================================================
        // 20. CATÁLOGO DE TIPOS DE INSTRUMENTO SIEFORE
        // Fuente: CONSAR Circular 19-8, Sección 5
        // =============================================================================
        var instrumentosCatalog = Catalog.Create("TIPOS_INSTRUMENTO", "Tipos de Instrumento SIEFORE",
            "Clasificación de instrumentos para cartera SIEFORE", "2025.1", "CONSAR Circular 19-8");
        await context.Catalogs.AddAsync(instrumentosCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var instrumentos = new[]
        {
            // Deuda Gubernamental
            CatalogEntry.Create(instrumentosCatalog.Id, "CETES", "Certificados de la Tesorería", "Deuda Gubernamental - Corto plazo", sortOrder: 1),
            CatalogEntry.Create(instrumentosCatalog.Id, "BONDES", "Bonos de Desarrollo", "Deuda Gubernamental - Tasa variable", sortOrder: 2),
            CatalogEntry.Create(instrumentosCatalog.Id, "MBONOS", "Bonos M", "Deuda Gubernamental - Tasa fija largo plazo", sortOrder: 3),
            CatalogEntry.Create(instrumentosCatalog.Id, "UDIBONOS", "Bonos indexados a inflación", "Deuda Gubernamental - Indexado UDI", sortOrder: 4),
            CatalogEntry.Create(instrumentosCatalog.Id, "BPA", "Bonos de Protección al Ahorro", "IPAB - Tasa variable", sortOrder: 5),
            CatalogEntry.Create(instrumentosCatalog.Id, "BPAT", "BPA Trimestrales", "IPAB - Tasa variable trimestral", sortOrder: 6),
            CatalogEntry.Create(instrumentosCatalog.Id, "BPAG28", "BPA 28 días", "IPAB - Referencia TIIE 28", sortOrder: 7),
            CatalogEntry.Create(instrumentosCatalog.Id, "BPAG91", "BPA 91 días", "IPAB - Referencia TIIE 91", sortOrder: 8),
            // Deuda Privada
            CatalogEntry.Create(instrumentosCatalog.Id, "CEBURS", "Certificados Bursátiles", "Deuda Privada - Corporativos", sortOrder: 9),
            CatalogEntry.Create(instrumentosCatalog.Id, "CPO", "Certificados de Participación Ordinaria", "Deuda Privada - Fideicomiso", sortOrder: 10),
            CatalogEntry.Create(instrumentosCatalog.Id, "PRLV", "Pagaré con Rendimiento Liquidable", "Deuda Privada - Bancario", sortOrder: 11),
            CatalogEntry.Create(instrumentosCatalog.Id, "BONOS_CORP", "Bonos Corporativos", "Deuda Privada - Largo plazo", sortOrder: 12),
            // Renta Variable Nacional
            CatalogEntry.Create(instrumentosCatalog.Id, "ACCIONES_MX", "Acciones Nacionales", "Renta Variable - BMV/BIVA", sortOrder: 13),
            CatalogEntry.Create(instrumentosCatalog.Id, "FIBRAS", "Fideicomisos de Infraestructura", "REIT Mexicano", sortOrder: 14),
            CatalogEntry.Create(instrumentosCatalog.Id, "CKD", "Certificados de Capital de Desarrollo", "Capital Privado", sortOrder: 15),
            CatalogEntry.Create(instrumentosCatalog.Id, "CERPI", "Certificados de Proyectos de Inversión", "Infraestructura", sortOrder: 16),
            // Renta Variable Internacional
            CatalogEntry.Create(instrumentosCatalog.Id, "ACCIONES_INT", "Acciones Internacionales", "Renta Variable - Extranjero", sortOrder: 17),
            CatalogEntry.Create(instrumentosCatalog.Id, "ETF_INT", "ETFs Internacionales", "Fondos cotizados extranjeros", sortOrder: 18),
            CatalogEntry.Create(instrumentosCatalog.Id, "ADR", "American Depositary Receipts", "Recibos de depósito USA", sortOrder: 19),
            // Estructurados
            CatalogEntry.Create(instrumentosCatalog.Id, "NOTAS_ESTRUCT", "Notas Estructuradas", "Productos estructurados", sortOrder: 20),
            // Mercado de Dinero
            CatalogEntry.Create(instrumentosCatalog.Id, "REPORTO", "Reporto", "Operación de reporto", sortOrder: 21),
            CatalogEntry.Create(instrumentosCatalog.Id, "PREST_VAL", "Préstamo de Valores", "Securities lending", sortOrder: 22),
            // Derivados
            CatalogEntry.Create(instrumentosCatalog.Id, "FORWARD", "Forward", "Derivado OTC - Tipo de cambio", sortOrder: 23),
            CatalogEntry.Create(instrumentosCatalog.Id, "FUTURO", "Futuro", "Derivado Listado - MexDer/CME", sortOrder: 24),
            CatalogEntry.Create(instrumentosCatalog.Id, "SWAP_TIIE", "Swap de Tasa", "IRS referenciado a TIIE", sortOrder: 25),
            CatalogEntry.Create(instrumentosCatalog.Id, "SWAP_DIVISAS", "Swap de Divisas", "Cross-currency swap", sortOrder: 26),
            CatalogEntry.Create(instrumentosCatalog.Id, "OPCION", "Opción", "Derivado con prima", sortOrder: 27),
            // Mercancías
            CatalogEntry.Create(instrumentosCatalog.Id, "COMMODITY", "Mercancías", "Exposición a commodities vía ETF", sortOrder: 28)
        };
        await context.CatalogEntries.AddRangeAsync(instrumentos, cancellationToken);

        // =============================================================================
        // 21. CATÁLOGO DE TIPOS DE DERIVADO
        // Fuente: CONSAR Circular 19-8, Archivo .0314
        // =============================================================================
        var tiposDerivadoCatalog = Catalog.Create("TIPOS_DERIVADO", "Tipos de Derivado SIEFORE",
            "Clasificación de derivados para archivo .0314", "2025.1", "CONSAR Circular 19-8");
        await context.Catalogs.AddAsync(tiposDerivadoCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var tiposDerivado = new[]
        {
            CatalogEntry.Create(tiposDerivadoCatalog.Id, "3010", "Forward", "Forward de tipo de cambio", sortOrder: 1),
            CatalogEntry.Create(tiposDerivadoCatalog.Id, "3020", "Futuro", "Futuro listado (MexDer, CME, etc.)", sortOrder: 2),
            CatalogEntry.Create(tiposDerivadoCatalog.Id, "3030", "Swap", "Swap de tasa o divisa", sortOrder: 3),
            CatalogEntry.Create(tiposDerivadoCatalog.Id, "3040", "Opción", "Opción call/put", sortOrder: 4),
            CatalogEntry.Create(tiposDerivadoCatalog.Id, "3050", "Warrant", "Warrant sobre acciones", sortOrder: 5),
            CatalogEntry.Create(tiposDerivadoCatalog.Id, "3060", "CDS", "Credit Default Swap", sortOrder: 6),
            CatalogEntry.Create(tiposDerivadoCatalog.Id, "3070", "TRS", "Total Return Swap", sortOrder: 7)
        };
        await context.CatalogEntries.AddRangeAsync(tiposDerivado, cancellationToken);

        // =============================================================================
        // 22. CATÁLOGO DE LÍMITES DE INVERSIÓN SIEFORE 2025
        // Fuente: CONSAR Disposiciones de Carácter General (Régimen de Inversión)
        // =============================================================================
        var limitesCatalog = Catalog.Create("LIMITES_INVERSION_2025", "Límites de Inversión SIEFORE 2025",
            "Límites regulatorios para inversión de recursos SAR", "2025.1", "CONSAR Régimen de Inversión");
        await context.Catalogs.AddAsync(limitesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var limitesInversion = new[]
        {
            // Límites por tipo de instrumento
            CatalogEntry.Create(limitesCatalog.Id, "LIM_DEUDA_GOB", "100%", "Límite deuda gubernamental mexicana", sortOrder: 1),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_DEUDA_PRIV", "50%", "Límite deuda privada nacional", sortOrder: 2),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_RV_NAC", "45%", "Límite renta variable nacional (SB Inicial)", sortOrder: 3),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_RV_INT", "20%", "Límite renta variable internacional", sortOrder: 4),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_ESTRUCT", "20%", "Límite instrumentos estructurados", sortOrder: 5),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_FIBRAS", "10%", "Límite FIBRAs y FIBRA-E", sortOrder: 6),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_CKD_CERPI", "20%", "Límite CKDs y CERPIs", sortOrder: 7),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_MERCANCIAS", "10%", "Límite exposición a mercancías", sortOrder: 8),
            // Límites de concentración
            CatalogEntry.Create(limitesCatalog.Id, "LIM_EMISORA", "5%", "Límite por emisora individual", sortOrder: 9),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_GRUPO_EMP", "15%", "Límite por grupo empresarial", sortOrder: 10),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_SECTOR", "25%", "Límite por sector económico", sortOrder: 11),
            // Límites internacionales
            CatalogEntry.Create(limitesCatalog.Id, "LIM_INT_TOTAL", "20%", "Límite total inversión internacional", sortOrder: 12),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_INT_PAIS", "5%", "Límite por país individual", sortOrder: 13),
            CatalogEntry.Create(limitesCatalog.Id, "LIM_DIVISA", "30%", "Límite exposición cambiaria", sortOrder: 14),
            // VaR y riesgo
            CatalogEntry.Create(limitesCatalog.Id, "VAR_LIMITE", "0.70%", "VaR máximo permitido (95%, 1 día)", sortOrder: 15),
            CatalogEntry.Create(limitesCatalog.Id, "DEFICIT_VAR", "2.10%", "Déficit de VaR máximo permitido", sortOrder: 16)
        };
        await context.CatalogEntries.AddRangeAsync(limitesInversion, cancellationToken);

        // =============================================================================
        // 23. CATÁLOGO DE PAÍSES ISO 3166
        // Para validación de LEI y exposición geográfica
        // =============================================================================
        var paisesCatalog = Catalog.Create("PAISES_ISO3166", "Catálogo de Países ISO 3166",
            "Países para validación de LEI y exposición geográfica", "2025.1", "ISO 3166-1");
        await context.Catalogs.AddAsync(paisesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var paises = new[]
        {
            CatalogEntry.Create(paisesCatalog.Id, "MX", "México", "484 - MEX", sortOrder: 1),
            CatalogEntry.Create(paisesCatalog.Id, "US", "Estados Unidos", "840 - USA", sortOrder: 2),
            CatalogEntry.Create(paisesCatalog.Id, "CA", "Canadá", "124 - CAN", sortOrder: 3),
            CatalogEntry.Create(paisesCatalog.Id, "GB", "Reino Unido", "826 - GBR", sortOrder: 4),
            CatalogEntry.Create(paisesCatalog.Id, "DE", "Alemania", "276 - DEU", sortOrder: 5),
            CatalogEntry.Create(paisesCatalog.Id, "FR", "Francia", "250 - FRA", sortOrder: 6),
            CatalogEntry.Create(paisesCatalog.Id, "ES", "España", "724 - ESP", sortOrder: 7),
            CatalogEntry.Create(paisesCatalog.Id, "IT", "Italia", "380 - ITA", sortOrder: 8),
            CatalogEntry.Create(paisesCatalog.Id, "NL", "Países Bajos", "528 - NLD", sortOrder: 9),
            CatalogEntry.Create(paisesCatalog.Id, "CH", "Suiza", "756 - CHE", sortOrder: 10),
            CatalogEntry.Create(paisesCatalog.Id, "JP", "Japón", "392 - JPN", sortOrder: 11),
            CatalogEntry.Create(paisesCatalog.Id, "CN", "China", "156 - CHN", sortOrder: 12),
            CatalogEntry.Create(paisesCatalog.Id, "HK", "Hong Kong", "344 - HKG", sortOrder: 13),
            CatalogEntry.Create(paisesCatalog.Id, "SG", "Singapur", "702 - SGP", sortOrder: 14),
            CatalogEntry.Create(paisesCatalog.Id, "KR", "Corea del Sur", "410 - KOR", sortOrder: 15),
            CatalogEntry.Create(paisesCatalog.Id, "AU", "Australia", "036 - AUS", sortOrder: 16),
            CatalogEntry.Create(paisesCatalog.Id, "BR", "Brasil", "076 - BRA", sortOrder: 17),
            CatalogEntry.Create(paisesCatalog.Id, "IN", "India", "356 - IND", sortOrder: 18),
            CatalogEntry.Create(paisesCatalog.Id, "SE", "Suecia", "752 - SWE", sortOrder: 19),
            CatalogEntry.Create(paisesCatalog.Id, "NO", "Noruega", "578 - NOR", sortOrder: 20),
            CatalogEntry.Create(paisesCatalog.Id, "DK", "Dinamarca", "208 - DNK", sortOrder: 21),
            CatalogEntry.Create(paisesCatalog.Id, "IE", "Irlanda", "372 - IRL", sortOrder: 22),
            CatalogEntry.Create(paisesCatalog.Id, "LU", "Luxemburgo", "442 - LUX", sortOrder: 23),
            CatalogEntry.Create(paisesCatalog.Id, "KY", "Islas Caimán", "136 - CYM", sortOrder: 24),
            CatalogEntry.Create(paisesCatalog.Id, "BM", "Bermudas", "060 - BMU", sortOrder: 25)
        };
        await context.CatalogEntries.AddRangeAsync(paises, cancellationToken);

        // =============================================================================
        // 24. CATÁLOGO DE CALIFICACIONES CREDITICIAS
        // Fuente: CONSAR / S&P, Moody's, Fitch, HR Ratings
        // =============================================================================
        var calificacionesCatalog = Catalog.Create("CALIFICACIONES_CREDITICIAS", "Calificaciones Crediticias",
            "Escalas de calificación para deuda SIEFORE", "2025.1", "CONSAR/Calificadoras");
        await context.Catalogs.AddAsync(calificacionesCatalog, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);

        var calificaciones = new[]
        {
            // Grado de inversión - Escala local
            CatalogEntry.Create(calificacionesCatalog.Id, "mxAAA", "AAA (mx)", "Máxima calidad crediticia", sortOrder: 1),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxAA+", "AA+ (mx)", "Alta calidad crediticia", sortOrder: 2),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxAA", "AA (mx)", "Alta calidad crediticia", sortOrder: 3),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxAA-", "AA- (mx)", "Alta calidad crediticia", sortOrder: 4),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxA+", "A+ (mx)", "Buena calidad crediticia", sortOrder: 5),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxA", "A (mx)", "Buena calidad crediticia", sortOrder: 6),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxA-", "A- (mx)", "Buena calidad crediticia", sortOrder: 7),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxBBB+", "BBB+ (mx)", "Grado inversión bajo", sortOrder: 8),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxBBB", "BBB (mx)", "Grado inversión bajo", sortOrder: 9),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxBBB-", "BBB- (mx)", "Grado inversión mínimo", sortOrder: 10),
            // Grado especulativo (solo para CKDs/CERPIs)
            CatalogEntry.Create(calificacionesCatalog.Id, "mxBB+", "BB+ (mx)", "Especulativo (solo CKD/CERPI)", sortOrder: 11),
            CatalogEntry.Create(calificacionesCatalog.Id, "mxBB", "BB (mx)", "Especulativo", sortOrder: 12),
            CatalogEntry.Create(calificacionesCatalog.Id, "SIN_CALIF", "Sin Calificación", "Instrumento sin calificación", sortOrder: 13),
            // Escala internacional
            CatalogEntry.Create(calificacionesCatalog.Id, "AAA", "AAA (global)", "Máxima calidad - Global", sortOrder: 14),
            CatalogEntry.Create(calificacionesCatalog.Id, "AA", "AA (global)", "Alta calidad - Global", sortOrder: 15),
            CatalogEntry.Create(calificacionesCatalog.Id, "A", "A (global)", "Buena calidad - Global", sortOrder: 16),
            CatalogEntry.Create(calificacionesCatalog.Id, "BBB", "BBB (global)", "Grado inversión - Global", sortOrder: 17)
        };
        await context.CatalogEntries.AddRangeAsync(calificaciones, cancellationToken);
    }

    private static async Task SeedValidatorsAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        // Structure validators
        var validators = new List<ValidatorRule>
        {
            // V01 - Header validation
            CreateValidator(
                "V01-001",
                "Validación de Encabezado",
                "Valida que el archivo contenga encabezado con tipo 01",
                ValidatorType.Structure,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Nomina, FileType.Contable, FileType.Aportaciones },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Sección 3.1",
                10),

            // V02 - Footer validation
            CreateValidator(
                "V02-001",
                "Validación de Sumario",
                "Valida que el archivo contenga sumario con tipo 03 o 99",
                ValidatorType.Structure,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Nomina, FileType.Contable, FileType.Aportaciones },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Sección 3.2",
                20),

            // V03 - Line length validation
            CreateValidator(
                "V03-001",
                "Longitud de Línea",
                "Valida que las líneas cumplan con la longitud especificada",
                ValidatorType.Structure,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Nomina, FileType.Contable },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Sección 3.3",
                30),

            // V04 - NSS validation
            CreateValidator(
                "V04-001",
                "Validación de NSS",
                "Valida formato y dígito verificador del NSS",
                ValidatorType.Format,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Nomina, FileType.Aportaciones, FileType.Retiros },
                "FORMATO",
                "CONSAR Circular 19-8, Sección 4.1",
                40),

            // V05 - CURP validation
            CreateValidator(
                "V05-001",
                "Validación de CURP",
                "Valida formato y estructura de la CURP",
                ValidatorType.Format,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Nomina, FileType.Aportaciones, FileType.Retiros },
                "FORMATO",
                "CONSAR Circular 19-8, Sección 4.2",
                50),

            // V06 - RFC validation
            CreateValidator(
                "V06-001",
                "Validación de RFC",
                "Valida formato y dígito verificador del RFC",
                ValidatorType.Format,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.Nomina, FileType.Contable },
                "FORMATO",
                "SAT y CONSAR Circular 19-8, Sección 4.3",
                60),

            // V07 - Date validation
            CreateValidator(
                "V07-001",
                "Validación de Fecha",
                "Valida que las fechas sean válidas y en formato YYYYMMDD",
                ValidatorType.Format,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.Nomina, FileType.Contable, FileType.Aportaciones },
                "FORMATO",
                "CONSAR Circular 19-8, Sección 4.4",
                70),

            // V08 - Amount validation
            CreateValidator(
                "V08-001",
                "Validación de Importe",
                "Valida que los importes sean numéricos y positivos",
                ValidatorType.Format,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.Nomina, FileType.Contable, FileType.Aportaciones },
                "FORMATO",
                "CONSAR Circular 19-8, Sección 4.5",
                80),

            // V09 - AFORE code validation
            CreateValidator(
                "V09-001",
                "Validación Clave AFORE",
                "Valida que la clave AFORE esté en el catálogo",
                ValidatorType.Catalog,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.Aportaciones, FileType.Traspasos },
                "CATALOGO",
                "CONSAR Circular 19-8, Sección 5.1",
                90),

            // V10 - Record count validation
            CreateValidator(
                "V10-001",
                "Conteo de Registros",
                "Valida que el conteo de registros coincida con el sumario",
                ValidatorType.Calculation,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Nomina, FileType.Contable, FileType.Aportaciones },
                "CALCULOS",
                "CONSAR Circular 19-8, Sección 6.1",
                100),

            // V11 - Sum totals validation
            CreateValidator(
                "V11-001",
                "Suma de Totales",
                "Valida que la suma de importes coincida con el total del sumario",
                ValidatorType.Calculation,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Nomina, FileType.Contable, FileType.Aportaciones },
                "CALCULOS",
                "CONSAR Circular 19-8, Sección 6.2",
                110),

            // V12 - Duplicate detection
            CreateValidator(
                "V12-001",
                "Detección de Duplicados",
                "Detecta registros duplicados por NSS o cuenta",
                ValidatorType.Logic,
                ValidatorCriticality.Warning,
                new List<FileType> { FileType.Nomina, FileType.Aportaciones },
                "LOGICA",
                "CONSAR Circular 19-8, Sección 7.1",
                120),

            // ===========================================================================
            // VALIDADORES SIEFORE - Cartera de Inversión (.0300)
            // ===========================================================================

            // V13 - ISIN format validation
            CreateValidator(
                "V13-001",
                "Formato ISIN válido",
                "Valida que el ISIN cumpla con estándar ISO 6166 (2 letras país + 9 alfanuméricos + 1 dígito verificador)",
                ValidatorType.Format,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore, FileType.ValuacionCartera, FileType.ComposicionCartera },
                "INSTRUMENTOS",
                "ISO 6166 / CONSAR Circular 19-8, Sección 5.2",
                130),

            // V14 - ISIN exists in catalog/API
            CreateValidator(
                "V14-001",
                "ISIN registrado en catálogo",
                "Valida que el ISIN esté registrado en catálogo de instrumentos autorizados (OpenFIGI)",
                ValidatorType.ExternalApi,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore, FileType.ValuacionCartera },
                "INSTRUMENTOS",
                "CONSAR Circular 19-8, Sección 5.2",
                140),

            // V15 - LEI format validation
            CreateValidator(
                "V15-001",
                "Formato LEI válido",
                "Valida que el LEI tenga 20 caracteres alfanuméricos según ISO 17442",
                ValidatorType.Format,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Derivados, FileType.ColateralDerivados },
                "CONTRAPARTE",
                "ISO 17442 / CONSAR Circular 19-8, Sección 5.3",
                150),

            // V16 - LEI exists in GLEIF
            CreateValidator(
                "V16-001",
                "LEI registrado en GLEIF",
                "Valida que el LEI esté activo en la base de datos Global Legal Entity Identifier Foundation",
                ValidatorType.ExternalApi,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.Derivados, FileType.ColateralDerivados },
                "CONTRAPARTE",
                "CONSAR Circular 19-8, Sección 5.3",
                160),

            // V17 - Currency pair validation
            CreateValidator(
                "V17-001",
                "Par de divisas válido",
                "Valida que el par de divisas esté en el catálogo de divisas autorizadas ISO 4217",
                ValidatorType.Catalog,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Derivados, FileType.OperacionesDivisas },
                "DIVISAS",
                "ISO 4217 / CONSAR Circular 19-8",
                170),

            // V18 - Expiration date future
            CreateValidator(
                "V18-001",
                "Fecha vencimiento futura",
                "Valida que la fecha de vencimiento del derivado sea posterior a la fecha del archivo",
                ValidatorType.Logic,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.Derivados },
                "DERIVADOS",
                "CONSAR Circular 19-8, Sección 5.4",
                180),

            // V19 - Notional amount positive
            CreateValidator(
                "V19-001",
                "Monto nocional positivo",
                "Valida que el monto nocional del derivado sea mayor a cero",
                ValidatorType.Range,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Derivados },
                "DERIVADOS",
                "CONSAR Circular 19-8, Sección 5.4",
                190),

            // V20 - Recognized exchange
            CreateValidator(
                "V20-001",
                "Bolsa reconocida",
                "Valida que la bolsa de valores esté en el catálogo de mercados reconocidos (ISO 10383 MIC)",
                ValidatorType.Catalog,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore, FileType.Derivados },
                "MERCADOS",
                "ISO 10383 / CONSAR Circular 19-8",
                200),

            // V21 - FIX exchange rate validation
            CreateValidator(
                "V21-001",
                "Tipo de cambio FIX BANXICO",
                "Valida que el tipo de cambio corresponda al FIX publicado por BANXICO para la fecha",
                ValidatorType.ExternalApi,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore, FileType.Derivados, FileType.OperacionesDivisas },
                "VALUACION",
                "CONSAR Circular 19-8, Sección 6.3",
                210),

            // V22 - Issuer concentration limit
            CreateValidator(
                "V22-001",
                "Límite concentración emisora",
                "Valida que la exposición a una emisora no exceda el 5% del activo neto de la SIEFORE",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore, FileType.ComposicionCartera },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 23",
                220),

            // V23 - International investment limit
            CreateValidator(
                "V23-001",
                "Límite inversión internacional",
                "Valida que la inversión internacional no exceda el 20% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 24",
                230),

            // V24 - SIEFORE record count
            CreateValidator(
                "V24-001",
                "Conteo registros SIEFORE",
                "Valida que el número de registros de detalle coincida con el encabezado del archivo .0300",
                ValidatorType.Calculation,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Sección 3.1",
                240),

            // V25 - SIEFORE clave validation
            CreateValidator(
                "V25-001",
                "Clave SIEFORE válida",
                "Valida que la clave SIEFORE corresponda a una SIEFORE generacional activa",
                ValidatorType.Catalog,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore, FileType.Derivados, FileType.ValuacionCartera },
                "CATALOGO",
                "CONSAR Circular 19-8, Sección 5.1",
                250),

            // V26 - Instrument type validation
            CreateValidator(
                "V26-001",
                "Tipo de instrumento válido",
                "Valida que el tipo de instrumento esté en el catálogo de instrumentos autorizados para SIEFORE",
                ValidatorType.Catalog,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore },
                "INSTRUMENTOS",
                "CONSAR Circular 19-8, Sección 5.2",
                260),

            // V27 - Derivative type validation
            CreateValidator(
                "V27-001",
                "Tipo de derivado válido",
                "Valida que el tipo de derivado (Forward, Futuro, Swap, Opción) esté en el catálogo",
                ValidatorType.Catalog,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Derivados },
                "DERIVADOS",
                "CONSAR Circular 19-8, Archivo .0314",
                270),

            // V28 - Market value positive
            CreateValidator(
                "V28-001",
                "Valor de mercado válido",
                "Valida que el valor de mercado de la posición sea un número válido (puede ser negativo para derivados)",
                ValidatorType.Format,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore, FileType.Derivados },
                "VALUACION",
                "CONSAR Circular 19-8, Sección 6.1",
                280),

            // V29 - Titles/units positive
            CreateValidator(
                "V29-001",
                "Títulos/unidades positivas",
                "Valida que el número de títulos o unidades sea mayor a cero",
                ValidatorType.Range,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore },
                "POSICIONES",
                "CONSAR Circular 19-8, Sección 5.2",
                290),

            // V30 - Credit rating validation
            CreateValidator(
                "V30-001",
                "Calificación crediticia válida",
                "Valida que la calificación crediticia del instrumento esté en el catálogo autorizado",
                ValidatorType.Catalog,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore },
                "CALIFICACIONES",
                "CONSAR Circular 19-8, Sección 5.5",
                300),

            // V31 - Maturity date validation
            CreateValidator(
                "V31-001",
                "Fecha vencimiento instrumento",
                "Valida que la fecha de vencimiento del instrumento sea válida y en formato correcto",
                ValidatorType.Format,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore },
                "FORMATO",
                "CONSAR Circular 19-8, Sección 4.4",
                310),

            // ===========================================================================
            // VALIDADORES DE DERIVADOS (.0314)
            // ===========================================================================

            // V32 - Forward validation
            CreateValidator(
                "V32-001",
                "Forward tipo registro 3010",
                "Valida estructura completa de registro tipo 3010 para operaciones Forward",
                ValidatorType.Structure,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Derivados },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Archivo .0314, Tipo 3010",
                320),

            // V33 - Future validation
            CreateValidator(
                "V33-001",
                "Futuro tipo registro 3020",
                "Valida estructura completa de registro tipo 3020 para operaciones de Futuros",
                ValidatorType.Structure,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Derivados },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Archivo .0314, Tipo 3020",
                330),

            // V34 - Swap validation
            CreateValidator(
                "V34-001",
                "Swap tipo registro 3030",
                "Valida estructura completa de registro tipo 3030 para operaciones Swap",
                ValidatorType.Structure,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Derivados },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Archivo .0314, Tipo 3030",
                340),

            // V35 - Option validation
            CreateValidator(
                "V35-001",
                "Opción tipo registro 3040",
                "Valida estructura completa de registro tipo 3040 para Opciones",
                ValidatorType.Structure,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Derivados },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Archivo .0314, Tipo 3040",
                350),

            // V36 - Collateral derivative match
            CreateValidator(
                "V36-001",
                "Colateral coincide con derivado",
                "Valida que el colateral en archivo .0315 corresponda a derivados reportados en .0314",
                ValidatorType.CrossFile,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.ColateralDerivados },
                "CRUCE",
                "CONSAR Circular 19-8, Archivos .0314 y .0315",
                360),

            // V37 - Counterparty LEI consistency
            CreateValidator(
                "V37-001",
                "Consistencia LEI contraparte",
                "Valida que el LEI de la contraparte sea consistente en todas las operaciones",
                ValidatorType.Logic,
                ValidatorCriticality.Warning,
                new List<FileType> { FileType.Derivados },
                "LOGICA",
                "CONSAR Circular 19-8, Sección 7.2",
                370),

            // ===========================================================================
            // VALIDADORES DE LÍMITES Y CUMPLIMIENTO REGULATORIO
            // ===========================================================================

            // V38 - Private debt limit
            CreateValidator(
                "V38-001",
                "Límite deuda privada",
                "Valida que la inversión en deuda privada no exceda el 50% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 22",
                380),

            // V39 - Equity national limit
            CreateValidator(
                "V39-001",
                "Límite renta variable nacional",
                "Valida que la renta variable nacional no exceda el límite por tipo de SIEFORE",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 25",
                390),

            // V40 - Equity international limit
            CreateValidator(
                "V40-001",
                "Límite renta variable internacional",
                "Valida que la renta variable internacional no exceda el 20% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 26",
                400),

            // V41 - Structured instruments limit
            CreateValidator(
                "V41-001",
                "Límite estructurados",
                "Valida que los instrumentos estructurados no excedan el 20% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 27",
                410),

            // V42 - FIBRA limit
            CreateValidator(
                "V42-001",
                "Límite FIBRAs",
                "Valida que la inversión en FIBRAs no exceda el 10% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 28",
                420),

            // V43 - CKD/CERPI limit
            CreateValidator(
                "V43-001",
                "Límite CKDs y CERPIs",
                "Valida que la inversión en CKDs y CERPIs no exceda el 20% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 29",
                430),

            // V44 - Commodity limit
            CreateValidator(
                "V44-001",
                "Límite mercancías",
                "Valida que la exposición a mercancías no exceda el 10% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 30",
                440),

            // V45 - Group concentration limit
            CreateValidator(
                "V45-001",
                "Límite grupo empresarial",
                "Valida que la exposición a un grupo empresarial no exceda el 15% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore, FileType.ComposicionCartera },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 31",
                450),

            // V46 - Sector concentration limit
            CreateValidator(
                "V46-001",
                "Límite sector económico",
                "Valida que la exposición a un sector económico no exceda el 25% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 32",
                460),

            // V47 - Country concentration limit
            CreateValidator(
                "V47-001",
                "Límite por país",
                "Valida que la exposición a un país individual no exceda el 5% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.CarteraSiefore },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 33",
                470),

            // V48 - Currency exposure limit
            CreateValidator(
                "V48-001",
                "Límite exposición cambiaria",
                "Valida que la exposición cambiaria neta no exceda el 30% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore, FileType.Derivados },
                "LIMITES",
                "CONSAR Disposiciones de Carácter General, Art. 34",
                480),

            // ===========================================================================
            // VALIDADORES DE VALOR EN RIESGO (VaR) - Archivo .0320
            // ===========================================================================

            // V49 - VaR daily limit
            CreateValidator(
                "V49-001",
                "Límite VaR diario",
                "Valida que el VaR al 95% a 1 día no exceda el 0.70% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.ValorEnRiesgo },
                "RIESGOS",
                "CONSAR Disposiciones de Carácter General, Art. 45",
                490),

            // V50 - VaR deficit limit
            CreateValidator(
                "V50-001",
                "Límite déficit VaR",
                "Valida que el déficit de VaR (CVaR) no exceda el 2.10% del activo neto",
                ValidatorType.Compliance,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.ValorEnRiesgo },
                "RIESGOS",
                "CONSAR Disposiciones de Carácter General, Art. 46",
                500),

            // V51 - VaR calculation consistency
            CreateValidator(
                "V51-001",
                "Consistencia cálculo VaR",
                "Valida que el VaR reportado sea consistente con la metodología autorizada",
                ValidatorType.Calculation,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.ValorEnRiesgo },
                "RIESGOS",
                "CONSAR Circular 19-8, Sección 8.1",
                510),

            // ===========================================================================
            // VALIDADORES DE MERCADO DE DINERO Y REPORTOS (.0304, .0305)
            // ===========================================================================

            // V52 - Repo counterparty validation
            CreateValidator(
                "V52-001",
                "Contraparte reporto autorizada",
                "Valida que la contraparte del reporto sea una institución financiera autorizada",
                ValidatorType.Catalog,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Reportos },
                "CONTRAPARTES",
                "CONSAR Circular 19-8, Archivo .0305",
                520),

            // V53 - Repo collateral validation
            CreateValidator(
                "V53-001",
                "Colateral reporto válido",
                "Valida que el colateral del reporto sea un instrumento autorizado para garantía",
                ValidatorType.Catalog,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.Reportos },
                "INSTRUMENTOS",
                "CONSAR Circular 19-8, Archivo .0305",
                530),

            // V54 - Repo term validation
            CreateValidator(
                "V54-001",
                "Plazo reporto válido",
                "Valida que el plazo del reporto no exceda el máximo permitido",
                ValidatorType.Range,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.Reportos },
                "PLAZOS",
                "CONSAR Circular 19-8, Sección 5.6",
                540),

            // V55 - Securities lending validation
            CreateValidator(
                "V55-001",
                "Préstamo valores válido",
                "Valida la estructura y límites de operaciones de préstamo de valores",
                ValidatorType.Structure,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.PrestamoValores },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Archivo .0306",
                550),

            // ===========================================================================
            // VALIDADORES DE OPERACIONES CON DIVISAS (.0310)
            // ===========================================================================

            // V56 - FX spot validation
            CreateValidator(
                "V56-001",
                "Operación spot divisas",
                "Valida la estructura de operaciones spot de divisas",
                ValidatorType.Structure,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.OperacionesDivisas },
                "ESTRUCTURA",
                "CONSAR Circular 19-8, Archivo .0310",
                560),

            // V57 - Currency authorized
            CreateValidator(
                "V57-001",
                "Divisa autorizada",
                "Valida que la divisa esté en el catálogo de divisas autorizadas para operación",
                ValidatorType.Catalog,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.OperacionesDivisas, FileType.Derivados },
                "DIVISAS",
                "CONSAR Circular 19-8, Sección 5.7",
                570),

            // ===========================================================================
            // VALIDADORES DE VALUACIÓN Y PRECIOS (.0302)
            // ===========================================================================

            // V58 - Price vector match (VALMER)
            CreateValidator(
                "V58-001",
                "Precio vector VALMER",
                "Valida que el precio reportado corresponda al vector de precios oficial VALMER",
                ValidatorType.ExternalApi,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.ValuacionCartera, FileType.CarteraSiefore },
                "VALUACION",
                "CONSAR Circular 19-8, Sección 6.2",
                580),

            // V59 - Mark-to-market consistency
            CreateValidator(
                "V59-001",
                "Consistencia mark-to-market",
                "Valida que la valuación a mercado sea consistente con precios de referencia",
                ValidatorType.Calculation,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.ValuacionCartera },
                "VALUACION",
                "CONSAR Circular 19-8, Sección 6.2",
                590),

            // V60 - Accrued interest calculation
            CreateValidator(
                "V60-001",
                "Cálculo interés devengado",
                "Valida que el interés devengado sea consistente con las características del instrumento",
                ValidatorType.Calculation,
                ValidatorCriticality.Warning,
                new List<FileType> { FileType.CarteraSiefore, FileType.ValuacionCartera },
                "VALUACION",
                "CONSAR Circular 19-8, Sección 6.3",
                600),

            // ===========================================================================
            // VALIDADORES DE ESTADOS FINANCIEROS (.0400)
            // ===========================================================================

            // V61 - Balance sheet consistency
            CreateValidator(
                "V61-001",
                "Consistencia balance general",
                "Valida que Activo = Pasivo + Capital en el balance de la SIEFORE",
                ValidatorType.Calculation,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.EstadosFinancieros },
                "CONTABLE",
                "CONSAR Circular 19-8, Archivo .0400",
                610),

            // V62 - Net asset value calculation
            CreateValidator(
                "V62-001",
                "Cálculo activo neto",
                "Valida que el activo neto reportado sea consistente con activos menos pasivos",
                ValidatorType.Calculation,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.EstadosFinancieros },
                "CONTABLE",
                "CONSAR Circular 19-8, Archivo .0400",
                620),

            // ===========================================================================
            // VALIDADORES DE INFORMACIÓN DE AFILIADOS (.0500)
            // ===========================================================================

            // V63 - Worker count consistency
            CreateValidator(
                "V63-001",
                "Consistencia cuentas trabajadores",
                "Valida que el número de cuentas sea consistente con registros individuales",
                ValidatorType.Calculation,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.InfoAfiliados },
                "AFILIADOS",
                "CONSAR Circular 19-8, Archivo .0500",
                630),

            // V64 - Worker NSS unique
            CreateValidator(
                "V64-001",
                "NSS único por afiliado",
                "Valida que no existan NSS duplicados en el archivo de afiliados",
                ValidatorType.Logic,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.InfoAfiliados },
                "AFILIADOS",
                "CONSAR Circular 19-8, Archivo .0500",
                640),

            // ===========================================================================
            // VALIDADORES DE CRUCE ENTRE ARCHIVOS
            // ===========================================================================

            // V65 - Portfolio valuation match
            CreateValidator(
                "V65-001",
                "Cruce cartera-valuación",
                "Valida que los instrumentos en .0300 coincidan con los valuados en .0302",
                ValidatorType.CrossFile,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore, FileType.ValuacionCartera },
                "CRUCE",
                "CONSAR Circular 19-8, Archivos .0300 y .0302",
                650),

            // V66 - Derivatives collateral match
            CreateValidator(
                "V66-001",
                "Cruce derivados-colateral",
                "Valida que todo derivado con requerimiento de colateral tenga colateral reportado",
                ValidatorType.CrossFile,
                ValidatorCriticality.Error,
                new List<FileType> { FileType.Derivados, FileType.ColateralDerivados },
                "CRUCE",
                "CONSAR Circular 19-8, Archivos .0314 y .0315",
                660),

            // V67 - Total assets reconciliation
            CreateValidator(
                "V67-001",
                "Conciliación activos totales",
                "Valida que el total de activos en cartera coincida con estados financieros",
                ValidatorType.CrossFile,
                ValidatorCriticality.Critical,
                new List<FileType> { FileType.CarteraSiefore, FileType.EstadosFinancieros },
                "CRUCE",
                "CONSAR Circular 19-8, Archivos .0300 y .0400",
                670)
        };

        await context.ValidatorRules.AddRangeAsync(validators, cancellationToken);
    }

    private static ValidatorRule CreateValidator(
        string code,
        string name,
        string description,
        ValidatorType type,
        ValidatorCriticality criticality,
        List<FileType> fileTypes,
        string category,
        string regulatoryReference,
        int runOrder)
    {
        return ValidatorRule.Create(
            code: code,
            name: name,
            description: description,
            type: type,
            criticality: criticality,
            fileTypes: fileTypes,
            conditionGroup: new ValidatorConditionGroup
            {
                Operator = LogicalOperator.And,
                Conditions = new List<ValidatorConditionItem>()
            },
            action: ValidatorAction.Reject(code, $"Error en {name}"),
            category: category,
            regulatoryReference: regulatoryReference,
            runOrder: runOrder);
    }

    private static async Task SeedValidatorGroupsAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        var groups = new[]
        {
            // Grupos básicos
            ValidatorGroup.Create("ESTRUCTURA", "Validaciones de Estructura", "Validaciones de estructura del archivo", 1),
            ValidatorGroup.Create("FORMATO", "Validaciones de Formato", "Validaciones de formato de campos", 2),
            ValidatorGroup.Create("CATALOGO", "Validaciones de Catálogo", "Validaciones contra catálogos CONSAR", 3),
            ValidatorGroup.Create("CALCULOS", "Validaciones de Cálculos", "Validaciones de sumas y totales", 4),
            ValidatorGroup.Create("LOGICA", "Validaciones de Lógica", "Validaciones de reglas de negocio", 5),
            // Grupos SIEFORE
            ValidatorGroup.Create("INSTRUMENTOS", "Validaciones de Instrumentos", "Validaciones de ISIN, CUSIP y tipos de instrumento", 6),
            ValidatorGroup.Create("CONTRAPARTE", "Validaciones de Contraparte", "Validaciones de LEI y contrapartes", 7),
            ValidatorGroup.Create("DERIVADOS", "Validaciones de Derivados", "Validaciones de operaciones con derivados", 8),
            ValidatorGroup.Create("DIVISAS", "Validaciones de Divisas", "Validaciones de divisas y tipo de cambio", 9),
            ValidatorGroup.Create("MERCADOS", "Validaciones de Mercados", "Validaciones de bolsas y mercados reconocidos", 10),
            ValidatorGroup.Create("VALUACION", "Validaciones de Valuación", "Validaciones de precios y mark-to-market", 11),
            ValidatorGroup.Create("LIMITES", "Validaciones de Límites", "Validaciones de límites de inversión CONSAR", 12),
            ValidatorGroup.Create("RIESGOS", "Validaciones de Riesgos", "Validaciones de VaR y métricas de riesgo", 13),
            ValidatorGroup.Create("CRUCE", "Validaciones de Cruce", "Validaciones de cruce entre archivos", 14),
            ValidatorGroup.Create("CONTRAPARTES", "Validaciones de Contrapartes", "Validaciones de contrapartes autorizadas", 15),
            ValidatorGroup.Create("POSICIONES", "Validaciones de Posiciones", "Validaciones de títulos y unidades", 16),
            ValidatorGroup.Create("CALIFICACIONES", "Validaciones de Calificaciones", "Validaciones de calificaciones crediticias", 17),
            ValidatorGroup.Create("PLAZOS", "Validaciones de Plazos", "Validaciones de plazos y vencimientos", 18),
            ValidatorGroup.Create("CONTABLE", "Validaciones Contables", "Validaciones de estados financieros", 19),
            ValidatorGroup.Create("AFILIADOS", "Validaciones de Afiliados", "Validaciones de información de trabajadores", 20)
        };

        await context.ValidatorGroups.AddRangeAsync(groups, cancellationToken);
    }

    private static async Task SeedNormativeChangesAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        var changes = new[]
        {
            NormativeChange.Create(
                "CIRC-28-25",
                "Circular 28-25: Modificación a disposiciones de aportaciones voluntarias",
                "Se modifican los criterios para el manejo de aportaciones voluntarias y complementarias de retiro conforme a las nuevas disposiciones de CONSAR",
                DateTime.UtcNow.AddDays(-11),
                DateTime.UtcNow.AddDays(5),
                NormativePriority.High,
                "Aportaciones",
                new[] { "V12", "V15", "V23" }),

            NormativeChange.Create(
                "CIRC-27-25",
                "Circular 27-25: Actualización de catálogos de municipios",
                "Actualización del catálogo de municipios conforme al Marco Geoestadístico 2025 del INEGI",
                DateTime.UtcNow.AddDays(-25),
                DateTime.UtcNow.AddDays(-6),
                NormativePriority.Medium,
                "Catálogos",
                new[] { "V06", "V07" }),

            NormativeChange.Create(
                "CIRC-26-25",
                "Circular 26-25: Nuevos requisitos para traspaso entre AFOREs",
                "Se establecen nuevos requisitos y validaciones para procesos de traspaso entre administradoras",
                DateTime.UtcNow.AddDays(-57),
                DateTime.UtcNow.AddDays(-42),
                NormativePriority.High,
                "Traspasos",
                new[] { "V18", "V19", "V20", "V21" }),

            NormativeChange.Create(
                "CIRC-25-25",
                "Circular 25-25: Modificación al formato de archivo NOMINA",
                "Actualización de estructura y longitud de campos en archivos NOMINA para incluir nuevos indicadores de ahorro voluntario",
                DateTime.UtcNow.AddDays(-102),
                DateTime.UtcNow.AddDays(-86),
                NormativePriority.High,
                "Estructura",
                new[] { "V01", "V02", "V03", "V04" })
        };

        // Apply older changes that are past effective date
        changes[1].Apply("system"); // CIRC-27-25 is active
        changes[2].Apply("system"); // CIRC-26-25 is active
        changes[3].Archive(); // CIRC-25-25 is archived

        await context.NormativeChanges.AddRangeAsync(changes, cancellationToken);
    }

    private static async Task SeedScraperSourcesAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        var sources = new List<ScraperSource>();

        // =============================================================================
        // TIER 1: FUENTES CONSAR CORE (Existentes - Alta prioridad)
        // =============================================================================

        // DOF - Diario Oficial de la Federación
        var dofSource = ScraperSource.Create(
            name: "DOF - Diario Oficial de la Federación",
            description: "Extrae publicaciones del DOF relacionadas con CONSAR, pensiones y AFOREs",
            sourceType: ScraperSourceType.DOF,
            baseUrl: "https://www.dof.gob.mx",
            frequency: ScraperFrequency.Daily);
        dofSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            searchTerms = new[] { "CONSAR", "pensiones", "AFORE", "ahorro para el retiro", "SAR" },
            sections = new[] { "SEGOB", "SHCP" },
            maxDaysBack = 7,
            timeoutSeconds = 60
        }));
        sources.Add(dofSource);

        // GOB.MX CONSAR - Portal oficial
        var gobMxSource = ScraperSource.Create(
            name: "GOB.MX CONSAR - Portal Oficial",
            description: "Extrae circulares, disposiciones y comunicados del portal oficial de CONSAR",
            sourceType: ScraperSourceType.GobMxConsar,
            baseUrl: "https://www.gob.mx",
            frequency: ScraperFrequency.Every12Hours);
        gobMxSource.SetEndpoint("/consar");
        gobMxSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            categories = new[] { "circulares", "disposiciones", "comunicados", "normativa" },
            maxResults = 50,
            timeoutSeconds = 45
        }));
        sources.Add(gobMxSource);

        // SIDOF - Sistema de Información del DOF
        var sidofSource = ScraperSource.Create(
            name: "SIDOF - Sistema de Información DOF",
            description: "Sistema avanzado de búsqueda del DOF para disposiciones normativas",
            sourceType: ScraperSourceType.SIDOF,
            baseUrl: "https://sidof.segob.gob.mx",
            frequency: ScraperFrequency.Daily);
        sidofSource.SetEndpoint("/notas");
        sidofSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            organisms = new[] { "CONSAR", "SHCP" },
            documentTypes = new[] { "CIRCULAR", "ACUERDO", "DISPOSICION", "REGLAS" },
            maxDaysBack = 30,
            timeoutSeconds = 60
        }));
        sources.Add(sidofSource);

        // SINOR CONSAR - Sistema Normativo CONSAR (API JSON)
        var sinorSource = ScraperSource.Create(
            name: "SINOR CONSAR - Sistema Normativo",
            description: "API oficial del Sistema de Normatividad CONSAR (SINOR)",
            sourceType: ScraperSourceType.SinorConsar,
            baseUrl: "https://www.consar.gob.mx/APIs/SINORApi",
            frequency: ScraperFrequency.Daily);
        sinorSource.SetEndpoint("/api/Normatividad/GetNormatividadIdEdo");
        sinorSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            apiFormat = "JSON",
            requestMethod = "POST",
            requestBody = new { I_CVE_NORMATIVIDAD = -1, I_CVE_ESTADO_NORMA = 2, I_CVE_ESTADO_ASOC = 1 },
            timeoutSeconds = 60
        }));
        sources.Add(sinorSource);

        // =============================================================================
        // TIER 2: DATOS DE VALIDACIÓN CRÍTICOS
        // =============================================================================

        // BANXICO - Banco de México (CLABE, calendarios, tipos de cambio)
        var banxicoSource = ScraperSource.Create(
            name: "BANXICO - Banco de México",
            description: "Catálogo CLABE, calendarios financieros, instituciones bancarias",
            sourceType: ScraperSourceType.BANXICO,
            baseUrl: "https://www.banxico.org.mx",
            frequency: ScraperFrequency.Daily);
        banxicoSource.SetEndpoint("/cep/catalogos.html");
        banxicoSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            catalogs = new[] { "CLABE", "Bancos", "SPEI", "Calendarios" },
            apiKey = "${BANXICO_API_KEY}",
            sieApiUrl = "https://www.banxico.org.mx/SieAPIRest/service/v1/",
            series = new[] { "SF43718", "SP68257", "SF61745" },
            timeoutSeconds = 60
        }));
        sources.Add(banxicoSource);

        // RENAPO - Registro Nacional de Población (CURP)
        var renapoSource = ScraperSource.Create(
            name: "RENAPO - Registro Nacional de Población",
            description: "Especificaciones técnicas de validación CURP (18 caracteres)",
            sourceType: ScraperSourceType.RENAPO,
            baseUrl: "https://www.gob.mx/segob/renapo",
            frequency: ScraperFrequency.Weekly);
        renapoSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            curpFormat = "18 caracteres alfanuméricos",
            components = "Apellidos(4)+Nombre(1)+FechaNac(6)+Sexo(1)+Entidad(2)+Consonantes(3)+Verificador(1)",
            validationAlgorithm = "Dígito verificador módulo 10",
            timeoutSeconds = 45
        }));
        sources.Add(renapoSource);

        // IMSS - Instituto Mexicano del Seguro Social (NSS)
        var imssSource = ScraperSource.Create(
            name: "IMSS - Validación NSS",
            description: "Reglas de validación del Número de Seguridad Social (11 dígitos)",
            sourceType: ScraperSourceType.IMSS,
            baseUrl: "https://www.imss.gob.mx",
            frequency: ScraperFrequency.Weekly);
        imssSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            nssFormat = "11 dígitos numéricos",
            components = "Subdelegacion(2)+AñoAlta(2)+AñoNac(2)+Consecutivo(4)+Verificador(1)",
            validationAlgorithm = "Algoritmo Luhn modificado",
            timeoutSeconds = 45
        }));
        sources.Add(imssSource);

        // SAT - Servicio de Administración Tributaria (RFC, Lista 69B)
        var satSource = ScraperSource.Create(
            name: "SAT - Lista 69B y RFC",
            description: "Lista de contribuyentes con operaciones inexistentes y validación RFC",
            sourceType: ScraperSourceType.SAT,
            baseUrl: "https://www.sat.gob.mx",
            frequency: ScraperFrequency.Daily);
        satSource.SetEndpoint("/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes");
        satSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            lista69BUrl = "https://www.sat.gob.mx/consultas/76674/consulta-la-relacion-de-contribuyentes-con-operaciones-presuntamente-inexistentes",
            listaNegraUrl = "https://www.sat.gob.mx/consultas/25782/consulta-la-lista-negra-del-sat",
            rfcPersonaFisica = "13 caracteres",
            rfcPersonaMoral = "12 caracteres",
            timeoutSeconds = 60
        }));
        sources.Add(satSource);

        // SPEI - Sistema de Pagos Electrónicos Interbancarios
        var speiSource = ScraperSource.Create(
            name: "SPEI - Catálogo CLABE",
            description: "Catálogo oficial de instituciones participantes en SPEI y validación CLABE",
            sourceType: ScraperSourceType.SPEI,
            baseUrl: "https://www.banxico.org.mx/cep",
            frequency: ScraperFrequency.Weekly);
        speiSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            clabeFormat = "18 dígitos numéricos",
            components = "Banco(3)+Plaza(3)+Cuenta(11)+Control(1)",
            validationAlgorithm = "Dígito verificador módulo 10 ponderado 3,7,1",
            participantesUrl = "https://www.banxico.org.mx/cep/participantes.html",
            timeoutSeconds = 45
        }));
        sources.Add(speiSource);

        // INEGI - Instituto Nacional de Estadística y Geografía
        var inegiSource = ScraperSource.Create(
            name: "INEGI - Catálogos Geográficos",
            description: "Catálogo de entidades federativas, municipios y códigos postales",
            sourceType: ScraperSourceType.INEGI,
            baseUrl: "https://www.inegi.org.mx",
            frequency: ScraperFrequency.Weekly);
        inegiSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            catalogs = new[] { "Entidades", "Municipios", "Localidades", "CodigosPostales" },
            entidadFormat = "2 dígitos (01-32)",
            municipioFormat = "3 dígitos por entidad",
            apiUrl = "https://www.inegi.org.mx/servicios/api/",
            timeoutSeconds = 60
        }));
        sources.Add(inegiSource);

        // =============================================================================
        // TIER 3: DATOS DE MERCADO Y VALUACIÓN
        // =============================================================================

        // VALMER - Valuación Operativa y Referencias de Mercado
        var valmerSource = ScraperSource.Create(
            name: "VALMER - Precios de Valuación",
            description: "Vector de precios diario para instrumentos de deuda y renta variable",
            sourceType: ScraperSourceType.VALMER,
            baseUrl: "https://www.valmer.com.mx",
            frequency: ScraperFrequency.Daily);
        valmerSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            products = new[] { "VectorPrecios", "Derivados", "CurvasRendimiento", "FactoresRiesgo" },
            instruments = new[] { "CETES", "BONDES", "UDIBONOS", "Corporativos", "RentaVariable" },
            requiresContract = true,
            timeoutSeconds = 120
        }));
        sources.Add(valmerSource);

        // SIEFORE Precios - CONSAR
        var sieforePreciosSource = ScraperSource.Create(
            name: "SIEFORE Precios - CONSAR",
            description: "Precios diarios de valuación de SIEFOREs Generacionales",
            sourceType: ScraperSourceType.SIEFOREPrecios,
            baseUrl: "https://www.gob.mx/consar",
            frequency: ScraperFrequency.Daily);
        sieforePreciosSource.SetEndpoint("/articulos/indicador-de-rendimiento-neto");
        sieforePreciosSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            metrics = new[] { "PrecioSIEFORE", "IRN", "Comisiones", "RecursosAdministrados" },
            sieforesGeneracionales = new[] { "Inicial", "Basica", "2020-2024", "2015-2019", "2010-2014", "2005-2009", "2000-2004", "1995-1999", "1990-1994", "1985-1989", "1980-1984", "1975-1979" },
            timeoutSeconds = 90
        }));
        sources.Add(sieforePreciosSource);

        // CONSAR SISET - Sistema de Estadísticas
        var consarSisetSource = ScraperSource.Create(
            name: "CONSAR SISET - Estadísticas SAR",
            description: "IRN, comisiones, recursos administrados y estadísticas del SAR",
            sourceType: ScraperSourceType.ConsarSISET,
            baseUrl: "https://www.consar.gob.mx/gobmx/aplicativo/siset",
            frequency: ScraperFrequency.Daily);
        consarSisetSource.SetEndpoint("/Enlace.aspx");
        consarSisetSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            statistics = new[] { "IRN", "Comisiones", "RecursosAdministrados", "CuentasIndividuales", "Traspasos" },
            irnUrl = "https://www.gob.mx/consar/articulos/indicador-de-rendimiento-neto",
            comisionesUrl = "https://www.gob.mx/consar/articulos/comisiones-de-las-afore",
            timeoutSeconds = 90
        }));
        sources.Add(consarSisetSource);

        // Índices Financieros - BANXICO/INEGI
        var indicesSource = ScraperSource.Create(
            name: "Índices Financieros",
            description: "UDI, INPC, TIIE, tipos de cambio y indicadores económicos",
            sourceType: ScraperSourceType.IndicesFinancieros,
            baseUrl: "https://www.banxico.org.mx/SieAPIRest/service/v1/",
            frequency: ScraperFrequency.Daily);
        indicesSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            series = new Dictionary<string, string>
            {
                ["SF43718"] = "Tipo de cambio FIX USD/MXN",
                ["SP68257"] = "UDI",
                ["SF61745"] = "TIIE Fondeo 1D",
                ["SF43784"] = "TIIE 28 días",
                ["SF43785"] = "TIIE 91 días",
                ["SF43786"] = "TIIE 182 días"
            },
            apiKey = "${BANXICO_API_KEY}",
            timeoutSeconds = 45
        }));
        sources.Add(indicesSource);

        // BMV - Bolsa Mexicana de Valores
        var bmvSource = ScraperSource.Create(
            name: "BMV - Bolsa Mexicana de Valores",
            description: "Datos de mercado, emisoras y fondos de inversión",
            sourceType: ScraperSourceType.BMV,
            baseUrl: "https://www.bmv.com.mx",
            frequency: ScraperFrequency.Daily);
        bmvSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            data = new[] { "Precios", "Emisoras", "FondosInversion", "ETFs" },
            markets = new[] { "Capitales", "Deuda", "Derivados" },
            timeoutSeconds = 60
        }));
        sources.Add(bmvSource);

        // CETES - Valores Gubernamentales
        var cetesSource = ScraperSource.Create(
            name: "CETES - Valores Gubernamentales",
            description: "Tasas de CETES, BONDES, UDIBONOS para inversión de SIEFOREs",
            sourceType: ScraperSourceType.CETES,
            baseUrl: "https://www.cetesdirecto.com",
            frequency: ScraperFrequency.Daily);
        cetesSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            instruments = new[] { "CETES28", "CETES91", "CETES182", "CETES364", "BONDES", "UDIBONOS", "MBONOS" },
            dataTypes = new[] { "Tasas", "Precios", "Subastas" },
            timeoutSeconds = 45
        }));
        sources.Add(cetesSource);

        // =============================================================================
        // TIER 4: PLD/AML - PREVENCIÓN DE LAVADO DE DINERO
        // =============================================================================

        // OFAC - Office of Foreign Assets Control
        var ofacSource = ScraperSource.Create(
            name: "OFAC - Lista SDN",
            description: "Lista de sanciones internacionales SDN (Specially Designated Nationals)",
            sourceType: ScraperSourceType.OFAC,
            baseUrl: "https://sanctionslistservice.ofac.treas.gov/api",
            frequency: ScraperFrequency.Daily);
        ofacSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            lists = new[] { "SDN", "Consolidated" },
            format = "XML,JSON,CSV",
            downloadUrl = "https://www.treasury.gov/ofac/downloads/sdn.xml",
            timeoutSeconds = 120
        }));
        sources.Add(ofacSource);

        // UIF - Unidad de Inteligencia Financiera
        var uifSource = ScraperSource.Create(
            name: "UIF - Lista PLD Nacional",
            description: "Lista de personas bloqueadas por la Unidad de Inteligencia Financiera",
            sourceType: ScraperSourceType.UIF,
            baseUrl: "https://www.gob.mx/uif",
            frequency: ScraperFrequency.Daily);
        uifSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            listTypes = new[] { "PersonasBloqueadas", "Alertas" },
            portal = "https://siti.hacienda.gob.mx/",
            timeoutSeconds = 60
        }));
        sources.Add(uifSource);

        // ONU - Sanciones del Consejo de Seguridad
        var onuSource = ScraperSource.Create(
            name: "ONU - Lista de Sanciones",
            description: "Lista de sanciones del Consejo de Seguridad de las Naciones Unidas",
            sourceType: ScraperSourceType.ONU,
            baseUrl: "https://www.un.org/securitycouncil/sanctions/un-sc-consolidated-list",
            frequency: ScraperFrequency.Daily);
        onuSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            format = "XML",
            downloadUrl = "https://scsanctions.un.org/resources/xml/en/consolidated.xml",
            timeoutSeconds = 120
        }));
        sources.Add(onuSource);

        // =============================================================================
        // TIER 5: REGULADORES FINANCIEROS
        // =============================================================================

        // CNBV - Comisión Nacional Bancaria y de Valores
        var cnbvSource = ScraperSource.Create(
            name: "CNBV - Normatividad Bancaria",
            description: "Criterios contables, reportes regulatorios R04/R08/R13",
            sourceType: ScraperSourceType.CNBV,
            baseUrl: "https://www.gob.mx/cnbv",
            frequency: ScraperFrequency.Weekly);
        cnbvSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            categories = new[] { "CircularesBancos", "DisposicionesGenerales", "CriteriosContables" },
            reports = new[] { "R04", "R08", "R13" },
            timeoutSeconds = 60
        }));
        sources.Add(cnbvSource);

        // SHCP - Secretaría de Hacienda
        var shcpSource = ScraperSource.Create(
            name: "SHCP - Normativa Financiera",
            description: "Lineamientos y normativa de la Secretaría de Hacienda",
            sourceType: ScraperSourceType.SHCP,
            baseUrl: "https://www.gob.mx/shcp",
            frequency: ScraperFrequency.Weekly);
        shcpSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            categories = new[] { "Normatividad", "Lineamientos", "Acuerdos" },
            relevantFor = new[] { "AFORE", "SIEFORE", "SAR" },
            timeoutSeconds = 60
        }));
        sources.Add(shcpSource);

        // CNSF - Comisión Nacional de Seguros y Fianzas
        var cnsfSource = ScraperSource.Create(
            name: "CNSF - Rentas Vitalicias",
            description: "Normatividad de rentas vitalicias y seguros de pensiones",
            sourceType: ScraperSourceType.CNSF,
            baseUrl: "https://www.gob.mx/cnsf",
            frequency: ScraperFrequency.Weekly);
        cnsfSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            products = new[] { "RentasVitalicias", "SegurosPensiones", "Retiro" },
            tarifas = new[] { "TablasActuariales", "TasasTecnicas" },
            timeoutSeconds = 60
        }));
        sources.Add(cnsfSource);

        // IPAB - Instituto para la Protección al Ahorro Bancario
        var ipabSource = ScraperSource.Create(
            name: "IPAB - Protección al Ahorro",
            description: "Límites de cobertura e instituciones cubiertas",
            sourceType: ScraperSourceType.IPAB,
            baseUrl: "https://www.gob.mx/ipab",
            frequency: ScraperFrequency.Weekly);
        ipabSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            data = new[] { "LimitesCobertura", "InstitucionesCubiertas", "UDIsCobertura" },
            limiteCoberturaUDIs = 400000,
            timeoutSeconds = 45
        }));
        sources.Add(ipabSource);

        // =============================================================================
        // TIER 6: OPERATIVOS SAR
        // =============================================================================

        // PROCESAR - Base de Datos Nacional SAR
        var procesarSource = ScraperSource.Create(
            name: "PROCESAR - BDNSAR",
            description: "Layouts técnicos y especificaciones de archivos CONSAR",
            sourceType: ScraperSourceType.PROCESAR,
            baseUrl: "https://www.procesar.com.mx",
            frequency: ScraperFrequency.Weekly);
        procesarSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            layouts = new[] { "Movimientos", "Traspasos", "Retiros", "Aportaciones", "Conciliacion" },
            fileTypes = new[] { "SB_530", "PS_430", "AV_630", "RC_330" },
            timeoutSeconds = 60
        }));
        sources.Add(procesarSource);

        // CONSAR Portal - Plantillas y XSD
        var consarPortalSource = ScraperSource.Create(
            name: "CONSAR Portal - Plantillas SAR",
            description: "Plantillas SAR, Esquemas XSD y documentación técnica",
            sourceType: ScraperSourceType.ConsarPortal,
            baseUrl: "https://www.consar.gob.mx",
            frequency: ScraperFrequency.Weekly);
        consarPortalSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            documents = new[] { "PlantillasSAR", "EsquemasXSD", "ManualesOperativos", "Circulares" },
            formats = new[] { "PDF", "XSD", "XML", "XLSX" },
            timeoutSeconds = 60
        }));
        sources.Add(consarPortalSource);

        // SAR Layouts - Especificaciones técnicas
        var sarLayoutsSource = ScraperSource.Create(
            name: "SAR Layouts - Especificaciones",
            description: "Layouts de movimientos, traspasos, retiros y aportaciones",
            sourceType: ScraperSourceType.SarLayouts,
            baseUrl: "https://www.consar.gob.mx",
            frequency: ScraperFrequency.Weekly);
        sarLayoutsSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            layoutTypes = new[] { "MovimientosSAR", "TraspasosSAR", "RetirosSAR", "AportacionesSAR" },
            versions = new[] { "2024", "2025" },
            timeoutSeconds = 45
        }));
        sources.Add(sarLayoutsSource);

        // AMAFORE - Asociación Mexicana de AFOREs
        var amafSource = ScraperSource.Create(
            name: "AMAFORE - Estadísticas Sector",
            description: "Estadísticas, informes del mercado y documentación sectorial",
            sourceType: ScraperSourceType.AMAFORE,
            baseUrl: "https://www.amafore.org",
            frequency: ScraperFrequency.Weekly);
        amafSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            reports = new[] { "EstadisticasMensuales", "InformesAnuales", "ComparativosAFORE" },
            data = new[] { "RecursosAdministrados", "CuentasIndividuales", "Comisiones" },
            timeoutSeconds = 60
        }));
        sources.Add(amafSource);

        // =============================================================================
        // TIER 7: INFRAESTRUCTURA FINANCIERA
        // =============================================================================

        // INDEVAL - Depósito Central de Valores
        var indevalSource = ScraperSource.Create(
            name: "INDEVAL - Depósito de Valores",
            description: "Depósito central de valores, custodia de títulos de SIEFOREs",
            sourceType: ScraperSourceType.INDEVAL,
            baseUrl: "https://www.indeval.com.mx",
            frequency: ScraperFrequency.Weekly);
        indevalSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            services = new[] { "Custodia", "Liquidacion", "Compensacion" },
            catalogs = new[] { "Emisoras", "TiposValor" },
            timeoutSeconds = 45
        }));
        sources.Add(indevalSource);

        // MEXDER - Mercado Mexicano de Derivados
        var mexderSource = ScraperSource.Create(
            name: "MEXDER - Derivados",
            description: "Futuros, opciones y derivados para cobertura de portafolios SIEFORE",
            sourceType: ScraperSourceType.MEXDER,
            baseUrl: "https://www.mexder.com.mx",
            frequency: ScraperFrequency.Daily);
        mexderSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            instruments = new[] { "Futuros", "Opciones", "Swaps" },
            underlyings = new[] { "TIIE", "CETES", "IPC", "Divisas" },
            timeoutSeconds = 45
        }));
        sources.Add(mexderSource);

        // Tablas Actuariales - CNSF/CONSAR
        var tablasActuarialesSource = ScraperSource.Create(
            name: "Tablas Actuariales",
            description: "Mortalidad, invalidez, sobrevivencia para cálculo de pensiones",
            sourceType: ScraperSourceType.TablasActuariales,
            baseUrl: "https://www.gob.mx/cnsf",
            frequency: ScraperFrequency.Weekly);
        tablasActuarialesSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            tables = new[] { "CNSF2000-I", "CNSF2000-G", "EMSSAH2009", "EMSSAM2009" },
            factors = new[] { "qx", "px", "lx", "Ax", "ax" },
            timeoutSeconds = 45
        }));
        sources.Add(tablasActuarialesSource);

        // =============================================================================
        // TIER 8: PENSIONES Y SEGURIDAD SOCIAL
        // =============================================================================

        // INFONAVIT - Instituto del Fondo Nacional de la Vivienda
        var infonavitSource = ScraperSource.Create(
            name: "INFONAVIT - Subcuenta Vivienda",
            description: "Aportaciones patronales y reglas de subcuenta de vivienda",
            sourceType: ScraperSourceType.INFONAVIT,
            baseUrl: "https://portalmx.infonavit.org.mx",
            frequency: ScraperFrequency.Weekly);
        infonavitSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            data = new[] { "Aportaciones", "Creditos", "SubcuentaVivienda" },
            aportacionPatronal = "5% SBC",
            timeoutSeconds = 45
        }));
        sources.Add(infonavitSource);

        // FOVISSSTE - Fondo de Vivienda del ISSSTE
        var fovisssteSource = ScraperSource.Create(
            name: "FOVISSSTE - Vivienda ISSSTE",
            description: "Subcuenta de vivienda para trabajadores del Estado",
            sourceType: ScraperSourceType.FOVISSSTE,
            baseUrl: "https://www.gob.mx/fovissste",
            frequency: ScraperFrequency.Weekly);
        fovisssteSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            data = new[] { "SubcuentaVivienda", "Creditos", "Aportaciones" },
            aportacionPatronal = "5% SBC",
            timeoutSeconds = 45
        }));
        sources.Add(fovisssteSource);

        // PENSIONISSSTE
        var pensionissteSource = ScraperSource.Create(
            name: "PENSIONISSSTE - Fondo de Pensiones",
            description: "Sistema de pensiones del sector público federal",
            sourceType: ScraperSourceType.PENSIONISSSTE,
            baseUrl: "https://www.pensionissste.gob.mx",
            frequency: ScraperFrequency.Weekly);
        pensionissteSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            data = new[] { "Aportaciones", "Rendimientos", "Comisiones", "EstadoCuenta" },
            claveProcesar = "519",
            timeoutSeconds = 45
        }));
        sources.Add(pensionissteSource);

        // Pensión del Bienestar
        var pensionBienestarSource = ScraperSource.Create(
            name: "Pensión del Bienestar",
            description: "Programa de pensión universal para adultos mayores",
            sourceType: ScraperSourceType.PensionBienestar,
            baseUrl: "https://www.gob.mx/bienestar",
            frequency: ScraperFrequency.Weekly);
        pensionBienestarSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            program = "Pensión para Adultos Mayores",
            eligibility = "68 años o más (65 en comunidades indígenas)",
            montoMensual = 6000,
            timeoutSeconds = 45
        }));
        sources.Add(pensionBienestarSource);

        // =============================================================================
        // TIER 9: REGULADORES ADICIONALES
        // =============================================================================

        // CONDUSEF - Protección al Usuario
        var condusefSource = ScraperSource.Create(
            name: "CONDUSEF - Protección Usuario",
            description: "Normatividad de protección al usuario de servicios financieros",
            sourceType: ScraperSourceType.CONDUSEF,
            baseUrl: "https://www.gob.mx/condusef",
            frequency: ScraperFrequency.Weekly);
        condusefSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            data = new[] { "Quejas", "ComparativosAFORE", "Normatividad" },
            bureauUrl = "https://www.buro.gob.mx/",
            timeoutSeconds = 45
        }));
        sources.Add(condusefSource);

        // CONASAMI - Salarios Mínimos
        var cosasamiSource = ScraperSource.Create(
            name: "CONASAMI - Salarios Mínimos",
            description: "Salarios mínimos, UMA, topes SBC para aportaciones SAR",
            sourceType: ScraperSourceType.CONASAMI,
            baseUrl: "https://www.gob.mx/conasami",
            frequency: ScraperFrequency.Weekly);
        cosasamiSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            data = new[] { "SalarioMinimo", "UMA", "TopesSBC" },
            salarioMinimo2025 = 278.80m,
            uma2025 = 113.14m,
            timeoutSeconds = 45
        }));
        sources.Add(cosasamiSource);

        // STPS - Secretaría del Trabajo
        var stpsSource = ScraperSource.Create(
            name: "STPS - Normativa Laboral",
            description: "Normatividad laboral que afecta aportaciones SAR",
            sourceType: ScraperSourceType.STPS,
            baseUrl: "https://www.gob.mx/stps",
            frequency: ScraperFrequency.Weekly);
        stpsSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            relevantFor = new[] { "AportacionesSAR", "RelacionesLaborales", "Despidos" },
            timeoutSeconds = 45
        }));
        sources.Add(stpsSource);

        // Ley SAR - Marco Legal
        var leySarSource = ScraperSource.Create(
            name: "Ley SAR - Marco Legal",
            description: "Ley del SAR, LSS, LISSSTE, Reglamentos y Reformas",
            sourceType: ScraperSourceType.LeySAR,
            baseUrl: "https://www.diputados.gob.mx/LeyesBiblio",
            frequency: ScraperFrequency.Weekly);
        leySarSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            laws = new[] { "LeySAR", "LeydelSeguroSocial", "LeydelISSSTE", "ReglamentoSAR" },
            timeoutSeconds = 60
        }));
        sources.Add(leySarSource);

        // SEPOMEX - Códigos Postales
        var sepomexSource = ScraperSource.Create(
            name: "SEPOMEX - Códigos Postales",
            description: "Catálogo oficial de códigos postales de México",
            sourceType: ScraperSourceType.SEPOMEX,
            baseUrl: "https://www.correosdemexico.gob.mx",
            frequency: ScraperFrequency.Weekly);
        sepomexSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            catalogUrl = "https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx",
            format = "TXT",
            totalRecords = 145000,
            timeoutSeconds = 120
        }));
        sources.Add(sepomexSource);

        // =============================================================================
        // TIER 10: COMPLEMENTARIOS
        // =============================================================================

        // ASF - Auditoría Superior de la Federación
        var asfSource = ScraperSource.Create(
            name: "ASF - Auditorías SAR",
            description: "Auditorías a CONSAR, IMSS y sistema de pensiones federal",
            sourceType: ScraperSourceType.ASF,
            baseUrl: "https://www.asf.gob.mx",
            frequency: ScraperFrequency.Weekly);
        asfSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            entitiesAudited = new[] { "CONSAR", "IMSS", "ISSSTE", "AFORE" },
            reportTypes = new[] { "CuentaPublica", "AuditoriasEspeciales" },
            timeoutSeconds = 60
        }));
        sources.Add(asfSource);

        // COFECE - Competencia Económica
        var cofeceSource = ScraperSource.Create(
            name: "COFECE - Competencia",
            description: "Concentraciones y fusiones de AFOREs, competencia en mercado",
            sourceType: ScraperSourceType.COFECE,
            baseUrl: "https://www.cofece.mx",
            frequency: ScraperFrequency.Weekly);
        cofeceSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            relevantSectors = new[] { "SistemaFinanciero", "AFOREs", "Pensiones" },
            timeoutSeconds = 45
        }));
        sources.Add(cofeceSource);

        // PRODECON - Defensa del Contribuyente
        var prodeconSource = ScraperSource.Create(
            name: "PRODECON - Criterios Fiscales",
            description: "Criterios fiscales, ISR sobre pensiones",
            sourceType: ScraperSourceType.PRODECON,
            baseUrl: "https://www.gob.mx/prodecon",
            frequency: ScraperFrequency.Weekly);
        prodeconSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            topics = new[] { "ISRPensiones", "RetirosSAR", "TratamientoFiscal" },
            timeoutSeconds = 45
        }));
        sources.Add(prodeconSource);

        // INAI - Protección de Datos
        var inaiSource = ScraperSource.Create(
            name: "INAI - Protección de Datos",
            description: "LFPDPPP, derechos ARCO, protección de datos personales",
            sourceType: ScraperSourceType.INAI,
            baseUrl: "https://home.inai.org.mx",
            frequency: ScraperFrequency.Weekly);
        inaiSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            regulations = new[] { "LFPDPPP", "DerechosARCO", "AvisosPrivacidad" },
            timeoutSeconds = 45
        }));
        sources.Add(inaiSource);

        // PROFECO - Protección al Consumidor
        var profecoSource = ScraperSource.Create(
            name: "PROFECO - Protección Consumidor",
            description: "Contratos de adhesión y publicidad de servicios financieros",
            sourceType: ScraperSourceType.PROFECO,
            baseUrl: "https://www.gob.mx/profeco",
            frequency: ScraperFrequency.Weekly);
        profecoSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            relevantFor = new[] { "ContratosAdhesion", "PublicidadFinanciera" },
            timeoutSeconds = 45
        }));
        sources.Add(profecoSource);

        // SHF - Sociedad Hipotecaria Federal
        var shfSource = ScraperSource.Create(
            name: "SHF - Hipotecas",
            description: "Cofinanciamiento con subcuenta de vivienda",
            sourceType: ScraperSourceType.SHF,
            baseUrl: "https://www.gob.mx/shf",
            frequency: ScraperFrequency.Weekly);
        shfSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            products = new[] { "Cofinanciamiento", "GarantiasHipotecarias" },
            timeoutSeconds = 45
        }));
        sources.Add(shfSource);

        // SUA - Sistema Único de Autodeterminación
        var suaSource = ScraperSource.Create(
            name: "SUA - Autodeterminación",
            description: "Cálculo de aportaciones patronales IMSS/INFONAVIT/SAR",
            sourceType: ScraperSourceType.SUA,
            baseUrl: "https://idse.imss.gob.mx",
            frequency: ScraperFrequency.Weekly);
        suaSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            calculations = new[] { "AportacionesPatronales", "CuotasObreroPatronales" },
            contributions = new[] { "IMSS", "INFONAVIT", "SAR" },
            timeoutSeconds = 45
        }));
        sources.Add(suaSource);

        // IDSE - IMSS Desde Su Empresa
        var idseSource = ScraperSource.Create(
            name: "IDSE - Trámites Patronales",
            description: "Trámites patronales digitales, movimientos afiliatorios",
            sourceType: ScraperSourceType.IDSE,
            baseUrl: "https://idse.imss.gob.mx",
            frequency: ScraperFrequency.Weekly);
        idseSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            services = new[] { "MovimientosAfiliatorios", "EmisionSUA", "Reingresos" },
            timeoutSeconds = 45
        }));
        sources.Add(idseSource);

        // Expediente Electrónico AFORE
        var expedienteSource = ScraperSource.Create(
            name: "Expediente Electrónico AFORE",
            description: "Expediente único del trabajador en el SAR",
            sourceType: ScraperSourceType.ExpedienteAfore,
            baseUrl: "https://www.e-sar.com.mx",
            frequency: ScraperFrequency.Weekly);
        expedienteSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            documents = new[] { "ExpedienteIntegrado", "Biometricos", "DocumentosIdentidad" },
            timeoutSeconds = 45
        }));
        sources.Add(expedienteSource);

        // LISIT - Lista de Instituciones
        var lisitSource = ScraperSource.Create(
            name: "LISIT - Instituciones Financieras",
            description: "Catálogo de instituciones financieras autorizadas",
            sourceType: ScraperSourceType.LISIT,
            baseUrl: "https://www.cnbv.gob.mx",
            frequency: ScraperFrequency.Weekly);
        lisitSource.SetConfiguration(System.Text.Json.JsonSerializer.Serialize(new
        {
            institutionTypes = new[] { "BancaMultiple", "Sofomes", "Sofipos", "AFOREs" },
            timeoutSeconds = 45
        }));
        sources.Add(lisitSource);

        // Log total sources
        await context.ScraperSources.AddRangeAsync(sources, cancellationToken);
    }
}
