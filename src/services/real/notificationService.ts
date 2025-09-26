/**
 * Real Notification Service
 * Enterprise notification service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  NotificationRequest, 
  NotificationResponse, 
  PaginationParams,
  FilterParams,
  ApiResponse 
} from '../api/interfaces';
import { INotificationService } from '../api/apiServiceFactory';

export class RealNotificationService implements INotificationService {

  /**
   * Get notifications with filters and pagination
   */
  async getNotifications(filters?: FilterParams & PaginationParams): Promise<NotificationResponse[]> {
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

      const response = await baseApiService.get<NotificationResponse[]>(
        `${apiConfig.endpoints.notifications.base}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  /**
   * Create new notification
   */
  async createNotification(notificationData: NotificationRequest): Promise<NotificationResponse> {
    try {
      const response = await baseApiService.post<NotificationResponse>(
        apiConfig.endpoints.notifications.base,
        notificationData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create notification');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    try {
      await baseApiService.patch(
        `${apiConfig.endpoints.notifications.base}/${id}/read`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await baseApiService.patch(
        `${apiConfig.endpoints.notifications.base}/read-all`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.notifications.base}/${id}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete notification');
    }
  }

  /**
   * Get notification templates
   */
  async getTemplates(): Promise<Array<{
    id: string;
    name: string;
    subject: string;
    content: string;
    type: string;
    variables: Array<{ name: string; type: string; required: boolean }>;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        name: string;
        subject: string;
        content: string;
        type: string;
        variables: Array<{ name: string; type: string; required: boolean }>;
      }>>(apiConfig.endpoints.notifications.templates);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notification templates');
    }
  }

  /**
   * Create notification template
   */
  async createTemplate(templateData: {
    name: string;
    subject: string;
    content: string;
    type: string;
    variables?: Array<{ name: string; type: string; required: boolean }>;
  }): Promise<{
    id: string;
    name: string;
    subject: string;
    content: string;
    type: string;
    variables: Array<{ name: string; type: string; required: boolean }>;
  }> {
    try {
      const response = await baseApiService.post<{
        id: string;
        name: string;
        subject: string;
        content: string;
        type: string;
        variables: Array<{ name: string; type: string; required: boolean }>;
      }>(apiConfig.endpoints.notifications.templates, templateData);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create notification template');
    }
  }

  /**
   * Update notification template
   */
  async updateTemplate(templateId: string, updates: {
    name?: string;
    subject?: string;
    content?: string;
    variables?: Array<{ name: string; type: string; required: boolean }>;
  }): Promise<{
    id: string;
    name: string;
    subject: string;
    content: string;
    type: string;
    variables: Array<{ name: string; type: string; required: boolean }>;
  }> {
    try {
      const response = await baseApiService.put<{
        id: string;
        name: string;
        subject: string;
        content: string;
        type: string;
        variables: Array<{ name: string; type: string; required: boolean }>;
      }>(`${apiConfig.endpoints.notifications.templates}/${templateId}`, updates);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update notification template');
    }
  }

  /**
   * Delete notification template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.notifications.templates}/${templateId}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete notification template');
    }
  }

  /**
   * Send notification using template
   */
  async sendTemplateNotification(templateId: string, data: {
    recipients: string[];
    channels: Array<'email' | 'sms' | 'push' | 'in_app'>;
    variables?: Record<string, any>;
    scheduledAt?: string;
  }): Promise<NotificationResponse> {
    try {
      const response = await baseApiService.post<NotificationResponse>(
        `${apiConfig.endpoints.notifications.templates}/${templateId}/send`,
        data
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send template notification');
    }
  }

  /**
   * Get notification queue
   */
  async getNotificationQueue(): Promise<Array<{
    id: string;
    notification: NotificationResponse;
    status: 'pending' | 'processing' | 'sent' | 'failed';
    attempts: number;
    scheduledAt: string;
    sentAt?: string;
    error?: string;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        notification: NotificationResponse;
        status: 'pending' | 'processing' | 'sent' | 'failed';
        attempts: number;
        scheduledAt: string;
        sentAt?: string;
        error?: string;
      }>>(apiConfig.endpoints.notifications.queue);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notification queue');
    }
  }

  /**
   * Retry failed notification
   */
  async retryNotification(notificationId: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.notifications.base}/${notificationId}/retry`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to retry notification');
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.notifications.base}/${notificationId}/cancel`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel notification');
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(userId?: string): Promise<{
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    categories: Record<string, {
      email: boolean;
      sms: boolean;
      push: boolean;
      inApp: boolean;
    }>;
  }> {
    try {
      const endpoint = userId 
        ? `${apiConfig.endpoints.notifications.preferences}/${userId}`
        : apiConfig.endpoints.notifications.preferences;

      const response = await baseApiService.get<{
        email: boolean;
        sms: boolean;
        push: boolean;
        inApp: boolean;
        categories: Record<string, {
          email: boolean;
          sms: boolean;
          push: boolean;
          inApp: boolean;
        }>;
      }>(endpoint);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notification preferences');
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    inApp?: boolean;
    categories?: Record<string, {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      inApp?: boolean;
    }>;
  }, userId?: string): Promise<void> {
    try {
      const endpoint = userId 
        ? `${apiConfig.endpoints.notifications.preferences}/${userId}`
        : apiConfig.endpoints.notifications.preferences;

      await baseApiService.put(endpoint, preferences);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update notification preferences');
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<{
    total: number;
    sent: number;
    pending: number;
    failed: number;
    byChannel: Record<string, number>;
    byType: Record<string, number>;
    deliveryRate: number;
    averageDeliveryTime: number;
  }> {
    try {
      const response = await baseApiService.get<{
        total: number;
        sent: number;
        pending: number;
        failed: number;
        byChannel: Record<string, number>;
        byType: Record<string, number>;
        deliveryRate: number;
        averageDeliveryTime: number;
      }>(`${apiConfig.endpoints.notifications.base}/stats`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notification statistics');
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications: Array<{
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    recipients: string[];
    channels: Array<'email' | 'sms' | 'push' | 'in_app'>;
    templateId?: string;
    data?: Record<string, any>;
  }>): Promise<Array<{ id: string; status: 'success' | 'failed'; error?: string }>> {
    try {
      const response = await baseApiService.post<Array<{ id: string; status: 'success' | 'failed'; error?: string }>>(
        `${apiConfig.endpoints.notifications.base}/bulk`,
        { notifications }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send bulk notifications');
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.notifications.base}/push/subscribe`,
        subscription
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to subscribe to push notifications');
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.notifications.base}/push/unsubscribe`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to unsubscribe from push notifications');
    }
  }
}