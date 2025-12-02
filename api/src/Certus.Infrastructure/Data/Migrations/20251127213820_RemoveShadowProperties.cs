using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Certus.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveShadowProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_validations_users_UserId",
                table: "validations");

            migrationBuilder.DropForeignKey(
                name: "FK_validations_validations_ReplacedByValidationId",
                table: "validations");

            migrationBuilder.DropIndex(
                name: "IX_validations_ReplacedByValidationId",
                table: "validations");

            migrationBuilder.DropIndex(
                name: "IX_validations_UserId",
                table: "validations");

            migrationBuilder.DropColumn(
                name: "ReplacedByValidationId",
                table: "validations");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "validations");

            migrationBuilder.CreateIndex(
                name: "IX_validations_ReplacedById",
                table: "validations",
                column: "ReplacedById");

            migrationBuilder.AddForeignKey(
                name: "FK_validations_validations_ReplacedById",
                table: "validations",
                column: "ReplacedById",
                principalTable: "validations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_validations_validations_ReplacedById",
                table: "validations");

            migrationBuilder.DropIndex(
                name: "IX_validations_ReplacedById",
                table: "validations");

            migrationBuilder.AddColumn<Guid>(
                name: "ReplacedByValidationId",
                table: "validations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "validations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_validations_ReplacedByValidationId",
                table: "validations",
                column: "ReplacedByValidationId");

            migrationBuilder.CreateIndex(
                name: "IX_validations_UserId",
                table: "validations",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_validations_users_UserId",
                table: "validations",
                column: "UserId",
                principalTable: "users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_validations_validations_ReplacedByValidationId",
                table: "validations",
                column: "ReplacedByValidationId",
                principalTable: "validations",
                principalColumn: "Id");
        }
    }
}
