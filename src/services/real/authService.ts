/**
 * Real Auth Service
 * Enterprise authentication service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  RefreshTokenResponse,
  ApiResponse 
} from '../api/interfaces';
import { IAuthService } from '../api/apiServiceFactory';

export class RealAuthService implements IAuthService {
  private tokenKey = 'crm_auth_token';
  private refreshTokenKey = 'crm_refresh_token';
  private userKey = 'crm_user';

  /**
   * Login user with credentials
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await baseApiService.post<LoginResponse>(
        apiConfig.endpoints.auth.login,
        {
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe || false,
          tenantId: credentials.tenantId,
        },
        { skipAuth: true }
      );

      const { user, token, refreshToken, expiresIn, tenant } = response.data;

      // Store authentication data
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
      localStorage.setItem(this.userKey, JSON.stringify({
        ...user,
        tenant,
      }));

      // Update user's last login
      user.lastLogin = new Date().toISOString();

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        // Notify backend about logout
        await baseApiService.post(
          apiConfig.endpoints.auth.logout,
          { refreshToken },
          { skipErrorHandling: true }
        );
      }
    } catch (error) {
      // Ignore logout errors
      console.warn('Logout request failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      this.clearSession();
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (!token || !user) {
      return false;
    }

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
    } catch (error) {
      return false;
    }

    return true;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    if (!user?.permissions) return false;
    
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return roles.includes(user.role);
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await baseApiService.post<RefreshTokenResponse>(
        apiConfig.endpoints.auth.refresh,
        { refreshToken },
        { skipAuth: true }
      );

      const { token, expiresIn } = response.data;

      // Store new token
      localStorage.setItem(this.tokenKey, token);

      return token;
    } catch (error: any) {
      // Clear session on refresh failure
      this.clearSession();
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<any> {
    try {
      const response = await baseApiService.get(
        apiConfig.endpoints.auth.profile
      );

      const user = response.data;
      
      // Update stored user data
      localStorage.setItem(this.userKey, JSON.stringify(user));

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: any): Promise<any> {
    try {
      const response = await baseApiService.put(
        apiConfig.endpoints.auth.profile,
        profileData
      );

      const user = response.data;
      
      // Update stored user data
      localStorage.setItem(this.userKey, JSON.stringify(user));

      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.auth.profile}/change-password`,
        {
          currentPassword,
          newPassword,
        }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  /**
   * Get user permissions
   */
  async getPermissions(): Promise<string[]> {
    try {
      const response = await baseApiService.get(
        apiConfig.endpoints.auth.permissions
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch permissions');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.auth.login}/forgot-password`,
        { email },
        { skipAuth: true }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to request password reset');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.auth.login}/reset-password`,
        { token, newPassword },
        { skipAuth: true }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.auth.login}/verify-email`,
        { token },
        { skipAuth: true }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify email');
    }
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(): Promise<{ qrCode: string; backupCodes: string[] }> {
    try {
      const response = await baseApiService.post(
        `${apiConfig.endpoints.auth.profile}/enable-2fa`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to enable two-factor authentication');
    }
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(code: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.auth.profile}/disable-2fa`,
        { code }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to disable two-factor authentication');
    }
  }

  /**
   * Get user tenant information
   */
  getUserTenant(): any {
    const user = this.getCurrentUser();
    return user?.tenant || null;
  }

  /**
   * Get available roles for current user
   */
  getAvailableRoles(): string[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    // Role hierarchy - users can only assign roles below their level
    const roleHierarchy: Record<string, string[]> = {
      super_admin: ['admin', 'manager', 'agent', 'engineer', 'customer'],
      admin: ['manager', 'agent', 'engineer', 'customer'],
      manager: ['agent', 'customer'],
      agent: ['customer'],
      engineer: [],
      customer: [],
    };

    return roleHierarchy[user.role] || [];
  }

  /**
   * Check if user can manage another user
   */
  canManageUser(targetUserId: string): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    // Super admin can manage anyone
    if (currentUser.role === 'super_admin') return true;

    // Users can only manage users in their tenant
    // This would need to be validated with the backend
    return true; // Simplified for now
  }

  /**
   * Clear session data
   */
  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Get demo accounts (for development)
   */
  getDemoAccounts(): { tenant: string; users: any[] }[] {
    // This would typically come from the backend
    return [
      {
        tenant: 'Demo Company',
        users: [
          {
            id: 'demo_admin',
            email: 'admin@demo.com',
            name: 'Demo Admin',
            role: 'admin',
          },
          {
            id: 'demo_manager',
            email: 'manager@demo.com',
            name: 'Demo Manager',
            role: 'manager',
          },
        ],
      },
    ];
  }

  /**
   * Get permission description
   */
  getPermissionDescription(permission: string): string {
    const descriptions: Record<string, string> = {
      read: 'View and read data',
      write: 'Create and edit data',
      delete: 'Delete data',
      manage_customers: 'Manage customer data and relationships',
      manage_sales: 'Manage sales processes and deals',
      manage_tickets: 'Manage support tickets and issues',
      // Add more as needed
    };

    return descriptions[permission] || permission;
  }

  /**
   * Get role hierarchy
   */
  getRoleHierarchy(): Record<string, number> {
    return {
      super_admin: 6,
      admin: 5,
      manager: 4,
      agent: 3,
      engineer: 3,
      customer: 1,
    };
  }
}