import React, { useState, useEffect } from 'react';
import { Customer, CustomerTag } from '@/types/crm';
import { customerService } from '@/services/customerService';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Trash2, 
  Tag, 
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCustomers: Customer[];
  onComplete: () => void;
}

type BulkOperation = 'delete' | 'update_status' | 'assign_tags' | 'remove_tags' | 'assign_user';

const BulkOperationsModal: React.FC<BulkOperationsModalProps> = ({
  isOpen,
  onClose,
  selectedCustomers,
  onComplete
}) => {
  const { toast } = useToast();
  const [operation, setOperation] = useState<BulkOperation>('update_status');
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<CustomerTag[]>([]);
  
  // Operation-specific state
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'prospect'>('active');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [assignedUser, setAssignedUser] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  const loadTags = async () => {
    try {
      const tags = await customerService.getTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleSubmit = async () => {
    if (selectedCustomers.length === 0) return;

    setIsLoading(true);
    try {
      const customerIds = selectedCustomers.map(c => c.id);

      switch (operation) {
        case 'delete':
          await customerService.bulkDeleteCustomers(customerIds);
          toast({
            title: 'Success',
            description: `Deleted ${selectedCustomers.length} customers`
          });
          break;

        case 'update_status':
          await customerService.bulkUpdateCustomers(customerIds, { status: newStatus });
          toast({
            title: 'Success',
            description: `Updated status for ${selectedCustomers.length} customers`
          });
          break;

        case 'assign_tags':
          const tagsToAssign = availableTags.filter(tag => selectedTags.includes(tag.id));
          for (const customer of selectedCustomers) {
            const updatedTags = [...customer.tags];
            tagsToAssign.forEach(tag => {
              if (!updatedTags.some(t => t.id === tag.id)) {
                updatedTags.push(tag);
              }
            });
            await customerService.updateCustomer(customer.id, { tags: updatedTags });
          }
          toast({
            title: 'Success',
            description: `Assigned tags to ${selectedCustomers.length} customers`
          });
          break;

        case 'remove_tags':
          const tagsToRemove = selectedTags;
          for (const customer of selectedCustomers) {
            const updatedTags = customer.tags.filter(tag => !tagsToRemove.includes(tag.id));
            await customerService.updateCustomer(customer.id, { tags: updatedTags });
          }
          toast({
            title: 'Success',
            description: `Removed tags from ${selectedCustomers.length} customers`
          });
          break;

        case 'assign_user':
          await customerService.bulkUpdateCustomers(customerIds, { assigned_to: assignedUser });
          toast({
            title: 'Success',
            description: `Assigned ${selectedCustomers.length} customers to user`
          });
          break;
      }

      onComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to perform bulk operation',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getOperationIcon = (op: BulkOperation) => {
    switch (op) {
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'update_status': return <UserCheck className="h-4 w-4" />;
      case 'assign_tags': return <Tag className="h-4 w-4" />;
      case 'remove_tags': return <Tag className="h-4 w-4" />;
      case 'assign_user': return <Users className="h-4 w-4" />;
    }
  };

  const getOperationDescription = (op: BulkOperation) => {
    switch (op) {
      case 'delete': return 'Permanently delete selected customers';
      case 'update_status': return 'Change the status of selected customers';
      case 'assign_tags': return 'Add tags to selected customers';
      case 'remove_tags': return 'Remove tags from selected customers';
      case 'assign_user': return 'Assign selected customers to a user';
    }
  };

  const isDestructive = operation === 'delete';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Operations
          </DialogTitle>
          <DialogDescription>
            Perform actions on {selectedCustomers.length} selected customer{selectedCustomers.length !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Customers Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Selected Customers ({selectedCustomers.length})</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {selectedCustomers.slice(0, 5).map((customer) => (
                <div key={customer.id} className="text-sm text-gray-600">
                  {customer.company_name} - {customer.contact_name}
                </div>
              ))}
              {selectedCustomers.length > 5 && (
                <div className="text-sm text-gray-500 italic">
                  ... and {selectedCustomers.length - 5} more
                </div>
              )}
            </div>
          </div>

          {/* Operation Selection */}
          <div className="space-y-4">
            <Label>Select Operation</Label>
            <div className="grid grid-cols-1 gap-2">
              {(['update_status', 'assign_tags', 'remove_tags', 'assign_user', 'delete'] as BulkOperation[]).map((op) => (
                <div
                  key={op}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    operation === op 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${op === 'delete' ? 'border-red-200 hover:border-red-300' : ''}`}
                  onClick={() => setOperation(op)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded ${op === 'delete' ? 'text-red-600' : 'text-gray-600'}`}>
                      {getOperationIcon(op)}
                    </div>
                    <div>
                      <div className={`font-medium ${op === 'delete' ? 'text-red-900' : ''}`}>
                        {op.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className={`text-sm ${op === 'delete' ? 'text-red-600' : 'text-gray-500'}`}>
                        {getOperationDescription(op)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Operation-specific Configuration */}
          <div className="space-y-4">
            {operation === 'update_status' && (
              <div className="space-y-2">
                <Label>New Status</Label>
                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(operation === 'assign_tags' || operation === 'remove_tags') && (
              <div className="space-y-2">
                <Label>
                  {operation === 'assign_tags' ? 'Tags to Assign' : 'Tags to Remove'}
                </Label>
                <div className="max-h-40 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {availableTags.map((tag) => (
                    <div key={tag.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tag-${tag.id}`}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagToggle(tag.id)}
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
                {selectedTags.length === 0 && (
                  <p className="text-sm text-gray-500">No tags selected</p>
                )}
              </div>
            )}

            {operation === 'assign_user' && (
              <div className="space-y-2">
                <Label>Assign to User</Label>
                <Select value={assignedUser} onValueChange={setAssignedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Admin User</SelectItem>
                    <SelectItem value="2">Manager User</SelectItem>
                    <SelectItem value="3">Agent User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operation === 'delete' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All selected customers and their associated data will be permanently deleted.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (operation === 'assign_user' && !assignedUser) || ((operation === 'assign_tags' || operation === 'remove_tags') && selectedTags.length === 0)}
            variant={isDestructive ? 'destructive' : 'default'}
          >
            {isLoading ? 'Processing...' : `Apply to ${selectedCustomers.length} Customer${selectedCustomers.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkOperationsModal;