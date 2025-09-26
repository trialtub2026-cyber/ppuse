namespace CrmPortal.Application.DTOs;

public record CustomerDto(
    int Id,
    string Name,
    string? CompanyName,
    string Email,
    string? Phone,
    string? Mobile,
    string? Website,
    string? Industry,
    string? Source,
    string Status,
    string? Rating,
    decimal? AnnualRevenue,
    int? NumberOfEmployees,
    string? Description,
    string? Notes,
    string? Tags,
    DateTime? LastContactDate,
    DateTime? NextFollowUpDate,
    string? AssignedToUserId,
    decimal TotalSalesAmount,
    int TotalOrders,
    decimal AverageOrderValue,
    DateTime? LastPurchaseDate,
    AddressDto? Address,
    AddressDto? BillingAddress,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record AddressDto(
    string? AddressLine1,
    string? AddressLine2,
    string? City,
    string? State,
    string? Country,
    string? PostalCode
);

public record CreateCustomerDto(
    string Name,
    string? CompanyName,
    string Email,
    string? Phone,
    string? Mobile,
    string? Website,
    string? Industry,
    string? Source,
    string? Rating,
    decimal? AnnualRevenue,
    int? NumberOfEmployees,
    string? Description,
    string? Notes,
    string? Tags,
    DateTime? NextFollowUpDate,
    string? AssignedToUserId,
    AddressDto? Address,
    AddressDto? BillingAddress
);

public record UpdateCustomerDto(
    int Id,
    string Name,
    string? CompanyName,
    string Email,
    string? Phone,
    string? Mobile,
    string? Website,
    string? Industry,
    string? Source,
    string Status,
    string? Rating,
    decimal? AnnualRevenue,
    int? NumberOfEmployees,
    string? Description,
    string? Notes,
    string? Tags,
    DateTime? NextFollowUpDate,
    string? AssignedToUserId,
    AddressDto? Address,
    AddressDto? BillingAddress
);

public record CustomerSearchDto(
    string? SearchTerm,
    string? Industry,
    string? Source,
    string? Status,
    string? AssignedToUserId,
    decimal? MinAnnualRevenue,
    decimal? MaxAnnualRevenue,
    DateTime? CreatedFrom,
    DateTime? CreatedTo,
    int Page = 1,
    int PageSize = 20,
    string? SortBy = "CreatedAt",
    string? SortDirection = "DESC"
);