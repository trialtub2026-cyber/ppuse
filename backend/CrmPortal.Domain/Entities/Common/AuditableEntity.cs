namespace CrmPortal.Domain.Entities.Common;

public abstract class AuditableEntity : BaseEntity
{
    public string? AuditLog { get; set; }
    public DateTime? LastActivityAt { get; set; }
    public string? LastActivityBy { get; set; }
    public string? LastActivityType { get; set; }
}