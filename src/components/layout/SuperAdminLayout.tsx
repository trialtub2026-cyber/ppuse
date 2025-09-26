import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { usePortal } from '@/contexts/PortalContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Crown,
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  Loader2,
  RefreshCw,
  Shield,
  ChevronRight,
  Sparkles,
  Zap,
  Database,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PortalSwitcher from '@/components/portal/PortalSwitcher';

const SuperAdminLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { refreshAll, systemHealth, isSuperAdmin } = useSuperAdmin();
  const { isSuperAdmin: isInSuperAdminPortal } = usePortal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not super admin
  if (!isSuperAdmin()) {
    navigate('/tenant/dashboard');
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const navigationSections = [
    {
      title: "Platform Control",
      items: [
        {
          name: 'Super Admin Dashboard',
          href: '/super-admin/dashboard',
          icon: LayoutDashboard,
          current: location.pathname === '/super-admin/dashboard'
        },
        {
          name: 'System Health',
          href: '/super-admin/health',
          icon: Activity,
          current: location.pathname.startsWith('/super-admin/health')
        },
        {
          name: 'Analytics',
          href: '/super-admin/analytics',
          icon: BarChart3,
          current: location.pathname.startsWith('/super-admin/analytics')
        }
      ]
    },
    {
      title: "Management",
      items: [
        {
          name: 'Tenant Management',
          href: '/super-admin/tenants',
          icon: Building2,
          current: location.pathname.startsWith('/super-admin/tenants')
        },
        {
          name: 'Global Users',
          href: '/super-admin/users',
          icon: Users,
          current: location.pathname.startsWith('/super-admin/users')
        },
        {
          name: 'Role Requests',
          href: '/super-admin/role-requests',
          icon: UserCheck,
          current: location.pathname.startsWith('/super-admin/role-requests')
        }
      ]
    },
    {
      title: "Configuration",
      items: [
        {
          name: 'Platform Configuration',
          href: '/super-admin/configuration',
          icon: Settings,
          current: location.pathname.startsWith('/super-admin/configuration')
        }
      ]
    }
  ];

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Super Admin', href: '/super-admin/dashboard' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      if (segment !== 'super-admin') {
        currentPath += `/${segment}`;
        const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
        breadcrumbs.push({
          name,
          href: index === pathSegments.length - 1 ? undefined : `/super-admin${currentPath}`
        });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col glass-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-white/10" style={{
        background: 'linear-gradient(to right, rgba(27, 42, 65, 0.2), rgba(30, 144, 255, 0.2))'
      }}>
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg animate-glow" style={{
            background: 'linear-gradient(to bottom right, #1B2A41, #1E90FF)'
          }}>
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">Super Admin</span>
            <span className="text-xs text-white/70 font-medium flex items-center">
              <Zap className="h-3 w-3 mr-1" />
              Platform Control
            </span>
          </div>
        </div>
      </div>

      {/* Portal Switcher */}
      {user?.role === 'super_admin' && (
        <div className="p-4 border-b border-white/20">
          <PortalSwitcher />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-2 animate-fade-in">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 group touch-target",
                      item.current
                        ? "text-white border shadow-lg backdrop-blur-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md hover:backdrop-blur-sm"
                    )}
                    style={item.current ? {
                      background: 'linear-gradient(to right, rgba(30, 144, 255, 0.3), rgba(27, 42, 65, 0.3))',
                      borderColor: 'rgba(30, 144, 255, 0.4)',
                      boxShadow: '0 4px 16px rgba(30, 144, 255, 0.2)'
                    } : {}}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-300 flex-shrink-0",
                      item.current ? "animate-pulse" : "text-white/60 group-hover:text-white/90"
                    )} style={item.current ? { color: '#1E90FF' } : {}} />
                    <span className="font-medium text-high-contrast-white flex-1 text-left">{item.name}</span>
                    {item.current && (
                      <div className="h-2 w-2 rounded-full shadow-sm animate-pulse flex-shrink-0" style={{
                        backgroundColor: '#1E90FF',
                        boxShadow: '0 0 4px rgba(30, 144, 255, 0.5)'
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
            {section !== navigationSections[navigationSections.length - 1] && (
              <Separator className="bg-white/20 my-4" />
            )}
          </div>
        ))}
      </nav>

      {/* System Status */}
      {systemHealth && (
        <div className="p-4 border-t border-white/20 border-b border-white/20">
          <div className="glass-card p-3 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">System Status</span>
              <div className={cn(
                'h-2 w-2 rounded-full animate-pulse',
                systemHealth.status === 'healthy' ? 'shadow-sm' : 
                systemHealth.status === 'warning' ? 'shadow-sm' : 'shadow-sm'
              )} style={{
                backgroundColor: systemHealth.status === 'healthy' ? '#2ECC71' :
                                systemHealth.status === 'warning' ? '#F59E0B' : '#E74C3C',
                boxShadow: `0 0 4px ${systemHealth.status === 'healthy' ? '#2ECC71' :
                                     systemHealth.status === 'warning' ? '#F59E0B' : '#E74C3C'}`
              }} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Status</span>
                <Badge className="text-xs px-2 py-1" style={{
                  backgroundColor: systemHealth.status === 'healthy' ? 'rgba(46, 204, 113, 0.3)' :
                                  systemHealth.status === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 
                                  'rgba(231, 76, 60, 0.3)',
                  color: systemHealth.status === 'healthy' ? '#2ECC71' :
                         systemHealth.status === 'warning' ? '#F59E0B' : '#E74C3C',
                  borderColor: systemHealth.status === 'healthy' ? 'rgba(46, 204, 113, 0.3)' :
                              systemHealth.status === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 
                              'rgba(231, 76, 60, 0.3)'
                }}>
                  {systemHealth.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Uptime</span>
                <span className="text-xs text-white font-medium">{systemHealth.uptime}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User info */}
      <div className="border-t border-white/20 p-4" style={{
        background: 'linear-gradient(to right, rgba(27, 42, 65, 0.5), rgba(44, 62, 80, 0.5))'
      }}>
        <div className="flex items-center space-x-3 p-3 rounded-xl glass-card hover:bg-white/20 transition-all duration-300">
          <Avatar className="h-10 w-10 ring-2 shadow-lg" style={{ ringColor: 'rgba(30, 144, 255, 0.4)' }}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback style={{ background: 'linear-gradient(to bottom right, #1E90FF, #1B2A41)' }} className="text-white font-semibold">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate text-high-contrast-white">{user?.name}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs backdrop-blur-sm" style={{
                backgroundColor: 'rgba(30, 144, 255, 0.3)',
                color: '#87CEFF',
                borderColor: 'rgba(30, 144, 255, 0.3)'
              }}>
                <Shield className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="h-screen flex" style={{ backgroundColor: '#F4F6F8' }}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64 glass-modal">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="glass-header">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="lg:hidden touch-target hover:bg-neutral-100"
                      style={{ color: '#2C3E50' }}
                      onClick={() => setIsMobileMenuOpen(true)}
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                </Sheet>

                {/* Breadcrumbs */}
                <nav className="hidden md:flex items-center space-x-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.name}>
                      {index > 0 && <ChevronRight className="h-4 w-4" style={{ color: '#9EAAB7' }} />}
                      {crumb.href ? (
                        <button
                          onClick={() => navigate(crumb.href!)}
                          className="font-medium transition-colors hover:bg-neutral-100 px-2 py-1 rounded-md"
                          style={{ color: '#7A8691' }}
                          onMouseEnter={(e) => e.target.style.color = '#2C3E50'}
                          onMouseLeave={(e) => e.target.style.color = '#7A8691'}
                        >
                          {crumb.name}
                        </button>
                      ) : (
                        <span className="font-semibold px-2 py-1 rounded-md" style={{ 
                          color: '#2C3E50',
                          backgroundColor: '#F4F6F8'
                        }}>{crumb.name}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              {/* Center Section - Search */}
              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#9EAAB7' }} />
                  <Input
                    type="text"
                    placeholder="Search tenants, users, requests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 form-input"
                    style={{ 
                      color: '#2C3E50',
                      backgroundColor: 'white',
                      borderColor: '#E9EDF2'
                    }}
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="relative touch-target hover:bg-neutral-100"
                  style={{ color: '#2C3E50' }}
                >
                  <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
                </Button>

                <Button variant="ghost" size="sm" className="relative touch-target hover:bg-neutral-100" style={{ color: '#2C3E50' }}>
                  <Bell className="h-5 w-5" />
                  {systemHealth?.alerts.filter(a => !a.resolved).length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse" style={{
                      backgroundColor: '#E74C3C',
                      color: 'white'
                    }}>
                      {systemHealth.alerts.filter(a => !a.resolved).length}
                    </Badge>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full touch-target hover:bg-neutral-100">
                    <Avatar className="h-10 w-10 ring-2 shadow-sm" style={{ ringColor: '#1E90FF' }}>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback style={{ background: 'linear-gradient(to bottom right, #1E90FF, #1B2A41)' }} className="text-white font-semibold">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-modal">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none" style={{ color: '#2C3E50' }}>{user?.name}</p>
                        <p className="text-xs leading-none" style={{ color: '#9EAAB7' }}>{user?.email}</p>
                        <Badge variant="secondary" className="w-fit text-xs mt-1" style={{
                          backgroundColor: 'rgba(30, 144, 255, 0.1)',
                          color: '#1E90FF',
                          borderColor: 'rgba(30, 144, 255, 0.2)'
                        }}>
                          <Shield className="h-3 w-3 mr-1" />
                          Super Admin
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/tenant/dashboard')} className="hover:bg-neutral-100">
                      <Building2 className="mr-2 h-4 w-4" />
                      Switch to Tenant Portal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/super-admin/configuration')} className="hover:bg-neutral-100">
                      <Settings className="mr-2 h-4 w-4" />
                      Platform Configuration
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowLogoutDialog(true)} 
                      className="focus:text-error hover:bg-error-50"
                      style={{ color: '#E74C3C' }}
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing Out...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto" style={{ backgroundColor: '#F4F6F8' }}>
            <div className="h-full animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="glass-modal">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#2C3E50' }}>Sign Out</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#7A8691' }}>
              Are you sure you want to sign out of the Super Admin portal? You'll need to log in again to access platform controls.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut} className="hover:bg-neutral-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{ backgroundColor: '#E74C3C' }}
              className="hover:bg-error-600"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing Out...
                </>
              ) : (
                'Sign Out'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SuperAdminLayout;