import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contract, ContractFilters } from '@/types/contracts';
import { contractService } from '@/services/contractService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ContractFormModal from '@/components/contracts/ContractFormModal';
import ContractAnalytics from '@/components/contracts/ContractAnalytics';

const Contracts: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ContractFilters>({});
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    loadContracts();
  }, [filters]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getContracts({ ...filters, search: searchTerm });
      setContracts(data);
    } catch (error) {
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadContracts();
  };

  const handleCreateContract = () => {
    setSelectedContract(null);
    setShowCreateModal(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowEditModal(true);
  };

  const handleDeleteContract = async (id: string) => {
    try {
      await contractService.deleteContract(id);
      toast.success('Contract deleted successfully');
      loadContracts();
    } catch (error) {
      toast.error('Failed to delete contract');
    }
    setShowDeleteDialog(false);
    setContractToDelete(null);
  };

  const handleApproveContract = async (id: string) => {
    try {
      await contractService.approveContract(id, 'manager_approval', 'Approved by manager');
      toast.success('Contract approved successfully');
      loadContracts();
    } catch (error) {
      toast.error('Failed to approve contract');
    }
  };

  const handleToggleAutoRenewal = async (id: string, autoRenew: boolean) => {
    try {
      await contractService.toggleAutoRenewal(id, autoRenew);
      toast.success(`Auto-renewal ${autoRenew ? 'enabled' : 'disabled'}`);
      loadContracts();
    } catch (error) {
      toast.error('Failed to update auto-renewal setting');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      pending_approval: 'default',
      active: 'secondary',
      renewed: 'default',
      expired: 'destructive'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'secondary',
      medium: 'outline',
      high: 'default',
      urgent: 'destructive'
    };

    return (
      <Badge variant={variants[priority] || 'secondary'} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryWarning = (endDate: string, status: string) => {
    if (status !== 'active') return null;
    
    const daysUntil = getDaysUntilExpiry(endDate);
    
    if (daysUntil <= 0) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else if (daysUntil <= 30) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    return null;
  };

  if (!hasPermission('manage_contracts')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">You don't have permission to access contract management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    pending: contracts.filter(c => c.status === 'pending_approval').length,
    expiring: contracts.filter(c => {
      const days = getDaysUntilExpiry(c.endDate);
      return c.status === 'active' && days <= 30 && days > 0;
    }).length,
    totalValue: contracts.reduce((sum, c) => sum + c.value, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Contract Management
          </h1>
          <p className="text-muted-foreground">
            Manage contracts, approvals, and renewals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadContracts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasPermission('write') && (
            <Button onClick={handleCreateContract}>
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue, 'USD')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search contracts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, status: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="renewed">Renewed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, type: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="service_agreement">Service Agreement</SelectItem>
                    <SelectItem value="nda">NDA</SelectItem>
                    <SelectItem value="purchase_order">Purchase Order</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => setFilters({ ...filters, priority: value === 'all' ? undefined : value })}
                >
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contracts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Contracts ({contracts.length})</CardTitle>
              <CardDescription>
                Showing {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading contracts...</span>
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || Object.keys(filters).length > 0
                      ? 'Try adjusting your search or filters'
                      : 'Get started by creating your first contract'}
                  </p>
                  {hasPermission('write') && (
                    <Button onClick={handleCreateContract}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Contract
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Auto Renew</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium">{contract.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {contract.parties.map(p => p.name).join(', ')}
                                </div>
                              </div>
                              {getExpiryWarning(contract.endDate, contract.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {contract.type.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(contract.status)}</TableCell>
                          <TableCell>{getPriorityBadge(contract.priority)}</TableCell>
                          <TableCell>
                            {contract.value > 0 ? formatCurrency(contract.value, contract.currency) : '-'}
                          </TableCell>
                          <TableCell>{formatDate(contract.startDate)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {formatDate(contract.endDate)}
                              {contract.status === 'active' && (
                                <span className="text-xs text-muted-foreground">
                                  ({getDaysUntilExpiry(contract.endDate)} days)
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={contract.autoRenew ? 'default' : 'secondary'}>
                              {contract.autoRenew ? 'Yes' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/contracts/${contract.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {hasPermission('write') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditContract(contract)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                              {hasPermission('delete') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setContractToDelete(contract.id);
                                    setShowDeleteDialog(true);
                                  }}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <ContractAnalytics />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <ContractFormModal
        open={showCreateModal || showEditModal}
        onOpenChange={(open) => {
          setShowCreateModal(false);
          setShowEditModal(false);
          if (!open) setSelectedContract(null);
        }}
        contract={selectedContract}
        onSuccess={() => {
          loadContracts();
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedContract(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contract? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => contractToDelete && handleDeleteContract(contractToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Contracts;