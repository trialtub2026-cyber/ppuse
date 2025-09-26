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
  AlertTriangle,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Users,
  Activity,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from '@/hooks/use-toast';

interface AdminDashboardData {
  contractsExpiringToday: Array<{
    id: string;
    customer_name: string;
    contract_type: string;
    expiry_date: string;
    value: number;
  }>;
  complaintsOverSevenDays: Array<{
    id: string;
    title: string;
    customer_name: string;
    days_open: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to: string;
  }>;
  todayComplaintCount: number;
  serviceContractSummary: {
    total: number;
    active: number;
    expiring_30_days: number;
    expired: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
  }>;
  systemMetrics: {
    total_users: number;
    active_sessions: number;
    system_uptime: number;
    error_rate: number;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: AdminDashboardData = {
        contractsExpiringToday: [
          {
            id: '1',
            customer_name: 'TechCorp Solutions',
            contract_type: 'Service Agreement',
            expiry_date: new Date().toISOString(),
            value: 50000
          },
          {
            id: '2',
            customer_name: 'Global Manufacturing Inc',
            contract_type: 'Support Contract',
            expiry_date: new Date().toISOString(),
            value: 25000
          }
        ],
        complaintsOverSevenDays: [
          {
            id: '1',
            title: 'System Performance Issues',
            customer_name: 'Retail Giants Ltd',
            days_open: 12,
            priority: 'high',
            assigned_to: 'John Engineer'
          },
          {
            id: '2',
            title: 'Integration Problems',
            customer_name: 'StartupTech Inc',
            days_open: 8,
            priority: 'medium',
            assigned_to: 'Sarah Engineer'
          },
          {
            id: '3',
            title: 'Data Sync Issues',
            customer_name: 'Enterprise Corp',
            days_open: 15,
            priority: 'urgent',
            assigned_to: 'Mike Engineer'
          }
        ],
        todayComplaintCount: 7,
        serviceContractSummary: {
          total: 156,
          active: 142,
          expiring_30_days: 8,
          expired: 6
        },
        recentActivity: [
          {
            id: '1',
            action: 'Contract Renewed',
            user: 'Admin User',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            details: 'TechCorp Solutions - Service Agreement'
          },
          {
            id: '2',
            action: 'Complaint Resolved',
            user: 'John Engineer',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            details: 'System Performance Issues - Retail Giants Ltd'
          },
          {
            id: '3',
            action: 'New User Created',
            user: 'Admin User',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            details: 'Engineer role assigned to Alex Smith'
          }
        ],
        systemMetrics: {
          total_users: 45,
          active_sessions: 12,
          system_uptime: 99.8,
          error_rate: 0.02
        }
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
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
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchAdminData, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const contractStatusData = data ? [
    { name: 'Active', value: data.serviceContractSummary.active, color: '#10b981' },
    { name: 'Expiring Soon', value: data.serviceContractSummary.expiring_30_days, color: '#f59e0b' },
    { name: 'Expired', value: data.serviceContractSummary.expired, color: '#ef4444' }
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            System overview and administrative insights
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
          <Button onClick={fetchAdminData} disabled={isLoading}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Contracts Expiring Today"
          icon={Calendar}
          value={data?.contractsExpiringToday.length || 0}
          badge={{
            text: data?.contractsExpiringToday.length ? 'Action Required' : 'All Good',
            variant: data?.contractsExpiringToday.length ? 'destructive' : 'default'
          }}
          isLoading={isLoading}
          action={{
            label: 'View Details',
            onClick: () => toast({ title: 'Navigate to Contracts', description: 'Opening contracts page...' })
          }}
        />

        <DashboardWidget
          title="Complaints &gt; 7 Days"
          icon={AlertTriangle}
          value={data?.complaintsOverSevenDays.length || 0}
          badge={{
            text: data?.complaintsOverSevenDays.length ? 'Needs Attention' : 'Up to Date',
            variant: data?.complaintsOverSevenDays.length ? 'destructive' : 'default'
          }}
          isLoading={isLoading}
          action={{
            label: 'Review Complaints',
            onClick: () => toast({ title: 'Navigate to Tickets', description: 'Opening tickets page...' })
          }}
        />

        <DashboardWidget
          title="Today's Complaints"
          icon={Clock}
          value={data?.todayComplaintCount || 0}
          change={{
            value: '+2 from yesterday',
            trend: 'up'
          }}
          isLoading={isLoading}
        />

        <DashboardWidget
          title="System Uptime"
          icon={CheckCircle}
          value={data ? `${data.systemMetrics.system_uptime}%` : '0%'}
          change={{
            value: 'Last 30 days',
            trend: 'neutral'
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Service Contract Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Contract Overview</CardTitle>
            <CardDescription>
              Contract status distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contractStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {contractStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>
              Current system performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Users</span>
                <span className="text-2xl font-bold">{data?.systemMetrics.total_users || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Sessions</span>
                <span className="text-2xl font-bold">{data?.systemMetrics.active_sessions || 0}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Uptime</span>
                  <span className="text-sm text-green-600">{data?.systemMetrics.system_uptime || 0}%</span>
                </div>
                <Progress value={data?.systemMetrics.system_uptime || 0} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm text-red-600">{data?.systemMetrics.error_rate || 0}%</span>
                </div>
                <Progress value={(data?.systemMetrics.error_rate || 0) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Expiring Today */}
      {data?.contractsExpiringToday.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600" />
              Contracts Expiring Today
            </CardTitle>
            <CardDescription>
              Immediate attention required for contract renewals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contract Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.contractsExpiringToday.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.customer_name}</TableCell>
                    <TableCell>{contract.contract_type}</TableCell>
                    <TableCell>{formatCurrency(contract.value)}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Today</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        Renew
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {/* Complaints Over 7 Days */}
      {data?.complaintsOverSevenDays.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Complaints &gt; 7 Days
            </CardTitle>
            <CardDescription>
              Long-standing issues requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Days Open</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.complaintsOverSevenDays.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">{complaint.title}</TableCell>
                    <TableCell>{complaint.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">{complaint.days_open} days</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {complaint.assigned_to.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{complaint.assigned_to}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Administrative Activity</CardTitle>
          <CardDescription>
            Latest system and user activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{activity.action}</h4>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                No recent activity
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;