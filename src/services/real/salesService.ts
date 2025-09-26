/**
 * Real Sales Service
 * Enterprise sales management service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  SaleRequest, 
  SaleResponse, 
  PaginationParams,
  FilterParams,
  ApiResponse 
} from '../api/interfaces';
import { ISalesService } from '../api/apiServiceFactory';

export class RealSalesService implements ISalesService {

  /**
   * Get sales with filters and pagination
   */
  async getSales(filters?: FilterParams & PaginationParams): Promise<SaleResponse[]> {
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

      const response = await baseApiService.get<SaleResponse[]>(
        `${apiConfig.endpoints.sales.base}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sales');
    }
  }

  /**
   * Get single sale by ID
   */
  async getSale(id: string): Promise<SaleResponse> {
    try {
      const response = await baseApiService.get<SaleResponse>(
        `${apiConfig.endpoints.sales.base}/${id}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sale');
    }
  }

  /**
   * Create new sale
   */
  async createSale(saleData: SaleRequest): Promise<SaleResponse> {
    try {
      const response = await baseApiService.post<SaleResponse>(
        apiConfig.endpoints.sales.base,
        saleData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create sale');
    }
  }

  /**
   * Update existing sale
   */
  async updateSale(id: string, updates: Partial<SaleRequest>): Promise<SaleResponse> {
    try {
      const response = await baseApiService.put<SaleResponse>(
        `${apiConfig.endpoints.sales.base}/${id}`,
        updates
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update sale');
    }
  }

  /**
   * Delete sale
   */
  async deleteSale(id: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.sales.base}/${id}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete sale');
    }
  }

  /**
   * Get pipeline stages
   */
  async getPipelineStages(): Promise<Array<{ id: string; name: string; order: number; color: string }>> {
    try {
      const response = await baseApiService.get<Array<{ id: string; name: string; order: number; color: string }>>(
        `${apiConfig.endpoints.sales.pipeline}/stages`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch pipeline stages');
    }
  }

  /**
   * Get sales analytics
   */
  async getSalesAnalytics(period?: string): Promise<{
    totalRevenue: number;
    totalDeals: number;
    conversionRate: number;
    averageDealSize: number;
    pipelineValue: number;
    trends: Array<{ date: string; revenue: number; deals: number }>;
    byStage: Array<{ stage: string; count: number; value: number }>;
    byUser: Array<{ userId: string; userName: string; deals: number; revenue: number }>;
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
        byStage: Array<{ stage: string; count: number; value: number }>;
        byUser: Array<{ userId: string; userName: string; deals: number; revenue: number }>;
      }>(`${apiConfig.endpoints.sales.analytics}${params}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sales analytics');
    }
  }

  /**
   * Get sales forecasting
   */
  async getSalesForecasting(): Promise<{
    currentQuarter: { target: number; actual: number; forecast: number };
    nextQuarter: { target: number; forecast: number };
    monthlyForecast: Array<{ month: string; forecast: number; confidence: number }>;
  }> {
    try {
      const response = await baseApiService.get<{
        currentQuarter: { target: number; actual: number; forecast: number };
        nextQuarter: { target: number; forecast: number };
        monthlyForecast: Array<{ month: string; forecast: number; confidence: number }>;
      }>(apiConfig.endpoints.sales.forecasting);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sales forecasting');
    }
  }

  /**
   * Move sale to different stage
   */
  async moveSaleToStage(saleId: string, stageId: string): Promise<SaleResponse> {
    try {
      const response = await baseApiService.patch<SaleResponse>(
        `${apiConfig.endpoints.sales.base}/${saleId}/stage`,
        { stageId }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to move sale to stage');
    }
  }

  /**
   * Get sales pipeline overview
   */
  async getPipelineOverview(): Promise<{
    stages: Array<{
      id: string;
      name: string;
      deals: SaleResponse[];
      totalValue: number;
      count: number;
    }>;
    totalPipelineValue: number;
    weightedPipelineValue: number;
  }> {
    try {
      const response = await baseApiService.get<{
        stages: Array<{
          id: string;
          name: string;
          deals: SaleResponse[];
          totalValue: number;
          count: number;
        }>;
        totalPipelineValue: number;
        weightedPipelineValue: number;
      }>(apiConfig.endpoints.sales.pipeline);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch pipeline overview');
    }
  }

  /**
   * Get sales leaderboard
   */
  async getSalesLeaderboard(period?: string): Promise<Array<{
    userId: string;
    userName: string;
    avatar?: string;
    dealsWon: number;
    revenue: number;
    conversionRate: number;
    rank: number;
  }>> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await baseApiService.get<Array<{
        userId: string;
        userName: string;
        avatar?: string;
        dealsWon: number;
        revenue: number;
        conversionRate: number;
        rank: number;
      }>>(`${apiConfig.endpoints.sales.base}/leaderboard${params}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sales leaderboard');
    }
  }

  /**
   * Get sales activities for a deal
   */
  async getSaleActivities(saleId: string): Promise<Array<{
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
      }>>(`${apiConfig.endpoints.sales.base}/${saleId}/activities`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch sale activities');
    }
  }

  /**
   * Add activity to sale
   */
  async addSaleActivity(saleId: string, activity: {
    type: string;
    description: string;
  }): Promise<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
    user: { id: string; name: string };
  }> {
    try {
      const response = await baseApiService.post<{
        id: string;
        type: string;
        description: string;
        createdAt: string;
        user: { id: string; name: string };
      }>(`${apiConfig.endpoints.sales.base}/${saleId}/activities`, activity);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add sale activity');
    }
  }

  /**
   * Clone sale
   */
  async cloneSale(saleId: string): Promise<SaleResponse> {
    try {
      const response = await baseApiService.post<SaleResponse>(
        `${apiConfig.endpoints.sales.base}/${saleId}/clone`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to clone sale');
    }
  }

  /**
   * Export sales data
   */
  async exportSales(format: 'csv' | 'json' | 'xlsx' = 'csv', filters?: FilterParams): Promise<string> {
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
        `${apiConfig.endpoints.sales.base}/export?${params.toString()}`,
        { responseType: 'blob' } as any
      );

      if (format === 'xlsx') {
        const blob = new Blob([response.data]);
        return URL.createObjectURL(blob);
      } else {
        return await response.data.text();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export sales');
    }
  }
}