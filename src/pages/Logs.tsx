import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Activity, 
  Shield, 
  Clock, 
  User, 
  MoreHorizontal,
  Eye,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  AuditLog, 
  LogFilters, 
  LogsResponse, 
  ACTION_COLORS, 
  STATUS_COLORS 
} from '@/types/logs';
import { logsService } from '@/services/logsService';
import SystemHealthDashboard from '@/components/syslogs/SystemHealthDashboard';
import AuditLogFilters from '@/components/syslogs/AuditLogFilters';
import LogExportDialog from '@/components/syslogs/LogExportDialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const Logs: React.FC = () => {
  const { hasRole } = useAuth();
  
  // Redirect if not admin
  if (!hasRole('admin')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-500">
                You need administrator privileges to access audit logs and system monitoring.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State management
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({ page: 1, limit: 25 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 25, total_pages: 0 });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');

  // Fetch logs
  const fetchLogs = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const response: LogsResponse = await logsService.getLogs(filters);
      setLogs(response.logs);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        total_pages: response.total_pages
      });
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh logs
  useEffect(() => {
    fetchLogs();
  }, [filters]);

  useEffect(() => {
    if (autoRefresh && activeTab === 'logs') {
      const interval = setInterval(() => {
        fetchLogs(false); // Don't show loading on auto-refresh
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, activeTab, filters]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: LogFilters) => {
    setFilters(newFilters);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Render logs table
  const renderLogsTable = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
          <p className="text-gray-500 mb-4">
            No audit logs match your current filters.
          </p>
          <Button onClick={() => setFilters({ page: 1, limit: 25 })}>
            Clear Filters
          </Button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {format(new Date(log.timestamp), 'yyyy')}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {log.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{log.user_name}</div>
                      <div className="text-xs text-gray-500">{log.user_email}</div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge className={cn('text-xs', ACTION_COLORS[log.action])}>
                    {log.action}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{log.resource_type}</div>
                    {log.resource_name && (
                      <div className="text-xs text-gray-500 truncate max-w-32">
                        {log.resource_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm max-w-48 truncate" title={log.details}>
                    {log.details}
                  </div>
                </TableCell>
                
                <TableCell>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {log.ip_address}
                  </code>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(log.status)}
                    <Badge className={cn('text-xs', STATUS_COLORS[log.status])}>
                      {log.status}
                    </Badge>
                  </div>
                </TableCell>
                
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {formatDuration(log.duration_ms)}
                  </span>
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        View User Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Render pagination
  const renderPagination = () => {
    if (pagination.total_pages <= 1) return null;

    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.total_pages;
    
    // Show first page
    if (currentPage > 3) {
      pages.push(1);
      if (currentPage > 4) pages.push('...');
    }
    
    // Show pages around current
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(i);
    }
    
    // Show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {pages.map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              disabled={page === '...'}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs & Monitoring</h1>
          <p className="text-gray-600 mt-1">
            System audit trails and real-time monitoring dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs()}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <AuditLogFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onExport={() => setIsExportModalOpen(true)}
            isLoading={isLoading}
          />

          {/* Logs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Trail</CardTitle>
                  <CardDescription>
                    {pagination.total} log entries found
                    {autoRefresh && ' • Auto-refreshing every 30 seconds'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderLogsTable()}
              {pagination.total_pages > 1 && (
                <div className="mt-6 pt-4 border-t">
                  {renderPagination()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <SystemHealthDashboard autoRefresh={autoRefresh} />
        </TabsContent>
      </Tabs>

      {/* Export Modal */}
      <LogExportDialog
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        currentFilters={filters}
      />
    </div>
  );
};

export default Logs;