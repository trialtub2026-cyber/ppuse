export interface Complaint {
  id: string;
  title: string;
  description: string;
  customer_id: string;
  customer_name?: string;
  type: 'breakdown' | 'preventive' | 'software_update' | 'optimize';
  status: 'new' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_engineer_id?: string;
  assigned_engineer_name?: string;
  engineer_resolution?: string;
  comments: ComplaintComment[];
  tenant_id: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface ComplaintComment {
  id: string;
  complaint_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  content: string;
  created_at: string;
  parent_id?: string; // For threaded comments
  replies?: ComplaintComment[];
}

export interface ComplaintFilters {
  status?: string;
  type?: string;
  priority?: string;
  assigned_engineer?: string;
  customer_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface ComplaintStats {
  total: number;
  new: number;
  in_progress: number;
  closed: number;
  by_type: {
    breakdown: number;
    preventive: number;
    software_update: number;
    optimize: number;
  };
  by_priority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  avg_resolution_time: number; // in hours
}

export interface ComplaintFormData {
  title: string;
  description: string;
  customer_id: string;
  type: 'breakdown' | 'preventive' | 'software_update' | 'optimize';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_engineer_id?: string;
}

export interface ComplaintUpdateData {
  status?: 'new' | 'in_progress' | 'closed';
  assigned_engineer_id?: string;
  engineer_resolution?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}