/**
 * Real Dashboard Service
 * Enterprise dashboard service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  DashboardMetrics, 
  AnalyticsData,
  ApiResponse 
} from '../api/interfaces';
import { IDashboardService } from '../api/apiServiceFactory';

export class RealDashboardService implements IDashboardService {

  /**
   * Get dashboard metrics
   */
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await baseApiService.get<DashboardMetrics>(
        apiConfig.endpoints.dashboard.metrics
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch dashboard metrics');
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(period?: string): Promise<AnalyticsData> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await baseApiService.get<AnalyticsData>(
        `${apiConfig.endpoints.dashboard.analytics}${params}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch analytics data');
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(): Promise<Array<{
    id: string;
    type: string;
    description: string;
    user: { id: string; name: string; avatar?: string };
    createdAt: string;
    metadata?: Record<string, any>;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        type: string;
        description: string;
        user: { id: string; name: string; avatar?: string };
        createdAt: string;
        metadata?: Record<string, any>;
      }>>(`${apiConfig.endpoints.dashboard.metrics}/recent-activity`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch recent activity');
    }
  }

  /**
   * Get widget data
   */
  async getWidgetData(widgetType: string): Promise<any> {
    try {
      const response = await baseApiService.get(
        `${apiConfig.endpoints.dashboard.widgets}/${widgetType}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch widget data');
    }
  }

  /**
   * Get sales overview
   */
  async getSalesOverview(period?: string): Promise<{
    totalRevenue: number;
    totalDeals: number;
    conversionRate: number;
    averageDealSize: number;
    pipelineValue: number;
    trends: Array<{ date: string; revenue: number; deals: number }>;
    topPerformers: Array<{ 
      userId: string; 
      userName: string; 
      revenue: number; 
      deals: number;
    }>;
  }> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await baseApiService.get<{
        totalRevenue: number;
        totalDeals: number;
        conversionRate: number;
        averageDealSize: number;
        pipelineValue: number;
        trends: Array<{ date: string; revenue: number; deals: number }>;
        topPerformers: Array<{ 
          userId: string; 
          userName: string; 
          revenue: number; 
          deals: number;
        }>;
      }>(`${apiConfig.endpoints.dashboard.metrics}/sales-overview${params}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sales overview');
    }
  }

  /**
   * Get customer overview
   */
  async getCustomerOverview(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    churnRate: number;
    customerGrowth: number;
    byIndustry: Array<{ industry: string; count: number }>;
    bySize: Array<{ size: string; count: number }>;
    satisfactionScore: number;
  }> {
    try {
      const response = await baseApiService.get<{
        totalCustomers: number;
        activeCustomers: number;
        newCustomers: number;
        churnRate: number;
        customerGrowth: number;
        byIndustry: Array<{ industry: string; count: number }>;
        bySize: Array<{ size: string; count: number }>;
        satisfactionScore: number;
      }>(`${apiConfig.endpoints.dashboard.metrics}/customer-overview`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch customer overview');
    }
  }

  /**
   * Get support overview
   */
  async getSupportOverview(): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number;
    firstResponseTime: number;
    satisfactionScore: number;
    ticketTrends: Array<{ date: string; created: number; resolved: number }>;
    byPriority: Array<{ priority: string; count: number }>;
    byCategory: Array<{ category: string; count: number }>;
  }> {
    try {
      const response = await baseApiService.get<{
        totalTickets: number;
        openTickets: number;
        resolvedTickets: number;
        averageResolutionTime: number;
        firstResponseTime: number;
        satisfactionScore: number;
        ticketTrends: Array<{ date: string; created: number; resolved: number }>;
        byPriority: Array<{ priority: string; count: number }>;
        byCategory: Array<{ category: string; count: number }>;
      }>(`${apiConfig.endpoints.dashboard.metrics}/support-overview`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch support overview');
    }
  }

  /**
   * Get financial overview
   */
  async getFinancialOverview(period?: string): Promise<{
    totalRevenue: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    revenueGrowth: number;
    profitMargin: number;
    revenueTrends: Array<{ month: string; revenue: number; profit: number }>;
    revenueBySource: Array<{ source: string; amount: number; percentage: number }>;
    upcomingRenewals: number;
    churnRisk: number;
  }> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await baseApiService.get<{
        totalRevenue: number;
        monthlyRecurringRevenue: number;
        annualRecurringRevenue: number;
        revenueGrowth: number;
        profitMargin: number;
        revenueTrends: Array<{ month: string; revenue: number; profit: number }>;
        revenueBySource: Array<{ source: string; amount: number; percentage: number }>;
        upcomingRenewals: number;
        churnRisk: number;
      }>(`${apiConfig.endpoints.dashboard.metrics}/financial-overview${params}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch financial overview');
    }
  }

  /**
   * Get team performance
   */
  async getTeamPerformance(): Promise<{
    totalUsers: number;
    activeUsers: number;
    teamProductivity: number;
    averageTaskCompletion: number;
    topPerformers: Array<{
      userId: string;
      userName: string;
      avatar?: string;
      score: number;
      tasksCompleted: number;
      efficiency: number;
    }>;
    departmentPerformance: Array<{
      department: string;
      members: number;
      productivity: number;
      satisfaction: number;
    }>;
  }> {
    try {
      const response = await baseApiService.get<{
        totalUsers: number;
        activeUsers: number;
        teamProductivity: number;
        averageTaskCompletion: number;
        topPerformers: Array<{
          userId: string;
          userName: string;
          avatar?: string;
          score: number;
          tasksCompleted: number;
          efficiency: number;
        }>;
        departmentPerformance: Array<{
          department: string;
          members: number;
          productivity: number;
          satisfaction: number;
        }>;
      }>(`${apiConfig.endpoints.dashboard.metrics}/team-performance`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch team performance');
    }
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    systemLoad: number;
    memoryUsage: number;
    diskUsage: number;
    services: Array<{
      name: string;
      status: 'online' | 'offline' | 'degraded';
      responseTime: number;
      lastCheck: string;
    }>;
  }> {
    try {
      const response = await baseApiService.get<{
        status: 'healthy' | 'warning' | 'critical';
        uptime: number;
        responseTime: number;
        errorRate: number;
        activeUsers: number;
        systemLoad: number;
        memoryUsage: number;
        diskUsage: number;
        services: Array<{
          name: string;
          status: 'online' | 'offline' | 'degraded';
          responseTime: number;
          lastCheck: string;
        }>;
      }>(`${apiConfig.endpoints.dashboard.metrics}/system-health`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch system health');
    }
  }

  /**
   * Get custom reports
   */
  async getCustomReports(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    createdBy: { id: string; name: string };
    createdAt: string;
    lastRun: string;
    parameters: Record<string, any>;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        name: string;
        description: string;
        type: string;
        createdBy: { id: string; name: string };
        createdAt: string;
        lastRun: string;
        parameters: Record<string, any>;
      }>>(apiConfig.endpoints.dashboard.reports);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch custom reports');
    }
  }

  /**
   * Generate custom report
   */
  async generateCustomReport(reportId: string, parameters?: Record<string, any>): Promise<{
    reportId: string;
    data: any;
    generatedAt: string;
    format: string;
  }> {
    try {
      const response = await baseApiService.post<{
        reportId: string;
        data: any;
        generatedAt: string;
        format: string;
      }>(`${apiConfig.endpoints.dashboard.reports}/${reportId}/generate`, { parameters });

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate custom report');
    }
  }

  /**
   * Export dashboard data
   */
  async exportDashboardData(format: 'csv' | 'json' | 'xlsx' = 'csv', widgets?: string[]): Promise<string> {
    try {
      const params = new URLSearchParams({ format });
      
      if (widgets && widgets.length > 0) {
        widgets.forEach(widget => params.append('widgets', widget));
      }

      const response = await baseApiService.get(
        `${apiConfig.endpoints.dashboard.metrics}/export?${params.toString()}`,
        { responseType: 'blob' } as any
      );

      if (format === 'xlsx') {
        const blob = new Blob([response.data]);
        return URL.createObjectURL(blob);
      } else {
        return await response.data.text();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export dashboard data');
    }
  }
}