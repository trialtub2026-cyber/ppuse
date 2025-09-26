using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Sales;

public class SaleActivity : AuditableEntity
{
    public int SaleId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime ActivityDate { get; set; } = DateTime.UtcNow;
    public string? AssignedToUserId { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    public string? Outcome { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public virtual Sale Sale { get; set; } = null!;
}