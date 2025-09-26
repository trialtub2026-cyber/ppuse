/**
 * Real Ticket Service
 * Enterprise ticket management service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  TicketRequest, 
  TicketResponse, 
  PaginationParams,
  FilterParams,
  ApiResponse 
} from '../api/interfaces';
import { ITicketService } from '../api/apiServiceFactory';

export class RealTicketService implements ITicketService {

  /**
   * Get tickets with filters and pagination
   */
  async getTickets(filters?: FilterParams & PaginationParams): Promise<TicketResponse[]> {
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

      const response = await baseApiService.get<TicketResponse[]>(
        `${apiConfig.endpoints.tickets.base}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch tickets');
    }
  }

  /**
   * Get single ticket by ID
   */
  async getTicket(id: string): Promise<TicketResponse> {
    try {
      const response = await baseApiService.get<TicketResponse>(
        `${apiConfig.endpoints.tickets.base}/${id}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch ticket');
    }
  }

  /**
   * Create new ticket
   */
  async createTicket(ticketData: TicketRequest): Promise<TicketResponse> {
    try {
      const response = await baseApiService.post<TicketResponse>(
        apiConfig.endpoints.tickets.base,
        ticketData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create ticket');
    }
  }

  /**
   * Update existing ticket
   */
  async updateTicket(id: string, updates: Partial<TicketRequest>): Promise<TicketResponse> {
    try {
      const response = await baseApiService.put<TicketResponse>(
        `${apiConfig.endpoints.tickets.base}/${id}`,
        updates
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update ticket');
    }
  }

  /**
   * Delete ticket
   */
  async deleteTicket(id: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.tickets.base}/${id}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete ticket');
    }
  }

  /**
   * Get ticket categories
   */
  async getTicketCategories(): Promise<Array<{ id: string; name: string; description?: string }>> {
    try {
      const response = await baseApiService.get<Array<{ id: string; name: string; description?: string }>>(
        apiConfig.endpoints.tickets.categories
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch ticket categories');
    }
  }

  /**
   * Get ticket priorities
   */
  async getTicketPriorities(): Promise<Array<{ id: string; name: string; level: number; color: string }>> {
    try {
      const response = await baseApiService.get<Array<{ id: string; name: string; level: number; color: string }>>(
        apiConfig.endpoints.tickets.priorities
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch ticket priorities');
    }
  }

  /**
   * Assign ticket to user
   */
  async assignTicket(ticketId: string, userId: string): Promise<TicketResponse> {
    try {
      const response = await baseApiService.patch<TicketResponse>(
        `${apiConfig.endpoints.tickets.assignments}/${ticketId}`,
        { assignedTo: userId }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to assign ticket');
    }
  }

  /**
   * Change ticket status
   */
  async changeTicketStatus(ticketId: string, status: string): Promise<TicketResponse> {
    try {
      const response = await baseApiService.patch<TicketResponse>(
        `${apiConfig.endpoints.tickets.base}/${ticketId}/status`,
        { status }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change ticket status');
    }
  }

  /**
   * Add comment to ticket
   */
  async addTicketComment(ticketId: string, content: string): Promise<{
    id: string;
    content: string;
    author: { id: string; name: string };
    createdAt: string;
  }> {
    try {
      const response = await baseApiService.post<{
        id: string;
        content: string;
        author: { id: string; name: string };
        createdAt: string;
      }>(`${apiConfig.endpoints.tickets.base}/${ticketId}/comments`, { content });

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add comment');
    }
  }

  /**
   * Get ticket comments
   */
  async getTicketComments(ticketId: string): Promise<Array<{
    id: string;
    content: string;
    author: { id: string; name: string };
    createdAt: string;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        content: string;
        author: { id: string; name: string };
        createdAt: string;
      }>>(`${apiConfig.endpoints.tickets.base}/${ticketId}/comments`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch comments');
    }
  }

  /**
   * Upload attachment to ticket
   */
  async uploadTicketAttachment(ticketId: string, file: File): Promise<{
    id: string;
    filename: string;
    url: string;
    size: number;
  }> {
    try {
      const response = await baseApiService.uploadFile<{
        id: string;
        filename: string;
        url: string;
        size: number;
      }>(`${apiConfig.endpoints.tickets.base}/${ticketId}/attachments`, file);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload attachment');
    }
  }

  /**
   * Delete ticket attachment
   */
  async deleteTicketAttachment(ticketId: string, attachmentId: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.tickets.base}/${ticketId}/attachments/${attachmentId}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete attachment');
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    averageResolutionTime: number;
    overdueTickets: number;
  }> {
    try {
      const response = await baseApiService.get<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        byPriority: Record<string, number>;
        byCategory: Record<string, number>;
        averageResolutionTime: number;
        overdueTickets: number;
      }>(`${apiConfig.endpoints.tickets.base}/stats`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch ticket statistics');
    }
  }

  /**
   * Get ticket analytics
   */
  async getTicketAnalytics(period?: string): Promise<{
    trends: Array<{ date: string; created: number; resolved: number }>;
    resolutionTimes: Array<{ category: string; averageTime: number }>;
    satisfactionRatings: Array<{ rating: number; count: number }>;
    agentPerformance: Array<{ 
      userId: string; 
      userName: string; 
      ticketsResolved: number; 
      averageResolutionTime: number;
      satisfactionScore: number;
    }>;
  }> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await baseApiService.get<{
        trends: Array<{ date: string; created: number; resolved: number }>;
        resolutionTimes: Array<{ category: string; averageTime: number }>;
        satisfactionRatings: Array<{ rating: number; count: number }>;
        agentPerformance: Array<{ 
          userId: string; 
          userName: string; 
          ticketsResolved: number; 
          averageResolutionTime: number;
          satisfactionScore: number;
        }>;
      }>(`${apiConfig.endpoints.tickets.base}/analytics${params}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch ticket analytics');
    }
  }

  /**
   * Bulk update tickets
   */
  async bulkUpdateTickets(ticketIds: string[], updates: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    category?: string;
  }): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.tickets.base}/bulk-update`,
        { ticketIds, updates }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to bulk update tickets');
    }
  }

  /**
   * Export tickets
   */
  async exportTickets(format: 'csv' | 'json' | 'xlsx' = 'csv', filters?: FilterParams): Promise<string> {
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
        `${apiConfig.endpoints.tickets.base}/export?${params.toString()}`,
        { responseType: 'blob' } as any
      );

      if (format === 'xlsx') {
        const blob = new Blob([response.data]);
        return URL.createObjectURL(blob);
      } else {
        return await response.data.text();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export tickets');
    }
  }

  /**
   * Get SLA metrics
   */
  async getSLAMetrics(): Promise<{
    responseTimeTarget: number;
    resolutionTimeTarget: number;
    responseTimeActual: number;
    resolutionTimeActual: number;
    slaCompliance: number;
    breachedTickets: number;
  }> {
    try {
      const response = await baseApiService.get<{
        responseTimeTarget: number;
        resolutionTimeTarget: number;
        responseTimeActual: number;
        resolutionTimeActual: number;
        slaCompliance: number;
        breachedTickets: number;
      }>(`${apiConfig.endpoints.tickets.base}/sla-metrics`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch SLA metrics');
    }
  }
}