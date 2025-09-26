using CrmPortal.Domain.Entities.Common;
using CrmPortal.Domain.Entities.Sales;
using CrmPortal.Domain.Entities.Tickets;
using CrmPortal.Domain.Entities.Contracts;

namespace CrmPortal.Domain.Entities.Customers;

public class Customer : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public string? Website { get; set; }
    public string? Industry { get; set; }
    public string? Source { get; set; }
    public string Status { get; set; } = "Active";
    public string? Rating { get; set; }
    public decimal? AnnualRevenue { get; set; }
    public int? NumberOfEmployees { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public DateTime? LastContactDate { get; set; }
    public DateTime? NextFollowUpDate { get; set; }
    public string? AssignedToUserId { get; set; }
    public string TenantId { get; set; } = string.Empty;

    // Address Information
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }

    // Billing Address
    public string? BillingAddressLine1 { get; set; }
    public string? BillingAddressLine2 { get; set; }
    public string? BillingCity { get; set; }
    public string? BillingState { get; set; }
    public string? BillingCountry { get; set; }
    public string? BillingPostalCode { get; set; }

    // Financial Information
    public decimal TotalSalesAmount { get; set; }
    public int TotalOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public DateTime? LastPurchaseDate { get; set; }

    // Navigation properties
    public virtual ICollection<CustomerContact> Contacts { get; set; } = new List<CustomerContact>();
    public virtual ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}