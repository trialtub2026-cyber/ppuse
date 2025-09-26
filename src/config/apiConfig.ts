/**
 * Enterprise API Configuration
 * Centralized configuration for switching between mock and real APIs
 */

export interface ApiEnvironment {
  name: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export interface ApiEndpoints {
  auth: {
    login: string;
    logout: string;
    refresh: string;
    profile: string;
    permissions: string;
  };
  customers: {
    base: string;
    search: string;
    export: string;
    import: string;
    tags: string;
    bulk: string;
  };
  sales: {
    base: string;
    pipeline: string;
    analytics: string;
    forecasting: string;
  };
  tickets: {
    base: string;
    priorities: string;
    categories: string;
    assignments: string;
  };
  contracts: {
    base: string;
    templates: string;
    renewals: string;
    analytics: string;
  };
  users: {
    base: string;
    roles: string;
    permissions: string;
    invitations: string;
  };
  dashboard: {
    metrics: string;
    analytics: string;
    reports: string;
    widgets: string;
  };
  notifications: {
    base: string;
    templates: string;
    queue: string;
    preferences: string;
  };
  files: {
    upload: string;
    download: string;
    delete: string;
    metadata: string;
  };
  audit: {
    logs: string;
    export: string;
    search: string;
  };
}

// Environment configurations
const environments: Record<string, ApiEnvironment> = {
  development: {
    name: 'Development',
    baseUrl: 'http://localhost:8000/api/v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableLogging: true,
    enableMetrics: true,
  },
  staging: {
    name: 'Staging',
    baseUrl: 'https://api-staging.yourcompany.com/api/v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableLogging: true,
    enableMetrics: true,
  },
  production: {
    name: 'Production',
    baseUrl: 'https://api.yourcompany.com/api/v1',
    timeout: 30000,
    retryAttempts: 2,
    retryDelay: 2000,
    enableLogging: false,
    enableMetrics: true,
  },
  mock: {
    name: 'Mock Development',
    baseUrl: '/mock-api',
    timeout: 5000,
    retryAttempts: 1,
    retryDelay: 500,
    enableLogging: true,
    enableMetrics: false,
  },
};

// API endpoints configuration
export const apiEndpoints: ApiEndpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    permissions: '/auth/permissions',
  },
  customers: {
    base: '/customers',
    search: '/customers/search',
    export: '/customers/export',
    import: '/customers/import',
    tags: '/customers/tags',
    bulk: '/customers/bulk',
  },
  sales: {
    base: '/sales',
    pipeline: '/sales/pipeline',
    analytics: '/sales/analytics',
    forecasting: '/sales/forecasting',
  },
  tickets: {
    base: '/tickets',
    priorities: '/tickets/priorities',
    categories: '/tickets/categories',
    assignments: '/tickets/assignments',
  },
  contracts: {
    base: '/contracts',
    templates: '/contracts/templates',
    renewals: '/contracts/renewals',
    analytics: '/contracts/analytics',
  },
  users: {
    base: '/users',
    roles: '/users/roles',
    permissions: '/users/permissions',
    invitations: '/users/invitations',
  },
  dashboard: {
    metrics: '/dashboard/metrics',
    analytics: '/dashboard/analytics',
    reports: '/dashboard/reports',
    widgets: '/dashboard/widgets',
  },
  notifications: {
    base: '/notifications',
    templates: '/notifications/templates',
    queue: '/notifications/queue',
    preferences: '/notifications/preferences',
  },
  files: {
    upload: '/files/upload',
    download: '/files/download',
    delete: '/files/delete',
    metadata: '/files/metadata',
  },
  audit: {
    logs: '/audit/logs',
    export: '/audit/export',
    search: '/audit/search',
  },
};

/**
 * Get current API configuration
 */
export function getApiConfig(): ApiEnvironment {
  // Check environment variables
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';
  const environment = import.meta.env.VITE_API_ENVIRONMENT || 'development';
  
  if (useMockApi) {
    return environments.mock;
  }
  
  return environments[environment] || environments.development;
}

/**
 * Check if using mock API
 */
export function isUsingMockApi(): boolean {
  return import.meta.env.VITE_USE_MOCK_API === 'true';
}

/**
 * Get full API URL
 */
export function getApiUrl(endpoint: string): string {
  const config = getApiConfig();
  return `${config.baseUrl}${endpoint}`;
}

/**
 * Get API headers
 */
export function getApiHeaders(includeAuth = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Client-Platform': 'web',
  };

  if (includeAuth) {
    const token = localStorage.getItem('crm_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * API Configuration for different environments
 */
export const apiConfig = {
  ...getApiConfig(),
  endpoints: apiEndpoints,
  headers: getApiHeaders,
  getUrl: getApiUrl,
  isMock: isUsingMockApi(),
};

export default apiConfig;