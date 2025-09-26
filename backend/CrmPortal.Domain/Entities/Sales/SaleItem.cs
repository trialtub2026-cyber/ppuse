using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Sales;

public class SaleItem : BaseEntity
{
    public int SaleId { get; set; }
    public int? ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductDescription { get; set; }
    public decimal Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Discount { get; set; } = 0;
    public decimal Tax { get; set; } = 0;
    public decimal LineTotal { get; set; }

    // Navigation properties
    public virtual Sale Sale { get; set; } = null!;
    public virtual Product? Product { get; set; }
}