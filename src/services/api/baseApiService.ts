/**
 * Base API Service
 * Enterprise-grade HTTP client with interceptors, retry logic, and error handling
 */

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';
import { apiConfig, getApiHeaders } from '@/config/apiConfig';
import { ApiResponse, ApiError } from './interfaces';
import { toast } from '@/hooks/use-toast';

export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface ApiMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

class BaseApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];
  private metrics: ApiMetrics = {
    requestCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    lastRequestTime: 0,
  };

  constructor() {
    this.client = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create Axios instance with base configuration
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: apiConfig.baseUrl,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': '1.0.0',
        'X-Client-Platform': 'web',
      },
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const startTime = Date.now();
        config.metadata = { startTime };

        // Add auth token if not skipped
        if (!config.skipAuth) {
          const token = localStorage.getItem('crm_auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Add tenant ID if available
        const user = this.getCurrentUser();
        if (user?.tenantId) {
          config.headers['X-Tenant-ID'] = user.tenantId;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();

        // Logging
        if (apiConfig.enableLogging) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }

        return config;
      },
      (error: AxiosError) => {
        this.handleRequestError(error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        this.handleSuccessResponse(response);
        return response;
      },
      async (error: AxiosError) => {
        return this.handleErrorResponse(error);
      }
    );
  }

  /**
   * Handle successful responses
   */
  private handleSuccessResponse(response: AxiosResponse): void {
    const config = response.config as any;
    const responseTime = Date.now() - (config.metadata?.startTime || 0);

    // Update metrics
    this.updateMetrics(responseTime, false);

    // Logging
    if (apiConfig.enableLogging) {
      console.log(`[API Response] ${response.status} ${response.config.url}`, {
        responseTime: `${responseTime}ms`,
        data: response.data,
      });
    }
  }

  /**
   * Handle error responses with retry logic
   */
  private async handleErrorResponse(error: AxiosError): Promise<any> {
    const config = error.config as any;
    const responseTime = Date.now() - (config?.metadata?.startTime || 0);

    // Update metrics
    this.updateMetrics(responseTime, true);

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      return this.handle401Error(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      this.handle403Error(error);
    }

    // Handle network errors with retry
    if (!error.response && this.shouldRetry(error)) {
      return this.retryRequest(error);
    }

    // Handle other errors
    if (!config?.skipErrorHandling) {
      this.handleGenericError(error);
    }

    return Promise.reject(this.formatError(error));
  }

  /**
   * Handle 401 Unauthorized errors
   */
  private async handle401Error(error: AxiosError): Promise<any> {
    const config = error.config as any;

    // If already retried or no refresh token, logout
    if (config._retry || !this.getRefreshToken()) {
      this.logout();
      return Promise.reject(this.formatError(error));
    }

    // If already refreshing, queue the request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(() => {
        return this.client.request(config);
      });
    }

    config._retry = true;
    this.isRefreshing = true;

    try {
      // Attempt to refresh token
      const newToken = await this.refreshToken();
      
      // Update authorization header
      config.headers.Authorization = `Bearer ${newToken}`;
      
      // Process failed queue
      this.processQueue(null);
      
      // Retry original request
      return this.client.request(config);
    } catch (refreshError) {
      // Refresh failed, logout
      this.processQueue(refreshError);
      this.logout();
      return Promise.reject(this.formatError(error));
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle 403 Forbidden errors
   */
  private handle403Error(error: AxiosError): void {
    toast({
      title: 'Access Denied',
      description: 'You don\'t have permission to perform this action.',
      variant: 'destructive',
    });
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(error: AxiosError): void {
    const message = this.getErrorMessage(error);
    
    toast({
      title: 'Request Failed',
      description: message,
      variant: 'destructive',
    });
  }

  /**
   * Handle request errors
   */
  private handleRequestError(error: AxiosError): void {
    console.error('[API Request Error]', error);
    
    toast({
      title: 'Request Error',
      description: 'Failed to send request. Please try again.',
      variant: 'destructive',
    });
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    const config = error.config as any;
    const retryAttempts = config?.retryAttempts || apiConfig.retryAttempts;
    const currentAttempt = config?._retryCount || 0;

    return (
      currentAttempt < retryAttempts &&
      (!error.response || error.response.status >= 500) &&
      error.code !== 'ECONNABORTED' // Don't retry timeout errors
    );
  }

  /**
   * Retry failed request
   */
  private async retryRequest(error: AxiosError): Promise<any> {
    const config = error.config as any;
    const retryDelay = config?.retryDelay || apiConfig.retryDelay;
    
    config._retryCount = (config._retryCount || 0) + 1;

    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, retryDelay * config._retryCount));

    return this.client.request(config);
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${apiConfig.baseUrl}/auth/refresh`,
        { refreshToken },
        { skipAuth: true } as any
      );

      const { token, refreshToken: newRefreshToken } = response.data.data;
      
      // Store new tokens
      localStorage.setItem('crm_auth_token', token);
      if (newRefreshToken) {
        localStorage.setItem('crm_refresh_token', newRefreshToken);
      }

      return token;
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('crm_auth_token');
      localStorage.removeItem('crm_refresh_token');
      throw error;
    }
  }

  /**
   * Logout user and clear session
   */
  private logout(): void {
    localStorage.removeItem('crm_auth_token');
    localStorage.removeItem('crm_refresh_token');
    localStorage.removeItem('crm_user');
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * Get current user from storage
   */
  private getCurrentUser(): any {
    const userStr = localStorage.getItem('crm_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('crm_refresh_token');
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update API metrics
   */
  private updateMetrics(responseTime: number, isError: boolean): void {
    if (!apiConfig.enableMetrics) return;

    this.metrics.requestCount++;
    this.metrics.lastRequestTime = Date.now();
    
    if (isError) {
      this.metrics.errorCount++;
    }

    // Calculate average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + responseTime) / 
      this.metrics.requestCount;
  }

  /**
   * Format error for consistent error handling
   */
  private formatError(error: AxiosError): ApiError {
    const response = error.response;
    
    return {
      code: response?.data?.code || error.code || 'UNKNOWN_ERROR',
      message: this.getErrorMessage(error),
      details: response?.data?.details || error.message,
    };
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'Access denied. You don\'t have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. Resource already exists.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        if (!error.response) {
          return 'Network error. Please check your connection.';
        }
        return 'An unexpected error occurred.';
    }
  }

  /**
   * Public API methods
   */

  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T = any>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  /**
   * Download file
   */
  async downloadFile(url: string, filename?: string, config?: RequestConfig): Promise<void> {
    const response = await this.client.get(url, {
      ...config,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Get API metrics
   */
  getMetrics(): ApiMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset API metrics
   */
  resetMetrics(): void {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastRequestTime: 0,
    };
  }

  /**
   * Get Axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export const baseApiService = new BaseApiService();
export default baseApiService;