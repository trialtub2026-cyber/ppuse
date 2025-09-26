using CrmPortal.Application.DTOs;
using MediatR;

namespace CrmPortal.Application.Queries.Customers;

public record GetCustomerByIdQuery(int Id) : IRequest<CustomerDto?>;