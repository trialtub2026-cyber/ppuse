import React, { useState, useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { PDFTemplate } from '../../types/pdfTemplates';
import { pdfTemplateService } from '../../services/pdfTemplateService';
import { useToast } from '../../hooks/use-toast';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: PDFTemplate | null;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const [previewHtml, setPreviewHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (template && isOpen) {
      generatePreview();
    }
  }, [template, isOpen]);

  const generatePreview = () => {
    if (!template) return;

    const previewData = pdfTemplateService.getPreviewData();
    let html = template.htmlContent;
    
    // Replace placeholders with preview data
    Object.entries(previewData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), value);
    });
    
    setPreviewHtml(html);
  };

  const handleGeneratePDF = async () => {
    if (!template) return;

    setLoading(true);
    try {
      const previewData = pdfTemplateService.getPreviewData();
      const response = await pdfTemplateService.generatePDF({
        templateId: template.id,
        data: previewData,
        fileName: `preview_${template.name.toLowerCase().replace(/\s+/g, '_')}.pdf`
      });
      
      toast({
        title: 'Success',
        description: 'PDF generated successfully',
      });
      
      // In a real implementation, this would trigger a download
      console.log('Generated PDF:', response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">{template.name}</h2>
              <p className="text-sm text-gray-600">Template Preview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleGeneratePDF}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Generating...' : 'Generate PDF'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Preview with Sample Data:</h3>
            <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
              <div>Customer: John Doe</div>
              <div>Company: ABC Corporation</div>
              <div>Date: 2024-12-31</div>
              <div>Amount: $1,500.00</div>
            </div>
          </div>
          
          <div 
            className="border rounded-lg p-6 bg-white shadow-sm"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  );
};