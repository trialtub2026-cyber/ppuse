import { Customer, CustomerTag } from '@/types/crm';
import { authService } from './authService';

class CustomerService {
  private baseUrl = '/api/customers';

  // Mock tags data
  private mockTags: CustomerTag[] = [
    { id: '1', name: 'VIP', color: '#f59e0b' },
    { id: '2', name: 'High Value', color: '#10b981' },
    { id: '3', name: 'New Client', color: '#3b82f6' },
    { id: '4', name: 'At Risk', color: '#ef4444' },
    { id: '5', name: 'Potential Upsell', color: '#8b5cf6' },
    { id: '6', name: 'Long Term', color: '#06b6d4' },
    { id: '7', name: 'Referral Source', color: '#84cc16' },
    { id: '8', name: 'Support Priority', color: '#f97316' }
  ];

  // Mock data for demonstration
  private mockCustomers: Customer[] = [
    {
      id: '1',
      company_name: 'TechCorp Solutions',
      contact_name: 'Alice Johnson',
      email: 'alice@techcorp.com',
      phone: '+1-555-0123',
      address: '123 Tech Street',
      city: 'San Francisco',
      country: 'USA',
      industry: 'Technology',
      size: 'enterprise',
      status: 'active',
      tags: [this.mockTags[0], this.mockTags[1]], // VIP, High Value
      notes: 'Key enterprise client with multiple ongoing projects.',
      tenant_id: 'tenant_1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z',
      assigned_to: '2'
    },
    {
      id: '2',
      company_name: 'Global Manufacturing Inc',
      contact_name: 'Bob Smith',
      email: 'bob@globalmanuf.com',
      phone: '+1-555-0456',
      address: '456 Industrial Ave',
      city: 'Detroit',
      country: 'USA',
      industry: 'Manufacturing',
      size: 'medium',
      status: 'active',
      tags: [this.mockTags[5]], // Long Term
      notes: 'Reliable manufacturing partner for 3+ years.',
      tenant_id: 'tenant_1',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-18T16:45:00Z',
      assigned_to: '3'
    },
    {
      id: '3',
      company_name: 'StartupXYZ',
      contact_name: 'Carol Davis',
      email: 'carol@startupxyz.com',
      phone: '+1-555-0789',
      address: '789 Innovation Blvd',
      city: 'Austin',
      country: 'USA',
      industry: 'Software',
      size: 'startup',
      status: 'prospect',
      tags: [this.mockTags[2], this.mockTags[4]], // New Client, Potential Upsell
      notes: 'Promising startup with growth potential.',
      tenant_id: 'tenant_1',
      created_at: '2024-01-25T11:20:00Z',
      updated_at: '2024-01-25T11:20:00Z',
      assigned_to: '2'
    },
    {
      id: '4',
      company_name: 'Retail Giants Ltd',
      contact_name: 'David Wilson',
      email: 'david@retailgiants.com',
      phone: '+1-555-0321',
      address: '321 Commerce St',
      city: 'New York',
      country: 'USA',
      industry: 'Retail',
      size: 'large',
      status: 'active',
      tags: [this.mockTags[6]], // Referral Source
      notes: 'Major retail client, excellent referral source.',
      tenant_id: 'tenant_1',
      created_at: '2024-01-05T08:30:00Z',
      updated_at: '2024-01-22T13:15:00Z',
      assigned_to: '1'
    }
  ];

  async getCustomers(filters?: {
    status?: string;
    industry?: string;
    size?: string;
    assigned_to?: string;
    search?: string;
    tags?: string[];
  }): Promise<Customer[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let customers = this.mockCustomers.filter(c => c.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'agent') {
      customers = customers.filter(c => c.assigned_to === user.id);
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        customers = customers.filter(c => c.status === filters.status);
      }
      if (filters.industry) {
        customers = customers.filter(c => c.industry === filters.industry);
      }
      if (filters.size) {
        customers = customers.filter(c => c.size === filters.size);
      }
      if (filters.assigned_to) {
        customers = customers.filter(c => c.assigned_to === filters.assigned_to);
      }
      if (filters.tags && filters.tags.length > 0) {
        customers = customers.filter(c => 
          filters.tags!.some(tagId => c.tags.some(tag => tag.id === tagId))
        );
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        customers = customers.filter(c => 
          c.company_name.toLowerCase().includes(search) ||
          c.contact_name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phone.includes(search) ||
          c.industry.toLowerCase().includes(search) ||
          c.city.toLowerCase().includes(search) ||
          c.country.toLowerCase().includes(search) ||
          c.tags.some(tag => tag.name.toLowerCase().includes(search))
        );
      }
    }

    return customers;
  }

  async getCustomer(id: string): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const customer = this.mockCustomers.find(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check permissions
    if (user.role === 'agent' && customer.assigned_to !== user.id) {
      throw new Error('Access denied');
    }

    return customer;
  }

  async createCustomer(customerData: Omit<Customer, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      tenant_id: user.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockCustomers.push(newCustomer);
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const customerIndex = this.mockCustomers.findIndex(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    // Check permissions
    if (user.role === 'agent' && this.mockCustomers[customerIndex].assigned_to !== user.id) {
      throw new Error('Access denied');
    }

    this.mockCustomers[customerIndex] = {
      ...this.mockCustomers[customerIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockCustomers[customerIndex];
  }

  async deleteCustomer(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('delete')) {
      throw new Error('Insufficient permissions');
    }

    const customerIndex = this.mockCustomers.findIndex(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (customerIndex === -1) {
      throw new Error('Customer not found');
    }

    this.mockCustomers.splice(customerIndex, 1);
  }

  async bulkDeleteCustomers(ids: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('delete')) {
      throw new Error('Insufficient permissions');
    }

    this.mockCustomers = this.mockCustomers.filter(c => 
      !ids.includes(c.id) || c.tenant_id !== user.tenant_id
    );
  }

  async bulkUpdateCustomers(ids: string[], updates: Partial<Customer>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    this.mockCustomers = this.mockCustomers.map(c => {
      if (ids.includes(c.id) && c.tenant_id === user.tenant_id) {
        return { ...c, ...updates, updated_at: new Date().toISOString() };
      }
      return c;
    });
  }

  async getTags(): Promise<CustomerTag[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.mockTags;
  }

  async createTag(name: string, color: string): Promise<CustomerTag> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newTag: CustomerTag = {
      id: Date.now().toString(),
      name,
      color
    };

    this.mockTags.push(newTag);
    return newTag;
  }

  async exportCustomers(format: 'csv' | 'json' = 'csv'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const customers = await this.getCustomers();

    if (format === 'csv') {
      const headers = [
        'Company Name', 'Contact Name', 'Email', 'Phone', 'Address', 
        'City', 'Country', 'Industry', 'Size', 'Status', 'Tags', 'Notes', 'Created At'
      ];
      
      const csvData = customers.map(c => [
        c.company_name,
        c.contact_name,
        c.email,
        c.phone,
        c.address,
        c.city,
        c.country,
        c.industry,
        c.size,
        c.status,
        c.tags.map(t => t.name).join('; '),
        c.notes || '',
        new Date(c.created_at).toLocaleDateString()
      ]);

      return [headers, ...csvData].map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');
    } else {
      return JSON.stringify(customers, null, 2);
    }
  }

  async importCustomers(csvData: string): Promise<{ success: number; errors: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    // Mock import processing
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const dataLines = lines.slice(1);

    let success = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const values = dataLines[i].split(',').map(v => v.replace(/"/g, '').trim());
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 2}: Invalid number of columns`);
          continue;
        }

        // Basic validation
        const email = values[headers.indexOf('Email')] || values[2];
        if (!email || !email.includes('@')) {
          errors.push(`Row ${i + 2}: Invalid email address`);
          continue;
        }

        success++;
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error}`);
      }
    }

    return { success, errors };
  }

  async getIndustries(): Promise<string[]> {
    return ['Technology', 'Manufacturing', 'Software', 'Retail', 'Healthcare', 'Finance', 'Education', 'Other'];
  }

  async getSizes(): Promise<string[]> {
    return ['startup', 'small', 'medium', 'enterprise'];
  }
}

export const customerService = new CustomerService();