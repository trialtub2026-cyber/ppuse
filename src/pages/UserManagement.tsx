import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { tenantService } from '@/services/tenantService';
import { rbacService } from '@/services/rbacService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Search,
  Filter,
  MoreHorizontal,
  Crown,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types/auth';

const UserManagement: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });

  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    role: 'customer'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const tenantUsers = await tenantService.getTenantUsers();
      setUsers(tenantUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      setIsUpdating(true);
      
      // Update user role if changed
      if (editForm.role !== selectedUser.role) {
        await tenantService.updateUserRole(
          currentUser.tenant_id,
          selectedUser.id,
          editForm.role
        );
        
        // Log the action
        await rbacService.logAction(
          'role_changed',
          'user',
          selectedUser.id,
          {
            old_role: selectedUser.role,
            new_role: editForm.role,
            changed_by: currentUser.id
          }
        );
      }

      // Reload users
      await loadUsers();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      setIsUpdating(true);
      
      await tenantService.removeUserFromTenant(
        currentUser.tenant_id,
        selectedUser.id
      );

      // Log the action
      await rbacService.logAction(
        'user_removed',
        'user',
        selectedUser.id,
        {
          removed_by: currentUser.id,
          user_name: selectedUser.name,
          user_email: selectedUser.email
        }
      );

      // Reload users
      await loadUsers();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddUser = async () => {
    if (!currentUser) return;

    try {
      setIsUpdating(true);
      
      await tenantService.addUserToTenant(currentUser.tenant_id, {
        name: addUserForm.name,
        email: addUserForm.email,
        role: addUserForm.role as any,
        avatar: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`
      });

      // Log the action
      await rbacService.logAction(
        'user_added',
        'user',
        undefined,
        {
          added_by: currentUser.id,
          user_name: addUserForm.name,
          user_email: addUserForm.email,
          user_role: addUserForm.role
        }
      );

      // Reset form and reload users
      setAddUserForm({ name: '', email: '', role: 'customer' });
      await loadUsers();
      setIsAddUserDialogOpen(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return { backgroundColor: 'rgba(27, 42, 65, 0.1)', color: '#1B2A41', borderColor: 'rgba(27, 42, 65, 0.2)' };
      case 'admin': return { backgroundColor: 'rgba(30, 144, 255, 0.1)', color: '#1E90FF', borderColor: 'rgba(30, 144, 255, 0.2)' };
      case 'manager': return { backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ECC71', borderColor: 'rgba(46, 204, 113, 0.2)' };
      case 'agent': return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.2)' };
      case 'engineer': return { backgroundColor: 'rgba(139, 69, 19, 0.1)', color: '#8B4513', borderColor: 'rgba(139, 69, 19, 0.2)' };
      case 'customer': return { backgroundColor: 'rgba(122, 134, 145, 0.1)', color: '#7A8691', borderColor: 'rgba(122, 134, 145, 0.2)' };
      default: return { backgroundColor: '#F4F6F8', color: '#2C3E50', borderColor: '#E9EDF2' };
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

  const canManageUser = (user: User) => {
    if (!currentUser) return false;
    
    // Cannot manage yourself
    if (currentUser.id === user.id) return false;
    
    // Super admin can manage anyone
    if (currentUser.role === 'super_admin') return true;
    
    // Users can only manage users in their tenant
    if (currentUser.tenant_id !== user.tenant_id) return false;
    
    const hierarchy = {
      super_admin: 6,
      admin: 5,
      manager: 4,
      agent: 3,
      engineer: 3,
      customer: 1
    };
    
    const currentLevel = hierarchy[currentUser.role] || 0;
    const targetLevel = hierarchy[user.role] || 0;
    
    return currentLevel > targetLevel;
  };

  if (!hasPermission('manage_users')) {
    return (
      <div className="professional-container professional-section">
        <Card className="professional-card">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: '#F59E0B' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C3E50' }}>Access Denied</h3>
              <p style={{ color: '#7A8691' }}>You don't have permission to manage users.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="professional-container professional-section space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>User Management</h1>
          <p className="mt-1" style={{ color: '#7A8691' }}>
            Manage user accounts, roles, and permissions
          </p>
        </div>
        
        {hasPermission('manage_users') && (
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal">
              <DialogHeader>
                <DialogTitle style={{ color: '#2C3E50' }}>Add New User</DialogTitle>
                <DialogDescription style={{ color: '#7A8691' }}>
                  Create a new user account for your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="add-name" className="form-label">Full Name</Label>
                  <Input
                    id="add-name"
                    value={addUserForm.name}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="add-email" className="form-label">Email Address</Label>
                  <Input
                    id="add-email"
                    type="email"
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="add-role" className="form-label">Role</Label>
                  <Select value={addUserForm.role} onValueChange={(value) => setAddUserForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="glass-modal">
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="engineer">Engineer</SelectItem>
                      {hasPermission('manage_roles') && (
                        <>
                          <SelectItem value="manager">Manager</SelectItem>
                          {currentUser?.role === 'super_admin' && (
                            <SelectItem value="admin">Admin</SelectItem>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)} className="btn-secondary">
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddUser} 
                  disabled={isUpdating || !addUserForm.name || !addUserForm.email}
                  className="btn-primary"
                >
                  {isUpdating ? 'Adding...' : 'Add User'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="professional-card">
        <CardContent className="professional-card-content">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#9EAAB7' }} />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 form-input"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="form-input">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="glass-modal">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="professional-card">
        <CardHeader className="professional-card-header">
          <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
            <Users className="h-5 w-5 mr-2" />
            Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription style={{ color: '#7A8691' }}>
            Manage user accounts and their roles within your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="professional-card-content">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="table-professional">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);
                    const roleStyle = getRoleColor(user.role);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2" style={{ ringColor: 'rgba(30, 144, 255, 0.2)' }}>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback style={{ background: 'linear-gradient(to bottom right, #1E90FF, #1B2A41)' }} className="text-white font-semibold">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium" style={{ color: '#2C3E50' }}>{user.name}</p>
                              <p className="text-sm" style={{ color: '#7A8691' }}>{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="border" style={roleStyle}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm" style={{ color: '#7A8691' }}>
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className="status-online">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {canManageUser(user) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  className="btn-ghost"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user)}
                                  className="btn-ghost"
                                  style={{ color: '#E74C3C' }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-modal">
          <DialogHeader>
            <DialogTitle style={{ color: '#2C3E50' }}>Edit User</DialogTitle>
            <DialogDescription style={{ color: '#7A8691' }}>
              Update user information and role assignments.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="form-label">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="form-label">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <Label htmlFor="edit-role" className="form-label">Role</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="form-input">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="glass-modal">
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    {hasPermission('manage_roles') && (
                      <>
                        <SelectItem value="manager">Manager</SelectItem>
                        {currentUser?.role === 'super_admin' && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="btn-secondary">
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdating} className="btn-primary">
              {isUpdating ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-modal">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#2C3E50' }}>Delete User</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#7A8691' }}>
              Are you sure you want to remove <strong>{selectedUser?.name}</strong> from your organization? 
              This action cannot be undone and will revoke all their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isUpdating}
              className="btn-danger"
            >
              {isUpdating ? 'Removing...' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;