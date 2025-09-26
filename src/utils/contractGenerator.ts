// Contract PDF Generation Utilities

import { ContractGenerationData, ContractTemplate } from '@/types/productSales';

export class ContractGenerator {
  // Generate HTML content from template
  static generateHTMLContent(data: ContractGenerationData): string {
    let htmlContent = data.template.content;

    // Replace all template variables
    const variables = {
      contract_number: data.service_contract.contract_number,
      start_date: this.formatDate(data.service_contract.start_date),
      end_date: this.formatDate(data.service_contract.end_date),
      company_name: data.company?.name || 'Your Company Name',
      customer_name: data.customer?.name || data.service_contract.customer_name,
      product_name: data.product?.name || data.service_contract.product_name,
      units: data.product_sale.units.toString(),
      contract_value: this.formatCurrency(data.service_contract.contract_value),
      service_level: this.formatServiceLevel(data.service_contract.service_level),
      warranty_period: data.service_contract.warranty_period.toString(),
      auto_renewal: data.service_contract.auto_renewal ? 'Yes' : 'No',
      terms: data.service_contract.terms,
      delivery_date: this.formatDate(data.product_sale.delivery_date),
      warranty_expiry: this.formatDate(data.product_sale.warranty_expiry),
      total_cost: this.formatCurrency(data.product_sale.total_cost),
      cost_per_unit: this.formatCurrency(data.product_sale.cost_per_unit),
      renewal_notice_period: `${data.service_contract.renewal_notice_period} days`,
      current_date: this.formatDate(new Date().toISOString().split('T')[0])
    };

    // Replace variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, value);
    });

    return htmlContent;
  }

  // Generate PDF using HTML content (mock implementation)
  static async generatePDF(htmlContent: string, contractId: string): Promise<string> {
    try {
      // In a real implementation, this would use a library like:
      // - Puppeteer for server-side PDF generation
      // - jsPDF for client-side PDF generation
      // - PDFKit for Node.js PDF generation
      
      // Mock PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add CSS styling to HTML
      const styledHTML = this.addStyling(htmlContent);

      // Simulate PDF generation and return URL
      const pdfUrl = `/api/contracts/${contractId}.pdf`;
      
      console.log('Generated PDF for contract:', contractId);
      console.log('Styled HTML content:', styledHTML);

      return pdfUrl;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF contract');
    }
  }

  // Add CSS styling to HTML content
  private static addStyling(htmlContent: string): string {
    const css = `
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        
        h1 {
          color: #2563eb;
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 10px;
          margin-bottom: 30px;
          font-size: 28px;
        }
        
        h2 {
          color: #1e40af;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 18px;
        }
        
        p {
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        strong {
          color: #374151;
          font-weight: 600;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
          page-break-inside: avoid;
        }
        
        .signature-block {
          width: 45%;
          text-align: center;
        }
        
        .signature-block p {
          margin: 5px 0;
        }
        
        .contract-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .contract-details {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .terms-section {
          background: #fefefe;
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin: 20px 0;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .signatures {
            page-break-inside: avoid;
          }
        }
      </style>
    `;

    return `<!DOCTYPE html><html><head>${css}</head><body>${htmlContent}</body></html>`;
  }

  // Format date for display
  private static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Format currency for display
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  // Format service level for display
  private static formatServiceLevel(level: string): string {
    const levels = {
      basic: 'Basic Support (8x5, Email)',
      standard: 'Standard Support (8x5, Phone & Email)',
      premium: 'Premium Support (24x7, Priority)',
      enterprise: 'Enterprise Support (24x7, Dedicated Manager)'
    };
    
    return levels[level as keyof typeof levels] || level;
  }

  // Validate template variables
  static validateTemplate(template: ContractTemplate): { isValid: boolean; missingVariables: string[] } {
    const requiredVariables = [
      'contract_number',
      'start_date',
      'end_date',
      'customer_name',
      'product_name',
      'contract_value',
      'service_level'
    ];

    const missingVariables = requiredVariables.filter(variable => 
      !template.content.includes(`{{${variable}}}`)
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables
    };
  }

  // Preview contract content without generating PDF
  static previewContract(data: ContractGenerationData): string {
    const htmlContent = this.generateHTMLContent(data);
    return this.addStyling(htmlContent);
  }

  // Extract variables from template content
  static extractVariables(templateContent: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(templateContent)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables.sort();
  }

  // Generate contract filename
  static generateFilename(contractNumber: string, customerName: string): string {
    const sanitizedCustomer = customerName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `${contractNumber}_${sanitizedCustomer}_${timestamp}.pdf`;
  }
}

// Default contract template
export const DEFAULT_CONTRACT_TEMPLATE = `
<div class="contract-header">
  <h1>SERVICE CONTRACT</h1>
  <p><strong>Contract Number:</strong> {{contract_number}}</p>
  <p><strong>Date:</strong> {{current_date}}</p>
</div>

<h2>CONTRACTING PARTIES</h2>
<div class="contract-details">
  <p><strong>Service Provider:</strong><br>
  {{company_name}}<br>
  [Company Address]<br>
  [Phone] | [Email]</p>
  
  <p><strong>Customer:</strong><br>
  {{customer_name}}<br>
  [Customer Address]<br>
  [Phone] | [Email]</p>
</div>

<h2>PRODUCT AND SERVICE DETAILS</h2>
<div class="contract-details">
  <p><strong>Product:</strong> {{product_name}}</p>
  <p><strong>Units Purchased:</strong> {{units}}</p>
  <p><strong>Cost per Unit:</strong> {{cost_per_unit}}</p>
  <p><strong>Total Purchase Value:</strong> {{total_cost}}</p>
  <p><strong>Delivery Date:</strong> {{delivery_date}}</p>
</div>

<h2>SERVICE CONTRACT TERMS</h2>
<div class="contract-details">
  <p><strong>Contract Value:</strong> {{contract_value}}</p>
  <p><strong>Service Level:</strong> {{service_level}}</p>
  <p><strong>Contract Period:</strong> {{start_date}} to {{end_date}}</p>
  <p><strong>Warranty Period:</strong> {{warranty_period}} months</p>
  <p><strong>Warranty Expiry:</strong> {{warranty_expiry}}</p>
  <p><strong>Auto Renewal:</strong> {{auto_renewal}}</p>
  <p><strong>Renewal Notice Period:</strong> {{renewal_notice_period}}</p>
</div>

<h2>TERMS AND CONDITIONS</h2>
<div class="terms-section">
  <p>{{terms}}</p>
  
  <p><strong>Additional Terms:</strong></p>
  <ul>
    <li>This contract is governed by the laws of [Jurisdiction]</li>
    <li>Any disputes shall be resolved through binding arbitration</li>
    <li>Service provider reserves the right to modify terms with 30 days notice</li>
    <li>Customer is responsible for providing necessary access and cooperation</li>
    <li>Service levels are subject to the agreed SLA document</li>
  </ul>
</div>

<h2>SIGNATURES</h2>
<div class="signatures">
  <div class="signature-block">
    <p><strong>Service Provider</strong></p>
    <br><br>
    <p>_________________________</p>
    <p>Authorized Signature</p>
    <p>Date: _________________</p>
  </div>
  <div class="signature-block">
    <p><strong>Customer</strong></p>
    <br><br>
    <p>_________________________</p>
    <p>Authorized Signature</p>
    <p>Date: _________________</p>
  </div>
</div>

<div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
  <p>This contract was generated on {{current_date}} and is legally binding upon signature by both parties.</p>
</div>
`;