using System.Text.Json;
using AutoMapper;
using Certus.Application.DTOs;
using Certus.Domain.Entities;

namespace Certus.Application.Mappings;

/// <summary>
/// Perfil de mapeo para validaciones
/// </summary>
public class ValidationMappingProfile : Profile
{
    public ValidationMappingProfile()
    {
        // Validation -> ValidationDto
        CreateMap<Validation, ValidationDto>()
            .ForMember(d => d.FileType, opt => opt.MapFrom(s => s.FileType.ToString()))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.UploadedByName, opt => opt.MapFrom(s => s.UploadedBy != null ? s.UploadedBy.FullName : null))
            .ForMember(d => d.Errors, opt => opt.MapFrom(s => s.Errors))
            .ForMember(d => d.Warnings, opt => opt.MapFrom(s => s.Warnings))
            .ForMember(d => d.ValidatorResults, opt => opt.MapFrom(s => s.ValidatorResults))
            .ForMember(d => d.Timeline, opt => opt.MapFrom(s => s.Timeline));

        // Validation -> ValidationSummaryDto (campos completos para tabla)
        CreateMap<Validation, ValidationSummaryDto>()
            .ForMember(d => d.FileType, opt => opt.MapFrom(s => s.FileType.ToString()))
            .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.RecordCount, opt => opt.MapFrom(s => s.RecordCount))
            .ForMember(d => d.ValidRecordCount, opt => opt.MapFrom(s => s.ValidRecordCount))
            .ForMember(d => d.ProcessedAt, opt => opt.MapFrom(s => s.ProcessedAt))
            .ForMember(d => d.IsSubstitute, opt => opt.MapFrom(s => s.IsSubstitute))
            .ForMember(d => d.IsOriginal, opt => opt.MapFrom(s => s.IsOriginal))
            .ForMember(d => d.UploadedById, opt => opt.MapFrom(s => s.UploadedById))
            .ForMember(d => d.UploadedBy, opt => opt.MapFrom(s => s.UploadedBy != null ? s.UploadedBy.FullName : null));

        // ValidationError -> ValidationErrorDto
        CreateMap<ValidationError, ValidationErrorDto>()
            .ForMember(d => d.Severity, opt => opt.MapFrom(s => s.Severity.ToString()));

        // ValidationWarning -> ValidationWarningDto
        CreateMap<ValidationWarning, ValidationWarningDto>();

        // ValidatorResult -> ValidatorResultDto
        CreateMap<ValidatorResult, ValidatorResultDto>();

        // TimelineEvent -> TimelineEventDto
        CreateMap<TimelineEvent, TimelineEventDto>()
            .ForMember(d => d.Metadata, opt => opt.MapFrom(s =>
                string.IsNullOrEmpty(s.Metadata)
                    ? null
                    : JsonSerializer.Deserialize<Dictionary<string, object>>(s.Metadata, (JsonSerializerOptions?)null)));
    }
}
