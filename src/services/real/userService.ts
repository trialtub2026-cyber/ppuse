/**
 * Real User Service
 * Enterprise user management service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  UserRequest, 
  UserResponse, 
  PaginationParams,
  FilterParams,
  ApiResponse 
} from '../api/interfaces';
import { IUserService } from '../api/apiServiceFactory';

export class RealUserService implements IUserService {

  /**
   * Get users with filters and pagination
   */
  async getUsers(filters?: FilterParams & PaginationParams): Promise<UserResponse[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await baseApiService.get<UserResponse[]>(
        `${apiConfig.endpoints.users.base}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }

  /**
   * Get single user by ID
   */
  async getUser(id: string): Promise<UserResponse> {
    try {
      const response = await baseApiService.get<UserResponse>(
        `${apiConfig.endpoints.users.base}/${id}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user');
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: UserRequest): Promise<UserResponse> {
    try {
      const response = await baseApiService.post<UserResponse>(
        apiConfig.endpoints.users.base,
        userData
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create user');
    }
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, updates: Partial<UserRequest>): Promise<UserResponse> {
    try {
      const response = await baseApiService.put<UserResponse>(
        `${apiConfig.endpoints.users.base}/${id}`,
        updates
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.users.base}/${id}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  /**
   * Get available roles
   */
  async getRoles(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
    level: number;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        name: string;
        description: string;
        permissions: string[];
        level: number;
      }>>(apiConfig.endpoints.users.roles);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch roles');
    }
  }

  /**
   * Get available permissions
   */
  async getPermissions(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        name: string;
        description: string;
        category: string;
      }>>(apiConfig.endpoints.users.permissions);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch permissions');
    }
  }

  /**
   * Create new role
   */
  async createRole(roleData: {
    name: string;
    description: string;
    permissions: string[];
  }): Promise<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
    level: number;
  }> {
    try {
      const response = await baseApiService.post<{
        id: string;
        name: string;
        description: string;
        permissions: string[];
        level: number;
      }>(apiConfig.endpoints.users.roles, roleData);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create role');
    }
  }

  /**
   * Update role
   */
  async updateRole(roleId: string, updates: {
    name?: string;
    description?: string;
    permissions?: string[];
  }): Promise<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
    level: number;
  }> {
    try {
      const response = await baseApiService.put<{
        id: string;
        name: string;
        description: string;
        permissions: string[];
        level: number;
      }>(`${apiConfig.endpoints.users.roles}/${roleId}`, updates);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update role');
    }
  }

  /**
   * Delete role
   */
  async deleteRole(roleId: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.users.roles}/${roleId}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete role');
    }
  }

  /**
   * Invite user
   */
  async inviteUser(invitationData: {
    email: string;
    role: string;
    message?: string;
  }): Promise<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
  }> {
    try {
      const response = await baseApiService.post<{
        id: string;
        email: string;
        role: string;
        status: string;
        expiresAt: string;
      }>(apiConfig.endpoints.users.invitations, invitationData);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send invitation');
    }
  }

  /**
   * Get pending invitations
   */
  async getPendingInvitations(): Promise<Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    invitedBy: { id: string; name: string };
    createdAt: string;
    expiresAt: string;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        email: string;
        role: string;
        status: string;
        invitedBy: { id: string; name: string };
        createdAt: string;
        expiresAt: string;
      }>>(apiConfig.endpoints.users.invitations);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch invitations');
    }
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.users.invitations}/${invitationId}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel invitation');
    }
  }

  /**
   * Resend invitation
   */
  async resendInvitation(invitationId: string): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.users.invitations}/${invitationId}/resend`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend invitation');
    }
  }

  /**
   * Activate/Deactivate user
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<UserResponse> {
    try {
      const response = await baseApiService.patch<UserResponse>(
        `${apiConfig.endpoints.users.base}/${userId}/status`,
        { isActive }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user status');
    }
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId: string): Promise<{ temporaryPassword: string }> {
    try {
      const response = await baseApiService.post<{ temporaryPassword: string }>(
        `${apiConfig.endpoints.users.base}/${userId}/reset-password`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, limit?: number): Promise<Array<{
    id: string;
    action: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
  }>> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await baseApiService.get<Array<{
        id: string;
        action: string;
        description: string;
        ipAddress: string;
        userAgent: string;
        createdAt: string;
      }>>(`${apiConfig.endpoints.users.base}/${userId}/activity${params}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user activity');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    recentLogins: number;
    pendingInvitations: number;
  }> {
    try {
      const response = await baseApiService.get<{
        total: number;
        active: number;
        inactive: number;
        byRole: Record<string, number>;
        recentLogins: number;
        pendingInvitations: number;
      }>(`${apiConfig.endpoints.users.base}/stats`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user statistics');
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds: string[], updates: {
    role?: string;
    isActive?: boolean;
    permissions?: string[];
  }): Promise<void> {
    try {
      await baseApiService.post(
        `${apiConfig.endpoints.users.base}/bulk-update`,
        { userIds, updates }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to bulk update users');
    }
  }

  /**
   * Export users
   */
  async exportUsers(format: 'csv' | 'json' | 'xlsx' = 'csv', filters?: FilterParams): Promise<string> {
    try {
      const params = new URLSearchParams({ format });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await baseApiService.get(
        `${apiConfig.endpoints.users.base}/export?${params.toString()}`,
        { responseType: 'blob' } as any
      );

      if (format === 'xlsx') {
        const blob = new Blob([response.data]);
        return URL.createObjectURL(blob);
      } else {
        return await response.data.text();
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export users');
    }
  }

  /**
   * Upload user avatar
   */
  async uploadUserAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
    try {
      const response = await baseApiService.uploadFile<{ avatarUrl: string }>(
        `${apiConfig.endpoints.users.base}/${userId}/avatar`,
        file
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload avatar');
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const response = await baseApiService.get<string[]>(
        `${apiConfig.endpoints.users.base}/${userId}/permissions`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch user permissions');
    }
  }

  /**
   * Update user permissions
   */
  async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    try {
      await baseApiService.put(
        `${apiConfig.endpoints.users.base}/${userId}/permissions`,
        { permissions }
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update user permissions');
    }
  }
}