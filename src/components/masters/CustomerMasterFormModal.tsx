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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Users } from 'lucide-react';
import { CustomerMaster, CustomerMasterFormData, CUSTOMER_TYPES, PAYMENT_TERMS } from '@/types/masters';
import { customerMasterService } from '@/services/customerMasterService';
import MasterDataSelect from '@/components/masters/MasterDataSelect';
import { companyService } from '@/services/companyService';

const formSchema = z.object({
  name: z.string().min(1, 'Customer name is required').max(100, 'Name too long'),
  address: z.string().min(1, 'Address is required').max(500, 'Address too long'),
  phone: z.string().min(1, 'Phone is required').regex(/^[+]?[0-9\s\-\(\)]+$/, 'Invalid phone format'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  company_id: z.string().optional(),
  customer_type: z.enum(['individual', 'business', 'enterprise'], {
    required_error: 'Customer type is required'
  }),
  status: z.enum(['active', 'inactive', 'prospect', 'suspended'], {
    required_error: 'Status is required'
  }),
  credit_limit: z.number().min(0, 'Credit limit must be positive').optional(),
  payment_terms: z.string().optional(),
  tax_id: z.string().max(50, 'Tax ID too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional()
});

interface CustomerMasterFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerMaster | null;
  onSuccess: () => void;
}

const CustomerMasterFormModal: React.FC<CustomerMasterFormModalProps> = ({
  open,
  onOpenChange,
  customer,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!customer;

  const form = useForm<CustomerMasterFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      company_id: '',
      customer_type: 'individual',
      status: 'active',
      credit_limit: 0,
      payment_terms: '',
      tax_id: '',
      notes: ''
    }
  });

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (open) {
      if (customer) {
        form.reset({
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          email: customer.email,
          company_id: customer.company_id || '',
          customer_type: customer.customer_type,
          status: customer.status,
          credit_limit: customer.credit_limit || 0,
          payment_terms: customer.payment_terms || '',
          tax_id: customer.tax_id || '',
          notes: customer.notes || ''
        });
      } else {
        form.reset({
          name: '',
          address: '',
          phone: '',
          email: '',
          company_id: '',
          customer_type: 'individual',
          status: 'active',
          credit_limit: 0,
          payment_terms: '',
          tax_id: '',
          notes: ''
        });
      }
    }
  }, [open, customer, form]);

  const onSubmit = async (data: CustomerMasterFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && customer) {
        await customerMasterService.updateCustomer(customer.id, data);
        toast.success('Customer updated successfully.');
      } else {
        await customerMasterService.createCustomer(data);
        toast.success('Customer created successfully.');
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save customer:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} customer. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const loadCompanyOptions = async (search?: string) => {
    try {
      const options = await companyService.getCompanyOptions(search);
      return options;
    } catch (error) {
      console.error('Failed to load company options:', error);
      return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isEditing ? 'Edit Customer' : 'Add New Customer'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the customer information below.'
              : 'Fill in the details to add a new customer to your master data.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter customer name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUSTOMER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter complete address"
                      className="min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1-555-0123"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="customer@email.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="company_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company (Optional)</FormLabel>
                  <FormControl>
                    <MasterDataSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select or search company..."
                      searchPlaceholder="Search companies..."
                      emptyMessage="No companies found."
                      loadOptions={loadCompanyOptions}
                      disabled={isSubmitting}
                      allowClear
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credit_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="payment_terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Terms</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No terms specified</SelectItem>
                        {PAYMENT_TERMS.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tax identification number"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about the customer..."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Customer' : 'Create Customer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMasterFormModal;