using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Certus.Infrastructure.Data.Configurations;

public class ScraperSourceConfiguration : IEntityTypeConfiguration<ScraperSource>
{
    public void Configure(EntityTypeBuilder<ScraperSource> builder)
    {
        builder.ToTable("scraper_sources");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.BaseUrl)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.EndpointPath)
            .HasMaxLength(500);

        builder.Property(e => e.Configuration)
            .HasColumnType("jsonb");

        builder.Property(e => e.LastError)
            .HasMaxLength(2000);

        // Índices
        builder.HasIndex(e => e.Name).IsUnique();
        builder.HasIndex(e => e.SourceType);
        builder.HasIndex(e => e.IsEnabled);
        builder.HasIndex(e => e.NextScheduledAt);
        builder.HasIndex(e => e.IsDeleted);
    }
}

public class ScraperExecutionConfiguration : IEntityTypeConfiguration<ScraperExecution>
{
    public void Configure(EntityTypeBuilder<ScraperExecution> builder)
    {
        builder.ToTable("scraper_executions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(e => e.ErrorStackTrace)
            .HasMaxLength(10000);

        builder.Property(e => e.ExecutionLog)
            .HasColumnType("text");

        builder.Property(e => e.TriggeredBy)
            .HasMaxLength(100);

        // Relaciones
        builder.HasOne(e => e.Source)
            .WithMany(s => s.Executions)
            .HasForeignKey(e => e.SourceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Índices
        builder.HasIndex(e => e.SourceId);
        builder.HasIndex(e => e.StartedAt);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => new { e.SourceId, e.StartedAt });
    }
}

public class ScrapedDocumentConfiguration : IEntityTypeConfiguration<ScrapedDocument>
{
    public void Configure(EntityTypeBuilder<ScrapedDocument> builder)
    {
        builder.ToTable("scraped_documents");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ExternalId)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Title)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(5000);

        builder.Property(e => e.Code)
            .HasMaxLength(100);

        builder.Property(e => e.Category)
            .HasMaxLength(200);

        builder.Property(e => e.DocumentUrl)
            .HasMaxLength(2000);

        builder.Property(e => e.PdfUrl)
            .HasMaxLength(2000);

        builder.Property(e => e.RawHtml)
            .HasColumnType("text");

        builder.Property(e => e.ExtractedText)
            .HasColumnType("text");

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        builder.Property(e => e.ProcessingError)
            .HasMaxLength(2000);

        builder.Property(e => e.ProcessedBy)
            .HasMaxLength(100);

        builder.Property(e => e.Hash)
            .HasMaxLength(64);

        // Relaciones
        builder.HasOne(e => e.Execution)
            .WithMany(x => x.Documents)
            .HasForeignKey(e => e.ExecutionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Source)
            .WithMany()
            .HasForeignKey(e => e.SourceId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.NormativeChange)
            .WithMany()
            .HasForeignKey(e => e.NormativeChangeId)
            .OnDelete(DeleteBehavior.SetNull);

        // Índices
        builder.HasIndex(e => e.ExecutionId);
        builder.HasIndex(e => e.SourceId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.Hash);
        builder.HasIndex(e => e.Code);
        builder.HasIndex(e => new { e.SourceId, e.ExternalId }).IsUnique();
        builder.HasIndex(e => new { e.Status, e.CreatedAt });
    }
}
