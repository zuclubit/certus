using System.Text.Json;
using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Certus.Infrastructure.Data.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("tenants");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.AforeCode)
            .HasMaxLength(20);

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Logo)
            .HasMaxLength(500);

        builder.Property(e => e.Settings)
            .HasColumnType("jsonb");

        // Contact information
        builder.Property(e => e.ContactEmail).HasMaxLength(200);
        builder.Property(e => e.ContactPhone).HasMaxLength(50);
        builder.Property(e => e.Address).HasMaxLength(500);
        builder.Property(e => e.City).HasMaxLength(100);
        builder.Property(e => e.State).HasMaxLength(100);
        builder.Property(e => e.PostalCode).HasMaxLength(20);
        builder.Property(e => e.TaxId).HasMaxLength(50);

        // Branding
        builder.Property(e => e.PrimaryColor).HasMaxLength(20);
        builder.Property(e => e.SecondaryColor).HasMaxLength(20);

        // Validation settings
        builder.Property(e => e.DefaultValidationFlow).HasMaxLength(100);

        // Computed properties - ignore from EF mapping
        builder.Ignore(e => e.IsActive);
        builder.Ignore(e => e.IsLicenseExpired);

        builder.HasIndex(e => e.AforeCode).IsUnique();
        builder.HasIndex(e => e.Status);
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Email)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.PasswordHash)
            .HasMaxLength(500);

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.EmployeeNumber)
            .HasMaxLength(50);

        builder.Property(e => e.Position)
            .HasMaxLength(200);

        builder.Property(e => e.Department)
            .HasMaxLength(200);

        builder.Property(e => e.Phone)
            .HasMaxLength(20);

        builder.Property(e => e.Avatar)
            .HasMaxLength(500);

        builder.Property(e => e.RefreshToken)
            .HasMaxLength(500);

        builder.Property(e => e.SuspensionReason)
            .HasMaxLength(1000);

        builder.Property(e => e.SuspendedBy)
            .HasMaxLength(200);

        builder.Property(e => e.InvitedBy)
            .HasMaxLength(200);

        builder.Property(e => e.InvitationToken)
            .HasMaxLength(100);

        // Índices
        builder.HasIndex(e => e.Email).IsUnique();
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => e.Role);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => new { e.TenantId, e.EmployeeNumber }).IsUnique()
            .HasFilter("\"EmployeeNumber\" IS NOT NULL");

        // JSON columns for complex types with proper conversion
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        builder.Property(e => e.Preferences)
            .HasColumnType("jsonb")
            .HasColumnName("preferences")
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                v => v == null ? null : JsonSerializer.Deserialize<UserPreferences>(v, jsonOptions),
                new ValueComparer<UserPreferences?>(
                    (c1, c2) => JsonSerializer.Serialize(c1, jsonOptions) == JsonSerializer.Serialize(c2, jsonOptions),
                    c => c == null ? 0 : JsonSerializer.Serialize(c, jsonOptions).GetHashCode(),
                    c => c == null ? null : JsonSerializer.Deserialize<UserPreferences>(JsonSerializer.Serialize(c, jsonOptions), jsonOptions)));

        builder.Property(e => e.NotificationSettings)
            .HasColumnType("jsonb")
            .HasColumnName("notification_settings")
            .HasConversion(
                v => v == null ? null : JsonSerializer.Serialize(v, jsonOptions),
                v => v == null ? null : JsonSerializer.Deserialize<NotificationSettingsDto>(v, jsonOptions),
                new ValueComparer<NotificationSettingsDto?>(
                    (c1, c2) => JsonSerializer.Serialize(c1, jsonOptions) == JsonSerializer.Serialize(c2, jsonOptions),
                    c => c == null ? 0 : JsonSerializer.Serialize(c, jsonOptions).GetHashCode(),
                    c => c == null ? null : JsonSerializer.Deserialize<NotificationSettingsDto>(JsonSerializer.Serialize(c, jsonOptions), jsonOptions)));

        // MFA settings
        builder.Property(e => e.MfaMethod)
            .HasMaxLength(50);

        // Relaciones
        builder.HasOne(e => e.Tenant)
            .WithMany(t => t.Users)
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
