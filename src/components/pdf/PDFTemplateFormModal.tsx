import React, { useState, useEffect } from 'react';
import { X, Save, Eye, Code, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { PDFTemplate } from '../../types/pdfTemplates';
import { pdfTemplateService } from '../../services/pdfTemplateService';

interface PDFTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: PDFTemplate | null;
  onSave: () => void;
}

export const PDFTemplateFormModal: React.FC<PDFTemplateFormModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom' as const,
    htmlContent: '',
    isActive: true
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        type: template.type,
        htmlContent: template.htmlContent,
        isActive: template.isActive
      });
    } else {
      setFormData({
        name: '',
        type: 'custom',
        htmlContent: getDefaultTemplate(),
        isActive: true
      });
    }
  }, [template, isOpen]);

  const getDefaultTemplate = () => {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{documentTitle}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{companyName}}</div>
        <h2>{{documentTitle}}</h2>
    </div>
    
    <div class="content">
        <p>Customer: {{customerName}}</p>
        <p>Date: {{deliveryDate}}</p>
        <p>Amount: {{totalAmount}}</p>
    </div>
</body>
</html>`;
  };

  const extractPlaceholders = (html: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const placeholders: string[] = [];
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const placeholder = `{{${match[1]}}}`;
      if (!placeholders.includes(placeholder)) {
        placeholders.push(placeholder);
      }
    }
    
    return placeholders;
  };

  const handlePreview = () => {
    const previewData = pdfTemplateService.getPreviewData();
    let html = formData.htmlContent;
    
    // Replace placeholders with preview data
    Object.entries(previewData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), value);
    });
    
    setPreviewHtml(html);
    setShowPreview(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const placeholders = extractPlaceholders(formData.htmlContent);
      
      const templateData = {
        ...formData,
        placeholders,
        createdBy: 'current-user@company.com', // This would come from auth context
        tenant_id: 'tenant_1' // This would come from auth context
      };

      if (template) {
        await pdfTemplateService.updateTemplate(template.id, templateData);
        toast({
          title: 'Success',
          description: 'Template updated successfully',
        });
      } else {
        await pdfTemplateService.createTemplate(templateData);
        toast({
          title: 'Success',
          description: 'Template created successfully',
        });
      }

      onSave();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            {!showPreview ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                {/* Form Section */}
                <div className="p-6 border-r space-y-4 overflow-y-auto">
                  <div>
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter template name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Template Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="contract">Contract</option>
                      <option value="receipt">Receipt</option>
                      <option value="invoice">Invoice</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isActive">Active Template</Label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Available Placeholders:</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{{customerName}} - Customer name</div>
                      <div>{{companyName}} - Company name</div>
                      <div>{{deliveryDate}} - Delivery date</div>
                      <div>{{totalAmount}} - Total amount</div>
                      <div>{{productName}} - Product name</div>
                      <div>{{quantity}} - Quantity</div>
                      <div>{{unitPrice}} - Unit price</div>
                      <div>{{warrantyPeriod}} - Warranty period</div>
                      <div>{{contractNumber}} - Contract number</div>
                      <div>{{receiptNumber}} - Receipt number</div>
                    </div>
                  </div>
                </div>

                {/* HTML Editor Section */}
                <div className="col-span-2 p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <Label>HTML Content</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePreview}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                    className="flex-1 w-full p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter HTML content with placeholders..."
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-6 border-b">
                  <h3 className="text-lg font-medium">Template Preview</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                    className="flex items-center gap-2"
                  >
                    <Code className="h-4 w-4" />
                    Back to Editor
                  </Button>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                  <div 
                    className="border rounded-lg p-4 bg-white"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};