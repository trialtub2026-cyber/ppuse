/**
 * Real Customer Service
 * Enterprise customer management service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  CustomerRequest, 
  CustomerResponse, 
  CustomerFilters,
  BulkCustomerOperation,
  PaginationParams,
  ApiResponse 
} from '../api/interfaces';
import { ICustomerService } from '../api/apiServiceFactory';

export class RealCustomerService implements ICustomerService {

  /**
   * Get customers with filters and pagination
   */
  async getCustomers(filters?: CustomerFilters & PaginationParams): Promise<CustomerResponse[]> {
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

      const response = await baseApiService.get<CustomerResponse[]>(
        `${apiConfig.endpoints.customers.base}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch customers');
    }
  }

  /**
   * Get single customer by ID
   */
  async getCustomer(id: string): Promise<CustomerResponse> {
    try {
      const response = await baseApiService.get<CustomerResponse>(
        `${apiConfig.endpoints.customers.base}/${id}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch customer');
    }
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData: CustomerRequest): Promise<CustomerResponse> {
    try {
      const response = await baseApiService.post<CustomerResponse>(
        apiConfig.endpoints.customers.base,
        customerData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create customer');
    }
  }

  /**
   * Update existing customer
   */
  async updateCustomer(id: string, updates: Partial<CustomerRequest>): Promise<CustomerResponse> {
    try {
      const response = await baseApiService.put<CustomerResponse>(
        `${apiConfig.endpoints.customers.base}/${id}`,
        updates
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update customer');
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.customers.base}/${id}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete customer');
    }
  }

  /**
   * Bulk delete customers
   */
  async bulkDeleteCustomers(ids: string[]): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.customers.bulk}/delete`,
        { customerIds: ids }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete customers');
    }
  }

  /**
   * Bulk update customers
   */
  async bulkUpdateCustomers(ids: string[], updates: Partial<CustomerRequest>): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.customers.bulk}/update`,
        { 
          customerIds: ids,
          data: updates 
        }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update customers');
    }
  }

  /**
   * Bulk assign customers to user
   */
  async bulkAssignCustomers(ids: string[], assignedTo: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.customers.bulk}/assign`,
        { 
          customerIds: ids,
          assignedTo 
        }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to assign customers');
    }
  }

  /**
   * Bulk tag customers
   */
  async bulkTagCustomers(ids: string[], tagIds: string[]): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.customers.bulk}/tag`,
        { 
          customerIds: ids,
          tagIds 
        }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to tag customers');
    }
  }

  /**
   * Search customers
   */
  async searchCustomers(query: string, filters?: CustomerFilters): Promise<CustomerResponse[]> {
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

      const response = await baseApiService.get<CustomerResponse[]>(
        `${apiConfig.endpoints.customers.search}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search customers');
    }
  }

  /**
   * Get customer tags
   */
  async getTags(): Promise<Array<{ id: string; name: string; color: string }>> {
    try {
      const response = await baseApiService.get<Array<{ id: string; name: string; color: string }>>(
        apiConfig.endpoints.customers.tags
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tags');
    }
  }

  /**
   * Create new tag
   */
  async createTag(name: string, color: string): Promise<{ id: string; name: string; color: string }> {
    try {
      const response = await baseApiService.post<{ id: string; name: string; color: string }>(
        apiConfig.endpoints.customers.tags,
        { name, color }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create tag');
    }
  }

  /**
   * Update tag
   */
  async updateTag(id: string, name: string, color: string): Promise<{ id: string; name: string; color: string }> {
    try {
      const response = await baseApiService.put<{ id: string; name: string; color: string }>(
        `${apiConfig.endpoints.customers.tags}/${id}`,
        { name, color }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update tag');
    }
  }

  /**
   * Delete tag
   */
  async deleteTag(id: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.customers.tags}/${id}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete tag');
    }
  }

  /**
   * Export customers
   */
  async exportCustomers(format: 'csv' | 'json' | 'xlsx' = 'csv', filters?: CustomerFilters): Promise<string> {
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
        `${apiConfig.endpoints.customers.export}?${params.toString()}`,
        { responseType: 'blob' } as any
      );

      // Convert blob to string for CSV/JSON or return blob URL for Excel
      if (format === 'xlsx') {
        const blob = new Blob([response.data]);
        return URL.createObjectURL(blob);
      } else {
        return await response.data.text();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export customers');
    }
  }

  /**
   * Import customers from CSV/Excel
   */
  async importCustomers(file: File): Promise<{ success: number; errors: string[] }> {
    try {
      const response = await baseApiService.uploadFile<{ success: number; errors: string[] }>(
        apiConfig.endpoints.customers.import,
        file
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to import customers');
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(): Promise<{
    total: number;
    active: number;
    prospects: number;
    byIndustry: Record<string, number>;
    bySize: Record<string, number>;
    recentlyAdded: number;
  }> {
    try {
      const response = await baseApiService.get<{
        total: number;
        active: number;
        prospects: number;
        byIndustry: Record<string, number>;
        bySize: Record<string, number>;
        recentlyAdded: number;
      }>(`${apiConfig.endpoints.customers.base}/stats`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch customer statistics');
    }
  }

  /**
   * Get customer activity timeline
   */
  async getCustomerActivity(customerId: string): Promise<Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    user: { id: string; name: string };
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        type: string;
        description: string;
        createdAt: string;
        user: { id: string; name: string };
      }>>(`${apiConfig.endpoints.customers.base}/${customerId}/activity`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch customer activity');
    }
  }

  /**
   * Get customer notes
   */
  async getCustomerNotes(customerId: string): Promise<Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        content: string;
        createdAt: string;
        user: { id: string; name: string };
      }>>(`${apiConfig.endpoints.customers.base}/${customerId}/notes`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch customer notes');
    }
  }

  /**
   * Add customer note
   */
  async addCustomerNote(customerId: string, content: string): Promise<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
  }> {
    try {
      const response = await baseApiService.post<{
        id: string;
        content: string;
        createdAt: string;
        user: { id: string; name: string };
      }>(`${apiConfig.endpoints.customers.base}/${customerId}/notes`, { content });

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add customer note');
    }
  }

  /**
   * Get available industries
   */
  async getIndustries(): Promise<string[]> {
    try {
      const response = await baseApiService.get<string[]>(
        `${apiConfig.endpoints.customers.base}/industries`
      );

      return response.data;
    } catch (error: any) {
      // Fallback to default industries
      return [
        'Technology',
        'Manufacturing',
        'Healthcare',
        'Finance',
        'Retail',
        'Education',
        'Real Estate',
        'Consulting',
        'Other'
      ];
    }
  }

  /**
   * Get available company sizes
   */
  async getSizes(): Promise<string[]> {
    try {
      const response = await baseApiService.get<string[]>(
        `${apiConfig.endpoints.customers.base}/sizes`
      );

      return response.data;
    } catch (error: any) {
      // Fallback to default sizes
      return ['startup', 'small', 'medium', 'enterprise'];
    }
  }

  /**
   * Get customer duplicate suggestions
   */
  async getDuplicateSuggestions(customerData: Partial<CustomerRequest>): Promise<CustomerResponse[]> {
    try {
      const response = await baseApiService.post<CustomerResponse[]>(
        `${apiConfig.endpoints.customers.base}/duplicates`,
        customerData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check for duplicates');
    }
  }

  /**
   * Merge customers
   */
  async mergeCustomers(primaryId: string, secondaryIds: string[]): Promise<CustomerResponse> {
    try {
      const response = await baseApiService.post<CustomerResponse>(
        `${apiConfig.endpoints.customers.base}/${primaryId}/merge`,
        { secondaryIds }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to merge customers');
    }
  }
}