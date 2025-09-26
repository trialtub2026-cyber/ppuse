# CRM Backend API Specification

## Overview

This document outlines the complete API specification for the .NET Core backend that will power the CRM application. The API follows RESTful principles and includes comprehensive authentication, authorization, and data management capabilities.

## Base Configuration

### Environment URLs
- **Development**: `http://localhost:5000/api/v1`
- **Staging**: `https://api-staging.yourcompany.com/api/v1`
- **Production**: `https://api.yourcompany.com/api/v1`

### Authentication
- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer {token}`
- **Refresh Token**: Sliding expiration
- **Multi-tenant**: `X-Tenant-ID` header

### Standard Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "errors": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Authentication Endpoints

### POST /auth/login
Login user with credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false,
  "tenantId": "optional-tenant-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin",
      "tenantId": "tenant-id",
      "avatar": "https://...",
      "permissions": ["read", "write", "delete"],
      "lastLogin": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600,
    "tenant": {
      "id": "tenant-id",
      "name": "Company Name",
      "domain": "company.com",
      "settings": {}
    }
  }
}
```

### POST /auth/logout
Logout user and invalidate tokens.

**Request:**
```json
{
  "refreshToken": "refresh-token"
}
```

### POST /auth/refresh
Refresh authentication token.

**Request:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "expiresIn": 3600
  }
}
```

### GET /auth/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "tenantId": "tenant-id",
    "avatar": "https://...",
    "permissions": ["read", "write", "delete"],
    "preferences": {},
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /auth/profile
Update user profile.

**Request:**
```json
{
  "name": "John Doe",
  "avatar": "https://...",
  "preferences": {}
}
```

### GET /auth/permissions
Get user permissions.

**Response:**
```json
{
  "success": true,
  "data": ["read", "write", "delete", "manage_customers"]
}
```

## Customer Management Endpoints

### GET /customers
Get customers with filtering and pagination.

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `search` (string): Search query
- `status` (string): Customer status
- `industry` (string): Industry filter
- `size` (string): Company size filter
- `assignedTo` (string): Assigned user ID
- `tags` (array): Tag IDs
- `sort` (string): Sort field
- `order` (string): Sort order (asc/desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "customer-id",
      "companyName": "TechCorp Solutions",
      "contactName": "Alice Johnson",
      "email": "alice@techcorp.com",
      "phone": "+1-555-0123",
      "address": "123 Tech Street",
      "city": "San Francisco",
      "country": "USA",
      "industry": "Technology",
      "size": "enterprise",
      "status": "active",
      "tags": [
        {
          "id": "tag-id",
          "name": "VIP",
          "color": "#f59e0b"
        }
      ],
      "notes": "Key enterprise client",
      "assignedTo": "user-id",
      "assignedUser": {
        "id": "user-id",
        "name": "John Doe",
        "email": "john@company.com"
      },
      "customFields": {},
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "tenantId": "tenant-id"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /customers/{id}
Get single customer by ID.

### POST /customers
Create new customer.

**Request:**
```json
{
  "companyName": "TechCorp Solutions",
  "contactName": "Alice Johnson",
  "email": "alice@techcorp.com",
  "phone": "+1-555-0123",
  "address": "123 Tech Street",
  "city": "San Francisco",
  "country": "USA",
  "industry": "Technology",
  "size": "enterprise",
  "status": "active",
  "tags": ["tag-id-1", "tag-id-2"],
  "notes": "Key enterprise client",
  "assignedTo": "user-id",
  "customFields": {}
}
```

### PUT /customers/{id}
Update existing customer.

### DELETE /customers/{id}
Delete customer.

### GET /customers/search
Search customers.

**Query Parameters:**
- `q` (string): Search query
- Additional filter parameters

### GET /customers/export
Export customers.

**Query Parameters:**
- `format` (string): Export format (csv, json, xlsx)
- Filter parameters

### POST /customers/import
Import customers from file.

**Request:** Multipart form data with file

### GET /customers/tags
Get customer tags.

### POST /customers/tags
Create customer tag.

### GET /customers/stats
Get customer statistics.

### GET /customers/{id}/activity
Get customer activity timeline.

### GET /customers/{id}/notes
Get customer notes.

### POST /customers/{id}/notes
Add customer note.

### POST /customers/bulk/delete
Bulk delete customers.

### POST /customers/bulk/update
Bulk update customers.

### POST /customers/bulk/assign
Bulk assign customers.

### POST /customers/bulk/tag
Bulk tag customers.

## Sales Management Endpoints

### GET /sales
Get sales/deals with filtering and pagination.

### GET /sales/{id}
Get single sale by ID.

### POST /sales
Create new sale.

**Request:**
```json
{
  "title": "Enterprise Software License",
  "customerId": "customer-id",
  "value": 50000,
  "probability": 75,
  "stage": "negotiation",
  "expectedCloseDate": "2024-12-31",
  "description": "Annual software license renewal",
  "assignedTo": "user-id",
  "products": [
    {
      "productId": "product-id",
      "quantity": 1,
      "unitPrice": 50000
    }
  ]
}
```

### PUT /sales/{id}
Update existing sale.

### DELETE /sales/{id}
Delete sale.

### GET /sales/pipeline/stages
Get pipeline stages.

### GET /sales/pipeline
Get pipeline overview.

### PATCH /sales/{id}/stage
Move sale to different stage.

### GET /sales/analytics
Get sales analytics.

### GET /sales/forecasting
Get sales forecasting data.

### GET /sales/leaderboard
Get sales leaderboard.

### GET /sales/{id}/activities
Get sale activities.

### POST /sales/{id}/activities
Add sale activity.

### POST /sales/{id}/clone
Clone sale.

### GET /sales/export
Export sales data.

## Ticket Management Endpoints

### GET /tickets
Get tickets with filtering and pagination.

### GET /tickets/{id}
Get single ticket by ID.

### POST /tickets
Create new ticket.

**Request:**
```json
{
  "title": "System Login Issue",
  "description": "User unable to login to the system",
  "customerId": "customer-id",
  "priority": "high",
  "category": "technical",
  "assignedTo": "user-id",
  "dueDate": "2024-01-15T00:00:00Z",
  "tags": ["login", "urgent"]
}
```

### PUT /tickets/{id}
Update existing ticket.

### DELETE /tickets/{id}
Delete ticket.

### GET /tickets/categories
Get ticket categories.

### GET /tickets/priorities
Get ticket priorities.

### PATCH /tickets/assignments/{id}
Assign ticket to user.

### PATCH /tickets/{id}/status
Change ticket status.

### GET /tickets/{id}/comments
Get ticket comments.

### POST /tickets/{id}/comments
Add ticket comment.

### POST /tickets/{id}/attachments
Upload ticket attachment.

### DELETE /tickets/{id}/attachments/{attachmentId}
Delete ticket attachment.

### GET /tickets/stats
Get ticket statistics.

### GET /tickets/analytics
Get ticket analytics.

### POST /tickets/bulk-update
Bulk update tickets.

### GET /tickets/export
Export tickets.

### GET /tickets/sla-metrics
Get SLA metrics.

## Contract Management Endpoints

### GET /contracts
Get contracts with filtering and pagination.

### GET /contracts/{id}
Get single contract by ID.

### POST /contracts
Create new contract.

**Request:**
```json
{
  "title": "Annual Support Contract",
  "customerId": "customer-id",
  "type": "support",
  "value": 25000,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "status": "active",
  "terms": "Standard support terms and conditions",
  "attachments": ["file-id-1", "file-id-2"]
}
```

### PUT /contracts/{id}
Update existing contract.

### DELETE /contracts/{id}
Delete contract.

### GET /contracts/types
Get contract types.

### GET /contracts/analytics
Get contract analytics.

### GET /contracts/templates
Get contract templates.

### POST /contracts/templates/{id}/create
Create contract from template.

### GET /contracts/expiring
Get contracts expiring soon.

### GET /contracts/renewals
Get renewal opportunities.

### POST /contracts/{id}/renew
Renew contract.

### POST /contracts/{id}/terminate
Terminate contract.

### POST /contracts/{id}/documents
Upload contract document.

### GET /contracts/{id}/pdf
Generate contract PDF.

### GET /contracts/{id}/history
Get contract history.

### GET /contracts/export
Export contracts.

## User Management Endpoints

### GET /users
Get users with filtering and pagination.

### GET /users/{id}
Get single user by ID.

### POST /users
Create new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "role": "agent",
  "password": "secure-password",
  "avatar": "https://...",
  "permissions": ["read", "write"]
}
```

### PUT /users/{id}
Update existing user.

### DELETE /users/{id}
Delete user.

### GET /users/roles
Get available roles.

### POST /users/roles
Create new role.

### PUT /users/roles/{id}
Update role.

### DELETE /users/roles/{id}
Delete role.

### GET /users/permissions
Get available permissions.

### POST /users/invitations
Invite user.

### GET /users/invitations
Get pending invitations.

### DELETE /users/invitations/{id}
Cancel invitation.

### POST /users/invitations/{id}/resend
Resend invitation.

### PATCH /users/{id}/status
Toggle user status.

### POST /users/{id}/reset-password
Reset user password.

### GET /users/{id}/activity
Get user activity log.

### GET /users/stats
Get user statistics.

### POST /users/bulk-update
Bulk update users.

### GET /users/export
Export users.

### POST /users/{id}/avatar
Upload user avatar.

### GET /users/{id}/permissions
Get user permissions.

### PUT /users/{id}/permissions
Update user permissions.

## Dashboard Endpoints

### GET /dashboard/metrics
Get dashboard metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": {
      "total": 1250,
      "active": 1100,
      "new": 45,
      "growth": 12.5
    },
    "sales": {
      "total": 2500000,
      "closed": 1800000,
      "pipeline": 700000,
      "growth": 18.2
    },
    "tickets": {
      "total": 156,
      "open": 23,
      "resolved": 133,
      "avgResolutionTime": 4.2
    },
    "revenue": {
      "total": 2500000,
      "monthly": 208333,
      "growth": 15.8,
      "forecast": 3000000
    }
  }
}
```

### GET /dashboard/analytics
Get analytics data.

### GET /dashboard/metrics/recent-activity
Get recent activity.

### GET /dashboard/widgets/{type}
Get widget data.

### GET /dashboard/metrics/sales-overview
Get sales overview.

### GET /dashboard/metrics/customer-overview
Get customer overview.

### GET /dashboard/metrics/support-overview
Get support overview.

### GET /dashboard/metrics/financial-overview
Get financial overview.

### GET /dashboard/metrics/team-performance
Get team performance.

### GET /dashboard/metrics/system-health
Get system health.

### GET /dashboard/reports
Get custom reports.

### POST /dashboard/reports/{id}/generate
Generate custom report.

### GET /dashboard/metrics/export
Export dashboard data.

## Notification Endpoints

### GET /notifications
Get notifications with filtering and pagination.

### POST /notifications
Create new notification.

**Request:**
```json
{
  "title": "New Customer Assigned",
  "message": "You have been assigned a new customer: TechCorp Solutions",
  "type": "info",
  "recipients": ["user-id-1", "user-id-2"],
  "channels": ["email", "in_app"],
  "scheduledAt": "2024-01-01T12:00:00Z",
  "templateId": "template-id",
  "data": {
    "customerName": "TechCorp Solutions",
    "assignedBy": "Manager Name"
  }
}
```

### PATCH /notifications/{id}/read
Mark notification as read.

### PATCH /notifications/read-all
Mark all notifications as read.

### DELETE /notifications/{id}
Delete notification.

### GET /notifications/templates
Get notification templates.

### POST /notifications/templates
Create notification template.

### PUT /notifications/templates/{id}
Update notification template.

### DELETE /notifications/templates/{id}
Delete notification template.

### POST /notifications/templates/{id}/send
Send notification using template.

### GET /notifications/queue
Get notification queue.

### POST /notifications/{id}/retry
Retry failed notification.

### POST /notifications/{id}/cancel
Cancel scheduled notification.

### GET /notifications/preferences
Get notification preferences.

### PUT /notifications/preferences
Update notification preferences.

### GET /notifications/stats
Get notification statistics.

### POST /notifications/bulk
Send bulk notifications.

### POST /notifications/push/subscribe
Subscribe to push notifications.

### POST /notifications/push/unsubscribe
Unsubscribe from push notifications.

## File Management Endpoints

### POST /files/upload
Upload file.

**Request:** Multipart form data
**Headers:**
- `X-File-Category`: File category
- `X-File-Description`: File description
- `X-File-Public`: Public access (true/false)

### GET /files/download/{id}
Download file.

### DELETE /files/delete/{id}
Delete file.

### GET /files/metadata/{id}
Get file metadata.

### GET /files/metadata
Get files list with filtering.

### PUT /files/metadata/{id}
Update file metadata.

### GET /files/metadata/categories
Get file categories.

### POST /files/delete/bulk
Bulk delete files.

### GET /files/metadata/stats
Get storage statistics.

### POST /files/metadata/{id}/share
Generate file share link.

### DELETE /files/metadata/{id}/share
Revoke file share link.

### GET /files/metadata/{id}/versions
Get file versions.

### POST /files/metadata/{id}/versions
Upload new file version.

### POST /files/metadata/{id}/versions/{versionId}/restore
Restore file version.

### POST /files/metadata/{id}/scan
Scan file for viruses.

## Audit & Logging Endpoints

### GET /audit/logs
Get audit logs with filtering and pagination.

**Query Parameters:**
- `page`, `limit`: Pagination
- `action`: Filter by action
- `resource`: Filter by resource type
- `userId`: Filter by user
- `dateFrom`, `dateTo`: Date range
- `search`: Search query

### GET /audit/logs/{id}
Get single audit log by ID.

### GET /audit/search
Search audit logs.

### GET /audit/export
Export audit logs.

### GET /audit/logs/stats
Get audit statistics.

### GET /audit/logs/resource/{resource}/{id}
Get resource audit trail.

### GET /audit/logs/user/{userId}
Get user audit trail.

### GET /audit/logs/compliance
Get compliance report.

### GET /audit/logs/security-events
Get security events.

### POST /audit/logs/security-events/{id}/resolve
Resolve security event.

### GET /audit/logs/retention-policies
Get data retention policies.

### POST /audit/logs/retention-policies/{id}/apply
Apply retention policy.

### POST /audit/logs/verify-integrity
Verify log integrity.

### POST /audit/logs/alerts
Create audit alert rule.

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Email is required",
      "field": "email"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

## Security Requirements

### Authentication
- JWT tokens with RS256 signing
- Refresh token rotation
- Token blacklisting on logout
- Multi-factor authentication support

### Authorization
- Role-based access control (RBAC)
- Permission-based authorization
- Resource-level permissions
- Tenant isolation

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Request size limits

### Audit & Compliance
- Comprehensive audit logging
- Data retention policies
- GDPR compliance
- SOC 2 compliance
- Log integrity verification

## Performance Requirements

### Response Times
- Authentication: < 500ms
- CRUD operations: < 1s
- Search operations: < 2s
- Reports/Analytics: < 5s
- File uploads: Progress tracking

### Scalability
- Horizontal scaling support
- Database connection pooling
- Caching strategy (Redis)
- CDN for file delivery
- Load balancing

### Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Resource utilization
- Business metrics

## Implementation Notes

### Database Schema
- Multi-tenant architecture
- Soft deletes for audit trail
- Optimistic concurrency control
- Proper indexing strategy
- Data archiving strategy

### Caching Strategy
- Redis for session storage
- Query result caching
- File metadata caching
- Rate limiting counters

### Background Jobs
- Email notifications
- File processing
- Data exports
- Cleanup tasks
- Analytics processing

### Integration Points
- Email service (SendGrid/AWS SES)
- SMS service (Twilio)
- File storage (AWS S3/Azure Blob)
- Push notifications (Firebase)
- Analytics (Application Insights)

This specification provides a comprehensive foundation for implementing the .NET Core backend that will seamlessly integrate with the React frontend through the service factory pattern.