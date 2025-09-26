using CrmPortal.Application.Interfaces;
using CrmPortal.Domain.Entities.Users;
using CrmPortal.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CrmPortal.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByUserNameAsync(string userName, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.UserName == userName, cancellationToken);
    }

    public async Task<bool> ValidateCredentialsAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var user = await GetByEmailAsync(email, cancellationToken);
        if (user == null) return false;

        // In a real implementation, you would use proper password hashing
        // For now, this is a simplified version
        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
    }
}