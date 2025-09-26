using CrmPortal.Domain.Entities.Common;

namespace CrmPortal.Domain.Entities.Tickets;

public class TicketAttachment : AuditableEntity
{
    public int TicketId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string? OriginalFileName { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? UploadedByUserId { get; set; }

    // Navigation properties
    public virtual Ticket Ticket { get; set; } = null!;
}