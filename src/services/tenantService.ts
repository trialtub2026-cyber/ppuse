import { Tenant, TenantSettings, TenantUsage } from '@/types/rbac';
import { User } from '@/types/auth';
import { authService } from './authService';

class TenantService {
  private baseUrl = '/api/tenants';

  async getTenants(): Promise<Tenant[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      throw new Error('Unauthorized: Super admin access required');
    }

    return authService.getAllTenants();
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;

    // Super admin can access any tenant, others only their own
    if (currentUser.role !== 'super_admin' && currentUser.tenant_id !== tenantId) {
      throw new Error('Unauthorized: Cannot access other tenant data');
    }

    const tenants = authService.getAllTenants();
    return tenants.find(t => t.id === tenantId) || null;
  }

  async getCurrentTenant(): Promise<Tenant | null> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return null;

    return authService.getUserTenant();
  }

  async updateTenantSettings(tenantId: string, settings: Partial<TenantSettings>): Promise<Tenant> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // Only super admin or tenant admin can update settings
    if (currentUser.role !== 'super_admin' && 
        (currentUser.tenant_id !== tenantId || !authService.hasPermission('manage_settings'))) {
      throw new Error('Unauthorized: Insufficient permissions');
    }

    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    // Merge settings
    const updatedTenant: Tenant = {
      ...tenant,
      settings: {
        ...tenant.settings,
        ...settings
      }
    };

    // In a real implementation, this would update the database
    console.log('Updated tenant settings:', updatedTenant);
    
    return updatedTenant;
  }

  async getTenantUsers(tenantId?: string): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    const targetTenantId = tenantId || currentUser.tenant_id;

    // Check permissions
    if (currentUser.role !== 'super_admin' && 
        (currentUser.tenant_id !== targetTenantId || !authService.hasPermission('manage_users'))) {
      throw new Error('Unauthorized: Cannot access user data');
    }

    return authService.getTenantUsers(targetTenantId);
  }

  async addUserToTenant(tenantId: string, userData: Omit<User, 'id' | 'created_at' | 'tenant_id'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // Check permissions
    if (currentUser.role !== 'super_admin' && 
        (currentUser.tenant_id !== tenantId || !authService.hasPermission('manage_users'))) {
      throw new Error('Unauthorized: Cannot add users');
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      tenant_id: tenantId,
      created_at: new Date().toISOString()
    };

    // In a real implementation, this would create the user in the database
    console.log('Created new user:', newUser);
    
    return newUser;
  }

  async removeUserFromTenant(tenantId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // Check permissions
    if (currentUser.role !== 'super_admin' && 
        (currentUser.tenant_id !== tenantId || !authService.hasPermission('manage_users'))) {
      throw new Error('Unauthorized: Cannot remove users');
    }

    // Cannot remove yourself
    if (currentUser.id === userId) {
      throw new Error('Cannot remove yourself');
    }

    // Check if user can manage the target user
    if (!authService.canManageUser(userId)) {
      throw new Error('Unauthorized: Cannot manage this user');
    }

    // In a real implementation, this would remove the user from the database
    console.log('Removed user from tenant:', { tenantId, userId });
  }

  async updateUserRole(tenantId: string, userId: string, newRole: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // Check permissions
    if (currentUser.role !== 'super_admin' && 
        (currentUser.tenant_id !== tenantId || !authService.hasPermission('manage_users'))) {
      throw new Error('Unauthorized: Cannot update user roles');
    }

    // Check if the new role is allowed
    const availableRoles = authService.getAvailableRoles();
    if (!availableRoles.includes(newRole)) {
      throw new Error('Unauthorized: Cannot assign this role');
    }

    // Check if user can manage the target user
    if (!authService.canManageUser(userId)) {
      throw new Error('Unauthorized: Cannot manage this user');
    }

    const users = authService.getTenantUsers(tenantId);
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const updatedUser: User = {
      ...user,
      role: newRole as any
    };

    // In a real implementation, this would update the database
    console.log('Updated user role:', updatedUser);
    
    return updatedUser;
  }

  async getTenantUsage(tenantId: string): Promise<TenantUsage> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    return tenant.usage;
  }

  async getTenantAnalytics(tenantId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // Check permissions
    if (currentUser.role !== 'super_admin' && 
        (currentUser.tenant_id !== tenantId || !authService.hasPermission('view_analytics'))) {
      throw new Error('Unauthorized: Cannot access analytics');
    }

    // Mock analytics data
    const analytics = {
      period,
      users: {
        total: 25,
        active: 18,
        new: 3,
        growth: 12.5
      },
      activity: {
        logins: 156,
        api_calls: 2450,
        storage_used: 2.5,
        avg_session_duration: 45
      },
      features: {
        most_used: ['customers', 'sales', 'tickets'],
        least_used: ['job_works', 'complaints'],
        feature_adoption: 78.5
      },
      performance: {
        avg_response_time: 245,
        error_rate: 0.02,
        uptime: 99.9
      }
    };

    return analytics;
  }

  async createTenant(tenantData: Omit<Tenant, 'id' | 'created_at' | 'usage'>): Promise<Tenant> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      throw new Error('Unauthorized: Super admin access required');
    }

    const newTenant: Tenant = {
      ...tenantData,
      id: `tenant_${Date.now()}`,
      created_at: new Date().toISOString(),
      usage: {
        users: 0,
        max_users: tenantData.plan === 'starter' ? 5 : tenantData.plan === 'professional' ? 25 : 100,
        storage_used: 0,
        storage_limit: tenantData.plan === 'starter' ? 10 : tenantData.plan === 'professional' ? 50 : 500,
        api_calls_month: 0,
        api_calls_limit: tenantData.plan === 'starter' ? 10000 : tenantData.plan === 'professional' ? 50000 : 500000
      }
    };

    // In a real implementation, this would create the tenant in the database
    console.log('Created new tenant:', newTenant);
    
    return newTenant;
  }

  async updateTenantStatus(tenantId: string, status: 'active' | 'inactive' | 'suspended'): Promise<Tenant> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      throw new Error('Unauthorized: Super admin access required');
    }

    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const updatedTenant: Tenant = {
      ...tenant,
      status
    };

    // In a real implementation, this would update the database
    console.log('Updated tenant status:', updatedTenant);
    
    return updatedTenant;
  }

  async deleteTenant(tenantId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      throw new Error('Unauthorized: Super admin access required');
    }

    // Cannot delete platform tenant
    if (tenantId === 'platform') {
      throw new Error('Cannot delete platform tenant');
    }

    // In a real implementation, this would:
    // 1. Archive all tenant data
    // 2. Deactivate all tenant users
    // 3. Remove tenant from database
    console.log('Deleted tenant:', tenantId);
  }

  async getTenantBranding(tenantId?: string): Promise<TenantSettings['branding']> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    const targetTenantId = tenantId || currentUser.tenant_id;
    const tenant = await this.getTenant(targetTenantId);
    
    if (!tenant) throw new Error('Tenant not found');
    
    return tenant.settings.branding;
  }

  async updateTenantBranding(tenantId: string, branding: Partial<TenantSettings['branding']>): Promise<TenantSettings['branding']> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // Check permissions
    if (currentUser.role !== 'super_admin' && 
        (currentUser.tenant_id !== tenantId || !authService.hasPermission('manage_settings'))) {
      throw new Error('Unauthorized: Cannot update branding');
    }

    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const updatedBranding = {
      ...tenant.settings.branding,
      ...branding
    };

    await this.updateTenantSettings(tenantId, {
      branding: updatedBranding
    });

    return updatedBranding;
  }

  async getTenantFeatures(tenantId?: string): Promise<TenantSettings['features']> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    const targetTenantId = tenantId || currentUser.tenant_id;
    const tenant = await this.getTenant(targetTenantId);
    
    if (!tenant) throw new Error('Tenant not found');
    
    return tenant.settings.features;
  }

  async updateTenantFeatures(tenantId: string, features: Partial<TenantSettings['features']>): Promise<TenantSettings['features']> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    // Only super admin can update features
    if (currentUser.role !== 'super_admin') {
      throw new Error('Unauthorized: Super admin access required');
    }

    const tenant = await this.getTenant(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const updatedFeatures = {
      ...tenant.settings.features,
      ...features
    };

    await this.updateTenantSettings(tenantId, {
      features: updatedFeatures
    });

    return updatedFeatures;
  }
}

export const tenantService = new TenantService();