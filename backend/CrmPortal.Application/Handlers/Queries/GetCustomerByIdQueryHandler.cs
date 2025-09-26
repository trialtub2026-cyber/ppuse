using AutoMapper;
using CrmPortal.Application.DTOs;
using CrmPortal.Application.Interfaces;
using CrmPortal.Application.Queries.Customers;
using MediatR;

namespace CrmPortal.Application.Handlers.Queries;

public class GetCustomerByIdQueryHandler : IRequestHandler<GetCustomerByIdQuery, CustomerDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetCustomerByIdQueryHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CustomerDto?> Handle(GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(request.Id, cancellationToken);
        return customer != null ? _mapper.Map<CustomerDto>(customer) : null;
    }
}