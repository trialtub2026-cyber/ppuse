import React, { useState, useEffect } from 'react';
import { jobWorkService } from '@/services/jobWorkService';
import { customerService } from '@/services/customerService';
import { productService } from '@/services/productService';
import { JobWorkFormData, JobWorkPriceCalculation } from '@/types/jobWork';
import { Customer } from '@/types/crm';
import { Product } from '@/types/masters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Calculator, DollarSign } from 'lucide-react';

interface JobWorkFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const JobWorkFormModal: React.FC<JobWorkFormModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [engineers, setEngineers] = useState<Array<{ id: string; name: string; }>>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [priceCalculation, setPriceCalculation] = useState<JobWorkPriceCalculation | null>(null);
  const [formData, setFormData] = useState<JobWorkFormData>({
    customer_id: '',
    product_id: '',
    pieces: 1,
    size: '',
    manual_price: undefined,
    receiver_engineer_id: '',
    comments: ''
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (formData.product_id && formData.pieces && formData.size) {
      calculatePrice();
    }
  }, [formData.product_id, formData.pieces, formData.size]);

  const fetchData = async () => {
    try {
      const [customersData, productsData, engineersData, sizesData] = await Promise.all([
        customerService.getCustomers(),
        productService.getProducts(),
        jobWorkService.getEngineers(),
        jobWorkService.getSizes()
      ]);
      
      setCustomers(customersData);
      setProducts(productsData);
      setEngineers(engineersData);
      setSizes(sizesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const calculatePrice = async () => {
    if (!formData.product_id || !formData.pieces || !formData.size) return;

    setIsCalculating(true);
    try {
      const calculation = await jobWorkService.calculatePrice(
        formData.product_id,
        formData.pieces,
        formData.size
      );
      setPriceCalculation(calculation);
    } catch (error) {
      console.error('Failed to calculate price:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.product_id || !formData.size || !formData.receiver_engineer_id) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (formData.pieces <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Pieces must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      await jobWorkService.createJobWork(formData);
      toast({
        title: 'Success',
        description: 'Job work created successfully'
      });
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to create job work:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create job work',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      product_id: '',
      pieces: 1,
      size: '',
      manual_price: undefined,
      receiver_engineer_id: '',
      comments: ''
    });
    setPriceCalculation(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getFinalPrice = () => {
    const unitPrice = formData.manual_price || priceCalculation?.calculated_price || 0;
    return unitPrice * formData.pieces;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Work</DialogTitle>
          <DialogDescription>
            Create a new job work with auto-generated reference ID and price calculation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {/* Customer and Product Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => setFormData({ ...formData, product_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.sku}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pieces and Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pieces">Pieces *</Label>
                <Input
                  id="pieces"
                  type="number"
                  min="1"
                  value={formData.pieces}
                  onChange={(e) => setFormData({ ...formData, pieces: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="size">Size *</Label>
                <Select
                  value={formData.size}
                  onValueChange={(value) => setFormData({ ...formData, size: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Calculation Card */}
            {priceCalculation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calculator className="h-4 w-4" />
                    Price Calculation
                  </CardTitle>
                  <CardDescription>
                    Auto-calculated price based on product and size
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span className="font-medium">{formatCurrency(priceCalculation.base_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size Multiplier:</span>
                      <span className="font-medium">{priceCalculation.size_multiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unit Price:</span>
                      <span className="font-medium">{formatCurrency(priceCalculation.calculated_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pieces:</span>
                      <span className="font-medium">{formData.pieces}</span>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Price:</span>
                      <Badge variant="secondary" className="text-base">
                        {formatCurrency(getFinalPrice())}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manual Price Override */}
            <div>
              <Label htmlFor="manual_price">Manual Price Override (per piece)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="manual_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.manual_price || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    manual_price: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  placeholder="Leave empty to use calculated price"
                  className="pl-10"
                />
              </div>
              {formData.manual_price && (
                <p className="text-sm text-gray-600 mt-1">
                  Total with manual price: {formatCurrency(formData.manual_price * formData.pieces)}
                </p>
              )}
            </div>

            {/* Engineer Assignment */}
            <div>
              <Label htmlFor="engineer">Receiver Engineer *</Label>
              <Select
                value={formData.receiver_engineer_id}
                onValueChange={(value) => setFormData({ ...formData, receiver_engineer_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineers.map((engineer) => (
                    <SelectItem key={engineer.id} value={engineer.id}>
                      {engineer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Additional notes or special instructions..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isCalculating}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Job Work
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobWorkFormModal;