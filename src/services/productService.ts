import { Product } from '@/types/masters';
import { authService } from './authService';

class ProductService {
  private baseUrl = '/api/products';

  // Mock data for demonstration
  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'Industrial Motor Assembly',
      sku: 'IMA-001',
      type: 'Hardware',
      description: 'High-performance industrial motor assembly for manufacturing equipment',
      category: 'Motors',
      price: 1500,
      currency: 'USD',
      cost: 1000,
      stock_quantity: 25,
      min_stock_level: 5,
      max_stock_level: 100,
      unit: 'piece',
      weight: 15.5,
      dimensions: '30x20x15 cm',
      supplier_id: '1',
      supplier_name: 'Motor Tech Solutions',
      status: 'active',
      warranty_period: 12,
      service_contract_available: true,
      tags: ['industrial', 'motor', 'assembly'],
      tenant_id: 'tenant_1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: '2',
      name: 'Conveyor Belt Component',
      sku: 'CBC-002',
      type: 'Hardware',
      description: 'Durable conveyor belt component for automated production lines',
      category: 'Conveyor Systems',
      price: 800,
      currency: 'USD',
      cost: 500,
      stock_quantity: 50,
      min_stock_level: 10,
      max_stock_level: 200,
      unit: 'piece',
      weight: 8.2,
      dimensions: '25x15x10 cm',
      supplier_id: '2',
      supplier_name: 'Conveyor Pro Ltd',
      status: 'active',
      warranty_period: 6,
      service_contract_available: true,
      tags: ['conveyor', 'belt', 'component'],
      tenant_id: 'tenant_1',
      created_at: '2024-01-16T09:00:00Z',
      updated_at: '2024-01-22T11:15:00Z'
    },
    {
      id: '3',
      name: 'Control System Module',
      sku: 'CSM-003',
      type: 'Software',
      description: 'Advanced control system module with programmable logic controller',
      category: 'Control Systems',
      price: 2000,
      currency: 'USD',
      cost: 1300,
      stock_quantity: 15,
      min_stock_level: 3,
      max_stock_level: 50,
      unit: 'piece',
      weight: 5.8,
      dimensions: '20x15x8 cm',
      supplier_id: '3',
      supplier_name: 'Control Tech Inc',
      status: 'active',
      warranty_period: 24,
      service_contract_available: true,
      tags: ['control', 'system', 'module', 'plc'],
      tenant_id: 'tenant_1',
      created_at: '2024-01-18T13:00:00Z',
      updated_at: '2024-01-25T16:45:00Z'
    }
  ];

  async getProducts(page: number = 1, limit: number = 10, filters?: {
    category?: string;
    status?: string;
    search?: string;
    type?: string;
  }): Promise<{
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let products = this.mockProducts.filter(p => p.tenant_id === user.tenant_id);

    // Apply filters
    if (filters) {
      if (filters.category) {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.status) {
        products = products.filter(p => p.status === filters.status);
      }
      if (filters.type) {
        products = products.filter(p => p.type === filters.type);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          (p.description && p.description.toLowerCase().includes(search))
        );
      }
    }

    // Sort products
    products = products.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = products.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getProduct(id: string): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const product = this.mockProducts.find(p => 
      p.id === id && p.tenant_id === user.tenant_id
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async createProduct(data: any): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    // Check if SKU already exists
    const existingSku = this.mockProducts.find(p => 
      p.sku === data.sku && p.tenant_id === user.tenant_id
    );
    if (existingSku) {
      throw new Error('SKU already exists');
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: data.name,
      sku: data.sku,
      type: data.type,
      category: data.category,
      description: data.description || '',
      price: data.price,
      currency: data.currency || 'USD',
      cost: data.price * 0.7, // Default cost as 70% of price
      stock_quantity: 0,
      min_stock_level: 5,
      max_stock_level: 100,
      unit: 'piece',
      weight: 0,
      dimensions: '',
      supplier_id: '',
      supplier_name: '',
      status: data.status,
      warranty_period: data.warranty_period || 0,
      service_contract_available: data.service_contract_available || false,
      tags: [],
      tenant_id: user.tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockProducts.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, data: any): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const index = this.mockProducts.findIndex(p => 
      p.id === id && p.tenant_id === user.tenant_id
    );

    if (index === -1) {
      throw new Error('Product not found');
    }

    // Check if SKU already exists (excluding current product)
    const existingSku = this.mockProducts.find(p => 
      p.sku === data.sku && p.tenant_id === user.tenant_id && p.id !== id
    );
    if (existingSku) {
      throw new Error('SKU already exists');
    }

    const updatedProduct: Product = {
      ...this.mockProducts[index],
      name: data.name,
      sku: data.sku,
      type: data.type,
      category: data.category,
      description: data.description || '',
      price: data.price,
      currency: data.currency || 'USD',
      status: data.status,
      warranty_period: data.warranty_period || 0,
      service_contract_available: data.service_contract_available || false,
      updated_at: new Date().toISOString()
    };

    this.mockProducts[index] = updatedProduct;
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    const index = this.mockProducts.findIndex(p => 
      p.id === id && p.tenant_id === user.tenant_id
    );

    if (index === -1) {
      throw new Error('Product not found');
    }

    this.mockProducts.splice(index, 1);
  }

  async exportProducts(filters?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');

    let products = this.mockProducts.filter(p => p.tenant_id === user.tenant_id);

    // Apply filters
    if (filters) {
      if (filters.category) {
        products = products.filter(p => p.category === filters.category);
      }
      if (filters.status) {
        products = products.filter(p => p.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
        );
      }
    }

    // Generate CSV content
    const headers = [
      'ID', 'Name', 'SKU', 'Category', 'Description', 'Price', 'Status', 'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.id,
        `"${product.name}"`,
        product.sku,
        product.category,
        `"${product.description || ''}"`,
        product.price,
        product.status,
        product.created_at
      ].join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
}

export const productService = new ProductService();