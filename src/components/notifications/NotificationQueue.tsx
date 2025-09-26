import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  RotateCcw,
  Send,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Smartphone,
  Calendar
} from 'lucide-react';
import { DatabaseService } from '@/services/database';
import { notificationService } from '@/services/notificationService';
import { templateService } from '@/services/templateService';
import { NotificationQueue as NotificationQueueType, NotificationTemplate } from '@/types/notifications';

interface NotificationQueueProps {
  className?: string;
}

export function NotificationQueue({ className }: NotificationQueueProps) {
  const [queueItems, setQueueItems] = useState<NotificationQueueType[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<NotificationQueueType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadQueueItems();
    loadTemplates();
    
    // Refresh every 10 seconds
    const interval = setInterval(loadQueueItems, 10000);
    return () => clearInterval(interval);
  }, [filterStatus, filterChannel]);

  const loadQueueItems = async () => {
    try {
      const filters: Record<string, any> = {};
      
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      if (filterChannel !== 'all') {
        filters.channel = filterChannel;
      }

      const items = await DatabaseService.select('notification_queue', '*', filters);
      
      // Sort by created_at descending
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setQueueItems(items);
    } catch (error) {
      console.error('Failed to load queue items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const result = await templateService.listTemplates({ status: 'active' });
      setTemplates(result.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleCreateNotification = async (data: any) => {
    try {
      await notificationService.queueNotification({
        templateId: data.templateId,
        recipientId: data.recipientId,
        channel: data.channel,
        variables: JSON.parse(data.variables || '{}'),
        priority: data.priority,
        scheduledAt: data.scheduledAt || undefined
      });
      
      await loadQueueItems();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const handleRetryNotification = async (queueId: string) => {
    try {
      await DatabaseService.update('notification_queue', queueId, {
        status: 'pending',
        retry_count: 0,
        error_message: null,
        scheduled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      await loadQueueItems();
    } catch (error) {
      console.error('Failed to retry notification:', error);
    }
  };

  const handleCancelNotification = async (queueId: string) => {
    try {
      await DatabaseService.update('notification_queue', queueId, {
        status: 'cancelled',
        updated_at: new Date().toISOString()
      });
      
      await loadQueueItems();
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  };

  const handleProcessQueue = async () => {
    try {
      await notificationService.processQueue();
      await loadQueueItems();
    } catch (error) {
      console.error('Failed to process queue:', error);
    }
  };

  const filteredItems = queueItems.filter(item => {
    const matchesSearch = item.recipient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.template_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="border-blue-500 text-blue-600"><Play className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-700"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary"><Pause className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-orange-600">High</Badge>;
      case 'normal':
        return <Badge variant="outline">Normal</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'push':
        return <Smartphone className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Queue</h1>
          <p className="text-muted-foreground">
            Monitor and manage queued notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleProcessQueue} variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Process Queue
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send New Notification</DialogTitle>
                <DialogDescription>
                  Queue a new notification to be sent
                </DialogDescription>
              </DialogHeader>
              <CreateNotificationForm 
                templates={templates}
                onSubmit={handleCreateNotification}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by recipient or template..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterChannel} onValueChange={setFilterChannel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="push">Push</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Queue Items */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(item.channel)}
                      <span className="font-medium">Recipient: {item.recipient_id}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">Template: {item.template_id}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {new Date(item.created_at).toLocaleString()}</span>
                      {item.scheduled_at && (
                        <>
                          <span>•</span>
                          <span>Scheduled: {new Date(item.scheduled_at).toLocaleString()}</span>
                        </>
                      )}
                      {item.retry_count > 0 && (
                        <>
                          <span>•</span>
                          <span>Retries: {item.retry_count}/{item.max_retries}</span>
                        </>
                      )}
                    </div>

                    {item.error_message && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Error: {item.error_message}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {getPriorityBadge(item.priority)}
                    {getStatusBadge(item.status)}
                    
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      {item.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetryNotification(item.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {['pending', 'processing'].includes(item.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelNotification(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications in queue</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || filterStatus !== 'all' || filterChannel !== 'all'
                ? 'No notifications match your current filters.'
                : 'The notification queue is empty.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              View detailed information about this notification
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <NotificationDetail item={selectedItem} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Notification Form Component
function CreateNotificationForm({ 
  templates, 
  onSubmit 
}: { 
  templates: NotificationTemplate[];
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    templateId: '',
    recipientId: '',
    channel: 'both',
    priority: 'normal',
    variables: '{}',
    scheduledAt: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="templateId">Template</Label>
          <Select value={formData.templateId} onValueChange={(value) => setFormData({ ...formData, templateId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="recipientId">Recipient ID</Label>
          <Input
            id="recipientId"
            value={formData.recipientId}
            onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
            placeholder="User ID or email"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="channel">Channel</Label>
          <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="push">Push Notification</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="variables">Template Variables (JSON)</Label>
        <Textarea
          id="variables"
          value={formData.variables}
          onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
          placeholder='{"customerName": "John Doe", "amount": "100"}'
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="scheduledAt">Schedule For (Optional)</Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">
          Send Notification
        </Button>
      </div>
    </form>
  );
}

// Notification Detail Component
function NotificationDetail({ item }: { item: NotificationQueueType }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="mt-1">
            {item.status === 'pending' && <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>}
            {item.status === 'processing' && <Badge variant="outline" className="border-blue-500 text-blue-600">Processing</Badge>}
            {item.status === 'sent' && <Badge variant="default" className="bg-green-600">Sent</Badge>}
            {item.status === 'delivered' && <Badge variant="default" className="bg-green-700">Delivered</Badge>}
            {item.status === 'failed' && <Badge variant="destructive">Failed</Badge>}
            {item.status === 'cancelled' && <Badge variant="secondary">Cancelled</Badge>}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Channel</Label>
          <div className="mt-1 flex items-center gap-2">
            {item.channel === 'whatsapp' && <MessageSquare className="h-4 w-4 text-green-600" />}
            {item.channel === 'push' && <Smartphone className="h-4 w-4 text-blue-600" />}
            <span className="capitalize">{item.channel}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Priority</Label>
          <div className="mt-1">
            {item.priority === 'urgent' && <Badge variant="destructive">Urgent</Badge>}
            {item.priority === 'high' && <Badge variant="default" className="bg-orange-600">High</Badge>}
            {item.priority === 'normal' && <Badge variant="outline">Normal</Badge>}
            {item.priority === 'low' && <Badge variant="secondary">Low</Badge>}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Retry Count</Label>
          <div className="mt-1">
            <span>{item.retry_count} / {item.max_retries}</span>
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Recipient ID</Label>
        <div className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">
          {item.recipient_id}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Template ID</Label>
        <div className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">
          {item.template_id}
        </div>
      </div>

      {item.external_id && (
        <div>
          <Label className="text-sm font-medium">External ID</Label>
          <div className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">
            {item.external_id}
          </div>
        </div>
      )}

      <div>
        <Label className="text-sm font-medium">Template Variables</Label>
        <div className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded max-h-32 overflow-auto">
          {JSON.stringify(item.template_variables, null, 2)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium">Created At</Label>
          <div className="mt-1 text-sm">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Updated At</Label>
          <div className="mt-1 text-sm">
            {new Date(item.updated_at).toLocaleString()}
          </div>
        </div>
      </div>

      {item.scheduled_at && (
        <div>
          <Label className="text-sm font-medium">Scheduled At</Label>
          <div className="mt-1 text-sm">
            {new Date(item.scheduled_at).toLocaleString()}
          </div>
        </div>
      )}

      {item.sent_at && (
        <div>
          <Label className="text-sm font-medium">Sent At</Label>
          <div className="mt-1 text-sm">
            {new Date(item.sent_at).toLocaleString()}
          </div>
        </div>
      )}

      {item.delivered_at && (
        <div>
          <Label className="text-sm font-medium">Delivered At</Label>
          <div className="mt-1 text-sm">
            {new Date(item.delivered_at).toLocaleString()}
          </div>
        </div>
      )}

      {item.failed_at && (
        <div>
          <Label className="text-sm font-medium">Failed At</Label>
          <div className="mt-1 text-sm">
            {new Date(item.failed_at).toLocaleString()}
          </div>
        </div>
      )}

      {item.error_message && (
        <div>
          <Label className="text-sm font-medium">Error Message</Label>
          <div className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded">
            {item.error_message}
          </div>
        </div>
      )}
    </div>
  );
}