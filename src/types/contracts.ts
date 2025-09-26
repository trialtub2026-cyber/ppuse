export interface Contract {
  id: string;
  title: string;
  type: 'service_agreement' | 'nda' | 'purchase_order' | 'employment' | 'custom';
  status: 'draft' | 'pending_approval' | 'active' | 'renewed' | 'expired';
  parties: ContractParty[];
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  renewalTerms: string;
  approvalStage: string;
  signedDate?: string;
  createdBy: string;
  assignedTo: string;
  tenant_id: string;
  content: string;
  templateId?: string;
  version: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderDays: number[];
  nextReminderDate?: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review';
  attachments: ContractAttachment[];
  approvalHistory: ApprovalRecord[];
  signatureStatus: SignatureStatus;
  created_at: string;
  updated_at: string;
}

export interface ContractParty {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'vendor' | 'partner' | 'internal';
  signatureRequired: boolean;
  signedAt?: string;
  signatureUrl?: string;
}

export interface ContractAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ApprovalRecord {
  id: string;
  stage: string;
  approver: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  timestamp: string;
}

export interface SignatureStatus {
  totalRequired: number;
  completed: number;
  pending: string[];
  lastSignedAt?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: 'service_agreement' | 'nda' | 'purchase_order' | 'employment' | 'custom';
  content: string;
  fields: TemplateField[];
  isActive: boolean;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
}

export interface ContractAnalytics {
  totalContracts: number;
  activeContracts: number;
  pendingApprovals: number;
  expiringContracts: number;
  totalValue: number;
  averageApprovalTime: number;
  renewalRate: number;
  complianceRate: number;
  monthlyStats: MonthlyContractStats[];
  statusDistribution: StatusDistribution[];
  typeDistribution: TypeDistribution[];
}

export interface MonthlyContractStats {
  month: string;
  created: number;
  signed: number;
  expired: number;
  value: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface TypeDistribution {
  type: string;
  count: number;
  value: number;
}

export interface ContractFilters {
  status?: string;
  type?: string;
  assignedTo?: string;
  createdBy?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  valueRange?: {
    min: number;
    max: number;
  };
  search?: string;
  tags?: string[];
  autoRenew?: boolean;
  complianceStatus?: string;
}

export interface RenewalReminder {
  id: string;
  contractId: string;
  contractTitle: string;
  reminderDate: string;
  daysUntilExpiry: number;
  status: 'pending' | 'sent' | 'acknowledged';
  recipients: string[];
  message: string;
  created_at: string;
}

export interface DigitalSignature {
  id: string;
  contractId: string;
  signerId: string;
  signerName: string;
  signerEmail: string;
  signatureUrl: string;
  ipAddress: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'declined';
  verificationCode?: string;
}