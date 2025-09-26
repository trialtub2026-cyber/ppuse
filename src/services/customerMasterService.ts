import { CustomerMaster, CustomerMasterFormData, CustomerMasterFilters, MasterDataResponse } from '@/types/masters';

// Mock data for development
const mockCustomers: CustomerMaster[] = [
  {
    id: '1',
    name: 'John Smith',
    address: '123 Main Street, Anytown, CA 90210',
    phone: '+1-555-0101',
    email: 'john.smith@email.com',
    company_id: '1',
    company_name: 'TechCorp Solutions',
    customer_type: 'business',
    status: 'active',
    credit_limit: 50000,
    payment_terms: 'Net 30',
    tax_id: 'TAX123456789',
    notes: 'Key decision maker for technology purchases',
    tenant_id: 'tenant_1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    created_by: 'admin@company.com'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    address: '456 Oak Avenue, Springfield, IL 62701',
    phone: '+1-555-0202',
    email: 'sarah.johnson@healthfirst.com',
    company_id: '2',
    company_name: 'HealthFirst Medical',
    customer_type: 'enterprise',
    status: 'active',
    credit_limit: 100000,
    payment_terms: 'Net 45',
    tax_id: 'TAX987654321',
    notes: 'Procurement manager for medical software solutions',
    tenant_id: 'tenant_1',
    created_at: '2024-01-16T09:30:00Z',
    updated_at: '2024-01-16T09:30:00Z',
    created_by: 'admin@company.com'
  },
  {
    id: '3',
    name: 'Michael Chen',
    address: '789 Pine Street, Portland, OR 97201',
    phone: '+1-555-0303',
    email: 'michael.chen@personal.com',
    customer_type: 'individual',
    status: 'active',
    credit_limit: 5000,
    payment_terms: 'Net 15',
    notes: 'Individual consultant, frequent purchaser of development tools',
    tenant_id: 'tenant_1',
    created_at: '2024-01-17T14:15:00Z',
    updated_at: '2024-01-17T14:15:00Z',
    created_by: 'manager@company.com'
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    address: '321 Elm Drive, Miami, FL 33101',
    phone: '+1-555-0404',
    email: 'emily.rodriguez@greenenergy.com',
    company_id: '3',
    company_name: 'GreenEnergy Inc',
    customer_type: 'business',
    status: 'prospect',
    credit_limit: 25000,
    payment_terms: 'Net 30',
    tax_id: 'TAX456789123',
    notes: 'Interested in analytics solutions for energy management',
    tenant_id: 'tenant_1',
    created_at: '2024-01-18T11:45:00Z',
    updated_at: '2024-01-18T11:45:00Z',
    created_by: 'admin@company.com'
  },
  {
    id: '5',
    name: 'David Wilson',
    address: '654 Maple Lane, Denver, CO 80201',
    phone: '+1-555-0505',
    email: 'david.wilson@financeflow.com',
    company_id: '4',
    company_name: 'FinanceFlow Systems',
    customer_type: 'enterprise',
    status: 'active',
    credit_limit: 150000,
    payment_terms: 'Net 60',
    tax_id: 'TAX789123456',
    notes: 'CTO responsible for enterprise software procurement',
    tenant_id: 'tenant_1',
    created_at: '2024-01-19T08:20:00Z',
    updated_at: '2024-01-19T08:20:00Z',
    created_by: 'manager@company.com'
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    address: '987 Cedar Court, Phoenix, AZ 85001',
    phone: '+1-555-0606',
    email: 'lisa.thompson@edutech.com',
    company_id: '5',
    company_name: 'EduTech Learning',
    customer_type: 'business',
    status: 'inactive',
    credit_limit: 15000,
    payment_terms: 'Net 30',
    tax_id: 'TAX321654987',
    notes: 'Former customer, may be interested in new training solutions',
    tenant_id: 'tenant_1',
    created_at: '2024-01-20T16:30:00Z',
    updated_at: '2024-01-20T16:30:00Z',
    created_by: 'admin@company.com'
  },
  {
    id: '7',
    name: 'Robert Garcia',
    address: '147 Birch Street, Atlanta, GA 30301',
    phone: '+1-555-0707',
    email: 'robert.garcia@freelance.com',
    customer_type: 'individual',
    status: 'active',
    credit_limit: 3000,
    payment_terms: 'Due on Receipt',
    notes: 'Freelance developer, purchases individual licenses',
    tenant_id: 'tenant_1',
    created_at: '2024-01-21T12:00:00Z',
    updated_at: '2024-01-21T12:00:00Z',
    created_by: 'manager@company.com'
  },
  {
    id: '8',
    name: 'Amanda Foster',
    address: '258 Willow Way, Nashville, TN 37201',
    phone: '+1-555-0808',
    email: 'amanda.foster@startup.com',
    customer_type: 'business',
    status: 'suspended',
    credit_limit: 10000,
    payment_terms: 'Prepaid',
    notes: 'Account suspended due to payment issues, working on resolution',
    tenant_id: 'tenant_1',
    created_at: '2024-01-22T09:15:00Z',
    updated_at: '2024-01-22T09:15:00Z',
    created_by: 'admin@company.com'
  }
];

class CustomerMasterService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getCustomers(
    page: number = 1,
    limit: number = 10,
    filters: CustomerMasterFilters = {}
  ): Promise<MasterDataResponse<CustomerMaster>> {
    await this.delay(500);

    let filteredCustomers = [...mockCustomers];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.company_name?.toLowerCase().includes(searchLower) ||
        customer.phone.includes(filters.search!)
      );
    }

    if (filters.customer_type) {
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.customer_type === filters.customer_type
      );
    }

    if (filters.status) {
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.status === filters.status
      );
    }

    if (filters.company_id) {
      filteredCustomers = filteredCustomers.filter(customer => 
        customer.company_id === filters.company_id
      );
    }

    // Pagination
    const total = filteredCustomers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

    return {
      data: paginatedCustomers,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getCustomerById(id: string): Promise<CustomerMaster | null> {
    await this.delay(300);
    return mockCustomers.find(customer => customer.id === id) || null;
  }

  async createCustomer(data: CustomerMasterFormData): Promise<CustomerMaster> {
    await this.delay(800);
    
    // Get company name if company_id is provided
    let company_name: string | undefined;
    if (data.company_id) {
      // In a real app, this would fetch from company service
      const companyMap: Record<string, string> = {
        '1': 'TechCorp Solutions',
        '2': 'HealthFirst Medical',
        '3': 'GreenEnergy Inc',
        '4': 'FinanceFlow Systems',
        '5': 'EduTech Learning'
      };
      company_name = companyMap[data.company_id];
    }
    
    const newCustomer: CustomerMaster = {
      id: `customer_${Date.now()}`,
      ...data,
      company_name,
      tenant_id: 'tenant_1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current_user@company.com'
    };

    mockCustomers.unshift(newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: string, data: Partial<CustomerMasterFormData>): Promise<CustomerMaster> {
    await this.delay(600);
    
    const index = mockCustomers.findIndex(customer => customer.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }

    // Update company name if company_id changed
    let company_name = mockCustomers[index].company_name;
    if (data.company_id !== undefined) {
      const companyMap: Record<string, string> = {
        '1': 'TechCorp Solutions',
        '2': 'HealthFirst Medical',
        '3': 'GreenEnergy Inc',
        '4': 'FinanceFlow Systems',
        '5': 'EduTech Learning'
      };
      company_name = data.company_id ? companyMap[data.company_id] : undefined;
    }

    const updatedCustomer = {
      ...mockCustomers[index],
      ...data,
      company_name,
      updated_at: new Date().toISOString()
    };

    mockCustomers[index] = updatedCustomer;
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.delay(400);
    
    const index = mockCustomers.findIndex(customer => customer.id === id);
    if (index === -1) {
      throw new Error('Customer not found');
    }

    mockCustomers.splice(index, 1);
  }

  async getCustomerOptions(search?: string): Promise<{ value: string; label: string; type: string; }[]> {
    await this.delay(200);
    
    let customers = mockCustomers.filter(customer => customer.status === 'active');
    
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    }

    return customers.map(customer => ({
      value: customer.id,
      label: `${customer.name} (${customer.email})`,
      type: customer.customer_type
    }));
  }

  async exportCustomers(filters: CustomerMasterFilters = {}): Promise<Blob> {
    await this.delay(1000);
    
    const response = await this.getCustomers(1, 1000, filters);
    const customers = response.data;
    
    const csvHeaders = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Company',
      'Customer Type',
      'Status',
      'Credit Limit',
      'Payment Terms',
      'Tax ID',
      'Address',
      'Created At'
    ];
    
    const csvRows = customers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone,
      customer.company_name || '',
      customer.customer_type,
      customer.status,
      customer.credit_limit?.toString() || '0',
      customer.payment_terms || '',
      customer.tax_id || '',
      customer.address,
      new Date(customer.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}

export const customerMasterService = new CustomerMasterService();