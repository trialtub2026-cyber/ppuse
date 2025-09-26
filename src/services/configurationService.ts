import { supabase } from './database';

export interface ConfigurationSetting {
  id?: string;
  category: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  validation_schema?: any;
  is_active?: boolean;
  last_modified_by: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConfigurationAudit {
  id?: string;
  setting_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  user_id: string;
  before_value?: any;
  after_value?: any;
  change_reason?: string;
  ip_address?: string;
  user_agent?: string;
  tenant_id?: string;
  created_at?: string;
}

export interface ValidationSchema {
  type: string;
  required?: boolean;
  properties?: Record<string, any>;
  items?: any;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

class ConfigurationService {
  private currentUser: string = 'system';
  private currentTenant: string = '';

  setCurrentUser(userId: string) {
    this.currentUser = userId;
  }

  setCurrentTenant(tenantId: string) {
    this.currentTenant = tenantId;
  }

  // Super Admin Settings Methods
  async getSuperAdminSettings(category?: string): Promise<ConfigurationSetting[]> {
    try {
      let query = supabase
        .from('super_admin_settings')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching super admin settings:', error);
        throw new Error(`Failed to fetch super admin settings: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async getSuperAdminSetting(category: string, key: string): Promise<ConfigurationSetting | null> {
    try {
      const { data, error } = await supabase
        .from('super_admin_settings')
        .select('*')
        .eq('category', category)
        .eq('setting_key', key)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching super admin setting:', error);
        throw new Error(`Failed to fetch setting: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async createSuperAdminSetting(setting: Omit<ConfigurationSetting, 'id' | 'created_at' | 'updated_at'>): Promise<ConfigurationSetting> {
    try {
      const settingData = {
        ...setting,
        last_modified_by: this.currentUser,
        is_active: setting.is_active ?? true
      };

      const { data, error } = await supabase
        .from('super_admin_settings')
        .insert([settingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating super admin setting:', error);
        throw new Error(`Failed to create setting: ${error.message}`);
      }

      // Log audit trail
      await this.logSuperAdminAudit({
        setting_id: data.id,
        action: 'CREATE',
        user_id: this.currentUser,
        after_value: data.setting_value,
        change_reason: 'Setting created'
      });

      return data;
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async updateSuperAdminSetting(id: string, updates: Partial<ConfigurationSetting>): Promise<ConfigurationSetting> {
    try {
      // Get current value for audit
      const current = await supabase
        .from('super_admin_settings')
        .select('*')
        .eq('id', id)
        .single();

      const updateData = {
        ...updates,
        last_modified_by: this.currentUser,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('super_admin_settings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating super admin setting:', error);
        throw new Error(`Failed to update setting: ${error.message}`);
      }

      // Log audit trail
      await this.logSuperAdminAudit({
        setting_id: id,
        action: 'UPDATE',
        user_id: this.currentUser,
        before_value: current.data?.setting_value,
        after_value: data.setting_value,
        change_reason: 'Setting updated'
      });

      return data;
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async deleteSuperAdminSetting(id: string): Promise<void> {
    try {
      // Get current value for audit
      const current = await supabase
        .from('super_admin_settings')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('super_admin_settings')
        .update({ 
          is_active: false,
          last_modified_by: this.currentUser,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting super admin setting:', error);
        throw new Error(`Failed to delete setting: ${error.message}`);
      }

      // Log audit trail
      await this.logSuperAdminAudit({
        setting_id: id,
        action: 'DELETE',
        user_id: this.currentUser,
        before_value: current.data?.setting_value,
        change_reason: 'Setting deleted'
      });
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  // Tenant Settings Methods
  async getTenantSettings(category?: string): Promise<ConfigurationSetting[]> {
    try {
      let query = supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', this.currentTenant)
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tenant settings:', error);
        throw new Error(`Failed to fetch tenant settings: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async getTenantSetting(category: string, key: string): Promise<ConfigurationSetting | null> {
    try {
      const { data, error } = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', this.currentTenant)
        .eq('category', category)
        .eq('setting_key', key)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching tenant setting:', error);
        throw new Error(`Failed to fetch setting: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async createTenantSetting(setting: Omit<ConfigurationSetting, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>): Promise<ConfigurationSetting> {
    try {
      const settingData = {
        ...setting,
        tenant_id: this.currentTenant,
        last_modified_by: this.currentUser,
        is_active: setting.is_active ?? true
      };

      const { data, error } = await supabase
        .from('tenant_settings')
        .insert([settingData])
        .select()
        .single();

      if (error) {
        console.error('Error creating tenant setting:', error);
        throw new Error(`Failed to create setting: ${error.message}`);
      }

      // Log audit trail
      await this.logTenantAudit({
        setting_id: data.id,
        action: 'CREATE',
        user_id: this.currentUser,
        tenant_id: this.currentTenant,
        after_value: data.setting_value,
        change_reason: 'Setting created'
      });

      return data;
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async updateTenantSetting(id: string, updates: Partial<ConfigurationSetting>): Promise<ConfigurationSetting> {
    try {
      // Get current value for audit
      const current = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', this.currentTenant)
        .single();

      const updateData = {
        ...updates,
        last_modified_by: this.currentUser,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tenant_settings')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', this.currentTenant)
        .select()
        .single();

      if (error) {
        console.error('Error updating tenant setting:', error);
        throw new Error(`Failed to update setting: ${error.message}`);
      }

      // Log audit trail
      await this.logTenantAudit({
        setting_id: id,
        action: 'UPDATE',
        user_id: this.currentUser,
        tenant_id: this.currentTenant,
        before_value: current.data?.setting_value,
        after_value: data.setting_value,
        change_reason: 'Setting updated'
      });

      return data;
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async deleteTenantSetting(id: string): Promise<void> {
    try {
      // Get current value for audit
      const current = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', this.currentTenant)
        .single();

      const { error } = await supabase
        .from('tenant_settings')
        .update({ 
          is_active: false,
          last_modified_by: this.currentUser,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('tenant_id', this.currentTenant);

      if (error) {
        console.error('Error deleting tenant setting:', error);
        throw new Error(`Failed to delete setting: ${error.message}`);
      }

      // Log audit trail
      await this.logTenantAudit({
        setting_id: id,
        action: 'DELETE',
        user_id: this.currentUser,
        tenant_id: this.currentTenant,
        before_value: current.data?.setting_value,
        change_reason: 'Setting deleted'
      });
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  // Audit Methods
  private async logSuperAdminAudit(audit: Omit<ConfigurationAudit, 'id' | 'created_at' | 'tenant_id'>): Promise<void> {
    try {
      const auditData = {
        ...audit,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('super_admin_setting_audit')
        .insert([auditData]);

      if (error) {
        console.error('Error logging super admin audit:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  private async logTenantAudit(audit: Omit<ConfigurationAudit, 'id' | 'created_at'>): Promise<void> {
    try {
      const auditData = {
        ...audit,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('tenant_setting_audit')
        .insert([auditData]);

      if (error) {
        console.error('Error logging tenant audit:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  async getSuperAdminAuditLogs(settingId?: string, limit: number = 50): Promise<ConfigurationAudit[]> {
    try {
      let query = supabase
        .from('super_admin_setting_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (settingId) {
        query = query.eq('setting_id', settingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching super admin audit logs:', error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  async getTenantAuditLogs(settingId?: string, limit: number = 50): Promise<ConfigurationAudit[]> {
    try {
      let query = supabase
        .from('tenant_setting_audit')
        .select('*')
        .eq('tenant_id', this.currentTenant)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (settingId) {
        query = query.eq('setting_id', settingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tenant audit logs:', error);
        throw new Error(`Failed to fetch audit logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Configuration service error:', error);
      throw error;
    }
  }

  // Validation Methods
  validateSetting(value: any, schema: ValidationSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (schema.required && (value === null || value === undefined || value === '')) {
      errors.push('This field is required');
    }

    if (value !== null && value !== undefined && value !== '') {
      switch (schema.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push('Value must be a string');
          } else {
            if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
              errors.push('Value does not match required pattern');
            }
            if (schema.enum && !schema.enum.includes(value)) {
              errors.push(`Value must be one of: ${schema.enum.join(', ')}`);
            }
          }
          break;

        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push('Value must be a number');
          } else {
            if (schema.minimum !== undefined && value < schema.minimum) {
              errors.push(`Value must be at least ${schema.minimum}`);
            }
            if (schema.maximum !== undefined && value > schema.maximum) {
              errors.push(`Value must be at most ${schema.maximum}`);
            }
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push('Value must be true or false');
          }
          break;

        case 'array':
          if (!Array.isArray(value)) {
            errors.push('Value must be an array');
          }
          break;

        case 'object':
          if (typeof value !== 'object' || Array.isArray(value)) {
            errors.push('Value must be an object');
          }
          break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Utility Methods
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  // Category Management
  getSuperAdminCategories(): string[] {
    return [
      'tenant_defaults',
      'global_email',
      'system_policies',
      'pdf_templates',
      'license_usage'
    ];
  }

  getTenantCategories(): string[] {
    return [
      'complaint_rules',
      'job_work_config',
      'notification_preferences',
      'pdf_templates',
      'product_defaults'
    ];
  }

  // Default Settings Templates
  getDefaultSuperAdminSettings(): Partial<ConfigurationSetting>[] {
    return [
      {
        category: 'tenant_defaults',
        setting_key: 'default_roles',
        setting_value: {
          roles: ['Admin', 'Manager', 'Engineer', 'Customer'],
          permissions: {
            'Admin': ['all'],
            'Manager': ['read', 'write', 'manage_users'],
            'Engineer': ['read', 'write'],
            'Customer': ['read']
          }
        },
        description: 'Default roles and permissions for new tenants',
        validation_schema: {
          type: 'object',
          required: true,
          properties: {
            roles: { type: 'array', items: { type: 'string' } },
            permissions: { type: 'object' }
          }
        }
      },
      {
        category: 'global_email',
        setting_key: 'smtp_config',
        setting_value: {
          host: '',
          port: 587,
          secure: false,
          auth: {
            user: '',
            pass: ''
          }
        },
        description: 'Global SMTP configuration for email notifications',
        validation_schema: {
          type: 'object',
          required: true,
          properties: {
            host: { type: 'string', required: true },
            port: { type: 'number', minimum: 1, maximum: 65535 },
            secure: { type: 'boolean' },
            auth: { type: 'object' }
          }
        }
      }
    ];
  }

  getDefaultTenantSettings(): Partial<ConfigurationSetting>[] {
    return [
      {
        category: 'complaint_rules',
        setting_key: 'auto_assignment',
        setting_value: {
          enabled: true,
          method: 'round_robin',
          criteria: {
            location_based: false,
            skill_based: true,
            workload_based: true
          }
        },
        description: 'Automatic complaint assignment rules',
        validation_schema: {
          type: 'object',
          required: true,
          properties: {
            enabled: { type: 'boolean' },
            method: { type: 'string', enum: ['manual', 'round_robin', 'geo_based'] },
            criteria: { type: 'object' }
          }
        }
      },
      {
        category: 'notification_preferences',
        setting_key: 'whatsapp_reminders',
        setting_value: {
          enabled: true,
          contract_expiry_days: [30, 15, 7, 1],
          service_reminder_days: [7, 3, 1]
        },
        description: 'WhatsApp reminder configuration',
        validation_schema: {
          type: 'object',
          required: true,
          properties: {
            enabled: { type: 'boolean' },
            contract_expiry_days: { type: 'array', items: { type: 'number' } },
            service_reminder_days: { type: 'array', items: { type: 'number' } }
          }
        }
      }
    ];
  }
}

export const configurationService = new ConfigurationService();
export default configurationService;