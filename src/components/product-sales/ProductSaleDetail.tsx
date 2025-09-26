import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Download,
  ExternalLink,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Shield,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProductSale, PRODUCT_SALE_STATUSES } from '@/types/productSales';
import { serviceContractService } from '@/services/serviceContractService';
import { ServiceContract } from '@/types/productSales';

interface ProductSaleDetailProps {
  open: boolean;
  onClose: () => void;
  productSale: ProductSale;
  onEdit: () => void;
}

const ProductSaleDetail: React.FC<ProductSaleDetailProps> = ({
  open,
  onClose,
  productSale,
  onEdit
}) => {
  const [serviceContract, setServiceContract] = useState<ServiceContract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  useEffect(() => {
    if (productSale.service_contract_id) {
      loadServiceContract();
    }
  }, [productSale.service_contract_id]);

  const loadServiceContract = async () => {
    try {
      setLoadingContract(true);
      setContractError(null);
      
      const contract = await serviceContractService.getServiceContractByProductSaleId(productSale.id);
      setServiceContract(contract);
    } catch (error) {
      console.error('Error loading service contract:', error);
      setContractError('Failed to load service contract details');
    } finally {
      setLoadingContract(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = PRODUCT_SALE_STATUSES.find(s => s.value === status);
    return (
      <Badge className={cn('text-xs', statusConfig?.color)}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getWarrantyStatus = () => {
    const warrantyDate = new Date(productSale.warranty_expiry);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((warrantyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', icon: AlertTriangle, message: 'Warranty expired' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'text-yellow-600', icon: Clock, message: `Expires in ${daysUntilExpiry} days` };
    } else {
      return { status: 'active', color: 'text-green-600', icon: CheckCircle, message: `${daysUntilExpiry} days remaining` };
    }
  };

  const handleDownloadAttachment = (attachment: any) => {
    // In a real implementation, this would download the file
    toast.success(`Downloading ${attachment.name}...`);
  };

  const handleViewContract = () => {
    if (serviceContract) {
      // In a real implementation, this would open the contract PDF
      toast.success('Opening service contract...');
    }
  };

  const warrantyStatus = getWarrantyStatus();
  const WarrantyIcon = warrantyStatus.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Sale Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this product sale and associated service contract.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contract">Service Contract</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Sale Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Sale Information
                  </span>
                  {getStatusBadge(productSale.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Customer</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{productSale.customer_name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {productSale.customer_id}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Product</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{productSale.product_name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">ID: {productSale.product_id}</div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Units</label>
                      <div className="text-lg font-bold">{productSale.units}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Cost per Unit</label>
                      <div className="flex items-center gap-2 mt-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatCurrency(productSale.cost_per_unit)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(productSale.total_cost)}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Sale Date</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(productSale.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery and Warranty */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Delivery & Warranty
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Delivery Date</label>
                    <div className="text-lg font-medium">{formatDate(productSale.delivery_date)}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Warranty Expiry</label>
                    <div className="flex items-center gap-2">
                      <WarrantyIcon className={cn("h-4 w-4", warrantyStatus.color)} />
                      <span className="text-lg font-medium">{formatDate(productSale.warranty_expiry)}</span>
                    </div>
                    <div className={cn("text-sm", warrantyStatus.color)}>
                      {warrantyStatus.message}
                    </div>
                  </div>
                </div>

                {warrantyStatus.status === 'expiring' && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Warranty Expiring Soon:</strong> Consider reaching out to the customer 
                      for renewal or extended warranty options.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {productSale.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm">{productSale.notes}</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contract" className="space-y-6">
            {loadingContract ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading service contract...</span>
              </div>
            ) : contractError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{contractError}</AlertDescription>
              </Alert>
            ) : serviceContract ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Service Contract
                    </span>
                    <Badge className={cn(
                      'text-xs',
                      serviceContract.status === 'active' ? 'bg-green-100 text-green-800' :
                      serviceContract.status === 'expired' ? 'bg-red-100 text-red-800' :
                      serviceContract.status === 'renewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    )}>
                      {serviceContract.status.charAt(0).toUpperCase() + serviceContract.status.slice(1)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Contract #{serviceContract.contract_number}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Contract Period</label>
                        <div className="text-sm">
                          {formatDate(serviceContract.start_date)} - {formatDate(serviceContract.end_date)}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Service Level</label>
                        <div className="font-medium capitalize">{serviceContract.service_level}</div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Auto Renewal</label>
                        <div className="flex items-center gap-2">
                          {serviceContract.auto_renewal ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span>{serviceContract.auto_renewal ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Contract Value</label>
                        <div className="text-xl font-bold text-green-600">
                          {formatCurrency(serviceContract.contract_value)}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Warranty Period</label>
                        <div className="font-medium">{serviceContract.warranty_period} months</div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Renewal Notice</label>
                        <div className="font-medium">{serviceContract.renewal_notice_period} days</div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Terms & Conditions</label>
                    <div className="mt-2 p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                      {serviceContract.terms}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleViewContract}>
                      <FileText className="h-4 w-4 mr-2" />
                      View Contract PDF
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No service contract found for this product sale. The contract may still be generating.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Attachments ({productSale.attachments.length})
                </CardTitle>
                <CardDescription>
                  Files attached to this product sale
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productSale.attachments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No attachments found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productSale.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{attachment.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatFileSize(attachment.size)} • {attachment.type}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Uploaded {formatDate(attachment.uploaded_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadAttachment(attachment)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(attachment.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
                <CardDescription>
                  Key events and milestones for this product sale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Sale Created</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(productSale.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Product Delivered</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(productSale.delivery_date)}
                      </div>
                    </div>
                  </div>

                  {serviceContract && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Service Contract Generated</div>
                        <div className="text-sm text-muted-foreground">
                          Contract #{serviceContract.contract_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(serviceContract.created_at)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      warrantyStatus.status === 'active' ? 'bg-green-600' :
                      warrantyStatus.status === 'expiring' ? 'bg-yellow-600' :
                      'bg-red-600'
                    )}></div>
                    <div>
                      <div className="font-medium">Warranty Expires</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(productSale.warranty_expiry)}
                      </div>
                      <div className={cn("text-sm", warrantyStatus.color)}>
                        {warrantyStatus.message}
                      </div>
                    </div>
                  </div>

                  {productSale.updated_at !== productSale.created_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium">Last Updated</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(productSale.updated_at)}
                        </div>
                      </div>
                    </div>
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
          <Button onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductSaleDetail;