import cron from 'node-cron';
import { DatabaseService } from './database';
import { NotificationService } from './notificationService';
import { ScheduledJob } from '@/types/notifications';

export class SchedulerService {
  private notificationService: NotificationService;
  private runningJobs = new Map<string, cron.ScheduledTask>();

  constructor() {
    this.notificationService = new NotificationService();
    this.initializeScheduler();
  }

  // Job management
  async createScheduledJob(jobData: Omit<ScheduledJob, 'id' | 'created_at' | 'updated_at'>): Promise<ScheduledJob> {
    try {
      // Validate cron expression
      if (!cron.validate(jobData.cron_expression)) {
        throw new Error('Invalid cron expression');
      }

      // Calculate next run time
      const nextRunAt = this.getNextRunTime(jobData.cron_expression);

      const data = {
        ...jobData,
        next_run_at: nextRunAt,
        run_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const job = await DatabaseService.insert('scheduled_jobs', data);

      // Start the job if it's active
      if (job.is_active) {
        await this.startJob(job);
      }

      return job;
    } catch (error) {
      console.error('Failed to create scheduled job:', error);
      throw error;
    }
  }

  async updateJob(jobId: string, updates: Partial<ScheduledJob>): Promise<ScheduledJob> {
    try {
      const existingJob = await DatabaseService.findById('scheduled_jobs', jobId);
      if (!existingJob) {
        throw new Error('Job not found');
      }

      // Validate cron expression if being updated
      if (updates.cron_expression && !cron.validate(updates.cron_expression)) {
        throw new Error('Invalid cron expression');
      }

      // Calculate new next run time if cron expression changed
      if (updates.cron_expression) {
        updates.next_run_at = this.getNextRunTime(updates.cron_expression);
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const updatedJob = await DatabaseService.update('scheduled_jobs', jobId, updateData);

      // Restart job if it was running and is still active
      if (this.runningJobs.has(jobId)) {
        await this.stopJob(jobId);
      }

      if (updatedJob.is_active) {
        await this.startJob(updatedJob);
      }

      return updatedJob;
    } catch (error) {
      console.error('Failed to update job:', error);
      throw error;
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      // Stop the job if it's running
      await this.stopJob(jobId);

      await DatabaseService.delete('scheduled_jobs', jobId);
    } catch (error) {
      console.error('Failed to delete job:', error);
      throw error;
    }
  }

  async getJob(jobId: string): Promise<ScheduledJob | null> {
    try {
      return await DatabaseService.findById('scheduled_jobs', jobId);
    } catch (error) {
      console.error('Failed to get job:', error);
      return null;
    }
  }

  async listJobs(filters?: {
    job_type?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    jobs: ScheduledJob[];
    total: number;
  }> {
    try {
      let queryFilters: Record<string, any> = {};

      if (filters?.job_type) {
        queryFilters.job_type = filters.job_type;
      }
      if (filters?.is_active !== undefined) {
        queryFilters.is_active = filters.is_active;
      }

      const total = await DatabaseService.count('scheduled_jobs', queryFilters);
      let jobs = await DatabaseService.select('scheduled_jobs', '*', queryFilters);

      // Apply pagination
      if (filters?.offset) {
        jobs = jobs.slice(filters.offset);
      }
      if (filters?.limit) {
        jobs = jobs.slice(0, filters.limit);
      }

      return { jobs, total };
    } catch (error) {
      console.error('Failed to list jobs:', error);
      return { jobs: [], total: 0 };
    }
  }

  // Execution
  async runScheduledJobs(): Promise<void> {
    try {
      // Get all active jobs that are due to run
      const now = new Date().toISOString();
      const dueJobs = await DatabaseService.select('scheduled_jobs', '*', { is_active: true });

      const jobsToRun = dueJobs.filter(job => 
        job.next_run_at && job.next_run_at <= now
      );

      for (const job of jobsToRun) {
        await this.executeJob(job);
      }
    } catch (error) {
      console.error('Failed to run scheduled jobs:', error);
    }
  }

  async executeJob(job: ScheduledJob): Promise<void> {
    try {
      console.log(`Executing job: ${job.job_name} (${job.job_type})`);

      const startTime = new Date();
      let success = false;
      let error: string | null = null;

      try {
        switch (job.job_type) {
          case 'contract_reminder':
            await this.processContractReminders(job);
            break;
          case 'marketing_campaign':
            await this.processMarketingCampaign(job);
            break;
          case 'system_notification':
            await this.processSystemNotification(job);
            break;
          default:
            throw new Error(`Unknown job type: ${job.job_type}`);
        }
        success = true;
      } catch (jobError) {
        error = jobError instanceof Error ? jobError.message : 'Unknown error';
        console.error(`Job execution failed: ${error}`);
      }

      // Update job execution info
      const nextRunAt = this.getNextRunTime(job.cron_expression);
      await DatabaseService.update('scheduled_jobs', job.id, {
        last_run_at: startTime.toISOString(),
        next_run_at: nextRunAt,
        run_count: job.run_count + 1,
        updated_at: new Date().toISOString()
      });

      // Log execution result
      console.log(`Job ${job.job_name} completed. Success: ${success}, Error: ${error}`);

    } catch (error) {
      console.error('Failed to execute job:', error);
    }
  }

  async processContractReminders(job: ScheduledJob): Promise<void> {
    try {
      // Get contracts expiring soon based on target criteria
      const criteria = job.target_criteria || {};
      const daysAhead = criteria.days_ahead || 10;

      // Calculate expiration date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + daysAhead);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      // Query contracts (assuming you have a contracts table)
      // This is a simplified example - adjust based on your actual contract schema
      const expiringContracts = await DatabaseService.select('service_contracts', '*', {
        status: 'active'
      });

      // Filter by expiration date (this would be more efficient with proper SQL)
      const contractsToRemind = expiringContracts.filter(contract => {
        if (!contract.end_date) return false;
        const endDate = new Date(contract.end_date);
        return endDate >= startDate && endDate <= endDate;
      });

      // Send reminders
      for (const contract of contractsToRemind) {
        const variables = {
          customerName: contract.customer_name || 'Customer',
          contractNumber: contract.contract_number || 'N/A',
          expiryDate: new Date(contract.end_date).toLocaleDateString(),
          productName: contract.product_name || 'Service',
          daysRemaining: Math.ceil((new Date(contract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        };

        await this.notificationService.queueNotification({
          templateId: job.template_id,
          recipientId: contract.customer_id || 'unknown',
          channel: 'both',
          variables,
          priority: 'high'
        });
      }

      console.log(`Processed ${contractsToRemind.length} contract reminders`);
    } catch (error) {
      console.error('Failed to process contract reminders:', error);
      throw error;
    }
  }

  async processMarketingCampaign(job: ScheduledJob): Promise<void> {
    try {
      const criteria = job.target_criteria || {};
      
      // Get target users based on criteria
      let targetUsers = await DatabaseService.select('users', '*');

      // Apply filters based on criteria
      if (criteria.user_type) {
        targetUsers = targetUsers.filter(user => user.user_type === criteria.user_type);
      }

      if (criteria.last_login_days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - criteria.last_login_days);
        targetUsers = targetUsers.filter(user => 
          user.last_login && new Date(user.last_login) >= cutoffDate
        );
      }

      // Send marketing messages
      for (const user of targetUsers) {
        const variables = {
          userName: user.name || 'User',
          userEmail: user.email,
          companyName: 'Your Company' // Replace with actual company name
        };

        await this.notificationService.queueNotification({
          templateId: job.template_id,
          recipientId: user.id,
          channel: 'both',
          variables,
          priority: 'normal'
        });
      }

      console.log(`Processed marketing campaign for ${targetUsers.length} users`);
    } catch (error) {
      console.error('Failed to process marketing campaign:', error);
      throw error;
    }
  }

  async processSystemNotification(job: ScheduledJob): Promise<void> {
    try {
      const criteria = job.target_criteria || {};
      
      // Get all active users or specific targets
      let targetUsers = await DatabaseService.select('users', '*');

      if (criteria.user_ids) {
        targetUsers = targetUsers.filter(user => criteria.user_ids.includes(user.id));
      }

      // Send system notifications
      for (const user of targetUsers) {
        const variables = {
          userName: user.name || 'User',
          systemName: 'CRM System',
          timestamp: new Date().toLocaleString()
        };

        await this.notificationService.queueNotification({
          templateId: job.template_id,
          recipientId: user.id,
          channel: 'both',
          variables,
          priority: 'normal'
        });
      }

      console.log(`Processed system notification for ${targetUsers.length} users`);
    } catch (error) {
      console.error('Failed to process system notification:', error);
      throw error;
    }
  }

  // Monitoring
  async getJobStatus(jobId: string): Promise<{
    job: ScheduledJob | null;
    isRunning: boolean;
    nextRun: string | null;
    lastRun: string | null;
    executionHistory: Array<{
      runTime: string;
      success: boolean;
      error?: string;
    }>;
  }> {
    try {
      const job = await this.getJob(jobId);
      if (!job) {
        return {
          job: null,
          isRunning: false,
          nextRun: null,
          lastRun: null,
          executionHistory: []
        };
      }

      const isRunning = this.runningJobs.has(jobId);

      // For now, we'll return basic info
      // In a production system, you'd want to store execution history
      return {
        job,
        isRunning,
        nextRun: job.next_run_at,
        lastRun: job.last_run_at,
        executionHistory: [] // Would be populated from execution logs
      };
    } catch (error) {
      console.error('Failed to get job status:', error);
      throw error;
    }
  }

  async getJobHistory(jobId: string): Promise<Array<{
    runTime: string;
    duration: number;
    success: boolean;
    error?: string;
    notificationsSent: number;
  }>> {
    try {
      // This would typically come from a job_execution_history table
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get job history:', error);
      return [];
    }
  }

  async updateJobExecution(jobId: string, status: 'success' | 'failed', metadata: Record<string, any>): Promise<void> {
    try {
      // Update job with execution info
      const updateData: any = {
        last_run_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (status === 'success') {
        updateData.next_run_at = this.getNextRunTime(
          (await this.getJob(jobId))?.cron_expression || '0 0 * * *'
        );
      }

      await DatabaseService.update('scheduled_jobs', jobId, updateData);

      // In a production system, you'd also log to an execution history table
    } catch (error) {
      console.error('Failed to update job execution:', error);
    }
  }

  // Job lifecycle management
  private async initializeScheduler(): Promise<void> {
    try {
      // Load all active jobs and start them
      const activeJobs = await DatabaseService.select('scheduled_jobs', '*', { is_active: true });
      
      for (const job of activeJobs) {
        await this.startJob(job);
      }

      console.log(`Initialized ${activeJobs.length} scheduled jobs`);
    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
    }
  }

  private async startJob(job: ScheduledJob): Promise<void> {
    try {
      if (this.runningJobs.has(job.id)) {
        return; // Job already running
      }

      const task = cron.schedule(job.cron_expression, async () => {
        await this.executeJob(job);
      }, {
        scheduled: true,
        timezone: 'UTC'
      });

      this.runningJobs.set(job.id, task);
      console.log(`Started job: ${job.job_name}`);
    } catch (error) {
      console.error(`Failed to start job ${job.job_name}:`, error);
    }
  }

  private async stopJob(jobId: string): Promise<void> {
    try {
      const task = this.runningJobs.get(jobId);
      if (task) {
        task.stop();
        this.runningJobs.delete(jobId);
        console.log(`Stopped job: ${jobId}`);
      }
    } catch (error) {
      console.error(`Failed to stop job ${jobId}:`, error);
    }
  }

  private getNextRunTime(cronExpression: string): string {
    try {
      // This is a simplified implementation
      // In production, you'd use a proper cron parser
      const now = new Date();
      const nextRun = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour as default
      return nextRun.toISOString();
    } catch (error) {
      console.error('Failed to calculate next run time:', error);
      return new Date(Date.now() + 60 * 60 * 1000).toISOString();
    }
  }

  // Utility methods
  async pauseJob(jobId: string): Promise<void> {
    await this.updateJob(jobId, { is_active: false });
  }

  async resumeJob(jobId: string): Promise<void> {
    await this.updateJob(jobId, { is_active: true });
  }

  async getSchedulerStats(): Promise<{
    totalJobs: number;
    activeJobs: number;
    runningJobs: number;
    jobsByType: Record<string, number>;
  }> {
    try {
      const totalJobs = await DatabaseService.count('scheduled_jobs');
      const activeJobs = await DatabaseService.count('scheduled_jobs', { is_active: true });
      const runningJobs = this.runningJobs.size;

      // Get jobs by type
      const contractReminders = await DatabaseService.count('scheduled_jobs', { job_type: 'contract_reminder' });
      const marketingCampaigns = await DatabaseService.count('scheduled_jobs', { job_type: 'marketing_campaign' });
      const systemNotifications = await DatabaseService.count('scheduled_jobs', { job_type: 'system_notification' });

      return {
        totalJobs,
        activeJobs,
        runningJobs,
        jobsByType: {
          contract_reminder: contractReminders,
          marketing_campaign: marketingCampaigns,
          system_notification: systemNotifications
        }
      };
    } catch (error) {
      console.error('Failed to get scheduler stats:', error);
      return {
        totalJobs: 0,
        activeJobs: 0,
        runningJobs: 0,
        jobsByType: {}
      };
    }
  }
}

export const schedulerService = new SchedulerService();