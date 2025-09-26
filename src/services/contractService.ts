import { 
  Contract, 
  ContractTemplate, 
  ContractAnalytics, 
  ContractFilters,
  RenewalReminder,
  DigitalSignature,
  ApprovalRecord,
  ContractParty
} from '@/types/contracts';
import { authService } from './authService';

class ContractService {
  private baseUrl = '/api/contracts';

  // Mock contract templates
  private mockTemplates: ContractTemplate[] = [
    {
      id: '1',
      name: 'Service Agreement Template',
      type: 'service_agreement',
      content: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on {{startDate}} between {{clientName}} ("Client") and {{providerName}} ("Provider").

1. SERVICES
Provider agrees to provide the following services: {{serviceDescription}}

2. TERM
This agreement shall commence on {{startDate}} and continue until {{endDate}}.

3. COMPENSATION
Client agrees to pay Provider {{contractValue}} {{currency}} for the services described herein.

4. PAYMENT TERMS
{{paymentTerms}}

5. TERMINATION
Either party may terminate this agreement with {{terminationNotice}} days written notice.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Client: _________________________ Date: _________
{{clientName}}

Provider: _________________________ Date: _________
{{providerName}}`,
      fields: [
        { id: '1', name: 'clientName', label: 'Client Name', type: 'text', required: true },
        { id: '2', name: 'providerName', label: 'Provider Name', type: 'text', required: true },
        { id: '3', name: 'serviceDescription', label: 'Service Description', type: 'textarea', required: true },
        { id: '4', name: 'contractValue', label: 'Contract Value', type: 'number', required: true },
        { id: '5', name: 'currency', label: 'Currency', type: 'select', required: true, options: ['USD', 'EUR', 'GBP'] },
        { id: '6', name: 'paymentTerms', label: 'Payment Terms', type: 'textarea', required: true },
        { id: '7', name: 'terminationNotice', label: 'Termination Notice (days)', type: 'number', required: true, defaultValue: '30' }
      ],
      isActive: true,
      category: 'Business',
      description: 'Standard service agreement template for professional services',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Non-Disclosure Agreement',
      type: 'nda',
      content: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into on {{startDate}} between {{disclosingParty}} ("Disclosing Party") and {{receivingParty}} ("Receiving Party").

1. CONFIDENTIAL INFORMATION
For purposes of this Agreement, "Confidential Information" means {{confidentialDefinition}}

2. OBLIGATIONS
Receiving Party agrees to:
- Hold all Confidential Information in strict confidence
- Not disclose Confidential Information to third parties
- Use Confidential Information solely for {{purpose}}

3. TERM
This Agreement shall remain in effect for {{duration}} years from the date of execution.

4. RETURN OF INFORMATION
Upon termination, Receiving Party shall return or destroy all Confidential Information.

IN WITNESS WHEREOF, the parties have executed this Agreement.

Disclosing Party: _________________________ Date: _________
{{disclosingParty}}

Receiving Party: _________________________ Date: _________
{{receivingParty}}`,
      fields: [
        { id: '1', name: 'disclosingParty', label: 'Disclosing Party', type: 'text', required: true },
        { id: '2', name: 'receivingParty', label: 'Receiving Party', type: 'text', required: true },
        { id: '3', name: 'confidentialDefinition', label: 'Confidential Information Definition', type: 'textarea', required: true },
        { id: '4', name: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', required: true },
        { id: '5', name: 'duration', label: 'Duration (years)', type: 'number', required: true, defaultValue: '2' }
      ],
      isActive: true,
      category: 'Legal',
      description: 'Standard non-disclosure agreement for confidential information protection',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Purchase Order Agreement',
      type: 'purchase_order',
      content: `PURCHASE ORDER AGREEMENT

Purchase Order Number: {{poNumber}}
Date: {{startDate}}

Vendor: {{vendorName}}
Buyer: {{buyerName}}

1. PRODUCTS/SERVICES
{{itemDescription}}

2. PRICING
Total Amount: {{contractValue}} {{currency}}

3. DELIVERY
Delivery Date: {{deliveryDate}}
Delivery Address: {{deliveryAddress}}

4. PAYMENT TERMS
{{paymentTerms}}

5. WARRANTIES
{{warranties}}

Authorized Signature: _________________________ Date: _________
{{buyerName}}`,
      fields: [
        { id: '1', name: 'poNumber', label: 'PO Number', type: 'text', required: true },
        { id: '2', name: 'vendorName', label: 'Vendor Name', type: 'text', required: true },
        { id: '3', name: 'buyerName', label: 'Buyer Name', type: 'text', required: true },
        { id: '4', name: 'itemDescription', label: 'Items/Services Description', type: 'textarea', required: true },
        { id: '5', name: 'contractValue', label: 'Total Amount', type: 'number', required: true },
        { id: '6', name: 'currency', label: 'Currency', type: 'select', required: true, options: ['USD', 'EUR', 'GBP'] },
        { id: '7', name: 'deliveryDate', label: 'Delivery Date', type: 'date', required: true },
        { id: '8', name: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', required: true },
        { id: '9', name: 'paymentTerms', label: 'Payment Terms', type: 'textarea', required: true },
        { id: '10', name: 'warranties', label: 'Warranties', type: 'textarea', required: false }
      ],
      isActive: true,
      category: 'Procurement',
      description: 'Standard purchase order agreement for goods and services',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  // Mock contracts data
  private mockContracts: Contract[] = [
    {
      id: '1',
      title: 'Enterprise Software License Agreement',
      type: 'service_agreement',
      status: 'active',
      parties: [
        {
          id: '1',
          name: 'TechCorp Solutions',
          email: 'legal@techcorp.com',
          role: 'client',
          signatureRequired: true,
          signedAt: '2024-01-15T10:00:00Z',
          signatureUrl: '/signatures/techcorp-signature.png'
        },
        {
          id: '2',
          name: 'Our Company',
          email: 'contracts@ourcompany.com',
          role: 'vendor',
          signatureRequired: true,
          signedAt: '2024-01-15T10:30:00Z',
          signatureUrl: '/signatures/ourcompany-signature.png'
        }
      ],
      value: 150000,
      currency: 'USD',
      startDate: '2024-01-15',
      endDate: '2025-01-15',
      autoRenew: true,
      renewalTerms: 'Automatic renewal for 1 year unless terminated with 60 days notice',
      approvalStage: 'approved',
      signedDate: '2024-01-15T10:30:00Z',
      createdBy: '1',
      assignedTo: '2',
      tenant_id: 'tenant_1',
      content: 'Full enterprise software license agreement content...',
      templateId: '1',
      version: 1,
      tags: ['enterprise', 'software', 'annual'],
      priority: 'high',
      reminderDays: [90, 60, 30],
      nextReminderDate: '2024-10-15',
      complianceStatus: 'compliant',
      attachments: [],
      approvalHistory: [
        {
          id: '1',
          stage: 'legal_review',
          approver: '3',
          approverName: 'Legal Team',
          status: 'approved',
          comments: 'Terms reviewed and approved',
          timestamp: '2024-01-10T14:00:00Z'
        },
        {
          id: '2',
          stage: 'finance_review',
          approver: '4',
          approverName: 'Finance Team',
          status: 'approved',
          comments: 'Budget approved',
          timestamp: '2024-01-12T16:00:00Z'
        }
      ],
      signatureStatus: {
        totalRequired: 2,
        completed: 2,
        pending: [],
        lastSignedAt: '2024-01-15T10:30:00Z'
      },
      created_at: '2024-01-05T09:00:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Manufacturing Partnership NDA',
      type: 'nda',
      status: 'pending_approval',
      parties: [
        {
          id: '1',
          name: 'Global Manufacturing Inc',
          email: 'legal@globalmanuf.com',
          role: 'partner',
          signatureRequired: true
        },
        {
          id: '2',
          name: 'Our Company',
          email: 'contracts@ourcompany.com',
          role: 'internal',
          signatureRequired: true
        }
      ],
      value: 0,
      currency: 'USD',
      startDate: '2024-02-01',
      endDate: '2026-02-01',
      autoRenew: false,
      renewalTerms: 'Manual renewal required',
      approvalStage: 'legal_review',
      createdBy: '2',
      assignedTo: '3',
      tenant_id: 'tenant_1',
      content: 'Non-disclosure agreement for manufacturing partnership...',
      templateId: '2',
      version: 1,
      tags: ['nda', 'manufacturing', 'partnership'],
      priority: 'medium',
      reminderDays: [30, 7],
      complianceStatus: 'pending_review',
      attachments: [],
      approvalHistory: [
        {
          id: '1',
          stage: 'legal_review',
          approver: '3',
          approverName: 'Legal Team',
          status: 'pending',
          timestamp: '2024-01-25T10:00:00Z'
        }
      ],
      signatureStatus: {
        totalRequired: 2,
        completed: 0,
        pending: ['legal@globalmanuf.com', 'contracts@ourcompany.com']
      },
      created_at: '2024-01-25T09:00:00Z',
      updated_at: '2024-01-25T09:00:00Z'
    },
    {
      id: '3',
      title: 'Office Equipment Purchase Order',
      type: 'purchase_order',
      status: 'draft',
      parties: [
        {
          id: '1',
          name: 'Office Supplies Co',
          email: 'sales@officesupplies.com',
          role: 'vendor',
          signatureRequired: true
        }
      ],
      value: 25000,
      currency: 'USD',
      startDate: '2024-02-15',
      endDate: '2024-03-15',
      autoRenew: false,
      renewalTerms: 'One-time purchase',
      approvalStage: 'draft',
      createdBy: '3',
      assignedTo: '3',
      tenant_id: 'tenant_1',
      content: 'Purchase order for office equipment and supplies...',
      templateId: '3',
      version: 1,
      tags: ['purchase', 'office', 'equipment'],
      priority: 'low',
      reminderDays: [7],
      complianceStatus: 'pending_review',
      attachments: [],
      approvalHistory: [],
      signatureStatus: {
        totalRequired: 1,
        completed: 0,
        pending: ['sales@officesupplies.com']
      },
      created_at: '2024-01-28T14:00:00Z',
      updated_at: '2024-01-28T14:00:00Z'
    },
    {
      id: '4',
      title: 'Consulting Services Agreement',
      type: 'service_agreement',
      status: 'expired',
      parties: [
        {
          id: '1',
          name: 'StartupXYZ',
          email: 'legal@startupxyz.com',
          role: 'client',
          signatureRequired: true,
          signedAt: '2023-06-01T10:00:00Z',
          signatureUrl: '/signatures/startupxyz-signature.png'
        }
      ],
      value: 50000,
      currency: 'USD',
      startDate: '2023-06-01',
      endDate: '2024-01-01',
      autoRenew: false,
      renewalTerms: 'Manual renewal required',
      approvalStage: 'approved',
      signedDate: '2023-06-01T10:00:00Z',
      createdBy: '2',
      assignedTo: '2',
      tenant_id: 'tenant_1',
      content: 'Consulting services agreement content...',
      templateId: '1',
      version: 1,
      tags: ['consulting', 'startup', 'expired'],
      priority: 'medium',
      reminderDays: [30, 7],
      complianceStatus: 'compliant',
      attachments: [],
      approvalHistory: [
        {
          id: '1',
          stage: 'manager_review',
          approver: '2',
          approverName: 'Project Manager',
          status: 'approved',
          timestamp: '2023-05-25T10:00:00Z'
        }
      ],
      signatureStatus: {
        totalRequired: 1,
        completed: 1,
        pending: [],
        lastSignedAt: '2023-06-01T10:00:00Z'
      },
      created_at: '2023-05-20T09:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  async getContracts(filters?: ContractFilters): Promise<Contract[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let contracts = this.mockContracts.filter(c => c.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'agent') {
      contracts = contracts.filter(c => c.assignedTo === user.id || c.createdBy === user.id);
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        contracts = contracts.filter(c => c.status === filters.status);
      }
      if (filters.type) {
        contracts = contracts.filter(c => c.type === filters.type);
      }
      if (filters.assignedTo) {
        contracts = contracts.filter(c => c.assignedTo === filters.assignedTo);
      }
      if (filters.createdBy) {
        contracts = contracts.filter(c => c.createdBy === filters.createdBy);
      }
      if (filters.priority) {
        contracts = contracts.filter(c => c.priority === filters.priority);
      }
      if (filters.autoRenew !== undefined) {
        contracts = contracts.filter(c => c.autoRenew === filters.autoRenew);
      }
      if (filters.complianceStatus) {
        contracts = contracts.filter(c => c.complianceStatus === filters.complianceStatus);
      }
      if (filters.dateRange) {
        contracts = contracts.filter(c => {
          const startDate = new Date(c.startDate);
          const filterStart = new Date(filters.dateRange!.start);
          const filterEnd = new Date(filters.dateRange!.end);
          return startDate >= filterStart && startDate <= filterEnd;
        });
      }
      if (filters.valueRange) {
        contracts = contracts.filter(c => 
          c.value >= filters.valueRange!.min && c.value <= filters.valueRange!.max
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        contracts = contracts.filter(c => 
          filters.tags!.some(tag => c.tags.includes(tag))
        );
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        contracts = contracts.filter(c => 
          c.title.toLowerCase().includes(search) ||
          c.content.toLowerCase().includes(search) ||
          c.parties.some(p => p.name.toLowerCase().includes(search)) ||
          c.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }
    }

    return contracts;
  }

  async getContract(id: string): Promise<Contract> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const contract = this.mockContracts.find(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Check permissions
    if (user.role === 'agent' && contract.assignedTo !== user.id && contract.createdBy !== user.id) {
      throw new Error('Access denied');
    }

    return contract;
  }

  async createContract(contractData: Omit<Contract, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'version' | 'approvalHistory' | 'signatureStatus'>): Promise<Contract> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const newContract: Contract = {
      ...contractData,
      id: Date.now().toString(),
      tenant_id: user.tenant_id,
      version: 1,
      approvalHistory: [],
      signatureStatus: {
        totalRequired: contractData.parties.filter(p => p.signatureRequired).length,
        completed: 0,
        pending: contractData.parties.filter(p => p.signatureRequired).map(p => p.email)
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockContracts.push(newContract);
    return newContract;
  }

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const contractIndex = this.mockContracts.findIndex(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (contractIndex === -1) {
      throw new Error('Contract not found');
    }

    // Check permissions
    if (user.role === 'agent' && 
        this.mockContracts[contractIndex].assignedTo !== user.id && 
        this.mockContracts[contractIndex].createdBy !== user.id) {
      throw new Error('Access denied');
    }

    this.mockContracts[contractIndex] = {
      ...this.mockContracts[contractIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockContracts[contractIndex];
  }

  async deleteContract(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('delete')) {
      throw new Error('Insufficient permissions');
    }

    const contractIndex = this.mockContracts.findIndex(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (contractIndex === -1) {
      throw new Error('Contract not found');
    }

    this.mockContracts.splice(contractIndex, 1);
  }

  async getTemplates(): Promise<ContractTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockTemplates.filter(t => t.isActive);
  }

  async getTemplate(id: string): Promise<ContractTemplate> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const template = this.mockTemplates.find(t => t.id === id);
    if (!template) {
      throw new Error('Template not found');
    }
    
    return template;
  }

  async approveContract(id: string, stage: string, comments?: string): Promise<Contract> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const contract = await this.getContract(id);
    
    const approvalRecord: ApprovalRecord = {
      id: Date.now().toString(),
      stage,
      approver: user.id,
      approverName: user.name,
      status: 'approved',
      comments,
      timestamp: new Date().toISOString()
    };

    const updatedContract = await this.updateContract(id, {
      approvalHistory: [...contract.approvalHistory, approvalRecord],
      approvalStage: stage === 'final_approval' ? 'approved' : 'pending_approval',
      status: stage === 'final_approval' ? 'active' : contract.status
    });

    return updatedContract;
  }

  async rejectContract(id: string, stage: string, comments: string): Promise<Contract> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const contract = await this.getContract(id);
    
    const approvalRecord: ApprovalRecord = {
      id: Date.now().toString(),
      stage,
      approver: user.id,
      approverName: user.name,
      status: 'rejected',
      comments,
      timestamp: new Date().toISOString()
    };

    const updatedContract = await this.updateContract(id, {
      approvalHistory: [...contract.approvalHistory, approvalRecord],
      approvalStage: 'rejected',
      status: 'draft'
    });

    return updatedContract;
  }

  async requestSignature(contractId: string, signerEmail: string): Promise<DigitalSignature> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const signature: DigitalSignature = {
      id: Date.now().toString(),
      contractId,
      signerId: 'external',
      signerName: 'External Signer',
      signerEmail,
      signatureUrl: '',
      ipAddress: '192.168.1.1',
      timestamp: new Date().toISOString(),
      status: 'pending',
      verificationCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    };

    return signature;
  }

  async getAnalytics(): Promise<ContractAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let contracts = this.mockContracts.filter(c => c.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'agent') {
      contracts = contracts.filter(c => c.assignedTo === user.id || c.createdBy === user.id);
    }

    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(c => c.status === 'active').length;
    const pendingApprovals = contracts.filter(c => c.status === 'pending_approval').length;
    const expiringContracts = contracts.filter(c => {
      const endDate = new Date(c.endDate);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;

    const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);
    const averageApprovalTime = 3.5; // Mock average in days
    const renewalRate = 85; // Mock percentage
    const complianceRate = 92; // Mock percentage

    const statusDistribution = [
      { status: 'active', count: activeContracts, percentage: (activeContracts / totalContracts) * 100 },
      { status: 'draft', count: contracts.filter(c => c.status === 'draft').length, percentage: (contracts.filter(c => c.status === 'draft').length / totalContracts) * 100 },
      { status: 'pending_approval', count: pendingApprovals, percentage: (pendingApprovals / totalContracts) * 100 },
      { status: 'expired', count: contracts.filter(c => c.status === 'expired').length, percentage: (contracts.filter(c => c.status === 'expired').length / totalContracts) * 100 }
    ];

    const typeDistribution = [
      { type: 'service_agreement', count: contracts.filter(c => c.type === 'service_agreement').length, value: contracts.filter(c => c.type === 'service_agreement').reduce((sum, c) => sum + c.value, 0) },
      { type: 'nda', count: contracts.filter(c => c.type === 'nda').length, value: contracts.filter(c => c.type === 'nda').reduce((sum, c) => sum + c.value, 0) },
      { type: 'purchase_order', count: contracts.filter(c => c.type === 'purchase_order').length, value: contracts.filter(c => c.type === 'purchase_order').reduce((sum, c) => sum + c.value, 0) }
    ];

    const monthlyStats = [
      { month: 'Jan 2024', created: 2, signed: 1, expired: 0, value: 175000 },
      { month: 'Feb 2024', created: 1, signed: 0, expired: 1, value: 25000 },
      { month: 'Mar 2024', created: 0, signed: 1, expired: 0, value: 0 }
    ];

    return {
      totalContracts,
      activeContracts,
      pendingApprovals,
      expiringContracts,
      totalValue,
      averageApprovalTime,
      renewalRate,
      complianceRate,
      monthlyStats,
      statusDistribution,
      typeDistribution
    };
  }

  async getRenewalReminders(): Promise<RenewalReminder[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Mock renewal reminders
    return [
      {
        id: '1',
        contractId: '1',
        contractTitle: 'Enterprise Software License Agreement',
        reminderDate: '2024-10-15',
        daysUntilExpiry: 90,
        status: 'pending',
        recipients: ['manager@company.com'],
        message: 'Contract expires in 90 days. Please review renewal terms.',
        created_at: new Date().toISOString()
      }
    ];
  }

  async toggleAutoRenewal(contractId: string, autoRenew: boolean): Promise<Contract> {
    return this.updateContract(contractId, { autoRenew });
  }

  async getContractTypes(): Promise<string[]> {
    return ['service_agreement', 'nda', 'purchase_order', 'employment', 'custom'];
  }

  async getContractStatuses(): Promise<string[]> {
    return ['draft', 'pending_approval', 'active', 'renewed', 'expired'];
  }

  async getPriorities(): Promise<string[]> {
    return ['low', 'medium', 'high', 'urgent'];
  }

  async getComplianceStatuses(): Promise<string[]> {
    return ['compliant', 'non_compliant', 'pending_review'];
  }
}

export const contractService = new ContractService();