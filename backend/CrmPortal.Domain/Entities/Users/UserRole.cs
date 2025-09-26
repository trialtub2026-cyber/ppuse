using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Users;

public class UserRole : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public string? AssignedBy { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}