import { DatabaseService } from './database';
import { WhatsAppService } from './whatsAppService';
import { PushService } from './pushService';
import { TemplateService } from './templateService';
import {
  NotificationQueue,
  NotificationHistory,
  QueueNotificationRequest,
  SendNotificationResponse,
  NotificationStats
} from '@/types/notifications';

export class NotificationService {
  private whatsAppService: WhatsAppService;
  private pushService: PushService;
  private templateService: TemplateService;

  constructor() {
    this.whatsAppService = new WhatsAppService();
    this.pushService = new PushService();
    this.templateService = new TemplateService();
  }

  // Queue Management
  async queueNotification(request: QueueNotificationRequest): Promise<string> {
    try {
      // Validate template exists
      const template = await this.templateService.getTemplate(request.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate template variables
      await this.templateService.validateVariables(template, request.variables);

      // Determine channels to send to
      const channels = request.channel === 'both' 
        ? ['whatsapp', 'push'] 
        : [request.channel];

      const queueItems: string[] = [];

      // Create queue items for each channel
      for (const channel of channels) {
        if (template.channel === 'both' || template.channel === channel) {
          const queueData = {
            template_id: request.templateId,
            recipient_id: request.recipientId,
            channel,
            status: 'pending',
            priority: request.priority || 'normal',
            scheduled_at: request.scheduledAt || new Date().toISOString(),
            retry_count: 0,
            max_retries: 3,
            template_variables: request.variables,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const queueItem = await DatabaseService.insert('notification_queue', queueData);
          queueItems.push(queueItem.id);
        }
      }

      // Process immediately if not scheduled
      if (!request.scheduledAt) {
        for (const queueId of queueItems) {
          this.processQueueItem(queueId).catch(console.error);
        }
      }

      return queueItems[0]; // Return first queue item ID
    } catch (error) {
      console.error('Failed to queue notification:', error);
      throw error;
    }
  }

  async processQueue(): Promise<void> {
    try {
      // Get pending notifications that are due
      const pendingNotifications = await DatabaseService.select(
        'notification_queue',
        '*',
        {
          status: 'pending'
        }
      );

      const now = new Date();
      const dueNotifications = pendingNotifications.filter(notification => {
        const scheduledAt = new Date(notification.scheduled_at);
        return scheduledAt <= now;
      });

      // Process each due notification
      for (const notification of dueNotifications) {
        await this.processQueueItem(notification.id);
      }
    } catch (error) {
      console.error('Failed to process queue:', error);
    }
  }

  private async processQueueItem(queueId: string): Promise<void> {
    try {
      const queueItem = await DatabaseService.findById('notification_queue', queueId);
      if (!queueItem || queueItem.status !== 'pending') {
        return;
      }

      // Update status to processing
      await DatabaseService.update('notification_queue', queueId, {
        status: 'processing',
        updated_at: new Date().toISOString()
      });

      // Send notification
      const result = await this.sendNotification(queueItem);

      // Update queue item with result
      const updateData: any = {
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        failed_at: result.success ? null : new Date().toISOString(),
        external_id: result.externalId,
        error_message: result.error,
        updated_at: new Date().toISOString()
      };

      await DatabaseService.update('notification_queue', queueId, updateData);

      // Log to history
      await this.logNotificationHistory(queueItem, result.success ? 'sent' : 'failed', {
        external_id: result.externalId,
        error: result.error
      });

    } catch (error) {
      console.error(`Failed to process queue item ${queueId}:`, error);
      
      // Update queue item as failed
      await DatabaseService.update('notification_queue', queueId, {
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
        updated_at: new Date().toISOString()
      });
    }
  }

  async retryFailedNotifications(): Promise<void> {
    try {
      // Get failed notifications that haven't exceeded max retries
      const failedNotifications = await DatabaseService.select(
        'notification_queue',
        '*',
        { status: 'failed' }
      );

      const retryableNotifications = failedNotifications.filter(notification => 
        notification.retry_count < notification.max_retries
      );

      for (const notification of retryableNotifications) {
        // Exponential backoff: wait 2^retry_count minutes
        const backoffMinutes = Math.pow(2, notification.retry_count);
        const failedAt = new Date(notification.failed_at);
        const retryAt = new Date(failedAt.getTime() + backoffMinutes * 60 * 1000);

        if (new Date() >= retryAt) {
          await DatabaseService.update('notification_queue', notification.id, {
            status: 'pending',
            retry_count: notification.retry_count + 1,
            scheduled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Failed to retry notifications:', error);
    }
  }

  // Multi-channel dispatch
  private async sendNotification(queueItem: NotificationQueue): Promise<SendNotificationResponse> {
    try {
      switch (queueItem.channel) {
        case 'whatsapp':
          return await this.sendWhatsApp(queueItem);
        case 'push':
          return await this.sendPush(queueItem);
        default:
          throw new Error(`Unsupported channel: ${queueItem.channel}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendWhatsApp(queueItem: NotificationQueue): Promise<SendNotificationResponse> {
    try {
      // Get template
      const template = await this.templateService.getTemplate(queueItem.template_id);
      if (!template) {
        throw new Error('Template not found');
      }

      // Get user phone number (assuming it's stored in user profile)
      const user = await DatabaseService.findById('users', queueItem.recipient_id);
      if (!user) {
        throw new Error('User not found');
      }

      // For now, we'll assume phone number is in user.phone or extract from email
      // In a real implementation, you'd have a proper phone number field
      const phoneNumber = user.phone || '+1234567890'; // Fallback for demo

      // Render template
      const renderedMessage = await this.templateService.renderTemplate(
        queueItem.template_id,
        queueItem.template_variables
      );

      // Send WhatsApp message
      const result = await this.whatsAppService.sendTemplateMessage(
        phoneNumber,
        template.whatsapp_template_id || 'hello_world',
        queueItem.template_variables
      );

      return {
        success: true,
        externalId: result.messageId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'WhatsApp send failed'
      };
    }
  }

  private async sendPush(queueItem: NotificationQueue): Promise<SendNotificationResponse> {
    try {
      // Get template
      const template = await this.templateService.getTemplate(queueItem.template_id);
      if (!template) {
        throw new Error('Template not found');
      }

      // Render template
      const renderedMessage = await this.templateService.renderTemplate(
        queueItem.template_id,
        queueItem.template_variables
      );

      // Send push notification
      const result = await this.pushService.sendToUser(
        queueItem.recipient_id,
        template.title || 'Notification',
        renderedMessage,
        {
          data: queueItem.template_variables,
          tag: `notification_${queueItem.id}`
        }
      );

      return {
        success: result.success,
        externalId: result.notificationId,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push send failed'
      };
    }
  }

  // Status tracking
  async updateNotificationStatus(queueId: string, status: string, metadata?: Record<string, any>): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      await DatabaseService.update('notification_queue', queueId, updateData);

      // Update history if exists
      const historyItem = await DatabaseService.findOne('notification_history', { queue_id: queueId });
      if (historyItem) {
        const historyUpdate: any = {
          status,
          updated_at: new Date().toISOString()
        };

        if (status === 'delivered') {
          historyUpdate.delivered_at = new Date().toISOString();
        } else if (status === 'read') {
          historyUpdate.read_at = new Date().toISOString();
        }

        if (metadata) {
          historyUpdate.response_data = {
            ...historyItem.response_data,
            ...metadata
          };
        }

        await DatabaseService.update('notification_history', historyItem.id, historyUpdate);
      }
    } catch (error) {
      console.error('Failed to update notification status:', error);
    }
  }

  async logNotificationHistory(queueItem: NotificationQueue, status: string, responseData: Record<string, any>): Promise<void> {
    try {
      const historyData = {
        queue_id: queueItem.id,
        recipient_id: queueItem.recipient_id,
        template_id: queueItem.template_id,
        channel: queueItem.channel,
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        response_data: responseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await DatabaseService.insert('notification_history', historyData);
    } catch (error) {
      console.error('Failed to log notification history:', error);
    }
  }

  // Analytics and reporting
  async getNotificationStats(filters?: {
    startDate?: string;
    endDate?: string;
    channel?: string;
    recipientId?: string;
  }): Promise<NotificationStats> {
    try {
      let baseFilters: Record<string, any> = {};

      if (filters?.channel) {
        baseFilters.channel = filters.channel;
      }
      if (filters?.recipientId) {
        baseFilters.recipient_id = filters.recipientId;
      }

      // Get all notifications
      const total = await DatabaseService.count('notification_queue', baseFilters);
      
      // Get by status
      const sent = await DatabaseService.count('notification_queue', { ...baseFilters, status: 'sent' });
      const delivered = await DatabaseService.count('notification_queue', { ...baseFilters, status: 'delivered' });
      const failed = await DatabaseService.count('notification_queue', { ...baseFilters, status: 'failed' });
      const pending = await DatabaseService.count('notification_queue', { ...baseFilters, status: 'pending' });

      // Get by channel
      const whatsappCount = await DatabaseService.count('notification_queue', { ...baseFilters, channel: 'whatsapp' });
      const pushCount = await DatabaseService.count('notification_queue', { ...baseFilters, channel: 'push' });

      return {
        total,
        sent,
        delivered,
        failed,
        pending,
        byChannel: {
          whatsapp: whatsappCount,
          push: pushCount
        },
        byStatus: {
          sent,
          delivered,
          failed,
          pending
        }
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      throw error;
    }
  }

  // Queue monitoring
  async getQueueStatus(): Promise<{
    pending: number;
    processing: number;
    failed: number;
    retryable: number;
  }> {
    try {
      const pending = await DatabaseService.count('notification_queue', { status: 'pending' });
      const processing = await DatabaseService.count('notification_queue', { status: 'processing' });
      const failed = await DatabaseService.count('notification_queue', { status: 'failed' });
      
      // Count retryable (failed but under max retries)
      const failedNotifications = await DatabaseService.select(
        'notification_queue',
        'retry_count, max_retries',
        { status: 'failed' }
      );
      
      const retryable = failedNotifications.filter(n => n.retry_count < n.max_retries).length;

      return {
        pending,
        processing,
        failed,
        retryable
      };
    } catch (error) {
      console.error('Failed to get queue status:', error);
      throw error;
    }
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Delete old completed notifications
      const { count } = await DatabaseService.supabase
        .from('notification_queue')
        .delete()
        .in('status', ['sent', 'delivered'])
        .lt('created_at', cutoffDate.toISOString());

      return count || 0;
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();