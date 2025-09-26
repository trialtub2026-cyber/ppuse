import { DatabaseService } from './database';
import { WhatsAppConfig, WhatsAppConversation, WhatsAppMessage, WebhookPayload, RateLimitInfo } from '@/types/notifications';

export class WhatsAppService {
  private rateLimitCache = new Map<string, RateLimitInfo>();

  // Message sending
  async sendTemplateMessage(phoneNumber: string, templateName: string, variables: Record<string, any>): Promise<{ messageId: string }> {
    try {
      // Get WhatsApp configuration
      const config = await this.getWhatsAppConfig();
      if (!config) {
        throw new Error('WhatsApp configuration not found');
      }

      // Check rate limit
      await this.checkRateLimit();

      // Clean phone number (remove any formatting)
      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

      // Prepare template parameters
      const templateParams = this.prepareTemplateParameters(variables);

      // Prepare request payload
      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en_US'
          },
          components: templateParams.length > 0 ? [
            {
              type: 'body',
              parameters: templateParams
            }
          ] : undefined
        }
      };

      // Send message via Meta WhatsApp API
      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();

      // Update rate limit info
      this.updateRateLimit(response.headers);

      // Store conversation and message
      await this.storeOutboundMessage(cleanPhoneNumber, result.messages[0].id, templateName, variables);

      return {
        messageId: result.messages[0].id
      };
    } catch (error) {
      console.error('Failed to send WhatsApp template message:', error);
      throw error;
    }
  }

  async sendTextMessage(phoneNumber: string, message: string): Promise<{ messageId: string }> {
    try {
      const config = await this.getWhatsAppConfig();
      if (!config) {
        throw new Error('WhatsApp configuration not found');
      }

      await this.checkRateLimit();

      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      this.updateRateLimit(response.headers);

      await this.storeOutboundMessage(cleanPhoneNumber, result.messages[0].id, 'text', { message });

      return {
        messageId: result.messages[0].id
      };
    } catch (error) {
      console.error('Failed to send WhatsApp text message:', error);
      throw error;
    }
  }

  async sendMediaMessage(phoneNumber: string, mediaUrl: string, caption?: string): Promise<{ messageId: string }> {
    try {
      const config = await this.getWhatsAppConfig();
      if (!config) {
        throw new Error('WhatsApp configuration not found');
      }

      await this.checkRateLimit();

      const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '');

      // Determine media type from URL
      const mediaType = this.getMediaType(mediaUrl);

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
          caption: caption
        }
      };

      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      this.updateRateLimit(response.headers);

      await this.storeOutboundMessage(cleanPhoneNumber, result.messages[0].id, mediaType, { 
        mediaUrl, 
        caption 
      });

      return {
        messageId: result.messages[0].id
      };
    } catch (error) {
      console.error('Failed to send WhatsApp media message:', error);
      throw error;
    }
  }

  // Webhook handling
  async handleWebhook(webhookData: WebhookPayload): Promise<void> {
    try {
      for (const entry of webhookData.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const value = change.value;

            // Handle incoming messages
            if (value.messages) {
              for (const message of value.messages) {
                await this.processIncomingMessage(message, value.metadata);
              }
            }

            // Handle message status updates
            if (value.statuses) {
              for (const status of value.statuses) {
                await this.processDeliveryStatus(status.id, status.status);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to handle WhatsApp webhook:', error);
      throw error;
    }
  }

  async processDeliveryStatus(messageId: string, status: string): Promise<void> {
    try {
      // Find the message in our database
      const message = await DatabaseService.findOne('whatsapp_messages', { message_id: messageId });
      if (!message) {
        console.warn(`Message not found for status update: ${messageId}`);
        return;
      }

      // Update message status
      await DatabaseService.update('whatsapp_messages', message.id, {
        status,
        updated_at: new Date().toISOString()
      });

      // Update notification queue status if this is from a notification
      const queueItem = await DatabaseService.findOne('notification_queue', { external_id: messageId });
      if (queueItem) {
        await DatabaseService.update('notification_queue', queueItem.id, {
          status: status === 'delivered' ? 'delivered' : status,
          delivered_at: status === 'delivered' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to process delivery status:', error);
    }
  }

  async processIncomingMessage(message: any, metadata: any): Promise<void> {
    try {
      // Find or create conversation
      const conversation = await this.findOrCreateConversation(message.from, metadata.phone_number_id);

      // Store incoming message
      const messageData = {
        conversation_id: conversation.id,
        message_id: message.id,
        direction: 'inbound',
        message_type: message.type,
        content: message.text?.body || message.caption || '',
        media_url: message.image?.link || message.document?.link || message.audio?.link,
        status: 'received',
        f_timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await DatabaseService.insert('whatsapp_messages', messageData);

      // Update conversation
      await DatabaseService.update('whatsapp_conversations', conversation.id, {
        last_message_at: new Date().toISOString(),
        message_count: conversation.message_count + 1,
        updated_at: new Date().toISOString()
      });

      // TODO: Implement auto-response logic here if needed
      
    } catch (error) {
      console.error('Failed to process incoming message:', error);
    }
  }

  // Rate limiting
  async checkRateLimit(): Promise<void> {
    const config = await this.getWhatsAppConfig();
    if (!config) return;

    const rateLimitKey = config.phone_number_id;
    const rateLimitInfo = this.rateLimitCache.get(rateLimitKey);

    if (rateLimitInfo) {
      const now = Date.now();
      
      if (now < rateLimitInfo.resetTime && rateLimitInfo.remaining <= 0) {
        const waitTime = rateLimitInfo.resetTime - now;
        throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`);
      }
    }
  }

  private updateRateLimit(headers: Headers): void {
    const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '80');
    const resetTime = parseInt(headers.get('X-RateLimit-Reset') || '0') * 1000;
    const limit = parseInt(headers.get('X-RateLimit-Limit') || '80');

    // Use phone_number_id as key (would need to get from config)
    const rateLimitKey = 'default'; // Simplified for now

    this.rateLimitCache.set(rateLimitKey, {
      remaining,
      resetTime,
      limit
    });
  }

  // Configuration
  async getWhatsAppConfig(): Promise<WhatsAppConfig | null> {
    try {
      const configs = await DatabaseService.select('whatsapp_config', '*', { is_active: true });
      return configs.length > 0 ? configs[0] : null;
    } catch (error) {
      console.error('Failed to get WhatsApp config:', error);
      return null;
    }
  }

  async validateAccessToken(): Promise<boolean> {
    try {
      const config = await this.getWhatsAppConfig();
      if (!config) return false;

      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}`, {
        headers: {
          'Authorization': `Bearer ${config.access_token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to validate access token:', error);
      return false;
    }
  }

  // Helper methods
  private prepareTemplateParameters(variables: Record<string, any>): Array<{ type: string; text: string }> {
    return Object.values(variables).map(value => ({
      type: 'text',
      text: String(value)
    }));
  }

  private getMediaType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return 'image';
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return 'document';
    } else if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return 'audio';
    } else if (['mp4', 'avi', 'mov'].includes(extension || '')) {
      return 'video';
    }
    
    return 'document'; // Default fallback
  }

  private async findOrCreateConversation(phoneNumber: string, phoneNumberId: string): Promise<WhatsAppConversation> {
    try {
      // Try to find existing conversation
      let conversation = await DatabaseService.findOne('whatsapp_conversations', { 
        phone_number: phoneNumber 
      });

      if (!conversation) {
        // Create new conversation
        const conversationData = {
          user_id: 'unknown', // Would need to map phone to user
          phone_number: phoneNumber,
          conversation_id: `${phoneNumberId}_${phoneNumber}`,
          status: 'active',
          message_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        conversation = await DatabaseService.insert('whatsapp_conversations', conversationData);
      }

      return conversation;
    } catch (error) {
      console.error('Failed to find or create conversation:', error);
      throw error;
    }
  }

  private async storeOutboundMessage(phoneNumber: string, messageId: string, messageType: string, data: Record<string, any>): Promise<void> {
    try {
      const conversation = await this.findOrCreateConversation(phoneNumber, 'default');

      const messageData = {
        conversation_id: conversation.id,
        message_id: messageId,
        direction: 'outbound',
        message_type: messageType,
        content: data.message || data.caption || JSON.stringify(data),
        media_url: data.mediaUrl,
        status: 'sent',
        f_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await DatabaseService.insert('whatsapp_messages', messageData);

      // Update conversation
      await DatabaseService.update('whatsapp_conversations', conversation.id, {
        last_message_at: new Date().toISOString(),
        message_count: conversation.message_count + 1,
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to store outbound message:', error);
    }
  }

  // Conversation management
  async getConversations(userId?: string): Promise<WhatsAppConversation[]> {
    try {
      const filters: Record<string, any> = { status: 'active' };
      if (userId) {
        filters.user_id = userId;
      }

      return await DatabaseService.select('whatsapp_conversations', '*', filters);
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  }

  async getConversationMessages(conversationId: string): Promise<WhatsAppMessage[]> {
    try {
      return await DatabaseService.select('whatsapp_messages', '*', { conversation_id: conversationId });
    } catch (error) {
      console.error('Failed to get conversation messages:', error);
      return [];
    }
  }
}

export const whatsAppService = new WhatsAppService();