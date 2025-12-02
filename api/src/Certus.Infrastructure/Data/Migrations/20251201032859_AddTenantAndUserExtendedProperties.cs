using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Certus.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantAndUserExtendedProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_tenants_IsActive",
                table: "tenants");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "tenants",
                newName: "RequireApproval");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastPasswordChange",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MfaMethod",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SessionTimeout",
                table: "users",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notification_settings",
                table: "users",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "preferences",
                table: "users",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Settings",
                table: "tenants",
                type: "jsonb",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "jsonb");

            migrationBuilder.AlterColumn<string>(
                name: "AforeCode",
                table: "tenants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "tenants",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AutoProcessValidations",
                table: "tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "tenants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactEmail",
                table: "tenants",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "tenants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DefaultValidationFlow",
                table: "tenants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeleteReason",
                table: "tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "tenants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeletedBy",
                table: "tenants",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LicenseExpiresAt",
                table: "tenants",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxUsers",
                table: "tenants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "tenants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PrimaryColor",
                table: "tenants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SecondaryColor",
                table: "tenants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "tenants",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "tenants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TaxId",
                table: "tenants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "tenants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "approval_workflows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    DefaultSlaHours = table.Column<int>(type: "integer", nullable: false),
                    EscalationSlaHours = table.Column<int>(type: "integer", nullable: false),
                    AllowEscalation = table.Column<bool>(type: "boolean", nullable: false),
                    AllowParallelApproval = table.Column<bool>(type: "boolean", nullable: false),
                    RequireCommentsOnReject = table.Column<bool>(type: "boolean", nullable: false),
                    AutoAssignToRole = table.Column<bool>(type: "boolean", nullable: false),
                    RejectionBehavior = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TimeoutBehavior = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    FileTypeFilters = table.Column<string>(type: "jsonb", nullable: true),
                    TriggerConditions = table.Column<string>(type: "jsonb", nullable: true),
                    NotificationSettings = table.Column<string>(type: "jsonb", nullable: true),
                    Tags = table.Column<string>(type: "jsonb", nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    TotalExecutions = table.Column<int>(type: "integer", nullable: false),
                    SuccessfulExecutions = table.Column<int>(type: "integer", nullable: false),
                    AverageCompletionTimeHours = table.Column<double>(type: "double precision", nullable: false),
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
                    table.PrimaryKey("PK_approval_workflows", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserInvitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    InvitedById = table.Column<Guid>(type: "uuid", nullable: false),
                    AcceptedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AcceptedUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ResendCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserInvitations_tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserInvitations_users_AcceptedUserId",
                        column: x => x.AcceptedUserId,
                        principalTable: "users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserInvitations_users_InvitedById",
                        column: x => x.InvitedById,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "approval_matrix_entries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    Level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RequiredRole = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    MinApprovers = table.Column<int>(type: "integer", nullable: true),
                    CanEscalate = table.Column<bool>(type: "boolean", nullable: false),
                    CanDelegate = table.Column<bool>(type: "boolean", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    MaxErrorCount = table.Column<int>(type: "integer", nullable: true),
                    MaxAmount = table.Column<decimal>(type: "numeric", nullable: true),
                    SpecificUserIds = table.Column<string>(type: "jsonb", nullable: true),
                    DelegateUserIds = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_matrix_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_approval_matrix_entries_approval_workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "approval_workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "approval_workflow_rules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ConditionType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Operator = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ConditionValue = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LogicalGroup = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UseAndOperator = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_workflow_rules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_approval_workflow_rules_approval_workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "approval_workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "approval_workflow_steps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkflowId = table.Column<Guid>(type: "uuid", nullable: false),
                    Sequence = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Action = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    TimeoutHours = table.Column<int>(type: "integer", nullable: false),
                    CanSkip = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresComment = table.Column<bool>(type: "boolean", nullable: false),
                    NotifyOnEntry = table.Column<bool>(type: "boolean", nullable: false),
                    NotifyOnExit = table.Column<bool>(type: "boolean", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SkipConditions = table.Column<string>(type: "jsonb", nullable: true),
                    AssignedUserIds = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_approval_workflow_steps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_approval_workflow_steps_approval_workflows_WorkflowId",
                        column: x => x.WorkflowId,
                        principalTable: "approval_workflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_tenants_Status",
                table: "tenants",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_approval_matrix_entries_Level",
                table: "approval_matrix_entries",
                column: "Level");

            migrationBuilder.CreateIndex(
                name: "IX_approval_matrix_entries_RequiredRole",
                table: "approval_matrix_entries",
                column: "RequiredRole");

            migrationBuilder.CreateIndex(
                name: "IX_approval_matrix_entries_WorkflowId",
                table: "approval_matrix_entries",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_approval_matrix_entries_WorkflowId_Level_RequiredRole",
                table: "approval_matrix_entries",
                columns: new[] { "WorkflowId", "Level", "RequiredRole" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflow_rules_ConditionType",
                table: "approval_workflow_rules",
                column: "ConditionType");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflow_rules_Priority",
                table: "approval_workflow_rules",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflow_rules_WorkflowId",
                table: "approval_workflow_rules",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflow_rules_WorkflowId_Priority",
                table: "approval_workflow_rules",
                columns: new[] { "WorkflowId", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflow_steps_Level",
                table: "approval_workflow_steps",
                column: "Level");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflow_steps_Sequence",
                table: "approval_workflow_steps",
                column: "Sequence");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflow_steps_WorkflowId",
                table: "approval_workflow_steps",
                column: "WorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflow_steps_WorkflowId_Sequence",
                table: "approval_workflow_steps",
                columns: new[] { "WorkflowId", "Sequence" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflows_Code",
                table: "approval_workflows",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflows_Status",
                table: "approval_workflows",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflows_TenantId",
                table: "approval_workflows",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflows_TenantId_Code",
                table: "approval_workflows",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_approval_workflows_TenantId_Status",
                table: "approval_workflows",
                columns: new[] { "TenantId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_UserInvitations_AcceptedUserId",
                table: "UserInvitations",
                column: "AcceptedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserInvitations_InvitedById",
                table: "UserInvitations",
                column: "InvitedById");

            migrationBuilder.CreateIndex(
                name: "IX_UserInvitations_TenantId",
                table: "UserInvitations",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "approval_matrix_entries");

            migrationBuilder.DropTable(
                name: "approval_workflow_rules");

            migrationBuilder.DropTable(
                name: "approval_workflow_steps");

            migrationBuilder.DropTable(
                name: "UserInvitations");

            migrationBuilder.DropTable(
                name: "approval_workflows");

            migrationBuilder.DropIndex(
                name: "IX_tenants_Status",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "LastPasswordChange",
                table: "users");

            migrationBuilder.DropColumn(
                name: "MfaMethod",
                table: "users");

            migrationBuilder.DropColumn(
                name: "SessionTimeout",
                table: "users");

            migrationBuilder.DropColumn(
                name: "notification_settings",
                table: "users");

            migrationBuilder.DropColumn(
                name: "preferences",
                table: "users");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "AutoProcessValidations",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "City",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "ContactEmail",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "DefaultValidationFlow",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "DeleteReason",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "DeletedBy",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "LicenseExpiresAt",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "MaxUsers",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "PrimaryColor",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "SecondaryColor",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "State",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "TaxId",
                table: "tenants");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "tenants");

            migrationBuilder.RenameColumn(
                name: "RequireApproval",
                table: "tenants",
                newName: "IsActive");

            migrationBuilder.AlterColumn<string>(
                name: "Settings",
                table: "tenants",
                type: "jsonb",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "jsonb",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AforeCode",
                table: "tenants",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_tenants_IsActive",
                table: "tenants",
                column: "IsActive");
        }
    }
}
