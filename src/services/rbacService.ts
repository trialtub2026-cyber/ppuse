import { Permission, Role, UserRole, AuditLog, RoleTemplate, PermissionMatrix } from '@/types/rbac';
import { User } from '@/types/auth';
import { authService } from './authService';

class RBACService {
  private baseUrl = '/api/rbac';

  // Mock permissions data
  private mockPermissions: Permission[] = [
    // Core permissions
    { id: 'read', name: 'Read', description: 'View and read data', category: 'core', resource: '*', action: 'read' },
    { id: 'write', name: 'Write', description: 'Create and edit data', category: 'core', resource: '*', action: 'write' },
    { id: 'delete', name: 'Delete', description: 'Delete data', category: 'core', resource: '*', action: 'delete' },
    
    // Module permissions
    { id: 'manage_customers', name: 'Manage Customers', description: 'Manage customer data and relationships', category: 'module', resource: 'customers', action: 'manage' },
    { id: 'manage_sales', name: 'Manage Sales', description: 'Manage sales processes and deals', category: 'module', resource: 'sales', action: 'manage' },
    { id: 'manage_tickets', name: 'Manage Tickets', description: 'Manage support tickets and issues', category: 'module', resource: 'tickets', action: 'manage' },
    { id: 'manage_complaints', name: 'Manage Complaints', description: 'Handle customer complaints', category: 'module', resource: 'complaints', action: 'manage' },
    { id: 'manage_contracts', name: 'Manage Contracts', description: 'Manage service contracts and agreements', category: 'module', resource: 'contracts', action: 'manage' },
    { id: 'manage_products', name: 'Manage Products', description: 'Manage product catalog and inventory', category: 'module', resource: 'products', action: 'manage' },
    { id: 'manage_job_works', name: 'Manage Job Works', description: 'Manage job work orders and tasks', category: 'module', resource: 'job_works', action: 'manage' },
    
    // Administrative permissions
    { id: 'manage_users', name: 'Manage Users', description: 'Manage user accounts and access', category: 'administrative', resource: 'users', action: 'manage' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Manage roles and permissions', category: 'administrative', resource: 'roles', action: 'manage' },
    { id: 'view_analytics', name: 'View Analytics', description: 'Access analytics and reports', category: 'administrative', resource: 'analytics', action: 'view' },
    { id: 'manage_settings', name: 'Manage Settings', description: 'Configure system settings', category: 'administrative', resource: 'settings', action: 'manage' },
    { id: 'manage_companies', name: 'Manage Companies', description: 'Manage company information', category: 'administrative', resource: 'companies', action: 'manage' },
    
    // System permissions
    { id: 'platform_admin', name: 'Platform Admin', description: 'Platform administration access', category: 'system', resource: 'platform', action: 'admin' },
    { id: 'super_admin', name: 'Super Admin', description: 'Full system administration', category: 'system', resource: 'system', action: 'admin' },
    { id: 'manage_tenants', name: 'Manage Tenants', description: 'Manage tenant accounts', category: 'system', resource: 'tenants', action: 'manage' },
    { id: 'system_monitoring', name: 'System Monitoring', description: 'Monitor system health and performance', category: 'system', resource: 'system', action: 'monitor' }
  ];

  // Mock roles data
  private mockRoles: Role[] = [
    {
      id: 'super_admin_role',
      name: 'Super Administrator',
      description: 'Full platform administration with all permissions',
      tenant_id: 'platform',
      permissions: ['read', 'write', 'delete', 'manage_customers', 'manage_sales', 'manage_tickets', 'manage_complaints', 'manage_contracts', 'manage_products', 'manage_job_works', 'manage_users', 'manage_roles', 'view_analytics', 'manage_settings', 'manage_companies', 'platform_admin', 'super_admin', 'manage_tenants', 'system_monitoring'],
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'admin_role',
      name: 'Administrator',
      description: 'Tenant administrator with full tenant permissions',
      tenant_id: 'techcorp',
      permissions: ['read', 'write', 'delete', 'manage_customers', 'manage_sales', 'manage_tickets', 'manage_complaints', 'manage_contracts', 'manage_products', 'manage_job_works', 'manage_users', 'manage_roles', 'view_analytics', 'manage_settings', 'manage_companies'],
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'manager_role',
      name: 'Manager',
      description: 'Business operations manager with analytics access',
      tenant_id: 'techcorp',
      permissions: ['read', 'write', 'manage_customers', 'manage_sales', 'manage_tickets', 'manage_complaints', 'manage_contracts', 'view_analytics'],
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'agent_role',
      name: 'Agent',
      description: 'Customer service agent with basic operations',
      tenant_id: 'techcorp',
      permissions: ['read', 'write', 'manage_customers', 'manage_tickets', 'manage_complaints'],
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'engineer_role',
      name: 'Engineer',
      description: 'Technical engineer with product and job work access',
      tenant_id: 'techcorp',
      permissions: ['read', 'write', 'manage_products', 'manage_job_works', 'manage_tickets'],
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'customer_role',
      name: 'Customer',
      description: 'Customer with read-only access to own data',
      tenant_id: 'techcorp',
      permissions: ['read'],
      is_system_role: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  // Mock role templates
  private mockRoleTemplates: RoleTemplate[] = [
    {
      id: 'business_admin',
      name: 'Business Administrator',
      description: 'Complete business operations management',
      permissions: ['read', 'write', 'delete', 'manage_customers', 'manage_sales', 'manage_contracts', 'view_analytics', 'manage_companies'],
      is_default: true,
      category: 'business'
    },
    {
      id: 'sales_manager',
      name: 'Sales Manager',
      description: 'Sales operations and customer management',
      permissions: ['read', 'write', 'manage_customers', 'manage_sales', 'manage_contracts', 'view_analytics'],
      is_default: true,
      category: 'business'
    },
    {
      id: 'support_agent',
      name: 'Support Agent',
      description: 'Customer support and ticket management',
      permissions: ['read', 'write', 'manage_customers', 'manage_tickets', 'manage_complaints'],
      is_default: true,
      category: 'business'
    },
    {
      id: 'technical_lead',
      name: 'Technical Lead',
      description: 'Technical operations and product management',
      permissions: ['read', 'write', 'manage_products', 'manage_job_works', 'manage_tickets'],
      is_default: true,
      category: 'technical'
    },
    {
      id: 'system_admin',
      name: 'System Administrator',
      description: 'System administration and user management',
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_roles', 'manage_settings'],
      is_default: true,
      category: 'administrative'
    }
  ];

  // Mock audit logs
  private mockAuditLogs: AuditLog[] = [
    {
      id: 'audit_1',
      user_id: 'admin_techcorp_1',
      action: 'role_assigned',
      resource: 'user',
      resource_id: 'agent_techcorp_1',
      details: { old_role: 'customer', new_role: 'agent', assigned_by: 'admin_techcorp_1' },
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      tenant_id: 'techcorp',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'audit_2',
      user_id: 'manager_techcorp_1',
      action: 'permission_granted',
      resource: 'role',
      resource_id: 'custom_role_1',
      details: { permission: 'view_analytics', granted_by: 'admin_techcorp_1' },
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (macOS; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      tenant_id: 'techcorp',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  async getPermissions(): Promise<Permission[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.mockPermissions;
  }

  async getRoles(tenantId?: string): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];

    if (currentUser.role === 'super_admin') {
      return tenantId ? this.mockRoles.filter(r => r.tenant_id === tenantId) : this.mockRoles;
    }

    return this.mockRoles.filter(r => r.tenant_id === currentUser.tenant_id);
  }

  async createRole(roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newRole: Role = {
      ...roleData,
      id: `role_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockRoles.push(newRole);
    return newRole;
  }

  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const roleIndex = this.mockRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) throw new Error('Role not found');

    this.mockRoles[roleIndex] = {
      ...this.mockRoles[roleIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockRoles[roleIndex];
  }

  async deleteRole(roleId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roleIndex = this.mockRoles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) throw new Error('Role not found');

    if (this.mockRoles[roleIndex].is_system_role) {
      throw new Error('Cannot delete system role');
    }

    this.mockRoles.splice(roleIndex, 1);
  }

  async assignUserRole(userId: string, roleId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would update the user's role in the database
    // For now, we'll just simulate the operation
    console.log(`Assigned role ${roleId} to user ${userId}`);
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Removed role ${roleId} from user ${userId}`);
  }

  async getPermissionMatrix(tenantId?: string): Promise<PermissionMatrix> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const roles = await this.getRoles(tenantId);
    const permissions = this.mockPermissions;
    
    const matrix: Record<string, Record<string, boolean>> = {};
    
    roles.forEach(role => {
      matrix[role.id] = {};
      permissions.forEach(permission => {
        matrix[role.id][permission.id] = role.permissions.includes(permission.id);
      });
    });

    return {
      roles,
      permissions,
      matrix
    };
  }

  async getRoleTemplates(): Promise<RoleTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockRoleTemplates;
  }

  async createRoleFromTemplate(templateId: string, roleName: string, tenantId: string): Promise<Role> {
    const template = this.mockRoleTemplates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    return this.createRole({
      name: roleName,
      description: template.description,
      tenant_id: tenantId,
      permissions: [...template.permissions],
      is_system_role: false
    });
  }

  async getAuditLogs(filters?: {
    user_id?: string;
    action?: string;
    resource?: string;
    tenant_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<AuditLog[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let logs = [...this.mockAuditLogs];
    
    if (filters) {
      if (filters.user_id) {
        logs = logs.filter(log => log.user_id === filters.user_id);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.tenant_id) {
        logs = logs.filter(log => log.tenant_id === filters.tenant_id);
      }
      if (filters.start_date) {
        logs = logs.filter(log => log.timestamp >= filters.start_date!);
      }
      if (filters.end_date) {
        logs = logs.filter(log => log.timestamp <= filters.end_date!);
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async logAction(action: string, resource: string, resourceId?: string, details?: Record<string, any>): Promise<void> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const auditLog: AuditLog = {
      id: `audit_${Date.now()}`,
      user_id: currentUser.id,
      action,
      resource,
      resource_id: resourceId,
      details: details || {},
      ip_address: '192.168.1.1', // In real implementation, get from request
      user_agent: navigator.userAgent,
      tenant_id: currentUser.tenant_id,
      timestamp: new Date().toISOString()
    };

    this.mockAuditLogs.unshift(auditLog);
  }

  async getUsersByRole(roleId: string): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real implementation, this would query users with the specific role
    // For now, we'll return mock data based on role names
    const role = this.mockRoles.find(r => r.id === roleId);
    if (!role) return [];

    const users = authService.getTenantUsers();
    return users.filter(user => {
      // Simple mapping based on role names
      const roleNameMap: Record<string, string> = {
        'admin_role': 'admin',
        'manager_role': 'manager',
        'agent_role': 'agent',
        'engineer_role': 'engineer',
        'customer_role': 'customer'
      };
      return user.role === roleNameMap[roleId];
    });
  }

  async bulkAssignRole(userIds: string[], roleId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (const userId of userIds) {
      await this.assignUserRole(userId, roleId);
    }
  }

  async bulkRemoveRole(userIds: string[], roleId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (const userId of userIds) {
      await this.removeUserRole(userId, roleId);
    }
  }

  getPermissionsByCategory(): Record<string, Permission[]> {
    return this.mockPermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }

  validateRolePermissions(permissions: string[]): { valid: boolean; invalid: string[] } {
    const validPermissions = this.mockPermissions.map(p => p.id);
    const invalid = permissions.filter(p => !validPermissions.includes(p));
    
    return {
      valid: invalid.length === 0,
      invalid
    };
  }
}

export const rbacService = new RBACService();