using AutoMapper;
using CrmPortal.Application.Commands.Customers;
using CrmPortal.Application.DTOs;
using CrmPortal.Application.Interfaces;
using CrmPortal.Domain.Entities.Customers;
using MediatR;

namespace CrmPortal.Application.Handlers.Commands;

public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, CustomerDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateCustomerCommandHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CustomerDto> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = new Customer
        {
            Name = request.Name,
            CompanyName = request.CompanyName,
            Email = request.Email,
            Phone = request.Phone,
            Mobile = request.Mobile,
            Website = request.Website,
            Industry = request.Industry,
            Source = request.Source,
            Rating = request.Rating,
            AnnualRevenue = request.AnnualRevenue,
            NumberOfEmployees = request.NumberOfEmployees,
            Description = request.Description,
            Notes = request.Notes,
            Tags = request.Tags,
            NextFollowUpDate = request.NextFollowUpDate,
            AssignedToUserId = request.AssignedToUserId,
            AddressLine1 = request.Address?.AddressLine1,
            AddressLine2 = request.Address?.AddressLine2,
            City = request.Address?.City,
            State = request.Address?.State,
            Country = request.Address?.Country,
            PostalCode = request.Address?.PostalCode,
            BillingAddressLine1 = request.BillingAddress?.AddressLine1,
            BillingAddressLine2 = request.BillingAddress?.AddressLine2,
            BillingCity = request.BillingAddress?.City,
            BillingState = request.BillingAddress?.State,
            BillingCountry = request.BillingAddress?.Country,
            BillingPostalCode = request.BillingAddress?.PostalCode,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Customers.AddAsync(customer, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return _mapper.Map<CustomerDto>(customer);
    }
}