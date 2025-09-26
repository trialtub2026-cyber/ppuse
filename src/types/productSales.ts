// Product Sales & Service Contract Type Definitions

export interface ProductSale {
  id: string;
  customer_id: string;
  customer_name?: string;
  product_id: string;
  product_name?: string;
  units: number;
  cost_per_unit: number;
  total_cost: number;
  delivery_date: string;
  warranty_expiry: string;
  status: 'new' | 'renewed' | 'expired';
  notes: string;
  attachments: FileAttachment[];
  service_contract_id?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ServiceContract {
  id: string;
  product_sale_id: string;
  contract_number: string;
  customer_id: string;
  customer_name?: string;
  product_id: string;
  product_name?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'renewed' | 'cancelled';
  contract_value: number;
  annual_value: number;
  terms: string;
  warranty_period: number; // in months
  service_level: 'basic' | 'standard' | 'premium' | 'enterprise';
  auto_renewal: boolean;
  renewal_notice_period: number; // in days
  pdf_url?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

// Form interfaces
export interface ProductSaleFormData {
  customer_id: string;
  product_id: string;
  units: number;
  cost_per_unit: number;
  delivery_date: string;
  notes: string;
  attachments: File[];
}

export interface ServiceContractFormData {
  service_level: 'basic' | 'standard' | 'premium' | 'enterprise';
  auto_renewal: boolean;
  renewal_notice_period: number;
  terms: string;
}

// Filter interfaces
export interface ProductSaleFilters {
  search?: string;
  customer_id?: string;
  product_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface ServiceContractFilters {
  search?: string;
  customer_id?: string;
  product_id?: string;
  status?: string;
  service_level?: string;
  expiry_from?: string;
  expiry_to?: string;
}

// Analytics interfaces
export interface ProductSalesAnalytics {
  total_sales: number;
  total_revenue: number;
  average_deal_size: number;
  sales_by_month: MonthlyData[];
  top_products: ProductSalesData[];
  top_customers: CustomerSalesData[];
  status_distribution: StatusData[];
  warranty_expiring_soon: ProductSale[];
}

export interface MonthlyData {
  month: string;
  sales_count: number;
  revenue: number;
}

export interface ProductSalesData {
  product_id: string;
  product_name: string;
  total_sales: number;
  total_revenue: number;
  units_sold: number;
}

export interface CustomerSalesData {
  customer_id: string;
  customer_name: string;
  total_sales: number;
  total_revenue: number;
  last_purchase: string;
}

export interface StatusData {
  status: string;
  count: number;
  percentage: number;
}

// Contract generation interfaces
export interface ContractTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractGenerationData {
  product_sale: ProductSale;
  service_contract: ServiceContract;
  customer: any;
  product: any;
  company: any;
  template: ContractTemplate;
}

// Constants
export const PRODUCT_SALE_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-green-100 text-green-800' },
  { value: 'renewed', label: 'Renewed', color: 'bg-blue-100 text-blue-800' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' }
] as const;

export const SERVICE_CONTRACT_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' },
  { value: 'renewed', label: 'Renewed', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
] as const;

export const SERVICE_LEVELS = [
  { value: 'basic', label: 'Basic Support', description: '8x5 support, email only' },
  { value: 'standard', label: 'Standard Support', description: '8x5 support, phone & email' },
  { value: 'premium', label: 'Premium Support', description: '24x7 support, priority response' },
  { value: 'enterprise', label: 'Enterprise Support', description: '24x7 support, dedicated manager' }
] as const;

export const RENEWAL_NOTICE_PERIODS = [
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 120, label: '120 days' }
] as const;

// API Response interfaces
export interface ProductSalesResponse {
  data: ProductSale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceContractsResponse {
  data: ServiceContract[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Validation schemas
export interface ProductSaleValidation {
  customer_id: string;
  product_id: string;
  units: number;
  cost_per_unit: number;
  delivery_date: string;
}

export interface ServiceContractValidation {
  service_level: string;
  auto_renewal: boolean;
  renewal_notice_period: number;
  terms: string;
}

// Utility types
export type ProductSaleStatus = 'new' | 'renewed' | 'expired';
export type ServiceContractStatus = 'active' | 'expired' | 'renewed' | 'cancelled';
export type ServiceLevel = 'basic' | 'standard' | 'premium' | 'enterprise';

// Error types
export interface ProductSaleError {
  field: string;
  message: string;
  code: string;
}

export interface ServiceContractError {
  field: string;
  message: string;
  code: string;
}