import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  MessageSquare, 
  Smartphone, 
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { templateService } from '@/services/templateService';
import { NotificationTemplate } from '@/types/notifications';

interface TemplateManagerProps {
  className?: string;
}

export function TemplateManager({ className }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [filterChannel, filterStatus]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (filterChannel !== 'all') {
        filters.channel = filterChannel;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const result = await templateService.listTemplates(filters);
      setTemplates(result.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (templateData: any) => {
    try {
      await templateService.createTemplate(templateData);
      await loadTemplates();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUpdateTemplate = async (templateId: string, updates: any) => {
    try {
      await templateService.updateTemplate(templateId, updates);
      await loadTemplates();
      setIsEditDialogOpen(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templateService.deleteTemplate(templateId);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleDuplicateTemplate = async (template: NotificationTemplate) => {
    try {
      const newName = `${template.name} (Copy)`;
      await templateService.duplicateTemplate(template.id, newName);
      await loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.message_body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'push':
        return <Smartphone className="h-4 w-4 text-blue-600" />;
      case 'both':
        return (
          <div className="flex gap-1">
            <MessageSquare className="h-3 w-3 text-green-600" />
            <Smartphone className="h-3 w-3 text-blue-600" />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-600">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Manager</h1>
          <p className="text-muted-foreground">
            Create and manage notification templates
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Create a new notification template for WhatsApp or Push notifications
              </DialogDescription>
            </DialogHeader>
            <TemplateForm onSubmit={handleCreateTemplate} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterChannel} onValueChange={setFilterChannel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="push">Push</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {getChannelIcon(template.channel)}
                      <span className="capitalize">{template.channel}</span>
                      <span>•</span>
                      <span>v{template.f_version}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(template.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {template.message_body}
                  </p>
                  
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable) => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                      {template.variables.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsPreviewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicateTemplate(template)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || filterChannel !== 'all' || filterStatus !== 'all'
                ? 'No templates match your current filters.'
                : 'Get started by creating your first notification template.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the template details and content
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <TemplateForm
              template={selectedTemplate}
              onSubmit={(data) => handleUpdateTemplate(selectedTemplate.id, data)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview how this template will appear to recipients
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <TemplatePreview template={selectedTemplate} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Form Component
function TemplateForm({ 
  template, 
  onSubmit 
}: { 
  template?: NotificationTemplate; 
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    channel: template?.channel || 'both',
    language: template?.language || 'en',
    title: template?.title || '',
    message_body: template?.message_body || '',
    whatsapp_template_id: template?.whatsapp_template_id || '',
    status: template?.status || 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="channel">Channel</Label>
          <Select value={formData.channel} onValueChange={(value) => setFormData({ ...formData, channel: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="push">Push Notification</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            placeholder="en"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title (for Push Notifications)</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Notification title"
        />
      </div>

      <div>
        <Label htmlFor="message_body">Message Body</Label>
        <Textarea
          id="message_body"
          value={formData.message_body}
          onChange={(e) => setFormData({ ...formData, message_body: e.target.value })}
          placeholder="Your message here. Use {{variable}} for dynamic content."
          rows={4}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use double curly braces for variables: {{customerName}}, {{amount}}, etc.
        </p>
      </div>

      {(formData.channel === 'whatsapp' || formData.channel === 'both') && (
        <div>
          <Label htmlFor="whatsapp_template_id">WhatsApp Template ID</Label>
          <Input
            id="whatsapp_template_id"
            value={formData.whatsapp_template_id}
            onChange={(e) => setFormData({ ...formData, whatsapp_template_id: e.target.value })}
            placeholder="hello_world"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The approved template ID from WhatsApp Business Manager
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit">
          {template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}

// Template Preview Component
function TemplatePreview({ template }: { template: NotificationTemplate }) {
  const [previewData, setPreviewData] = useState<any>(null);
  const [sampleVariables, setSampleVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPreview();
  }, [template, sampleVariables]);

  const loadPreview = async () => {
    try {
      const preview = await templateService.previewTemplate(template.id, sampleVariables);
      setPreviewData(preview);
    } catch (error) {
      console.error('Failed to load preview:', error);
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setSampleVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  return (
    <div className="space-y-4">
      {/* Variable Inputs */}
      {template.variables && template.variables.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Sample Variables</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {template.variables.map((variable) => (
              <div key={variable}>
                <Label htmlFor={variable} className="text-xs">{variable}</Label>
                <Input
                  id={variable}
                  size="sm"
                  value={sampleVariables[variable] || ''}
                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                  placeholder={`Sample ${variable}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="space-y-4">
        {(template.channel === 'push' || template.channel === 'both') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                Push Notification Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-4 max-w-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bell className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">Your App</span>
                  <span className="text-xs text-gray-500 ml-auto">now</span>
                </div>
                <div className="text-sm font-medium mb-1">
                  {previewData?.title || template.title || 'Notification'}
                </div>
                <div className="text-sm text-gray-600">
                  {previewData?.message || template.message_body}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(template.channel === 'whatsapp' || template.channel === 'both') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                WhatsApp Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 rounded-lg p-4 max-w-sm">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-sm">
                    {previewData?.message || template.message_body}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-right">
                    ✓✓ Delivered
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {previewData?.missingVariables && previewData.missingVariables.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800">
            <strong>Missing variables:</strong> {previewData.missingVariables.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}