using CrmPortal.Application.Commands.Customers;
using FluentValidation;

namespace CrmPortal.Application.Validators;

public class CreateCustomerCommandValidator : AbstractValidator<CreateCustomerCommand>
{
    public CreateCustomerCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Customer name is required")
            .MaximumLength(200)
            .WithMessage("Customer name cannot exceed 200 characters");

        RuleFor(x => x.Email)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Invalid email format")
            .MaximumLength(320)
            .WithMessage("Email cannot exceed 320 characters");

        RuleFor(x => x.Phone)
            .MaximumLength(20)
            .WithMessage("Phone number cannot exceed 20 characters");

        RuleFor(x => x.Mobile)
            .MaximumLength(20)
            .WithMessage("Mobile number cannot exceed 20 characters");

        RuleFor(x => x.Website)
            .MaximumLength(500)
            .WithMessage("Website URL cannot exceed 500 characters");

        RuleFor(x => x.CompanyName)
            .MaximumLength(200)
            .WithMessage("Company name cannot exceed 200 characters");

        RuleFor(x => x.Industry)
            .MaximumLength(100)
            .WithMessage("Industry cannot exceed 100 characters");

        RuleFor(x => x.Source)
            .MaximumLength(100)
            .WithMessage("Source cannot exceed 100 characters");

        RuleFor(x => x.Rating)
            .Must(rating => rating == null || new[] { "Hot", "Warm", "Cold" }.Contains(rating))
            .WithMessage("Rating must be one of: Hot, Warm, Cold");

        RuleFor(x => x.AnnualRevenue)
            .GreaterThanOrEqualTo(0)
            .When(x => x.AnnualRevenue.HasValue)
            .WithMessage("Annual revenue must be non-negative");

        RuleFor(x => x.NumberOfEmployees)
            .GreaterThanOrEqualTo(1)
            .When(x => x.NumberOfEmployees.HasValue)
            .WithMessage("Number of employees must be at least 1");
    }
}