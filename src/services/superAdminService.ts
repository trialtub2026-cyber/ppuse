import { 
  SuperAdminUser, 
  TenantConfig, 
  RoleRequest, 
  PlatformUsage, 
  SystemHealth, 
  AnalyticsData,
  SuperAdminFilters 
} from '@/types/superAdmin';
import { authService } from './authService';

class SuperAdminService {
  private baseUrl = '/api/super-admin';

  // Mock data for demonstration
  private mockTenants: TenantConfig[] = [
    {
      id: 'tenant_1',
      name: 'Acme Corporation',
      domain: 'acme.com',
      status: 'active',
      plan: 'enterprise',
      features: ['advanced_analytics', 'custom_branding', 'api_access', 'priority_support'],
      limits: {
        users: 100,
        storage_gb: 500,
        api_calls_per_month: 100000,
        custom_fields: 50
      },
      billing: {
        monthly_cost: 299,
        currency: 'USD',
        billing_cycle: 'monthly',
        next_billing_date: '2024-02-20T00:00:00Z'
      },
      users_count: 25,
      storage_used_gb: 125,
      api_calls_this_month: 45000,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      admin_contact: {
        name: 'John Admin',
        email: 'admin@acme.com',
        phone: '+1-555-0101'
      }
    },
    {
      id: 'tenant_2',
      name: 'TechStart Inc',
      domain: 'techstart.io',
      status: 'active',
      plan: 'premium',
      features: ['analytics', 'api_access', 'email_support'],
      limits: {
        users: 50,
        storage_gb: 200,
        api_calls_per_month: 50000,
        custom_fields: 25
      },
      billing: {
        monthly_cost: 149,
        currency: 'USD',
        billing_cycle: 'yearly',
        next_billing_date: '2025-01-15T00:00:00Z'
      },
      users_count: 12,
      storage_used_gb: 45,
      api_calls_this_month: 18000,
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-25T16:45:00Z',
      admin_contact: {
        name: 'Jane Smith',
        email: 'jane@techstart.io',
        phone: '+1-555-0201'
      }
    },
    {
      id: 'tenant_3',
      name: 'Global Solutions Ltd',
      domain: 'globalsolutions.com',
      status: 'inactive',
      plan: 'basic',
      features: ['basic_analytics', 'email_support'],
      limits: {
        users: 10,
        storage_gb: 50,
        api_calls_per_month: 10000,
        custom_fields: 10
      },
      billing: {
        monthly_cost: 49,
        currency: 'USD',
        billing_cycle: 'monthly',
        next_billing_date: '2024-02-01T00:00:00Z'
      },
      users_count: 5,
      storage_used_gb: 12,
      api_calls_this_month: 2500,
      created_at: '2024-02-01T09:15:00Z',
      updated_at: '2024-02-10T11:20:00Z',
      admin_contact: {
        name: 'Alice Brown',
        email: 'alice@globalsolutions.com'
      }
    }
  ];

  private mockGlobalUsers: SuperAdminUser[] = [
    {
      id: '1',
      email: 'admin@acme.com',
      name: 'John Admin',
      role: 'admin',
      tenant_id: 'tenant_1',
      tenant_name: 'Acme Corporation',
      status: 'active',
      last_login: '2024-01-20T14:30:00Z',
      created_at: '2024-01-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0101'
    },
    {
      id: '2',
      email: 'jane@techstart.io',
      name: 'Jane Smith',
      role: 'admin',
      tenant_id: 'tenant_2',
      tenant_name: 'TechStart Inc',
      status: 'active',
      last_login: '2024-01-20T09:30:00Z',
      created_at: '2024-01-15T10:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      phone: '+1-555-0201'
    },
    {
      id: '3',
      email: 'alice@globalsolutions.com',
      name: 'Alice Brown',
      role: 'manager',
      tenant_id: 'tenant_3',
      tenant_name: 'Global Solutions Ltd',
      status: 'inactive',
      last_login: '2024-01-10T11:00:00Z',
      created_at: '2024-02-01T09:15:00Z',
      avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=32&h=32&fit=crop&crop=face'
    }
  ];

  private mockRoleRequests: RoleRequest[] = [
    {
      id: 'req_1',
      user_id: '3',
      user_name: 'Alice Brown',
      user_email: 'alice@globalsolutions.com',
      current_role: 'manager',
      requested_role: 'admin',
      tenant_id: 'tenant_3',
      tenant_name: 'Global Solutions Ltd',
      reason: 'Need admin access to manage team and configure tenant settings',
      status: 'pending',
      requested_at: '2024-01-20T10:00:00Z'
    },
    {
      id: 'req_2',
      user_id: '4',
      user_name: 'Bob Wilson',
      user_email: 'bob@techstart.io',
      current_role: 'agent',
      requested_role: 'manager',
      tenant_id: 'tenant_2',
      tenant_name: 'TechStart Inc',
      reason: 'Promotion to team lead position requires manager privileges',
      status: 'approved',
      requested_at: '2024-01-18T14:30:00Z',
      reviewed_at: '2024-01-19T09:15:00Z',
      reviewed_by: 'Super Admin',
      reviewer_comments: 'Approved based on performance review and team lead promotion'
    }
  ];

  // Check if user has super admin role
  private checkSuperAdminAccess(): void {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    
    // For demo purposes, we'll check if user email contains 'superadmin' or has admin role
    // In real implementation, this would be a proper super_admin role
    const isSuperAdmin = user.email.includes('superadmin') || user.role === 'admin';
    if (!isSuperAdmin) {
      throw new Error('Access denied: Super Admin privileges required');
    }
  }

  // Tenant Management
  async getTenants(filters?: SuperAdminFilters['tenants']): Promise<TenantConfig[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.checkSuperAdminAccess();

    let tenants = [...this.mockTenants];

    if (filters) {
      if (filters.status) {
        tenants = tenants.filter(t => t.status === filters.status);
      }
      if (filters.plan) {
        tenants = tenants.filter(t => t.plan === filters.plan);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        tenants = tenants.filter(t => 
          t.name.toLowerCase().includes(search) ||
          t.domain.toLowerCase().includes(search) ||
          t.admin_contact.email.toLowerCase().includes(search)
        );
      }
    }

    return tenants;
  }

  async createTenant(tenantData: Omit<TenantConfig, 'id' | 'created_at' | 'updated_at'>): Promise<TenantConfig> {
    await new Promise(resolve => setTimeout(resolve, 800));
    this.checkSuperAdminAccess();

    const existingTenant = this.mockTenants.find(t => t.domain === tenantData.domain);
    if (existingTenant) {
      throw new Error('Domain already exists');
    }

    const newTenant: TenantConfig = {
      ...tenantData,
      id: `tenant_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockTenants.push(newTenant);
    return newTenant;
  }

  async updateTenant(id: string, updates: Partial<TenantConfig>): Promise<TenantConfig> {
    await new Promise(resolve => setTimeout(resolve, 600));
    this.checkSuperAdminAccess();

    const tenantIndex = this.mockTenants.findIndex(t => t.id === id);
    if (tenantIndex === -1) {
      throw new Error('Tenant not found');
    }

    this.mockTenants[tenantIndex] = {
      ...this.mockTenants[tenantIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockTenants[tenantIndex];
  }

  async deleteTenant(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    this.checkSuperAdminAccess();

    const tenantIndex = this.mockTenants.findIndex(t => t.id === id);
    if (tenantIndex === -1) {
      throw new Error('Tenant not found');
    }

    this.mockTenants.splice(tenantIndex, 1);
  }

  // Global User Management
  async getGlobalUsers(filters?: SuperAdminFilters['users']): Promise<SuperAdminUser[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.checkSuperAdminAccess();

    let users = [...this.mockGlobalUsers];

    if (filters) {
      if (filters.role) {
        users = users.filter(u => u.role === filters.role);
      }
      if (filters.status) {
        users = users.filter(u => u.status === filters.status);
      }
      if (filters.tenant_id) {
        users = users.filter(u => u.tenant_id === filters.tenant_id);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        users = users.filter(u => 
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search) ||
          u.tenant_name.toLowerCase().includes(search)
        );
      }
    }

    return users;
  }

  async updateGlobalUser(id: string, updates: Partial<SuperAdminUser>): Promise<SuperAdminUser> {
    await new Promise(resolve => setTimeout(resolve, 600));
    this.checkSuperAdminAccess();

    const userIndex = this.mockGlobalUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.mockGlobalUsers[userIndex] = {
      ...this.mockGlobalUsers[userIndex],
      ...updates
    };

    return this.mockGlobalUsers[userIndex];
  }

  // Role Request Management
  async getRoleRequests(filters?: SuperAdminFilters['role_requests']): Promise<RoleRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.checkSuperAdminAccess();

    let requests = [...this.mockRoleRequests];

    if (filters) {
      if (filters.status) {
        requests = requests.filter(r => r.status === filters.status);
      }
      if (filters.tenant_id) {
        requests = requests.filter(r => r.tenant_id === filters.tenant_id);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        requests = requests.filter(r => 
          r.user_name.toLowerCase().includes(search) ||
          r.user_email.toLowerCase().includes(search) ||
          r.tenant_name.toLowerCase().includes(search)
        );
      }
    }

    return requests;
  }

  async approveRoleRequest(id: string, comments?: string): Promise<RoleRequest> {
    await new Promise(resolve => setTimeout(resolve, 600));
    this.checkSuperAdminAccess();

    const requestIndex = this.mockRoleRequests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      throw new Error('Role request not found');
    }

    this.mockRoleRequests[requestIndex] = {
      ...this.mockRoleRequests[requestIndex],
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'Super Admin',
      reviewer_comments: comments
    };

    return this.mockRoleRequests[requestIndex];
  }

  async rejectRoleRequest(id: string, comments?: string): Promise<RoleRequest> {
    await new Promise(resolve => setTimeout(resolve, 600));
    this.checkSuperAdminAccess();

    const requestIndex = this.mockRoleRequests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      throw new Error('Role request not found');
    }

    this.mockRoleRequests[requestIndex] = {
      ...this.mockRoleRequests[requestIndex],
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: 'Super Admin',
      reviewer_comments: comments
    };

    return this.mockRoleRequests[requestIndex];
  }

  // Platform Analytics
  async getPlatformUsage(): Promise<PlatformUsage> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.checkSuperAdminAccess();

    return {
      total_tenants: this.mockTenants.length,
      active_tenants: this.mockTenants.filter(t => t.status === 'active').length,
      total_users: this.mockGlobalUsers.length,
      active_users: this.mockGlobalUsers.filter(u => u.status === 'active').length,
      total_api_calls: 65500,
      total_storage_gb: 182,
      revenue: {
        monthly: 497,
        yearly: 5964,
        currency: 'USD'
      },
      growth: {
        tenants_growth: 15.2,
        users_growth: 23.8,
        revenue_growth: 18.5
      }
    };
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    await new Promise(resolve => setTimeout(resolve, 700));
    this.checkSuperAdminAccess();

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      tenant_metrics: {
        labels: last7Days,
        active_tenants: [2, 2, 3, 3, 3, 3, 3],
        new_signups: [0, 0, 1, 0, 0, 0, 0],
        churn_rate: [0, 0, 0, 0, 0, 0, 0]
      },
      user_metrics: {
        labels: last7Days,
        total_users: [35, 36, 38, 38, 40, 42, 43],
        active_users: [28, 29, 30, 31, 32, 34, 35],
        new_registrations: [1, 2, 0, 2, 2, 1, 0]
      },
      revenue_metrics: {
        labels: last7Days,
        monthly_revenue: [450, 465, 480, 485, 490, 495, 497],
        plan_distribution: {
          basic: 1,
          premium: 1,
          enterprise: 1
        }
      },
      api_usage: {
        labels: last7Days,
        total_calls: [8500, 9200, 9800, 10200, 10800, 11500, 12000],
        error_rate: [0.5, 0.3, 0.4, 0.2, 0.3, 0.1, 0.2],
        response_time: [120, 115, 118, 110, 125, 108, 112]
      }
    };
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.checkSuperAdminAccess();

    return {
      status: 'healthy',
      uptime: 99.98,
      services: {
        api: {
          status: 'up',
          response_time: 112,
          error_rate: 0.2
        },
        database: {
          status: 'up',
          connections: 45,
          query_time: 25
        },
        storage: {
          status: 'up',
          usage_percent: 68,
          available_gb: 1250
        },
        cache: {
          status: 'up',
          hit_rate: 94.5,
          memory_usage: 72
        }
      },
      alerts: [
        {
          id: 'alert_1',
          level: 'info',
          message: 'Scheduled maintenance window: Feb 25, 2024 02:00-04:00 UTC',
          timestamp: '2024-01-20T10:00:00Z',
          resolved: false
        },
        {
          id: 'alert_2',
          level: 'warning',
          message: 'Storage usage approaching 70% threshold',
          timestamp: '2024-01-20T08:30:00Z',
          resolved: false
        }
      ]
    };
  }

  // Utility methods
  async getAvailablePlans(): Promise<string[]> {
    return ['basic', 'premium', 'enterprise'];
  }

  async getAvailableFeatures(): Promise<string[]> {
    return [
      'basic_analytics',
      'advanced_analytics',
      'custom_branding',
      'api_access',
      'priority_support',
      'email_support',
      'phone_support',
      'custom_integrations',
      'white_label',
      'sso',
      'audit_logs'
    ];
  }

  async getTenantStatuses(): Promise<string[]> {
    return ['active', 'inactive', 'suspended', 'deleted'];
  }

  async getUserRoles(): Promise<string[]> {
    return ['super_admin', 'admin', 'manager', 'agent'];
  }

  async getUserStatuses(): Promise<string[]> {
    return ['active', 'inactive', 'suspended'];
  }
}

export const superAdminService = new SuperAdminService();