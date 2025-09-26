using CrmPortal.Application.DTOs;
using MediatR;

namespace CrmPortal.Application.Commands.Auth;

public record RefreshTokenCommand(string RefreshToken) : IRequest<LoginResponseDto>;