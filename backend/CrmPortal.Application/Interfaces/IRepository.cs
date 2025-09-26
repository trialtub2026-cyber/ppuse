using System.Linq.Expressions;

namespace CrmPortal.Application.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<T?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null, CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<(IEnumerable<T> Items, int TotalCount)> GetPagedAsync(
        Expression<Func<T, bool>>? predicate = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);
}

public interface ICustomerRepository : IRepository<CrmPortal.Domain.Entities.Customers.Customer>
{
    Task<IEnumerable<CrmPortal.Domain.Entities.Customers.Customer>> SearchAsync(CustomerSearchDto criteria, CancellationToken cancellationToken = default);
    Task<CustomerStatsDto> GetStatsAsync(string? tenantId, CancellationToken cancellationToken = default);
}

public interface IUserRepository : IRepository<CrmPortal.Domain.Entities.Users.User>
{
    Task<CrmPortal.Domain.Entities.Users.User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<CrmPortal.Domain.Entities.Users.User?> GetByUserNameAsync(string userName, CancellationToken cancellationToken = default);
    Task<bool> ValidateCredentialsAsync(string email, string password, CancellationToken cancellationToken = default);
}

public interface IUnitOfWork : IDisposable
{
    ICustomerRepository Customers { get; }
    IUserRepository Users { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}