import { JobWork, JobWorkFilters, JobWorkStats, JobWorkFormData, JobWorkUpdateData, JobWorkPriceCalculation } from '@/types/jobWork';
import { authService } from './authService';

class JobWorkService {
  private baseUrl = '/api/job-works';

  // Mock data for demonstration
  private mockJobWorks: JobWork[] = [
    {
      id: '1',
      job_ref_id: 'TECH-20240128-000001',
      customer_id: '1',
      customer_name: 'TechCorp Solutions',
      customer_short_name: 'TECH',
      product_id: '1',
      product_name: 'Industrial Motor Assembly',
      pieces: 5,
      size: 'Large',
      default_price: 1500,
      manual_price: 1400,
      final_price: 7000, // 5 pieces * 1400
      receiver_engineer_id: '3',
      receiver_engineer_name: 'Mike Engineer',
      comments: 'Urgent delivery required for production line repair',
      status: 'in_progress',
      tenant_id: 'tenant_1',
      created_at: '2024-01-28T09:00:00Z',
      updated_at: '2024-01-28T10:30:00Z'
    },
    {
      id: '2',
      job_ref_id: 'GLOB-20240127-000002',
      customer_id: '2',
      customer_name: 'Global Manufacturing Inc',
      customer_short_name: 'GLOB',
      product_id: '2',
      product_name: 'Conveyor Belt Component',
      pieces: 10,
      size: 'Medium',
      default_price: 800,
      final_price: 8000, // 10 pieces * 800
      receiver_engineer_id: '4',
      receiver_engineer_name: 'Sarah Engineer',
      comments: 'Standard maintenance replacement parts',
      status: 'completed',
      tenant_id: 'tenant_1',
      created_at: '2024-01-27T14:00:00Z',
      updated_at: '2024-01-28T16:00:00Z',
      completed_at: '2024-01-28T16:00:00Z'
    },
    {
      id: '3',
      job_ref_id: 'STAR-20240126-000003',
      customer_id: '3',
      customer_name: 'StartupXYZ',
      customer_short_name: 'STAR',
      product_id: '3',
      product_name: 'Control System Module',
      pieces: 2,
      size: 'Small',
      default_price: 2000,
      final_price: 4000, // 2 pieces * 2000
      receiver_engineer_id: '3',
      receiver_engineer_name: 'Mike Engineer',
      comments: 'Custom configuration required',
      status: 'delivered',
      tenant_id: 'tenant_1',
      created_at: '2024-01-26T10:00:00Z',
      updated_at: '2024-01-27T18:00:00Z',
      completed_at: '2024-01-27T15:00:00Z',
      delivered_at: '2024-01-27T18:00:00Z'
    },
    {
      id: '4',
      job_ref_id: 'RETA-20240125-000004',
      customer_id: '4',
      customer_name: 'Retail Giants Ltd',
      customer_short_name: 'RETA',
      product_id: '1',
      product_name: 'Industrial Motor Assembly',
      pieces: 3,
      size: 'Medium',
      default_price: 1200,
      final_price: 3600, // 3 pieces * 1200
      receiver_engineer_id: '4',
      receiver_engineer_name: 'Sarah Engineer',
      comments: 'Quality inspection required before delivery',
      status: 'pending',
      tenant_id: 'tenant_1',
      created_at: '2024-01-25T09:00:00Z',
      updated_at: '2024-01-25T09:00:00Z'
    }
  ];

  async getJobWorks(filters?: JobWorkFilters): Promise<JobWork[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let jobWorks = this.mockJobWorks.filter(jw => jw.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'engineer') {
      jobWorks = jobWorks.filter(jw => jw.receiver_engineer_id === user.id);
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        jobWorks = jobWorks.filter(jw => jw.status === filters.status);
      }
      if (filters.customer_id) {
        jobWorks = jobWorks.filter(jw => jw.customer_id === filters.customer_id);
      }
      if (filters.product_id) {
        jobWorks = jobWorks.filter(jw => jw.product_id === filters.product_id);
      }
      if (filters.receiver_engineer) {
        jobWorks = jobWorks.filter(jw => jw.receiver_engineer_id === filters.receiver_engineer);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        jobWorks = jobWorks.filter(jw => 
          jw.job_ref_id.toLowerCase().includes(search) ||
          jw.customer_name?.toLowerCase().includes(search) ||
          jw.product_name?.toLowerCase().includes(search) ||
          jw.comments?.toLowerCase().includes(search)
        );
      }
      if (filters.date_from) {
        jobWorks = jobWorks.filter(jw => jw.created_at >= filters.date_from!);
      }
      if (filters.date_to) {
        jobWorks = jobWorks.filter(jw => jw.created_at <= filters.date_to!);
      }
    }

    return jobWorks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getJobWork(id: string): Promise<JobWork> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const jobWork = this.mockJobWorks.find(jw => 
      jw.id === id && jw.tenant_id === user.tenant_id
    );

    if (!jobWork) {
      throw new Error('Job work not found');
    }

    // Check permissions
    if (user.role === 'engineer' && jobWork.receiver_engineer_id !== user.id) {
      throw new Error('Access denied');
    }

    return jobWork;
  }

  async createJobWork(jobWorkData: JobWorkFormData): Promise<JobWork> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    // Generate job reference ID
    const customer = await this.getCustomerShortName(jobWorkData.customer_id);
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = String(this.mockJobWorks.length + 1).padStart(6, '0');
    const jobRefId = `${customer.short_name}-${dateStr}-${sequence}`;

    // Calculate price
    const priceCalc = await this.calculatePrice(jobWorkData.product_id, jobWorkData.pieces, jobWorkData.size);
    const finalPrice = (jobWorkData.manual_price || priceCalc.calculated_price) * jobWorkData.pieces;

    const newJobWork: JobWork = {
      id: Date.now().toString(),
      job_ref_id: jobRefId,
      customer_id: jobWorkData.customer_id,
      customer_name: customer.name,
      customer_short_name: customer.short_name,
      product_id: jobWorkData.product_id,
      pieces: jobWorkData.pieces,
      size: jobWorkData.size,
      default_price: priceCalc.calculated_price,
      manual_price: jobWorkData.manual_price,
      final_price: finalPrice,
      receiver_engineer_id: jobWorkData.receiver_engineer_id,
      comments: jobWorkData.comments,
      status: 'pending',
      tenant_id: user.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockJobWorks.push(newJobWork);
    return newJobWork;
  }

  async updateJobWork(id: string, updates: JobWorkUpdateData): Promise<JobWork> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const jobWorkIndex = this.mockJobWorks.findIndex(jw => 
      jw.id === id && jw.tenant_id === user.tenant_id
    );

    if (jobWorkIndex === -1) {
      throw new Error('Job work not found');
    }

    const jobWork = this.mockJobWorks[jobWorkIndex];

    // Check permissions for engineers
    if (user.role === 'engineer' && jobWork.receiver_engineer_id !== user.id) {
      throw new Error('Access denied');
    }

    // Auto-set completion/delivery timestamps
    if (updates.status === 'completed' && jobWork.status !== 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    if (updates.status === 'delivered' && jobWork.status !== 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    // Recalculate price if pieces or manual price changed
    let finalPrice = jobWork.final_price;
    if (updates.pieces !== undefined || updates.manual_price !== undefined) {
      const pieces = updates.pieces || jobWork.pieces;
      const price = updates.manual_price || jobWork.manual_price || jobWork.default_price;
      finalPrice = price * pieces;
    }

    this.mockJobWorks[jobWorkIndex] = {
      ...jobWork,
      ...updates,
      final_price: finalPrice,
      updated_at: new Date().toISOString()
    };

    return this.mockJobWorks[jobWorkIndex];
  }

  async deleteJobWork(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('delete')) {
      throw new Error('Insufficient permissions');
    }

    const jobWorkIndex = this.mockJobWorks.findIndex(jw => 
      jw.id === id && jw.tenant_id === user.tenant_id
    );

    if (jobWorkIndex === -1) {
      throw new Error('Job work not found');
    }

    this.mockJobWorks.splice(jobWorkIndex, 1);
  }

  async calculatePrice(productId: string, pieces: number, size: string): Promise<JobWorkPriceCalculation> {
    await new Promise(resolve => setTimeout(resolve, 200));

    // Mock price calculation logic
    const basePrice = 1000; // Base price from product master
    const sizeMultipliers = {
      'Small': 0.8,
      'Medium': 1.0,
      'Large': 1.3,
      'Extra Large': 1.6
    };

    const sizeMultiplier = sizeMultipliers[size as keyof typeof sizeMultipliers] || 1.0;
    const calculatedPrice = Math.round(basePrice * sizeMultiplier);

    return {
      base_price: basePrice,
      pieces_multiplier: pieces,
      size_multiplier: sizeMultiplier,
      calculated_price: calculatedPrice
    };
  }

  async getJobWorkStats(): Promise<JobWorkStats> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let jobWorks = this.mockJobWorks.filter(jw => jw.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'engineer') {
      jobWorks = jobWorks.filter(jw => jw.receiver_engineer_id === user.id);
    }

    const stats: JobWorkStats = {
      total: jobWorks.length,
      pending: jobWorks.filter(jw => jw.status === 'pending').length,
      in_progress: jobWorks.filter(jw => jw.status === 'in_progress').length,
      completed: jobWorks.filter(jw => jw.status === 'completed').length,
      delivered: jobWorks.filter(jw => jw.status === 'delivered').length,
      total_value: jobWorks.reduce((sum, jw) => sum + jw.final_price, 0),
      avg_pieces_per_job: jobWorks.length > 0 ? Math.round(jobWorks.reduce((sum, jw) => sum + jw.pieces, 0) / jobWorks.length) : 0,
      avg_job_value: jobWorks.length > 0 ? Math.round(jobWorks.reduce((sum, jw) => sum + jw.final_price, 0) / jobWorks.length) : 0
    };

    return stats;
  }

  async getJobWorkStatuses(): Promise<string[]> {
    return ['pending', 'in_progress', 'completed', 'delivered'];
  }

  async getSizes(): Promise<string[]> {
    return ['Small', 'Medium', 'Large', 'Extra Large'];
  }

  async getEngineers(): Promise<Array<{ id: string; name: string; }>> {
    // Mock engineers data - in real app, this would come from user service
    return [
      { id: '3', name: 'Mike Engineer' },
      { id: '4', name: 'Sarah Engineer' },
      { id: '5', name: 'David Engineer' },
      { id: '6', name: 'Lisa Engineer' }
    ];
  }

  private async getCustomerShortName(customerId: string): Promise<{ name: string; short_name: string; }> {
    // Mock customer data - in real app, this would come from customer service
    const customers = {
      '1': { name: 'TechCorp Solutions', short_name: 'TECH' },
      '2': { name: 'Global Manufacturing Inc', short_name: 'GLOB' },
      '3': { name: 'StartupXYZ', short_name: 'STAR' },
      '4': { name: 'Retail Giants Ltd', short_name: 'RETA' }
    };
    
    return customers[customerId as keyof typeof customers] || { name: 'Unknown', short_name: 'UNK' };
  }
}

export const jobWorkService = new JobWorkService();