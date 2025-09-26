/**
 * API Service Factory
 * Factory pattern for creating service instances with mock/real API switching
 */

import { isUsingMockApi } from '@/config/apiConfig';

// Import real API services
import { RealAuthService } from '../real/authService';
import { RealCustomerService } from '../real/customerService';
import { RealSalesService } from '../real/salesService';
import { RealTicketService } from '../real/ticketService';
import { RealContractService } from '../real/contractService';
import { RealUserService } from '../real/userService';
import { RealDashboardService } from '../real/dashboardService';
import { RealNotificationService } from '../real/notificationService';
import { RealFileService } from '../real/fileService';
import { RealAuditService } from '../real/auditService';

// Import mock API services (existing ones)
import { authService as mockAuthService } from '../authService';
import { customerService as mockCustomerService } from '../customerService';
import { salesService as mockSalesService } from '../salesService';
import { ticketService as mockTicketService } from '../ticketService';
import { contractService as mockContractService } from '../contractService';
import { userService as mockUserService } from '../userService';
import { dashboardService as mockDashboardService } from '../dashboardService';
import { notificationService as mockNotificationService } from '../notificationService';

// Service interfaces
export interface IAuthService {
  login(credentials: any): Promise<any>;
  logout(): Promise<void>;
  getCurrentUser(): any;
  getToken(): string | null;
  isAuthenticated(): boolean;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
  refreshToken(): Promise<string>;
  // Add other auth methods as needed
}

export interface ICustomerService {
  getCustomers(filters?: any): Promise<any[]>;
  getCustomer(id: string): Promise<any>;
  createCustomer(data: any): Promise<any>;
  updateCustomer(id: string, data: any): Promise<any>;
  deleteCustomer(id: string): Promise<void>;
  bulkDeleteCustomers(ids: string[]): Promise<void>;
  bulkUpdateCustomers(ids: string[], data: any): Promise<void>;
  getTags(): Promise<any[]>;
  exportCustomers(format?: string): Promise<string>;
  importCustomers(data: string): Promise<any>;
  // Add other customer methods as needed
}

export interface ISalesService {
  getSales(filters?: any): Promise<any[]>;
  getSale(id: string): Promise<any>;
  createSale(data: any): Promise<any>;
  updateSale(id: string, data: any): Promise<any>;
  deleteSale(id: string): Promise<void>;
  getPipelineStages(): Promise<any[]>;
  getSalesAnalytics(period?: string): Promise<any>;
  // Add other sales methods as needed
}

export interface ITicketService {
  getTickets(filters?: any): Promise<any[]>;
  getTicket(id: string): Promise<any>;
  createTicket(data: any): Promise<any>;
  updateTicket(id: string, data: any): Promise<any>;
  deleteTicket(id: string): Promise<void>;
  getTicketCategories(): Promise<any[]>;
  getTicketPriorities(): Promise<any[]>;
  // Add other ticket methods as needed
}

export interface IContractService {
  getContracts(filters?: any): Promise<any[]>;
  getContract(id: string): Promise<any>;
  createContract(data: any): Promise<any>;
  updateContract(id: string, data: any): Promise<any>;
  deleteContract(id: string): Promise<void>;
  getContractTypes(): Promise<any[]>;
  getContractAnalytics(): Promise<any>;
  // Add other contract methods as needed
}

export interface IUserService {
  getUsers(filters?: any): Promise<any[]>;
  getUser(id: string): Promise<any>;
  createUser(data: any): Promise<any>;
  updateUser(id: string, data: any): Promise<any>;
  deleteUser(id: string): Promise<void>;
  getRoles(): Promise<any[]>;
  getPermissions(): Promise<any[]>;
  // Add other user methods as needed
}

export interface IDashboardService {
  getMetrics(): Promise<any>;
  getAnalytics(period?: string): Promise<any>;
  getRecentActivity(): Promise<any[]>;
  getWidgetData(widgetType: string): Promise<any>;
  // Add other dashboard methods as needed
}

export interface INotificationService {
  getNotifications(filters?: any): Promise<any[]>;
  createNotification(data: any): Promise<any>;
  markAsRead(id: string): Promise<void>;
  deleteNotification(id: string): Promise<void>;
  getTemplates(): Promise<any[]>;
  // Add other notification methods as needed
}

export interface IFileService {
  uploadFile(file: File, options?: any): Promise<any>;
  downloadFile(id: string): Promise<void>;
  deleteFile(id: string): Promise<void>;
  getFileMetadata(id: string): Promise<any>;
  // Add other file methods as needed
}

export interface IAuditService {
  getAuditLogs(filters?: any): Promise<any[]>;
  exportAuditLogs(filters?: any): Promise<string>;
  searchAuditLogs(query: string): Promise<any[]>;
  // Add other audit methods as needed
}

/**
 * Service Factory Class
 */
class ApiServiceFactory {
  private static instance: ApiServiceFactory;
  private useMockApi: boolean;

  // Service instances
  private authServiceInstance: IAuthService | null = null;
  private customerServiceInstance: ICustomerService | null = null;
  private salesServiceInstance: ISalesService | null = null;
  private ticketServiceInstance: ITicketService | null = null;
  private contractServiceInstance: IContractService | null = null;
  private userServiceInstance: IUserService | null = null;
  private dashboardServiceInstance: IDashboardService | null = null;
  private notificationServiceInstance: INotificationService | null = null;
  private fileServiceInstance: IFileService | null = null;
  private auditServiceInstance: IAuditService | null = null;

  private constructor() {
    this.useMockApi = isUsingMockApi();
    
    // Listen for environment changes
    this.setupEnvironmentListener();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ApiServiceFactory {
    if (!ApiServiceFactory.instance) {
      ApiServiceFactory.instance = new ApiServiceFactory();
    }
    return ApiServiceFactory.instance;
  }

  /**
   * Setup environment change listener
   */
  private setupEnvironmentListener(): void {
    // Listen for environment variable changes
    const originalEnv = import.meta.env.VITE_USE_MOCK_API;
    
    setInterval(() => {
      const currentEnv = import.meta.env.VITE_USE_MOCK_API;
      if (currentEnv !== originalEnv) {
        this.switchApiMode(currentEnv === 'true');
      }
    }, 1000);
  }

  /**
   * Switch between mock and real API
   */
  public switchApiMode(useMock: boolean): void {
    if (this.useMockApi !== useMock) {
      this.useMockApi = useMock;
      this.clearServiceInstances();
      
      console.log(`[API Factory] Switched to ${useMock ? 'Mock' : 'Real'} API mode`);
    }
  }

  /**
   * Clear all service instances to force recreation
   */
  private clearServiceInstances(): void {
    this.authServiceInstance = null;
    this.customerServiceInstance = null;
    this.salesServiceInstance = null;
    this.ticketServiceInstance = null;
    this.contractServiceInstance = null;
    this.userServiceInstance = null;
    this.dashboardServiceInstance = null;
    this.notificationServiceInstance = null;
    this.fileServiceInstance = null;
    this.auditServiceInstance = null;
  }

  /**
   * Get Auth Service
   */
  public getAuthService(): IAuthService {
    if (!this.authServiceInstance) {
      this.authServiceInstance = this.useMockApi 
        ? mockAuthService as IAuthService
        : new RealAuthService();
    }
    return this.authServiceInstance;
  }

  /**
   * Get Customer Service
   */
  public getCustomerService(): ICustomerService {
    if (!this.customerServiceInstance) {
      this.customerServiceInstance = this.useMockApi 
        ? mockCustomerService as ICustomerService
        : new RealCustomerService();
    }
    return this.customerServiceInstance;
  }

  /**
   * Get Sales Service
   */
  public getSalesService(): ISalesService {
    if (!this.salesServiceInstance) {
      this.salesServiceInstance = this.useMockApi 
        ? mockSalesService as ISalesService
        : new RealSalesService();
    }
    return this.salesServiceInstance;
  }

  /**
   * Get Ticket Service
   */
  public getTicketService(): ITicketService {
    if (!this.ticketServiceInstance) {
      this.ticketServiceInstance = this.useMockApi 
        ? mockTicketService as ITicketService
        : new RealTicketService();
    }
    return this.ticketServiceInstance;
  }

  /**
   * Get Contract Service
   */
  public getContractService(): IContractService {
    if (!this.contractServiceInstance) {
      this.contractServiceInstance = this.useMockApi 
        ? mockContractService as IContractService
        : new RealContractService();
    }
    return this.contractServiceInstance;
  }

  /**
   * Get User Service
   */
  public getUserService(): IUserService {
    if (!this.userServiceInstance) {
      this.userServiceInstance = this.useMockApi 
        ? mockUserService as IUserService
        : new RealUserService();
    }
    return this.userServiceInstance;
  }

  /**
   * Get Dashboard Service
   */
  public getDashboardService(): IDashboardService {
    if (!this.dashboardServiceInstance) {
      this.dashboardServiceInstance = this.useMockApi 
        ? mockDashboardService as IDashboardService
        : new RealDashboardService();
    }
    return this.dashboardServiceInstance;
  }

  /**
   * Get Notification Service
   */
  public getNotificationService(): INotificationService {
    if (!this.notificationServiceInstance) {
      this.notificationServiceInstance = this.useMockApi 
        ? mockNotificationService as INotificationService
        : new RealNotificationService();
    }
    return this.notificationServiceInstance;
  }

  /**
   * Get File Service
   */
  public getFileService(): IFileService {
    if (!this.fileServiceInstance) {
      this.fileServiceInstance = this.useMockApi 
        ? this.createMockFileService()
        : new RealFileService();
    }
    return this.fileServiceInstance;
  }

  /**
   * Get Audit Service
   */
  public getAuditService(): IAuditService {
    if (!this.auditServiceInstance) {
      this.auditServiceInstance = this.useMockApi 
        ? this.createMockAuditService()
        : new RealAuditService();
    }
    return this.auditServiceInstance;
  }

  /**
   * Create mock file service (placeholder)
   */
  private createMockFileService(): IFileService {
    return {
      async uploadFile(file: File, options?: any): Promise<any> {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          id: Date.now().toString(),
          filename: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          mimeType: file.type,
        };
      },
      async downloadFile(id: string): Promise<void> {
        // Mock implementation
        console.log('Mock download file:', id);
      },
      async deleteFile(id: string): Promise<void> {
        // Mock implementation
        console.log('Mock delete file:', id);
      },
      async getFileMetadata(id: string): Promise<any> {
        // Mock implementation
        return {
          id,
          filename: 'mock-file.pdf',
          size: 1024,
          mimeType: 'application/pdf',
        };
      },
    };
  }

  /**
   * Create mock audit service (placeholder)
   */
  private createMockAuditService(): IAuditService {
    return {
      async getAuditLogs(filters?: any): Promise<any[]> {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
          {
            id: '1',
            action: 'CREATE',
            resource: 'customer',
            userId: 'user1',
            createdAt: new Date().toISOString(),
          },
        ];
      },
      async exportAuditLogs(filters?: any): Promise<string> {
        // Mock implementation
        return 'id,action,resource,userId,createdAt\n1,CREATE,customer,user1,2024-01-01';
      },
      async searchAuditLogs(query: string): Promise<any[]> {
        // Mock implementation
        return [];
      },
    };
  }

  /**
   * Get current API mode
   */
  public isUsingMockApi(): boolean {
    return this.useMockApi;
  }

  /**
   * Get all service instances (for debugging)
   */
  public getServiceInstances(): Record<string, any> {
    return {
      auth: this.authServiceInstance,
      customer: this.customerServiceInstance,
      sales: this.salesServiceInstance,
      ticket: this.ticketServiceInstance,
      contract: this.contractServiceInstance,
      user: this.userServiceInstance,
      dashboard: this.dashboardServiceInstance,
      notification: this.notificationServiceInstance,
      file: this.fileServiceInstance,
      audit: this.auditServiceInstance,
    };
  }
}

// Export singleton instance
export const apiServiceFactory = ApiServiceFactory.getInstance();

// Export convenience methods
export const getAuthService = () => apiServiceFactory.getAuthService();
export const getCustomerService = () => apiServiceFactory.getCustomerService();
export const getSalesService = () => apiServiceFactory.getSalesService();
export const getTicketService = () => apiServiceFactory.getTicketService();
export const getContractService = () => apiServiceFactory.getContractService();
export const getUserService = () => apiServiceFactory.getUserService();
export const getDashboardService = () => apiServiceFactory.getDashboardService();
export const getNotificationService = () => apiServiceFactory.getNotificationService();
export const getFileService = () => apiServiceFactory.getFileService();
export const getAuditService = () => apiServiceFactory.getAuditService();

export default apiServiceFactory;