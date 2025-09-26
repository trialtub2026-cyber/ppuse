# User Guide - Notification System

## 🎯 Overview

The Notification System allows you to send WhatsApp messages and push notifications to your customers through a unified interface. This guide will help you get started and make the most of the system.

## 🚀 Getting Started

### Accessing the Notification System

1. **Login to your CRM**
2. **Navigate to Notifications** in the sidebar (Bell icon)
3. **Explore the four main sections:**
   - **Dashboard** - Overview and analytics
   - **Templates** - Create and manage message templates
   - **Queue** - Send notifications and monitor delivery
   - **Settings** - Configure system settings

## 📊 Dashboard

### Overview Cards

The dashboard provides real-time insights:

- **Total Notifications** - All-time notification count
- **Delivered** - Successfully delivered messages
- **Failed** - Failed delivery attempts
- **Pending** - Messages waiting to be sent

### Analytics Tabs

**Overview Tab:**
- Success rate metrics
- Recent activity feed
- Performance indicators

**Channels Tab:**
- WhatsApp statistics
- Push notification metrics
- Channel-specific performance

**Queue Tab:**
- Current queue status
- Processing metrics
- Quick actions for queue management

## 📝 Template Management

### Creating Templates

1. **Go to Templates tab**
2. **Click "Create Template"**
3. **Fill in template details:**
   - **Name:** Descriptive template name
   - **Channel:** WhatsApp, Push, or Both
   - **Language:** Template language (default: en)
   - **Title:** For push notifications (optional)
   - **Message Body:** Your message content
   - **WhatsApp Template ID:** If using WhatsApp

### Using Variables

Templates support dynamic content using variables:

```
Hi {{customerName}}, your service contract for {{productName}} expires on {{expiryDate}}.
```

**Variable Format:**
- Use double curly braces: `{{variableName}}`
- Variables are case-sensitive
- No spaces inside braces

**Common Variables:**
- `{{customerName}}` - Customer's name
- `{{productName}}` - Product or service name
- `{{expiryDate}}` - Contract expiry date
- `{{amount}}` - Payment amount
- `{{companyName}}` - Your company name

### Template Status

- **Draft** - Template is being created/edited
- **Active** - Template is ready for use
- **Inactive** - Template is disabled

### Template Actions

- **👁️ Preview** - See how the template will look
- **✏️ Edit** - Modify template content
- **📋 Duplicate** - Create a copy of the template
- **🗑️ Delete** - Remove template (if not in use)

## 📤 Sending Notifications

### Manual Notifications

1. **Go to Queue tab**
2. **Click "Send Notification"**
3. **Fill in the form:**
   - **Template:** Select from active templates
   - **Recipient ID:** User ID or email
   - **Channel:** WhatsApp, Push, or Both
   - **Priority:** Low, Normal, High, or Urgent
   - **Variables:** JSON format with template variables
   - **Schedule:** Optional future delivery time

### Example Variable JSON

```json
{
  "customerName": "John Doe",
  "productName": "Premium Support",
  "expiryDate": "December 31, 2024",
  "amount": "$299.99"
}
```

### Bulk Notifications

For sending to multiple recipients:

1. **Create a template** with appropriate variables
2. **Use the API** or contact support for bulk import
3. **Monitor progress** in the Queue tab

## 📋 Queue Management

### Queue Status

Monitor notification status:

- **⏳ Pending** - Waiting to be processed
- **▶️ Processing** - Currently being sent
- **✅ Sent** - Successfully sent
- **📨 Delivered** - Confirmed delivery
- **❌ Failed** - Delivery failed
- **⏸️ Cancelled** - Manually cancelled

### Queue Actions

- **👁️ View Details** - See full notification information
- **🔄 Retry** - Retry failed notifications
- **⏸️ Cancel** - Cancel pending notifications
- **📊 Process Queue** - Manually trigger queue processing

### Filtering and Search

- **Search** by recipient ID or template
- **Filter by Status** - Show specific status types
- **Filter by Channel** - WhatsApp or Push only

## ⚙️ Settings Configuration

### WhatsApp Configuration

**Status Indicators:**
- ✅ **Active** - WhatsApp is configured and working
- ❌ **Inactive** - Configuration needed

**Key Metrics:**
- Messages sent today
- Delivery rate
- Active conversations

### Push Notification Configuration

**VAPID Keys:**
- Public key for browser subscriptions
- Private key for sending (secure)
- Subject email for identification

**Subscription Stats:**
- Active subscriptions
- Notifications sent today
- Click-through rate

### System Settings

**Queue Processing:**
- Automatic processing interval (default: 30 seconds)
- Manual processing available

**Retry Logic:**
- Maximum retries: 3 attempts
- Exponential backoff timing
- Automatic retry for failed messages

**Rate Limiting:**
- WhatsApp: 80 messages/minute
- Push: 1000 messages/minute

## 🔔 User Preferences

### Notification Preferences

Users can control their notification preferences:

- **WhatsApp Enabled** - Receive WhatsApp messages
- **Push Enabled** - Receive push notifications
- **Contract Reminders** - Service contract notifications
- **Marketing Messages** - Promotional content
- **System Notifications** - System updates

### Quiet Hours

Set times when notifications should not be sent:
- **Start Time** - When quiet hours begin
- **End Time** - When quiet hours end
- **Timezone** - User's timezone

## 📱 Push Notification Setup

### For Users

1. **Visit the Notifications page**
2. **Click "Enable Push Notifications"** when prompted
3. **Allow notifications** in browser popup
4. **Verify subscription** in Settings

### Browser Support

- ✅ Chrome 50+
- ✅ Firefox 44+
- ✅ Safari 16+
- ✅ Edge 17+

### Troubleshooting Push

**If notifications aren't working:**
1. Check browser notification permissions
2. Ensure HTTPS is enabled (production)
3. Verify service worker is registered
4. Clear browser cache and retry

## 💬 WhatsApp Best Practices

### Message Templates

**Template Guidelines:**
- Use approved templates only
- Keep messages concise and clear
- Include clear call-to-action
- Avoid promotional language in utility templates

**Template Categories:**
- **UTILITY** - Account updates, order status
- **MARKETING** - Promotions, newsletters
- **AUTHENTICATION** - OTP, verification

### Phone Number Format

Always use international format:
- ✅ `+1234567890`
- ❌ `(123) 456-7890`
- ❌ `123-456-7890`

### Delivery Status

- **Sent** - Message sent to WhatsApp
- **Delivered** - Message delivered to user's phone
- **Read** - User has read the message
- **Failed** - Delivery failed

## 📈 Analytics and Reporting

### Key Metrics

**Delivery Metrics:**
- Total notifications sent
- Delivery success rate
- Average delivery time
- Channel performance comparison

**Engagement Metrics:**
- Click-through rates (push notifications)
- Read rates (WhatsApp)
- Response rates
- Unsubscribe rates

### Performance Monitoring

**Real-time Monitoring:**
- Queue processing status
- Failed notification alerts
- System health indicators
- Rate limit monitoring

## 🚨 Troubleshooting

### Common Issues

**Template Not Found:**
- Verify template exists and is active
- Check template ID spelling
- Ensure template is approved (WhatsApp)

**Delivery Failures:**
- Check recipient phone number format
- Verify user hasn't blocked notifications
- Check rate limits
- Review error messages in queue

**Push Notifications Not Working:**
- Verify HTTPS is enabled
- Check browser compatibility
- Ensure service worker is registered
- Verify VAPID keys are correct

**WhatsApp Messages Failing:**
- Confirm template is approved by Meta
- Check access token validity
- Verify phone number format
- Review webhook configuration

### Getting Help

**Self-Service:**
1. Check this user guide
2. Review error messages in the queue
3. Check system status in Settings
4. Try sending a test notification

**Contact Support:**
- Use the help desk system
- Provide error messages and screenshots
- Include notification ID for specific issues

## 📋 Best Practices

### Template Design

**Effective Templates:**
- Clear and concise messaging
- Personalized with variables
- Include relevant information
- Have clear next steps

**Example Good Template:**
```
Hi {{customerName}}, your {{productName}} service contract expires on {{expiryDate}}. 

To continue your service without interruption, please renew by visiting: {{renewalLink}}

Questions? Reply to this message or call {{supportPhone}}.

- {{companyName}} Team
```

### Timing and Frequency

**Best Practices:**
- Respect user quiet hours
- Don't send too frequently
- Time messages appropriately
- Consider user timezone

**Recommended Frequency:**
- Contract reminders: 30, 14, 7 days before expiry
- Marketing messages: Weekly maximum
- System notifications: As needed

### User Experience

**Optimize for Users:**
- Make unsubscribing easy
- Provide value in every message
- Respect user preferences
- Test messages before sending

## 🔄 Automation

### Scheduled Campaigns

Set up automated notifications:

1. **Contract Reminders** - Automatic expiry notifications
2. **Marketing Campaigns** - Scheduled promotional messages
3. **System Notifications** - Automated system updates

### Trigger Conditions

Common automation triggers:
- Contract expiry dates
- Payment due dates
- Service milestones
- User activity events

## 📚 Additional Resources

- [API Documentation](../api/README.md)
- [WhatsApp Setup Guide](../setup/whatsapp-setup.md)
- [Push Notification Setup](../setup/push-setup.md)
- [Troubleshooting Guide](../troubleshooting/README.md)

## 📞 Support

For additional help:
- Check the troubleshooting guide
- Contact your system administrator
- Use the in-app help system
- Review the API documentation for advanced usage