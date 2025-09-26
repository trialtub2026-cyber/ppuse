import React, { useEffect, useState } from 'react';
import { customerService } from '@/services/customerService';
import { Customer, CustomerTag } from '@/types/crm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
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
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Settings,
  ArrowUpDown,
  X,
  Tag,
  FileDown,
  FileUp,
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import CustomerFormModal from '@/components/customers/CustomerFormModal';
import ImportExportModal from '@/components/customers/ImportExportModal';
import BulkOperationsModal from '@/components/customers/BulkOperationsModal';
import { toast } from 'sonner';

type SortField = 'company_name' | 'contact_name' | 'email' | 'industry' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

const Customers: React.FC = () => {
  const { hasPermission } = useAuth();
  
  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableTags, setAvailableTags] = useState<CustomerTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('company_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Selection state
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
    loadTags();
  }, [searchTerm, statusFilter, industryFilter, sizeFilter, selectedTagFilters, sortField, sortDirection]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (industryFilter !== 'all') filters.industry = industryFilter;
      if (sizeFilter !== 'all') filters.size = sizeFilter;
      if (selectedTagFilters.length > 0) filters.tags = selectedTagFilters;

      let data = await customerService.getCustomers(filters);
      
      // Apply sorting
      data = data.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];
        
        if (sortField === 'created_at') {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      setCustomers(data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tags = await customerService.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedCustomers(customers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers(prev => [...prev, customerId]);
    } else {
      setSelectedCustomers(prev => prev.filter(id => id !== customerId));
      setSelectAll(false);
    }
  };

  const handleTagFilterToggle = (tagId: string) => {
    setSelectedTagFilters(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearTagFilters = () => {
    setSelectedTagFilters([]);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!hasPermission('delete')) {
      toast.error('You do not have permission to delete customers');
      return;
    }

    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(customerId);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete customer');
      }
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    setEditingCustomer(null);
  };

  const handleFormSave = () => {
    fetchCustomers();
    setSelectedCustomers([]);
    setSelectAll(false);
  };

  const handleBulkOperations = () => {
    const selected = customers.filter(c => selectedCustomers.includes(c.id));
    if (selected.length === 0) {
      toast.error('Please select customers to perform bulk operations');
      return;
    }
    setIsBulkModalOpen(true);
  };

  const handleBulkComplete = () => {
    fetchCustomers();
    setSelectedCustomers([]);
    setSelectAll(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      inactive: 'secondary',
      prospect: 'outline'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getSizeBadge = (size: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      startup: 'outline',
      small: 'secondary',
      medium: 'default',
      enterprise: 'default'
    };
    
    return (
      <Badge variant={variants[size] || 'secondary'} className="text-xs">
        {size}
      </Badge>
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
        {sortField === field && (
          <div className={`text-xs ${sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600'}`}>
            {sortDirection === 'asc' ? 'ASC' : 'DESC'}
          </div>
        )}
      </div>
    </TableHead>
  );

  if (!hasPermission('manage_customers')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">You don't have permission to access customer management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    prospects: customers.filter(c => c.status === 'prospect').length,
    inactive: customers.filter(c => c.status === 'inactive').length
  };

  const selectedCustomerObjects = customers.filter(c => selectedCustomers.includes(c.id));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Customer Management
          </h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchCustomers}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsImportExportModalOpen(true)}>
            <FileDown className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          {hasPermission('write') && (
            <Button onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <Badge className="h-4 w-4 rounded-full bg-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prospects}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Badge className="h-4 w-4 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
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
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Retail">Retail</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            <Popover open={isTagFilterOpen} onOpenChange={setIsTagFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                    {selectedTagFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedTagFilters.length}
                      </Badge>
                    )}
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filter by Tags</h4>
                    {selectedTagFilters.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearTagFilters}>
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {availableTags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-tag-${tag.id}`}
                          checked={selectedTagFilters.includes(tag.id)}
                          onCheckedChange={() => handleTagFilterToggle(tag.id)}
                        />
                        <Badge
                          variant="secondary"
                          style={{ 
                            backgroundColor: tag.color + '20', 
                            color: tag.color, 
                            borderColor: tag.color 
                          }}
                        >
                          {tag.name}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {(selectedTagFilters.length > 0 || statusFilter !== 'all' || industryFilter !== 'all' || sizeFilter !== 'all' || searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                </Badge>
              )}
              {industryFilter !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Industry: {industryFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setIndustryFilter('all')} />
                </Badge>
              )}
              {sizeFilter !== 'all' && (
                <Badge variant="outline" className="flex items-center gap-1">
                  Size: {sizeFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSizeFilter('all')} />
                </Badge>
              )}
              {selectedTagFilters.map(tagId => {
                const tag = availableTags.find(t => t.id === tagId);
                return tag ? (
                  <Badge key={tagId} variant="outline" className="flex items-center gap-1">
                    Tag: {tag.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handleTagFilterToggle(tagId)} />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Operations Bar */}
      {selectedCustomers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCustomers.length} customer{selectedCustomers.length !== 1 ? 's' : ''} selected
                </span>
                <Button variant="outline" size="sm" onClick={() => setSelectedCustomers([])}>
                  Clear Selection
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkOperations}>
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Operations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers ({customers.length})</CardTitle>
          <CardDescription>
            Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading customers...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || industryFilter !== 'all' || sizeFilter !== 'all' || selectedTagFilters.length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first customer'}
              </p>
              {hasPermission('write') && (
                <Button onClick={handleAddCustomer}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <SortableHeader field="company_name">Company</SortableHeader>
                    <SortableHeader field="contact_name">Contact</SortableHeader>
                    <SortableHeader field="industry">Industry</SortableHeader>
                    <TableHead>Size</TableHead>
                    <SortableHeader field="status">Status</SortableHeader>
                    <TableHead>Tags</TableHead>
                    <TableHead>Location</TableHead>
                    <SortableHeader field="created_at">Created</SortableHeader>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{customer.company_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.contact_name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.industry}</TableCell>
                      <TableCell>{getSizeBadge(customer.size)}</TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="secondary"
                              className="text-xs"
                              style={{ 
                                backgroundColor: tag.color + '20', 
                                color: tag.color, 
                                borderColor: tag.color 
                              }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {customer.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{customer.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {customer.city}, {customer.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasPermission('write') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {hasPermission('delete') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.id)}
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
      <CustomerFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormModalClose}
        customer={editingCustomer}
        onSave={handleFormSave}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        onImportComplete={handleFormSave}
      />

      <BulkOperationsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedCustomers={selectedCustomerObjects}
        onComplete={handleBulkComplete}
      />
    </div>
  );
};

export default Customers;