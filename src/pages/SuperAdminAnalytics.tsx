import React, { useEffect } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Activity,
  Zap,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SuperAdminAnalytics: React.FC = () => {
  const { 
    analyticsData, 
    platformUsage, 
    loadAnalyticsData, 
    loadPlatformUsage, 
    isLoading 
  } = useSuperAdmin();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadAnalyticsData(),
        loadPlatformUsage()
      ]);
    };
    loadData();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6'
  };

  const planColors = {
    basic: COLORS.accent,
    premium: COLORS.primary,
    enterprise: COLORS.purple
  };

  if (isLoading && !analyticsData) {
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
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights across the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              loadAnalyticsData();
              loadPlatformUsage();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(platformUsage?.revenue.monthly || 0, platformUsage?.revenue.currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{platformUsage?.growth.revenue_growth || 0}%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformUsage?.active_tenants || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{platformUsage?.growth.tenants_growth || 0}%
              </span>
              growth this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformUsage?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{platformUsage?.growth.users_growth || 0}%
              </span>
              growth this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(platformUsage?.total_api_calls || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tenant Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Tenant Growth
            </CardTitle>
            <CardDescription>
              Active tenants and new signups over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.tenant_metrics.labels.map((label, index) => ({
                date: label,
                active: analyticsData.tenant_metrics.active_tenants[index],
                signups: analyticsData.tenant_metrics.new_signups[index]
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke={COLORS.primary} 
                  strokeWidth={2}
                  name="Active Tenants"
                />
                <Line 
                  type="monotone" 
                  dataKey="signups" 
                  stroke={COLORS.secondary} 
                  strokeWidth={2}
                  name="New Signups"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>
              Total and active users over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.user_metrics.labels.map((label, index) => ({
                date: label,
                total: analyticsData.user_metrics.total_users[index],
                active: analyticsData.user_metrics.active_users[index],
                new: analyticsData.user_metrics.new_registrations[index]
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill={COLORS.primary} name="Total Users" />
                <Bar dataKey="active" fill={COLORS.secondary} name="Active Users" />
                <Bar dataKey="new" fill={COLORS.accent} name="New Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
            <CardDescription>
              Monthly revenue growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData?.revenue_metrics.labels.map((label, index) => ({
                date: label,
                revenue: analyticsData.revenue_metrics.monthly_revenue[index]
              })) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS.secondary} 
                  strokeWidth={3}
                  name="Monthly Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Plan Distribution
            </CardTitle>
            <CardDescription>
              Distribution of tenants by plan type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Basic', value: analyticsData?.revenue_metrics.plan_distribution.basic || 0 },
                      { name: 'Premium', value: analyticsData?.revenue_metrics.plan_distribution.premium || 0 },
                      { name: 'Enterprise', value: analyticsData?.revenue_metrics.plan_distribution.enterprise || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Basic', value: analyticsData?.revenue_metrics.plan_distribution.basic || 0 },
                      { name: 'Premium', value: analyticsData?.revenue_metrics.plan_distribution.premium || 0 },
                      { name: 'Enterprise', value: analyticsData?.revenue_metrics.plan_distribution.enterprise || 0 }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(planColors)[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-2">
                {[
                  { name: 'Basic', value: analyticsData?.revenue_metrics.plan_distribution.basic || 0, color: planColors.basic },
                  { name: 'Premium', value: analyticsData?.revenue_metrics.plan_distribution.premium || 0, color: planColors.premium },
                  { name: 'Enterprise', value: analyticsData?.revenue_metrics.plan_distribution.enterprise || 0, color: planColors.enterprise }
                ].map((plan) => (
                  <div key={plan.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: plan.color }}
                      />
                      <span className="text-sm font-medium">{plan.name}</span>
                    </div>
                    <Badge variant="secondary">{plan.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Usage & Performance
          </CardTitle>
          <CardDescription>
            API calls, error rates, and response times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* API Calls Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">API Calls</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData?.api_usage.labels.map((label, index) => ({
                  date: label,
                  calls: analyticsData.api_usage.total_calls[index]
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calls" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Error Rate Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Error Rate (%)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analyticsData?.api_usage.labels.map((label, index) => ({
                  date: label,
                  error_rate: analyticsData.api_usage.error_rate[index]
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="error_rate" 
                    stroke={COLORS.danger} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Response Time Chart */}
            <div>
              <h4 className="text-sm font-medium mb-3">Response Time (ms)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analyticsData?.api_usage.labels.map((label, index) => ({
                  date: label,
                  response_time: analyticsData.api_usage.response_time[index]
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="response_time" 
                    stroke={COLORS.accent} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used</span>
                <span>{platformUsage?.total_storage_gb || 0} GB</span>
              </div>
              <Progress value={68} className="h-2" />
              <p className="text-xs text-muted-foreground">
                68% of allocated storage
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analyticsData?.api_usage.response_time.slice(-1)[0] || 0}ms
            </div>
            <p className="text-sm text-muted-foreground">
              Current average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {analyticsData?.api_usage.error_rate.slice(-1)[0] || 0}%
            </div>
            <p className="text-sm text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;