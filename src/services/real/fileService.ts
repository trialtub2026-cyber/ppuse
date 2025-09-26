/**
 * Real File Service
 * Enterprise file management service for .NET Core backend
 */

import { baseApiService } from '../api/baseApiService';
import { apiConfig } from '@/config/apiConfig';
import { 
  FileUploadRequest, 
  FileUploadResponse,
  ApiResponse 
} from '../api/interfaces';
import { IFileService } from '../api/apiServiceFactory';

export class RealFileService implements IFileService {

  /**
   * Upload file
   */
  async uploadFile(file: File, options?: {
    category?: string;
    description?: string;
    isPublic?: boolean;
    onProgress?: (progress: number) => void;
  }): Promise<FileUploadResponse> {
    try {
      const response = await baseApiService.uploadFile<FileUploadResponse>(
        apiConfig.endpoints.files.upload,
        file,
        options?.onProgress,
        {
          headers: {
            'X-File-Category': options?.category || 'general',
            'X-File-Description': options?.description || '',
            'X-File-Public': options?.isPublic ? 'true' : 'false',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload file');
    }
  }

  /**
   * Download file
   */
  async downloadFile(id: string, filename?: string): Promise<void> {
    try {
      await baseApiService.downloadFile(
        `${apiConfig.endpoints.files.download}/${id}`,
        filename
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to download file');
    }
  }

  /**
   * Delete file
   */
  async deleteFile(id: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.files.delete}/${id}`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete file');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(id: string): Promise<FileUploadResponse> {
    try {
      const response = await baseApiService.get<FileUploadResponse>(
        `${apiConfig.endpoints.files.metadata}/${id}`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch file metadata');
    }
  }

  /**
   * Get files list
   */
  async getFiles(filters?: {
    category?: string;
    mimeType?: string;
    uploadedBy?: string;
    isPublic?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    files: FileUploadResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      const response = await baseApiService.get<{
        files: FileUploadResponse[];
        total: number;
        page: number;
        totalPages: number;
      }>(`${apiConfig.endpoints.files.metadata}?${params.toString()}`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch files');
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(id: string, updates: {
    filename?: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
  }): Promise<FileUploadResponse> {
    try {
      const response = await baseApiService.put<FileUploadResponse>(
        `${apiConfig.endpoints.files.metadata}/${id}`,
        updates
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update file metadata');
    }
  }

  /**
   * Get file categories
   */
  async getFileCategories(): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    allowedTypes?: string[];
    maxSize?: number;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        name: string;
        description?: string;
        allowedTypes?: string[];
        maxSize?: number;
      }>>(`${apiConfig.endpoints.files.metadata}/categories`);

      return response.data;
    } catch (error: any) {
      // Fallback to default categories
      return [
        { id: 'general', name: 'General' },
        { id: 'documents', name: 'Documents' },
        { id: 'images', name: 'Images' },
        { id: 'contracts', name: 'Contracts' },
        { id: 'attachments', name: 'Attachments' },
      ];
    }
  }

  /**
   * Bulk upload files
   */
  async bulkUploadFiles(files: File[], options?: {
    category?: string;
    isPublic?: boolean;
    onProgress?: (fileIndex: number, progress: number) => void;
    onComplete?: (fileIndex: number, result: FileUploadResponse | Error) => void;
  }): Promise<Array<{ file: File; result: FileUploadResponse | Error }>> {
    const results: Array<{ file: File; result: FileUploadResponse | Error }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const result = await this.uploadFile(file, {
          category: options?.category,
          isPublic: options?.isPublic,
          onProgress: (progress) => options?.onProgress?.(i, progress),
        });

        results.push({ file, result });
        options?.onComplete?.(i, result);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Upload failed');
        results.push({ file, result: err });
        options?.onComplete?.(i, err);
      }
    }

    return results;
  }

  /**
   * Bulk delete files
   */
  async bulkDeleteFiles(fileIds: string[]): Promise<Array<{ id: string; success: boolean; error?: string }>> {
    try {
      const response = await baseApiService.post<Array<{ id: string; success: boolean; error?: string }>>(
        `${apiConfig.endpoints.files.delete}/bulk`,
        { fileIds }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to bulk delete files');
    }
  }

  /**
   * Get file storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    usedStorage: number;
    availableStorage: number;
    storageLimit: number;
    byCategory: Array<{ category: string; count: number; size: number }>;
    byType: Array<{ mimeType: string; count: number; size: number }>;
  }> {
    try {
      const response = await baseApiService.get<{
        totalFiles: number;
        totalSize: number;
        usedStorage: number;
        availableStorage: number;
        storageLimit: number;
        byCategory: Array<{ category: string; count: number; size: number }>;
        byType: Array<{ mimeType: string; count: number; size: number }>;
      }>(`${apiConfig.endpoints.files.metadata}/stats`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch storage statistics');
    }
  }

  /**
   * Generate file share link
   */
  async generateShareLink(fileId: string, options?: {
    expiresAt?: string;
    password?: string;
    allowDownload?: boolean;
  }): Promise<{
    shareUrl: string;
    expiresAt?: string;
    hasPassword: boolean;
  }> {
    try {
      const response = await baseApiService.post<{
        shareUrl: string;
        expiresAt?: string;
        hasPassword: boolean;
      }>(`${apiConfig.endpoints.files.metadata}/${fileId}/share`, options);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate share link');
    }
  }

  /**
   * Revoke file share link
   */
  async revokeShareLink(fileId: string): Promise<void> {
    try {
      await baseApiService.delete(
        `${apiConfig.endpoints.files.metadata}/${fileId}/share`
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to revoke share link');
    }
  }

  /**
   * Get file versions
   */
  async getFileVersions(fileId: string): Promise<Array<{
    id: string;
    version: number;
    size: number;
    uploadedBy: { id: string; name: string };
    uploadedAt: string;
    changes?: string;
  }>> {
    try {
      const response = await baseApiService.get<Array<{
        id: string;
        version: number;
        size: number;
        uploadedBy: { id: string; name: string };
        uploadedAt: string;
        changes?: string;
      }>>(`${apiConfig.endpoints.files.metadata}/${fileId}/versions`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch file versions');
    }
  }

  /**
   * Upload new file version
   */
  async uploadFileVersion(fileId: string, file: File, changes?: string): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (changes) {
        formData.append('changes', changes);
      }

      const response = await baseApiService.post<FileUploadResponse>(
        `${apiConfig.endpoints.files.metadata}/${fileId}/versions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload file version');
    }
  }

  /**
   * Restore file version
   */
  async restoreFileVersion(fileId: string, versionId: string): Promise<FileUploadResponse> {
    try {
      const response = await baseApiService.post<FileUploadResponse>(
        `${apiConfig.endpoints.files.metadata}/${fileId}/versions/${versionId}/restore`
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to restore file version');
    }
  }

  /**
   * Scan file for viruses
   */
  async scanFile(fileId: string): Promise<{
    status: 'clean' | 'infected' | 'scanning' | 'error';
    threats?: Array<{ name: string; severity: string }>;
    scannedAt: string;
  }> {
    try {
      const response = await baseApiService.post<{
        status: 'clean' | 'infected' | 'scanning' | 'error';
        threats?: Array<{ name: string; severity: string }>;
        scannedAt: string;
      }>(`${apiConfig.endpoints.files.metadata}/${fileId}/scan`);

      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to scan file');
    }
  }
}