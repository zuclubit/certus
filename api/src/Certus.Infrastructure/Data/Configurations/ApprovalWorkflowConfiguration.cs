using Certus.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Certus.Infrastructure.Data.Configurations;

/// <summary>
/// Configuración EF Core para ApprovalWorkflow
/// Define mapeo, índices y relaciones para la plantilla de flujo de aprobación
/// </summary>
public class ApprovalWorkflowConfiguration : IEntityTypeConfiguration<ApprovalWorkflow>
{
    public void Configure(EntityTypeBuilder<ApprovalWorkflow> builder)
    {
        builder.ToTable("approval_workflows");

        builder.HasKey(e => e.Id);

        // Propiedades principales
        builder.Property(e => e.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.RejectionBehavior)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.TimeoutBehavior)
            .HasConversion<string>()
            .HasMaxLength(30);

        // JSON columns
        builder.Property(e => e.FileTypeFilters)
            .HasColumnType("jsonb");

        builder.Property(e => e.TriggerConditions)
            .HasColumnType("jsonb");

        builder.Property(e => e.NotificationSettings)
            .HasColumnType("jsonb");

        builder.Property(e => e.Tags)
            .HasColumnType("jsonb");

        builder.Property(e => e.Metadata)
            .HasColumnType("jsonb");

        // Índices
        builder.HasIndex(e => e.TenantId);
        builder.HasIndex(e => e.Code);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => new { e.TenantId, e.Code }).IsUnique();
        builder.HasIndex(e => new { e.TenantId, e.Status });

        // Relaciones
        builder.HasMany(e => e.Steps)
            .WithOne(e => e.Workflow)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Rules)
            .WithOne(e => e.Workflow)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.MatrixEntries)
            .WithOne(e => e.Workflow)
            .HasForeignKey(e => e.WorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

/// <summary>
/// Configuración EF Core para ApprovalWorkflowStep
/// </summary>
public class ApprovalWorkflowStepConfiguration : IEntityTypeConfiguration<ApprovalWorkflowStep>
{
    public void Configure(EntityTypeBuilder<ApprovalWorkflowStep> builder)
    {
        builder.ToTable("approval_workflow_steps");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.Level)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.Action)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.SkipConditions)
            .HasColumnType("jsonb");

        builder.Property(e => e.AssignedUserIds)
            .HasColumnType("jsonb");

        // Índices
        builder.HasIndex(e => e.WorkflowId);
        builder.HasIndex(e => e.Sequence);
        builder.HasIndex(e => e.Level);
        builder.HasIndex(e => new { e.WorkflowId, e.Sequence }).IsUnique();
    }
}

/// <summary>
/// Configuración EF Core para ApprovalWorkflowRule
/// </summary>
public class ApprovalWorkflowRuleConfiguration : IEntityTypeConfiguration<ApprovalWorkflowRule>
{
    public void Configure(EntityTypeBuilder<ApprovalWorkflowRule> builder)
    {
        builder.ToTable("approval_workflow_rules");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        builder.Property(e => e.ConditionType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.Operator)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.ConditionValue)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(e => e.LogicalGroup)
            .HasMaxLength(50);

        // Índices
        builder.HasIndex(e => e.WorkflowId);
        builder.HasIndex(e => e.Priority);
        builder.HasIndex(e => e.ConditionType);
        builder.HasIndex(e => new { e.WorkflowId, e.Priority });
    }
}

/// <summary>
/// Configuración EF Core para ApprovalMatrixEntry
/// Define la matriz de aprobación (quién puede aprobar qué)
/// </summary>
public class ApprovalMatrixEntryConfiguration : IEntityTypeConfiguration<ApprovalMatrixEntry>
{
    public void Configure(EntityTypeBuilder<ApprovalMatrixEntry> builder)
    {
        builder.ToTable("approval_matrix_entries");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Level)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(e => e.RequiredRole)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(e => e.SpecificUserIds)
            .HasColumnType("jsonb");

        builder.Property(e => e.DelegateUserIds)
            .HasColumnType("jsonb");

        // Índices
        builder.HasIndex(e => e.WorkflowId);
        builder.HasIndex(e => e.Level);
        builder.HasIndex(e => e.RequiredRole);
        builder.HasIndex(e => new { e.WorkflowId, e.Level, e.RequiredRole }).IsUnique();
    }
}
