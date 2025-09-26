export interface JobWork {
  id: string;
  job_ref_id: string; // Format: CUSTSHORT-YYYYMMDD-XXXXXX
  customer_id: string;
  customer_name?: string;
  customer_short_name?: string;
  product_id: string;
  product_name?: string;
  pieces: number;
  size: string;
  default_price: number;
  manual_price?: number;
  final_price: number;
  receiver_engineer_id: string;
  receiver_engineer_name?: string;
  comments?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delivered';
  tenant_id: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  delivered_at?: string;
}

export interface JobWorkFilters {
  status?: string;
  customer_id?: string;
  product_id?: string;
  receiver_engineer?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface JobWorkStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  delivered: number;
  total_value: number;
  avg_pieces_per_job: number;
  avg_job_value: number;
}

export interface JobWorkFormData {
  customer_id: string;
  product_id: string;
  pieces: number;
  size: string;
  manual_price?: number;
  receiver_engineer_id: string;
  comments?: string;
}

export interface JobWorkUpdateData {
  status?: 'pending' | 'in_progress' | 'completed' | 'delivered';
  pieces?: number;
  size?: string;
  manual_price?: number;
  receiver_engineer_id?: string;
  comments?: string;
}

export interface JobWorkPriceCalculation {
  base_price: number;
  pieces_multiplier: number;
  size_multiplier: number;
  calculated_price: number;
}