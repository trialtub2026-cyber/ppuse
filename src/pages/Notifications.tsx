import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationDashboard } from '@/components/notifications/NotificationDashboard';
import { TemplateManager } from '@/components/notifications/TemplateManager';
import { NotificationQueue } from '@/components/notifications/NotificationQueue';
import { Bell, MessageSquare, Clock, Settings } from 'lucide-react';

export default function Notifications() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification System</h1>
            <p className="text-muted-foreground">
              Comprehensive WhatsApp and Push notification management
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <NotificationDashboard />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>

          <TabsContent value="queue">
            <NotificationQueue />
          </TabsContent>

          <TabsContent value="settings">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notification Settings</h2>
        <p className="text-muted-foreground">
          Configure WhatsApp and Push notification settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Business API
          </h3>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Configuration Status</h4>
            <p className="text-sm text-green-700">
              WhatsApp Business API is configured and active. Messages are being sent successfully.
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Business Account ID:</span>
                <span className="font-mono">123456789012345</span>
              </div>
              <div className="flex justify-between">
                <span>Phone Number ID:</span>
                <span className="font-mono">987654321098765</span>
              </div>
              <div className="flex justify-between">
                <span>Rate Limit:</span>
                <span>80 messages/minute</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Recent Activity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Messages sent today</span>
                <span className="font-medium">247</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Delivery rate</span>
                <span className="font-medium text-green-600">98.5%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Active conversations</span>
                <span className="font-medium">15</span>
              </div>
            </div>
          </div>
        </div>

        {/* Push Notification Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Push Notifications
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">VAPID Configuration</h4>
            <p className="text-sm text-blue-700">
              VAPID keys are configured and push notifications are working properly.
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Public Key:</span>
                <span className="font-mono text-xs">BK7d...9xYz</span>
              </div>
              <div className="flex justify-between">
                <span>Subject:</span>
                <span>mailto:admin@yourapp.com</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Subscription Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Active subscriptions</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Notifications sent today</span>
                <span className="font-medium">456</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Click-through rate</span>
                <span className="font-medium text-blue-600">12.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">System Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Queue Processing</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Automatic queue processing interval
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Every 30 seconds</span>
              <span className="text-xs text-green-600">Active</span>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Retry Logic</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Failed notification retry settings
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Max retries:</span>
                <span>3</span>
              </div>
              <div className="flex justify-between">
                <span>Backoff:</span>
                <span>Exponential</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Rate Limiting</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Global rate limiting settings
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>WhatsApp:</span>
                <span>80/min</span>
              </div>
              <div className="flex justify-between">
                <span>Push:</span>
                <span>1000/min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Test WhatsApp Connection
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Send Test Push Notification
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Process Queue Now
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Cleanup Old Notifications
          </button>
        </div>
      </div>
    </div>
  );
}