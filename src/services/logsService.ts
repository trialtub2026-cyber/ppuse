import { AuditLog, LogFilters, LogsResponse, SystemMetrics } from '@/types/logs';

class LogsService {
  private baseUrl = '/api/logs';

  // Mock audit logs data
  private mockLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
      user_id: '1',
      user_name: 'John Admin',
      user_email: 'admin@company.com',
      action: 'LOGIN',
      resource_type: 'Authentication',
      details: 'User logged in successfully',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'SUCCESS',
      duration_ms: 1250,
      tenant_id: 'tenant_1'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      user_id: '2',
      user_name: 'Sarah Manager',
      user_email: 'manager@company.com',
      action: 'CREATE',
      resource_type: 'Customer',
      resource_id: 'cust_123',
      resource_name: 'Acme Corporation',
      details: 'Created new customer record',
      ip_address: '192.168.1.101',
      status: 'SUCCESS',
      duration_ms: 850,
      tenant_id: 'tenant_1'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      user_id: '3',
      user_name: 'Mike Agent',
      user_email: 'agent@company.com',
      action: 'UPDATE',
      resource_type: 'Ticket',
      resource_id: 'ticket_456',
      resource_name: 'Support Request #456',
      details: 'Updated ticket status to resolved',
      ip_address: '192.168.1.102',
      status: 'SUCCESS',
      duration_ms: 650,
      tenant_id: 'tenant_1'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      user_id: '1',
      user_name: 'John Admin',
      user_email: 'admin@company.com',
      action: 'DELETE',
      resource_type: 'User',
      resource_id: 'user_789',
      resource_name: 'test@example.com',
      details: 'Deleted inactive user account',
      ip_address: '192.168.1.100',
      status: 'SUCCESS',
      duration_ms: 1100,
      tenant_id: 'tenant_1'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      user_id: '2',
      user_name: 'Sarah Manager',
      user_email: 'manager@company.com',
      action: 'EXPORT',
      resource_type: 'Report',
      details: 'Exported customer analytics report',
      ip_address: '192.168.1.101',
      status: 'SUCCESS',
      duration_ms: 2300,
      tenant_id: 'tenant_1'
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
      user_id: '3',
      user_name: 'Mike Agent',
      user_email: 'agent@company.com',
      action: 'VIEW',
      resource_type: 'Customer',
      resource_id: 'cust_456',
      resource_name: 'Tech Solutions Inc',
      details: 'Viewed customer profile and history',
      ip_address: '192.168.1.102',
      status: 'SUCCESS',
      duration_ms: 450,
      tenant_id: 'tenant_1'
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      user_id: '1',
      user_name: 'John Admin',
      user_email: 'admin@company.com',
      action: 'CREATE',
      resource_type: 'Tenant',
      resource_id: 'tenant_2',
      resource_name: 'New Organization',
      details: 'Created new tenant configuration',
      ip_address: '192.168.1.100',
      status: 'SUCCESS',
      duration_ms: 1850,
      tenant_id: 'tenant_1'
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(), // 2.5 hours ago
      user_id: '2',
      user_name: 'Sarah Manager',
      user_email: 'manager@company.com',
      action: 'UPDATE',
      resource_type: 'Deal',
      resource_id: 'deal_789',
      resource_name: 'Enterprise Contract',
      details: 'Updated deal value and close date',
      ip_address: '192.168.1.101',
      status: 'WARNING',
      duration_ms: 950,
      tenant_id: 'tenant_1'
    }
  ];

  // Mock system metrics
  private mockSystemMetrics: SystemMetrics = {
    uptime: {
      duration: '15d 8h 32m',
      percentage: 99.97
    },
    api_latency: {
      p95: 245,
      average: 89
    },
    active_users: 127,
    error_rate: 0.02,
    recent_incidents: [
      {
        id: 'inc_1',
        title: 'Database connection timeout',
        status: 'resolved',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      },
      {
        id: 'inc_2',
        title: 'High API response times',
        status: 'monitoring',
        severity: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ],
    system_resources: {
      cpu_usage: 34,
      memory_usage: 67,
      disk_usage: 45
    },
    database_metrics: {
      connections: 23,
      query_time_avg: 12.5,
      storage_used: '2.4 GB'
    }
  };

  async getLogs(filters: LogFilters): Promise<LogsResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredLogs = [...this.mockLogs];

    // Apply filters
    if (filters.user_id) {
      filteredLogs = filteredLogs.filter(log => log.user_id === filters.user_id);
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters.resource_type) {
      filteredLogs = filteredLogs.filter(log => 
        log.resource_type.toLowerCase().includes(filters.resource_type!.toLowerCase())
      );
    }

    if (filters.status) {
      filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.user_name.toLowerCase().includes(searchTerm) ||
        log.details.toLowerCase().includes(searchTerm) ||
        log.resource_name?.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.start_date) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.start_date!)
      );
    }

    if (filters.end_date) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.end_date!)
      );
    }

    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Pagination
    const total = filteredLogs.length;
    const totalPages = Math.ceil(total / filters.limit);
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    return {
      logs: paginatedLogs,
      total,
      page: filters.page,
      limit: filters.limit,
      total_pages: totalPages
    };
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Add some randomness to make it feel more real-time
    const metrics = { ...this.mockSystemMetrics };
    
    // Slightly randomize some values
    metrics.active_users += Math.floor(Math.random() * 10) - 5;
    metrics.api_latency.average += Math.floor(Math.random() * 20) - 10;
    metrics.api_latency.p95 += Math.floor(Math.random() * 50) - 25;
    metrics.system_resources.cpu_usage += Math.floor(Math.random() * 10) - 5;
    metrics.system_resources.memory_usage += Math.floor(Math.random() * 6) - 3;
    metrics.database_metrics.connections += Math.floor(Math.random() * 6) - 3;

    // Ensure values stay within reasonable bounds
    metrics.active_users = Math.max(100, Math.min(200, metrics.active_users));
    metrics.api_latency.average = Math.max(50, Math.min(150, metrics.api_latency.average));
    metrics.api_latency.p95 = Math.max(150, Math.min(400, metrics.api_latency.p95));
    metrics.system_resources.cpu_usage = Math.max(20, Math.min(80, metrics.system_resources.cpu_usage));
    metrics.system_resources.memory_usage = Math.max(50, Math.min(90, metrics.system_resources.memory_usage));
    metrics.database_metrics.connections = Math.max(15, Math.min(50, metrics.database_metrics.connections));

    return metrics;
  }

  async exportLogs(filters: LogFilters, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<Blob> {
    // Get all logs matching filters (without pagination)
    const allFilters = { ...filters, page: 1, limit: 10000 };
    const response = await this.getLogs(allFilters);

    if (format === 'csv') {
      const csvContent = this.convertToCSV(response.logs);
      return new Blob([csvContent], { type: 'text/csv' });
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(response.logs, null, 2);
      return new Blob([jsonContent], { type: 'application/json' });
    } else {
      // For XLSX, we'll just return CSV for now (would need a library like xlsx for real XLSX)
      const csvContent = this.convertToCSV(response.logs);
      return new Blob([csvContent], { type: 'text/csv' });
    }
  }

  private convertToCSV(logs: AuditLog[]): string {
    const headers = [
      'Timestamp',
      'User Name',
      'User Email',
      'Action',
      'Resource Type',
      'Resource Name',
      'Details',
      'IP Address',
      'Status',
      'Duration (ms)'
    ];

    const rows = logs.map(log => [
      log.timestamp,
      log.user_name,
      log.user_email,
      log.action,
      log.resource_type,
      log.resource_name || '',
      log.details,
      log.ip_address,
      log.status,
      log.duration_ms?.toString() || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

export const logsService = new LogsService();