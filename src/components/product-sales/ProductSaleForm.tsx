import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calculator,
  Calendar,
  DollarSign,
  Package,
  Users,
  FileText,
  Upload,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { productSaleService } from '@/services/productSaleService';
import { customerService } from '@/services/customerService';
import { productService } from '@/services/productService';
import { ProductSale, ProductSaleFormData } from '@/types/productSales';
import { Customer } from '@/types/crm';
import { Product } from '@/types/masters';
import MasterDataSelect from '@/components/masters/MasterDataSelect';

// Form validation schema
const productSaleSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  product_id: z.string().min(1, 'Product is required'),
  units: z.number().min(1, 'Units must be at least 1'),
  cost_per_unit: z.number().min(0.01, 'Cost per unit must be greater than 0'),
  delivery_date: z.string().min(1, 'Delivery date is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof productSaleSchema>;

interface ProductSaleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productSale?: ProductSale;
}

const ProductSaleForm: React.FC<ProductSaleFormProps> = ({
  open,
  onClose,
  onSuccess,
  productSale
}) => {
  const isEditing = !!productSale;

  // State management
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState<'receipt' | 'contract' | null>(null);

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(productSaleSchema),
    defaultValues: {
      customer_id: productSale?.customer_id || '',
      product_id: productSale?.product_id || '',
      units: productSale?.units || 1,
      cost_per_unit: productSale?.cost_per_unit || 0,
      delivery_date: productSale?.delivery_date || new Date().toISOString().split('T')[0],
      notes: productSale?.notes || '',
    }
  });

  const { watch, setValue, getValues } = form;
  const watchedValues = watch(['units', 'cost_per_unit', 'delivery_date']);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Calculate totals when units or cost changes
  useEffect(() => {
    const [units, costPerUnit] = watchedValues;
    if (units && costPerUnit) {
      // Auto-calculation is handled in the display, not stored in form
    }
  }, [watchedValues]);

  // Auto-fill cost when product changes
  useEffect(() => {
    if (selectedProduct && !isEditing) {
      setValue('cost_per_unit', selectedProduct.price);
    }
  }, [selectedProduct, setValue, isEditing]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Load customers and products
      const [customersResponse, productsResponse] = await Promise.all([
        customerService.getCustomers({}, 1, 100),
        productService.getProducts({}, 1, 100)
      ]);

      setCustomers(customersResponse.data);
      setProducts(productsResponse.data);

      // Set selected items if editing
      if (productSale) {
        const customer = customersResponse.data.find(c => c.id === productSale.customer_id);
        const product = productsResponse.data.find(p => p.id === productSale.product_id);
        
        setSelectedCustomer(customer || null);
        setSelectedProduct(product || null);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);
    setValue('customer_id', customerId);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setValue('product_id', productId);
    
    // Auto-fill cost per unit if not editing
    if (product && !isEditing) {
      setValue('cost_per_unit', product.price);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const calculateWarrantyExpiry = (deliveryDate: string): string => {
    const delivery = new Date(deliveryDate);
    const warranty = new Date(delivery);
    warranty.setFullYear(warranty.getFullYear() + 1);
    return warranty.toISOString().split('T')[0];
  };

  const calculateTotalCost = (): number => {
    const units = getValues('units');
    const costPerUnit = getValues('cost_per_unit');
    return (units || 0) * (costPerUnit || 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const formData: ProductSaleFormData = {
        ...data,
        attachments
      };

      if (isEditing && productSale) {
        await productSaleService.updateProductSale(productSale.id, formData);
        toast.success('Product sale updated successfully');
      } else {
        await productSaleService.createProductSale(formData);
        toast.success('Product sale created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product sale:', error);
      toast.error(isEditing ? 'Failed to update product sale' : 'Failed to create product sale');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceiptPDF = async () => {
    if (!productSale) return;
    
    try {
      setGeneratingPDF('receipt');
      const response = await productSaleService.generateReceiptPDF(productSale.id);
      toast.success('Receipt PDF generated successfully');
      // In a real implementation, this would trigger a download
      console.log('Generated receipt PDF:', response);
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      toast.error('Failed to generate receipt PDF');
    } finally {
      setGeneratingPDF(null);
    }
  };

  const handleGenerateContractPDF = async () => {
    if (!productSale) return;
    
    try {
      setGeneratingPDF('contract');
      const response = await productSaleService.generateContractPDF(productSale.id);
      toast.success('Contract PDF generated successfully');
      // In a real implementation, this would trigger a download
      console.log('Generated contract PDF:', response);
    } catch (error) {
      console.error('Error generating contract PDF:', error);
      toast.error('Failed to generate contract PDF');
    } finally {
      setGeneratingPDF(null);
    }
  };

  const deliveryDate = getValues('delivery_date');
  const warrantyExpiry = deliveryDate ? calculateWarrantyExpiry(deliveryDate) : '';
  const totalCost = calculateTotalCost();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing ? 'Edit Product Sale' : 'Create Product Sale'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the product sale details below.'
              : 'Create a new product sale. A service contract will be automatically generated.'
            }
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading form data...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer and Product Selection */}
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Customer *
                      </FormLabel>
                      <FormControl>
                        <MasterDataSelect
                          type="customer"
                          value={field.value}
                          onValueChange={handleCustomerChange}
                          placeholder="Select customer..."
                          data={customers}
                          displayField="name"
                          searchFields={['name', 'email', 'company']}
                        />
                      </FormControl>
                      <FormMessage />
                      {selectedCustomer && (
                        <div className="text-sm text-muted-foreground">
                          {selectedCustomer.email} • {selectedCustomer.company}
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Product *
                      </FormLabel>
                      <FormControl>
                        <MasterDataSelect
                          type="product"
                          value={field.value}
                          onValueChange={handleProductChange}
                          placeholder="Select product..."
                          data={products}
                          displayField="name"
                          searchFields={['name', 'sku', 'category']}
                        />
                      </FormControl>
                      <FormMessage />
                      {selectedProduct && (
                        <div className="text-sm text-muted-foreground">
                          SKU: {selectedProduct.sku} • {formatCurrency(selectedProduct.price)}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* Units and Pricing */}
              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost_per_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cost per Unit *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        {selectedProduct && !isEditing && 'Auto-filled from product master'}
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Total Cost
                  </label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                    <span className="font-medium text-lg">{formatCurrency(totalCost)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-calculated</p>
                </div>
              </div>

              {/* Delivery Date and Warranty */}
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Delivery Date *
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Warranty Expiry
                  </label>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center">
                    <span>{warrantyExpiry ? new Date(warrantyExpiry).toLocaleDateString() : 'Select delivery date'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Delivery date + 1 year</p>
                </div>
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this sale..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Attachments */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <label className="text-sm font-medium">Attachments</label>
                </div>
                
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground mb-2">
                      Click to upload files or drag and drop
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected Files:</h4>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(file.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-Generation Info */}
              {!isEditing && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Service Contract Auto-Generation:</strong> A service contract will be automatically 
                    created with a 1-year term starting from the delivery date. You can modify the contract 
                    details after creation.
                  </AlertDescription>
                </Alert>
              )}

              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sale Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span className="font-medium">{selectedCustomer?.name || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product:</span>
                    <span className="font-medium">{selectedProduct?.name || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Units:</span>
                    <span className="font-medium">{getValues('units') || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per Unit:</span>
                    <span className="font-medium">{formatCurrency(getValues('cost_per_unit') || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Cost:</span>
                    <span>{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Warranty Period:</span>
                    <span className="font-medium">1 Year</span>
                  </div>
                  {warrantyExpiry && (
                    <div className="flex justify-between">
                      <span>Warranty Expires:</span>
                      <span className="font-medium">{new Date(warrantyExpiry).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                {isEditing && (
                  <>
                    <Button type="button" variant="outline" size="sm" disabled={generatingPDF === 'receipt'} onClick={handleGenerateReceiptPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      {generatingPDF === 'receipt' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Generate Receipt PDF'
                      )}
                    </Button>
                    <Button type="button" variant="outline" size="sm" disabled={generatingPDF === 'contract'} onClick={handleGenerateContractPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      {generatingPDF === 'contract' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Generate Contract PDF'
                      )}
                    </Button>
                  </>
                )}
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Update Sale' : 'Create Sale'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductSaleForm;