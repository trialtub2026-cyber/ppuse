using CrmPortal.Application.DTOs;
using MediatR;

namespace CrmPortal.Application.Commands.Auth;

public record LoginCommand(
    string Email,
    string Password,
    bool RememberMe = false
) : IRequest<LoginResponseDto>;