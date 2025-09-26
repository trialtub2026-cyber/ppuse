import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Download, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { PDFTemplate } from '../types/pdfTemplates';
import { pdfTemplateService } from '../services/pdfTemplateService';
import { PDFTemplateFormModal } from '../components/pdf/PDFTemplateFormModal';
import { PDFPreviewModal } from '../components/pdf/PDFPreviewModal';

export const PDFTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await pdfTemplateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load PDF templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleEditTemplate = (template: PDFTemplate) => {
    setSelectedTemplate(template);
    setIsFormModalOpen(true);
  };

  const handlePreviewTemplate = (template: PDFTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteTemplate = async (template: PDFTemplate) => {
    if (template.isDefault) {
      toast({
        title: 'Cannot Delete',
        description: 'Default templates cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await pdfTemplateService.deleteTemplate(template.id);
        await loadTemplates();
        toast({
          title: 'Success',
          description: 'Template deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete template',
          variant: 'destructive',
        });
      }
    }
  };

  const handleGenerateTestPDF = async (template: PDFTemplate) => {
    try {
      const previewData = pdfTemplateService.getPreviewData();
      const response = await pdfTemplateService.generatePDF({
        templateId: template.id,
        data: previewData,
        fileName: `test_${template.name.toLowerCase().replace(/\s+/g, '_')}.pdf`
      });
      
      toast({
        title: 'Success',
        description: 'Test PDF generated successfully',
      });
      
      // In a real implementation, this would trigger a download
      console.log('Generated PDF:', response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate test PDF',
        variant: 'destructive',
      });
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'bg-blue-100 text-blue-800';
      case 'receipt': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PDF Templates</h1>
          <p className="text-gray-600">Manage document templates for contracts, receipts, and invoices</p>
        </div>
        <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="contract">Contract</option>
          <option value="receipt">Receipt</option>
          <option value="invoice">Invoice</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={getTypeColor(template.type)}>
                    {template.type}
                  </Badge>
                  {template.isDefault && (
                    <Badge variant="outline">Default</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <div>Placeholders: {template.placeholders.length}</div>
                <div>Status: {template.isActive ? 'Active' : 'Inactive'}</div>
                <div>Updated: {new Date(template.updatedAt).toLocaleDateString()}</div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewTemplate(template)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGenerateTestPDF(template)}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Test
                </Button>
                {!template.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedType !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Create your first PDF template to get started'}
          </p>
          {(!searchTerm && selectedType === 'all') && (
            <Button onClick={handleCreateTemplate}>
              Create Template
            </Button>
          )}
        </div>
      )}

      <PDFTemplateFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        template={selectedTemplate}
        onSave={loadTemplates}
      />

      <PDFPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        template={selectedTemplate}
      />
    </div>
  );
};