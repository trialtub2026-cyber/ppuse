import { User, LoginCredentials, AuthResponse } from '@/types/auth';
import { Tenant, TenantUser } from '@/types/rbac';

class AuthService {
  private baseUrl = '/api/auth';
  private tokenKey = 'crm_auth_token';
  private userKey = 'crm_user';

  private mockTenants: Tenant[] = [
    {
      id: 'platform',
      name: 'Platform Administration',
      domain: 'platform.altan.ai',
      status: 'active',
      plan: 'enterprise',
      created_at: '2024-01-01T00:00:00Z',
      settings: {
        branding: {
          primary_color: '#6366f1',
          secondary_color: '#8b5cf6',
          company_name: 'Altan Platform'
        },
        features: {
          advanced_analytics: true,
          custom_fields: true,
          api_access: true,
          white_labeling: true
        },
        security: {
          two_factor_required: true,
          password_policy: {
            min_length: 12,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_symbols: true,
            expiry_days: 90
          },
          session_timeout: 3600
        }
      },
      usage: {
        users: 1,
        max_users: -1,
        storage_used: 0,
        storage_limit: -1,
        api_calls_month: 0,
        api_calls_limit: -1
      }
    },
    {
      id: 'techcorp',
      name: 'TechCorp Solutions',
      domain: 'techcorp.com',
      status: 'active',
      plan: 'enterprise',
      created_at: '2024-01-01T00:00:00Z',
      settings: {
        branding: {
          primary_color: '#3b82f6',
          secondary_color: '#1d4ed8',
          company_name: 'TechCorp Solutions'
        },
        features: {
          advanced_analytics: true,
          custom_fields: true,
          api_access: true,
          white_labeling: false
        },
        security: {
          two_factor_required: false,
          password_policy: {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_symbols: false,
            expiry_days: 180
          },
          session_timeout: 7200
        }
      },
      usage: {
        users: 5,
        max_users: 50,
        storage_used: 2.5,
        storage_limit: 100,
        api_calls_month: 15420,
        api_calls_limit: 100000
      }
    },
    {
      id: 'innovatecorp',
      name: 'InnovateCorp',
      domain: 'innovatecorp.io',
      status: 'active',
      plan: 'professional',
      created_at: '2024-01-15T00:00:00Z',
      settings: {
        branding: {
          primary_color: '#10b981',
          secondary_color: '#059669',
          company_name: 'InnovateCorp'
        },
        features: {
          advanced_analytics: true,
          custom_fields: false,
          api_access: true,
          white_labeling: false
        },
        security: {
          two_factor_required: false,
          password_policy: {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: false,
            require_symbols: false,
            expiry_days: 365
          },
          session_timeout: 3600
        }
      },
      usage: {
        users: 5,
        max_users: 25,
        storage_used: 1.2,
        storage_limit: 50,
        api_calls_month: 8750,
        api_calls_limit: 50000
      }
    }
  ];

  private mockUsers: User[] = [
    {
      id: 'super_admin_1',
      email: 'superadmin@platform.com',
      name: 'Platform Administrator',
      role: 'super_admin',
      tenant_id: 'platform',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'admin_techcorp_1',
      email: 'admin@techcorp.com',
      name: 'John Anderson',
      role: 'admin',
      tenant_id: 'techcorp',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'manager_techcorp_1',
      email: 'manager@techcorp.com',
      name: 'Sarah Johnson',
      role: 'manager',
      tenant_id: 'techcorp',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'agent_techcorp_1',
      email: 'agent@techcorp.com',
      name: 'Mike Wilson',
      role: 'agent',
      tenant_id: 'techcorp',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'engineer_techcorp_1',
      email: 'engineer@techcorp.com',
      name: 'Alex Rodriguez',
      role: 'engineer',
      tenant_id: 'techcorp',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'customer_techcorp_1',
      email: 'customer@techcorp.com',
      name: 'Emma Davis',
      role: 'customer',
      tenant_id: 'techcorp',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'admin_innovate_1',
      email: 'admin@innovatecorp.com',
      name: 'David Chen',
      role: 'admin',
      tenant_id: 'innovatecorp',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-15T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'manager_innovate_1',
      email: 'manager@innovatecorp.com',
      name: 'Lisa Thompson',
      role: 'manager',
      tenant_id: 'innovatecorp',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-15T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'agent_innovate_1',
      email: 'agent@innovatecorp.com',
      name: 'Robert Kim',
      role: 'agent',
      tenant_id: 'innovatecorp',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-15T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'engineer_innovate_1',
      email: 'engineer@innovatecorp.com',
      name: 'Maria Garcia',
      role: 'engineer',
      tenant_id: 'innovatecorp',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-15T00:00:00Z',
      last_login: new Date().toISOString()
    },
    {
      id: 'customer_innovate_1',
      email: 'customer@innovatecorp.com',
      name: 'James Miller',
      role: 'customer',
      tenant_id: 'innovatecorp',
      avatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=32&h=32&fit=crop&crop=face',
      created_at: '2024-01-15T00:00:00Z',
      last_login: new Date().toISOString()
    }
  ];

  private permissions = {
    read: 'View and read data',
    write: 'Create and edit data',
    delete: 'Delete data',
    manage_customers: 'Manage customer data and relationships',
    manage_sales: 'Manage sales processes and deals',
    manage_tickets: 'Manage support tickets and issues',
    manage_complaints: 'Handle customer complaints',
    manage_contracts: 'Manage service contracts and agreements',
    manage_products: 'Manage product catalog and inventory',
    manage_job_works: 'Manage job work orders and tasks',
    manage_users: 'Manage user accounts and access',
    manage_roles: 'Manage roles and permissions',
    view_analytics: 'Access analytics and reports',
    manage_settings: 'Configure system settings',
    manage_companies: 'Manage company information',
    platform_admin: 'Platform administration access',
    super_admin: 'Full system administration',
    manage_tenants: 'Manage tenant accounts',
    system_monitoring: 'Monitor system health and performance'
  };

  private rolePermissions = {
    super_admin: [
      'read', 'write', 'delete',
      'manage_customers', 'manage_sales', 'manage_tickets', 'manage_complaints', 
      'manage_contracts', 'manage_products', 'manage_job_works',
      'manage_users', 'manage_roles', 'view_analytics', 'manage_settings', 'manage_companies',
      'platform_admin', 'super_admin', 'manage_tenants', 'system_monitoring'
    ],
    admin: [
      'read', 'write', 'delete',
      'manage_customers', 'manage_sales', 'manage_tickets', 'manage_complaints',
      'manage_contracts', 'manage_products', 'manage_job_works',
      'manage_users', 'manage_roles', 'view_analytics', 'manage_settings', 'manage_companies'
    ],
    manager: [
      'read', 'write',
      'manage_customers', 'manage_sales', 'manage_tickets', 'manage_complaints',
      'manage_contracts', 'view_analytics'
    ],
    agent: [
      'read', 'write',
      'manage_customers', 'manage_tickets', 'manage_complaints'
    ],
    engineer: [
      'read', 'write',
      'manage_products', 'manage_job_works', 'manage_tickets'
    ],
    customer: [
      'read'
    ]
  };

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (!user || credentials.password !== 'password123') {
      throw new Error('Invalid credentials');
    }

    user.last_login = new Date().toISOString();

    const token = this.generateMockToken(user);
    
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));

    return {
      user,
      token,
      expires_in: 3600 
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const userPermissions = this.rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  getUserTenant(): Tenant | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    return this.mockTenants.find(t => t.id === user.tenant_id) || null;
  }

  getTenantUsers(tenantId?: string): User[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    const targetTenantId = tenantId || user.tenant_id;
    
    if (user.role === 'super_admin') {
      return tenantId ? this.mockUsers.filter(u => u.tenant_id === tenantId) : this.mockUsers;
    }
    
    return this.mockUsers.filter(u => u.tenant_id === targetTenantId);
  }

  getAllTenants(): Tenant[] {
    const user = this.getCurrentUser();
    if (!user || user.role !== 'super_admin') return [];
    
    return this.mockTenants;
  }

  getUserPermissions(): string[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    return this.rolePermissions[user.role] || [];
  }

  getAvailableRoles(): string[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    
    if (user.role === 'super_admin') {
      return ['admin', 'manager', 'agent', 'engineer', 'customer'];
    }
    
    if (user.role === 'admin') {
      return ['manager', 'agent', 'engineer', 'customer'];
    }
    
    if (user.role === 'manager') {
      return ['agent', 'customer'];
    }
    
    return [];
  }

  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = btoa('mock_signature');
    
    return `${header}.${payload}.${signature}`;
  }

  async refreshToken(): Promise<string> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user found');
    
    const newToken = this.generateMockToken(user);
    localStorage.setItem(this.tokenKey, newToken);
    return newToken;
  }

  getDemoAccounts(): { tenant: string; users: User[] }[] {
    const tenantGroups = this.mockUsers.reduce((acc, user) => {
      if (!acc[user.tenant_id]) {
        acc[user.tenant_id] = [];
      }
      acc[user.tenant_id].push(user);
      return acc;
    }, {} as Record<string, User[]>);

    return Object.entries(tenantGroups).map(([tenantId, users]) => {
      const tenant = this.mockTenants.find(t => t.id === tenantId);
      return {
        tenant: tenant?.name || tenantId,
        users
      };
    });
  }

  getPermissionDescription(permission: string): string {
    return this.permissions[permission] || permission;
  }

  getRoleHierarchy(): Record<string, number> {
    return {
      super_admin: 6,
      admin: 5,
      manager: 4,
      agent: 3,
      engineer: 3,
      customer: 1
    };
  }

  canManageUser(targetUserId: string): boolean {
    const currentUser = this.getCurrentUser();
    const targetUser = this.mockUsers.find(u => u.id === targetUserId);
    
    if (!currentUser || !targetUser) return false;
    
    if (currentUser.role === 'super_admin') return true;
    
    if (currentUser.tenant_id !== targetUser.tenant_id) return false;
    
    const hierarchy = this.getRoleHierarchy();
    const currentLevel = hierarchy[currentUser.role] || 0;
    const targetLevel = hierarchy[targetUser.role] || 0;
    
    return currentLevel > targetLevel;
  }
}

export const authService = new AuthService();