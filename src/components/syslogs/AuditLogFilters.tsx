import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Download, Filter, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { LogFilters } from '@/types/logs';
import { cn } from '@/lib/utils';

interface AuditLogFiltersProps {
  filters: LogFilters;
  onFiltersChange: (filters: LogFilters) => void;
  onExport: () => void;
  isLoading?: boolean;
}

const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined
  );

  const handleFilterChange = (key: keyof LogFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    handleFilterChange('date_from', date?.toISOString());
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    handleFilterChange('date_to', date?.toISOString());
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  const hasActiveFilters = Boolean(
    filters.user_id || 
    filters.action || 
    filters.resource_type || 
    filters.status || 
    filters.search || 
    filters.date_from || 
    filters.date_to
  );

  const actionOptions = [
    { value: 'all', label: 'All Actions' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'VIEW', label: 'View' },
    { value: 'EXPORT', label: 'Export' },
    { value: 'IMPORT', label: 'Import' },
    { value: 'APPROVE', label: 'Approve' },
    { value: 'REJECT', label: 'Reject' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'SUCCESS', label: 'Success' },
    { value: 'WARNING', label: 'Warning' },
    { value: 'ERROR', label: 'Error' },
    { value: 'INFO', label: 'Info' }
  ];

  const resourceOptions = [
    { value: 'all', label: 'All Resources' },
    { value: 'user', label: 'User' },
    { value: 'customer', label: 'Customer' },
    { value: 'deal', label: 'Deal' },
    { value: 'ticket', label: 'Ticket' },
    { value: 'contract', label: 'Contract' },
    { value: 'product', label: 'Product' },
    { value: 'tenant', label: 'Tenant' },
    { value: 'company', label: 'Company' },
    { value: 'template', label: 'Template' }
  ];

  const limitOptions = [
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
    { value: '100', label: '100 per page' }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Basic Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search logs by user, action, or details..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            <Select
              value={filters.action || 'all'}
              onValueChange={(value) => handleFilterChange('action', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {isExpanded ? 'Less Filters' : 'More Filters'}
            </Button>

            <Button
              variant="outline"
              onClick={onExport}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <Label htmlFor="resource-type">Resource Type</Label>
                <Select
                  value={filters.resource_type || 'all'}
                  onValueChange={(value) => handleFilterChange('resource_type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Resource Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={handleDateFromChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Date To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={handleDateToChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Results per page</Label>
                <Select
                  value={filters.limit?.toString() || '25'}
                  onValueChange={(value) => handleFilterChange('limit', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {limitOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500 font-medium">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Search: "{filters.search}"
                  <button
                    onClick={() => handleFilterChange('search', undefined)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.action && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Action: {filters.action}
                  <button
                    onClick={() => handleFilterChange('action', undefined)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Status: {filters.status}
                  <button
                    onClick={() => handleFilterChange('status', undefined)}
                    className="hover:bg-yellow-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.resource_type && (
                <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  Resource: {filters.resource_type}
                  <button
                    onClick={() => handleFilterChange('resource_type', undefined)}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {dateFrom && (
                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  From: {format(dateFrom, "MMM d, yyyy")}
                  <button
                    onClick={() => handleDateFromChange(undefined)}
                    className="hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {dateTo && (
                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  To: {format(dateTo, "MMM d, yyyy")}
                  <button
                    onClick={() => handleDateToChange(undefined)}
                    className="hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Quick Filter Presets */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500 font-medium">Quick filters:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                handleDateFromChange(today);
                handleDateToChange(today);
              }}
              className="h-7 px-2 text-xs"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                handleDateFromChange(yesterday);
                handleDateToChange(yesterday);
              }}
              className="h-7 px-2 text-xs"
            >
              Yesterday
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                handleDateFromChange(lastWeek);
                handleDateToChange(new Date());
              }}
              className="h-7 px-2 text-xs"
            >
              Last 7 days
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleFilterChange('action', 'LOGIN');
              }}
              className="h-7 px-2 text-xs"
            >
              Login Events
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleFilterChange('status', 'ERROR');
              }}
              className="h-7 px-2 text-xs"
            >
              Errors Only
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogFilters;