using CrmPortal.Application.DTOs;
using CrmPortal.Application.Interfaces;
using CrmPortal.Domain.Entities.Customers;
using CrmPortal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrmPortal.Infrastructure.Repositories;

public class CustomerRepository : Repository<Customer>, ICustomerRepository
{
    public CustomerRepository(ApplicationDbContext context) : base(context) { }

    public async Task<IEnumerable<Customer>> SearchAsync(CustomerSearchDto criteria, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();

        if (!string.IsNullOrEmpty(criteria.SearchTerm))
        {
            query = query.Where(c => 
                c.Name.Contains(criteria.SearchTerm) ||
                c.CompanyName!.Contains(criteria.SearchTerm) ||
                c.Email.Contains(criteria.SearchTerm));
        }

        if (!string.IsNullOrEmpty(criteria.Industry))
        {
            query = query.Where(c => c.Industry == criteria.Industry);
        }

        if (!string.IsNullOrEmpty(criteria.Source))
        {
            query = query.Where(c => c.Source == criteria.Source);
        }

        if (!string.IsNullOrEmpty(criteria.Status))
        {
            query = query.Where(c => c.Status == criteria.Status);
        }

        if (!string.IsNullOrEmpty(criteria.AssignedToUserId))
        {
            query = query.Where(c => c.AssignedToUserId == criteria.AssignedToUserId);
        }

        if (criteria.MinAnnualRevenue.HasValue)
        {
            query = query.Where(c => c.AnnualRevenue >= criteria.MinAnnualRevenue);
        }

        if (criteria.MaxAnnualRevenue.HasValue)
        {
            query = query.Where(c => c.AnnualRevenue <= criteria.MaxAnnualRevenue);
        }

        if (criteria.CreatedFrom.HasValue)
        {
            query = query.Where(c => c.CreatedAt >= criteria.CreatedFrom);
        }

        if (criteria.CreatedTo.HasValue)
        {
            query = query.Where(c => c.CreatedAt <= criteria.CreatedTo);
        }

        // Apply sorting
        query = criteria.SortBy?.ToLower() switch
        {
            "name" => criteria.SortDirection?.ToUpper() == "DESC" 
                ? query.OrderByDescending(c => c.Name) 
                : query.OrderBy(c => c.Name),
            "companyname" => criteria.SortDirection?.ToUpper() == "DESC" 
                ? query.OrderByDescending(c => c.CompanyName) 
                : query.OrderBy(c => c.CompanyName),
            "email" => criteria.SortDirection?.ToUpper() == "DESC" 
                ? query.OrderByDescending(c => c.Email) 
                : query.OrderBy(c => c.Email),
            "createdat" => criteria.SortDirection?.ToUpper() == "DESC" 
                ? query.OrderByDescending(c => c.CreatedAt) 
                : query.OrderBy(c => c.CreatedAt),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        return await query
            .Skip((criteria.Page - 1) * criteria.PageSize)
            .Take(criteria.PageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<CustomerStatsDto> GetStatsAsync(string? tenantId, CancellationToken cancellationToken = default)
    {
        var query = _dbSet.AsQueryable();
        
        if (!string.IsNullOrEmpty(tenantId))
        {
            query = query.Where(c => c.TenantId == tenantId);
        }

        var totalCustomers = await query.CountAsync(cancellationToken);
        var activeCustomers = await query.CountAsync(c => c.Status == "Active", cancellationToken);
        
        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var newCustomersThisMonth = await query.CountAsync(c => c.CreatedAt >= startOfMonth, cancellationToken);
        
        var totalRevenue = await query.SumAsync(c => c.TotalSalesAmount, cancellationToken);
        var averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

        return new CustomerStatsDto(
            totalCustomers,
            activeCustomers,
            newCustomersThisMonth,
            totalRevenue,
            averageOrderValue
        );
    }
}