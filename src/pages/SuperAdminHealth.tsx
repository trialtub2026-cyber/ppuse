import React, { useEffect, useState } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Bell,
  Settings,
  TrendingUp,
  TrendingDown,
  Wifi,
  Shield,
  Monitor,
  Cpu,
  MemoryStick,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SuperAdminHealth: React.FC = () => {
  const { systemHealth, loadSystemHealth, isLoading } = useSuperAdmin();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSystemHealth();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadSystemHealth();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical':
      case 'down':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
      case 'down':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading && !systemHealth) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of platform services and infrastructure
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              checked={autoRefresh} 
              onCheckedChange={setAutoRefresh}
              id="auto-refresh"
            />
            <label htmlFor="auto-refresh" className="text-sm font-medium">
              Auto-refresh
            </label>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadSystemHealth()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall System Status */}
      <Card className={cn('border-2', getStatusColor(systemHealth?.status || 'unknown'))}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(systemHealth?.status || 'unknown')}
            System Status: {systemHealth?.status || 'Unknown'}
          </CardTitle>
          <CardDescription>
            Overall platform health and uptime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {systemHealth?.uptime || 0}%
              </div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {systemHealth?.services.api.response_time || 0}ms
              </div>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {systemHealth?.alerts.filter(a => !a.resolved).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* API Service */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              API Service
            </CardTitle>
            <Badge className={getStatusColor(systemHealth?.services.api.status || 'unknown')}>
              {getStatusIcon(systemHealth?.services.api.status || 'unknown')}
              {systemHealth?.services.api.status || 'Unknown'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Response Time</span>
                <span className="font-medium">{systemHealth?.services.api.response_time || 0}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span className="font-medium">{systemHealth?.services.api.error_rate || 0}%</span>
              </div>
              <Progress 
                value={100 - (systemHealth?.services.api.error_rate || 0)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </CardTitle>
            <Badge className={getStatusColor(systemHealth?.services.database.status || 'unknown')}>
              {getStatusIcon(systemHealth?.services.database.status || 'unknown')}
              {systemHealth?.services.database.status || 'Unknown'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Connections</span>
                <span className="font-medium">{systemHealth?.services.database.connections || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Query Time</span>
                <span className="font-medium">{systemHealth?.services.database.query_time || 0}ms</span>
              </div>
              <Progress 
                value={Math.min((systemHealth?.services.database.connections || 0) / 100 * 100, 100)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage
            </CardTitle>
            <Badge className={getStatusColor(systemHealth?.services.storage.status || 'unknown')}>
              {getStatusIcon(systemHealth?.services.storage.status || 'unknown')}
              {systemHealth?.services.storage.status || 'Unknown'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage</span>
                <span className="font-medium">{systemHealth?.services.storage.usage_percent || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Available</span>
                <span className="font-medium">{systemHealth?.services.storage.available_gb || 0} GB</span>
              </div>
              <Progress 
                value={systemHealth?.services.storage.usage_percent || 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Cache */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Cache
            </CardTitle>
            <Badge className={getStatusColor(systemHealth?.services.cache.status || 'unknown')}>
              {getStatusIcon(systemHealth?.services.cache.status || 'unknown')}
              {systemHealth?.services.cache.status || 'Unknown'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hit Rate</span>
                <span className="font-medium">{systemHealth?.services.cache.hit_rate || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span className="font-medium">{systemHealth?.services.cache.memory_usage || 0}%</span>
              </div>
              <Progress 
                value={systemHealth?.services.cache.hit_rate || 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Real-time system performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">CPU Usage</p>
                    <p className="text-sm text-muted-foreground">Current load</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">45%</p>
                  <Progress value={45} className="w-20 h-2" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MemoryStick className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Memory Usage</p>
                    <p className="text-sm text-muted-foreground">RAM utilization</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">72%</p>
                  <Progress value={72} className="w-20 h-2" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Network className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Network I/O</p>
                    <p className="text-sm text-muted-foreground">Data transfer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">1.2 GB/s</p>
                  <p className="text-sm text-muted-foreground">Throughput</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              System Alerts
              {systemHealth?.alerts.filter(a => !a.resolved).length > 0 && (
                <Badge variant="destructive">
                  {systemHealth.alerts.filter(a => !a.resolved).length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent alerts and system notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth?.alerts.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 p-3 border border-green-200 rounded-lg bg-green-50">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">No active alerts</span>
                </div>
              ) : (
                systemHealth?.alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getAlertIcon(alert.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <Badge 
                          variant={alert.level === 'critical' ? 'destructive' : 
                                  alert.level === 'warning' ? 'secondary' : 'default'}
                          className="text-xs"
                        >
                          {alert.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {alert.resolved ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Infrastructure Overview
          </CardTitle>
          <CardDescription>
            Detailed view of system components and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Load Balancers */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Load Balancers
              </h4>
              <div className="space-y-2">
                {['LB-01', 'LB-02'].map((lb) => (
                  <div key={lb} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{lb}</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Servers */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                App Servers
              </h4>
              <div className="space-y-2">
                {['APP-01', 'APP-02', 'APP-03'].map((server) => (
                  <div key={server} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{server}</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Running
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Database Clusters */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                DB Clusters
              </h4>
              <div className="space-y-2">
                {['Primary', 'Replica-01', 'Replica-02'].map((db) => (
                  <div key={db} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{db}</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminHealth;