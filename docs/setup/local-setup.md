# Local Setup Guide for Windows

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### System Requirements
- Windows 10/11
- 8GB RAM minimum
- 2GB free disk space
- Internet connection

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd trtrial-crm
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter permission issues, run PowerShell as Administrator:

```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install
```

### 3. Environment Configuration

Create `.env.local` file in the project root:

```env
# Database Configuration
VITE_SUPABASE_URL=https://database.altan.ai
VITE_SUPABASE_ANON_KEY=tenant_a15402df_e4e2_4656_951a_47bc1c4b3493
VITE_TENANT_ID=tenant_a15402df_e4e2_4656_951a_47bc1c4b3493

# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Push Notification Configuration
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:your-email@domain.com

# Application Configuration
VITE_APP_URL=http://localhost:5173
```

### 4. Database Setup

The application uses Supabase as the database. The schema is already configured with:

- **10 notification-specific tables**:
  - `notification_templates` - Message templates
  - `push_subscriptions` - Web push subscriptions
  - `whatsapp_config` - WhatsApp API configuration
  - `notification_queue` - Message queue
  - `notification_history` - Delivery tracking
  - `notification_preferences` - User preferences
  - `scheduled_jobs` - Automated campaigns
  - `whatsapp_conversations` - Conversation tracking
  - `whatsapp_messages` - Message history
  - `vapid_keys` - Push notification keys

- **User management integration**
- **Row Level Security (RLS) policies**

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

## 🔧 Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "eamodio.gitlens",
    "ms-vscode.vscode-json"
  ]
}
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🌐 Browser Setup

### Enable Developer Tools
1. Open Chrome/Edge
2. Press `F12` or `Ctrl+Shift+I`
3. Go to **Application** tab
4. Check **Service Workers** section

### Allow Notifications
1. Click the lock icon in address bar
2. Set **Notifications** to **Allow**
3. Refresh the page

## 🔧 Windows-Specific Configuration

### PowerShell Execution Policy

If you encounter script execution errors:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Windows Defender

Add project folder to Windows Defender exclusions:
1. Open Windows Security
2. Go to **Virus & threat protection**
3. Add exclusion for your project folder

### Node.js Version Management

Install Node Version Manager for Windows:

```bash
# Install nvm-windows
winget install CoreyButler.NVMforWindows

# Use Node.js 18
nvm install 18.17.0
nvm use 18.17.0
```

## 🐛 Common Issues

### Port Already in Use

If port 5173 is busy:

```bash
npm run dev -- --port 3000
```

### Node Version Issues

Check your Node.js version:

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

### Permission Issues

Run as Administrator if needed:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Navigate to project folder
4. Run commands

### Firewall Issues

Allow Node.js through Windows Firewall:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js if not listed

### SSL Certificate Issues

For local HTTPS development:

```bash
# Install mkcert
winget install FiloSottile.mkcert

# Create local CA
mkcert -install

# Generate certificate
mkcert localhost 127.0.0.1 ::1
```

## 🧪 Testing the Setup

### 1. Verify Installation

```bash
# Check if all dependencies are installed
npm list

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### 2. Test Database Connection

1. Go to `http://localhost:5173`
2. Open browser console
3. Check for database connection errors

### 3. Test Notification System

1. Navigate to **Notifications** in the sidebar
2. Go to **Settings** tab
3. Generate VAPID keys
4. Test push notification permission

## 📊 Performance Optimization

### Development Mode

```bash
# Enable source maps
VITE_SOURCE_MAP=true npm run dev

# Disable HMR if causing issues
VITE_HMR=false npm run dev
```

### Memory Issues

If you encounter memory issues:

```bash
# Increase Node.js memory limit
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
```

## 🔄 Updates and Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Clean Installation

If you encounter persistent issues:

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

## 📝 Next Steps

After successful local setup:

1. [Configure WhatsApp Business API](./whatsapp-setup.md)
2. [Set up Push Notifications](./push-setup.md)
3. [Read the User Guide](../user-guide/README.md)
4. [Review API Documentation](../api/README.md)

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](../troubleshooting/README.md)
2. Review browser console for errors
3. Check Node.js and npm versions
4. Verify environment variables
5. Contact the development team