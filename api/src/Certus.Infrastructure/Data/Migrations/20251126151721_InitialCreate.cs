using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Certus.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AforeCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Logo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Settings = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "validator_groups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_validator_groups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "validator_presets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    FileType = table.Column<int>(type: "integer", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ValidatorIds = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_validator_presets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "validator_rules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Criticality = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FileTypes = table.Column<string>(type: "jsonb", nullable: false),
                    RecordTypes = table.Column<string>(type: "jsonb", nullable: true),
                    Afores = table.Column<string>(type: "jsonb", nullable: true),
                    ConditionGroup = table.Column<string>(type: "jsonb", nullable: false),
                    Action = table.Column<string>(type: "jsonb", nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Tags = table.Column<string>(type: "jsonb", nullable: true),
                    RegulatoryReference = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Examples = table.Column<string>(type: "jsonb", nullable: true),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    RunOrder = table.Column<int>(type: "integer", nullable: false),
                    StopOnFailure = table.Column<bool>(type: "boolean", nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    ExecutionCount = table.Column<long>(type: "bigint", nullable: false),
                    PassCount = table.Column<long>(type: "bigint", nullable: false),
                    FailCount = table.Column<long>(type: "bigint", nullable: false),
                    AverageExecutionMs = table.Column<double>(type: "double precision", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_validator_rules", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "catalogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EffectiveTo = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_catalogs_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Avatar = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Department = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Position = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EmployeeNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsEmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    IsMfaEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SessionCount = table.Column<int>(type: "integer", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "integer", nullable: false),
                    LockoutEnd = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RefreshToken = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RefreshTokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SuspensionReason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SuspendedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SuspendedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    InvitedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    InvitedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    InvitationToken = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    DeleteReason = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_users_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "catalog_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CatalogId = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    ParentKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_catalog_entries_catalogs_CatalogId",
                        column: x => x.CatalogId,
                        principalTable: "catalogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    EntityId = table.Column<Guid>(type: "uuid", nullable: true),
                    OldValues = table.Column<string>(type: "jsonb", nullable: true),
                    NewValues = table.Column<string>(type: "jsonb", nullable: true),
                    Changes = table.Column<string>(type: "jsonb", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RequestPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RequestMethod = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    StatusCode = table.Column<int>(type: "integer", nullable: true),
                    DurationMs = table.Column<long>(type: "bigint", nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CorrelationId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SessionId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Module = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SubModule = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Details = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_audit_logs_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "validations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    FileType = table.Column<int>(type: "integer", nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    FilePath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Checksum = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RecordCount = table.Column<int>(type: "integer", nullable: false),
                    ValidRecordCount = table.Column<int>(type: "integer", nullable: false),
                    ErrorCount = table.Column<int>(type: "integer", nullable: false),
                    WarningCount = table.Column<int>(type: "integer", nullable: false),
                    Progress = table.Column<int>(type: "integer", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProcessingStartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ValidatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    IsOriginal = table.Column<bool>(type: "boolean", nullable: false),
                    IsSubstitute = table.Column<bool>(type: "boolean", nullable: false),
                    ReplacesId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReplacedById = table.Column<Guid>(type: "uuid", nullable: true),
                    SubstitutionReason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    SupersededAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SupersededBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ConsarDirectory = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    RequiresAuthorization = table.Column<bool>(type: "boolean", nullable: false),
                    AuthorizationStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    AuthorizationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AuthorizationOffice = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    UploadedById = table.Column<Guid>(type: "uuid", nullable: false),
                    ReplacedByValidationId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId1 = table.Column<Guid>(type: "uuid", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    DeleteReason = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_validations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_validations_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_validations_tenants_TenantId1",
                        column: x => x.TenantId1,
                        principalTable: "tenants",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_validations_users_UploadedById",
                        column: x => x.UploadedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_validations_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_validations_validations_ReplacedByValidationId",
                        column: x => x.ReplacedByValidationId,
                        principalTable: "validations",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_validations_validations_ReplacesId",
                        column: x => x.ReplacesId,
                        principalTable: "validations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "approvals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SlaStatus = table.Column<int>(type: "integer", nullable: false),
                    RequestedById = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RequestReason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RequestNotes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    AssignedToId = table.Column<Guid>(type: "uuid", nullable: true),
                    AssignedToName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolvedById = table.Column<Guid>(type: "uuid", nullable: true),
                    ResolvedByName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    RejectionReason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ResponseTimeMinutes = table.Column<int>(type: "integer", nullable: true),
                    IsOverdue = table.Column<bool>(type: "boolean", nullable: false),
                    IsEscalated = table.Column<bool>(type: "boolean", nullable: false),
                    EscalatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EscalationReason = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    EscalatedFromId = table.Column<Guid>(type: "uuid", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Tags = table.Column<string>(type: "jsonb", nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    DeleteReason = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approvals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_approvals_approvals_EscalatedFromId",
                        column: x => x.EscalatedFromId,
                        principalTable: "approvals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_approvals_users_AssignedToId",
                        column: x => x.AssignedToId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_approvals_users_RequestedById",
                        column: x => x.RequestedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_approvals_users_ResolvedById",
                        column: x => x.ResolvedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_approvals_validations_ValidationId",
                        column: x => x.ValidationId,
                        principalTable: "validations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "timeline_events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    User = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_timeline_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_timeline_events_validations_ValidationId",
                        column: x => x.ValidationId,
                        principalTable: "validations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "validation_errors",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidatorCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ValidatorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    Suggestion = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Line = table.Column<int>(type: "integer", nullable: false),
                    Column = table.Column<int>(type: "integer", nullable: true),
                    Field = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Value = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ExpectedValue = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Reference = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsVisible = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_validation_errors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_validation_errors_validations_ValidationId",
                        column: x => x.ValidationId,
                        principalTable: "validations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "validation_warnings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidatorCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Line = table.Column<int>(type: "integer", nullable: false),
                    Column = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_validation_warnings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_validation_warnings_validations_ValidationId",
                        column: x => x.ValidationId,
                        principalTable: "validations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "validator_results",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Group = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Duration = table.Column<int>(type: "integer", nullable: false),
                    ErrorCount = table.Column<int>(type: "integer", nullable: false),
                    WarningCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_validator_results", x => x.Id);
                    table.ForeignKey(
                        name: "FK_validator_results_validations_ValidationId",
                        column: x => x.ValidationId,
                        principalTable: "validations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "approval_comments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApprovalId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    IsInternal = table.Column<bool>(type: "boolean", nullable: false),
                    Attachments = table.Column<string>(type: "jsonb", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_comments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_approval_comments_approvals_ApprovalId",
                        column: x => x.ApprovalId,
                        principalTable: "approvals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "approval_history",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApprovalId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_history", x => x.Id);
                    table.ForeignKey(
                        name: "FK_approval_history_approvals_ApprovalId",
                        column: x => x.ApprovalId,
                        principalTable: "approvals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_approval_comments_ApprovalId",
                table: "approval_comments",
                column: "ApprovalId");

            migrationBuilder.CreateIndex(
                name: "IX_approval_comments_Timestamp",
                table: "approval_comments",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_approval_history_ApprovalId",
                table: "approval_history",
                column: "ApprovalId");

            migrationBuilder.CreateIndex(
                name: "IX_approval_history_Timestamp",
                table: "approval_history",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_AssignedToId",
                table: "approvals",
                column: "AssignedToId");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_DueDate",
                table: "approvals",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_EscalatedFromId",
                table: "approvals",
                column: "EscalatedFromId");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_Level",
                table: "approvals",
                column: "Level");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_RequestedById",
                table: "approvals",
                column: "RequestedById");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_ResolvedById",
                table: "approvals",
                column: "ResolvedById");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_SlaStatus",
                table: "approvals",
                column: "SlaStatus");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_Status",
                table: "approvals",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_TenantId",
                table: "approvals",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_approvals_TenantId_Status",
                table: "approvals",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_approvals_ValidationId",
                table: "approvals",
                column: "ValidationId");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_Action",
                table: "audit_logs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_CorrelationId",
                table: "audit_logs",
                column: "CorrelationId");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_EntityId",
                table: "audit_logs",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_EntityType",
                table: "audit_logs",
                column: "EntityType");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_EntityType_EntityId",
                table: "audit_logs",
                columns: new[] { "EntityType", "EntityId" });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_TenantId",
                table: "audit_logs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_TenantId_Timestamp",
                table: "audit_logs",
                columns: new[] { "TenantId", "Timestamp" });

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_Timestamp",
                table: "audit_logs",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_UserId",
                table: "audit_logs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_entries_CatalogId",
                table: "catalog_entries",
                column: "CatalogId");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_entries_CatalogId_Key",
                table: "catalog_entries",
                columns: new[] { "CatalogId", "Key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_catalog_entries_IsActive",
                table: "catalog_entries",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_entries_ParentKey",
                table: "catalog_entries",
                column: "ParentKey");

            migrationBuilder.CreateIndex(
                name: "IX_catalogs_Code",
                table: "catalogs",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_catalogs_IsActive",
                table: "catalogs",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_catalogs_Source",
                table: "catalogs",
                column: "Source");

            migrationBuilder.CreateIndex(
                name: "IX_catalogs_TenantId",
                table: "catalogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_tenants_AforeCode",
                table: "tenants",
                column: "AforeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_tenants_IsActive",
                table: "tenants",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_timeline_events_Timestamp",
                table: "timeline_events",
                column: "Timestamp");

            migrationBuilder.CreateIndex(
                name: "IX_timeline_events_ValidationId",
                table: "timeline_events",
                column: "ValidationId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_Role",
                table: "users",
                column: "Role");

            migrationBuilder.CreateIndex(
                name: "IX_users_Status",
                table: "users",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_users_TenantId",
                table: "users",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_users_TenantId_EmployeeNumber",
                table: "users",
                columns: new[] { "TenantId", "EmployeeNumber" },
                unique: true,
                filter: "\"EmployeeNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_validation_errors_Severity",
                table: "validation_errors",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_validation_errors_ValidationId",
                table: "validation_errors",
                column: "ValidationId");

            migrationBuilder.CreateIndex(
                name: "IX_validation_errors_ValidatorCode",
                table: "validation_errors",
                column: "ValidatorCode");

            migrationBuilder.CreateIndex(
                name: "IX_validation_warnings_ValidationId",
                table: "validation_warnings",
                column: "ValidationId");

            migrationBuilder.CreateIndex(
                name: "IX_validations_FileType",
                table: "validations",
                column: "FileType");

            migrationBuilder.CreateIndex(
                name: "IX_validations_ReplacedByValidationId",
                table: "validations",
                column: "ReplacedByValidationId");

            migrationBuilder.CreateIndex(
                name: "IX_validations_ReplacesId",
                table: "validations",
                column: "ReplacesId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_validations_Status",
                table: "validations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_validations_TenantId",
                table: "validations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_validations_TenantId_Status",
                table: "validations",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_validations_TenantId_UploadedAt",
                table: "validations",
                columns: new[] { "TenantId", "UploadedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_validations_TenantId1",
                table: "validations",
                column: "TenantId1");

            migrationBuilder.CreateIndex(
                name: "IX_validations_UploadedAt",
                table: "validations",
                column: "UploadedAt");

            migrationBuilder.CreateIndex(
                name: "IX_validations_UploadedById",
                table: "validations",
                column: "UploadedById");

            migrationBuilder.CreateIndex(
                name: "IX_validations_UserId",
                table: "validations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_validator_groups_Code",
                table: "validator_groups",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_validator_groups_SortOrder",
                table: "validator_groups",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_validator_presets_Code",
                table: "validator_presets",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_validator_presets_FileType",
                table: "validator_presets",
                column: "FileType");

            migrationBuilder.CreateIndex(
                name: "IX_validator_presets_IsDefault",
                table: "validator_presets",
                column: "IsDefault");

            migrationBuilder.CreateIndex(
                name: "IX_validator_results_ValidationId",
                table: "validator_results",
                column: "ValidationId");

            migrationBuilder.CreateIndex(
                name: "IX_validator_rules_Category",
                table: "validator_rules",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_validator_rules_Code",
                table: "validator_rules",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_validator_rules_Criticality",
                table: "validator_rules",
                column: "Criticality");

            migrationBuilder.CreateIndex(
                name: "IX_validator_rules_IsEnabled",
                table: "validator_rules",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_validator_rules_RunOrder",
                table: "validator_rules",
                column: "RunOrder");

            migrationBuilder.CreateIndex(
                name: "IX_validator_rules_Status",
                table: "validator_rules",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_validator_rules_Type",
                table: "validator_rules",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "approval_comments");

            migrationBuilder.DropTable(
                name: "approval_history");

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "catalog_entries");

            migrationBuilder.DropTable(
                name: "timeline_events");

            migrationBuilder.DropTable(
                name: "validation_errors");

            migrationBuilder.DropTable(
                name: "validation_warnings");

            migrationBuilder.DropTable(
                name: "validator_groups");

            migrationBuilder.DropTable(
                name: "validator_presets");

            migrationBuilder.DropTable(
                name: "validator_results");

            migrationBuilder.DropTable(
                name: "validator_rules");

            migrationBuilder.DropTable(
                name: "approvals");

            migrationBuilder.DropTable(
                name: "catalogs");

            migrationBuilder.DropTable(
                name: "validations");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "tenants");
        }
    }
}
