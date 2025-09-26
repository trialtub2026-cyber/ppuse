import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  MessageSquare, 
  Smartphone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Users,
  TrendingUp,
  Settings
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { NotificationStats } from '@/types/notifications';

interface NotificationDashboardProps {
  className?: string;
}

export function NotificationDashboard({ className }: NotificationDashboardProps) {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, queueData] = await Promise.all([
        notificationService.getNotificationStats(),
        notificationService.getQueueStatus()
      ]);
      
      setStats(statsData);
      setQueueStatus(queueData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      await notificationService.retryFailedNotifications();
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to retry notifications:', error);
    }
  };

  const handleProcessQueue = async () => {
    try {
      await notificationService.processQueue();
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to process queue:', error);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification System</h1>
          <p className="text-muted-foreground">
            Monitor and manage WhatsApp and Push notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleProcessQueue} variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Process Queue
          </Button>
          <Button onClick={handleRetryFailed} variant="outline">
            <AlertCircle className="h-4 w-4 mr-2" />
            Retry Failed
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time notifications sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.delivered || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Failed to deliver
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{queueStatus?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              Waiting to be sent
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="queue">Queue Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
                <CardDescription>
                  Notification delivery performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sent</span>
                    <Badge variant="outline">{stats?.sent || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Delivered</span>
                    <Badge variant="default" className="bg-green-600">{stats?.delivered || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed</span>
                    <Badge variant="destructive">{stats?.failed || 0}</Badge>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-lg font-bold text-green-600">
                        {stats?.total ? Math.round((stats.delivered / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest notification events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Contract reminder sent to 15 customers</span>
                    <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Marketing campaign delivered</span>
                    <span className="text-xs text-muted-foreground ml-auto">5 min ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">3 notifications pending retry</span>
                    <span className="text-xs text-muted-foreground ml-auto">10 min ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">System notification broadcast</span>
                    <span className="text-xs text-muted-foreground ml-auto">15 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* WhatsApp Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  WhatsApp
                </CardTitle>
                <CardDescription>
                  WhatsApp Business API statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold">{stats?.byChannel.whatsapp || 0}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Messages sent</span>
                      <span>{stats?.byChannel.whatsapp || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery rate</span>
                      <span className="text-green-600">95%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active conversations</span>
                      <span>12</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Web push notification statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-3xl font-bold">{stats?.byChannel.push || 0}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Notifications sent</span>
                      <span>{stats?.byChannel.push || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Click rate</span>
                      <span className="text-blue-600">12%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active subscriptions</span>
                      <span>248</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Queue Status</CardTitle>
                <CardDescription>Current queue state</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <Badge variant="outline">{queueStatus?.pending || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Processing</span>
                    <Badge variant="secondary">{queueStatus?.processing || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Failed</span>
                    <Badge variant="destructive">{queueStatus?.failed || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retryable</span>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                      {queueStatus?.retryable || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Processing metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg. processing time</span>
                    <span className="text-sm font-medium">2.3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Messages/minute</span>
                    <span className="text-sm font-medium">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Queue health</span>
                    <Badge variant="default" className="bg-green-600">Healthy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Queue management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    onClick={handleProcessQueue} 
                    className="w-full" 
                    variant="outline"
                  >
                    Process Queue
                  </Button>
                  <Button 
                    onClick={handleRetryFailed} 
                    className="w-full" 
                    variant="outline"
                  >
                    Retry Failed
                  </Button>
                  <Button 
                    onClick={loadDashboardData} 
                    className="w-full" 
                    variant="outline"
                  >
                    Refresh Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}