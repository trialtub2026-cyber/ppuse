import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardWidget from './DashboardWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  FileText,
  AlertCircle,
  Calendar,
  ShoppingCart,
  Shield,
  Clock,
  CheckCircle,
  ArrowUpRight,
  RefreshCw,
  Star
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { toast } from '@/hooks/use-toast';

interface CustomerDashboardData {
  totalProducts: {
    count: number;
    categories: Array<{
      name: string;
      count: number;
      color: string;
    }>;
  };
  contractsNearExpiry: Array<{
    id: string;
    contract_type: string;
    product_name: string;
    expiry_date: string;
    days_remaining: number;
    auto_renewal: boolean;
  }>;
  complaintSummary: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    avg_resolution_time: number;
  };
  productWarrantyStatus: Array<{
    id: string;
    product_name: string;
    category: string;
    warranty_expiry: string;
    days_remaining: number;
    status: 'active' | 'expiring_soon' | 'expired';
  }>;
  recentPurchases: Array<{
    id: string;
    product_name: string;
    category: string;
    purchase_date: string;
    amount: number;
    warranty_period: number;
  }>;
  supportTickets: Array<{
    id: string;
    title: string;
    status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    last_update: string;
  }>;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchCustomerData = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: CustomerDashboardData = {
        totalProducts: {
          count: 8,
          categories: [
            { name: 'Software Licenses', count: 3, color: '#3b82f6' },
            { name: 'Hardware', count: 2, color: '#10b981' },
            { name: 'Support Services', count: 2, color: '#f59e0b' },
            { name: 'Training', count: 1, color: '#ef4444' }
          ]
        },
        contractsNearExpiry: [
          {
            id: '1',
            contract_type: 'Service Agreement',
            product_name: 'Enterprise Software License',
            expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            days_remaining: 15,
            auto_renewal: true
          },
          {
            id: '2',
            contract_type: 'Support Contract',
            product_name: 'Premium Support Package',
            expiry_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
            days_remaining: 25,
            auto_renewal: false
          }
        ],
        complaintSummary: {
          total: 12,
          open: 2,
          in_progress: 1,
          resolved: 9,
          avg_resolution_time: 24
        },
        productWarrantyStatus: [
          {
            id: '1',
            product_name: 'Enterprise Server Hardware',
            category: 'Hardware',
            warranty_expiry: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            days_remaining: 45,
            status: 'expiring_soon'
          },
          {
            id: '2',
            product_name: 'Business Software Suite',
            category: 'Software',
            warranty_expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            days_remaining: 180,
            status: 'active'
          },
          {
            id: '3',
            product_name: 'Legacy System Integration',
            category: 'Services',
            warranty_expiry: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            days_remaining: -30,
            status: 'expired'
          }
        ],
        recentPurchases: [
          {
            id: '1',
            product_name: 'Advanced Analytics Module',
            category: 'Software',
            purchase_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 15000,
            warranty_period: 12
          },
          {
            id: '2',
            product_name: 'Security Enhancement Package',
            category: 'Software',
            purchase_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 8500,
            warranty_period: 24
          }
        ],
        supportTickets: [
          {
            id: '1',
            title: 'Integration Setup Assistance',
            status: 'in_progress',
            priority: 'medium',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            last_update: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            title: 'Performance Optimization Request',
            status: 'open',
            priority: 'low',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            last_update: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to fetch customer dashboard data:', error);
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
    fetchCustomerData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchCustomerData, 10 * 60 * 1000); // Refresh every 10 minutes
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expiring_soon': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'open': return 'text-orange-600 bg-orange-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  const complaintStatusData = data ? [
    { name: 'Resolved', value: data.complaintSummary.resolved, color: '#10b981' },
    { name: 'In Progress', value: data.complaintSummary.in_progress, color: '#3b82f6' },
    { name: 'Open', value: data.complaintSummary.open, color: '#f59e0b' }
  ] : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Portal
          </h1>
          <p className="text-gray-600 mt-1">
            Your products, contracts, and support overview
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
          <Button onClick={fetchCustomerData} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardWidget
          title="Total Products"
          icon={Package}
          value={data?.totalProducts.count || 0}
          change={{
            value: '+2 this month',
            trend: 'up'
          }}
          isLoading={isLoading}
          action={{
            label: 'View Products',
            onClick: () => toast({ title: 'Navigate to Products', description: 'Opening product catalog...' })
          }}
        />

        <DashboardWidget
          title="Contracts Near Expiry"
          icon={Calendar}
          value={data?.contractsNearExpiry.length || 0}
          badge={{
            text: data?.contractsNearExpiry.length ? 'Action Needed' : 'All Good',
            variant: data?.contractsNearExpiry.length ? 'destructive' : 'default'
          }}
          isLoading={isLoading}
          action={{
            label: 'Review Contracts',
            onClick: () => toast({ title: 'Navigate to Contracts', description: 'Opening contract details...' })
          }}
        />

        <DashboardWidget
          title="Open Support Tickets"
          icon={AlertCircle}
          value={data ? data.complaintSummary.open + data.complaintSummary.in_progress : 0}
          change={{
            value: `${data?.complaintSummary.resolved || 0} resolved`,
            trend: 'neutral'
          }}
          isLoading={isLoading}
          action={{
            label: 'View Tickets',
            onClick: () => toast({ title: 'Navigate to Support', description: 'Opening support tickets...' })
          }}
        />

        <DashboardWidget
          title="Avg Resolution Time"
          icon={Clock}
          value={data ? `${data.complaintSummary.avg_resolution_time}h` : '0h'}
          change={{
            value: 'Last 30 days',
            trend: 'neutral'
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Product Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Portfolio</CardTitle>
            <CardDescription>
              Your products by category
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
                    data={data?.totalProducts.categories || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(data?.totalProducts.categories || []).map((entry, index) => (
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
            <CardTitle>Support Ticket Summary</CardTitle>
            <CardDescription>
              Status distribution of your support requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={complaintStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complaintStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {data?.complaintSummary.resolved || 0}
                    </div>
                    <div className="text-xs text-gray-500">Resolved</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {data?.complaintSummary.in_progress || 0}
                    </div>
                    <div className="text-xs text-gray-500">In Progress</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {data?.complaintSummary.open || 0}
                    </div>
                    <div className="text-xs text-gray-500">Open</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contracts Near Expiry */}
      {data?.contractsNearExpiry.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Contracts Expiring Within 30 Days
            </CardTitle>
            <CardDescription>
              Review and renew your expiring contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>Auto Renewal</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.contractsNearExpiry.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contract_type}</TableCell>
                    <TableCell>{contract.product_name}</TableCell>
                    <TableCell>
                      {new Date(contract.expiry_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={contract.days_remaining <= 15 ? 'destructive' : 'secondary'}>
                        {contract.days_remaining} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={contract.auto_renewal ? 'default' : 'outline'}>
                        {contract.auto_renewal ? 'Enabled' : 'Disabled'}
                      </Badge>
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

      {/* Product Warranty Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Product Warranty Status
          </CardTitle>
          <CardDescription>
            Monitor warranty coverage for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Warranty Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.productWarrantyStatus.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.product_name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    {new Date(product.warranty_expiry).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(product.status)}>
                      {product.status === 'expiring_soon' ? 'Expiring Soon' : 
                       product.status === 'active' ? 'Active' : 'Expired'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      {product.status === 'expired' ? 'Extend' : 'Details'}
                    </Button>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No products with warranty information
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Purchases
          </CardTitle>
          <CardDescription>
            Your latest product acquisitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Warranty</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.recentPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.product_name}</TableCell>
                  <TableCell>{purchase.category}</TableCell>
                  <TableCell>
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{formatCurrency(purchase.amount)}</TableCell>
                  <TableCell>{purchase.warranty_period} months</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No recent purchases
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Your Support Tickets
          </CardTitle>
          <CardDescription>
            Track your support requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.supportTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(ticket.last_update).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No support tickets
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

export default CustomerDashboard;