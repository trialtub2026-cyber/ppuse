# WhatsApp Business API Setup

## 🏢 Meta Business Account Setup

### 1. Create Meta Business Account

1. Go to [Meta Business](https://business.facebook.com/)
2. Click **Create Account**
3. Enter your business information:
   - Business name
   - Your name
   - Business email
4. Verify your email address
5. Complete business verification if required

### 2. WhatsApp Business API Setup

1. Go to [Meta Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** as app type
4. Fill in app details:
   - App name: "Your CRM Notifications"
   - Contact email
   - Business account (select the one created above)
5. Click **Create App**

### 3. Add WhatsApp Product

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Select your business account
4. Click **Continue**

## 🔑 Get Required Credentials

### Access Token

1. Go to **WhatsApp** → **Getting Started**
2. In the **Temporary access token** section:
   - Copy the access token
   - Note: This expires in 24 hours

#### For Production - Permanent Token

1. Go to **WhatsApp** → **Configuration**
2. Click **Generate Token**
3. Select required permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Copy the permanent access token

### Phone Number ID

1. In **WhatsApp** → **Getting Started**
2. Under **Send and receive messages**
3. Copy the **Phone Number ID** from the test number
4. For production, add your verified business number

### Business Account ID

1. Go to **WhatsApp** → **Getting Started**
2. Copy the **WhatsApp Business Account ID**

## 🔗 Webhook Configuration

### 1. Set Webhook URL

**For Local Development:**
```
https://your-ngrok-url.ngrok.io/api/whatsapp/webhook
```

**For Production:**
```
https://your-domain.com/api/whatsapp/webhook
```

### 2. Configure Webhook

1. Go to **WhatsApp** → **Configuration**
2. Click **Edit** next to Webhook
3. Enter your webhook URL
4. Enter verify token (create a random string)
5. Click **Verify and Save**

### 3. Subscribe to Webhook Fields

Select these fields:
- ✅ `messages` - Incoming messages
- ✅ `message_deliveries` - Delivery status
- ✅ `message_reads` - Read receipts
- ✅ `message_echoes` - Message echoes

### 4. Verify Token

Create a secure random string for webhook verification:
```
your_custom_verify_token_123456
```

## 🌐 Local Development with ngrok

### Install ngrok

```bash
# Download from https://ngrok.com/download
# Or install via npm
npm install -g ngrok
```

### Expose Local Server

```bash
# Start your local server first
npm run dev

# In another terminal, expose port 5173
ngrok http 5173
```

### Update Webhook URL

1. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
2. Update webhook URL in Meta Developer Console
3. Add `/api/whatsapp/webhook` to the end

## 🔐 Environment Variables

Add these to your `.env.local` file:

```env
# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token_123456
```

## 📝 Message Templates

### 1. Create Templates in Meta Business Manager

1. Go to [WhatsApp Manager](https://business.facebook.com/wa/manage/)
2. Select your business account
3. Go to **Account Tools** → **Message Templates**
4. Click **Create Template**

### 2. Template Categories

Choose appropriate category:
- **UTILITY** - Account updates, order status
- **MARKETING** - Promotions, newsletters
- **AUTHENTICATION** - OTP, verification codes

### 3. Template Example

**Template Name:** `contract_reminder`
**Category:** UTILITY
**Language:** English

**Header:** None
**Body:**
```
Hi {{1}}, your service contract for {{2}} expires on {{3}}. Please contact us at {{4}} to renew your contract and continue enjoying our services.
```
**Footer:** Your Company Name
**Buttons:** None

### 4. Template Variables

Variables are numbered sequentially:
- `{{1}}` - Customer name
- `{{2}}` - Product/service name
- `{{3}}` - Expiry date
- `{{4}}` - Contact number

### 5. Template Approval

- Templates require Meta approval
- Approval typically takes 24-48 hours
- Follow Meta's template guidelines
- Avoid promotional language in UTILITY templates

## 🧪 Testing

### 1. Add Test Phone Numbers

1. Go to **WhatsApp** → **API Setup**
2. Click **Add phone number** under test numbers
3. Enter phone numbers (including country code)
4. Verify via SMS/call

### 2. Send Test Messages

1. Use the application's notification system
2. Go to **Notifications** → **Queue**
3. Create a test notification:
   - Template: Select approved template
   - Recipient: Your test phone number
   - Channel: WhatsApp
   - Variables: Fill in test data

### 3. Verify Delivery

1. Check your phone for the message
2. Monitor delivery status in the dashboard
3. Check webhook logs for delivery confirmations

## 📊 Monitoring and Analytics

### 1. Meta Business Manager Analytics

1. Go to [WhatsApp Manager](https://business.facebook.com/wa/manage/)
2. Select **Analytics**
3. Monitor:
   - Message volume
   - Delivery rates
   - Response rates
   - Template performance

### 2. Application Dashboard

Monitor in your CRM:
- Real-time delivery status
- Failed message alerts
- Template usage statistics
- Conversation tracking

## 🔒 Security Best Practices

### 1. Access Token Security

- Never commit tokens to version control
- Use environment variables
- Rotate tokens regularly
- Implement token refresh logic

### 2. Webhook Security

- Verify webhook signatures
- Use HTTPS only
- Validate incoming data
- Implement rate limiting

### 3. Phone Number Verification

- Verify phone numbers before sending
- Implement opt-in/opt-out mechanisms
- Respect user preferences
- Follow GDPR guidelines

## 🚀 Production Deployment

### 1. Business Verification

Complete Meta business verification:
- Business documents
- Website verification
- Phone verification
- Address verification

### 2. Phone Number Setup

1. Add your business phone number
2. Verify ownership
3. Complete number review process
4. Update phone number ID in configuration

### 3. Rate Limits

Production rate limits:
- **Tier 1:** 1,000 messages/day
- **Tier 2:** 10,000 messages/day
- **Tier 3:** 100,000 messages/day
- **Unlimited:** Contact Meta

### 4. Billing Setup

1. Add payment method in Meta Business Manager
2. Set up billing alerts
3. Monitor usage and costs
4. Implement cost controls

## 🐛 Common Issues

### Template Rejection

**Reasons:**
- Promotional content in UTILITY templates
- Missing required information
- Policy violations
- Unclear variable usage

**Solutions:**
- Review Meta's template guidelines
- Use appropriate categories
- Provide clear variable descriptions
- Avoid promotional language

### Webhook Not Receiving Events

**Check:**
- Webhook URL is accessible
- HTTPS is properly configured
- Verify token matches
- Webhook fields are subscribed

### Message Delivery Failures

**Common causes:**
- Invalid phone number format
- User blocked business number
- Template not approved
- Rate limit exceeded

## 📞 Support Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [WhatsApp Business API Support](https://developers.facebook.com/support/)
- [Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)

## 📋 Checklist

Before going live:

- [ ] Business account verified
- [ ] WhatsApp app created and configured
- [ ] Access tokens obtained and secured
- [ ] Webhook configured and tested
- [ ] Message templates created and approved
- [ ] Test phone numbers added and verified
- [ ] Test messages sent successfully
- [ ] Production phone number verified
- [ ] Billing configured
- [ ] Monitoring and alerts set up