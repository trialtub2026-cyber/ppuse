# Service Integration Guide

## Overview

This guide explains how to integrate and use the new enterprise-level API service architecture that supports seamless switching between mock and real APIs.

## Architecture Overview

```
Frontend Application
├── Service Factory (apiServiceFactory)
├── Mock Services (existing)
├── Real Services (new .NET Core integration)
├── Base API Service (HTTP client with interceptors)
└── API Configuration (environment-based)
```

## Quick Start

### 1. Environment Configuration

Create or update your `.env` file:

```env
# Use mock APIs for development
VITE_USE_MOCK_API=true

# API environment
VITE_API_ENVIRONMENT=development

# Real API configuration (when VITE_USE_MOCK_API=false)
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 2. Using Services in Components

```typescript
import { customerService, authService } from '@/services';

// In your React component
const MyComponent = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await customerService.getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div>
      {customers.map(customer => (
        <div key={customer.id}>{customer.companyName}</div>
      ))}
    </div>
  );
};
```

### 3. Switching Between Mock and Real APIs

#### Method 1: Environment Variable (Recommended)
```env
# In .env file
VITE_USE_MOCK_API=false  # Switch to real APIs
```

#### Method 2: Runtime Switching
```typescript
import { switchApiMode, getCurrentApiMode } from '@/services';

// Switch to real APIs
switchApiMode(false);

// Check current mode
const currentMode = getCurrentApiMode(); // 'mock' | 'real'
```

## Service Usage Examples

### Authentication Service

```typescript
import { authService } from '@/services';

// Login
const loginUser = async (email: string, password: string) => {
  try {
    const response = await authService.login({ email, password });
    console.log('User logged in:', response.user);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Check permissions
const hasPermission = authService.hasPermission('manage_customers');

// Get current user
const currentUser = authService.getCurrentUser();
```

### Customer Service

```typescript
import { customerService } from '@/services';

// Get customers with filters
const getCustomers = async () => {
  const customers = await customerService.getCustomers({
    status: 'active',
    industry: 'Technology',
    page: 1,
    limit: 20
  });
  return customers;
};

// Create customer
const createCustomer = async (customerData) => {
  const newCustomer = await customerService.createCustomer({
    companyName: 'TechCorp',
    contactName: 'John Doe',
    email: 'john@techcorp.com',
    industry: 'Technology',
    size: 'enterprise'
  });
  return newCustomer;
};

// Export customers
const exportCustomers = async () => {
  const csvData = await customerService.exportCustomers('csv', {
    status: 'active'
  });
  // Handle CSV data
};
```

### Sales Service

```typescript
import { salesService } from '@/services';

// Get sales pipeline
const getPipeline = async () => {
  const pipeline = await salesService.getPipelineOverview();
  return pipeline;
};

// Create sale
const createSale = async () => {
  const sale = await salesService.createSale({
    title: 'Enterprise License',
    customerId: 'customer-id',
    value: 50000,
    probability: 75,
    stage: 'negotiation'
  });
  return sale;
};

// Get analytics
const getSalesAnalytics = async () => {
  const analytics = await salesService.getSalesAnalytics('quarterly');
  return analytics;
};
```

### File Service

```typescript
import { fileService } from '@/services';

// Upload file with progress
const uploadFile = async (file: File) => {
  const result = await fileService.uploadFile(file, {
    category: 'documents',
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress}%`);
    }
  });
  return result;
};

// Download file
const downloadFile = async (fileId: string) => {
  await fileService.downloadFile(fileId, 'document.pdf');
};
```

## Error Handling

### Global Error Handling

The base API service automatically handles common errors:

```typescript
// Automatic handling of:
// - 401 Unauthorized (token refresh)
// - 403 Forbidden (permission errors)
// - Network errors
// - Retry logic for failed requests
```

### Custom Error Handling

```typescript
import { customerService } from '@/services';

const handleCustomerOperation = async () => {
  try {
    const customer = await customerService.getCustomer('invalid-id');
  } catch (error) {
    if (error.code === 'CUSTOMER_NOT_FOUND') {
      // Handle specific error
      showNotification('Customer not found');
    } else {
      // Handle generic error
      showNotification('An error occurred');
    }
  }
};
```

## Advanced Usage

### Direct API Service Usage

```typescript
import { baseApiService } from '@/services';

// Make custom API calls
const customApiCall = async () => {
  const response = await baseApiService.get('/custom-endpoint', {
    skipAuth: false,
    retryAttempts: 3
  });
  return response.data;
};
```

### Service Factory Usage

```typescript
import { apiServiceFactory } from '@/services';

// Get service instances
const authService = apiServiceFactory.getAuthService();
const customerService = apiServiceFactory.getCustomerService();

// Check current mode
const isUsingMock = apiServiceFactory.isUsingMockApi();

// Get all service instances (for debugging)
const allServices = apiServiceFactory.getServiceInstances();
```

### API Metrics

```typescript
import { baseApiService } from '@/services';

// Get API performance metrics
const metrics = baseApiService.getMetrics();
console.log('API Metrics:', {
  requestCount: metrics.requestCount,
  errorCount: metrics.errorCount,
  averageResponseTime: metrics.averageResponseTime
});

// Reset metrics
baseApiService.resetMetrics();
```

## Testing

### Unit Testing with Mock Services

```typescript
import { apiServiceFactory } from '@/services';

describe('Customer Component', () => {
  beforeEach(() => {
    // Ensure mock mode for tests
    apiServiceFactory.switchApiMode(true);
  });

  it('should fetch customers', async () => {
    const customerService = apiServiceFactory.getCustomerService();
    const customers = await customerService.getCustomers();
    expect(customers).toBeDefined();
  });
});
```

### Integration Testing with Real APIs

```typescript
describe('Customer API Integration', () => {
  beforeEach(() => {
    // Use real APIs for integration tests
    apiServiceFactory.switchApiMode(false);
  });

  it('should create customer via real API', async () => {
    const customerService = apiServiceFactory.getCustomerService();
    const customer = await customerService.createCustomer({
      companyName: 'Test Company',
      contactName: 'Test User',
      email: 'test@example.com'
    });
    expect(customer.id).toBeDefined();
  });
});
```

## Performance Optimization

### Caching

```typescript
// Services automatically cache responses where appropriate
// No additional configuration needed
```

### Request Optimization

```typescript
// Use pagination for large datasets
const customers = await customerService.getCustomers({
  page: 1,
  limit: 50 // Optimal page size
});

// Use specific filters to reduce data transfer
const filteredCustomers = await customerService.getCustomers({
  status: 'active',
  industry: 'Technology'
});
```

### File Upload Optimization

```typescript
// Upload large files with progress tracking
const uploadLargeFile = async (file: File) => {
  if (file.size > 10 * 1024 * 1024) { // 10MB
    console.warn('Large file detected, consider chunked upload');
  }

  return await fileService.uploadFile(file, {
    onProgress: (progress) => {
      updateProgressBar(progress);
    }
  });
};
```

## Debugging

### Enable Debug Mode

```env
# In .env file
VITE_DEBUG_MODE=true
VITE_SHOW_API_LOGS=true
```

### Service Health Check

```typescript
import { getServiceHealth } from '@/services';

const checkHealth = () => {
  const health = getServiceHealth();
  console.log('Service Health:', health);
};
```

### API Request Logging

```typescript
// Automatic logging when VITE_SHOW_API_LOGS=true
// Check browser console for detailed request/response logs
```

## Migration Guide

### From Existing Services

1. **Update imports:**
```typescript
// Old
import { customerService } from '@/services/customerService';

// New
import { customerService } from '@/services';
```

2. **No API changes needed:**
```typescript
// All existing service calls work the same way
const customers = await customerService.getCustomers();
```

3. **Add environment configuration:**
```env
VITE_USE_MOCK_API=true
```

### Gradual Migration

1. Start with mock APIs (`VITE_USE_MOCK_API=true`)
2. Implement .NET Core backend endpoints
3. Test with real APIs (`VITE_USE_MOCK_API=false`)
4. Deploy with real APIs

## Best Practices

### 1. Error Handling
```typescript
// Always handle errors appropriately
try {
  const result = await service.operation();
  return result;
} catch (error) {
  // Log error for debugging
  console.error('Operation failed:', error);
  
  // Show user-friendly message
  showErrorNotification('Operation failed. Please try again.');
  
  // Re-throw if needed
  throw error;
}
```

### 2. Loading States
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const data = await service.getData();
    setData(data);
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

### 3. Pagination
```typescript
// Always use pagination for lists
const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,
  total: 0
});

const fetchCustomers = async () => {
  const result = await customerService.getCustomers({
    page: pagination.page,
    limit: pagination.limit
  });
  
  setCustomers(result.data);
  setPagination(prev => ({
    ...prev,
    total: result.meta.total
  }));
};
```

### 4. Optimistic Updates
```typescript
// Update UI immediately, rollback on error
const updateCustomer = async (id: string, updates: any) => {
  // Optimistic update
  setCustomers(prev => 
    prev.map(c => c.id === id ? { ...c, ...updates } : c)
  );

  try {
    await customerService.updateCustomer(id, updates);
  } catch (error) {
    // Rollback on error
    setCustomers(prev => 
      prev.map(c => c.id === id ? originalCustomer : c)
    );
    throw error;
  }
};
```

## Troubleshooting

### Common Issues

1. **Service not switching modes:**
   - Check environment variables
   - Restart development server
   - Clear browser cache

2. **Authentication errors:**
   - Verify token storage
   - Check token expiration
   - Ensure proper headers

3. **Network errors:**
   - Verify API endpoint URLs
   - Check CORS configuration
   - Validate SSL certificates

### Debug Commands

```typescript
// Check current configuration
import { apiConfig } from '@/services';
console.log('API Config:', apiConfig);

// Check service instances
import { getServiceHealth } from '@/services';
console.log('Service Health:', getServiceHealth());

// Check API metrics
import { baseApiService } from '@/services';
console.log('API Metrics:', baseApiService.getMetrics());
```

This integration guide provides comprehensive documentation for using the new service architecture effectively.