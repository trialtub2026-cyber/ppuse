using CrmPortal.Domain.Entities.Common;
using CrmPortal.Domain.Entities.Customers;

namespace CrmPortal.Domain.Entities.Sales;

public class Sale : AuditableEntity
{
    public string SaleNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Stage { get; set; } = "Prospect";
    public string Status { get; set; } = "Open";
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public decimal Probability { get; set; } = 0;
    public DateTime? ExpectedCloseDate { get; set; }
    public DateTime? ActualCloseDate { get; set; }
    public string? Source { get; set; }
    public string? Campaign { get; set; }
    public string? AssignedToUserId { get; set; }
    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public string? CompetitorInfo { get; set; }
    public DateTime? LastActivityDate { get; set; }
    public DateTime? NextActivityDate { get; set; }
    public string TenantId { get; set; } = string.Empty;

    // Calculated fields
    public decimal WeightedAmount => Amount * (Probability / 100);
    public bool IsWon => Status == "Won";
    public bool IsLost => Status == "Lost";
    public bool IsClosed => IsWon || IsLost;

    // Navigation properties
    public virtual Customer Customer { get; set; } = null!;
    public virtual ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    public virtual ICollection<SaleActivity> Activities { get; set; } = new List<SaleActivity>();
}