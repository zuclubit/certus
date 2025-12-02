using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Certus.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Action)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.EntityType)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.OldValues)
            .HasColumnType("jsonb");

        builder.Property(e => e.NewValues)
            .HasColumnType("jsonb");

        builder.Property(e => e.Changes)
            .HasColumnType("jsonb");

        builder.Property(e => e.IpAddress)
            .HasMaxLength(50);

        builder.Property(e => e.UserAgent)
            .HasMaxLength(500);

        builder.Property(e => e.RequestPath)
            .HasMaxLength(500);

        builder.Property(e => e.RequestMethod)
            .HasMaxLength(10);

        builder.Property(e => e.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(e => e.CorrelationId)
            .HasMaxLength(100);

        builder.Property(e => e.SessionId)
            .HasMaxLength(100);

        builder.Property(e => e.Module)
            .HasMaxLength(100);

        builder.Property(e => e.SubModule)
            .HasMaxLength(100);

        builder.Property(e => e.Details)
            .HasMaxLength(4000);

        // Índices para consultas frecuentes
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.Action);
        builder.HasIndex(e => e.EntityType);
        builder.HasIndex(e => e.EntityId);
        builder.HasIndex(e => e.Timestamp);
        builder.HasIndex(e => e.CorrelationId);
        builder.HasIndex(e => new { e.TenantId, e.Timestamp });
        builder.HasIndex(e => new { e.EntityType, e.EntityId });
    }
}
