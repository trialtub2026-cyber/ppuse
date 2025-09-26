# Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 🔧 Installation and Setup Issues

#### Node.js Version Conflicts

**Problem:** Application won't start due to Node.js version mismatch

**Symptoms:**
- `npm install` fails with version errors
- Development server won't start
- Build process fails

**Solutions:**

1. **Check Node.js Version:**
   ```bash
   node --version  # Should be 18.x or higher
   npm --version   # Should be 9.x or higher
   ```

2. **Install Correct Version:**
   ```bash
   # Using nvm (recommended)
   nvm install 18.17.0
   nvm use 18.17.0
   
   # Or download from nodejs.org
   ```

3. **Clear npm Cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Port Already in Use

**Problem:** Development server can't start on port 5173

**Error Message:** `Error: listen EADDRINUSE: address already in use :::5173`

**Solutions:**

1. **Use Different Port:**
   ```bash
   npm run dev -- --port 3000
   ```

2. **Kill Process Using Port:**
   ```bash
   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   
   # Alternative
   npx kill-port 5173
   ```

#### Environment Variables Not Loading

**Problem:** Application can't connect to database or external services

**Symptoms:**
- Database connection errors
- WhatsApp API failures
- Push notifications not working

**Solutions:**

1. **Check .env.local File:**
   ```bash
   # Verify file exists in project root
   ls -la .env.local
   ```

2. **Verify Variable Format:**
   ```env
   # Correct format (no spaces around =)
   VITE_SUPABASE_URL=https://database.altan.ai
   
   # Incorrect format
   VITE_SUPABASE_URL = https://database.altan.ai
   ```

3. **Restart Development Server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

### 📱 Push Notification Issues

#### Service Worker Not Registering

**Problem:** Push notifications not working due to service worker issues

**Symptoms:**
- No push notification option in browser
- Console error: "Service worker registration failed"
- Notifications settings show "Not supported"

**Debugging Steps:**

1. **Check Browser Console:**
   ```javascript
   // Open DevTools (F12) and check for errors
   navigator.serviceWorker.getRegistrations()
     .then(registrations => console.log(registrations));
   ```

2. **Verify Service Worker File:**
   ```bash
   # Check if sw.js exists in public folder
   ls public/sw.js
   ```

3. **Check HTTPS Requirement:**
   - Service workers require HTTPS in production
   - Use `http://localhost` for development only

**Solutions:**

1. **Clear Browser Data:**
   - Go to browser settings
   - Clear site data for your domain
   - Refresh page

2. **Check Service Worker Code:**
   ```javascript
   // In public/sw.js
   self.addEventListener('push', function(event) {
     console.log('Push event received');
     // Handle push event
   });
   ```

3. **Manual Registration:**
   ```javascript
   // In browser console
   navigator.serviceWorker.register('/sw.js')
     .then(reg => console.log('SW registered', reg))
     .catch(err => console.log('SW registration failed', err));
   ```

#### Push Permission Denied

**Problem:** User denied notification permission or permission request not showing

**Solutions:**

1. **Reset Browser Permissions:**
   - Click lock icon in address bar
   - Reset notification permission
   - Refresh page

2. **Check Global Notification Settings:**
   - Windows: Settings > System > Notifications
   - macOS: System Preferences > Notifications
   - Ensure browser notifications are enabled

3. **Try Incognito Mode:**
   - Test in private/incognito window
   - This bypasses existing permissions

#### VAPID Key Issues

**Problem:** Push notifications fail with VAPID key errors

**Error Messages:**
- "Invalid VAPID key"
- "VAPID key format incorrect"
- "Push subscription failed"

**Solutions:**

1. **Verify VAPID Key Format:**
   ```env
   # Public key should start with 'B' and be 88 characters
   VAPID_PUBLIC_KEY=BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # Private key should be 43 characters
   VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **Generate New Keys:**
   ```bash
   npx web-push generate-vapid-keys
   ```

3. **Check Environment Loading:**
   ```javascript
   // In browser console
   console.log(import.meta.env.VITE_VAPID_PUBLIC_KEY);
   ```

### 💬 WhatsApp Issues

#### Template Not Found

**Problem:** WhatsApp messages fail with "Template not found" error

**Symptoms:**
- Messages stuck in "Failed" status
- Error: "Template 'template_name' not found"
- WhatsApp API returns 404

**Solutions:**

1. **Verify Template Exists:**
   - Check Meta Business Manager
   - Go to WhatsApp Manager > Message Templates
   - Ensure template is approved

2. **Check Template Name:**
   ```javascript
   // Template names are case-sensitive and use underscores
   // Correct
   "contract_reminder"
   
   // Incorrect
   "Contract Reminder"
   "contract-reminder"
   ```

3. **Wait for Approval:**
   - New templates need Meta approval
   - Approval takes 24-48 hours
   - Check approval status in Business Manager

#### Access Token Expired

**Problem:** WhatsApp API calls fail with authentication errors

**Error Messages:**
- "Invalid access token"
- "Token expired"
- "Authentication failed"

**Solutions:**

1. **Generate New Token:**
   - Go to Meta Developers Console
   - Navigate to your WhatsApp app
   - Generate new access token

2. **Update Environment Variables:**
   ```env
   WHATSAPP_ACCESS_TOKEN=your_new_token_here
   ```

3. **Restart Application:**
   ```bash
   # Stop and restart development server
   npm run dev
   ```

#### Phone Number Format Issues

**Problem:** Messages fail due to invalid phone number format

**Symptoms:**
- Error: "Invalid phone number"
- Messages not delivered
- WhatsApp API rejects requests

**Solutions:**

1. **Use International Format:**
   ```javascript
   // Correct formats
   "+1234567890"      // US number
   "+44123456789"     // UK number
   "+91123456789"     // India number
   
   // Incorrect formats
   "(123) 456-7890"
   "123-456-7890"
   "123.456.7890"
   ```

2. **Validate Before Sending:**
   ```javascript
   function validatePhoneNumber(phone) {
     const regex = /^\+[1-9]\d{1,14}$/;
     return regex.test(phone);
   }
   ```

#### Webhook Not Receiving Events

**Problem:** Delivery status not updating, webhook events not received

**Debugging Steps:**

1. **Check Webhook URL:**
   - Verify URL is accessible
   - Test with curl or Postman
   - Ensure HTTPS in production

2. **Verify Webhook Configuration:**
   - Go to Meta Developers Console
   - Check webhook URL and verify token
   - Ensure required fields are subscribed

3. **Check Logs:**
   ```bash
   # Check application logs for webhook requests
   # Look for POST requests to /api/whatsapp/webhook
   ```

**Solutions:**

1. **Use ngrok for Local Testing:**
   ```bash
   ngrok http 5173
   # Use the HTTPS URL for webhook
   ```

2. **Verify Webhook Fields:**
   - messages
   - message_deliveries
   - message_reads

3. **Test Webhook Manually:**
   ```bash
   curl -X POST your-webhook-url \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### 🗄️ Database Issues

#### Connection Errors

**Problem:** Cannot connect to Supabase database

**Error Messages:**
- "Database connection failed"
- "Invalid API key"
- "Network error"

**Solutions:**

1. **Check Environment Variables:**
   ```env
   VITE_SUPABASE_URL=https://database.altan.ai
   VITE_SUPABASE_ANON_KEY=tenant_a15402df_e4e2_4656_951a_47bc1c4b3493
   ```

2. **Test Connection:**
   ```javascript
   // In browser console
   import { supabase } from './src/services/database';
   supabase.from('users').select('count').then(console.log);
   ```

3. **Check Network:**
   - Verify internet connection
   - Check firewall settings
   - Try different network

#### Query Errors

**Problem:** Database queries fail or return unexpected results

**Common Errors:**
- "Table not found"
- "Column does not exist"
- "Permission denied"

**Solutions:**

1. **Check Table Names:**
   ```javascript
   // Correct table names
   'notification_templates'
   'notification_queue'
   'push_subscriptions'
   
   // Check for typos
   ```

2. **Verify Permissions:**
   - Check Row Level Security (RLS) policies
   - Ensure user has proper access
   - Test with different user roles

3. **Check Data Types:**
   ```javascript
   // Ensure data types match schema
   const data = {
     created_at: new Date().toISOString(), // Use ISO string
     is_active: true, // Boolean, not string
     retry_count: 0 // Number, not string
   };
   ```

### 🔄 Queue Processing Issues

#### Messages Stuck in Pending

**Problem:** Notifications remain in pending status and don't get processed

**Symptoms:**
- Queue shows pending items
- No processing activity
- Messages never sent

**Solutions:**

1. **Manual Queue Processing:**
   - Go to Notifications > Queue
   - Click "Process Queue" button

2. **Check Queue Service:**
   ```javascript
   // In browser console, check for errors
   console.log('Queue processing status');
   ```

3. **Restart Application:**
   ```bash
   # Stop and restart to reset queue processor
   npm run dev
   ```

#### High Failure Rate

**Problem:** Many notifications failing to send

**Debugging Steps:**

1. **Check Error Messages:**
   - Go to Queue tab
   - Click on failed notifications
   - Review error details

2. **Common Failure Causes:**
   - Invalid phone numbers
   - Expired access tokens
   - Rate limit exceeded
   - Template not approved

**Solutions:**

1. **Fix Data Issues:**
   - Validate phone numbers
   - Update access tokens
   - Use approved templates

2. **Implement Rate Limiting:**
   - Reduce sending frequency
   - Spread messages over time
   - Monitor rate limits

### 🌐 Browser Compatibility Issues

#### Features Not Working in Specific Browsers

**Problem:** Notification system doesn't work in certain browsers

**Browser Support:**
- ✅ Chrome 50+
- ✅ Firefox 44+
- ✅ Safari 16+
- ✅ Edge 17+

**Solutions:**

1. **Check Browser Version:**
   ```javascript
   // In browser console
   console.log(navigator.userAgent);
   ```

2. **Feature Detection:**
   ```javascript
   // Check required features
   console.log('Service Worker:', 'serviceWorker' in navigator);
   console.log('Push Manager:', 'PushManager' in window);
   console.log('Notifications:', 'Notification' in window);
   ```

3. **Update Browser:**
   - Ensure browser is up to date
   - Clear browser cache
   - Disable extensions that might interfere

### 🔐 Security and HTTPS Issues

#### Mixed Content Errors

**Problem:** HTTPS site trying to load HTTP resources

**Error Messages:**
- "Mixed content blocked"
- "Insecure content"
- "HTTPS required"

**Solutions:**

1. **Ensure All Resources Use HTTPS:**
   ```javascript
   // Check all API calls use HTTPS
   const apiUrl = 'https://your-domain.com/api';
   ```

2. **Local HTTPS Development:**
   ```bash
   # Install mkcert
   npm install -g mkcert
   
   # Create local certificate
   mkcert localhost 127.0.0.1 ::1
   
   # Use HTTPS in development
   npm run dev -- --https
   ```

### 📊 Performance Issues

#### Slow Loading

**Problem:** Application loads slowly or becomes unresponsive

**Solutions:**

1. **Check Network Tab:**
   - Open DevTools > Network
   - Look for slow requests
   - Check for failed requests

2. **Optimize Database Queries:**
   - Add pagination to large datasets
   - Use proper indexes
   - Limit query results

3. **Clear Browser Cache:**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

#### Memory Issues

**Problem:** Browser becomes slow or crashes

**Solutions:**

1. **Increase Node.js Memory:**
   ```bash
   set NODE_OPTIONS=--max-old-space-size=4096
   npm run dev
   ```

2. **Check for Memory Leaks:**
   - Use browser DevTools > Memory tab
   - Look for increasing memory usage
   - Check for event listener leaks

## 🆘 Getting Additional Help

### Self-Diagnosis Checklist

Before contacting support:

- [ ] Check browser console for errors
- [ ] Verify environment variables are set
- [ ] Test in different browser/incognito mode
- [ ] Check network connectivity
- [ ] Review recent changes
- [ ] Try restarting the application

### Collecting Debug Information

When reporting issues, include:

1. **Error Messages:**
   - Full error text from console
   - Screenshots of error dialogs

2. **Environment Details:**
   - Operating system and version
   - Browser and version
   - Node.js version
   - Application version

3. **Steps to Reproduce:**
   - Detailed steps that cause the issue
   - Expected vs actual behavior

4. **Network Information:**
   - Check DevTools > Network tab
   - Look for failed requests
   - Note response codes and timing

### Debug Commands

```bash
# Check versions
node --version
npm --version

# Check environment
npm run env

# Check dependencies
npm list

# Run diagnostics
npm run lint
npm run type-check

# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Contact Information

For technical support:
- Check the [User Guide](../user-guide/README.md)
- Review [API Documentation](../api/README.md)
- Contact your system administrator
- Use the in-app help system

### Emergency Procedures

If the system is completely down:

1. **Check System Status:**
   - Verify database connectivity
   - Check external service status
   - Review recent deployments

2. **Rollback if Needed:**
   ```bash
   git log --oneline -10
   git checkout <previous-working-commit>
   npm install
   npm run dev
   ```

3. **Contact Support:**
   - Provide system status information
   - Include recent change logs
   - Specify impact and urgency