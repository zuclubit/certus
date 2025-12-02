using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Certus.Infrastructure.Data.Configurations;

public class ValidationConfiguration : IEntityTypeConfiguration<Validation>
{
    public void Configure(EntityTypeBuilder<Validation> builder)
    {
        builder.ToTable("validations");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.FileName)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.FilePath)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(e => e.MimeType)
            .HasMaxLength(100);

        builder.Property(e => e.Checksum)
            .HasMaxLength(128);

        builder.Property(e => e.ConsarDirectory)
            .HasMaxLength(50);

        builder.Property(e => e.AuthorizationStatus)
            .HasMaxLength(50);

        builder.Property(e => e.AuthorizationOffice)
            .HasMaxLength(200);

        builder.Property(e => e.SubstitutionReason)
            .HasMaxLength(2000);

        builder.Property(e => e.SupersededBy)
            .HasMaxLength(200);

        // Índices
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.FileType);
        builder.HasIndex(e => e.UploadedAt);
        builder.HasIndex(e => e.UploadedById);
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.UploadedAt });

        // Relaciones
        // Importante: Especificar WithMany(u => u.Validations) para evitar que EF Core
        // cree una propiedad shadow "UserId" adicional
        builder.HasOne(e => e.UploadedBy)
            .WithMany(u => u.Validations)
            .HasForeignKey(e => e.UploadedById)
            .OnDelete(DeleteBehavior.Restrict);

        // La relación con Tenant no se configura - usamos solo TenantId de la clase base TenantEntity
        // para evitar la creación de una propiedad sombra TenantId1

        // Relación de versiones (retransmisión CONSAR)
        // ReplacesValidation: Esta validación reemplaza a otra (ReplacesId es el FK)
        builder.HasOne(e => e.ReplacesValidation)
            .WithOne()
            .HasForeignKey<Validation>(e => e.ReplacesId)
            .OnDelete(DeleteBehavior.SetNull);

        // ReplacedByValidation: Esta validación fue reemplazada por otra (ReplacedById es el FK)
        builder.HasOne(e => e.ReplacedByValidation)
            .WithMany()
            .HasForeignKey(e => e.ReplacedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(e => e.Errors)
            .WithOne(e => e.Validation)
            .HasForeignKey(e => e.ValidationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Warnings)
            .WithOne(e => e.Validation)
            .HasForeignKey(e => e.ValidationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.ValidatorResults)
            .WithOne(e => e.Validation)
            .HasForeignKey(e => e.ValidationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Timeline)
            .WithOne(e => e.Validation)
            .HasForeignKey(e => e.ValidationId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ValidationErrorConfiguration : IEntityTypeConfiguration<ValidationError>
{
    public void Configure(EntityTypeBuilder<ValidationError> builder)
    {
        builder.ToTable("validation_errors");

        builder.HasKey(e => e.Id);

        // IMPORTANTE: Indicar que el Id es generado por el cliente (Guid.NewGuid() en BaseEntity)
        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.Property(e => e.ValidatorCode)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.ValidatorName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Message)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(4000);

        builder.Property(e => e.Suggestion)
            .HasMaxLength(2000);

        builder.Property(e => e.Field)
            .HasMaxLength(200);

        builder.Property(e => e.Value)
            .HasMaxLength(1000);

        builder.Property(e => e.ExpectedValue)
            .HasMaxLength(1000);

        builder.Property(e => e.Reference)
            .HasMaxLength(500);

        builder.HasIndex(e => e.ValidationId);
        builder.HasIndex(e => e.ValidatorCode);
        builder.HasIndex(e => e.Severity);
    }
}

public class ValidationWarningConfiguration : IEntityTypeConfiguration<ValidationWarning>
{
    public void Configure(EntityTypeBuilder<ValidationWarning> builder)
    {
        builder.ToTable("validation_warnings");

        builder.HasKey(e => e.Id);

        // IMPORTANTE: Indicar que el Id es generado por el cliente (Guid.NewGuid() en BaseEntity)
        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.Property(e => e.ValidatorCode)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Message)
            .HasMaxLength(2000)
            .IsRequired();

        builder.HasIndex(e => e.ValidationId);
    }
}

public class ValidatorResultConfiguration : IEntityTypeConfiguration<ValidatorResult>
{
    public void Configure(EntityTypeBuilder<ValidatorResult> builder)
    {
        builder.ToTable("validator_results");

        builder.HasKey(e => e.Id);

        // IMPORTANTE: Indicar que el Id es generado por el cliente (Guid.NewGuid() en BaseEntity)
        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.Property(e => e.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Group)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(e => e.ValidationId);
    }
}

public class TimelineEventConfiguration : IEntityTypeConfiguration<TimelineEvent>
{
    public void Configure(EntityTypeBuilder<TimelineEvent> builder)
    {
        builder.ToTable("timeline_events");

        builder.HasKey(e => e.Id);

        // IMPORTANTE: Indicar que el Id es generado por el cliente (Guid.NewGuid() en BaseEntity)
        // Sin esto, EF Core puede confundir entidades nuevas con existentes
        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.Property(e => e.Type)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Message)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(e => e.User)
            .HasMaxLength(200);

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        builder.HasIndex(e => e.ValidationId);
        builder.HasIndex(e => e.Timestamp);
    }
}
