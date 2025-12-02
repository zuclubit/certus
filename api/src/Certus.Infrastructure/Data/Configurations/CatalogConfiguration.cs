using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Certus.Infrastructure.Data.Configurations;

public class CatalogConfiguration : IEntityTypeConfiguration<Catalog>
{
    public void Configure(EntityTypeBuilder<Catalog> builder)
    {
        builder.ToTable("catalogs");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.Version)
            .HasMaxLength(20);

        builder.Property(e => e.Source)
            .HasMaxLength(50);

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        builder.HasIndex(e => e.Code).IsUnique();
        builder.HasIndex(e => e.IsActive);
        builder.HasIndex(e => e.Source);

        builder.HasMany(e => e.Entries)
            .WithOne(e => e.Catalog)
            .HasForeignKey(e => e.CatalogId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class CatalogEntryConfiguration : IEntityTypeConfiguration<CatalogEntry>
{
    public void Configure(EntityTypeBuilder<CatalogEntry> builder)
    {
        builder.ToTable("catalog_entries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Key)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Value)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.DisplayName)
            .HasMaxLength(500);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.ParentKey)
            .HasMaxLength(100);

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        builder.HasIndex(e => e.CatalogId);
        builder.HasIndex(e => new { e.CatalogId, e.Key }).IsUnique();
        builder.HasIndex(e => e.IsActive);
        builder.HasIndex(e => e.ParentKey);
    }
}
