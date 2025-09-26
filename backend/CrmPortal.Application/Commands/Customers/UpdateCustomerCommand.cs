using CrmPortal.Application.DTOs;
using MediatR;

namespace CrmPortal.Application.Commands.Customers;

public record UpdateCustomerCommand(
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
) : IRequest<CustomerDto>;