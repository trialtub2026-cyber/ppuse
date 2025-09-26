// Service Contract Service - Mock API Implementation

import { 
  ServiceContract, 
  ServiceContractFormData, 
  ServiceContractFilters, 
  ServiceContractsResponse,
  ContractTemplate,
  ContractGenerationData
} from '@/types/productSales';

// Mock data for development
const mockServiceContracts: ServiceContract[] = [
  {
    id: 'sc-001',
    product_sale_id: '1',
    contract_number: 'SC-2024-001',
    customer_id: 'cust-001',
    customer_name: 'Acme Corporation',
    product_id: 'prod-001',
    product_name: 'Enterprise CRM Suite',
    start_date: '2024-01-15',
    end_date: '2025-01-15',
    status: 'active',
    contract_value: 12500.00,
    annual_value: 12500.00,
    terms: 'Standard enterprise support terms with 24x7 coverage, dedicated account manager, and priority response times.',
    warranty_period: 12,
    service_level: 'enterprise',
    auto_renewal: true,
    renewal_notice_period: 90,
    pdf_url: '/api/contracts/sc-001.pdf',
    tenant_id: 'tenant-001',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    created_by: 'user-001'
  },
  {
    id: 'sc-002',
    product_sale_id: '2',
    contract_number: 'SC-2024-002',
    customer_id: 'cust-002',
    customer_name: 'TechStart Inc',
    product_id: 'prod-002',
    product_name: 'Analytics Dashboard Pro',
    start_date: '2024-02-01',
    end_date: '2025-02-01',
    status: 'active',
    contract_value: 3600.00,
    annual_value: 3600.00,
    terms: 'Standard support terms with business hours coverage and email support.',
    warranty_period: 12,
    service_level: 'standard',
    auto_renewal: true,
    renewal_notice_period: 60,
    pdf_url: '/api/contracts/sc-002.pdf',
    tenant_id: 'tenant-001',
    created_at: '2024-02-01T14:20:00Z',
    updated_at: '2024-02-01T14:20:00Z',
    created_by: 'user-002'
  },
  {
    id: 'sc-003',
    product_sale_id: '3',
    contract_number: 'SC-2023-015',
    customer_id: 'cust-003',
    customer_name: 'Global Enterprises',
    product_id: 'prod-001',
    product_name: 'Enterprise CRM Suite',
    start_date: '2023-12-01',
    end_date: '2024-12-01',
    status: 'expired',
    contract_value: 55000.00,
    annual_value: 55000.00,
    terms: 'Premium enterprise support with dedicated resources and custom SLA.',
    warranty_period: 12,
    service_level: 'premium',
    auto_renewal: false,
    renewal_notice_period: 120,
    pdf_url: '/api/contracts/sc-003.pdf',
    tenant_id: 'tenant-001',
    created_at: '2023-12-01T16:45:00Z',
    updated_at: '2024-01-15T09:30:00Z',
    created_by: 'user-001'
  }
];

const mockContractTemplates: ContractTemplate[] = [
  {
    id: 'template-001',
    name: 'Standard Service Contract',
    content: `
      <h1>SERVICE CONTRACT</h1>
      <p><strong>Contract Number:</strong> {{contract_number}}</p>
      <p><strong>Date:</strong> {{start_date}}</p>
      
      <h2>PARTIES</h2>
      <p><strong>Service Provider:</strong> {{company_name}}</p>
      <p><strong>Customer:</strong> {{customer_name}}</p>
      
      <h2>PRODUCT DETAILS</h2>
      <p><strong>Product:</strong> {{product_name}}</p>
      <p><strong>Units:</strong> {{units}}</p>
      <p><strong>Total Value:</strong> {{contract_value}}</p>
      
      <h2>SERVICE TERMS</h2>
      <p><strong>Service Level:</strong> {{service_level}}</p>
      <p><strong>Contract Period:</strong> {{start_date}} to {{end_date}}</p>
      <p><strong>Warranty Period:</strong> {{warranty_period}} months</p>
      <p><strong>Auto Renewal:</strong> {{auto_renewal}}</p>
      
      <h2>TERMS AND CONDITIONS</h2>
      <p>{{terms}}</p>
      
      <div class="signatures">
        <div class="signature-block">
          <p>Service Provider</p>
          <p>_________________________</p>
          <p>Date: _________________</p>
        </div>
        <div class="signature-block">
          <p>Customer</p>
          <p>_________________________</p>
          <p>Date: _________________</p>
        </div>
      </div>
    `,
    variables: [
      'contract_number', 'start_date', 'company_name', 'customer_name',
      'product_name', 'units', 'contract_value', 'service_level',
      'end_date', 'warranty_period', 'auto_renewal', 'terms'
    ],
    is_default: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

class ServiceContractService {
  private baseUrl = '/api/service-contract';

  // Get all service contracts with filtering and pagination
  async getServiceContracts(
    filters: ServiceContractFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<ServiceContractsResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredContracts = [...mockServiceContracts];

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredContracts = filteredContracts.filter(contract =>
          contract.customer_name?.toLowerCase().includes(searchLower) ||
          contract.product_name?.toLowerCase().includes(searchLower) ||
          contract.contract_number.toLowerCase().includes(searchLower) ||
          contract.terms.toLowerCase().includes(searchLower)
        );
      }

      if (filters.customer_id) {
        filteredContracts = filteredContracts.filter(contract => contract.customer_id === filters.customer_id);
      }

      if (filters.product_id) {
        filteredContracts = filteredContracts.filter(contract => contract.product_id === filters.product_id);
      }

      if (filters.status) {
        filteredContracts = filteredContracts.filter(contract => contract.status === filters.status);
      }

      if (filters.service_level) {
        filteredContracts = filteredContracts.filter(contract => contract.service_level === filters.service_level);
      }

      if (filters.expiry_from) {
        filteredContracts = filteredContracts.filter(contract => contract.end_date >= filters.expiry_from!);
      }

      if (filters.expiry_to) {
        filteredContracts = filteredContracts.filter(contract => contract.end_date <= filters.expiry_to!);
      }

      // Pagination
      const total = filteredContracts.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const data = filteredContracts.slice(startIndex, endIndex);

      return {
        data,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching service contracts:', error);
      throw new Error('Failed to fetch service contracts');
    }
  }

  // Get single service contract by ID
  async getServiceContractById(id: string): Promise<ServiceContract> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const contract = mockServiceContracts.find(c => c.id === id);
      if (!contract) {
        throw new Error('Service contract not found');
      }

      return contract;
    } catch (error) {
      console.error('Error fetching service contract:', error);
      throw error;
    }
  }

  // Get service contract by product sale ID
  async getServiceContractByProductSaleId(productSaleId: string): Promise<ServiceContract | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const contract = mockServiceContracts.find(c => c.product_sale_id === productSaleId);
      return contract || null;
    } catch (error) {
      console.error('Error fetching service contract by product sale ID:', error);
      throw error;
    }
  }

  // Create new service contract (auto-generated from product sale)
  async createServiceContract(
    productSaleId: string,
    productSale: any,
    data: Partial<ServiceContractFormData> = {}
  ): Promise<ServiceContract> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Generate contract number
      const contractNumber = `SC-${new Date().getFullYear()}-${String(mockServiceContracts.length + 1).padStart(3, '0')}`;

      // Calculate dates
      const startDate = new Date(productSale.delivery_date);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      // Determine status
      const now = new Date();
      let status: 'active' | 'expired' | 'renewed' | 'cancelled' = 'active';
      if (endDate < now) {
        status = 'expired';
      }

      const newContract: ServiceContract = {
        id: `sc-${Date.now()}`,
        product_sale_id: productSaleId,
        contract_number: contractNumber,
        customer_id: productSale.customer_id,
        customer_name: productSale.customer_name,
        product_id: productSale.product_id,
        product_name: productSale.product_name,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status,
        contract_value: productSale.total_cost,
        annual_value: productSale.total_cost,
        terms: data.terms || 'Standard service contract terms and conditions apply.',
        warranty_period: 12,
        service_level: data.service_level || 'standard',
        auto_renewal: data.auto_renewal ?? true,
        renewal_notice_period: data.renewal_notice_period || 60,
        tenant_id: 'tenant-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user'
      };

      // Add to mock data
      mockServiceContracts.unshift(newContract);

      // Generate PDF contract
      await this.generateContractPDF(newContract);

      return newContract;
    } catch (error) {
      console.error('Error creating service contract:', error);
      throw new Error('Failed to create service contract');
    }
  }

  // Update existing service contract
  async updateServiceContract(id: string, data: Partial<ServiceContractFormData>): Promise<ServiceContract> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const index = mockServiceContracts.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Service contract not found');
      }

      const existingContract = mockServiceContracts[index];
      const updatedContract: ServiceContract = {
        ...existingContract,
        ...data,
        updated_at: new Date().toISOString()
      };

      mockServiceContracts[index] = updatedContract;

      // Regenerate PDF if terms changed
      if (data.terms || data.service_level) {
        await this.generateContractPDF(updatedContract);
      }

      return updatedContract;
    } catch (error) {
      console.error('Error updating service contract:', error);
      throw new Error('Failed to update service contract');
    }
  }

  // Renew service contract
  async renewServiceContract(id: string, renewalData: Partial<ServiceContractFormData>): Promise<ServiceContract> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const existingContract = await this.getServiceContractById(id);
      
      // Create new contract for renewal
      const contractNumber = `SC-${new Date().getFullYear()}-${String(mockServiceContracts.length + 1).padStart(3, '0')}`;
      
      const startDate = new Date(existingContract.end_date);
      startDate.setDate(startDate.getDate() + 1); // Start day after previous contract ends
      
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const renewedContract: ServiceContract = {
        ...existingContract,
        id: `sc-${Date.now()}`,
        contract_number: contractNumber,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        status: 'renewed',
        ...renewalData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add renewed contract
      mockServiceContracts.unshift(renewedContract);

      // Update original contract status
      const originalIndex = mockServiceContracts.findIndex(c => c.id === id);
      if (originalIndex !== -1) {
        mockServiceContracts[originalIndex].status = 'renewed';
        mockServiceContracts[originalIndex].updated_at = new Date().toISOString();
      }

      // Generate PDF for renewed contract
      await this.generateContractPDF(renewedContract);

      return renewedContract;
    } catch (error) {
      console.error('Error renewing service contract:', error);
      throw new Error('Failed to renew service contract');
    }
  }

  // Cancel service contract
  async cancelServiceContract(id: string, reason: string): Promise<ServiceContract> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const index = mockServiceContracts.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error('Service contract not found');
      }

      const contract = mockServiceContracts[index];
      contract.status = 'cancelled';
      contract.terms += `\n\nContract cancelled on ${new Date().toISOString().split('T')[0]}. Reason: ${reason}`;
      contract.updated_at = new Date().toISOString();

      return contract;
    } catch (error) {
      console.error('Error cancelling service contract:', error);
      throw new Error('Failed to cancel service contract');
    }
  }

  // Get contract templates
  async getContractTemplates(): Promise<ContractTemplate[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockContractTemplates];
    } catch (error) {
      console.error('Error fetching contract templates:', error);
      throw new Error('Failed to fetch contract templates');
    }
  }

  // Generate contract PDF
  async generateContractPDF(contract: ServiceContract): Promise<string> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real implementation, this would:
      // 1. Get the contract template
      // 2. Replace variables with actual data
      // 3. Generate PDF using a library like Puppeteer or jsPDF
      // 4. Upload to storage and return URL

      const pdfUrl = `/api/contracts/${contract.id}.pdf`;
      
      // Update contract with PDF URL
      const index = mockServiceContracts.findIndex(c => c.id === contract.id);
      if (index !== -1) {
        mockServiceContracts[index].pdf_url = pdfUrl;
      }

      return pdfUrl;
    } catch (error) {
      console.error('Error generating contract PDF:', error);
      throw new Error('Failed to generate contract PDF');
    }
  }

  // Get contracts expiring soon
  async getExpiringContracts(days: number = 30): Promise<ServiceContract[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const expiringContracts = mockServiceContracts.filter(contract => {
        const endDate = new Date(contract.end_date);
        return endDate <= futureDate && endDate >= new Date() && contract.status === 'active';
      });

      return expiringContracts;
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      throw new Error('Failed to fetch expiring contracts');
    }
  }

  // Get contract analytics
  async getContractAnalytics(): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const totalContracts = mockServiceContracts.length;
      const activeContracts = mockServiceContracts.filter(c => c.status === 'active').length;
      const expiredContracts = mockServiceContracts.filter(c => c.status === 'expired').length;
      const renewedContracts = mockServiceContracts.filter(c => c.status === 'renewed').length;

      const totalValue = mockServiceContracts.reduce((sum, contract) => sum + contract.contract_value, 0);
      const averageValue = totalValue / totalContracts;

      const serviceLevelDistribution = mockServiceContracts.reduce((acc, contract) => {
        acc[contract.service_level] = (acc[contract.service_level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total_contracts: totalContracts,
        active_contracts: activeContracts,
        expired_contracts: expiredContracts,
        renewed_contracts: renewedContracts,
        total_value: totalValue,
        average_value: averageValue,
        service_level_distribution: serviceLevelDistribution,
        renewal_rate: renewedContracts / (renewedContracts + expiredContracts) * 100
      };
    } catch (error) {
      console.error('Error fetching contract analytics:', error);
      throw new Error('Failed to fetch contract analytics');
    }
  }
}

export const serviceContractService = new ServiceContractService();