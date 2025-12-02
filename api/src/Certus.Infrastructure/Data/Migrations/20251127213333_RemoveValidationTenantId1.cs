using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Certus.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveValidationTenantId1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_validations_tenants_TenantId",
                table: "validations");

            migrationBuilder.DropForeignKey(
                name: "FK_validations_tenants_TenantId1",
                table: "validations");

            migrationBuilder.DropIndex(
                name: "IX_validations_TenantId1",
                table: "validations");

            migrationBuilder.DropColumn(
                name: "TenantId1",
                table: "validations");

            migrationBuilder.AddForeignKey(
                name: "FK_validations_tenants_TenantId",
                table: "validations",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_validations_tenants_TenantId",
                table: "validations");

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId1",
                table: "validations",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_validations_TenantId1",
                table: "validations",
                column: "TenantId1");

            migrationBuilder.AddForeignKey(
                name: "FK_validations_tenants_TenantId",
                table: "validations",
                column: "TenantId",
                principalTable: "tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_validations_tenants_TenantId1",
                table: "validations",
                column: "TenantId1",
                principalTable: "tenants",
                principalColumn: "Id");
        }
    }
}
