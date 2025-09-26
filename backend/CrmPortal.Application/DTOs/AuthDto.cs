namespace CrmPortal.Application.DTOs;

public record LoginRequestDto(string Email, string Password, bool RememberMe = false);

public record LoginResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(
    int Id,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    string? CompanyName,
    string? Department,
    string? Position,
    bool IsActive,
    string? TenantId,
    IEnumerable<string> Roles
);

public record RefreshTokenRequestDto(string RefreshToken);

public record ChangePasswordRequestDto(string CurrentPassword, string NewPassword);

public record ResetPasswordRequestDto(string Email);

public record RegisterUserRequestDto(
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    string Password,
    string? TenantId = null
);