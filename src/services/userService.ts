import { User } from '@/types/crm';
import { authService } from './authService';

class UserService {
  private baseUrl = '/api/users';

  // Mock data for demonstration
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@company.com',
      firstName: 'John',
      lastName: 'Admin',
      role: 'Admin',
      status: 'active',
      tenantId: 'tenant_1',
      tenantName: 'Acme Corporation',
      lastLogin: '2024-01-20T14:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0101'
    },
    {
      id: '2',
      email: 'manager@company.com',
      firstName: 'Sarah',
      lastName: 'Manager',
      role: 'Manager',
      status: 'active',
      tenantId: 'tenant_1',
      tenantName: 'Acme Corporation',
      lastLogin: '2024-01-20T10:15:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0102'
    },
    {
      id: '3',
      email: 'agent@company.com',
      firstName: 'Mike',
      lastName: 'Agent',
      role: 'Viewer',
      status: 'active',
      tenantId: 'tenant_1',
      tenantName: 'Acme Corporation',
      lastLogin: '2024-01-19T16:45:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0103'
    },
    {
      id: '4',
      email: 'jane.smith@techstart.io',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'Admin',
      status: 'active',
      tenantId: 'tenant_2',
      tenantName: 'TechStart Inc',
      lastLogin: '2024-01-20T09:30:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0201'
    },
    {
      id: '5',
      email: 'bob.wilson@techstart.io',
      firstName: 'Bob',
      lastName: 'Wilson',
      role: 'Manager',
      status: 'active',
      tenantId: 'tenant_2',
      tenantName: 'TechStart Inc',
      lastLogin: '2024-01-19T14:20:00Z',
      createdAt: '2024-01-15T10:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0202'
    },
    {
      id: '6',
      email: 'alice.brown@globalsolutions.com',
      firstName: 'Alice',
      lastName: 'Brown',
      role: 'Viewer',
      status: 'inactive',
      tenantId: 'tenant_3',
      tenantName: 'Global Solutions Ltd',
      lastLogin: '2024-01-10T11:00:00Z',
      createdAt: '2024-02-01T09:15:00Z',
      avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0301'
    },
    {
      id: '7',
      email: 'david.lee@innovationlabs.net',
      firstName: 'David',
      lastName: 'Lee',
      role: 'Manager',
      status: 'suspended',
      tenantId: 'tenant_4',
      tenantName: 'Innovation Labs',
      lastLogin: '2024-01-15T08:45:00Z',
      createdAt: '2024-01-20T14:30:00Z',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0401'
    },
    {
      id: '8',
      email: 'emma.davis@enterprisesys.com',
      firstName: 'Emma',
      lastName: 'Davis',
      role: 'Admin',
      status: 'active',
      tenantId: 'tenant_5',
      tenantName: 'Enterprise Systems',
      lastLogin: '2024-01-20T13:15:00Z',
      createdAt: '2023-12-15T12:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0501'
    }
  ];

  async getUsers(filters?: {
    role?: string;
    status?: string;
    tenantId?: string;
    search?: string;
  }): Promise<User[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // Only admin can view all users, others see only their tenant users
    if (!authService.hasRole('admin')) {
      throw new Error('Access denied: Admin role required');
    }

    let users = [...this.mockUsers];

    // Apply filters
    if (filters) {
      if (filters.role) {
        users = users.filter(u => u.role === filters.role);
      }
      if (filters.status) {
        users = users.filter(u => u.status === filters.status);
      }
      if (filters.tenantId) {
        users = users.filter(u => u.tenantId === filters.tenantId);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        users = users.filter(u => 
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.tenantName.toLowerCase().includes(search)
        );
      }
    }

    return users;
  }

  async getUser(id: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    if (!authService.hasRole('admin')) {
      throw new Error('Access denied: Admin role required');
    }

    const user = this.mockUsers.find(u => u.id === id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    if (!authService.hasRole('admin')) {
      throw new Error('Access denied: Admin role required');
    }

    // Check if email already exists
    const existingUser = this.mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    this.mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    if (!authService.hasRole('admin')) {
      throw new Error('Access denied: Admin role required');
    }

    const userIndex = this.mockUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if email already exists (if email is being updated)
    if (updates.email && updates.email !== this.mockUsers[userIndex].email) {
      const existingUser = this.mockUsers.find(u => u.email === updates.email && u.id !== id);
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    this.mockUsers[userIndex] = {
      ...this.mockUsers[userIndex],
      ...updates
    };

    return this.mockUsers[userIndex];
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    if (!authService.hasRole('admin')) {
      throw new Error('Access denied: Admin role required');
    }

    const userIndex = this.mockUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Prevent deletion of current user
    if (this.mockUsers[userIndex].id === currentUser.id) {
      throw new Error('Cannot delete your own account');
    }

    this.mockUsers.splice(userIndex, 1);
  }

  async resetPassword(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    if (!authService.hasRole('admin')) {
      throw new Error('Access denied: Admin role required');
    }

    const user = this.mockUsers.find(u => u.id === id);

    if (!user) {
      throw new Error('User not found');
    }

    // In a real implementation, this would send a password reset email
    // For now, we'll just simulate the action
    console.log(`Password reset email sent to ${user.email}`);
  }

  async getRoles(): Promise<string[]> {
    return ['Admin', 'Manager', 'Viewer'];
  }

  async getStatuses(): Promise<string[]> {
    return ['active', 'inactive', 'suspended'];
  }

  async getTenants(): Promise<Array<{ id: string; name: string }>> {
    // This would typically come from the tenant service
    return [
      { id: 'tenant_1', name: 'Acme Corporation' },
      { id: 'tenant_2', name: 'TechStart Inc' },
      { id: 'tenant_3', name: 'Global Solutions Ltd' },
      { id: 'tenant_4', name: 'Innovation Labs' },
      { id: 'tenant_5', name: 'Enterprise Systems' }
    ];
  }
}

export const userService = new UserService();