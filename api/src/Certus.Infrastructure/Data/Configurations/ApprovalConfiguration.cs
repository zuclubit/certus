using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Certus.Infrastructure.Data.Configurations;

public class ApprovalConfiguration : IEntityTypeConfiguration<Approval>
{
    public void Configure(EntityTypeBuilder<Approval> builder)
    {
        builder.ToTable("approvals");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.RequestedByName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.AssignedToName)
            .HasMaxLength(200);

        builder.Property(e => e.ResolvedByName)
            .HasMaxLength(200);

        builder.Property(e => e.RequestReason)
            .HasMaxLength(2000);

        builder.Property(e => e.RequestNotes)
            .HasMaxLength(4000);

        builder.Property(e => e.ResolutionNotes)
            .HasMaxLength(4000);

        builder.Property(e => e.RejectionReason)
            .HasMaxLength(2000);

        builder.Property(e => e.EscalationReason)
            .HasMaxLength(2000);

        builder.Property(e => e.Category)
            .HasMaxLength(100);

        builder.Property(e => e.Tags)
            .HasColumnType("jsonb");

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        // Índices
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => e.ValidationId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.Level);
        builder.HasIndex(e => e.AssignedToId);
        builder.HasIndex(e => e.RequestedById);
        builder.HasIndex(e => e.DueDate);
        builder.HasIndex(e => e.SlaStatus);
        builder.HasIndex(e => new { e.TenantId, e.Status });

        // Relaciones
        builder.HasOne(e => e.Validation)
            .WithMany()
            .HasForeignKey(e => e.ValidationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.RequestedBy)
            .WithMany()
            .HasForeignKey(e => e.RequestedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.AssignedTo)
            .WithMany()
            .HasForeignKey(e => e.AssignedToId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.ResolvedBy)
            .WithMany()
            .HasForeignKey(e => e.ResolvedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.EscalatedFrom)
            .WithMany()
            .HasForeignKey(e => e.EscalatedFromId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(e => e.Comments)
            .WithOne(e => e.Approval)
            .HasForeignKey(e => e.ApprovalId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.History)
            .WithOne(e => e.Approval)
            .HasForeignKey(e => e.ApprovalId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ApprovalCommentConfiguration : IEntityTypeConfiguration<ApprovalComment>
{
    public void Configure(EntityTypeBuilder<ApprovalComment> builder)
    {
        builder.ToTable("approval_comments");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.UserName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Content)
            .HasMaxLength(4000)
            .IsRequired();

        builder.Property(e => e.Attachments)
            .HasColumnType("jsonb");

        builder.HasIndex(e => e.ApprovalId);
        builder.HasIndex(e => e.Timestamp);
    }
}

public class ApprovalHistoryConfiguration : IEntityTypeConfiguration<ApprovalHistory>
{
    public void Configure(EntityTypeBuilder<ApprovalHistory> builder)
    {
        builder.ToTable("approval_history");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Action)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        builder.HasIndex(e => e.ApprovalId);
        builder.HasIndex(e => e.Timestamp);
    }
}
