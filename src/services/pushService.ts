// web-push is a Node-only library. Do NOT import at top-level in browser bundles.
// We lazy-load it only when running in a Node/SSR context.
type WebPushModule = typeof import('web-push');
let webpushModule: WebPushModule | null = null;

async function getWebPush(): Promise<WebPushModule> {
  if (typeof window !== 'undefined') {
    throw new Error('web-push is server-only and must not run in the browser. Move push sending to your backend.');
  }
  if (!webpushModule) {
    // Dynamic import ensures it’s excluded from the browser bundle
    const mod = await import('web-push');
    webpushModule = mod.default ? (mod.default as unknown as WebPushModule) : (mod as WebPushModule);
  }
  return webpushModule!;
}
import { DatabaseService } from './database';
import { PushSubscription, VAPIDKeys, PushNotificationPayload } from '@/types/notifications';

export class PushService {
  private vapidKeys: VAPIDKeys | null = null;

  constructor() {
    // Only attempt VAPID setup in Node/SSR. In the browser this must be handled via API calls to a backend.
    if (typeof window === 'undefined') {
      this.initializeVAPID();
    }
  }

  // VAPID management
  async generateVAPIDKeys(): Promise<VAPIDKeys> {
    try {
      const webpush = await getWebPush();
      const vapidKeys = webpush.generateVAPIDKeys();

      const keyData = {
        public_key: vapidKeys.publicKey,
        private_key: vapidKeys.privateKey,
        subject: 'mailto:admin@yourapp.com', // Replace with your contact email
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const savedKeys = await DatabaseService.insert('vapid_keys', keyData);
      this.vapidKeys = savedKeys;

      // Configure web-push with new keys
      webpush.setVapidDetails(
        keyData.subject,
        vapidKeys.publicKey,
        vapidKeys.privateKey
      );

      return savedKeys;
    } catch (error) {
      console.error('Failed to generate VAPID keys:', error);
      throw error;
    }
  }

  async getActiveVAPIDKeys(): Promise<VAPIDKeys | null> {
    try {
      if (this.vapidKeys) {
        return this.vapidKeys;
      }

      const keys = await DatabaseService.select('vapid_keys', '*', { is_active: true });
      if (keys.length > 0) {
        this.vapidKeys = keys[0];
        
        // Configure web-push
        const webpush = await getWebPush();
        webpush.setVapidDetails(
          this.vapidKeys.subject,
          this.vapidKeys.public_key,
          this.vapidKeys.private_key
        );

        return this.vapidKeys;
      }

      // Generate new keys if none exist
      return await this.generateVAPIDKeys();
    } catch (error) {
      console.error('Failed to get VAPID keys:', error);
      return null;
    }
  }

  private async initializeVAPID(): Promise<void> {
    try {
      await this.getActiveVAPIDKeys();
    } catch (error) {
      console.error('Failed to initialize VAPID:', error);
    }
  }

  // Subscription management
  async saveSubscription(userId: string, subscription: any): Promise<PushSubscription> {
    try {
      // Check if subscription already exists
      const existingSubscription = await DatabaseService.findOne('push_subscriptions', {
        user_id: userId,
        endpoint: subscription.endpoint
      });

      if (existingSubscription) {
        // Update existing subscription
        const updateData = {
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          is_active: true,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        return await DatabaseService.update('push_subscriptions', existingSubscription.id, updateData);
      }

      // Create new subscription
      const subscriptionData = {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        browser_info: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown'
        },
        is_active: true,
        last_used_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return await DatabaseService.insert('push_subscriptions', subscriptionData);
    } catch (error) {
      console.error('Failed to save push subscription:', error);
      throw error;
    }
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    try {
      const subscription = await DatabaseService.findOne('push_subscriptions', {
        user_id: userId,
        endpoint
      });

      if (subscription) {
        await DatabaseService.update('push_subscriptions', subscription.id, {
          is_active: false,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to remove push subscription:', error);
      throw error;
    }
  }

  async getActiveSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      return await DatabaseService.select('push_subscriptions', '*', {
        user_id: userId,
        is_active: true
      });
    } catch (error) {
      console.error('Failed to get active subscriptions:', error);
      return [];
    }
  }

  // Push sending
  async sendPushNotification(subscription: PushSubscription, payload: PushNotificationPayload): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const webpush = await getWebPush();
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh_key,
          auth: subscription.auth_key
        }
      };

      const options = {
        TTL: 24 * 60 * 60, // 24 hours
        urgency: 'normal' as const,
        topic: payload.tag || 'default'
      };

      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload),
        options
      );

      // Update last used timestamp
      await DatabaseService.update('push_subscriptions', subscription.id, {
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to send push notification:', error);

      // Handle expired subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        await DatabaseService.update('push_subscriptions', subscription.id, {
          is_active: false,
          updated_at: new Date().toISOString()
        });
      }

      return {
        success: false,
        error: error.message || 'Failed to send push notification'
      };
    }
  }

  async sendToUser(userId: string, title: string, body: string, options?: {
    icon?: string;
    badge?: string;
    image?: string;
    data?: Record<string, any>;
    actions?: Array<{ action: string; title: string; icon?: string }>;
    requireInteraction?: boolean;
    silent?: boolean;
    tag?: string;
    vibrate?: number[];
  }): Promise<{
    success: boolean;
    notificationId?: string;
    error?: string;
    results?: Array<{ success: boolean; error?: string }>;
  }> {
    try {
      const subscriptions = await this.getActiveSubscriptions(userId);
      
      if (subscriptions.length === 0) {
        return {
          success: false,
          error: 'No active push subscriptions found for user'
        };
      }

      const payload: PushNotificationPayload = {
        title,
        body,
        icon: options?.icon || '/favicon/android/android-launchericon-192-192.png',
        badge: options?.badge || '/favicon/android/android-launchericon-96-96.png',
        image: options?.image,
        data: {
          timestamp: Date.now(),
          userId,
          ...options?.data
        },
        actions: options?.actions,
        requireInteraction: options?.requireInteraction || false,
        silent: options?.silent || false,
        tag: options?.tag,
        vibrate: options?.vibrate || [200, 100, 200]
      };

      const results = await Promise.allSettled(
        subscriptions.map(subscription => 
          this.sendPushNotification(subscription, payload)
        )
      );

      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      const notificationId = `push_${userId}_${Date.now()}`;

      return {
        success: successCount > 0,
        notificationId,
        results: results.map(result => 
          result.status === 'fulfilled' 
            ? result.value 
            : { success: false, error: 'Promise rejected' }
        )
      };
    } catch (error) {
      console.error('Failed to send push to user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendBulkPush(userIds: string[], title: string, body: string, options?: {
    icon?: string;
    badge?: string;
    image?: string;
    data?: Record<string, any>;
    actions?: Array<{ action: string; title: string; icon?: string }>;
    requireInteraction?: boolean;
    silent?: boolean;
    tag?: string;
    vibrate?: number[];
  }): Promise<{
    success: boolean;
    totalSent: number;
    totalFailed: number;
    results: Record<string, { success: boolean; error?: string }>;
  }> {
    try {
      const results: Record<string, { success: boolean; error?: string }> = {};
      let totalSent = 0;
      let totalFailed = 0;

      // Send to each user
      for (const userId of userIds) {
        try {
          const result = await this.sendToUser(userId, title, body, options);
          results[userId] = {
            success: result.success,
            error: result.error
          };

          if (result.success) {
            totalSent++;
          } else {
            totalFailed++;
          }
        } catch (error) {
          results[userId] = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          totalFailed++;
        }
      }

      return {
        success: totalSent > 0,
        totalSent,
        totalFailed,
        results
      };
    } catch (error) {
      console.error('Failed to send bulk push notifications:', error);
      throw error;
    }
  }

  // Cleanup
  async cleanupExpiredSubscriptions(): Promise<number> {
    try {
      // Get all active subscriptions
      const subscriptions = await DatabaseService.select('push_subscriptions', '*', { is_active: true });
      
      let cleanedCount = 0;

      for (const subscription of subscriptions) {
        try {
          // Test subscription with a minimal payload
          const testPayload = {
            title: 'Test',
            body: 'Connection test',
            silent: true,
            tag: 'test'
          };

          const result = await this.sendPushNotification(subscription, testPayload);
          
          if (!result.success) {
            cleanedCount++;
          }
        } catch (error) {
          // Subscription is likely expired
          await DatabaseService.update('push_subscriptions', subscription.id, {
            is_active: false,
            updated_at: new Date().toISOString()
          });
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup expired subscriptions:', error);
      return 0;
    }
  }

  // Subscription statistics
  async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byBrowser: Record<string, number>;
  }> {
    try {
      const total = await DatabaseService.count('push_subscriptions');
      const active = await DatabaseService.count('push_subscriptions', { is_active: true });
      const inactive = total - active;

      // Get browser statistics
      const subscriptions = await DatabaseService.select('push_subscriptions', 'browser_info', { is_active: true });
      const byBrowser: Record<string, number> = {};

      subscriptions.forEach(sub => {
        if (sub.browser_info && sub.browser_info.userAgent) {
          const userAgent = sub.browser_info.userAgent;
          let browser = 'Unknown';

          if (userAgent.includes('Chrome')) browser = 'Chrome';
          else if (userAgent.includes('Firefox')) browser = 'Firefox';
          else if (userAgent.includes('Safari')) browser = 'Safari';
          else if (userAgent.includes('Edge')) browser = 'Edge';

          byBrowser[browser] = (byBrowser[browser] || 0) + 1;
        }
      });

      return {
        total,
        active,
        inactive,
        byBrowser
      };
    } catch (error) {
      console.error('Failed to get subscription stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byBrowser: {}
      };
    }
  }

  // Get public VAPID key for client-side subscription
  async getPublicVAPIDKey(): Promise<string | null> {
    try {
      const keys = await this.getActiveVAPIDKeys();
      return keys?.public_key || null;
    } catch (error) {
      console.error('Failed to get public VAPID key:', error);
      return null;
    }
  }
}

export const pushService = new PushService();
