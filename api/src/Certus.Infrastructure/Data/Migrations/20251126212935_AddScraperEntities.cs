using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Certus.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddScraperEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "scraper_sources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    SourceType = table.Column<int>(type: "integer", nullable: false),
                    BaseUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    EndpointPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Frequency = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    Configuration = table.Column<string>(type: "jsonb", nullable: true),
                    LastExecutionAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ConsecutiveFailures = table.Column<int>(type: "integer", nullable: false),
                    TotalExecutions = table.Column<int>(type: "integer", nullable: false),
                    TotalDocumentsFound = table.Column<int>(type: "integer", nullable: false),
                    LastError = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeletedBy = table.Column<string>(type: "text", nullable: true),
                    DeleteReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scraper_sources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "scraper_executions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DocumentsFound = table.Column<int>(type: "integer", nullable: false),
                    DocumentsNew = table.Column<int>(type: "integer", nullable: false),
                    DocumentsDuplicate = table.Column<int>(type: "integer", nullable: false),
                    DocumentsError = table.Column<int>(type: "integer", nullable: false),
                    DurationMs = table.Column<long>(type: "bigint", nullable: false),
                    ErrorMessage = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ErrorStackTrace = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: true),
                    ExecutionLog = table.Column<string>(type: "text", nullable: true),
                    TriggeredBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scraper_executions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_scraper_executions_scraper_sources_SourceId",
                        column: x => x.SourceId,
                        principalTable: "scraper_sources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "scraped_documents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExecutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Description = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PublishDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EffectiveDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Category = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DocumentUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PdfUrl = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    RawHtml = table.Column<string>(type: "text", nullable: true),
                    ExtractedText = table.Column<string>(type: "text", nullable: true),
                    Metadata = table.Column<string>(type: "jsonb", nullable: true),
                    NormativeChangeId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProcessingError = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ProcessedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scraped_documents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_scraped_documents_NormativeChanges_NormativeChangeId",
                        column: x => x.NormativeChangeId,
                        principalTable: "NormativeChanges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_scraped_documents_scraper_executions_ExecutionId",
                        column: x => x.ExecutionId,
                        principalTable: "scraper_executions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_scraped_documents_scraper_sources_SourceId",
                        column: x => x.SourceId,
                        principalTable: "scraper_sources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_scraped_documents_Code",
                table: "scraped_documents",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_scraped_documents_ExecutionId",
                table: "scraped_documents",
                column: "ExecutionId");

            migrationBuilder.CreateIndex(
                name: "IX_scraped_documents_Hash",
                table: "scraped_documents",
                column: "Hash");

            migrationBuilder.CreateIndex(
                name: "IX_scraped_documents_NormativeChangeId",
                table: "scraped_documents",
                column: "NormativeChangeId");

            migrationBuilder.CreateIndex(
                name: "IX_scraped_documents_SourceId",
                table: "scraped_documents",
                column: "SourceId");

            migrationBuilder.CreateIndex(
                name: "IX_scraped_documents_SourceId_ExternalId",
                table: "scraped_documents",
                columns: new[] { "SourceId", "ExternalId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_scraped_documents_Status",
                table: "scraped_documents",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_scraped_documents_Status_CreatedAt",
                table: "scraped_documents",
                columns: new[] { "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_scraper_executions_SourceId",
                table: "scraper_executions",
                column: "SourceId");

            migrationBuilder.CreateIndex(
                name: "IX_scraper_executions_SourceId_StartedAt",
                table: "scraper_executions",
                columns: new[] { "SourceId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_scraper_executions_StartedAt",
                table: "scraper_executions",
                column: "StartedAt");

            migrationBuilder.CreateIndex(
                name: "IX_scraper_executions_Status",
                table: "scraper_executions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_scraper_sources_IsDeleted",
                table: "scraper_sources",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_scraper_sources_IsEnabled",
                table: "scraper_sources",
                column: "IsEnabled");

            migrationBuilder.CreateIndex(
                name: "IX_scraper_sources_Name",
                table: "scraper_sources",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_scraper_sources_NextScheduledAt",
                table: "scraper_sources",
                column: "NextScheduledAt");

            migrationBuilder.CreateIndex(
                name: "IX_scraper_sources_SourceType",
                table: "scraper_sources",
                column: "SourceType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "scraped_documents");

            migrationBuilder.DropTable(
                name: "scraper_executions");

            migrationBuilder.DropTable(
                name: "scraper_sources");
        }
    }
}
