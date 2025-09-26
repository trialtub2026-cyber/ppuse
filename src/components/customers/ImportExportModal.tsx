import React, { useState } from 'react';
import { customerService } from '@/services/customerService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [importResults, setImportResults] = useState<{ success: number; errors: string[] } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await customerService.exportCustomers(exportFormat);
      
      // Create and download file
      const blob = new Blob([data], { 
        type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Customer data exported as ${exportFormat.toUpperCase()}`
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export customer data',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: 'No Data',
        description: 'Please paste CSV data to import',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    try {
      const results = await customerService.importCustomers(importData);
      setImportResults(results);
      
      if (results.success > 0) {
        toast({
          title: 'Import Completed',
          description: `Successfully imported ${results.success} customers`
        });
        onImportComplete();
      }
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import customer data',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const copyTemplateToClipboard = () => {
    const template = `"Company Name","Contact Name","Email","Phone","Address","City","Country","Industry","Size","Status","Tags","Notes"
"Example Corp","John Doe","john@example.com","+1-555-0123","123 Main St","New York","USA","Technology","medium","active","VIP; High Value","Important client"
"Sample LLC","Jane Smith","jane@sample.com","+1-555-0456","456 Oak Ave","Los Angeles","USA","Software","startup","prospect","New Client","Potential partnership"`;
    
    navigator.clipboard.writeText(template);
    toast({
      title: 'Template Copied',
      description: 'CSV template copied to clipboard'
    });
  };

  const resetImport = () => {
    setImportData('');
    setImportResults(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import / Export Customers</DialogTitle>
          <DialogDescription>
            Export customer data or import new customers from CSV files.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Customer Data
                </CardTitle>
                <CardDescription>
                  Download your customer data in CSV or JSON format for backup or analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                      <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {exportFormat === 'csv' 
                      ? 'CSV format is ideal for importing into spreadsheet applications like Excel or Google Sheets.'
                      : 'JSON format preserves all data structure and is suitable for technical integrations.'
                    }
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleExport} 
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export {exportFormat.toUpperCase()}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Customer Data
                </CardTitle>
                <CardDescription>
                  Import customers from CSV data. Make sure your data follows the required format.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>Required CSV format with headers:</p>
                      <code className="text-xs bg-gray-100 p-1 rounded">
                        Company Name, Contact Name, Email, Phone, Address, City, Country, Industry, Size, Status, Tags, Notes
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={copyTemplateToClipboard}
                        className="mt-2"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Template
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="import-data">CSV Data</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your CSV data here..."
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                {importResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {importResults.errors.length === 0 ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                        Import Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {importResults.success} Successful
                        </Badge>
                        {importResults.errors.length > 0 && (
                          <Badge variant="destructive">
                            {importResults.errors.length} Errors
                          </Badge>
                        )}
                      </div>

                      {importResults.errors.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-red-600">Errors:</Label>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {importResults.errors.map((error, index) => (
                              <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleImport} 
                    disabled={isImporting || !importData.trim()}
                    className="flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Import Data
                      </>
                    )}
                  </Button>
                  {importResults && (
                    <Button variant="outline" onClick={resetImport}>
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportModal;