# Push Notification Setup

## 🔑 VAPID Keys Generation

### 1. Generate VAPID Keys in Application

**Recommended Method:**

1. Start your local development server
2. Go to **Notifications** → **Settings**
3. Click **"Generate VAPID Keys"** button
4. Copy the generated keys to your environment file

### 2. Manual Generation (Alternative)

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

Output example:
```
=======================================
Public Key:
BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Private Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
=======================================
```

### 3. Environment Configuration

Add to your `.env.local` file:

```env
# Push Notification Configuration
VAPID_PUBLIC_KEY=BKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VAPID_SUBJECT=mailto:your-email@domain.com
```

**Important Notes:**
- Replace `your-email@domain.com` with your actual contact email
- Keep private key secure and never expose it publicly
- Public key can be safely used in client-side code

## 🌐 Service Worker Setup

### 1. Service Worker Registration

The service worker is automatically registered in the application at `/public/sw.js`.

**Automatic Features:**
- Push event handling
- Notification display
- Click event handling
- Background sync

### 2. Push Permission Request

Users will be prompted for notification permission when:
- First visiting the notifications page
- Clicking **"Enable Push Notifications"**
- Attempting to subscribe to notifications

### 3. Subscription Management

**Automatic Handling:**
- Subscriptions are saved to database
- User preferences are respected
- Expired subscriptions are cleaned up
- Browser compatibility is checked

## 🔧 Browser Compatibility

### Supported Browsers

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 50+     | ✅ Full |
| Firefox | 44+     | ✅ Full |
| Safari  | 16+     | ✅ Full |
| Edge    | 17+     | ✅ Full |
| Opera   | 37+     | ✅ Full |

### Required Features

- ✅ Service Workers
- ✅ Push API
- ✅ Notification API
- ✅ Web App Manifest

### Feature Detection

The application automatically detects browser support:

```javascript
// Automatic checks performed
if ('serviceWorker' in navigator) {
  // Service Worker supported
}

if ('PushManager' in window) {
  // Push notifications supported
}

if ('Notification' in window) {
  // Notifications supported
}
```

## 📱 Testing Push Notifications

### 1. Local Development Testing

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Open Browser Developer Tools:**
   - Press `F12` or `Ctrl+Shift+I`
   - Go to **Application** tab
   - Check **Service Workers** section

3. **Verify Service Worker Registration:**
   - Should show `sw.js` as registered
   - Status should be "activated"

### 2. Test Push Subscription

1. **Navigate to Notifications:**
   - Go to `http://localhost:5173/notifications`
   - Click **Settings** tab

2. **Enable Push Notifications:**
   - Click **"Enable Push Notifications"**
   - Allow permission when prompted
   - Verify subscription is saved

3. **Send Test Notification:**
   - Go to **Queue** tab
   - Click **"Send Notification"**
   - Select **Push** as channel
   - Choose a template
   - Enter your user ID as recipient
   - Click **Send**

### 3. Debug Common Issues

**Check Browser Console for:**
- Service worker registration errors
- Push subscription failures
- Notification permission issues
- VAPID key validation errors

**Common Error Messages:**
```javascript
// Permission denied
"User denied notification permission"

// Service worker failed
"Failed to register service worker"

// VAPID key invalid
"Invalid VAPID key format"
```

## 🔒 Security Considerations

### HTTPS Requirement

**Production Requirements:**
- Push notifications require HTTPS
- Service workers only work over HTTPS
- Local development works with HTTP

**SSL Certificate Setup:**
```bash
# For local HTTPS development
npm install -g mkcert
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### User Privacy

**Best Practices:**
- Request permission explicitly
- Explain why notifications are useful
- Provide easy unsubscribe options
- Respect user preferences
- Follow GDPR guidelines

**Permission Request Example:**
```javascript
// Good: Clear explanation
"Enable notifications to receive important updates about your service contracts and account activity."

// Bad: Vague request
"Enable notifications"
```

### Data Protection

**Security Measures:**
- Validate all push payloads
- Encrypt sensitive data
- Use secure headers
- Implement rate limiting
- Monitor for abuse

## 📊 Analytics and Monitoring

### Track Push Performance

**Key Metrics:**
- Subscription rates
- Delivery success rates
- Click-through rates
- Unsubscribe rates
- Error rates

### Monitor in Dashboard

**Real-time Monitoring:**
- Delivery status tracking
- Failed notification alerts
- User engagement metrics
- Browser compatibility stats

**Dashboard Features:**
- Live notification queue
- Delivery analytics
- Error reporting
- Performance metrics

## 🛠️ Advanced Configuration

### Custom Notification Options

```javascript
// Advanced notification options
const notificationOptions = {
  title: 'Contract Reminder',
  body: 'Your service contract expires soon',
  icon: '/icons/notification-icon.png',
  badge: '/icons/badge-icon.png',
  image: '/images/contract-banner.jpg',
  data: {
    contractId: '12345',
    url: '/contracts/12345'
  },
  actions: [
    {
      action: 'view',
      title: 'View Contract',
      icon: '/icons/view-icon.png'
    },
    {
      action: 'renew',
      title: 'Renew Now',
      icon: '/icons/renew-icon.png'
    }
  ],
  requireInteraction: true,
  silent: false,
  tag: 'contract-reminder',
  timestamp: Date.now(),
  vibrate: [200, 100, 200]
};
```

### Custom Service Worker

If you need to customize the service worker:

1. **Edit `/public/sw.js`:**
   ```javascript
   // Custom push event handler
   self.addEventListener('push', function(event) {
     const options = event.data.json();
     
     // Custom logic here
     
     event.waitUntil(
       self.registration.showNotification(options.title, options)
     );
   });
   ```

2. **Handle Notification Clicks:**
   ```javascript
   self.addEventListener('notificationclick', function(event) {
     event.notification.close();
     
     if (event.action === 'view') {
       // Handle view action
     } else if (event.action === 'renew') {
       // Handle renew action
     }
   });
   ```

## 🐛 Troubleshooting

### Common Issues

**1. Service Worker Not Registering**
```javascript
// Check for errors in console
navigator.serviceWorker.register('/sw.js')
  .then(registration => console.log('SW registered'))
  .catch(error => console.log('SW registration failed', error));
```

**2. Push Subscription Failing**
```javascript
// Check VAPID key format
const vapidKey = 'BK...'; // Should start with 'B' and be 88 characters
```

**3. Notifications Not Appearing**
- Check notification permission status
- Verify service worker is active
- Check browser notification settings
- Ensure HTTPS in production

**4. Permission Denied**
- Clear browser data and try again
- Check if notifications are blocked globally
- Try in incognito mode
- Reset notification permissions

### Debug Commands

```javascript
// Check notification permission
console.log(Notification.permission);

// Check service worker status
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations));

// Check push subscription
navigator.serviceWorker.ready
  .then(registration => registration.pushManager.getSubscription())
  .then(subscription => console.log(subscription));
```

## 🚀 Production Deployment

### 1. SSL Certificate

**Requirements:**
- Valid SSL certificate
- HTTPS enabled
- Secure headers configured

### 2. Service Worker Caching

**Optimize for Production:**
```javascript
// Cache notification assets
const CACHE_NAME = 'notifications-v1';
const urlsToCache = [
  '/icons/notification-icon.png',
  '/icons/badge-icon.png',
  '/sounds/notification.mp3'
];
```

### 3. Performance Optimization

**Best Practices:**
- Minimize payload size
- Use efficient images
- Implement proper caching
- Monitor performance metrics

### 4. Monitoring Setup

**Production Monitoring:**
- Error tracking (Sentry, etc.)
- Performance monitoring
- User analytics
- Delivery rate tracking

## 📋 Testing Checklist

Before going live:

- [ ] VAPID keys generated and configured
- [ ] Service worker registered successfully
- [ ] Push permission working
- [ ] Test notifications delivered
- [ ] Browser compatibility verified
- [ ] HTTPS configured for production
- [ ] Error handling implemented
- [ ] Analytics tracking setup
- [ ] User preferences working
- [ ] Unsubscribe functionality tested

## 📞 Support Resources

- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)
- [Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker Guide](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

## 🔄 Maintenance

### Regular Tasks

**Weekly:**
- Monitor delivery rates
- Check error logs
- Review user feedback

**Monthly:**
- Clean expired subscriptions
- Update browser compatibility
- Review performance metrics

**Quarterly:**
- Rotate VAPID keys if needed
- Update service worker
- Review security practices