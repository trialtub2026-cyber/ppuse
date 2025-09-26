import { Ticket } from '@/types/crm';
import { authService } from './authService';

class TicketService {
  private baseUrl = '/api/tickets';

  // Mock data for demonstration
  private mockTickets: Ticket[] = [
    {
      id: '1',
      title: 'Login Issues with Enterprise Portal',
      description: 'Users are experiencing intermittent login failures on the enterprise portal. The issue seems to occur during peak hours.',
      customer_id: '1',
      customer_name: 'TechCorp Solutions',
      status: 'in_progress',
      priority: 'high',
      category: 'technical',
      assigned_to: '3',
      assigned_to_name: 'Mike Agent',
      tenant_id: 'tenant_1',
      created_at: '2024-01-28T09:15:00Z',
      updated_at: '2024-01-28T14:30:00Z'
    },
    {
      id: '2',
      title: 'Billing Discrepancy',
      description: 'Customer reports incorrect charges on their monthly invoice. Need to review billing calculations.',
      customer_id: '2',
      customer_name: 'Global Manufacturing Inc',
      status: 'open',
      priority: 'medium',
      category: 'billing',
      assigned_to: '2',
      assigned_to_name: 'Sarah Manager',
      tenant_id: 'tenant_1',
      created_at: '2024-01-27T16:45:00Z',
      updated_at: '2024-01-27T16:45:00Z'
    },
    {
      id: '3',
      title: 'Feature Request: Advanced Analytics',
      description: 'Customer requesting advanced analytics dashboard with custom reporting capabilities.',
      customer_id: '3',
      customer_name: 'StartupXYZ',
      status: 'pending',
      priority: 'low',
      category: 'feature_request',
      assigned_to: '1',
      assigned_to_name: 'John Admin',
      tenant_id: 'tenant_1',
      created_at: '2024-01-26T11:20:00Z',
      updated_at: '2024-01-27T09:30:00Z'
    },
    {
      id: '4',
      title: 'Integration Setup Assistance',
      description: 'Customer needs help setting up API integration with their existing systems.',
      customer_id: '4',
      customer_name: 'Retail Giants Ltd',
      status: 'resolved',
      priority: 'medium',
      category: 'technical',
      assigned_to: '3',
      assigned_to_name: 'Mike Agent',
      tenant_id: 'tenant_1',
      created_at: '2024-01-25T08:30:00Z',
      updated_at: '2024-01-26T17:00:00Z',
      resolved_at: '2024-01-26T17:00:00Z'
    },
    {
      id: '5',
      title: 'Account Access Request',
      description: 'New employee needs access to the customer portal with specific permissions.',
      customer_id: '1',
      customer_name: 'TechCorp Solutions',
      status: 'closed',
      priority: 'low',
      category: 'general',
      assigned_to: '2',
      assigned_to_name: 'Sarah Manager',
      tenant_id: 'tenant_1',
      created_at: '2024-01-24T15:45:00Z',
      updated_at: '2024-01-25T10:15:00Z',
      resolved_at: '2024-01-25T10:15:00Z'
    },
    {
      id: '6',
      title: 'System Performance Issues',
      description: 'Customer reporting slow response times during data processing operations.',
      customer_id: '2',
      customer_name: 'Global Manufacturing Inc',
      status: 'open',
      priority: 'urgent',
      category: 'technical',
      assigned_to: '1',
      assigned_to_name: 'John Admin',
      tenant_id: 'tenant_1',
      created_at: '2024-01-29T07:20:00Z',
      updated_at: '2024-01-29T07:20:00Z'
    }
  ];

  async getTickets(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    assigned_to?: string;
    customer_id?: string;
    search?: string;
  }): Promise<Ticket[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let tickets = this.mockTickets.filter(t => t.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'agent') {
      tickets = tickets.filter(t => t.assigned_to === user.id);
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        tickets = tickets.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        tickets = tickets.filter(t => t.priority === filters.priority);
      }
      if (filters.category) {
        tickets = tickets.filter(t => t.category === filters.category);
      }
      if (filters.assigned_to) {
        tickets = tickets.filter(t => t.assigned_to === filters.assigned_to);
      }
      if (filters.customer_id) {
        tickets = tickets.filter(t => t.customer_id === filters.customer_id);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        tickets = tickets.filter(t => 
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.customer_name?.toLowerCase().includes(search)
        );
      }
    }

    return tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getTicket(id: string): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const ticket = this.mockTickets.find(t => 
      t.id === id && t.tenant_id === user.tenant_id
    );

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Check permissions
    if (user.role === 'agent' && ticket.assigned_to !== user.id) {
      throw new Error('Access denied');
    }

    return ticket;
  }

  async createTicket(ticketData: Omit<Ticket, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      tenant_id: user.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockTickets.push(newTicket);
    return newTicket;
  }

  async updateTicket(id: string, updates: Partial<Ticket>): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const ticketIndex = this.mockTickets.findIndex(t => 
      t.id === id && t.tenant_id === user.tenant_id
    );

    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }

    // Check permissions
    if (user.role === 'agent' && this.mockTickets[ticketIndex].assigned_to !== user.id) {
      throw new Error('Access denied');
    }

    // Auto-set resolved_at when status changes to resolved
    if (updates.status === 'resolved' && this.mockTickets[ticketIndex].status !== 'resolved') {
      updates.resolved_at = new Date().toISOString();
    }

    this.mockTickets[ticketIndex] = {
      ...this.mockTickets[ticketIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockTickets[ticketIndex];
  }

  async deleteTicket(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('delete')) {
      throw new Error('Insufficient permissions');
    }

    const ticketIndex = this.mockTickets.findIndex(t => 
      t.id === id && t.tenant_id === user.tenant_id
    );

    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }

    this.mockTickets.splice(ticketIndex, 1);
  }

  async getStatuses(): Promise<string[]> {
    return ['open', 'in_progress', 'pending', 'resolved', 'closed'];
  }

  async getPriorities(): Promise<string[]> {
    return ['low', 'medium', 'high', 'urgent'];
  }

  async getCategories(): Promise<string[]> {
    return ['technical', 'billing', 'general', 'feature_request'];
  }

  async getTicketStats(): Promise<{
    status: string;
    count: number;
  }[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let tickets = this.mockTickets.filter(t => t.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'agent') {
      tickets = tickets.filter(t => t.assigned_to === user.id);
    }

    const statuses = ['open', 'in_progress', 'pending', 'resolved', 'closed'];
    
    return statuses.map(status => ({
      status,
      count: tickets.filter(t => t.status === status).length
    }));
  }
}

export const ticketService = new TicketService();