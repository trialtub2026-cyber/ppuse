import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  RefreshCw,
  Download,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { serviceContractService } from '@/services/serviceContractService';
import { 
  ServiceContract, 
  ServiceContractFilters, 
  SERVICE_CONTRACT_STATUSES,
  SERVICE_LEVELS
} from '@/types/productSales';

const ServiceContracts: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  // State management
  const [contracts, setContracts] = useState<ServiceContract[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<ServiceContractFilters>({});

  // Renewal/Cancel states
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ServiceContract | null>(null);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Load data
  useEffect(() => {
    loadContracts();
    loadAnalytics();
  }, [currentPage, filters]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await serviceContractService.getServiceContracts(filters, currentPage, pageSize);
      
      setContracts(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError('Failed to load service contracts');
      console.error('Error loading contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await serviceContractService.getContractAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadContracts(), loadAnalytics()]);
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleViewContract = (contract: ServiceContract) => {
    navigate(`/service-contracts/${contract.id}`);
  };

  const handleRenewContract = (contract: ServiceContract) => {
    setSelectedContract(contract);
    setShowRenewalDialog(true);
  };

  const handleCancelContract = (contract: ServiceContract) => {
    setSelectedContract(contract);
    setCancelReason('');
    setShowCancelDialog(true);
  };

  const confirmRenewal = async () => {
    if (!selectedContract) return;

    try {
      setRenewalLoading(true);
      await serviceContractService.renewServiceContract(selectedContract.id, {
        service_level: selectedContract.service_level,
        auto_renewal: selectedContract.auto_renewal,
        renewal_notice_period: selectedContract.renewal_notice_period,
        terms: selectedContract.terms
      });
      
      toast.success('Contract renewed successfully');
      setShowRenewalDialog(false);
      setSelectedContract(null);
      loadContracts();
      loadAnalytics();
    } catch (err) {
      toast.error('Failed to renew contract');
      console.error('Error renewing contract:', err);
    } finally {
      setRenewalLoading(false);
    }
  };

  const confirmCancellation = async () => {
    if (!selectedContract || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelLoading(true);
      await serviceContractService.cancelServiceContract(selectedContract.id, cancelReason);
      
      toast.success('Contract cancelled successfully');
      setShowCancelDialog(false);
      setSelectedContract(null);
      setCancelReason('');
      loadContracts();
      loadAnalytics();
    } catch (err) {
      toast.error('Failed to cancel contract');
      console.error('Error cancelling contract:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ServiceContractFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = SERVICE_CONTRACT_STATUSES.find(s => s.value === status);
    return (
      <Badge className={cn('text-xs', statusConfig?.color)}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getServiceLevelBadge = (level: string) => {
    const levelConfig = SERVICE_LEVELS.find(l => l.value === level);
    const colors = {
      basic: 'bg-gray-100 text-gray-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={cn('text-xs', colors[level as keyof typeof colors])}>
        {levelConfig?.label || level}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExpiryStatus = (endDate: string) => {
    const expiry = new Date(endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', icon: XCircle };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'text-yellow-600', icon: AlertTriangle };
    } else {
      return { status: 'active', color: 'text-green-600', icon: CheckCircle };
    }
  };

  if (!hasPermission('manage_contracts')) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access service contracts.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Contracts</h1>
          <p className="text-muted-foreground">
            Manage auto-generated service contracts from product sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_contracts}</div>
              <p className="text-xs text-muted-foreground">
                All service contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.active_contracts}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.total_value)}</div>
              <p className="text-xs text-muted-foreground">
                Contract portfolio value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renewal Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.renewal_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Contract renewals
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {SERVICE_CONTRACT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Service Level</label>
              <Select
                value={filters.service_level || 'all'}
                onValueChange={(value) => handleFilterChange('service_level', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {SERVICE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry From</label>
              <Input
                type="date"
                value={filters.expiry_from || ''}
                onChange={(e) => handleFilterChange('expiry_from', e.target.value)}
              />
            </div>
          </div>

          {Object.keys(filters).some(key => filters[key as keyof ServiceContractFilters]) && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Contracts</CardTitle>
          <CardDescription>
            {totalItems} total contracts found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No service contracts found</h3>
              <p className="text-muted-foreground mb-4">
                Service contracts are automatically generated from product sales.
              </p>
              <Button onClick={() => navigate('/product-sales')}>
                <FileText className="h-4 w-4 mr-2" />
                View Product Sales
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Service Level</TableHead>
                    <TableHead>Contract Value</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => {
                    const expiryStatus = getExpiryStatus(contract.end_date);
                    const ExpiryIcon = expiryStatus.icon;
                    
                    return (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div className="font-medium">{contract.contract_number}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {contract.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{contract.customer_name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {contract.customer_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{contract.product_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {contract.warranty_period} months warranty
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getServiceLevelBadge(contract.service_level)}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(contract.contract_value)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(contract.start_date)}</div>
                            <div className="text-muted-foreground">to {formatDate(contract.end_date)}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ExpiryIcon className={cn("h-4 w-4", expiryStatus.color)} />
                            <div className="text-sm">
                              <div>{formatDate(contract.end_date)}</div>
                              {contract.auto_renewal && (
                                <Badge variant="secondary" className="text-xs">
                                  Auto-renew
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewContract(contract)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(contract.pdf_url, '_blank')}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {contract.status === 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => handleRenewContract(contract)}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Renew Contract
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleCancelContract(contract)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Contract
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Renewal Confirmation Dialog */}
      <AlertDialog open={showRenewalDialog} onOpenChange={setShowRenewalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renew Service Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to renew contract {selectedContract?.contract_number}? 
              This will create a new contract starting from the current contract's end date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={renewalLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRenewal}
              disabled={renewalLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {renewalLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Renewing...
                </>
              ) : (
                'Renew Contract'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancellation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Service Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel contract {selectedContract?.contract_number}? 
              This action cannot be undone. Please provide a reason for cancellation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancellation}
              disabled={cancelLoading || !cancelReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Contract'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceContracts;