using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Sales;

public class Product : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Brand { get; set; }
    public string? SKU { get; set; }
    public decimal Price { get; set; }
    public decimal? CostPrice { get; set; }
    public string? Unit { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsService { get; set; } = false;
    public string? ImageUrl { get; set; }
    public string? Tags { get; set; }
    public int? MinOrderQuantity { get; set; }
    public decimal? Weight { get; set; }
    public string? Dimensions { get; set; }
    public string TenantId { get; set; } = string.Empty;

    // Stock management
    public int? StockQuantity { get; set; }
    public int? ReorderLevel { get; set; }
    public bool TrackStock { get; set; } = false;

    // Navigation properties
    public virtual ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}