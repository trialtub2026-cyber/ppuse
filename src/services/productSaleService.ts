import { 
  ProductSale, 
  ProductSaleFormData, 
  ProductSaleFilters, 
  ProductSalesResponse,
  ProductSalesAnalytics,
  FileAttachment
} from '@/types/productSales';
import { pdfTemplateService } from './pdfTemplateService';
import { PDFGenerationResponse } from '@/types/pdfTemplates';

// Mock data for development
const mockProductSales: ProductSale[] = [
  {
    id: '1',
    customer_id: 'cust-001',
    customer_name: 'Acme Corporation',
    product_id: 'prod-001',
    product_name: 'Enterprise CRM Suite',
    units: 5,
    cost_per_unit: 2500.00,
    total_cost: 12500.00,
    delivery_date: '2024-01-15',
    warranty_expiry: '2025-01-15',
    status: 'new',
    notes: 'Initial deployment for sales team. Includes training and setup.',
    attachments: [
      {
        id: 'att-001',
        name: 'purchase_order.pdf',
        size: 245760,
        type: 'application/pdf',
        url: '/api/files/att-001',
        uploaded_at: '2024-01-10T10:30:00Z'
      }
    ],
    service_contract_id: 'sc-001',
    tenant_id: 'tenant-001',
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-01-10T10:30:00Z',
    created_by: 'user-001'
  },
  {
    id: '2',
    customer_id: 'cust-002',
    customer_name: 'TechStart Inc',
    product_id: 'prod-002',
    product_name: 'Analytics Dashboard Pro',
    units: 2,
    cost_per_unit: 1800.00,
    total_cost: 3600.00,
    delivery_date: '2024-02-01',
    warranty_expiry: '2025-02-01',
    status: 'new',
    notes: 'Startup package with extended support.',
    attachments: [],
    service_contract_id: 'sc-002',
    tenant_id: 'tenant-001',
    created_at: '2024-01-25T14:20:00Z',
    updated_at: '2024-01-25T14:20:00Z',
    created_by: 'user-002'
  },
  {
    id: '3',
    customer_id: 'cust-003',
    customer_name: 'Global Enterprises',
    product_id: 'prod-001',
    product_name: 'Enterprise CRM Suite',
    units: 25,
    cost_per_unit: 2200.00,
    total_cost: 55000.00,
    delivery_date: '2023-12-01',
    warranty_expiry: '2024-12-01',
    status: 'expired',
    notes: 'Large enterprise deployment. Renewal due.',
    attachments: [
      {
        id: 'att-002',
        name: 'contract_signed.pdf',
        size: 512000,
        type: 'application/pdf',
        url: '/api/files/att-002',
        uploaded_at: '2023-11-28T16:45:00Z'
      },
      {
        id: 'att-003',
        name: 'technical_specs.docx',
        size: 128000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '/api/files/att-003',
        uploaded_at: '2023-11-28T16:45:00Z'
      }
    ],
    service_contract_id: 'sc-003',
    tenant_id: 'tenant-001',
    created_at: '2023-11-28T16:45:00Z',
    updated_at: '2024-01-15T09:30:00Z',
    created_by: 'user-001'
  }
];

class ProductSaleService {
  private baseUrl = '/api/product-sale';

  // Get all product sales with filtering and pagination
  async getProductSales(
    filters: ProductSaleFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<ProductSalesResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredSales = [...mockProductSales];

      // Apply filters
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredSales = filteredSales.filter(sale =>
          sale.customer_name?.toLowerCase().includes(searchLower) ||
          sale.product_name?.toLowerCase().includes(searchLower) ||
          sale.notes.toLowerCase().includes(searchLower)
        );
      }

      if (filters.customer_id) {
        filteredSales = filteredSales.filter(sale => sale.customer_id === filters.customer_id);
      }

      if (filters.product_id) {
        filteredSales = filteredSales.filter(sale => sale.product_id === filters.product_id);
      }

      if (filters.status) {
        filteredSales = filteredSales.filter(sale => sale.status === filters.status);
      }

      if (filters.date_from) {
        filteredSales = filteredSales.filter(sale => sale.delivery_date >= filters.date_from!);
      }

      if (filters.date_to) {
        filteredSales = filteredSales.filter(sale => sale.delivery_date <= filters.date_to!);
      }

      if (filters.min_amount) {
        filteredSales = filteredSales.filter(sale => sale.total_cost >= filters.min_amount!);
      }

      if (filters.max_amount) {
        filteredSales = filteredSales.filter(sale => sale.total_cost <= filters.max_amount!);
      }

      // Pagination
      const total = filteredSales.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const data = filteredSales.slice(startIndex, endIndex);

      return {
        data,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching product sales:', error);
      throw new Error('Failed to fetch product sales');
    }
  }

  // Get single product sale by ID
  async getProductSaleById(id: string): Promise<ProductSale> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const sale = mockProductSales.find(s => s.id === id);
      if (!sale) {
        throw new Error('Product sale not found');
      }

      return sale;
    } catch (error) {
      console.error('Error fetching product sale:', error);
      throw error;
    }
  }

  // Create new product sale
  async createProductSale(data: ProductSaleFormData): Promise<ProductSale> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Calculate warranty expiry (delivery date + 1 year)
      const deliveryDate = new Date(data.delivery_date);
      const warrantyExpiry = new Date(deliveryDate);
      warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + 1);

      // Determine status based on warranty expiry
      const now = new Date();
      let status: 'new' | 'renewed' | 'expired' = 'new';
      if (warrantyExpiry < now) {
        status = 'expired';
      }

      const newSale: ProductSale = {
        id: `ps-${Date.now()}`,
        customer_id: data.customer_id,
        customer_name: 'Customer Name', // Would be fetched from customer service
        product_id: data.product_id,
        product_name: 'Product Name', // Would be fetched from product service
        units: data.units,
        cost_per_unit: data.cost_per_unit,
        total_cost: data.units * data.cost_per_unit,
        delivery_date: data.delivery_date,
        warranty_expiry: warrantyExpiry.toISOString().split('T')[0],
        status,
        notes: data.notes,
        attachments: [], // File uploads would be handled separately
        tenant_id: 'tenant-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user'
      };

      // Add to mock data
      mockProductSales.unshift(newSale);

      // Auto-generate service contract
      await this.createServiceContract(newSale);

      return newSale;
    } catch (error) {
      console.error('Error creating product sale:', error);
      throw new Error('Failed to create product sale');
    }
  }

  // Update existing product sale
  async updateProductSale(id: string, data: Partial<ProductSaleFormData>): Promise<ProductSale> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const index = mockProductSales.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error('Product sale not found');
      }

      const existingSale = mockProductSales[index];
      const updatedSale: ProductSale = {
        ...existingSale,
        ...data,
        total_cost: data.units && data.cost_per_unit 
          ? data.units * data.cost_per_unit 
          : existingSale.total_cost,
        updated_at: new Date().toISOString()
      };

      // Recalculate warranty expiry if delivery date changed
      if (data.delivery_date) {
        const deliveryDate = new Date(data.delivery_date);
        const warrantyExpiry = new Date(deliveryDate);
        warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + 1);
        updatedSale.warranty_expiry = warrantyExpiry.toISOString().split('T')[0];

        // Update status based on new warranty expiry
        const now = new Date();
        if (warrantyExpiry < now) {
          updatedSale.status = 'expired';
        } else {
          updatedSale.status = 'new';
        }
      }

      mockProductSales[index] = updatedSale;
      return updatedSale;
    } catch (error) {
      console.error('Error updating product sale:', error);
      throw new Error('Failed to update product sale');
    }
  }

  // Delete product sale
  async deleteProductSale(id: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const index = mockProductSales.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error('Product sale not found');
      }

      mockProductSales.splice(index, 1);
    } catch (error) {
      console.error('Error deleting product sale:', error);
      throw new Error('Failed to delete product sale');
    }
  }

  // Get analytics data
  async getAnalytics(): Promise<ProductSalesAnalytics> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const totalSales = mockProductSales.length;
      const totalRevenue = mockProductSales.reduce((sum, sale) => sum + sale.total_cost, 0);
      const averageDealSize = totalRevenue / totalSales;

      // Mock monthly data
      const salesByMonth = [
        { month: '2024-01', sales_count: 5, revenue: 25000 },
        { month: '2024-02', sales_count: 8, revenue: 42000 },
        { month: '2024-03', sales_count: 12, revenue: 68000 },
        { month: '2024-04', sales_count: 15, revenue: 85000 },
        { month: '2024-05', sales_count: 18, revenue: 95000 },
        { month: '2024-06', sales_count: 22, revenue: 125000 }
      ];

      // Top products
      const topProducts = [
        { product_id: 'prod-001', product_name: 'Enterprise CRM Suite', total_sales: 15, total_revenue: 125000, units_sold: 45 },
        { product_id: 'prod-002', product_name: 'Analytics Dashboard Pro', total_sales: 8, total_revenue: 65000, units_sold: 28 },
        { product_id: 'prod-003', product_name: 'Security Module', total_sales: 5, total_revenue: 35000, units_sold: 15 }
      ];

      // Top customers
      const topCustomers = [
        { customer_id: 'cust-001', customer_name: 'Acme Corporation', total_sales: 3, total_revenue: 45000, last_purchase: '2024-06-15' },
        { customer_id: 'cust-002', customer_name: 'TechStart Inc', total_sales: 2, total_revenue: 28000, last_purchase: '2024-06-10' },
        { customer_id: 'cust-003', customer_name: 'Global Enterprises', total_sales: 4, total_revenue: 85000, last_purchase: '2024-06-20' }
      ];

      // Status distribution
      const statusCounts = mockProductSales.reduce((acc, sale) => {
        acc[sale.status] = (acc[sale.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: (count / totalSales) * 100
      }));

      // Warranty expiring soon (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const warrantyExpiringSoon = mockProductSales.filter(sale => {
        const warrantyDate = new Date(sale.warranty_expiry);
        return warrantyDate <= thirtyDaysFromNow && warrantyDate >= new Date();
      });

      return {
        total_sales: totalSales,
        total_revenue: totalRevenue,
        average_deal_size: averageDealSize,
        sales_by_month: salesByMonth,
        top_products: topProducts,
        top_customers: topCustomers,
        status_distribution: statusDistribution,
        warranty_expiring_soon: warrantyExpiringSoon
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  // Upload file attachment
  async uploadAttachment(saleId: string, file: File): Promise<FileAttachment> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const attachment: FileAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: `/api/files/att-${Date.now()}`,
        uploaded_at: new Date().toISOString()
      };

      // Add attachment to the sale
      const sale = mockProductSales.find(s => s.id === saleId);
      if (sale) {
        sale.attachments.push(attachment);
      }

      return attachment;
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  // Delete file attachment
  async deleteAttachment(saleId: string, attachmentId: string): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const sale = mockProductSales.find(s => s.id === saleId);
      if (sale) {
        const index = sale.attachments.findIndex(att => att.id === attachmentId);
        if (index !== -1) {
          sale.attachments.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw new Error('Failed to delete attachment');
    }
  }

  // Generate PDF for product sale
  async generatePdf(saleId: string): Promise<PDFGenerationResponse> {
    try {
      const sale = mockProductSales.find(s => s.id === saleId);
      if (!sale) {
        throw new Error('Product sale not found');
      }

      const pdfData = await pdfTemplateService.generatePdf(sale);
      return pdfData;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  // Generate PDF for product sales report
  async generateReportPdf(filters: ProductSaleFilters): Promise<PDFGenerationResponse> {
    try {
      const sales = await this.getProductSales(filters);
      const pdfData = await pdfTemplateService.generateReportPdf(sales);
      return pdfData;
    } catch (error) {
      console.error('Error generating report PDF:', error);
      throw new Error('Failed to generate report PDF');
    }
  }

  // Private method to auto-create service contract
  private async createServiceContract(productSale: ProductSale): Promise<void> {
    try {
      // This would call the service contract service
      // For now, just simulate the creation
      console.log('Auto-creating service contract for product sale:', productSale.id);
      
      // The service contract would be created with:
      // - Start date: delivery date
      // - End date: delivery date + 1 year
      // - Contract value: total cost
      // - Auto-renewal: true by default
      // - Service level: standard by default
    } catch (error) {
      console.error('Error creating service contract:', error);
      // Don't throw error here as it shouldn't block the product sale creation
    }
  }

  // Generate Contract PDF for product sale
  async generateContractPDF(saleId: string): Promise<PDFGenerationResponse> {
    try {
      const sale = await this.getProductSaleById(saleId);
      const templates = await pdfTemplateService.getTemplates();
      const contractTemplate = templates.find(t => t.type === 'contract' && t.isDefault);
      
      if (!contractTemplate) {
        throw new Error('No default contract template found');
      }

      return await pdfTemplateService.generatePDF({
        templateId: contractTemplate.id,
        data: {
          customerName: sale.customer_name,
          companyName: 'Your Company Name',
          deliveryDate: sale.delivery_date,
          totalAmount: `$${sale.total_cost.toFixed(2)}`,
          productName: sale.product_name,
          warrantyPeriod: '1 Year',
          contractNumber: `CNT-${sale.id}`
        },
        fileName: `contract_${sale.id}.pdf`
      });
    } catch (error) {
      console.error('Error generating contract PDF:', error);
      throw new Error('Failed to generate contract PDF');
    }
  }

  // Generate Receipt PDF for product sale
  async generateReceiptPDF(saleId: string): Promise<PDFGenerationResponse> {
    try {
      const sale = await this.getProductSaleById(saleId);
      const templates = await pdfTemplateService.getTemplates();
      const receiptTemplate = templates.find(t => t.type === 'receipt' && t.isDefault);
      
      if (!receiptTemplate) {
        throw new Error('No default receipt template found');
      }

      return await pdfTemplateService.generatePDF({
        templateId: receiptTemplate.id,
        data: {
          customerName: sale.customer_name,
          companyName: 'Your Company Name',
          deliveryDate: sale.delivery_date,
          totalAmount: `$${sale.total_cost.toFixed(2)}`,
          productName: sale.product_name,
          quantity: sale.units.toString(),
          unitPrice: `$${sale.cost_per_unit.toFixed(2)}`,
          receiptNumber: `RCP-${sale.id}`
        },
        fileName: `receipt_${sale.id}.pdf`
      });
    } catch (error) {
      console.error('Error generating receipt PDF:', error);
      throw new Error('Failed to generate receipt PDF');
    }
  }
}

export const productSaleService = new ProductSaleService();