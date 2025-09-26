import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardWidget from './DashboardWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  Calendar,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Timer
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from '@/hooks/use-toast';

interface EngineerDashboardData {
  assignedComplaints: Array<{
    id: string;
    title: string;
    customer_name: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'pending' | 'resolved';
    days_open: number;
    created_at: string;
  }>;
  todayTasks: Array<{
    id: string;
    title: string;
    type: 'complaint' | 'maintenance' | 'installation' | 'follow_up';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_time: string;
    estimated_duration: number;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  workloadSummary: {
    total_assigned: number;
    in_progress: number;
    pending_review: number;
    completed_today: number;
  };
  performanceMetrics: {
    avg_resolution_time: number;
    completion_rate: number;
    customer_satisfaction: number;
    tickets_resolved_this_week: number;
  };
  urgentItems: Array<{
    id: string;
    title: string;
    type: 'complaint' | 'task';
    customer_name: string;
    priority: 'urgent';
    time_remaining: string;
  }>;
}

const EngineerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EngineerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchEngineerData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: EngineerDashboardData = {
        assignedComplaints: [
          {
            id: '1',
            title: 'System Performance Issues',
            customer_name: 'TechCorp Solutions',
            priority: 'high',
            status: 'in_progress',
            days_open: 3,
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            title: 'Integration Setup Assistance',
            customer_name: 'StartupTech Inc',
            priority: 'medium',
            status: 'pending',
            days_open: 1,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            title: 'Data Migration Support',
            customer_name: 'Enterprise Corp',
            priority: 'urgent',
            status: 'open',
            days_open: 5,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        todayTasks: [
          {
            id: '1',
            title: 'Follow up on TechCorp performance issue',
            type: 'follow_up',
            priority: 'high',
            due_time: '10:00 AM',
            estimated_duration: 60,
            status: 'pending'
          },
          {
            id: '2',
            title: 'Complete StartupTech integration setup',
            type: 'installation',
            priority: 'medium',
            due_time: '2:00 PM',
            estimated_duration: 120,
            status: 'in_progress'
          },
          {
            id: '3',
            title: 'System maintenance - Database optimization',
            type: 'maintenance',
            priority: 'low',
            due_time: '4:00 PM',
            estimated_duration: 90,
            status: 'pending'
          }
        ],
        workloadSummary: {
          total_assigned: 12,
          in_progress: 4,
          pending_review: 2,
          completed_today: 3
        },
        performanceMetrics: {
          avg_resolution_time: 18.5,
          completion_rate: 92,
          customer_satisfaction: 4.7,
          tickets_resolved_this_week: 8
        },
        urgentItems: [
          {
            id: '1',
            title: 'Critical System Outage',
            type: 'complaint',
            customer_name: 'Enterprise Corp',
            priority: 'urgent',
            time_remaining: '2 hours'
          },
          {
            id: '2',
            title: 'Emergency Database Recovery',
            type: 'task',
            customer_name: 'Global Manufacturing Inc',
            priority: 'urgent',
            time_remaining: '4 hours'
          }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch engineer dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineerData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchEngineerData, 3 * 60 * 1000); // Refresh every 3 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'complaint': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Activity className="h-4 w-4" />;
      case 'installation': return <CheckCircle className="h-4 w-4" />;
      case 'follow_up': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const weeklyPerformanceData = [
    { day: 'Mon', resolved: 2, assigned: 3 },
    { day: 'Tue', resolved: 1, assigned: 2 },
    { day: 'Wed', resolved: 3, assigned: 4 },
    { day: 'Thu', resolved: 2, assigned: 2 },
    { day: 'Fri', resolved: 0, assigned: 1 },
    { day: 'Sat', resolved: 0, assigned: 0 },
    { day: 'Sun', resolved: 0, assigned: 0 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Engineer Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Your assignments and performance overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Auto-refresh
          </Button>
          <Button onClick={fetchEngineerData} disabled={isLoading}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Assigned Complaints"
          icon={AlertTriangle}
          value={data?.assignedComplaints.length || 0}
          change={{
            value: `${data?.workloadSummary.in_progress || 0} in progress`,
            trend: 'neutral'
          }}
          isLoading={isLoading}
          action={{
            label: 'View All',
            onClick: () => toast({ title: 'Navigate to Tickets', description: 'Opening assigned tickets...' })
          }}
        />

        <DashboardWidget
          title="Today's Tasks"
          icon={Calendar}
          value={data?.todayTasks.length || 0}
          badge={{
            text: `${data?.todayTasks.filter(t => t.status === 'completed').length || 0} completed`,
            variant: 'default'
          }}
          isLoading={isLoading}
          action={{
            label: 'View Schedule',
            onClick: () => toast({ title: 'Navigate to Tasks', description: 'Opening task schedule...' })
          }}
        />

        <DashboardWidget
          title="Completion Rate"
          icon={Target}
          value={data ? `${data.performanceMetrics.completion_rate}%` : '0%'}
          change={{
            value: 'This month',
            trend: 'up'
          }}
          isLoading={isLoading}
        />

        <DashboardWidget
          title="Avg Resolution Time"
          icon={Timer}
          value={data ? `${data.performanceMetrics.avg_resolution_time}h` : '0h'}
          change={{
            value: '-2h from last month',
            trend: 'down'
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Urgent Items Alert */}
      {data?.urgentItems.length ? (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Urgent Items Requiring Immediate Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.urgentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    {getTaskTypeIcon(item.type)}
                    <div>
                      <h4 className="font-medium text-red-900">{item.title}</h4>
                      <p className="text-sm text-red-700">{item.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">{item.time_remaining} left</Badge>
                    <Button size="sm" variant="destructive">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      Handle Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>
              Tickets resolved vs assigned this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="assigned" fill="#f59e0b" name="Assigned" />
                  <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Your current performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-lg font-bold">{data?.performanceMetrics.customer_satisfaction || 0}/5.0</span>
                </div>
                <Progress value={(data?.performanceMetrics.customer_satisfaction || 0) * 20} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-lg font-bold">{data?.performanceMetrics.completion_rate || 0}%</span>
                </div>
                <Progress value={data?.performanceMetrics.completion_rate || 0} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {data?.performanceMetrics.tickets_resolved_this_week || 0}
                  </div>
                  <div className="text-xs text-gray-500">Resolved This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {data?.workloadSummary.completed_today || 0}
                  </div>
                  <div className="text-xs text-gray-500">Completed Today</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Task Schedule
          </CardTitle>
          <CardDescription>
            Your planned activities for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.todayTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.due_time}</TableCell>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTaskTypeIcon(task.type)}
                      <span className="capitalize">{task.type.replace('_', ' ')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.estimated_duration} min</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      {task.status === 'pending' ? 'Start' : 
                       task.status === 'in_progress' ? 'Continue' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No tasks scheduled for today
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assigned Complaints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Assigned Complaints & Aging
          </CardTitle>
          <CardDescription>
            Customer complaints assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Days Open</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.assignedComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{complaint.title}</TableCell>
                  <TableCell>{complaint.customer_name}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(complaint.priority)}>
                      {complaint.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(complaint.status)}>
                      {complaint.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={complaint.days_open > 7 ? 'destructive' : 'secondary'}>
                      {complaint.days_open} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      Work On
                    </Button>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No complaints assigned
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerDashboard;