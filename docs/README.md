# WhatsApp + Push Notification System Documentation

## 📚 Documentation Index

- [Local Setup Guide](./setup/local-setup.md) - Complete Windows setup instructions
- [WhatsApp Configuration](./setup/whatsapp-setup.md) - Meta Business API setup
- [Push Notification Setup](./setup/push-setup.md) - Web Push configuration
- [API Documentation](./api/README.md) - Backend API reference
- [User Guide](./user-guide/README.md) - How to use the system
- [Troubleshooting](./troubleshooting/README.md) - Common issues and solutions

## 🚀 Quick Start

1. Follow the [Local Setup Guide](./setup/local-setup.md)
2. Configure [WhatsApp Business API](./setup/whatsapp-setup.md)
3. Set up [Push Notifications](./setup/push-setup.md)
4. Start sending notifications!

## 🎯 System Overview

This notification system provides:

- **Multi-Channel Messaging**: Send via WhatsApp, Push notifications, or both
- **Template Management**: Create reusable message templates with variables
- **Queue Processing**: Automatic retry logic and rate limiting
- **Real-time Analytics**: Track delivery status and performance
- **Automated Campaigns**: Schedule contract reminders and marketing messages
- **User Preferences**: GDPR-compliant notification settings

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │   Services      │    │   Database      │
│                 │    │                 │    │                 │
│ • Dashboard     │◄──►│ • Notification  │◄──►│ • Templates     │
│ • Templates     │    │ • WhatsApp      │    │ • Queue         │
│ • Queue         │    │ • Push          │    │ • History       │
│ • Settings      │    │ • Scheduler     │    │ • Preferences   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+
- Windows 10/11
- Meta Business Account
- WhatsApp Business API access
- SSL certificate (for production)

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📞 Support

For technical support or questions:
- Check the [Troubleshooting Guide](./troubleshooting/README.md)
- Review the [API Documentation](./api/README.md)
- Contact the development team

## 📄 License

This project is proprietary software. All rights reserved.