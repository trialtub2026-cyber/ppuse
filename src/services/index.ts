/**
 * Service Index
 * Central export point for all services with automatic mock/real API switching
 */

import { 
  getAuthService,
  getCustomerService,
  getSalesService,
  getTicketService,
  getContractService,
  getUserService,
  getDashboardService,
  getNotificationService,
  getFileService,
  getAuditService,
  apiServiceFactory
} from './api/apiServiceFactory';

// Export service instances
export const authService = getAuthService();
export const customerService = getCustomerService();
export const salesService = getSalesService();
export const ticketService = getTicketService();
export const contractService = getContractService();
export const userService = getUserService();
export const dashboardService = getDashboardService();
export const notificationService = getNotificationService();
export const fileService = getFileService();
export const auditService = getAuditService();

// Export factory for advanced usage
export { apiServiceFactory };

// Export service factory methods
export {
  getAuthService,
  getCustomerService,
  getSalesService,
  getTicketService,
  getContractService,
  getUserService,
  getDashboardService,
  getNotificationService,
  getFileService,
  getAuditService,
};

// Export service interfaces for type checking
export type {
  IAuthService,
  ICustomerService,
  ISalesService,
  ITicketService,
  IContractService,
  IUserService,
  IDashboardService,
  INotificationService,
  IFileService,
  IAuditService,
} from './api/apiServiceFactory';

// Export API configuration
export { apiConfig, isUsingMockApi } from '../config/apiConfig';

// Export base API service for direct usage
export { baseApiService } from './api/baseApiService';

// Export API interfaces
export * from './api/interfaces';

/**
 * Utility function to switch API mode at runtime
 */
export function switchApiMode(useMock: boolean): void {
  apiServiceFactory.switchApiMode(useMock);
  
  // Update environment variable for consistency
  if (typeof window !== 'undefined') {
    // Note: This won't actually change the import.meta.env value,
    // but the factory will use its internal state
    console.log(`API mode switched to: ${useMock ? 'Mock' : 'Real'}`);
  }
}

/**
 * Get current API mode
 */
export function getCurrentApiMode(): 'mock' | 'real' {
  return apiServiceFactory.isUsingMockApi() ? 'mock' : 'real';
}

/**
 * Get service health status
 */
export function getServiceHealth(): {
  mode: 'mock' | 'real';
  services: Record<string, boolean>;
  lastCheck: string;
} {
  const services = apiServiceFactory.getServiceInstances();
  
  return {
    mode: getCurrentApiMode(),
    services: Object.keys(services).reduce((acc, key) => {
      acc[key] = services[key] !== null;
      return acc;
    }, {} as Record<string, boolean>),
    lastCheck: new Date().toISOString(),
  };
}

// Default export for convenience
export default {
  auth: authService,
  customer: customerService,
  sales: salesService,
  ticket: ticketService,
  contract: contractService,
  user: userService,
  dashboard: dashboardService,
  notification: notificationService,
  file: fileService,
  audit: auditService,
  factory: apiServiceFactory,
  switchApiMode,
  getCurrentApiMode,
  getServiceHealth,
};