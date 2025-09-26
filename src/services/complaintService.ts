import { Complaint, ComplaintComment, ComplaintFilters, ComplaintStats, ComplaintFormData, ComplaintUpdateData } from '@/types/complaints';
import { authService } from './authService';

class ComplaintService {
  private baseUrl = '/api/complaints';

  // Mock data for demonstration
  private mockComplaints: Complaint[] = [
    {
      id: '1',
      title: 'Production Line Breakdown - Assembly Unit 3',
      description: 'Assembly unit 3 has stopped working completely. Production is halted and urgent repair is needed.',
      customer_id: '1',
      customer_name: 'TechCorp Solutions',
      type: 'breakdown',
      status: 'in_progress',
      priority: 'urgent',
      assigned_engineer_id: '3',
      assigned_engineer_name: 'Mike Engineer',
      engineer_resolution: '',
      comments: [
        {
          id: 'c1',
          complaint_id: '1',
          user_id: '1',
          user_name: 'John Admin',
          user_role: 'admin',
          content: 'Complaint received and assigned to Mike Engineer for immediate attention.',
          created_at: '2024-01-28T09:15:00Z'
        },
        {
          id: 'c2',
          complaint_id: '1',
          user_id: '3',
          user_name: 'Mike Engineer',
          user_role: 'engineer',
          content: 'On-site inspection completed. Issue identified as motor failure. Replacement parts ordered.',
          created_at: '2024-01-28T11:30:00Z'
        }
      ],
      tenant_id: 'tenant_1',
      created_at: '2024-01-28T09:00:00Z',
      updated_at: '2024-01-28T11:30:00Z'
    },
    {
      id: '2',
      title: 'Preventive Maintenance - Conveyor System',
      description: 'Scheduled preventive maintenance for conveyor system to prevent future breakdowns.',
      customer_id: '2',
      customer_name: 'Global Manufacturing Inc',
      type: 'preventive',
      status: 'new',
      priority: 'medium',
      assigned_engineer_id: '4',
      assigned_engineer_name: 'Sarah Engineer',
      engineer_resolution: '',
      comments: [
        {
          id: 'c3',
          complaint_id: '2',
          user_id: '2',
          user_name: 'Sarah Manager',
          user_role: 'manager',
          content: 'Preventive maintenance scheduled for next week.',
          created_at: '2024-01-27T14:20:00Z'
        }
      ],
      tenant_id: 'tenant_1',
      created_at: '2024-01-27T14:00:00Z',
      updated_at: '2024-01-27T14:20:00Z'
    },
    {
      id: '3',
      title: 'Software Update - Control System v2.1',
      description: 'Update control system software to latest version v2.1 with enhanced features.',
      customer_id: '3',
      customer_name: 'StartupXYZ',
      type: 'software_update',
      status: 'closed',
      priority: 'low',
      assigned_engineer_id: '3',
      assigned_engineer_name: 'Mike Engineer',
      engineer_resolution: 'Software successfully updated to v2.1. All systems tested and working properly. Customer training provided.',
      comments: [
        {
          id: 'c4',
          complaint_id: '3',
          user_id: '3',
          user_name: 'Mike Engineer',
          user_role: 'engineer',
          content: 'Software update completed successfully. System is now running v2.1.',
          created_at: '2024-01-26T16:45:00Z'
        }
      ],
      tenant_id: 'tenant_1',
      created_at: '2024-01-26T10:00:00Z',
      updated_at: '2024-01-26T17:00:00Z',
      closed_at: '2024-01-26T17:00:00Z'
    },
    {
      id: '4',
      title: 'System Optimization - Performance Enhancement',
      description: 'Optimize system performance to improve efficiency and reduce energy consumption.',
      customer_id: '4',
      customer_name: 'Retail Giants Ltd',
      type: 'optimize',
      status: 'in_progress',
      priority: 'high',
      assigned_engineer_id: '4',
      assigned_engineer_name: 'Sarah Engineer',
      engineer_resolution: '',
      comments: [
        {
          id: 'c5',
          complaint_id: '4',
          user_id: '4',
          user_name: 'Sarah Engineer',
          user_role: 'engineer',
          content: 'Performance analysis completed. Implementing optimization strategies.',
          created_at: '2024-01-25T13:30:00Z'
        }
      ],
      tenant_id: 'tenant_1',
      created_at: '2024-01-25T09:00:00Z',
      updated_at: '2024-01-25T13:30:00Z'
    }
  ];

  private mockComments: ComplaintComment[] = [];

  async getComplaints(filters?: ComplaintFilters): Promise<Complaint[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let complaints = this.mockComplaints.filter(c => c.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'engineer') {
      complaints = complaints.filter(c => c.assigned_engineer_id === user.id);
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        complaints = complaints.filter(c => c.status === filters.status);
      }
      if (filters.type) {
        complaints = complaints.filter(c => c.type === filters.type);
      }
      if (filters.priority) {
        complaints = complaints.filter(c => c.priority === filters.priority);
      }
      if (filters.assigned_engineer) {
        complaints = complaints.filter(c => c.assigned_engineer_id === filters.assigned_engineer);
      }
      if (filters.customer_id) {
        complaints = complaints.filter(c => c.customer_id === filters.customer_id);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        complaints = complaints.filter(c => 
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search) ||
          c.customer_name?.toLowerCase().includes(search)
        );
      }
      if (filters.date_from) {
        complaints = complaints.filter(c => c.created_at >= filters.date_from!);
      }
      if (filters.date_to) {
        complaints = complaints.filter(c => c.created_at <= filters.date_to!);
      }
    }

    return complaints.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getComplaint(id: string): Promise<Complaint> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const complaint = this.mockComplaints.find(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // Check permissions
    if (user.role === 'engineer' && complaint.assigned_engineer_id !== user.id) {
      throw new Error('Access denied');
    }

    return complaint;
  }

  async createComplaint(complaintData: ComplaintFormData): Promise<Complaint> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const newComplaint: Complaint = {
      ...complaintData,
      id: Date.now().toString(),
      status: 'new',
      comments: [],
      tenant_id: user.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockComplaints.push(newComplaint);
    return newComplaint;
  }

  async updateComplaint(id: string, updates: ComplaintUpdateData): Promise<Complaint> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('write')) {
      throw new Error('Insufficient permissions');
    }

    const complaintIndex = this.mockComplaints.findIndex(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (complaintIndex === -1) {
      throw new Error('Complaint not found');
    }

    const complaint = this.mockComplaints[complaintIndex];

    // Check permissions for engineers
    if (user.role === 'engineer' && complaint.assigned_engineer_id !== user.id) {
      throw new Error('Access denied');
    }

    // Validate status transitions
    if (updates.status) {
      if (updates.status === 'closed' && !updates.engineer_resolution) {
        throw new Error('Engineer resolution is required to close a complaint');
      }
    }

    // Auto-set closed_at when status changes to closed
    if (updates.status === 'closed' && complaint.status !== 'closed') {
      updates.closed_at = new Date().toISOString();
    }

    this.mockComplaints[complaintIndex] = {
      ...complaint,
      ...updates,
      updated_at: new Date().toISOString()
    };

    return this.mockComplaints[complaintIndex];
  }

  async deleteComplaint(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    if (!authService.hasPermission('delete')) {
      throw new Error('Insufficient permissions');
    }

    const complaintIndex = this.mockComplaints.findIndex(c => 
      c.id === id && c.tenant_id === user.tenant_id
    );

    if (complaintIndex === -1) {
      throw new Error('Complaint not found');
    }

    this.mockComplaints.splice(complaintIndex, 1);
  }

  async addComment(complaintId: string, content: string, parentId?: string): Promise<ComplaintComment> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const complaint = await this.getComplaint(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found');
    }

    const newComment: ComplaintComment = {
      id: Date.now().toString(),
      complaint_id: complaintId,
      user_id: user.id,
      user_name: user.name,
      user_role: user.role,
      content,
      created_at: new Date().toISOString(),
      parent_id: parentId
    };

    // Add comment to complaint
    const complaintIndex = this.mockComplaints.findIndex(c => c.id === complaintId);
    if (complaintIndex !== -1) {
      this.mockComplaints[complaintIndex].comments.push(newComment);
      this.mockComplaints[complaintIndex].updated_at = new Date().toISOString();
    }

    return newComment;
  }

  async getComplaintStats(): Promise<ComplaintStats> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let complaints = this.mockComplaints.filter(c => c.tenant_id === user.tenant_id);

    // Apply role-based filtering
    if (user.role === 'engineer') {
      complaints = complaints.filter(c => c.assigned_engineer_id === user.id);
    }

    const stats: ComplaintStats = {
      total: complaints.length,
      new: complaints.filter(c => c.status === 'new').length,
      in_progress: complaints.filter(c => c.status === 'in_progress').length,
      closed: complaints.filter(c => c.status === 'closed').length,
      by_type: {
        breakdown: complaints.filter(c => c.type === 'breakdown').length,
        preventive: complaints.filter(c => c.type === 'preventive').length,
        software_update: complaints.filter(c => c.type === 'software_update').length,
        optimize: complaints.filter(c => c.type === 'optimize').length
      },
      by_priority: {
        low: complaints.filter(c => c.priority === 'low').length,
        medium: complaints.filter(c => c.priority === 'medium').length,
        high: complaints.filter(c => c.priority === 'high').length,
        urgent: complaints.filter(c => c.priority === 'urgent').length
      },
      avg_resolution_time: 24 // Mock average resolution time in hours
    };

    return stats;
  }

  async getComplaintTypes(): Promise<string[]> {
    return ['breakdown', 'preventive', 'software_update', 'optimize'];
  }

  async getComplaintStatuses(): Promise<string[]> {
    return ['new', 'in_progress', 'closed'];
  }

  async getPriorities(): Promise<string[]> {
    return ['low', 'medium', 'high', 'urgent'];
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

  async reopenComplaint(id: string): Promise<Complaint> {
    const updates: ComplaintUpdateData = {
      status: 'new',
      engineer_resolution: undefined
    };
    return this.updateComplaint(id, updates);
  }
}

export const complaintService = new ComplaintService();