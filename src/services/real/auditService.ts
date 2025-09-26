/**
 * Real Audit Service
 * Enterprise audit logging service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  AuditLogResponse, 
  AuditLogFilters,
  PaginationParams,
  ApiResponse 
} from '../api/interfaces';
import { IAuditService } from '../api/apiServiceFactory';

export class RealAuditService implements IAuditService {

  /**
   * Get audit logs with filters and pagination
   */
  async getAuditLogs(filters?: AuditLogFilters & PaginationParams): Promise<AuditLogResponse[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await baseApiService.get<AuditLogResponse[]>(
        `${apiConfig.endpoints.audit.logs}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch audit logs');
    }
  }

  /**
   * Get single audit log by ID
   */
  async getAuditLog(id: string): Promise<AuditLogResponse> {
    try {
      const response = await baseApiService.get<AuditLogResponse>(
        `${apiConfig.endpoints.audit.logs}/${id}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch audit log');
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(query: string, filters?: AuditLogFilters): Promise<AuditLogResponse[]> {
    try {
      const params = new URLSearchParams({ q: query });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await baseApiService.get<AuditLogResponse[]>(
        `${apiConfig.endpoints.audit.search}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search audit logs');
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(format: 'csv' | 'json' | 'xlsx' = 'csv', filters?: AuditLogFilters): Promise<string> {
    try {
      const params = new URLSearchParams({ format });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await baseApiService.get(
        `${apiConfig.endpoints.audit.export}?${params.toString()}`,
        { responseType: 'blob' } as any
      );

      if (format === 'xlsx') {
        const blob = new Blob([response.data]);
        return URL.createObjectURL(blob);
      } else {
        return await response.data.text();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export audit logs');
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(period?: string): Promise<{
    totalLogs: number;
    uniqueUsers: number;
    uniqueResources: number;
    topActions: Array<{ action: string; count: number }>;
    topUsers: Array<{ userId: string; userName: string; count: number }>;
    topResources: Array<{ resource: string; count: number }>;
    activityTrends: Array<{ date: string; count: number }>;
    riskEvents: number;
  }> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await baseApiService.get<{
        totalLogs: number;
        uniqueUsers: number;
        uniqueResources: number;
        topActions: Array<{ action: string; count: number }>;
        topUsers: Array<{ userId: string; userName: string; count: number }>;
        topResources: Array<{ resource: string; count: number }>;
        activityTrends: Array<{ date: string; count: number }>;
        riskEvents: number;
      }>(`${apiConfig.endpoints.audit.logs}/stats${params}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch audit statistics');
    }
  }

  /**
   * Get resource audit trail
   */
  async getResourceAuditTrail(resource: string, resourceId: string): Promise<AuditLogResponse[]> {
    try {
      const response = await baseApiService.get<AuditLogResponse[]>(
        `${apiConfig.endpoints.audit.logs}/resource/${resource}/${resourceId}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch resource audit trail');
    }
  }

  /**
   * Get user audit trail
   */
  async getUserAuditTrail(userId: string, limit?: number): Promise<AuditLogResponse[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await baseApiService.get<AuditLogResponse[]>(
        `${apiConfig.endpoints.audit.logs}/user/${userId}${params}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user audit trail');
    }
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(standard: string, period?: string): Promise<{
    standard: string;
    period: string;
    compliance: {
      score: number;
      status: 'compliant' | 'non-compliant' | 'partial';
      requirements: Array<{
        id: string;
        name: string;
        status: 'met' | 'not-met' | 'partial';
        evidence: Array<{ type: string; description: string; logIds: string[] }>;
      }>;
    };
    recommendations: Array<{
      priority: 'high' | 'medium' | 'low';
      description: string;
      actions: string[];
    }>;
    generatedAt: string;
  }> {
    try {
      const params = new URLSearchParams({ standard });
      if (period) params.append('period', period);

      const response = await baseApiService.get<{
        standard: string;
        period: string;
        compliance: {
          score: number;
          status: 'compliant' | 'non-compliant' | 'partial';
          requirements: Array<{
            id: string;
            name: string;
            status: 'met' | 'not-met' | 'partial';
            evidence: Array<{ type: string; description: string; logIds: string[] }>;
          }>;
        };
        recommendations: Array<{
          priority: 'high' | 'medium' | 'low';
          description: string;
          actions: string[];
        }>;
        generatedAt: string;
      }>(`${apiConfig.endpoints.audit.logs}/compliance?${params.toString()}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate compliance report');
    }
  }

  /**
   * Get security events
   */
  async getSecurityEvents(severity?: 'low' | 'medium' | 'high' | 'critical'): Promise<Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    user?: { id: string; name: string };
    ipAddress: string;
    userAgent: string;
    metadata: Record<string, any>;
    createdAt: string;
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: { id: string; name: string };
  }>> {
    try {
      const params = severity ? `?severity=${severity}` : '';
      const response = await baseApiService.get<Array<{
        id: string;
        type: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        user?: { id: string; name: string };
        ipAddress: string;
        userAgent: string;
        metadata: Record<string, any>;
        createdAt: string;
        resolved: boolean;
        resolvedAt?: string;
        resolvedBy?: { id: string; name: string };
      }>>(`${apiConfig.endpoints.audit.logs}/security-events${params}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch security events');
    }
  }

  /**
   * Resolve security event
   */
  async resolveSecurityEvent(eventId: string, resolution: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.audit.logs}/security-events/${eventId}/resolve`,
        { resolution }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resolve security event');
    }
  }

  /**
   * Get data retention policies
   */
  async getRetentionPolicies(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    retentionPeriod: number; // days
    resourceTypes: string[];
    actions: string[];
    isActive: boolean;
    createdAt: string;
    lastApplied?: string;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        name: string;
        description: string;
        retentionPeriod: number;
        resourceTypes: string[];
        actions: string[];
        isActive: boolean;
        createdAt: string;
        lastApplied?: string;
      }>>(`${apiConfig.endpoints.audit.logs}/retention-policies`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch retention policies');
    }
  }

  /**
   * Apply retention policy
   */
  async applyRetentionPolicy(policyId: string): Promise<{
    deletedLogs: number;
    archivedLogs: number;
    processedAt: string;
  }> {
    try {
      const response = await baseApiService.post<{
        deletedLogs: number;
        archivedLogs: number;
        processedAt: string;
      }>(`${apiConfig.endpoints.audit.logs}/retention-policies/${policyId}/apply`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to apply retention policy');
    }
  }

  /**
   * Get audit log integrity verification
   */
  async verifyLogIntegrity(logIds?: string[]): Promise<{
    verified: boolean;
    totalLogs: number;
    verifiedLogs: number;
    tamperedLogs: Array<{
      id: string;
      expectedHash: string;
      actualHash: string;
      tamperedAt?: string;
    }>;
    verificationMethod: string;
    verifiedAt: string;
  }> {
    try {
      const body = logIds ? { logIds } : undefined;
      const response = await baseApiService.post<{
        verified: boolean;
        totalLogs: number;
        verifiedLogs: number;
        tamperedLogs: Array<{
          id: string;
          expectedHash: string;
          actualHash: string;
          tamperedAt?: string;
        }>;
        verificationMethod: string;
        verifiedAt: string;
      }>(`${apiConfig.endpoints.audit.logs}/verify-integrity`, body);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify log integrity');
    }
  }

  /**
   * Create audit alert rule
   */
  async createAuditAlert(alertRule: {
    name: string;
    description: string;
    conditions: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
      value: string;
    }>;
    actions: Array<{
      type: 'email' | 'webhook' | 'notification';
      target: string;
      template?: string;
    }>;
    isActive: boolean;
  }): Promise<{
    id: string;
    name: string;
    description: string;
    conditions: Array<{
      field: string;
      operator: string;
      value: string;
    }>;
    actions: Array<{
      type: string;
      target: string;
      template?: string;
    }>;
    isActive: boolean;
    createdAt: string;
  }> {
    try {
      const response = await baseApiService.post<{
        id: string;
        name: string;
        description: string;
        conditions: Array<{
          field: string;
          operator: string;
          value: string;
        }>;
        actions: Array<{
          type: string;
          target: string;
          template?: string;
        }>;
        isActive: boolean;
        createdAt: string;
      }>(`${apiConfig.endpoints.audit.logs}/alerts`, alertRule);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create audit alert');
    }
  }
}