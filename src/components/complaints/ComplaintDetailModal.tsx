import React, { useState, useEffect } from 'react';
import { complaintService } from '@/services/complaintService';
import { Complaint, ComplaintComment, ComplaintUpdateData } from '@/types/complaints';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Loader2, 
  MessageSquare, 
  Send, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Building2,
  Wrench,
  Save,
  RotateCcw
} from 'lucide-react';

interface ComplaintDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: Complaint;
  onSuccess: () => void;
}

const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  open,
  onOpenChange,
  complaint,
  onSuccess
}) => {
  const { user, hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [engineers, setEngineers] = useState<Array<{ id: string; name: string; }>>([]);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [updateData, setUpdateData] = useState<ComplaintUpdateData>({
    status: complaint.status,
    assigned_engineer_id: complaint.assigned_engineer_id,
    engineer_resolution: complaint.engineer_resolution || '',
    priority: complaint.priority
  });

  useEffect(() => {
    if (open) {
      fetchEngineers();
      setUpdateData({
        status: complaint.status,
        assigned_engineer_id: complaint.assigned_engineer_id,
        engineer_resolution: complaint.engineer_resolution || '',
        priority: complaint.priority
      });
    }
  }, [open, complaint]);

  const fetchEngineers = async () => {
    try {
      const data = await complaintService.getEngineers();
      setEngineers(data);
    } catch (error) {
      console.error('Failed to fetch engineers:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      await complaintService.addComment(complaint.id, newComment);
      setNewComment('');
      onSuccess();
      toast({
        title: 'Success',
        description: 'Comment added successfully'
      });
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateComplaint = async () => {
    if (updateData.status === 'closed' && !updateData.engineer_resolution?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Engineer resolution is required to close a complaint',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);
    try {
      await complaintService.updateComplaint(complaint.id, updateData);
      onSuccess();
      toast({
        title: 'Success',
        description: 'Complaint updated successfully'
      });
    } catch (error: any) {
      console.error('Failed to update complaint:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update complaint',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'closed') {
      setShowCloseDialog(true);
    } else {
      setUpdateData({ ...updateData, status: newStatus as any });
    }
  };

  const confirmClose = () => {
    setUpdateData({ ...updateData, status: 'closed' });
    setShowCloseDialog(false);
  };

  const handleReopen = async () => {
    try {
      await complaintService.reopenComplaint(complaint.id);
      onSuccess();
      toast({
        title: 'Success',
        description: 'Complaint reopened successfully'
      });
    } catch (error: any) {
      console.error('Failed to reopen complaint:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reopen complaint',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: { color: 'bg-blue-100 text-blue-800', icon: AlertTriangle },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      closed: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.new;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[priority as keyof typeof variants] || variants.medium}`}>
        {priority}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const canEdit = hasPermission('write') && (
    user?.role === 'admin' || 
    user?.role === 'manager' || 
    (user?.role === 'engineer' && complaint.assigned_engineer_id === user.id)
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Complaint Details
            </DialogTitle>
            <DialogDescription>
              View and manage complaint lifecycle with comments and status updates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Complaint Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{complaint.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {complaint.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(complaint.status)}
                    {getPriorityBadge(complaint.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Customer:</span>
                    <span>{complaint.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Engineer:</span>
                    <span>{complaint.assigned_engineer_name || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Created:</span>
                    <span>{formatDate(complaint.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Updated:</span>
                    <span>{formatDate(complaint.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Update Form */}
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Update Complaint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={updateData.status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={updateData.priority}
                        onValueChange={(value: any) => setUpdateData({ ...updateData, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="engineer">Assigned Engineer</Label>
                    <Select
                      value={updateData.assigned_engineer_id || ''}
                      onValueChange={(value) => setUpdateData({ ...updateData, assigned_engineer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select engineer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer.id} value={engineer.id}>
                            {engineer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {(updateData.status === 'closed' || complaint.status === 'closed') && (
                    <div>
                      <Label htmlFor="resolution">Engineer Resolution *</Label>
                      <Textarea
                        id="resolution"
                        value={updateData.engineer_resolution}
                        onChange={(e) => setUpdateData({ ...updateData, engineer_resolution: e.target.value })}
                        placeholder="Describe the resolution and actions taken..."
                        rows={4}
                        required={updateData.status === 'closed'}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleUpdateComplaint} disabled={isUpdating}>
                      {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Update Complaint
                    </Button>
                    
                    {complaint.status === 'closed' && (
                      <Button variant="outline" onClick={handleReopen}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reopen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments Timeline ({complaint.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>
                      {user?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                    />
                    <Button 
                      onClick={handleAddComment} 
                      disabled={isLoading || !newComment.trim()}
                      size="sm"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="mr-2 h-4 w-4" />
                      Add Comment
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Comments List */}
                <div className="space-y-4">
                  {complaint.comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No comments yet</p>
                  ) : (
                    complaint.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.user_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.user_name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {comment.user_role}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Complaint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this complaint? You'll need to provide an engineer resolution before closing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClose}>
              Continue to Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ComplaintDetailModal;