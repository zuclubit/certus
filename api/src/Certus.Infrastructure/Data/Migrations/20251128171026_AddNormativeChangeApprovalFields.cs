using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Certus.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNormativeChangeApprovalFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "NotificationSent",
                table: "NormativeChanges",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "NotificationSentAt",
                table: "NormativeChanges",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "NormativeChanges",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewNotes",
                table: "NormativeChanges",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReviewStatus",
                table: "NormativeChanges",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedAt",
                table: "NormativeChanges",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ReviewedById",
                table: "NormativeChanges",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewedByName",
                table: "NormativeChanges",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ScrapedDocumentId",
                table: "NormativeChanges",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Source",
                table: "NormativeChanges",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotificationSent",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "NotificationSentAt",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "ReviewNotes",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "ReviewStatus",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "ReviewedById",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "ReviewedByName",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "ScrapedDocumentId",
                table: "NormativeChanges");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "NormativeChanges");
        }
    }
}
