using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Users;

public class User : AuditableEntity
{
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool EmailConfirmed { get; set; } = false;
    public bool PhoneNumberConfirmed { get; set; } = false;
    public string PasswordHash { get; set; } = string.Empty;
    public string? SecurityStamp { get; set; }
    public DateTime? LockoutEnd { get; set; }
    public bool LockoutEnabled { get; set; } = false;
    public int AccessFailedCount { get; set; } = 0;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Department { get; set; }
    public string? Position { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true
    public string? ProfileImageUrl { get; set; }
    public string? TimeZone { get; set; }
    public string? Locale { get; set; }
    public string? TenantId { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();

    // Navigation properties
    public virtual Tenant? Tenant { get; set; }
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}