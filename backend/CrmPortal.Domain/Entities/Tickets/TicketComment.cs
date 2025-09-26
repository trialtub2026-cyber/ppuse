using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Tickets;

public class TicketComment : AuditableEntity
{
    public int TicketId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? AuthorUserId { get; set; }
    public bool IsInternal { get; set; } = false;
    public bool IsSystemGenerated { get; set; } = false;

    // Navigation properties
    public virtual Ticket Ticket { get; set; } = null!;
}