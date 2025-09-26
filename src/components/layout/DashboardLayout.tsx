import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePortal } from '../../contexts/PortalContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Shield,
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  FileText,
  MessageSquare,
  Wrench,
  Building,
  Database,
  Activity,
  ChevronRight,
  Home,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';

const DashboardLayout = () => {
  const { user, logout, hasRole, hasPermission } = useAuth();
  const { currentPortal, switchPortal } = usePortal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation items grouped by sections
  const navigationSections = [
    {
      title: "Core",
      items: [
        { name: 'Dashboard', href: '/tenant/dashboard', icon: LayoutDashboard, permission: 'read' },
        { name: 'Customers', href: '/tenant/customers', icon: Users, permission: 'read' },
        { name: 'Sales', href: '/tenant/sales', icon: ShoppingCart, permission: 'read' },
      ]
    },
    {
      title: "Operations",
      items: [
        { name: 'Product Sales', href: '/tenant/product-sales', icon: Package, permission: 'manage_sales' },
        { name: 'Service Contracts', href: '/tenant/service-contracts', icon: FileText, permission: 'manage_contracts' },
        { name: 'Contracts', href: '/tenant/contracts', icon: FileText, permission: 'manage_contracts' },
        { name: 'Tickets', href: '/tenant/tickets', icon: MessageSquare, permission: 'read' },
        { name: 'Complaints', href: '/tenant/complaints', icon: MessageSquare, permission: 'read' },
        { name: 'Job Works', href: '/tenant/job-works', icon: Wrench, permission: 'read' },
      ]
    }
  ];

  // Admin-only sections
  if (hasRole('admin')) {
    navigationSections.push({
      title: "Administration",
      items: [
        { name: 'User Management', href: '/tenant/user-management', icon: Users, permission: 'manage_users' },
        { name: 'Role Management', href: '/tenant/role-management', icon: Shield, permission: 'manage_roles' },
        { name: 'Permission Matrix', href: '/tenant/permission-matrix', icon: Settings, permission: 'manage_roles' },
        { name: 'PDF Templates', href: '/tenant/pdf-templates', icon: FileText, permission: 'manage_users' },
        { name: 'Company Master', href: '/tenant/masters/companies', icon: Building, permission: 'manage_companies' },
        { name: 'Product Master', href: '/tenant/masters/products', icon: Package, permission: 'manage_products' },
        { name: 'Customer Master', href: '/tenant/masters/customers', icon: Users, permission: 'manage_customers' },
        { name: 'Audit Logs', href: '/tenant/logs', icon: Activity, permission: 'manage_users' },
      ]
    });
  }

  if (hasPermission('manage_users')) {
    navigationSections.push({
      title: "Settings",
      items: [
        { name: 'Configuration', href: '/tenant/configuration', icon: Settings, permission: 'manage_users' },
        { name: 'Notifications', href: '/tenant/notifications', icon: Bell, permission: 'read' },
      ]
    });
  }

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/tenant/dashboard' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      if (segment !== 'tenant') {
        currentPath += `/${segment}`;
        const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
        breadcrumbs.push({
          name,
          href: index === pathSegments.length - 1 ? undefined : `/tenant${currentPath}`
        });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col glass-sidebar">
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-center border-b border-white/10" style={{
        background: 'linear-gradient(to right, rgba(30, 144, 255, 0.2), rgba(27, 42, 65, 0.2))'
      }}>
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg animate-glow" style={{
            background: 'linear-gradient(to bottom right, #1E90FF, #1B2A41)'
          }}>
            <Database className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">CRM Pro</span>
            <span className="text-xs text-white/70 font-medium flex items-center">
              <Sparkles className="h-3 w-3 mr-1" />
              Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-2 animate-fade-in">
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-3">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items
                .filter(item => hasPermission(item.permission))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 group touch-target",
                        isActive
                          ? "text-white border shadow-lg backdrop-blur-sm"
                          : "text-white/80 hover:text-white hover:bg-white/10 hover:shadow-md hover:backdrop-blur-sm"
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(to right, rgba(30, 144, 255, 0.3), rgba(27, 42, 65, 0.3))',
                        borderColor: 'rgba(30, 144, 255, 0.4)',
                        boxShadow: '0 4px 16px rgba(30, 144, 255, 0.2)'
                      } : {}}
                    >
                      <Icon className={cn(
                        "h-5 w-5 transition-all duration-300 flex-shrink-0",
                        isActive ? "animate-pulse" : "text-white/60 group-hover:text-white/90"
                      )} style={isActive ? { color: '#1E90FF' } : {}} />
                      <span className="font-medium text-high-contrast-white flex-1 text-left">{item.name}</span>
                      {isActive && (
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

      {/* User Section */}
      <div className="border-t border-white/20 p-4" style={{
        background: 'linear-gradient(to right, rgba(27, 42, 65, 0.5), rgba(44, 62, 80, 0.5))'
      }}>
        <div className="flex items-center space-x-3 p-3 rounded-xl glass-card hover:bg-white/20 transition-all duration-300">
          <Avatar className="h-10 w-10 ring-2 shadow-lg" style={{ ringColor: 'rgba(30, 144, 255, 0.4)' }}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback style={{ background: 'linear-gradient(to bottom right, #1E90FF, #1B2A41)' }} className="text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
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
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
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
        {/* Header */}
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
                  placeholder="Search customers, contracts, tickets..."
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
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative touch-target hover:bg-neutral-100" style={{ color: '#2C3E50' }}>
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs animate-pulse" style={{
                  backgroundColor: '#E74C3C',
                  color: 'white'
                }}>
                  3
                </Badge>
              </Button>

              {/* Portal Switcher for Super Admin */}
              {hasRole('super_admin') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" style={{
                      borderColor: '#1E90FF',
                      color: '#1E90FF',
                      backgroundColor: 'rgba(30, 144, 255, 0.1)'
                    }} className="hover:bg-accent-100">
                      <Shield className="h-4 w-4 mr-2" />
                      {currentPortal === 'super-admin' ? 'Super Admin' : 'Tenant'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 glass-modal">
                    <DropdownMenuLabel>Switch Portal</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => switchPortal('tenant')}>
                      <Building className="mr-2 h-4 w-4" />
                      Tenant Portal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => switchPortal('super-admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Super Admin Portal
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full touch-target hover:bg-neutral-100">
                    <Avatar className="h-10 w-10 ring-2 shadow-sm" style={{ ringColor: '#1E90FF' }}>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback style={{ background: 'linear-gradient(to bottom right, #1E90FF, #1B2A41)' }} className="text-white font-semibold">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-modal" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none" style={{ color: '#2C3E50' }}>{user?.name}</p>
                      <p className="text-xs leading-none" style={{ color: '#9EAAB7' }}>{user?.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs mt-1" style={{
                        backgroundColor: 'rgba(30, 144, 255, 0.1)',
                        color: '#1E90FF',
                        borderColor: 'rgba(30, 144, 255, 0.2)'
                      }}>
                        {user?.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/tenant/profile')} className="hover:bg-neutral-100">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/tenant/settings')} className="hover:bg-neutral-100">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="focus:text-error hover:bg-error-50" style={{ color: '#E74C3C' }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto" style={{ backgroundColor: '#F4F6F8' }}>
          <div className="h-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;