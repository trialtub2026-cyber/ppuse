using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Customers;

public class CustomerContact : AuditableEntity
{
    public int CustomerId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Title { get; set; }
    public string? Department { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Mobile { get; set; }
    public bool IsPrimary { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime? LastContactDate { get; set; }
    public string? Notes { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();

    // Navigation properties
    public virtual Customer Customer { get; set; } = null!;
}