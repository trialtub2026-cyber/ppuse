import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Contract, ApprovalRecord } from '@/types/contracts';
import { contractService } from '@/services/contractService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Download,
  RefreshCw,
  Send,
  MessageSquare,
  Shield,
  Eye,
  PenTool,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ContractDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectComments, setRejectComments] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadContract();
    }
  }, [id]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const data = await contractService.getContract(id!);
      setContract(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load contract details',
        variant: 'destructive'
      });
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!contract) return;
    
    try {
      await contractService.approveContract(contract.id, 'manager_approval', approvalComments);
      toast({
        title: 'Success',
        description: 'Contract approved successfully'
      });
      loadContract();
      setShowApprovalDialog(false);
      setApprovalComments('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve contract',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async () => {
    if (!contract) return;
    
    try {
      await contractService.rejectContract(contract.id, 'manager_approval', rejectComments);
      toast({
        title: 'Success',
        description: 'Contract rejected'
      });
      loadContract();
      setShowRejectDialog(false);
      setRejectComments('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject contract',
        variant: 'destructive'
      });
    }
  };

  const handleToggleAutoRenewal = async () => {
    if (!contract) return;
    
    try {
      await contractService.toggleAutoRenewal(contract.id, !contract.autoRenew);
      toast({
        title: 'Success',
        description: `Auto-renewal ${!contract.autoRenew ? 'enabled' : 'disabled'}`
      });
      loadContract();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update auto-renewal setting',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      renewed: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={cn('flex items-center gap-1', config.color)}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={cn('text-xs', priorityConfig[priority as keyof typeof priorityConfig])}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSignatureProgress = () => {
    if (!contract) return 0;
    return (contract.signatureStatus.completed / contract.signatureStatus.totalRequired) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Contract not found</p>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(contract.endDate);
  const signatureProgress = getSignatureProgress();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/contracts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{contract.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(contract.status)}
              {getPriorityBadge(contract.priority)}
              <Badge variant="outline">
                {contract.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contract.status === 'pending_approval' && hasPermission('write') && (
            <>
              <Button variant="outline" onClick={() => setShowRejectDialog(true)}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => setShowApprovalDialog(true)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {hasPermission('write') && (
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Alert for expiring contracts */}
      {contract.status === 'active' && daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-800">
              Contract expires in {daysUntilExpiry} days
            </span>
          </div>
          <p className="text-sm text-orange-700 mt-1">
            Consider initiating renewal process or reviewing terms.
          </p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contract.value > 0 ? formatCurrency(contract.value, contract.currency) : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signatures</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contract.signatureStatus.completed}/{contract.signatureStatus.totalRequired}
            </div>
            <Progress value={signatureProgress} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Renewal</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={contract.autoRenew ? 'default' : 'secondary'}>
                {contract.autoRenew ? 'Enabled' : 'Disabled'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleAutoRenewal}
                disabled={!hasPermission('write')}
              >
                Toggle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="parties" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Parties
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Approval History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <p className="text-sm">{contract.type.replace('_', ' ').toUpperCase()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <p className="text-sm">{contract.priority.toUpperCase()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm">{formatDate(contract.created_at)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{formatDate(contract.updated_at)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contract.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {contract.renewalTerms && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Renewal Terms</Label>
                    <p className="text-sm mt-1">{contract.renewalTerms}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Compliance Status</Label>
                    <Badge 
                      variant={contract.complianceStatus === 'compliant' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {contract.complianceStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Approval Stage</Label>
                    <p className="text-sm">{contract.approvalStage.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
                
                {contract.signedDate && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Signed Date</Label>
                    <p className="text-sm">{formatDate(contract.signedDate)}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Reminder Schedule</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {contract.reminderDays.map((days) => (
                      <Badge key={days} variant="outline" className="text-xs">
                        {days} days
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Parties</CardTitle>
              <CardDescription>
                All parties involved in this contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.parties.map((party) => (
                  <div key={party.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {party.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{party.name}</div>
                        <div className="text-sm text-muted-foreground">{party.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{party.role}</Badge>
                          {party.signatureRequired && (
                            <Badge variant={party.signedAt ? 'default' : 'secondary'}>
                              {party.signedAt ? 'Signed' : 'Signature Required'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {party.signedAt ? (
                        <div>
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(party.signedAt)}
                          </p>
                        </div>
                      ) : party.signatureRequired ? (
                        <div>
                          <Clock className="h-5 w-5 text-yellow-600 mx-auto" />
                          <p className="text-xs text-muted-foreground mt-1">Pending</p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs text-muted-foreground">No signature required</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contract Content</CardTitle>
              <CardDescription>
                Full contract text and terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {contract.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>
                Track of all approval actions and comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contract.approvalHistory.length > 0 ? (
                <div className="space-y-4">
                  {contract.approvalHistory.map((record) => (
                    <div key={record.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {record.status === 'approved' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : record.status === 'rejected' ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{record.stage.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.status.toUpperCase()} by {record.approverName}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(record.timestamp)}
                          </p>
                        </div>
                        {record.comments && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <MessageSquare className="h-4 w-4 inline mr-1" />
                            {record.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No approval history available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Contract</DialogTitle>
            <DialogDescription>
              Add comments for this approval (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalComments">Comments</Label>
              <Textarea
                id="approvalComments"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Add any comments about this approval..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contract</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this contract
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectComments">Reason for Rejection *</Label>
              <Textarea
                id="rejectComments"
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                placeholder="Explain why this contract is being rejected..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectComments.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractDetail;