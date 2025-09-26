// Notification System Types

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'whatsapp' | 'push' | 'both';
  language: string;
  title?: string;
  message_body: string;
  whatsapp_template_id?: string;
  status: 'active' | 'inactive' | 'draft';
  f_version: number;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  browser_info: Record<string, any>;
  is_active: boolean;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppConfig {
  id: string;
  business_account_id: string;
  phone_number_id: string;
  access_token: string;
  webhook_verify_token: string;
  webhook_secret?: string;
  rate_limit_per_minute: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueue {
  id: string;
  template_id: string;
  recipient_id: string;
  channel: 'whatsapp' | 'push';
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  sent_at?: string;
  delivered_at?: string;
  failed_at?: string;
  retry_count: number;
  max_retries: number;
  error_message?: string;
  template_variables: Record<string, any>;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationHistory {
  id: string;
  queue_id: string;
  recipient_id: string;
  template_id: string;
  channel: 'whatsapp' | 'push';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  response_data: Record<string, any>;
  cost?: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
  contract_reminders: boolean;
  marketing_messages: boolean;
  system_notifications: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledJob {
  id: string;
  job_type: 'contract_reminder' | 'marketing_campaign' | 'system_notification';
  job_name: string;
  cron_expression: string;
  template_id: string;
  target_criteria: Record<string, any>;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  run_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppConversation {
  id: string;
  user_id: string;
  phone_number: string;
  conversation_id?: string;
  last_message_at?: string;
  status: 'active' | 'closed';
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  message_id: string;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'image' | 'document' | 'template';
  content?: string;
  media_url?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  f_timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface VAPIDKeys {
  id: string;
  public_key: string;
  private_key: string;
  subject: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Request/Response Types
export interface QueueNotificationRequest {
  templateId: string;
  recipientId: string;
  channel: 'whatsapp' | 'push' | 'both';
  variables: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: string;
}

export interface SendNotificationResponse {
  success: boolean;
  queueId?: string;
  externalId?: string;
  error?: string;
}

export interface WebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: {
            body: string;
          };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: string;
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
  vibrate?: number[];
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: number;
  limit: number;
}

export interface NotificationStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  byChannel: {
    whatsapp: number;
    push: number;
  };
  byStatus: Record<string, number>;
}