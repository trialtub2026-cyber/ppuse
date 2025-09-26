/**
 * API Interface Definitions
 * Type-safe contracts for all API communications
 */

// Base interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  tenantId?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
    avatar?: string;
    permissions: string[];
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
  tenant: {
    id: string;
    name: string;
    domain: string;
    settings: any;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

// Customer interfaces
export interface CustomerRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'enterprise';
  status?: 'prospect' | 'active' | 'inactive' | 'churned';
  tags?: string[];
  notes?: string;
  assignedTo?: string;
  customFields?: Record<string, any>;
}

export interface CustomerResponse {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  size: string;
  status: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  notes?: string;
  assignedTo?: string;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface CustomerFilters extends FilterParams {
  industry?: string;
  size?: string;
  assignedTo?: string;
  tags?: string[];
}

export interface BulkCustomerOperation {
  action: 'update' | 'delete' | 'assign' | 'tag';
  customerIds: string[];
  data?: Partial<CustomerRequest>;
}

// Sales interfaces
export interface SaleRequest {
  title: string;
  customerId: string;
  value: number;
  probability: number;
  stage: string;
  expectedCloseDate?: string;
  description?: string;
  assignedTo?: string;
  products?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface SaleResponse {
  id: string;
  title: string;
  customer: {
    id: string;
    companyName: string;
    contactName: string;
  };
  value: number;
  probability: number;
  stage: string;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  description?: string;
  assignedTo?: string;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  products?: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

// Ticket interfaces
export interface TicketRequest {
  title: string;
  description: string;
  customerId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assignedTo?: string;
  dueDate?: string;
  tags?: string[];
}

export interface TicketResponse {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: string;
  category: string;
  customer?: {
    id: string;
    companyName: string;
    contactName: string;
  };
  assignedTo?: string;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  dueDate?: string;
  resolvedAt?: string;
  tags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
  }>;
  comments?: Array<{
    id: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

// Contract interfaces
export interface ContractRequest {
  title: string;
  customerId: string;
  type: 'service' | 'product' | 'maintenance' | 'support';
  value: number;
  startDate: string;
  endDate: string;
  status?: 'draft' | 'active' | 'expired' | 'terminated';
  terms?: string;
  attachments?: string[];
}

export interface ContractResponse {
  id: string;
  title: string;
  customer: {
    id: string;
    companyName: string;
    contactName: string;
  };
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  status: string;
  terms?: string;
  attachments?: Array<{
    id: string;
    filename: string;
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

// User interfaces
export interface UserRequest {
  name: string;
  email: string;
  role: string;
  password?: string;
  avatar?: string;
  permissions?: string[];
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

// Dashboard interfaces
export interface DashboardMetrics {
  customers: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  sales: {
    total: number;
    closed: number;
    pipeline: number;
    growth: number;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
    avgResolutionTime: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    forecast: number;
  };
}

export interface AnalyticsData {
  period: string;
  metrics: Record<string, number>;
  trends: Array<{
    date: string;
    value: number;
    label: string;
  }>;
}

// File upload interfaces
export interface FileUploadRequest {
  file: File;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  category?: string;
  description?: string;
  isPublic: boolean;
  uploadedBy: string;
  createdAt: string;
}

// Notification interfaces
export interface NotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  recipients: string[];
  channels: Array<'email' | 'sms' | 'push' | 'in_app'>;
  scheduledAt?: string;
  templateId?: string;
  data?: Record<string, any>;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  status: 'pending' | 'sent' | 'failed';
  recipients: Array<{
    userId: string;
    status: string;
    sentAt?: string;
    readAt?: string;
  }>;
  channels: string[];
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  tenantId: string;
}

// Audit log interfaces
export interface AuditLogResponse {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  tenantId: string;
}

export interface AuditLogFilters extends FilterParams {
  action?: string;
  resource?: string;
  userId?: string;
}

// Export all interfaces
export * from './auth';
export * from './customer';
export * from './sales';
export * from './ticket';
export * from './contract';
export * from './user';
export * from './dashboard';
export * from './notification';
export * from './file';
export * from './audit';