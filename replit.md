# CRM Portal - Replit Project Documentation

## Overview
This is a modern CRM (Customer Relationship Management) portal built with React, TypeScript, and Vite. The application features multiple portals including tenant management and super admin functionality.

**Current State**: Successfully configured for Replit environment and running on port 5000

## Recent Changes (September 26, 2025)
- ✅ Configured Vite development server to run on `0.0.0.0:5000` instead of default port
- ✅ Fixed build system to work with Replit's Bun runtime
- ✅ Bypassed Husky git hooks that were causing installation issues
- ✅ Set up workflow to serve the frontend development server
- ✅ Configured deployment for autoscale with production build
- ✅ Added serve package for production deployment

## Project Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: Radix UI + TailwindCSS
- **Routing**: React Router v6 with nested routes
- **State Management**: React Context (Auth, Portal, Theme)
- **Build Tool**: Vite 4.4.5
- **Package Manager**: Bun (configured for Replit)

### Key Directories:
- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Route-based page components
- `src/services/` - API service layer with both mock and real implementations
- `src/contexts/` - React context providers
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions and helpers

### Portals:
1. **Tenant Portal** (`/tenant/*`) - Main CRM functionality
2. **Super Admin Portal** (`/super-admin/*`) - System administration

## Development Setup
- **Run Command**: `HUSKY=0 bun run dev`
- **Build Command**: `bun run build`
- **Dev Server**: Runs on port 5000 (configured for Replit)
- **HMR**: Hot Module Replacement enabled on port 5000

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build**: `bun run build`
- **Run**: `npx serve -s dist -l 5000`
- **Production**: Serves static assets from `dist/` directory

## API Configuration
The application is configured to work with both mock and real APIs:
- Mock API: `/mock-api` (for development)
- Development API: `http://localhost:5000/api/v1`
- Environment controlled via `VITE_USE_MOCK_API` and `VITE_API_ENVIRONMENT`

## User Preferences
- This project uses Bun as the package manager
- Husky git hooks are disabled in Replit environment (`HUSKY=0`)
- Frontend development server configured for Replit proxy requirements

## Notes
- The project includes comprehensive TypeScript types and error handling
- Features authentication with session management
- Includes PWA (Progressive Web App) configuration
- Uses Supabase for backend services
- Contains audit logging and notification systems