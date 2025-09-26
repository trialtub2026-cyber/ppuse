import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Table, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { LogFilters } from '@/types/logs';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface LogExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: LogFilters;
}

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  includeHeaders: boolean;
  includeMetadata: boolean;
  dateRange: 'current' | 'all' | 'custom';
  includeSystemLogs: boolean;
  includeUserActions: boolean;
  compressionEnabled: boolean;
}

const LogExportDialog: React.FC<LogExportDialogProps> = ({
  isOpen,
  onClose,
  currentFilters
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includeHeaders: true,
    includeMetadata: false,
    dateRange: 'current',
    includeSystemLogs: true,
    includeUserActions: true,
    compressionEnabled: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStep, setExportStep] = useState('');

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setExportStep('Preparing export...');

      // Simulate export progress with realistic steps
      const steps = [
        { progress: 10, step: 'Validating filters...' },
        { progress: 25, step: 'Querying database...' },
        { progress: 45, step: 'Processing log entries...' },
        { progress: 65, step: 'Formatting data...' },
        { progress: 80, step: 'Generating file...' },
        { progress: 95, step: 'Finalizing export...' },
        { progress: 100, step: 'Export complete!' }
      ];

      for (const { progress, step } of steps) {
        setExportProgress(progress);
        setExportStep(step);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Generate mock file
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit-logs-${timestamp}.${options.format}`;
      
      // Create mock download
      const mockData = generateMockExportData(options.format);
      const blob = new Blob([mockData], { 
        type: options.format === 'csv' ? 'text/csv' :
             options.format === 'json' ? 'application/json' :
             'application/pdf'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Audit logs exported as ${filename}`,
      });

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export audit logs. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      setExportStep('');
    }
  };

  const generateMockExportData = (format: ExportFormat): string => {
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        user_name: 'John Doe',
        user_email: 'john@example.com',
        action: 'LOGIN',
        resource_type: 'user',
        resource_name: 'John Doe',
        details: 'User logged in successfully',
        ip_address: '192.168.1.100',
        status: 'SUCCESS',
        duration_ms: 150
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000).toISOString(),
        user_name: 'Jane Smith',
        user_email: 'jane@example.com',
        action: 'CREATE',
        resource_type: 'customer',
        resource_name: 'Acme Corp',
        details: 'Created new customer record',
        ip_address: '192.168.1.101',
        status: 'SUCCESS',
        duration_ms: 320
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        user_name: 'Bob Wilson',
        user_email: 'bob@example.com',
        action: 'UPDATE',
        resource_type: 'contract',
        resource_name: 'Service Agreement #123',
        details: 'Updated contract terms and conditions',
        ip_address: '192.168.1.102',
        status: 'SUCCESS',
        duration_ms: 450
      }
    ];

    switch (format) {
      case 'csv':
        const headers = 'ID,Timestamp,User Name,User Email,Action,Resource Type,Resource Name,Details,IP Address,Status,Duration (ms)';
        const rows = mockLogs.map(log => 
          `${log.id},${log.timestamp},${log.user_name},${log.user_email},${log.action},${log.resource_type},${log.resource_name},"${log.details}",${log.ip_address},${log.status},${log.duration_ms}`
        ).join('\n');
        return options.includeHeaders ? `${headers}\n${rows}` : rows;
        
      case 'json':
        return JSON.stringify({
          metadata: options.includeMetadata ? {
            exported_at: new Date().toISOString(),
            exported_by: 'Current User',
            filters: currentFilters,
            total_records: mockLogs.length,
            export_options: options
          } : undefined,
          logs: mockLogs
        }, null, 2);
        
      case 'pdf':
        return 'PDF content would be generated here with proper formatting...';
        
      default:
        return '';
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'json':
        return <FileText className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getFormatDescription = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return 'Comma-separated values, ideal for spreadsheet applications';
      case 'json':
        return 'JavaScript Object Notation, perfect for data processing';
      case 'pdf':
        return 'Portable Document Format, great for reports and sharing';
      default:
        return '';
    }
  };

  const getEstimatedSize = () => {
    // Mock estimation based on current filters and options
    const baseSize = 50; // KB
    const formatMultiplier = options.format === 'pdf' ? 3 : options.format === 'json' ? 2 : 1;
    const metadataMultiplier = options.includeMetadata ? 1.2 : 1;
    const compressionMultiplier = options.compressionEnabled ? 0.3 : 1;
    
    const estimatedSize = baseSize * formatMultiplier * metadataMultiplier * compressionMultiplier;
    return `~${estimatedSize.toFixed(0)} KB`;
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    if (currentFilters.search) activeFilters.push(`Search: "${currentFilters.search}"`);
    if (currentFilters.action) activeFilters.push(`Action: ${currentFilters.action}`);
    if (currentFilters.status) activeFilters.push(`Status: ${currentFilters.status}`);
    if (currentFilters.resource_type) activeFilters.push(`Resource: ${currentFilters.resource_type}`);
    if (currentFilters.date_from) activeFilters.push(`From: ${format(new Date(currentFilters.date_from), 'MMM d, yyyy')}`);
    if (currentFilters.date_to) activeFilters.push(`To: ${format(new Date(currentFilters.date_to), 'MMM d, yyyy')}`);
    
    return activeFilters.length > 0 ? activeFilters : ['No filters applied - exporting all logs'];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Audit Logs
          </DialogTitle>
          <DialogDescription>
            Export audit logs with your current filters and preferences applied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Export Format</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(value: ExportFormat) => setOptions(prev => ({ ...prev, format: value }))}
              className="space-y-3"
            >
              {(['csv', 'json', 'pdf'] as ExportFormat[]).map((format) => (
                <div key={format} className="flex items-start space-x-3">
                  <RadioGroupItem value={format} id={format} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={format} className="flex items-center gap-2 cursor-pointer font-medium">
                      {getFormatIcon(format)}
                      {format.toUpperCase()}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {getFormatDescription(format)}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Export Options</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="headers"
                    checked={options.includeHeaders}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeHeaders: checked as boolean }))
                    }
                    disabled={options.format === 'pdf'}
                  />
                  <Label htmlFor="headers" className="text-sm">
                    Include column headers
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={options.includeMetadata}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeMetadata: checked as boolean }))
                    }
                  />
                  <Label htmlFor="metadata" className="text-sm">
                    Include export metadata
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compression"
                    checked={options.compressionEnabled}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, compressionEnabled: checked as boolean }))
                    }
                    disabled={options.format === 'pdf'}
                  />
                  <Label htmlFor="compression" className="text-sm">
                    Enable compression
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="systemLogs"
                    checked={options.includeSystemLogs}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeSystemLogs: checked as boolean }))
                    }
                  />
                  <Label htmlFor="systemLogs" className="text-sm">
                    Include system logs
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="userActions"
                    checked={options.includeUserActions}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeUserActions: checked as boolean }))
                    }
                  />
                  <Label htmlFor="userActions" className="text-sm">
                    Include user actions
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Current Filters Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Filter className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-2">Applied Filters</h4>
                  <div className="space-y-1">
                    {getFilterSummary().map((filter, index) => (
                      <div key={index} className="text-sm text-blue-700">
                        • {filter}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900 mb-2">Export Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-amber-700">Format:</span>
                      <span className="ml-2 font-medium">{options.format.toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-amber-700">Estimated size:</span>
                      <span className="ml-2 font-medium">{getEstimatedSize()}</span>
                    </div>
                    <div>
                      <span className="text-amber-700">Compression:</span>
                      <span className="ml-2 font-medium">{options.compressionEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div>
                      <span className="text-amber-700">Metadata:</span>
                      <span className="ml-2 font-medium">{options.includeMetadata ? 'Included' : 'Excluded'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{exportStep}</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="h-3 w-3" />
                    This may take a few moments depending on the amount of data
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                {getFormatIcon(options.format)}
                <span className="ml-2">Export {options.format.toUpperCase()}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogExportDialog;