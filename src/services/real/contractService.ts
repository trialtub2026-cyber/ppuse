/**
 * Real Contract Service
 * Enterprise contract management service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  ContractRequest, 
  ContractResponse, 
  PaginationParams,
  FilterParams,
  ApiResponse 
} from '../api/interfaces';
import { IContractService } from '../api/apiServiceFactory';

export class RealContractService implements IContractService {

  /**
   * Get contracts with filters and pagination
   */
  async getContracts(filters?: FilterParams & PaginationParams): Promise<ContractResponse[]> {
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

      const response = await baseApiService.get<ContractResponse[]>(
        `${apiConfig.endpoints.contracts.base}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch contracts');
    }
  }

  /**
   * Get single contract by ID
   */
  async getContract(id: string): Promise<ContractResponse> {
    try {
      const response = await baseApiService.get<ContractResponse>(
        `${apiConfig.endpoints.contracts.base}/${id}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch contract');
    }
  }

  /**
   * Create new contract
   */
  async createContract(contractData: ContractRequest): Promise<ContractResponse> {
    try {
      const response = await baseApiService.post<ContractResponse>(
        apiConfig.endpoints.contracts.base,
        contractData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create contract');
    }
  }

  /**
   * Update existing contract
   */
  async updateContract(id: string, updates: Partial<ContractRequest>): Promise<ContractResponse> {
    try {
      const response = await baseApiService.put<ContractResponse>(
        `${apiConfig.endpoints.contracts.base}/${id}`,
        updates
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update contract');
    }
  }

  /**
   * Delete contract
   */
  async deleteContract(id: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.contracts.base}/${id}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete contract');
    }
  }

  /**
   * Get contract types
   */
  async getContractTypes(): Promise<Array<{ id: string; name: string; description?: string }>> {
    try {
      const response = await baseApiService.get<Array<{ id: string; name: string; description?: string }>>(
        `${apiConfig.endpoints.contracts.base}/types`
      );

      return response.data;
    } catch (error: any) {
      // Fallback to default types
      return [
        { id: 'service', name: 'Service Contract' },
        { id: 'product', name: 'Product Contract' },
        { id: 'maintenance', name: 'Maintenance Contract' },
        { id: 'support', name: 'Support Contract' },
      ];
    }
  }

  /**
   * Get contract analytics
   */
  async getContractAnalytics(): Promise<{
    totalValue: number;
    activeContracts: number;
    expiringContracts: number;
    renewalRate: number;
    averageContractValue: number;
    byType: Array<{ type: string; count: number; value: number }>;
    byStatus: Array<{ status: string; count: number; value: number }>;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  }> {
    try {
      const response = await baseApiService.get<{
        totalValue: number;
        activeContracts: number;
        expiringContracts: number;
        renewalRate: number;
        averageContractValue: number;
        byType: Array<{ type: string; count: number; value: number }>;
        byStatus: Array<{ status: string; count: number; value: number }>;
        monthlyRevenue: Array<{ month: string; revenue: number }>;
      }>(apiConfig.endpoints.contracts.analytics);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch contract analytics');
    }
  }

  /**
   * Get contract templates
   */
  async getContractTemplates(): Promise<Array<{
    id: string;
    name: string;
    type: string;
    content: string;
    variables: Array<{ name: string; type: string; required: boolean }>;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        name: string;
        type: string;
        content: string;
        variables: Array<{ name: string; type: string; required: boolean }>;
      }>>(apiConfig.endpoints.contracts.templates);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch contract templates');
    }
  }

  /**
   * Create contract from template
   */
  async createContractFromTemplate(templateId: string, variables: Record<string, any>): Promise<ContractResponse> {
    try {
      const response = await baseApiService.post<ContractResponse>(
        `${apiConfig.endpoints.contracts.templates}/${templateId}/create`,
        { variables }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create contract from template');
    }
  }

  /**
   * Get contracts expiring soon
   */
  async getExpiringContracts(days: number = 30): Promise<ContractResponse[]> {
    try {
      const response = await baseApiService.get<ContractResponse[]>(
        `${apiConfig.endpoints.contracts.base}/expiring?days=${days}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch expiring contracts');
    }
  }

  /**
   * Get renewal opportunities
   */
  async getRenewalOpportunities(): Promise<Array<{
    contract: ContractResponse;
    renewalProbability: number;
    recommendedAction: string;
    estimatedValue: number;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        contract: ContractResponse;
        renewalProbability: number;
        recommendedAction: string;
        estimatedValue: number;
      }>>(apiConfig.endpoints.contracts.renewals);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch renewal opportunities');
    }
  }

  /**
   * Renew contract
   */
  async renewContract(contractId: string, renewalData: {
    newEndDate: string;
    newValue?: number;
    terms?: string;
  }): Promise<ContractResponse> {
    try {
      const response = await baseApiService.post<ContractResponse>(
        `${apiConfig.endpoints.contracts.base}/${contractId}/renew`,
        renewalData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to renew contract');
    }
  }

  /**
   * Terminate contract
   */
  async terminateContract(contractId: string, reason: string): Promise<ContractResponse> {
    try {
      const response = await baseApiService.post<ContractResponse>(
        `${apiConfig.endpoints.contracts.base}/${contractId}/terminate`,
        { reason }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to terminate contract');
    }
  }

  /**
   * Upload contract document
   */
  async uploadContractDocument(contractId: string, file: File): Promise<{
    id: string;
    filename: string;
    url: string;
  }> {
    try {
      const response = await baseApiService.uploadFile<{
        id: string;
        filename: string;
        url: string;
      }>(`${apiConfig.endpoints.contracts.base}/${contractId}/documents`, file);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload contract document');
    }
  }

  /**
   * Generate contract PDF
   */
  async generateContractPDF(contractId: string): Promise<string> {
    try {
      const response = await baseApiService.get(
        `${apiConfig.endpoints.contracts.base}/${contractId}/pdf`,
        { responseType: 'blob' } as any
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate contract PDF');
    }
  }

  /**
   * Get contract history
   */
  async getContractHistory(contractId: string): Promise<Array<{
    id: string;
    action: string;
    description: string;
    user: { id: string; name: string };
    createdAt: string;
    changes?: Record<string, any>;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        action: string;
        description: string;
        user: { id: string; name: string };
        createdAt: string;
        changes?: Record<string, any>;
      }>>(`${apiConfig.endpoints.contracts.base}/${contractId}/history`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch contract history');
    }
  }

  /**
   * Export contracts
   */
  async exportContracts(format: 'csv' | 'json' | 'xlsx' = 'csv', filters?: FilterParams): Promise<string> {
    try {
      const params = new URLSearchParams({ format });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await baseApiService.get(
        `${apiConfig.endpoints.contracts.base}/export?${params.toString()}`,
        { responseType: 'blob' } as any
      );

      if (format === 'xlsx') {
        const blob = new Blob([response.data]);
        return URL.createObjectURL(blob);
      } else {
        return await response.data.text();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export contracts');
    }
  }
}