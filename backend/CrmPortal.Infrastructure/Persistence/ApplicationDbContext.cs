using CrmPortal.Domain.Entities.Common;
using CrmPortal.Domain.Entities.Contracts;
using CrmPortal.Domain.Entities.Customers;
using CrmPortal.Domain.Entities.Sales;
using CrmPortal.Domain.Entities.Tickets;
using CrmPortal.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore;

namespace CrmPortal.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    // Users
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<UserRole> UserRoles { get; set; } = null!;
    public DbSet<RolePermission> RolePermissions { get; set; } = null!;
    public DbSet<Tenant> Tenants { get; set; } = null!;

    // Customers
    public DbSet<Customer> Customers { get; set; } = null!;
    public DbSet<CustomerContact> CustomerContacts { get; set; } = null!;

    // Sales
    public DbSet<Sale> Sales { get; set; } = null!;
    public DbSet<SaleItem> SaleItems { get; set; } = null!;
    public DbSet<SaleActivity> SaleActivities { get; set; } = null!;
    public DbSet<Product> Products { get; set; } = null!;

    // Tickets
    public DbSet<Ticket> Tickets { get; set; } = null!;
    public DbSet<TicketComment> TicketComments { get; set; } = null!;
    public DbSet<TicketAttachment> TicketAttachments { get; set; } = null!;

    // Contracts
    public DbSet<Contract> Contracts { get; set; } = null!;
    public DbSet<ContractItem> ContractItems { get; set; } = null!;
    public DbSet<ContractMilestone> ContractMilestones { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Global query filters for soft delete
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Customer>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Sale>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Ticket>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Contract>().HasQueryFilter(e => !e.IsDeleted);

        // Configure indexes for performance
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.UserName)
            .IsUnique();

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.Email);

        modelBuilder.Entity<Customer>()
            .HasIndex(c => c.TenantId);

        modelBuilder.Entity<Sale>()
            .HasIndex(s => new { s.TenantId, s.Stage });

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => new { t.TenantId, t.Status });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps
        var entries = ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}