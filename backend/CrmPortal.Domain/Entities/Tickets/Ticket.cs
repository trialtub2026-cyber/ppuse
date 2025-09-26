using CrmPortal.Domain.Entities.Common;
using CrmPortal.Domain.Entities.Customers;

namespace CrmPortal.Domain.Entities.Tickets;

public class Ticket : AuditableEntity
{
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Open";
    public string Priority { get; set; } = "Medium";
    public string Category { get; set; } = "General";
    public string? SubCategory { get; set; }
    public string? Source { get; set; }
    public int? CustomerId { get; set; }
    public string? CustomerEmail { get; set; }
    public string? CustomerPhone { get; set; }
    public string? AssignedToUserId { get; set; }
    public string? ReportedByUserId { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public DateTime? ClosedDate { get; set; }
    public string? Resolution { get; set; }
    public string? Tags { get; set; }
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
    public string TenantId { get; set; } = string.Empty;

    // SLA tracking
    public DateTime? FirstResponseDate { get; set; }
    public TimeSpan? FirstResponseTime { get; set; }
    public TimeSpan? ResolutionTime { get; set; }
    public bool IsSlaBreached { get; set; } = false;

    // Calculated properties
    public bool IsOpen => Status == "Open";
    public bool IsInProgress => Status == "In Progress";
    public bool IsResolved => Status == "Resolved";
    public bool IsClosed => Status == "Closed";
    public bool IsOverdue => DueDate.HasValue && DueDate < DateTime.UtcNow && !IsClosed;

    // Navigation properties
    public virtual Customer? Customer { get; set; }
    public virtual ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
    public virtual ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
}