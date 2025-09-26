import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import EngineerDashboard from '@/components/dashboard/EngineerDashboard';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3,
  Zap,
  Target,
  Award,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';

const Dashboard = () => {
  const { user, hasRole, hasPermission } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with real API calls
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCustomers: 1247,
      totalSales: 89650,
      activeContracts: 156,
      pendingTickets: 23,
      monthlyGrowth: {
        customers: 12.5,
        sales: 8.3,
        contracts: 15.2,
        tickets: -5.1
      }
    },
    recentActivity: [
      { id: 1, type: 'sale', description: 'New sale completed - $2,450', time: '2 minutes ago', status: 'success' },
      { id: 2, type: 'customer', description: 'New customer registered - Acme Corp', time: '15 minutes ago', status: 'info' },
      { id: 3, type: 'contract', description: 'Service contract renewed - TechStart Inc', time: '1 hour ago', status: 'success' },
      { id: 4, type: 'ticket', description: 'Support ticket created - Priority: High', time: '2 hours ago', status: 'warning' },
      { id: 5, type: 'payment', description: 'Payment received - $5,200', time: '3 hours ago', status: 'success' }
    ],
    quickActions: [
      { name: 'Add Customer', href: '/tenant/customers', icon: Users, color: 'blue' },
      { name: 'Create Sale', href: '/tenant/sales', icon: ShoppingCart, color: 'green' },
      { name: 'New Contract', href: '/tenant/contracts', icon: FileText, color: 'purple' },
      { name: 'View Reports', href: '/tenant/analytics', icon: BarChart3, color: 'orange' }
    ]
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return ShoppingCart;
      case 'customer': return Users;
      case 'contract': return FileText;
      case 'ticket': return AlertTriangle;
      case 'payment': return DollarSign;
      default: return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return { backgroundColor: '#DCFCE7', color: '#15803D', borderColor: '#BBF7D0' };
      case 'warning': return { backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' };
      case 'info': return { backgroundColor: '#E0F1FF', color: '#125DB3', borderColor: '#C1E3FF' };
      default: return { backgroundColor: '#F4F6F8', color: '#2C3E50', borderColor: '#E9EDF2' };
    }
  };

  if (isLoading) {
    return (
      <div className="professional-container professional-section space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="professional-card">
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

  if (hasRole('admin')) {
    return <AdminDashboard />;
  }

  if (hasRole('engineer')) {
    return <EngineerDashboard />;
  }

  if (hasRole('customer')) {
    return <CustomerDashboard />;
  }

  return (
    <div className="professional-container professional-section space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="professional-card" style={{
        background: 'linear-gradient(to right, rgba(30, 144, 255, 0.1), rgba(27, 42, 65, 0.1))',
        borderColor: 'rgba(30, 144, 255, 0.2)'
      }}>
        <div className="professional-card-content">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#2C3E50' }}>
                  Welcome back, {user?.name?.split(' ')[0]}!
                </h1>
                <Sparkles className="h-6 w-6 animate-pulse" style={{ color: '#1E90FF' }} />
              </div>
              <p className="text-lg" style={{ color: '#7A8691' }}>
                Here's what's happening with your business today
              </p>
            </div>
            <div className="professional-card bg-white/80 backdrop-blur-sm" style={{ borderColor: '#E9EDF2' }}>
              <div className="professional-card-content text-center">
                <div className="text-2xl font-bold" style={{ color: '#2C3E50' }}>{formatTime(currentTime)}</div>
                <div className="text-sm flex items-center justify-center mt-1" style={{ color: '#7A8691' }}>
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="responsive-grid">
        <Card className="professional-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="professional-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8691' }}>Total Customers</CardTitle>
            <Users className="h-5 w-5" style={{ color: '#1E90FF' }} />
          </CardHeader>
          <CardContent className="professional-card-content pt-0">
            <div className="text-3xl font-bold mb-2" style={{ color: '#2C3E50' }}>{dashboardData.stats.totalCustomers.toLocaleString()}</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" style={{ color: '#2ECC71' }} />
              <span className="font-medium" style={{ color: '#2ECC71' }}>+{dashboardData.stats.monthlyGrowth.customers}%</span>
              <span className="ml-1" style={{ color: '#9EAAB7' }}>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="professional-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8691' }}>Total Sales</CardTitle>
            <DollarSign className="h-5 w-5" style={{ color: '#2ECC71' }} />
          </CardHeader>
          <CardContent className="professional-card-content pt-0">
            <div className="text-3xl font-bold mb-2" style={{ color: '#2C3E50' }}>{formatCurrency(dashboardData.stats.totalSales)}</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" style={{ color: '#2ECC71' }} />
              <span className="font-medium" style={{ color: '#2ECC71' }}>+{dashboardData.stats.monthlyGrowth.sales}%</span>
              <span className="ml-1" style={{ color: '#9EAAB7' }}>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="professional-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8691' }}>Active Contracts</CardTitle>
            <FileText className="h-5 w-5" style={{ color: '#1B2A41' }} />
          </CardHeader>
          <CardContent className="professional-card-content pt-0">
            <div className="text-3xl font-bold mb-2" style={{ color: '#2C3E50' }}>{dashboardData.stats.activeContracts}</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" style={{ color: '#2ECC71' }} />
              <span className="font-medium" style={{ color: '#2ECC71' }}>+{dashboardData.stats.monthlyGrowth.contracts}%</span>
              <span className="ml-1" style={{ color: '#9EAAB7' }}>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card hover:shadow-lg transition-all duration-300">
          <CardHeader className="professional-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#7A8691' }}>Pending Tickets</CardTitle>
            <AlertTriangle className="h-5 w-5" style={{ color: '#F59E0B' }} />
          </CardHeader>
          <CardContent className="professional-card-content pt-0">
            <div className="text-3xl font-bold mb-2" style={{ color: '#2C3E50' }}>{dashboardData.stats.pendingTickets}</div>
            <div className="flex items-center text-sm">
              <TrendingDown className="h-4 w-4 mr-1" style={{ color: '#2ECC71' }} />
              <span className="font-medium" style={{ color: '#2ECC71' }}>{Math.abs(dashboardData.stats.monthlyGrowth.tickets)}%</span>
              <span className="ml-1" style={{ color: '#9EAAB7' }}>decrease</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="professional-card">
          <CardHeader className="professional-card-header">
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <Zap className="h-5 w-5 mr-2" style={{ color: '#F59E0B' }} />
              Quick Actions
            </CardTitle>
            <CardDescription style={{ color: '#7A8691' }}>
              Frequently used actions for faster workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="professional-card-content">
            <div className="grid grid-cols-2 gap-4">
              {dashboardData.quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.name}
                    variant="outline"
                    className={cn(
                      "h-20 flex-col space-y-2 hover:shadow-md transition-all duration-300 border-2",
                      action.color === 'blue' && "hover:bg-blue-50 text-blue-700",
                      action.color === 'green' && "hover:bg-green-50 text-green-700",
                      action.color === 'purple' && "hover:bg-purple-50 text-purple-700",
                      action.color === 'orange' && "hover:bg-orange-50 text-orange-700"
                    )}
                    style={{
                      borderColor: action.color === 'blue' ? '#1E90FF' :
                                  action.color === 'green' ? '#2ECC71' :
                                  action.color === 'purple' ? '#1B2A41' :
                                  action.color === 'orange' ? '#F59E0B' : '#E9EDF2',
                      color: action.color === 'blue' ? '#1E90FF' :
                             action.color === 'green' ? '#2ECC71' :
                             action.color === 'purple' ? '#1B2A41' :
                             action.color === 'orange' ? '#F59E0B' : '#2C3E50'
                    }}
                    onClick={() => window.location.href = action.href}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.name}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="professional-card">
          <CardHeader className="professional-card-header">
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <Activity className="h-5 w-5 mr-2" style={{ color: '#1E90FF' }} />
              Recent Activity
            </CardTitle>
            <CardDescription style={{ color: '#7A8691' }}>
              Latest updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="professional-card-content">
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorStyle = getActivityColor(activity.status);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-neutral-50 transition-all duration-200" style={{ borderColor: '#E9EDF2' }}>
                    <div className="p-2 rounded-lg border" style={colorStyle}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#2C3E50' }}>{activity.description}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" style={{ color: '#9EAAB7' }} />
                        <p className="text-xs" style={{ color: '#9EAAB7' }}>{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="professional-card">
          <CardHeader className="professional-card-header">
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <Target className="h-5 w-5 mr-2" style={{ color: '#2ECC71' }} />
              Monthly Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="professional-card-content space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: '#7A8691' }}>Sales Target</span>
                <span className="font-medium" style={{ color: '#2C3E50' }}>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: '#7A8691' }}>Customer Acquisition</span>
                <span className="font-medium" style={{ color: '#2C3E50' }}>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: '#7A8691' }}>Contract Renewals</span>
                <span className="font-medium" style={{ color: '#2C3E50' }}>90%</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader className="professional-card-header">
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <Award className="h-5 w-5 mr-2" style={{ color: '#F59E0B' }} />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="professional-card-content space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg border" style={{
              backgroundColor: '#DCFCE7',
              borderColor: '#BBF7D0'
            }}>
              <CheckCircle className="h-5 w-5" style={{ color: '#2ECC71' }} />
              <span className="text-sm" style={{ color: '#2C3E50' }}>100+ Customers Milestone</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg border" style={{
              backgroundColor: '#DCFCE7',
              borderColor: '#BBF7D0'
            }}>
              <CheckCircle className="h-5 w-5" style={{ color: '#2ECC71' }} />
              <span className="text-sm" style={{ color: '#2C3E50' }}>$50K Monthly Revenue</span>
            </div>
            <div className="flex items-center space-x-3 p-2 rounded-lg border" style={{
              backgroundColor: '#DCFCE7',
              borderColor: '#BBF7D0'
            }}>
              <CheckCircle className="h-5 w-5" style={{ color: '#2ECC71' }} />
              <span className="text-sm" style={{ color: '#2C3E50' }}>Zero Critical Issues</span>
            </div>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader className="professional-card-header">
            <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
              <BarChart3 className="h-5 w-5 mr-2" style={{ color: '#1B2A41' }} />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="professional-card-content space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#7A8691' }}>Avg. Deal Size</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>$2,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#7A8691' }}>Conversion Rate</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>24.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#7A8691' }}>Customer Satisfaction</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>4.8/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: '#7A8691' }}>Response Time</span>
              <span className="font-semibold" style={{ color: '#2C3E50' }}>&lt 2 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;