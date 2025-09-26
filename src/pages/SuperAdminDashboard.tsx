import React, { useEffect, useState } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Database,
  HardDrive,
  Zap,
  Crown,
  Sparkles,
  Calendar,
  Target,
  Award,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SuperAdminDashboard: React.FC = () => {
  const { 
    platformUsage, 
    systemHealth, 
    roleRequests,
    tenants,
    globalUsers,
    loadPlatformUsage, 
    loadSystemHealth,
    loadRoleRequests,
    loadTenants,
    loadGlobalUsers,
    isLoading 
  } = useSuperAdmin();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const loadData = async () => {
      await Promise.all([
        loadPlatformUsage(),
        loadSystemHealth(),
        loadRoleRequests({ status: 'pending' }),
        loadTenants(),
        loadGlobalUsers()
      ]);
    };
    loadData();

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadPlatformUsage(),
        loadSystemHealth(),
        loadRoleRequests({ status: 'pending' }),
        loadTenants(),
        loadGlobalUsers()
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      healthy: 'default',
      up: 'default',
      warning: 'outline',
      degraded: 'outline',
      critical: 'destructive',
      down: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const pendingRoleRequests = roleRequests.filter(r => r.status === 'pending');
  const activeTenants = tenants.filter(t => t.status === 'active');
  const activeUsers = globalUsers.filter(u => u.status === 'active');

  if (isLoading && !platformUsage) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
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
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#2C3E50' }}>
            <Crown className="h-8 w-8" style={{ color: '#1E90FF' }} />
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Platform overview and system monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center p-4 rounded-xl border" style={{ 
            backgroundColor: 'white',
            borderColor: '#E9EDF2'
          }}>
            <div className="text-2xl font-bold" style={{ color: '#2C3E50' }}>{formatTime(currentTime)}</div>
            <div className="text-sm flex items-center justify-center mt-1" style={{ color: '#7A8691' }}>
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(currentTime)}
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#2C3E50' }}>{formatNumber(platformUsage?.total_tenants || 0)}</div>
            <div className="flex items-center text-sm mt-1">
              <TrendingUp className="h-4 w-4 mr-1" style={{ color: '#2ECC71' }} />
              <span className="font-medium" style={{ color: '#2ECC71' }}>+{platformUsage?.growth.tenants_growth || 0}%</span>
              <span className="ml-1 text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#2C3E50' }}>{formatNumber(platformUsage?.total_users || 0)}</div>
            <div className="flex items-center text-sm mt-1">
              <TrendingUp className="h-4 w-4 mr-1" style={{ color: '#2ECC71' }} />
              <span className="font-medium" style={{ color: '#2ECC71' }}>+{platformUsage?.growth.users_growth || 0}%</span>
              <span className="ml-1 text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: '#2C3E50' }}>
              {formatCurrency(platformUsage?.revenue.monthly || 0, platformUsage?.revenue.currency)}
            </div>
            <div className="flex items-center text-sm mt-1">
              <TrendingUp className="h-4 w-4 mr-1" style={{ color: '#2ECC71' }} />
              <span className="font-medium" style={{ color: '#2ECC71' }}>+{platformUsage?.growth.revenue_growth || 0}%</span>
              <span className="ml-1 text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-2">
              {getStatusBadge(systemHealth?.status || 'unknown')}
              <span className="text-xl font-bold" style={{ color: '#2C3E50' }}>{systemHealth?.uptime || 0}%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Services Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Service</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {getStatusBadge(systemHealth?.services.api.status || 'unknown')}
              <span className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                {systemHealth?.services.api.response_time || 0}ms
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Error rate: {systemHealth?.services.api.error_rate || 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {getStatusBadge(systemHealth?.services.database.status || 'unknown')}
              <span className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                {systemHealth?.services.database.connections || 0} conn
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Query time: {systemHealth?.services.database.query_time || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {getStatusBadge(systemHealth?.services.storage.status || 'unknown')}
              <span className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                {systemHealth?.services.storage.usage_percent || 0}%
              </span>
            </div>
            <Progress 
              value={systemHealth?.services.storage.usage_percent || 0} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              {getStatusBadge(systemHealth?.services.cache.status || 'unknown')}
              <span className="text-sm font-medium" style={{ color: '#2C3E50' }}>
                {systemHealth?.services.cache.hit_rate || 0}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Memory: {systemHealth?.services.cache.memory_usage || 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Pending Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <AlertTriangle className="h-5 w-5 mr-2" style={{ color: '#F59E0B' }} />
              System Alerts
            </CardTitle>
            <CardDescription>
              Recent system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth?.alerts.length === 0 ? (
                <div className="flex items-center space-x-3 p-3 rounded-lg border" style={{ backgroundColor: '#F4F6F8', borderColor: '#E9EDF2' }}>
                  <CheckCircle className="h-5 w-5" style={{ color: '#2ECC71' }} />
                  <span className="text-sm" style={{ color: '#2C3E50' }}>No active alerts</span>
                </div>
              ) : (
                systemHealth?.alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-all duration-300" style={{ borderColor: '#E9EDF2' }}>
                    <div className={cn(
                      'h-2 w-2 rounded-full mt-2 animate-pulse',
                      alert.level === 'critical' ? 'bg-red-500' :
                      alert.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>{alert.message}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {alert.resolved ? (
                      <CheckCircle className="h-4 w-4" style={{ color: '#2ECC71' }} />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Role Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <Users className="h-5 w-5 mr-2" style={{ color: '#1E90FF' }} />
              Pending Role Requests
              {pendingRoleRequests.length > 0 && (
                <Badge className="ml-2 animate-pulse" style={{ backgroundColor: '#E74C3C', color: 'white' }}>
                  {pendingRoleRequests.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Role elevation requests awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRoleRequests.length === 0 ? (
                <div className="flex items-center space-x-3 p-3 rounded-lg border" style={{ backgroundColor: '#F4F6F8', borderColor: '#E9EDF2' }}>
                  <CheckCircle className="h-5 w-5" style={{ color: '#2ECC71' }} />
                  <span className="text-sm" style={{ color: '#2C3E50' }}>No pending requests</span>
                </div>
              ) : (
                pendingRoleRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-all duration-300" style={{ borderColor: '#E9EDF2' }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>{request.user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.current_role} → {request.requested_role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.tenant_name}
                      </p>
                    </div>
                    <Button size="sm" style={{ backgroundColor: '#1E90FF', color: 'white' }}>
                      Review
                    </Button>
                  </div>
                ))
              )}
              {pendingRoleRequests.length > 3 && (
                <Button variant="ghost" className="w-full" size="sm">
                  View all {pendingRoleRequests.length} requests
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Statistics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <Target className="h-5 w-5 mr-2" style={{ color: '#2ECC71' }} />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Tenants</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>{activeTenants.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>{activeUsers.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">API Calls</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>{formatNumber(platformUsage?.total_api_calls || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">System Uptime</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>{systemHealth?.uptime || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <Award className="h-5 w-5 mr-2" style={{ color: '#F59E0B' }} />
              Platform Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg" style={{ backgroundColor: '#F4F6F8' }}>
              <CheckCircle className="h-5 w-5" style={{ color: '#2ECC71' }} />
              <span className="text-sm" style={{ color: '#2C3E50' }}>99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg" style={{ backgroundColor: '#F4F6F8' }}>
              <CheckCircle className="h-5 w-5" style={{ color: '#2ECC71' }} />
              <span className="text-sm" style={{ color: '#2C3E50' }}>1000+ Active Users</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg" style={{ backgroundColor: '#F4F6F8' }}>
              <CheckCircle className="h-5 w-5" style={{ color: '#2ECC71' }} />
              <span className="text-sm" style={{ color: '#2C3E50' }}>Zero Security Incidents</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <BarChart3 className="h-5 w-5 mr-2" style={{ color: '#1B2A41' }} />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Response Time</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>{systemHealth?.services.api.response_time || 0}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cache Hit Rate</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>{systemHealth?.services.cache.hit_rate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>{systemHealth?.services.api.error_rate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Storage Usage</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>{systemHealth?.services.storage.usage_percent || 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;