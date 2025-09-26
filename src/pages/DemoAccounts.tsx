import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Users,
  Building,
  LogIn,
  Copy,
  Eye,
  EyeOff,
  Info,
  Crown,
  Shield,
  Activity,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types/auth';

const DemoAccounts: React.FC = () => {
  const { user: currentUser, login } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const demoAccounts = authService.getDemoAccounts();
  const defaultPassword = 'password123';

  const handleLoginAs = async (user: User) => {
    try {
      setIsLoggingIn(true);
      await login({
        email: user.email,
        password: defaultPassword
      });
      setIsLoginDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to login:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'agent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'engineer': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'customer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      case 'manager': return Users;
      case 'agent': return Activity;
      case 'engineer': return Settings;
      case 'customer': return Users;
      default: return Users;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Full platform administration with all permissions';
      case 'admin': return 'Tenant administrator with full tenant permissions';
      case 'manager': return 'Business operations manager with analytics access';
      case 'agent': return 'Customer service agent with basic operations';
      case 'engineer': return 'Technical engineer with product and job work access';
      case 'customer': return 'Customer with read-only access to own data';
      default: return 'Standard user access';
    }
  };

  const getPermissionCount = (role: string) => {
    const permissions = {
      super_admin: 18,
      admin: 15,
      manager: 8,
      agent: 5,
      engineer: 5,
      customer: 1
    };
    return permissions[role] || 0;
  };

  return (
    <div className="responsive-padding space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gradient-purple">Demo Accounts</h1>
          <p className="text-slate-600 mt-1">
            Test different user roles and permissions with pre-configured demo accounts
          </p>
        </div>
        
        {currentUser && (
          <Card className="glass-card p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200/50">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-white">Currently logged in as</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/80">{currentUser.name}</span>
                  <Badge className={cn('text-xs', getRoleColor(currentUser.role))}>
                    {currentUser.role.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Info Banner */}
      <Card className="glass-card border-blue-200/50 bg-blue-500/10">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="h-6 w-6 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-200 mb-2">Demo Account Information</h3>
              <div className="space-y-2 text-sm text-blue-100">
                <p>• All demo accounts use the password: <code className="bg-blue-900/30 px-2 py-1 rounded text-blue-200">password123</code></p>
                <p>• Each role has different permissions and access levels</p>
                <p>• Data is simulated and resets on page refresh</p>
                <p>• Perfect for testing role-based access control (RBAC)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Accounts by Tenant */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-white/20">
            All Accounts
          </TabsTrigger>
          {demoAccounts.map((group, index) => (
            <TabsTrigger key={index} value={group.tenant} className="data-[state=active]:bg-white/20">
              {group.tenant}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {demoAccounts.map((group, groupIndex) => (
            <Card key={groupIndex} className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {group.tenant}
                </CardTitle>
                <CardDescription className="text-white/70">
                  {group.users.length} demo accounts available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.users.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <Card key={user.id} className="glass-card hover:scale-105 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar className="h-12 w-12 ring-2 ring-white/20">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white truncate">{user.name}</h4>
                              <p className="text-sm text-white/60 truncate">{user.email}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge className={cn('border flex items-center space-x-1', getRoleColor(user.role))}>
                                <RoleIcon className="h-3 w-3" />
                                <span>{user.role.replace('_', ' ')}</span>
                              </Badge>
                              <span className="text-xs text-white/60">
                                {getPermissionCount(user.role)} permissions
                              </span>
                            </div>
                            
                            <p className="text-xs text-white/70">
                              {getRoleDescription(user.role)}
                            </p>
                            
                            <Separator className="bg-white/20" />
                            
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsLoginDialogOpen(true);
                                }}
                                className="flex-1 btn-gradient"
                              >
                                <LogIn className="h-4 w-4 mr-1" />
                                Login
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(user.email)}
                                className="border-white/20 text-white/80 hover:bg-white/10"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {demoAccounts.map((group, groupIndex) => (
          <TabsContent key={groupIndex} value={group.tenant} className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  {group.tenant} - Demo Accounts
                </CardTitle>
                <CardDescription className="text-white/70">
                  Role-based access control demonstration for {group.tenant}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {group.users.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    return (
                      <Card key={user.id} className="glass-card">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <Avatar className="h-16 w-16 ring-2 ring-white/20">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white text-lg">{user.name}</h4>
                              <p className="text-white/60">{user.email}</p>
                              <Badge className={cn('mt-2 border flex items-center space-x-1 w-fit', getRoleColor(user.role))}>
                                <RoleIcon className="h-3 w-3" />
                                <span>{user.role.replace('_', ' ')}</span>
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-medium text-white mb-2">Role Description</h5>
                              <p className="text-sm text-white/70">{getRoleDescription(user.role)}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/70">Permissions</span>
                              <Badge variant="outline" className="text-white/80 border-white/20">
                                {getPermissionCount(user.role)} total
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/70">Last Login</span>
                              <span className="text-sm text-white/80">
                                {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                            
                            <Separator className="bg-white/20" />
                            
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsLoginDialogOpen(true);
                                }}
                                className="flex-1 btn-gradient"
                              >
                                <LogIn className="h-4 w-4 mr-2" />
                                Login as {user.name.split(' ')[0]}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => copyToClipboard(user.email)}
                                className="border-white/20 text-white/80 hover:bg-white/10"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Login Confirmation Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="glass-modal">
          <DialogHeader>
            <DialogTitle>Login as Demo User</DialogTitle>
            <DialogDescription>
              You're about to login as a demo user. This will replace your current session.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white/20">
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {selectedUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{selectedUser.name}</h4>
                      <p className="text-sm text-white/60">{selectedUser.email}</p>
                      <Badge className={cn('mt-1 text-xs', getRoleColor(selectedUser.role))}>
                        {selectedUser.role.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email</Label>
                <div className="relative">
                  <Input
                    id="demo-email"
                    value={selectedUser.email}
                    readOnly
                    className="form-input pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedUser.email)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="demo-password">Password</Label>
                <div className="relative">
                  <Input
                    id="demo-password"
                    type={showPassword ? 'text' : 'password'}
                    value={defaultPassword}
                    readOnly
                    className="form-input pr-20"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-6 w-6 p-0"
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(defaultPassword)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-200/20">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">What you'll have access to:</p>
                    <p>{getRoleDescription(selectedUser.role)}</p>
                    <p className="mt-1 text-blue-300">
                      {getPermissionCount(selectedUser.role)} permissions included
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoginDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedUser && handleLoginAs(selectedUser)}
              disabled={isLoggingIn}
              className="btn-gradient"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DemoAccounts;