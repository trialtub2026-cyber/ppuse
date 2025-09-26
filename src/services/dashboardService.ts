import { DashboardStats } from '@/types/crm';
import { authService } from './authService';
import { customerService } from './customerService';
import { salesService } from './salesService';
import { ticketService } from './ticketService';

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Fetch data from all services
    const [customers, deals, tickets] = await Promise.all([
      customerService.getCustomers(),
      salesService.getDeals(),
      ticketService.getTickets()
    ]);

    // Calculate stats
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const totalDealValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
    const openTickets = tickets.filter(t => ['open', 'in_progress', 'pending'].includes(t.status)).length;

    // Calculate monthly revenue (closed_won deals from current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = deals
      .filter(d => {
        if (d.stage !== 'closed_won') return false;
        const dealDate = new Date(d.updated_at);
        return dealDate.getMonth() === currentMonth && dealDate.getFullYear() === currentYear;
      })
      .reduce((sum, deal) => sum + deal.value, 0);

    // Calculate conversion rate
    const totalDeals = deals.length;
    const wonDeals = deals.filter(d => d.stage === 'closed_won').length;
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    // Calculate average deal size
    const avgDealSize = wonDeals > 0 ? 
      deals.filter(d => d.stage === 'closed_won').reduce((sum, deal) => sum + deal.value, 0) / wonDeals : 0;

    // Calculate average ticket resolution time (in hours)
    const resolvedTickets = tickets.filter(t => t.resolved_at);
    const avgResolutionTime = resolvedTickets.length > 0 ?
      resolvedTickets.reduce((sum, ticket) => {
        const created = new Date(ticket.created_at).getTime();
        const resolved = new Date(ticket.resolved_at!).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60); // Convert to hours
      }, 0) / resolvedTickets.length : 0;

    return {
      total_customers: activeCustomers,
      active_deals: activeDeals.length,
      total_deal_value: totalDealValue,
      open_tickets: openTickets,
      monthly_revenue: monthlyRevenue,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      avg_deal_size: Math.round(avgDealSize),
      ticket_resolution_time: Math.round(avgResolutionTime * 100) / 100
    };
  }

  async getRecentActivity(): Promise<{
    type: 'customer' | 'deal' | 'ticket';
    title: string;
    description: string;
    timestamp: string;
    user: string;
  }[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Mock recent activity data
    const activities = [
      {
        type: 'deal' as const,
        title: 'Deal Updated',
        description: 'Enterprise Software License moved to Negotiation stage',
        timestamp: '2024-01-29T14:30:00Z',
        user: 'Sarah Manager'
      },
      {
        type: 'ticket' as const,
        title: 'New Ticket Created',
        description: 'System Performance Issues reported by Global Manufacturing Inc',
        timestamp: '2024-01-29T07:20:00Z',
        user: 'John Admin'
      },
      {
        type: 'customer' as const,
        title: 'Customer Updated',
        description: 'TechCorp Solutions contact information updated',
        timestamp: '2024-01-28T16:45:00Z',
        user: 'Mike Agent'
      },
      {
        type: 'ticket' as const,
        title: 'Ticket Resolved',
        description: 'Integration Setup Assistance completed for Retail Giants Ltd',
        timestamp: '2024-01-26T17:00:00Z',
        user: 'Mike Agent'
      },
      {
        type: 'deal' as const,
        title: 'Deal Closed',
        description: 'Retail Integration Platform won - $200,000',
        timestamp: '2024-01-25T17:00:00Z',
        user: 'John Admin'
      }
    ];

    return activities.slice(0, 10); // Return last 10 activities
  }

  async getChartData(): Promise<{
    salesPipeline: { stage: string; value: number; count: number }[];
    ticketsByStatus: { status: string; count: number }[];
    monthlyRevenue: { month: string; revenue: number }[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Get pipeline stats
    const pipelineStats = await salesService.getPipelineStats();
    
    // Get ticket stats
    const ticketStats = await ticketService.getTicketStats();

    // Mock monthly revenue data for the last 6 months
    const monthlyRevenue = [
      { month: 'Aug', revenue: 180000 },
      { month: 'Sep', revenue: 220000 },
      { month: 'Oct', revenue: 195000 },
      { month: 'Nov', revenue: 240000 },
      { month: 'Dec', revenue: 280000 },
      { month: 'Jan', revenue: 200000 }
    ];

    return {
      salesPipeline: pipelineStats,
      ticketsByStatus: ticketStats,
      monthlyRevenue
    };
  }
}

export const dashboardService = new DashboardService();