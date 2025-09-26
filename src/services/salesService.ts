import { Deal } from '@/types/crm';
import { authService } from './authService';

class SalesService {
  private baseUrl = '/api/deals';

  // Mock data for demonstration
  private mockDeals: Deal[] = [
    {
      id: '1',
      title: 'Enterprise Software License',
      customer_id: '1',
      customer_name: 'TechCorp Solutions',
      value: 150000,
      currency: 'USD',
      stage: 'negotiation',
      probability: 75,
      expected_close_date: '2024-02-15',
      description: 'Annual enterprise software license with premium support',
      assigned_to: '2',
      assigned_to_name: 'Sarah Manager',
      tenant_id: 'tenant_1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-28T14:30:00Z'
    },
    {
      id: '2',
      title: 'Manufacturing Equipment',
      customer_id: '2',
      customer_name: 'Global Manufacturing Inc',
      value: 75000,
      currency: 'USD',
      stage: 'proposal',
      probability: 60,
      expected_close_date: '2024-02-28',
      description: 'Custom manufacturing equipment with installation',
      assigned_to: '3',
      assigned_to_name: 'Mike Agent',
      tenant_id: 'tenant_1',
      created_at: '2024-01-10T09:15:00Z',
      updated_at: '2024-01-25T16:45:00Z'
    },
    {
      id: '3',
      title: 'Startup Package',
      customer_id: '3',
      customer_name: 'StartupXYZ',
      value: 25000,
      currency: 'USD',
      stage: 'qualified',
      probability: 40,
      expected_close_date: '2024-03-10',
      description: 'Startup package with consulting services',
      assigned_to: '2',
      assigned_to_name: 'Sarah Manager',
      tenant_id: 'tenant_1',
      created_at: '2024-01-25T11:20:00Z',
      updated_at: '2024-01-26T09:30:00Z'
    },
    {
      id: '4',
      title: 'Retail Integration Platform',
      customer_id: '4',
      customer_name: 'Retail Giants Ltd',
      value: 200000,
      currency: 'USD',
      stage: 'closed_won',
      probability: 100,
      expected_close_date: '2024-01-30',
      description: 'Complete retail integration platform with analytics',
      assigned_to: '1',
      assigned_to_name: 'John Admin',
      tenant_id: 'tenant_1',
      created_at: '2024-01-05T08:30:00Z',
      updated_at: '2024-01-30T17:00:00Z'
    },
    {
      id: '5',
      title: 'Cloud Migration Services',
      customer_id: '1',
      customer_name: 'TechCorp Solutions',
      value: 85000,
      currency: 'USD',
      stage: 'lead',
      probability: 20,
      expected_close_date: '2024-04-15',
      description: 'Complete cloud migration and optimization services',
      assigned_to: '3',
      assigned_to_name: 'Mike Agent',
      tenant_id: 'tenant_1',
      created_at: '2024-01-28T15:45:00Z',
      updated_at: '2024-01-28T15:45:00Z'
    }
  ];

  async getDeals(filters?: {
    stage?: string;
    assigned_to?: string;
    customer_id?: string;
    search?: string;
  }): Promise<Deal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let deals = this.mockDeals.filter(d => d.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'agent') {
      deals = deals.filter(d => d.assigned_to === user.id);
    }

    // Apply filters
    if (filters) {
      if (filters.stage) {
        deals = deals.filter(d => d.stage === filters.stage);
      }
      if (filters.assigned_to) {
        deals = deals.filter(d => d.assigned_to === filters.assigned_to);
      }
      if (filters.customer_id) {
        deals = deals.filter(d => d.customer_id === filters.customer_id);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        deals = deals.filter(d => 
          d.title.toLowerCase().includes(search) ||
          d.customer_name?.toLowerCase().includes(search) ||
          d.description.toLowerCase().includes(search)
        );
      }
    }

    return deals;
  }

  async getDeal(id: string): Promise<Deal> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const deal = this.mockDeals.find(d => 
      d.id === id && d.tenant_id === user.tenant_id
    );

    if (!deal) {
      throw new Error('Deal not found');
    }

    // Check permissions
    if (user.role === 'agent' && deal.assigned_to !== user.id) {
      throw new Error('Access denied');
    }

    return deal;
  }

  async createDeal(dealData: Omit<Deal, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Deal> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const newDeal: Deal = {
      ...dealData,
      id: Date.now().toString(),
      tenant_id: user.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockDeals.push(newDeal);
    return newDeal;
  }

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const dealIndex = this.mockDeals.findIndex(d => 
      d.id === id && d.tenant_id === user.tenant_id
    );

    if (dealIndex === -1) {
      throw new Error('Deal not found');
    }

    // Check permissions
    if (user.role === 'agent' && this.mockDeals[dealIndex].assigned_to !== user.id) {
      throw new Error('Access denied');
    }

    this.mockDeals[dealIndex] = {
      ...this.mockDeals[dealIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockDeals[dealIndex];
  }

  async deleteDeal(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('delete')) {
      throw new Error('Insufficient permissions');
    }

    const dealIndex = this.mockDeals.findIndex(d => 
      d.id === id && d.tenant_id === user.tenant_id
    );

    if (dealIndex === -1) {
      throw new Error('Deal not found');
    }

    this.mockDeals.splice(dealIndex, 1);
  }

  async getStages(): Promise<string[]> {
    return ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  }

  async getPipelineStats(): Promise<{
    stage: string;
    count: number;
    value: number;
  }[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let deals = this.mockDeals.filter(d => d.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'agent') {
      deals = deals.filter(d => d.assigned_to === user.id);
    }

    const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    
    return stages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, deal) => sum + deal.value, 0)
      };
    });
  }
}

export const salesService = new SalesService();