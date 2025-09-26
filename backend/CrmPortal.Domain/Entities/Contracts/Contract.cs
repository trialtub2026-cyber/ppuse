using CrmPortal.Domain.Entities.Common;
using CrmPortal.Domain.Entities.Customers;

namespace CrmPortal.Domain.Entities.Contracts;

public class Contract : AuditableEntity
{
    public string ContractNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "Service";
    public string Status { get; set; } = "Draft";
    public int CustomerId { get; set; }
    public decimal TotalValue { get; set; }
    public string Currency { get; set; } = "USD";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime? SignedDate { get; set; }
    public string? SignedByCustomer { get; set; }
    public string? SignedByCompany { get; set; }
    public string? Terms { get; set; }
    public string? PaymentTerms { get; set; }
    public string? DeliveryTerms { get; set; }
    public bool AutoRenewal { get; set; } = false;
    public int? RenewalPeriodMonths { get; set; }
    public DateTime? NextRenewalDate { get; set; }
    public string? AssignedToUserId { get; set; }
    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public string TenantId { get; set; } = string.Empty;

    // Document management
    public string? DocumentPath { get; set; }
    public string? DocumentUrl { get; set; }
    public string? TemplateId { get; set; }

    // Calculated properties
    public bool IsActive => Status == "Active";
    public bool IsExpired => EndDate < DateTime.UtcNow;
    public bool IsExpiringSoon => EndDate <= DateTime.UtcNow.AddDays(30);
    public TimeSpan? RemainingDuration => IsActive ? EndDate - DateTime.UtcNow : null;

    // Navigation properties
    public virtual Customer Customer { get; set; } = null!;
    public virtual ICollection<ContractItem> ContractItems { get; set; } = new List<ContractItem>();
    public virtual ICollection<ContractMilestone> Milestones { get; set; } = new List<ContractMilestone>();
}