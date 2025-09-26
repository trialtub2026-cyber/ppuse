# API Documentation

## 🚀 Overview

The Notification System API provides endpoints for managing WhatsApp and Push notifications, templates, and user preferences.

## 🔗 Base URL

```
Local Development: http://localhost:5173/api
Production: https://your-domain.com/api
```

## 🔐 Authentication

All API endpoints require authentication using the existing CRM authentication system.

```javascript
// Headers required for all requests
{
  "Authorization": "Bearer <your-jwt-token>",
  "Content-Type": "application/json"
}
```

## 📝 Notification Templates

### List Templates

```http
GET /api/notifications/templates
```

**Query Parameters:**
- `channel` (optional): Filter by channel (`whatsapp`, `push`, `both`)
- `status` (optional): Filter by status (`active`, `inactive`, `draft`)
- `search` (optional): Search in name and content
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Contract Reminder",
      "channel": "both",
      "language": "en",
      "title": "Service Contract Expiring",
      "message_body": "Hi {{customerName}}, your contract expires on {{expiryDate}}",
      "whatsapp_template_id": "contract_reminder",
      "status": "active",
      "f_version": 1,
      "variables": ["customerName", "expiryDate"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Create Template

```http
POST /api/notifications/templates
```

**Request Body:**
```json
{
  "name": "Contract Reminder",
  "channel": "both",
  "language": "en",
  "title": "Service Contract Expiring",
  "message_body": "Hi {{customerName}}, your contract expires on {{expiryDate}}",
  "whatsapp_template_id": "contract_reminder",
  "status": "active"
}
```

### Update Template

```http
PUT /api/notifications/templates/{id}
```

### Delete Template

```http
DELETE /api/notifications/templates/{id}
```

### Preview Template

```http
POST /api/notifications/templates/{id}/preview
```

**Request Body:**
```json
{
  "variables": {
    "customerName": "John Doe",
    "expiryDate": "2024-12-31"
  }
}
```

## 📤 Notification Queue

### Send Notification

```http
POST /api/notifications/send
```

**Request Body:**
```json
{
  "templateId": "uuid",
  "recipientId": "user-id",
  "channel": "both",
  "variables": {
    "customerName": "John Doe",
    "expiryDate": "2024-12-31"
  },
  "priority": "normal",
  "scheduledAt": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "queueId": "uuid",
  "message": "Notification queued successfully"
}
```

### List Queue Items

```http
GET /api/notifications/queue
```

**Query Parameters:**
- `status`: Filter by status (`pending`, `processing`, `sent`, `delivered`, `failed`)
- `channel`: Filter by channel
- `limit`: Number of results
- `offset`: Pagination offset

### Retry Failed Notification

```http
POST /api/notifications/queue/{id}/retry
```

### Cancel Notification

```http
POST /api/notifications/queue/{id}/cancel
```

## 📊 Analytics

### Get Notification Stats

```http
GET /api/notifications/stats
```

**Query Parameters:**
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)
- `channel`: Filter by channel
- `recipientId`: Filter by recipient

**Response:**
```json
{
  "total": 1000,
  "sent": 950,
  "delivered": 900,
  "failed": 50,
  "pending": 0,
  "byChannel": {
    "whatsapp": 600,
    "push": 400
  },
  "byStatus": {
    "sent": 950,
    "delivered": 900,
    "failed": 50,
    "pending": 0
  }
}
```

### Get Queue Status

```http
GET /api/notifications/queue/status
```

**Response:**
```json
{
  "pending": 5,
  "processing": 2,
  "failed": 3,
  "retryable": 2
}
```

## 📱 Push Notifications

### Subscribe to Push

```http
POST /api/notifications/push/subscribe
```

**Request Body:**
```json
{
  "userId": "user-id",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/fcm/send/...",
    "keys": {
      "p256dh": "key...",
      "auth": "key..."
    }
  }
}
```

### Unsubscribe from Push

```http
DELETE /api/notifications/push/subscribe
```

**Request Body:**
```json
{
  "userId": "user-id",
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

### Get VAPID Public Key

```http
GET /api/notifications/push/vapid-key
```

**Response:**
```json
{
  "publicKey": "BK..."
}
```

## 💬 WhatsApp

### WhatsApp Webhook

```http
POST /api/whatsapp/webhook
```

**Webhook Verification:**
```http
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=TOKEN
```

### Send WhatsApp Message

```http
POST /api/whatsapp/send
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "templateName": "contract_reminder",
  "variables": {
    "customerName": "John Doe",
    "expiryDate": "2024-12-31"
  }
}
```

### Get Conversations

```http
GET /api/whatsapp/conversations
```

### Get Conversation Messages

```http
GET /api/whatsapp/conversations/{id}/messages
```

## ⚙️ User Preferences

### Get User Preferences

```http
GET /api/notifications/preferences/{userId}
```

**Response:**
```json
{
  "userId": "user-id",
  "whatsappEnabled": true,
  "pushEnabled": true,
  "contractReminders": true,
  "marketingMessages": false,
  "systemNotifications": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00",
  "timezone": "UTC"
}
```

### Update User Preferences

```http
PUT /api/notifications/preferences/{userId}
```

## 📅 Scheduled Jobs

### List Scheduled Jobs

```http
GET /api/notifications/jobs
```

### Create Scheduled Job

```http
POST /api/notifications/jobs
```

**Request Body:**
```json
{
  "jobType": "contract_reminder",
  "jobName": "Daily Contract Reminders",
  "cronExpression": "0 9 * * *",
  "templateId": "uuid",
  "targetCriteria": {
    "daysAhead": 10,
    "contractType": "service"
  },
  "isActive": true
}
```

### Update Scheduled Job

```http
PUT /api/notifications/jobs/{id}
```

### Delete Scheduled Job

```http
DELETE /api/notifications/jobs/{id}
```

## 🔧 System Configuration

### Get WhatsApp Config

```http
GET /api/notifications/config/whatsapp
```

### Update WhatsApp Config

```http
PUT /api/notifications/config/whatsapp
```

**Request Body:**
```json
{
  "businessAccountId": "123456789",
  "phoneNumberId": "987654321",
  "accessToken": "token...",
  "webhookVerifyToken": "verify-token",
  "rateLimitPerMinute": 80,
  "isActive": true
}
```

### Generate VAPID Keys

```http
POST /api/notifications/config/vapid/generate
```

**Response:**
```json
{
  "publicKey": "BK...",
  "privateKey": "private-key...",
  "subject": "mailto:admin@domain.com"
}
```

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "TEMPLATE_NOT_FOUND",
    "message": "Template with ID 'uuid' not found",
    "details": {
      "templateId": "uuid"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `TEMPLATE_NOT_FOUND` | Template does not exist |
| `INVALID_TEMPLATE_VARIABLES` | Missing or invalid template variables |
| `WHATSAPP_API_ERROR` | WhatsApp API request failed |
| `PUSH_SUBSCRIPTION_FAILED` | Push notification subscription failed |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |
| `INVALID_PHONE_NUMBER` | Phone number format invalid |
| `TEMPLATE_NOT_APPROVED` | WhatsApp template not approved |
| `USER_NOT_FOUND` | Recipient user not found |

## 📈 Rate Limits

### API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Send Notification | 100 requests | 1 minute |
| Template Operations | 50 requests | 1 minute |
| Analytics | 20 requests | 1 minute |
| Configuration | 10 requests | 1 minute |

### WhatsApp Rate Limits

- **Tier 1:** 1,000 messages/day
- **Tier 2:** 10,000 messages/day
- **Tier 3:** 100,000 messages/day

### Push Notification Limits

- **Per User:** 100 notifications/hour
- **Global:** 10,000 notifications/minute

## 🔍 Monitoring

### Health Check

```http
GET /api/notifications/health
```

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "whatsapp": "active",
    "push": "active",
    "queue": "processing"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Metrics

```http
GET /api/notifications/metrics
```

**Response:**
```json
{
  "queueSize": 10,
  "processingRate": 45,
  "errorRate": 0.02,
  "averageDeliveryTime": 2.3,
  "activeSubscriptions": 1234
}
```

## 📚 SDK Examples

### JavaScript/TypeScript

```typescript
import { NotificationAPI } from './notification-api';

const api = new NotificationAPI({
  baseURL: 'http://localhost:5173/api',
  token: 'your-jwt-token'
});

// Send notification
const result = await api.sendNotification({
  templateId: 'uuid',
  recipientId: 'user-id',
  channel: 'both',
  variables: {
    customerName: 'John Doe',
    expiryDate: '2024-12-31'
  }
});

// Get stats
const stats = await api.getStats({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### cURL Examples

```bash
# Send notification
curl -X POST http://localhost:5173/api/notifications/send \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "uuid",
    "recipientId": "user-id",
    "channel": "both",
    "variables": {
      "customerName": "John Doe"
    }
  }'

# Get templates
curl -X GET "http://localhost:5173/api/notifications/templates?status=active" \
  -H "Authorization: Bearer your-token"
```

## 🧪 Testing

### Test Endpoints

```http
POST /api/notifications/test/whatsapp
POST /api/notifications/test/push
```

### Mock Data

Use the `/test` endpoints to send test notifications without affecting production data.

## 📝 Changelog

### Version 1.0.0
- Initial API release
- WhatsApp and Push notification support
- Template management
- Queue processing
- Analytics and monitoring