import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  Users, 
  ShoppingCart, 
  FileText, 
  MessageSquare,
  LayoutDashboard 
} from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  const quickLinks = [
    { name: 'Dashboard', href: '/tenant/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/tenant/customers', icon: Users },
    { name: 'Sales', href: '/tenant/sales', icon: ShoppingCart },
    { name: 'Contracts', href: '/tenant/contracts', icon: FileText },
    { name: 'Tickets', href: '/tenant/tickets', icon: MessageSquare },
    { name: 'Demo Accounts', href: '/demo-accounts', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Main Error Display */}
        <div className="text-center space-y-4">
          <div className="relative">
            <h1 className="text-9xl font-bold text-slate-200 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 text-slate-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Oops! Page not found
            </h2>
            <p className="text-lg text-slate-600 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved to a different location.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline" 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/tenant/dashboard')}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-slate-900">
              Quick Navigation
            </CardTitle>
            <CardDescription className="text-slate-600">
              Jump to commonly used pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <Icon className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                    <span className="font-medium text-slate-700 group-hover:text-blue-700">
                      {link.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-slate-500">
          <p>
            If you believe this is an error, please contact support or try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
}