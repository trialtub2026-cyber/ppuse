import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rbacService } from '@/services/rbacService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Settings,
  Crown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Copy,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Role, Permission, RoleTemplate } from '@/types/rbac';

const RoleManagement: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roleTemplates, setRoleTemplates] = useState<RoleTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [templateForm, setTemplateForm] = useState({
    template_id: '',
    role_name: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, permissionsData, templatesData] = await Promise.all([
        rbacService.getRoles(),
        rbacService.getPermissions(),
        rbacService.getRoleTemplates()
      ]);
      
      setRoles(rolesData);
      setPermissions(permissionsData);
      setRoleTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!currentUser) return;

    try {
      setIsUpdating(true);
      
      const newRole = await rbacService.createRole({
        name: createForm.name,
        description: createForm.description,
        tenant_id: currentUser.tenant_id,
        permissions: createForm.permissions,
        is_system_role: false
      });

      // Log the action
      await rbacService.logAction(
        'role_created',
        'role',
        newRole.id,
        {
          created_by: currentUser.id,
          role_name: newRole.name,
          permissions_count: newRole.permissions.length
        }
      );

      // Reset form and reload data
      setCreateForm({ name: '', description: '', permissions: [] });
      await loadData();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setEditForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedRole || !currentUser) return;

    try {
      setIsUpdating(true);
      
      await rbacService.updateRole(selectedRole.id, {
        name: editForm.name,
        description: editForm.description,
        permissions: editForm.permissions
      });

      // Log the action
      await rbacService.logAction(
        'role_updated',
        'role',
        selectedRole.id,
        {
          updated_by: currentUser.id,
          role_name: editForm.name,
          permissions_count: editForm.permissions.length
        }
      );

      // Reload data
      await loadData();
      setIsEditDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole || !currentUser) return;

    try {
      setIsUpdating(true);
      
      await rbacService.deleteRole(selectedRole.id);

      // Log the action
      await rbacService.logAction(
        'role_deleted',
        'role',
        selectedRole.id,
        {
          deleted_by: currentUser.id,
          role_name: selectedRole.name
        }
      );

      // Reload data
      await loadData();
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Failed to delete role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateFromTemplate = async () => {
    if (!currentUser) return;

    try {
      setIsUpdating(true);
      
      await rbacService.createRoleFromTemplate(
        templateForm.template_id,
        templateForm.role_name,
        currentUser.tenant_id
      );

      // Reset form and reload data
      setTemplateForm({ template_id: '', role_name: '' });
      await loadData();
      setIsTemplateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create role from template:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePermissionToggle = (permissionId: string, isCreate: boolean = false) => {
    const form = isCreate ? createForm : editForm;
    const setForm = isCreate ? setCreateForm : setEditForm;
    
    const newPermissions = form.permissions.includes(permissionId)
      ? form.permissions.filter(p => p !== permissionId)
      : [...form.permissions, permissionId];
    
    setForm(prev => ({ ...prev, permissions: newPermissions }));
  };

  const getPermissionsByCategory = () => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const getRoleColor = (role: Role) => {
    if (role.is_system_role) {
      return { backgroundColor: 'rgba(30, 144, 255, 0.1)', color: '#1E90FF', borderColor: 'rgba(30, 144, 255, 0.2)' };
    }
    return { backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ECC71', borderColor: 'rgba(46, 204, 113, 0.2)' };
  };

  const getRoleIcon = (role: Role) => {
    if (role.name.toLowerCase().includes('admin')) return Crown;
    if (role.name.toLowerCase().includes('manager')) return Users;
    if (role.name.toLowerCase().includes('engineer')) return Settings;
    if (role.name.toLowerCase().includes('agent')) return Activity;
    return Shield;
  };

  const canManageRole = (role: Role) => {
    if (!currentUser) return false;
    
    // Super admin can manage all roles
    if (currentUser.role === 'super_admin') return true;
    
    // Cannot manage system roles unless super admin
    if (role.is_system_role) return false;
    
    // Can only manage roles in same tenant
    return role.tenant_id === currentUser.tenant_id;
  };

  if (!hasPermission('manage_roles')) {
    return (
      <div className="professional-container professional-section">
        <Card className="professional-card">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: '#F59E0B' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C3E50' }}>Access Denied</h3>
              <p style={{ color: '#7A8691' }}>You don't have permission to manage roles.</p>
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
          <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>Role Management</h1>
          <p className="mt-1" style={{ color: '#7A8691' }}>
            Define and manage user roles and their permissions
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="btn-secondary">
                <Sparkles className="h-4 w-4 mr-2" />
                From Template
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal">
              <DialogHeader>
                <DialogTitle style={{ color: '#2C3E50' }}>Create Role from Template</DialogTitle>
                <DialogDescription style={{ color: '#7A8691' }}>
                  Use a pre-defined template to quickly create a new role.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template" className="form-label">Template</Label>
                  <Select value={templateForm.template_id} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, template_id: value }))}>
                    <SelectTrigger className="form-input">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent className="glass-modal">
                      {roleTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs" style={{
                              backgroundColor: 'rgba(30, 144, 255, 0.1)',
                              color: '#1E90FF',
                              borderColor: 'rgba(30, 144, 255, 0.2)'
                            }}>
                              {template.category}
                            </Badge>
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-role-name" className="form-label">Role Name</Label>
                  <Input
                    id="template-role-name"
                    value={templateForm.role_name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, role_name: e.target.value }))}
                    placeholder="Enter role name"
                    className="form-input"
                  />
                </div>
                {templateForm.template_id && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(244, 246, 248, 0.5)' }}>
                    <p className="text-sm mb-2" style={{ color: '#7A8691' }}>Template Description:</p>
                    <p className="text-sm" style={{ color: '#2C3E50' }}>
                      {roleTemplates.find(t => t.id === templateForm.template_id)?.description}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)} className="btn-secondary">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFromTemplate} 
                  disabled={isUpdating || !templateForm.template_id || !templateForm.role_name}
                  className="btn-primary"
                >
                  {isUpdating ? 'Creating...' : 'Create Role'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-modal max-w-2xl">
              <DialogHeader>
                <DialogTitle style={{ color: '#2C3E50' }}>Create New Role</DialogTitle>
                <DialogDescription style={{ color: '#7A8691' }}>
                  Define a new role with specific permissions for your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="create-name" className="form-label">Role Name</Label>
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="create-description" className="form-label">Description</Label>
                  <Textarea
                    id="create-description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the role's purpose and responsibilities"
                    className="form-input"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="form-label">Permissions</Label>
                  <div className="mt-2 space-y-4 max-h-64 overflow-y-auto">
                    {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium capitalize" style={{ color: '#2C3E50' }}>{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`create-${permission.id}`}
                                checked={createForm.permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id, true)}
                              />
                              <Label htmlFor={`create-${permission.id}`} className="text-sm" style={{ color: '#7A8691' }}>
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="btn-secondary">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRole} 
                  disabled={isUpdating || !createForm.name}
                  className="btn-primary"
                >
                  {isUpdating ? 'Creating...' : 'Create Role'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roles Table */}
      <Card className="professional-card">
        <CardHeader className="professional-card-header">
          <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
            <Shield className="h-5 w-5 mr-2" />
            Roles ({roles.length})
          </CardTitle>
          <CardDescription style={{ color: '#7A8691' }}>
            Manage roles and their associated permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="professional-card-content">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
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
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => {
                    const RoleIcon = getRoleIcon(role);
                    const roleStyle = getRoleColor(role);
                    return (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(244, 246, 248, 0.5)' }}>
                              <RoleIcon className="h-5 w-5" style={{ color: '#2C3E50' }} />
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: '#2C3E50' }}>{role.name}</p>
                              <p className="text-sm" style={{ color: '#7A8691' }}>{role.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span style={{ color: '#2C3E50' }}>{role.permissions.length}</span>
                            <span className="text-sm" style={{ color: '#7A8691' }}>permissions</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="border" style={roleStyle}>
                            {role.is_system_role ? 'System' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm" style={{ color: '#7A8691' }}>
                            {new Date(role.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {canManageRole(role) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRole(role)}
                                  className="btn-ghost"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {!role.is_system_role && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRole(role)}
                                    className="btn-ghost"
                                    style={{ color: '#E74C3C' }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
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

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-modal max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#2C3E50' }}>Edit Role</DialogTitle>
            <DialogDescription style={{ color: '#7A8691' }}>
              Update role information and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="form-label">Role Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  disabled={selectedRole.is_system_role}
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="form-label">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input"
                  rows={3}
                  disabled={selectedRole.is_system_role}
                />
              </div>
              <div>
                <Label className="form-label">Permissions</Label>
                <div className="mt-2 space-y-4 max-h-64 overflow-y-auto">
                  {Object.entries(getPermissionsByCategory()).map(([category, categoryPermissions]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium capitalize" style={{ color: '#2C3E50' }}>{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-${permission.id}`}
                              checked={editForm.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id, false)}
                              disabled={selectedRole.is_system_role}
                            />
                            <Label htmlFor={`edit-${permission.id}`} className="text-sm" style={{ color: '#7A8691' }}>
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="btn-secondary">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole} 
              disabled={isUpdating || selectedRole?.is_system_role}
              className="btn-primary"
            >
              {isUpdating ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-modal">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#2C3E50' }}>Delete Role</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#7A8691' }}>
              Are you sure you want to delete the role <strong>{selectedRole?.name}</strong>? 
              This action cannot be undone and will affect all users assigned to this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isUpdating}
              className="btn-danger"
            >
              {isUpdating ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManagement;