using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Users;

public class RolePermission : BaseEntity
{
    public int RoleId { get; set; }
    public string Permission { get; set; } = string.Empty;
    public string? Resource { get; set; }
    public string? Action { get; set; }
    public bool IsGranted { get; set; } = true;

    // Navigation properties
    public virtual Role Role { get; set; } = null!;
}