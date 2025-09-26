import { DatabaseService } from './database';
import { NotificationTemplate } from '@/types/notifications';

export class TemplateService {
  // CRUD operations
  async createTemplate(templateData: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<NotificationTemplate> {
    try {
      // Validate template data
      this.validateTemplateData(templateData);

      // Extract variables from message body
      const variables = this.extractVariables(templateData.message_body);

      const data = {
        ...templateData,
        variables: JSON.stringify(variables),
        f_version: templateData.f_version || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return await DatabaseService.insert('notification_templates', data);
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  async updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate> {
    try {
      // Get existing template
      const existingTemplate = await this.getTemplate(templateId);
      if (!existingTemplate) {
        throw new Error('Template not found');
      }

      // If message body is being updated, extract new variables
      if (updates.message_body) {
        updates.variables = this.extractVariables(updates.message_body);
      }

      // Increment version if content changed
      if (updates.message_body || updates.title) {
        updates.f_version = (existingTemplate.f_version || 1) + 1;
      }

      const updateData = {
        ...updates,
        variables: updates.variables ? JSON.stringify(updates.variables) : undefined,
        updated_at: new Date().toISOString()
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      return await DatabaseService.update('notification_templates', templateId, updateData);
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      // Check if template is being used in any pending notifications
      const pendingNotifications = await DatabaseService.select('notification_queue', 'id', {
        template_id: templateId,
        status: 'pending'
      });

      if (pendingNotifications.length > 0) {
        throw new Error('Cannot delete template with pending notifications');
      }

      await DatabaseService.delete('notification_templates', templateId);
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    try {
      const template = await DatabaseService.findById('notification_templates', templateId);
      if (template) {
        // Parse variables JSON
        template.variables = template.variables ? JSON.parse(template.variables) : [];
      }
      return template;
    } catch (error) {
      console.error('Failed to get template:', error);
      return null;
    }
  }

  async listTemplates(filters?: {
    channel?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    templates: NotificationTemplate[];
    total: number;
  }> {
    try {
      let queryFilters: Record<string, any> = {};

      if (filters?.channel) {
        queryFilters.channel = filters.channel;
      }
      if (filters?.status) {
        queryFilters.status = filters.status;
      }

      // Get total count
      const total = await DatabaseService.count('notification_templates', queryFilters);

      // Get templates
      let templates = await DatabaseService.select('notification_templates', '*', queryFilters);

      // Apply search filter
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        templates = templates.filter(template => 
          template.name.toLowerCase().includes(searchTerm) ||
          template.message_body.toLowerCase().includes(searchTerm) ||
          (template.title && template.title.toLowerCase().includes(searchTerm))
        );
      }

      // Apply pagination
      if (filters?.offset) {
        templates = templates.slice(filters.offset);
      }
      if (filters?.limit) {
        templates = templates.slice(0, filters.limit);
      }

      // Parse variables for each template
      templates.forEach(template => {
        template.variables = template.variables ? JSON.parse(template.variables) : [];
      });

      return {
        templates,
        total: filters?.search ? templates.length : total
      };
    } catch (error) {
      console.error('Failed to list templates:', error);
      return { templates: [], total: 0 };
    }
  }

  // Template processing
  async renderTemplate(templateId: string, variables: Record<string, any>): Promise<string> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Validate variables
      await this.validateVariables(template, variables);

      // Render template
      return this.processTemplateString(template.message_body, variables);
    } catch (error) {
      console.error('Failed to render template:', error);
      throw error;
    }
  }

  async validateVariables(template: NotificationTemplate, variables: Record<string, any>): Promise<void> {
    try {
      const requiredVariables = template.variables || [];
      const missingVariables = requiredVariables.filter(variable => 
        !(variable in variables) || variables[variable] === null || variables[variable] === undefined
      );

      if (missingVariables.length > 0) {
        throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
      }

      // Validate variable types and values
      for (const [key, value] of Object.entries(variables)) {
        if (typeof value === 'object' && value !== null) {
          throw new Error(`Variable '${key}' cannot be an object`);
        }
        
        // Convert to string for template processing
        variables[key] = String(value);
      }
    } catch (error) {
      console.error('Failed to validate variables:', error);
      throw error;
    }
  }

  async previewTemplate(templateId: string, sampleData: Record<string, any>): Promise<{
    title?: string;
    message: string;
    variables: string[];
    missingVariables: string[];
  }> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const requiredVariables = template.variables || [];
      const missingVariables = requiredVariables.filter(variable => 
        !(variable in sampleData)
      );

      // Fill missing variables with placeholder text
      const previewData = { ...sampleData };
      missingVariables.forEach(variable => {
        previewData[variable] = `[${variable}]`;
      });

      const renderedMessage = this.processTemplateString(template.message_body, previewData);
      const renderedTitle = template.title ? this.processTemplateString(template.title, previewData) : undefined;

      return {
        title: renderedTitle,
        message: renderedMessage,
        variables: requiredVariables,
        missingVariables
      };
    } catch (error) {
      console.error('Failed to preview template:', error);
      throw error;
    }
  }

  // Version management
  async createTemplateVersion(templateId: string): Promise<NotificationTemplate> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create a copy with incremented version
      const newVersion = {
        ...template,
        name: `${template.name} v${(template.f_version || 1) + 1}`,
        f_version: (template.f_version || 1) + 1,
        status: 'draft' as const
      };

      delete (newVersion as any).id;
      delete (newVersion as any).created_at;
      delete (newVersion as any).updated_at;

      return await this.createTemplate(newVersion);
    } catch (error) {
      console.error('Failed to create template version:', error);
      throw error;
    }
  }

  async getTemplateHistory(templateId: string): Promise<NotificationTemplate[]> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Get all templates with the same base name
      const baseName = template.name.replace(/ v\d+$/, '');
      const allTemplates = await DatabaseService.select('notification_templates');
      
      const relatedTemplates = allTemplates.filter(t => 
        t.name.startsWith(baseName) && 
        (t.name === baseName || t.name.match(new RegExp(`^${baseName} v\\d+$`)))
      );

      // Sort by version
      relatedTemplates.sort((a, b) => (b.f_version || 1) - (a.f_version || 1));

      // Parse variables for each template
      relatedTemplates.forEach(t => {
        t.variables = t.variables ? JSON.parse(t.variables) : [];
      });

      return relatedTemplates;
    } catch (error) {
      console.error('Failed to get template history:', error);
      return [];
    }
  }

  // Helper methods
  private validateTemplateData(templateData: any): void {
    if (!templateData.name || templateData.name.trim() === '') {
      throw new Error('Template name is required');
    }

    if (!templateData.message_body || templateData.message_body.trim() === '') {
      throw new Error('Template message body is required');
    }

    if (!['whatsapp', 'push', 'both'].includes(templateData.channel)) {
      throw new Error('Invalid channel. Must be whatsapp, push, or both');
    }

    if (!['active', 'inactive', 'draft'].includes(templateData.status)) {
      throw new Error('Invalid status. Must be active, inactive, or draft');
    }
  }

  private extractVariables(text: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  private processTemplateString(template: string, variables: Record<string, any>): string {
    let processed = template;

    // Replace all variables in the format {{variableName}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(regex, String(value));
    });

    return processed;
  }

  // Template statistics
  async getTemplateStats(): Promise<{
    total: number;
    active: number;
    draft: number;
    inactive: number;
    byChannel: Record<string, number>;
    mostUsed: Array<{ templateId: string; name: string; usageCount: number }>;
  }> {
    try {
      const total = await DatabaseService.count('notification_templates');
      const active = await DatabaseService.count('notification_templates', { status: 'active' });
      const draft = await DatabaseService.count('notification_templates', { status: 'draft' });
      const inactive = await DatabaseService.count('notification_templates', { status: 'inactive' });

      // Get by channel
      const whatsapp = await DatabaseService.count('notification_templates', { channel: 'whatsapp' });
      const push = await DatabaseService.count('notification_templates', { channel: 'push' });
      const both = await DatabaseService.count('notification_templates', { channel: 'both' });

      // Get most used templates
      const usageQuery = `
        SELECT template_id, COUNT(*) as usage_count
        FROM notification_queue
        GROUP BY template_id
        ORDER BY usage_count DESC
        LIMIT 10
      `;

      // For now, we'll use a simpler approach
      const templates = await DatabaseService.select('notification_templates', 'id, name');
      const mostUsed = await Promise.all(
        templates.slice(0, 5).map(async template => {
          const usageCount = await DatabaseService.count('notification_queue', { template_id: template.id });
          return {
            templateId: template.id,
            name: template.name,
            usageCount
          };
        })
      );

      mostUsed.sort((a, b) => b.usageCount - a.usageCount);

      return {
        total,
        active,
        draft,
        inactive,
        byChannel: {
          whatsapp,
          push,
          both
        },
        mostUsed
      };
    } catch (error) {
      console.error('Failed to get template stats:', error);
      return {
        total: 0,
        active: 0,
        draft: 0,
        inactive: 0,
        byChannel: { whatsapp: 0, push: 0, both: 0 },
        mostUsed: []
      };
    }
  }

  // Bulk operations
  async bulkUpdateStatus(templateIds: string[], status: 'active' | 'inactive' | 'draft'): Promise<void> {
    try {
      for (const templateId of templateIds) {
        await DatabaseService.update('notification_templates', templateId, {
          status,
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to bulk update template status:', error);
      throw error;
    }
  }

  async duplicateTemplate(templateId: string, newName: string): Promise<NotificationTemplate> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const duplicateData = {
        ...template,
        name: newName,
        status: 'draft' as const,
        f_version: 1
      };

      delete (duplicateData as any).id;
      delete (duplicateData as any).created_at;
      delete (duplicateData as any).updated_at;

      return await this.createTemplate(duplicateData);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      throw error;
    }
  }
}

export const templateService = new TemplateService();