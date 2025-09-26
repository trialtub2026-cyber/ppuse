import { PDFTemplate, PDFGenerationRequest, PDFGenerationResponse, TemplatePreviewData } from '../types/pdfTemplates';

class PDFTemplateService {
  private baseUrl = '/api/templates/pdf';

  // Template Management
  async getTemplates(): Promise<PDFTemplate[]> {
    // Mock data for development
    return [
      {
        id: '1',
        name: 'Standard Service Contract',
        type: 'contract',
        htmlContent: this.getDefaultContractTemplate(),
        placeholders: ['{{customerName}}', '{{companyName}}', '{{deliveryDate}}', '{{totalAmount}}', '{{productName}}', '{{warrantyPeriod}}', '{{contractNumber}}'],
        isActive: true,
        isDefault: true,
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        tenant_id: 'tenant_1'
      },
      {
        id: '2',
        name: 'Sales Receipt Template',
        type: 'receipt',
        htmlContent: this.getDefaultReceiptTemplate(),
        placeholders: ['{{customerName}}', '{{companyName}}', '{{totalAmount}}', '{{productName}}', '{{quantity}}', '{{unitPrice}}', '{{receiptNumber}}'],
        isActive: true,
        isDefault: true,
        createdBy: 'admin@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        tenant_id: 'tenant_1'
      }
    ];
  }

  async createTemplate(template: Omit<PDFTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PDFTemplate> {
    const newTemplate: PDFTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<PDFTemplate>): Promise<PDFTemplate> {
    const templates = await this.getTemplates();
    const template = templates.find(t => t.id === id);
    if (!template) throw new Error('Template not found');
    
    return {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    };
  }

  async deleteTemplate(id: string): Promise<void> {
    // Mock implementation
    console.log('Deleting template:', id);
  }

  // PDF Generation
  async generatePDF(request: PDFGenerationRequest): Promise<PDFGenerationResponse> {
    // Mock PDF generation
    const fileName = request.fileName || `document_${Date.now()}.pdf`;
    return {
      id: Date.now().toString(),
      fileName,
      downloadUrl: `/api/pdf/download/${Date.now()}`,
      generatedAt: new Date().toISOString()
    };
  }

  // Template Previews
  getPreviewData(): TemplatePreviewData {
    return {
      customerName: 'John Doe',
      companyName: 'ABC Corporation',
      deliveryDate: '2024-12-31',
      totalAmount: '$1,500.00',
      productName: 'Premium Software License',
      quantity: '2',
      unitPrice: '$750.00',
      warrantyPeriod: '1 Year',
      contractNumber: 'CNT-2024-001',
      receiptNumber: 'RCP-2024-001'
    };
  }

  // Default Templates
  private getDefaultContractTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Service Contract</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .contract-title { font-size: 20px; margin-top: 10px; color: #666; }
        .section { margin: 20px 0; }
        .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table th, .details-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .details-table th { background-color: #f5f5f5; font-weight: bold; }
        .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; text-align: center; border-top: 1px solid #333; padding-top: 10px; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{companyName}}</div>
        <div class="contract-title">SERVICE CONTRACT</div>
        <div>Contract No: {{contractNumber}}</div>
    </div>

    <div class="section">
        <div class="section-title">Contract Details</div>
        <table class="details-table">
            <tr>
                <th>Customer Name</th>
                <td>{{customerName}}</td>
            </tr>
            <tr>
                <th>Product/Service</th>
                <td>{{productName}}</td>
            </tr>
            <tr>
                <th>Delivery Date</th>
                <td>{{deliveryDate}}</td>
            </tr>
            <tr>
                <th>Total Amount</th>
                <td>{{totalAmount}}</td>
            </tr>
            <tr>
                <th>Warranty Period</th>
                <td>{{warrantyPeriod}}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Terms and Conditions</div>
        <p>1. This contract is valid from the delivery date for the specified warranty period.</p>
        <p>2. All services will be provided according to the agreed specifications.</p>
        <p>3. Payment terms: Net 30 days from delivery date.</p>
        <p>4. Warranty covers defects in materials and workmanship.</p>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div>Customer Signature</div>
            <div>{{customerName}}</div>
            <div>Date: _____________</div>
        </div>
        <div class="signature-box">
            <div>Company Representative</div>
            <div>{{companyName}}</div>
            <div>Date: _____________</div>
        </div>
    </div>

    <div class="footer">
        <p>This is a legally binding contract. Please read all terms carefully before signing.</p>
    </div>
</body>
</html>`;
  }

  private getDefaultReceiptTemplate(): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sales Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .receipt-title { font-size: 20px; margin-top: 10px; color: #666; }
        .receipt-info { display: flex; justify-content: space-between; margin: 20px 0; }
        .customer-info, .receipt-details { width: 48%; }
        .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #f5f5f5; font-weight: bold; }
        .total-section { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{companyName}}</div>
        <div class="receipt-title">SALES RECEIPT</div>
        <div>Receipt No: {{receiptNumber}}</div>
    </div>

    <div class="receipt-info">
        <div class="customer-info">
            <div class="section-title">Bill To:</div>
            <div>{{customerName}}</div>
        </div>
        <div class="receipt-details">
            <div class="section-title">Receipt Details:</div>
            <div>Date: {{deliveryDate}}</div>
            <div>Receipt #: {{receiptNumber}}</div>
        </div>
    </div>

    <div class="section">
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{productName}}</td>
                    <td>{{quantity}}</td>
                    <td>{{unitPrice}}</td>
                    <td>{{totalAmount}}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="total-section">
        <div>Total Amount: {{totalAmount}}</div>
    </div>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>For questions about this receipt, please contact us.</p>
    </div>
</body>
</html>`;
  }
}

export const pdfTemplateService = new PDFTemplateService();