import React, { useState, useEffect } from 'react';
import { jobWorkService } from '@/services/jobWorkService';
import { JobWork, JobWorkUpdateData } from '@/types/jobWork';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  Package, 
  Save,
  Hash,
  Building2,
  User,
  Calendar,
  DollarSign,
  Ruler,
  MessageSquare,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle
} from 'lucide-react';

interface JobWorkDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobWork: JobWork;
  onSuccess: () => void;
}

const JobWorkDetailModal: React.FC<JobWorkDetailModalProps> = ({
  open,
  onOpenChange,
  jobWork,
  onSuccess
}) => {
  const { user, hasPermission } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [engineers, setEngineers] = useState<Array<{ id: string; name: string; }>>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [updateData, setUpdateData] = useState<JobWorkUpdateData>({
    status: jobWork.status,
    pieces: jobWork.pieces,
    size: jobWork.size,
    manual_price: jobWork.manual_price,
    receiver_engineer_id: jobWork.receiver_engineer_id,
    comments: jobWork.comments || ''
  });

  useEffect(() => {
    if (open) {
      fetchData();
      setUpdateData({
        status: jobWork.status,
        pieces: jobWork.pieces,
        size: jobWork.size,
        manual_price: jobWork.manual_price,
        receiver_engineer_id: jobWork.receiver_engineer_id,
        comments: jobWork.comments || ''
      });
    }
  }, [open, jobWork]);

  const fetchData = async () => {
    try {
      const [engineersData, sizesData] = await Promise.all([
        jobWorkService.getEngineers(),
        jobWorkService.getSizes()
      ]);
      
      setEngineers(engineersData);
      setSizes(sizesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleUpdateJobWork = async () => {
    if (updateData.pieces && updateData.pieces <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Pieces must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);
    try {
      await jobWorkService.updateJobWork(jobWork.id, updateData);
      onSuccess();
      toast({
        title: 'Success',
        description: 'Job work updated successfully'
      });
    } catch (error: any) {
      console.error('Failed to update job work:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update job work',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      delivered: { color: 'bg-purple-100 text-purple-800', icon: Truck }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFinalPrice = () => {
    const unitPrice = updateData.manual_price || jobWork.default_price;
    const pieces = updateData.pieces || jobWork.pieces;
    return unitPrice * pieces;
  };

  const canEdit = hasPermission('write') && (
    user?.role === 'admin' || 
    user?.role === 'manager' || 
    (user?.role === 'engineer' && jobWork.receiver_engineer_id === user.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Job Work Details
          </DialogTitle>
          <DialogDescription>
            View and manage job work details with status tracking and price management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Work Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hash className="h-5 w-5" />
                    {jobWork.job_ref_id}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Job work for {jobWork.customer_name}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  {getStatusBadge(jobWork.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Customer:</span>
                  <span>{jobWork.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Product:</span>
                  <span>{jobWork.product_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Engineer:</span>
                  <span>{jobWork.receiver_engineer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Total Value:</span>
                  <span className="font-bold text-green-600">{formatCurrency(jobWork.final_price)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Created:</span>
                  <span>{formatDate(jobWork.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Updated:</span>
                  <span>{formatDate(jobWork.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Price Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Default Price (per piece):</span>
                  <span className="font-medium">{formatCurrency(jobWork.default_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pieces:</span>
                  <span className="font-medium">{jobWork.pieces}</span>
                </div>
                {jobWork.manual_price && (
                  <div className="flex justify-between">
                    <span>Manual Price (per piece):</span>
                    <span className="font-medium text-orange-600">{formatCurrency(jobWork.manual_price)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{jobWork.size}</span>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <Badge variant="secondary" className="text-base">
                  {formatCurrency(jobWork.final_price)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {jobWork.comments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {jobWork.comments}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Update Form */}
          {canEdit && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Update Job Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={updateData.status}
                      onValueChange={(value: any) => setUpdateData({ ...updateData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="engineer">Receiver Engineer</Label>
                    <Select
                      value={updateData.receiver_engineer_id}
                      onValueChange={(value) => setUpdateData({ ...updateData, receiver_engineer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pieces">Pieces</Label>
                    <Input
                      id="pieces"
                      type="number"
                      min="1"
                      value={updateData.pieces}
                      onChange={(e) => setUpdateData({ 
                        ...updateData, 
                        pieces: parseInt(e.target.value) || 1 
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Select
                      value={updateData.size}
                      onValueChange={(value) => setUpdateData({ ...updateData, size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                <div>
                  <Label htmlFor="manual_price">Manual Price Override (per piece)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="manual_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={updateData.manual_price || ''}
                      onChange={(e) => setUpdateData({ 
                        ...updateData, 
                        manual_price: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="Leave empty to use default price"
                      className="pl-10"
                    />
                  </div>
                  {updateData.manual_price && updateData.pieces && (
                    <p className="text-sm text-gray-600 mt-1">
                      New total: {formatCurrency(updateData.manual_price * updateData.pieces)}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="comments">Comments</Label>
                  <Textarea
                    id="comments"
                    value={updateData.comments}
                    onChange={(e) => setUpdateData({ ...updateData, comments: e.target.value })}
                    placeholder="Additional notes or updates..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleUpdateJobWork} disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Update Job Work
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">Created</span>
                    <span className="text-gray-500 ml-2">{formatDate(jobWork.created_at)}</span>
                  </div>
                </div>
                
                {jobWork.completed_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Completed</span>
                      <span className="text-gray-500 ml-2">{formatDate(jobWork.completed_at)}</span>
                    </div>
                  </div>
                )}
                
                {jobWork.delivered_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Delivered</span>
                      <span className="text-gray-500 ml-2">{formatDate(jobWork.delivered_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobWorkDetailModal;