using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Certus.Infrastructure.Data.Configurations;

public class ValidatorRuleConfiguration : IEntityTypeConfiguration<ValidatorRule>
{
    public void Configure(EntityTypeBuilder<ValidatorRule> builder)
    {
        builder.ToTable("validator_rules");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(2000);

        builder.Property(e => e.FileTypes)
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.RecordTypes)
            .HasColumnType("jsonb");

        builder.Property(e => e.Afores)
            .HasColumnType("jsonb");

        builder.Property(e => e.ConditionGroup)
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.Action)
            .HasColumnType("jsonb")
            .IsRequired();

        builder.Property(e => e.Category)
            .HasMaxLength(100);

        builder.Property(e => e.Tags)
            .HasColumnType("jsonb");

        builder.Property(e => e.RegulatoryReference)
            .HasMaxLength(500);

        builder.Property(e => e.Examples)
            .HasColumnType("jsonb");

        // Índices
        builder.HasIndex(e => e.Code).IsUnique();
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.Type);
        builder.HasIndex(e => e.Criticality);
        builder.HasIndex(e => e.Category);
        builder.HasIndex(e => e.IsEnabled);
        builder.HasIndex(e => e.RunOrder);
    }
}

public class ValidatorGroupConfiguration : IEntityTypeConfiguration<ValidatorGroup>
{
    public void Configure(EntityTypeBuilder<ValidatorGroup> builder)
    {
        builder.ToTable("validator_groups");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.Icon)
            .HasMaxLength(100);

        builder.HasIndex(e => e.Code).IsUnique();
        builder.HasIndex(e => e.SortOrder);
    }
}

public class ValidatorPresetConfiguration : IEntityTypeConfiguration<ValidatorPreset>
{
    public void Configure(EntityTypeBuilder<ValidatorPreset> builder)
    {
        builder.ToTable("validator_presets");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.ValidatorIds)
            .HasColumnType("jsonb")
            .IsRequired();

        builder.HasIndex(e => e.Code).IsUnique();
        builder.HasIndex(e => e.FileType);
        builder.HasIndex(e => e.IsDefault);
    }
}
