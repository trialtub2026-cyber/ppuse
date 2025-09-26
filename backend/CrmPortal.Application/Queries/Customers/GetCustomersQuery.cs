using CrmPortal.Application.DTOs;
using MediatR;

namespace CrmPortal.Application.Queries.Customers;

public record GetCustomersQuery(CustomerSearchDto SearchCriteria) : IRequest<PagedResult<CustomerDto>>;

public record PagedResult<T>(
    IEnumerable<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record GetCustomerStatsQuery(string? TenantId) : IRequest<CustomerStatsDto>;

public record CustomerStatsDto(
    int TotalCustomers,
    int ActiveCustomers,
    int NewCustomersThisMonth,
    decimal TotalRevenue,
    decimal AverageOrderValue
);