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
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { productSaleService } from '@/services/productSaleService';
import { serviceContractService } from '@/services/serviceContractService';
import { 
  ProductSale, 
  ProductSaleFilters, 
  PRODUCT_SALE_STATUSES,
  ProductSalesAnalytics 
} from '@/types/productSales';
import ProductSaleForm from '@/components/product-sales/ProductSaleForm';
import ProductSaleDetail from '@/components/product-sales/ProductSaleDetail';

const ProductSales: React.FC = () => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  // State management
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [analytics, setAnalytics] = useState<ProductSalesAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<ProductSaleFilters>({});

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<ProductSale | null>(null);

  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingSale, setDeletingSale] = useState<ProductSale | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data
  useEffect(() => {
    loadProductSales();
    loadAnalytics();
  }, [currentPage, filters]);

  const loadProductSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productSaleService.getProductSales(filters, currentPage, pageSize);
      
      setProductSales(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (err) {
      setError('Failed to load product sales');
      console.error('Error loading product sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await productSaleService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProductSales(), loadAnalytics()]);
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  const handleCreateSale = () => {
    setSelectedSale(null);
    setShowCreateModal(true);
  };

  const handleEditSale = (sale: ProductSale) => {
    setSelectedSale(sale);
    setShowEditModal(true);
  };

  const handleViewSale = (sale: ProductSale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handleDeleteSale = (sale: ProductSale) => {
    setDeletingSale(sale);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingSale) return;

    try {
      setDeleteLoading(true);
      await productSaleService.deleteProductSale(deletingSale.id);
      
      toast.success('Product sale deleted successfully');
      setShowDeleteDialog(false);
      setDeletingSale(null);
      loadProductSales();
    } catch (err) {
      toast.error('Failed to delete product sale');
      console.error('Error deleting product sale:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaleCreated = () => {
    setShowCreateModal(false);
    loadProductSales();
    loadAnalytics();
    toast.success('Product sale created successfully');
  };

  const handleSaleUpdated = () => {
    setShowEditModal(false);
    loadProductSales();
    loadAnalytics();
    toast.success('Product sale updated successfully');
  };

  const handleFilterChange = (key: keyof ProductSaleFilters, value: string) => {
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
    const statusConfig = PRODUCT_SALE_STATUSES.find(s => s.value === status);
    return (
      <Badge className={cn('text-xs', statusConfig?.color)}>
        {statusConfig?.label || status}
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

  if (!hasPermission('manage_sales')) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access product sales.
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
          <h1 className="text-3xl font-bold tracking-tight">Product Sales</h1>
          <p className="text-muted-foreground">
            Manage product sales and auto-generated service contracts
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
          <Button onClick={handleCreateSale}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_sales}</div>
              <p className="text-xs text-muted-foreground">
                Active product sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.total_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                From all sales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.average_deal_size)}</div>
              <p className="text-xs text-muted-foreground">
                Per sale transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.warranty_expiring_soon.length}</div>
              <p className="text-xs text-muted-foreground">
                Warranties expiring
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
                  placeholder="Search sales..."
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
                  {PRODUCT_SALE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>

          {Object.keys(filters).some(key => filters[key as keyof ProductSaleFilters]) && (
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

      {/* Product Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Sales</CardTitle>
          <CardDescription>
            {totalItems} total sales found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : productSales.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No product sales found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first product sale.
              </p>
              <Button onClick={handleCreateSale}>
                <Plus className="h-4 w-4 mr-2" />
                Create Product Sale
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Warranty Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contract</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sale.customer_name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {sale.customer_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sale.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(sale.cost_per_unit)} per unit
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{sale.units}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(sale.total_cost)}
                      </TableCell>
                      <TableCell>{formatDate(sale.delivery_date)}</TableCell>
                      <TableCell>
                        <div>
                          <div>{formatDate(sale.warranty_expiry)}</div>
                          {new Date(sale.warranty_expiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell>
                        {sale.service_contract_id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/service-contracts/${sale.service_contract_id}`)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
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
                            <DropdownMenuItem onClick={() => handleViewSale(sale)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditSale(sale)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Sale
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteSale(sale)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Sale
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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

      {/* Modals */}
      {showCreateModal && (
        <ProductSaleForm
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSaleCreated}
        />
      )}

      {showEditModal && selectedSale && (
        <ProductSaleForm
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleSaleUpdated}
          productSale={selectedSale}
        />
      )}

      {showDetailModal && selectedSale && (
        <ProductSaleDetail
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          productSale={selectedSale}
          onEdit={() => {
            setShowDetailModal(false);
            handleEditSale(selectedSale);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product sale? This action cannot be undone.
              {deletingSale?.service_contract_id && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>Warning:</strong> This sale has an associated service contract that may also be affected.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Sale'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductSales;