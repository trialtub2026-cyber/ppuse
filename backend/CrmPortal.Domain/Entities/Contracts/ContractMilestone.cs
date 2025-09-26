using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Contracts;

public class ContractMilestone : AuditableEntity
{
    public int ContractId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public string Status { get; set; } = "Pending";
    public decimal? Value { get; set; }
    public string? Notes { get; set; }

    public bool IsCompleted => Status == "Completed";
    public bool IsOverdue => !IsCompleted && DueDate < DateTime.UtcNow;

    // Navigation properties
    public virtual Contract Contract { get; set; } = null!;
}