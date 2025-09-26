using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Contracts;

public class ContractItem : BaseEntity
{
    public int ContractId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Total { get; set; }
    public string? Unit { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public virtual Contract Contract { get; set; } = null!;
}