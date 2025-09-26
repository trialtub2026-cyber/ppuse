import { Company, CompanyFormData, CompanyFilters, MasterDataResponse } from '@/types/masters';

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    address: '123 Innovation Drive, Silicon Valley, CA 94025',
    phone: '+1-555-0123',
    email: 'contact@techcorp.com',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: 'enterprise',
    status: 'active',
    description: 'Leading provider of enterprise software solutions',
    logo_url: 'https://via.placeholder.com/100x100?text=TC',
    tenant_id: 'tenant_1',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    created_by: 'admin@company.com'
  },
  {
    id: '2',
    name: 'HealthFirst Medical',
    address: '456 Medical Center Blvd, Boston, MA 02101',
    phone: '+1-555-0456',
    email: 'info@healthfirst.com',
    website: 'https://healthfirst.com',
    industry: 'Healthcare',
    size: 'large',
    status: 'active',
    description: 'Comprehensive healthcare services provider',
    tenant_id: 'tenant_1',
    created_at: '2024-01-16T09:30:00Z',
    updated_at: '2024-01-16T09:30:00Z',
    created_by: 'admin@company.com'
  },
  {
    id: '3',
    name: 'GreenEnergy Inc',
    address: '789 Renewable Way, Austin, TX 78701',
    phone: '+1-555-0789',
    email: 'contact@greenenergy.com',
    website: 'https://greenenergy.com',
    industry: 'Energy',
    size: 'medium',
    status: 'prospect',
    description: 'Sustainable energy solutions for businesses',
    tenant_id: 'tenant_1',
    created_at: '2024-01-17T14:15:00Z',
    updated_at: '2024-01-17T14:15:00Z',
    created_by: 'manager@company.com'
  },
  {
    id: '4',
    name: 'FinanceFlow Systems',
    address: '321 Wall Street, New York, NY 10005',
    phone: '+1-555-0321',
    email: 'hello@financeflow.com',
    website: 'https://financeflow.com',
    industry: 'Finance',
    size: 'large',
    status: 'active',
    description: 'Financial management and analytics platform',
    tenant_id: 'tenant_1',
    created_at: '2024-01-18T11:45:00Z',
    updated_at: '2024-01-18T11:45:00Z',
    created_by: 'admin@company.com'
  },
  {
    id: '5',
    name: 'EduTech Learning',
    address: '654 Campus Drive, Seattle, WA 98101',
    phone: '+1-555-0654',
    email: 'support@edutech.com',
    website: 'https://edutech.com',
    industry: 'Education',
    size: 'small',
    status: 'active',
    description: 'Online learning platform for professionals',
    tenant_id: 'tenant_1',
    created_at: '2024-01-19T08:20:00Z',
    updated_at: '2024-01-19T08:20:00Z',
    created_by: 'manager@company.com'
  }
];

class CompanyService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getCompanies(
    page: number = 1,
    limit: number = 10,
    filters: CompanyFilters = {}
  ): Promise<MasterDataResponse<Company>> {
    await this.delay(500); 

    let filteredCompanies = [...mockCompanies];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredCompanies = filteredCompanies.filter(company =>
        company.name.toLowerCase().includes(searchLower) ||
        company.email.toLowerCase().includes(searchLower) ||
        company.industry.toLowerCase().includes(searchLower)
      );
    }

    if (filters.industry) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.industry === filters.industry
      );
    }

    if (filters.size) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.size === filters.size
      );
    }

    if (filters.status) {
      filteredCompanies = filteredCompanies.filter(company => 
        company.status === filters.status
      );
    }

    const total = filteredCompanies.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

    return {
      data: paginatedCompanies,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getCompanyById(id: string): Promise<Company | null> {
    await this.delay(300);
    return mockCompanies.find(company => company.id === id) || null;
  }

  async createCompany(data: CompanyFormData): Promise<Company> {
    await this.delay(800);
    
    const newCompany: Company = {
      id: `company_${Date.now()}`,
      ...data,
      tenant_id: 'tenant_1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'current_user@company.com'
    };

    mockCompanies.unshift(newCompany);
    return newCompany;
  }

  async updateCompany(id: string, data: Partial<CompanyFormData>): Promise<Company> {
    await this.delay(600);
    
    const index = mockCompanies.findIndex(company => company.id === id);
    if (index === -1) {
      throw new Error('Company not found');
    }

    const updatedCompany = {
      ...mockCompanies[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    mockCompanies[index] = updatedCompany;
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<void> {
    await this.delay(400);
    
    const index = mockCompanies.findIndex(company => company.id === id);
    if (index === -1) {
      throw new Error('Company not found');
    }

    mockCompanies.splice(index, 1);
  }

  async getCompanyOptions(search?: string): Promise<{ value: string; label: string; }[]> {
    await this.delay(200);
    
    let companies = mockCompanies.filter(company => company.status === 'active');
    
    if (search) {
      const searchLower = search.toLowerCase();
      companies = companies.filter(company =>
        company.name.toLowerCase().includes(searchLower)
      );
    }

    return companies.map(company => ({
      value: company.id,
      label: company.name
    }));
  }

  async exportCompanies(filters: CompanyFilters = {}): Promise<Blob> {
    await this.delay(1000);
    
    const response = await this.getCompanies(1, 1000, filters);
    const companies = response.data;
    
    const csvHeaders = [
      'ID',
      'Name',
      'Industry',
      'Size',
      'Status',
      'Email',
      'Phone',
      'Website',
      'Address',
      'Created At'
    ];
    
    const csvRows = companies.map(company => [
      company.id,
      company.name,
      company.industry,
      company.size,
      company.status,
      company.email,
      company.phone,
      company.website || '',
      company.address,
      new Date(company.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}

export const companyService = new CompanyService();