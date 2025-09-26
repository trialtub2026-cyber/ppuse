using AutoMapper;
using CrmPortal.Application.DTOs;
using CrmPortal.Domain.Entities.Customers;

namespace CrmPortal.Application.Mappings;

public class CustomerMappingProfile : Profile
{
    public CustomerMappingProfile()
    {
        CreateMap<Customer, CustomerDto>()
            .ForMember(dest => dest.Address, opt => opt.MapFrom(src => new AddressDto(
                src.AddressLine1,
                src.AddressLine2,
                src.City,
                src.State,
                src.Country,
                src.PostalCode)))
            .ForMember(dest => dest.BillingAddress, opt => opt.MapFrom(src => new AddressDto(
                src.BillingAddressLine1,
                src.BillingAddressLine2,
                src.BillingCity,
                src.BillingState,
                src.BillingCountry,
                src.BillingPostalCode)));

        CreateMap<CreateCustomerDto, Customer>();
        CreateMap<UpdateCustomerDto, Customer>();
    }
}