// Super Admin Types
export interface SuperAdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'agent';
  tenant_id: string;
  tenant_name: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  avatar?: string;
  phone?: string;
  global_permissions?: string[];
}

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended' | 'deleted';
  plan: 'basic' | 'premium' | 'enterprise';
  features: string[];
  limits: {
    users: number;
    storage_gb: number;
    api_calls_per_month: number;
    custom_fields: number;
  };
  billing: {
    monthly_cost: number;
    currency: string;
    billing_cycle: 'monthly' | 'yearly';
    next_billing_date: string;
  };
  users_count: number;
  storage_used_gb: number;
  api_calls_this_month: number;
  created_at: string;
  updated_at: string;
  admin_contact: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface RoleRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  current_role: string;
  requested_role: string;
  tenant_id: string;
  tenant_name: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_comments?: string;
}

export interface PlatformUsage {
  total_tenants: number;
  active_tenants: number;
  total_users: number;
  active_users: number;
  total_api_calls: number;
  total_storage_gb: number;
  revenue: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  growth: {
    tenants_growth: number;
    users_growth: number;
    revenue_growth: number;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  services: {
    api: {
      status: 'up' | 'down' | 'degraded';
      response_time: number;
      error_rate: number;
    };
    database: {
      status: 'up' | 'down' | 'degraded';
      connections: number;
      query_time: number;
    };
    storage: {
      status: 'up' | 'down' | 'degraded';
      usage_percent: number;
      available_gb: number;
    };
    cache: {
      status: 'up' | 'down' | 'degraded';
      hit_rate: number;
      memory_usage: number;
    };
  };
  alerts: Array<{
    id: string;
    level: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

export interface AnalyticsData {
  tenant_metrics: {
    labels: string[];
    active_tenants: number[];
    new_signups: number[];
    churn_rate: number[];
  };
  user_metrics: {
    labels: string[];
    total_users: number[];
    active_users: number[];
    new_registrations: number[];
  };
  revenue_metrics: {
    labels: string[];
    monthly_revenue: number[];
    plan_distribution: {
      basic: number;
      premium: number;
      enterprise: number;
    };
  };
  api_usage: {
    labels: string[];
    total_calls: number[];
    error_rate: number[];
    response_time: number[];
  };
}

export interface SuperAdminFilters {
  tenants?: {
    status?: string;
    plan?: string;
    search?: string;
  };
  users?: {
    role?: string;
    status?: string;
    tenant_id?: string;
    search?: string;
  };
  role_requests?: {
    status?: string;
    tenant_id?: string;
    search?: string;
  };
}