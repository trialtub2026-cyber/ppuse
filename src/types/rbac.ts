export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'starter' | 'professional' | 'enterprise';
  created_at: string;
  settings: TenantSettings;
  usage: TenantUsage;
}

export interface TenantSettings {
  branding: {
    logo?: string;
    primary_color: string;
    secondary_color: string;
    company_name: string;
  };
  features: {
    advanced_analytics: boolean;
    custom_fields: boolean;
    api_access: boolean;
    white_labeling: boolean;
  };
  security: {
    two_factor_required: boolean;
    password_policy: PasswordPolicy;
    session_timeout: number;
  };
}

export interface TenantUsage {
  users: number;
  max_users: number;
  storage_used: number;
  storage_limit: number;
  api_calls_month: number;
  api_calls_limit: number;
}

export interface PasswordPolicy {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
  expiry_days: number;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'module' | 'administrative' | 'system';
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  tenant_id: string;
  permissions: string[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
  expires_at?: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  tenant_id: string;
  timestamp: string;
}

export interface UserActivity {
  user_id: string;
  last_login: string;
  login_count: number;
  failed_login_attempts: number;
  last_failed_login?: string;
  is_locked: boolean;
  locked_until?: string;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_default: boolean;
  category: 'business' | 'technical' | 'administrative';
}

export interface PermissionMatrix {
  roles: Role[];
  permissions: Permission[];
  matrix: Record<string, Record<string, boolean>>;
}

export interface TenantUser extends User {
  roles: Role[];
  permissions: Permission[];
  activity: UserActivity;
  tenant: Tenant;
}

export interface RoleChangeRequest {
  id: string;
  user_id: string;
  current_role: string;
  requested_role: string;
  reason: string;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}