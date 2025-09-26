import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Server,
  Database,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface SystemMetrics {
  uptime: string;
  uptime_percentage: number;
  active_users: number;
  api_response_time: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  database_connections: number;
  network_throughput: number;
  recent_incidents: Array<{
    id: string;
    title: string;
    status: 'resolved' | 'investigating' | 'monitoring';
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    description: string;
  }>;
  performance_trends: Array<{
    time: string;
    response_time: number;
    error_rate: number;
    active_users: number;
  }>;
  resource_usage: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

interface SystemHealthDashboardProps {
  autoRefresh?: boolean;
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({ autoRefresh = false }) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock data for system metrics
  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockMetrics: SystemMetrics = {
        uptime: '99.9%',
        uptime_percentage: 99.9,
        active_users: 42,
        api_response_time: 145,
        error_rate: 0.02,
        cpu_usage: 35,
        memory_usage: 68,
        disk_usage: 45,
        database_connections: 12,
        network_throughput: 85.6,
        recent_incidents: [
          {
            id: '1',
            title: 'Database connection timeout',
            status: 'resolved',
            severity: 'medium',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            description: 'Temporary database connection issues resolved by restarting connection pool'
          },
          {
            id: '2',
            title: 'High API response time',
            status: 'monitoring',
            severity: 'low',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            description: 'API response times elevated, monitoring for improvements'
          },
          {
            id: '3',
            title: 'Memory usage spike',
            status: 'investigating',
            severity: 'high',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            description: 'Investigating sudden increase in memory consumption'
          }
        ],
        performance_trends: [
          { time: '00:00', response_time: 120, error_rate: 0.01, active_users: 35 },
          { time: '04:00', response_time: 110, error_rate: 0.015, active_users: 28 },
          { time: '08:00', response_time: 145, error_rate: 0.02, active_users: 42 },
          { time: '12:00', response_time: 165, error_rate: 0.025, active_users: 58 },
          { time: '16:00', response_time: 155, error_rate: 0.018, active_users: 52 },
          { time: '20:00', response_time: 140, error_rate: 0.012, active_users: 38 }
        ],
        resource_usage: [
          { name: 'CPU', value: 35, color: '#3b82f6' },
          { name: 'Memory', value: 68, color: '#10b981' },
          { name: 'Disk', value: 45, color: '#f59e0b' },
          { name: 'Network', value: 25, color: '#ef4444' }
        ]
      };
      
      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system metrics',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-red-500';
    if (value >= thresholds.warning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'monitoring': return 'secondary';
      case 'investigating': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Health Monitoring</h2>
          <p className="text-gray-600 mt-1">
            Real-time system performance and health metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.uptime}</div>
            <Progress value={metrics.uptime_percentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_users}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getStatusColor(metrics.api_response_time, { warning: 200, critical: 500 }))}>
              {metrics.api_response_time}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average P95
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getStatusColor(metrics.error_rate, { warning: 1, critical: 5 }))}>
              {metrics.error_rate}%
            </div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.5% from last hour
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getStatusColor(metrics.cpu_usage, { warning: 70, critical: 90 }))}>
              {metrics.cpu_usage}%
            </div>
            <Progress 
              value={metrics.cpu_usage}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getStatusColor(metrics.memory_usage, { warning: 80, critical: 95 }))}>
              {metrics.memory_usage}%
            </div>
            <Progress 
              value={metrics.memory_usage}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getStatusColor(metrics.disk_usage, { warning: 80, critical: 95 }))}>
              {metrics.disk_usage}%
            </div>
            <Progress 
              value={metrics.disk_usage}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DB Connections</CardTitle>
            <Database className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.database_connections}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              API response time and error rate over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.performance_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="response_time" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Response Time (ms)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="error_rate" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Error Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Distribution</CardTitle>
            <CardDescription>
              Current system resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.resource_usage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.resource_usage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>
            System incidents and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.recent_incidents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Systems Operational</h3>
              <p className="text-gray-500">No recent incidents to report.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.recent_incidents.map((incident) => (
                <div key={incident.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-1.5",
                      incident.status === 'resolved' ? 'bg-green-500' :
                      incident.status === 'monitoring' ? 'bg-yellow-500' : 'bg-red-500'
                    )} />
                    <div className="flex-1">
                      <h4 className="font-medium">{incident.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(incident.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                    <Badge variant={getStatusBadgeColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>System Status Summary</CardTitle>
          <CardDescription>
            Overall system health and performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.uptime_percentage}%
              </div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.api_response_time}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {metrics.active_users}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;