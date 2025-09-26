export interface Customer {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'enterprise';
  status: 'active' | 'inactive' | 'prospect';
  tags: CustomerTag[];
  notes?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  assigned_to: string;
}

export interface CustomerTag {
  id: string;
  name: string;
  color: string;
}

export interface Deal {
  id: string;
  title: string;
  customer_id: string;
  customer_name?: string;
  value: number;
  currency: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string;
  description: string;
  assigned_to: string;
  assigned_to_name?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  customer_id: string;
  customer_name?: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'feature_request';
  assigned_to: string;
  assigned_to_name?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'basic' | 'premium' | 'enterprise';
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Manager' | 'Viewer';
  status: 'active' | 'inactive' | 'suspended';
  tenantId: string;
  tenantName: string;
  lastLogin: string;
  createdAt: string;
  avatar?: string;
  phone?: string;
}

export interface DashboardStats {
  total_customers: number;
  active_deals: number;
  total_deal_value: number;
  open_tickets: number;
  monthly_revenue: number;
  conversion_rate: number;
  avg_deal_size: number;
  ticket_resolution_time: number;
}

export type {
  Contract,
  ContractTemplate,
  ContractParty,
  ContractAnalytics,
  ContractFilters,
  RenewalReminder,
  DigitalSignature,
  ApprovalRecord,
  SignatureStatus,
  ContractAttachment,
  TemplateField,
  MonthlyContractStats,
  StatusDistribution,
  TypeDistribution
} from './contracts';