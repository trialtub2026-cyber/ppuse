export interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT';
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  details: string;
  ip_address: string;
  user_agent?: string;
  status: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  duration_ms?: number;
  tenant_id: string;
}

export interface LogFilters {
  page: number;
  limit?: number;
  user_id?: string;
  action?: string;
  resource_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface LogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SystemMetrics {
  uptime: {
    duration: string;
    percentage: number;
  };
  api_latency: {
    p95: number;
    average: number;
  };
  active_users: number;
  error_rate: number;
  recent_incidents: Array<{
    id: string;
    title: string;
    status: 'resolved' | 'investigating' | 'monitoring';
    severity: 'critical' | 'high' | 'medium' | 'low';
    timestamp: string;
  }>;
  system_resources: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
  };
  database_metrics: {
    connections: number;
    query_time_avg: number;
    storage_used: string;
  };
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  date_range: {
    start: string;
    end: string;
  };
  filters: LogFilters;
  include_fields: string[];
}

export const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-100 text-blue-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
  VIEW: 'bg-purple-100 text-purple-800',
  EXPORT: 'bg-orange-100 text-orange-800',
};

export const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800',
  ERROR: 'bg-red-100 text-red-800',
  WARNING: 'bg-yellow-100 text-yellow-800',
  INFO: 'bg-blue-100 text-blue-800',
};