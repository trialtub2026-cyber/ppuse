export interface PDFTemplate {
  id: string;
  name: string;
  type: 'contract' | 'receipt' | 'invoice' | 'custom';
  htmlContent: string;
  placeholders: string[];
  isActive: boolean;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tenant_id: string;
}

export interface PDFGenerationRequest {
  templateId: string;
  data: Record<string, any>;
  fileName?: string;
}

export interface PDFGenerationResponse {
  id: string;
  fileName: string;
  downloadUrl: string;
  generatedAt: string;
}

export interface TemplatePreviewData {
  customerName: string;
  companyName: string;
  deliveryDate: string;
  totalAmount: string;
  productName: string;
  quantity: string;
  unitPrice: string;
  warrantyPeriod: string;
  contractNumber: string;
  receiptNumber: string;
}