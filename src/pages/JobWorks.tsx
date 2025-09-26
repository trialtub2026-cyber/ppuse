import React, { useEffect, useState } from 'react';
import { jobWorkService } from '@/services/jobWorkService';
import { JobWork, JobWorkFilters } from '@/types/jobWork';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Package,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  Edit,
  Trash2,
  Building2,
  User,
  Calendar,
  DollarSign,
  Hash,
  Ruler,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import JobWorkFormModal from '@/components/job-works/JobWorkFormModal';
import JobWorkDetailModal from '@/components/job-works/JobWorkDetailModal';
import { toast } from 'sonner';

const JobWorks: React.FC = () => {
  const { hasPermission, user } = useAuth();
  const [jobWorks, setJobWorks] = useState<JobWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJobWork, setSelectedJobWork] = useState<JobWork | null>(null);
  const [engineers, setEngineers] = useState<Array<{ id: string; name: string; }>>([]);

  useEffect(() => {
    fetchJobWorks();
    fetchEngineers();
  }, [searchTerm, statusFilter, customerFilter, engineerFilter]);

  const fetchJobWorks = async () => {
    try {
      setIsLoading(true);
      const filters: JobWorkFilters = {};
      
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (customerFilter !== 'all') filters.customer_id = customerFilter;
      if (engineerFilter !== 'all') filters.receiver_engineer = engineerFilter;

      const data = await jobWorkService.getJobWorks(filters);
      setJobWorks(data);
    } catch (error) {
      console.error('Failed to fetch job works:', error);
      toast.error('Failed to fetch job works');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEngineers = async () => {
    try {
      const data = await jobWorkService.getEngineers();
      setEngineers(data);
    } catch (error) {
      console.error('Failed to fetch engineers:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      in_progress: 'default',
      completed: 'secondary',
      delivered: 'default'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleDeleteJobWork = async (jobWorkId: string) => {
    if (!hasPermission('delete')) {
      toast.error('You do not have permission to delete job works');
      return;
    }

    if (confirm('Are you sure you want to delete this job work?')) {
      try {
        await jobWorkService.deleteJobWork(jobWorkId);
        fetchJobWorks();
        toast.success('Job work deleted successfully');
      } catch (error) {
        console.error('Failed to delete job work:', error);
        toast.error('Failed to delete job work');
      }
    }
  };

  const handleViewDetails = (jobWork: JobWork) => {
    setSelectedJobWork(jobWork);
    setShowDetailModal(true);
  };

  const handleSearch = () => {
    fetchJobWorks();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!hasPermission('manage_job_works')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">You don't have permission to access job work management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    total: jobWorks.length,
    pending: jobWorks.filter(jw => jw.status === 'pending').length,
    inProgress: jobWorks.filter(jw => jw.status === 'in_progress').length,
    completed: jobWorks.filter(jw => jw.status === 'completed').length,
    delivered: jobWorks.filter(jw => jw.status === 'delivered').length,
    totalValue: jobWorks.reduce((sum, jw) => sum + jw.final_price, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8" />
            Job Work Management
          </h1>
          <p className="text-muted-foreground">
            Manage customer-supplied work pieces with auto-generated reference IDs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchJobWorks}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {hasPermission('write') && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job Work
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search job works..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="1">TechCorp Solutions</SelectItem>
                <SelectItem value="2">Global Manufacturing Inc</SelectItem>
                <SelectItem value="3">StartupXYZ</SelectItem>
                <SelectItem value="4">Retail Giants Ltd</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={engineerFilter} onValueChange={setEngineerFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Engineer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Engineers</SelectItem>
                {engineers.map((engineer) => (
                  <SelectItem key={engineer.id} value={engineer.id}>
                    {engineer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Works Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Works ({jobWorks.length})</CardTitle>
          <CardDescription>
            Showing {jobWorks.length} job work{jobWorks.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading job works...</span>
            </div>
          ) : jobWorks.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No job works found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || customerFilter !== 'all' || engineerFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first job work'}
              </p>
              {hasPermission('write') && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job Work
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Ref ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Pieces</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engineer</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobWorks.map((jobWork) => (
                    <TableRow key={jobWork.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Hash className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-mono text-sm font-medium">{jobWork.job_ref_id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{jobWork.customer_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{jobWork.product_name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{jobWork.pieces}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Ruler className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{jobWork.size}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(jobWork.final_price)}</div>
                          {jobWork.manual_price && (
                            <div className="text-xs text-muted-foreground">
                              Manual: {formatCurrency(jobWork.manual_price)} × {jobWork.pieces}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(jobWork.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{jobWork.receiver_engineer_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {getTimeAgo(jobWork.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(jobWork)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('write') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(jobWork)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('delete') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteJobWork(jobWork.id)}
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

      {/* Modals */}
      <JobWorkFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={fetchJobWorks}
      />

      {selectedJobWork && (
        <JobWorkDetailModal
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          jobWork={selectedJobWork}
          onSuccess={fetchJobWorks}
        />
      )}
    </div>
  );
};

export default JobWorks;