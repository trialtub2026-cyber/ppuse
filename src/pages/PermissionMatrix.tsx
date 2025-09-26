import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { rbacService } from '@/services/rbacService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Grid,
  List,
  Download,
  Upload,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  Users,
  Settings,
  Crown,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Role, Permission, PermissionMatrix } from '@/types/rbac';

const PermissionMatrix: React.FC = () => {
  const { user: currentUser, hasPermission } = useAuth();
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      setIsLoading(true);
      const matrixData = await rbacService.getPermissionMatrix();
      setMatrix(matrixData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load permission matrix:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (roleId: string, permissionId: string) => {
    if (!matrix) return;

    const newMatrix = {
      ...matrix,
      matrix: {
        ...matrix.matrix,
        [roleId]: {
          ...matrix.matrix[roleId],
          [permissionId]: !matrix.matrix[roleId][permissionId]
        }
      }
    };

    setMatrix(newMatrix);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!matrix || !currentUser) return;

    try {
      setIsSaving(true);

      // In a real implementation, this would save the matrix to the backend
      // For now, we'll simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log the action
      await rbacService.logAction(
        'permission_matrix_updated',
        'permissions',
        undefined,
        {
          updated_by: currentUser.id,
          roles_count: matrix.roles.length,
          permissions_count: matrix.permissions.length
        }
      );

      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetChanges = () => {
    loadMatrix();
  };

  const getPermissionsByCategory = () => {
    if (!matrix) return {};
    
    return matrix.permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const getFilteredPermissions = () => {
    if (!matrix) return [];
    
    if (selectedCategory === 'all') {
      return matrix.permissions;
    }
    
    return matrix.permissions.filter(p => p.category === selectedCategory);
  };

  const getRoleIcon = (role: Role) => {
    if (role.name.toLowerCase().includes('admin')) return Crown;
    if (role.name.toLowerCase().includes('manager')) return Users;
    if (role.name.toLowerCase().includes('engineer')) return Settings;
    if (role.name.toLowerCase().includes('agent')) return Activity;
    return Shield;
  };

  const getRoleColor = (role: Role) => {
    if (role.is_system_role) {
      return { backgroundColor: 'rgba(30, 144, 255, 0.1)', color: '#1E90FF', borderColor: 'rgba(30, 144, 255, 0.2)' };
    }
    return { backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ECC71', borderColor: 'rgba(46, 204, 113, 0.2)' };
  };

  const getPermissionCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return { backgroundColor: 'rgba(30, 144, 255, 0.1)', color: '#1E90FF', borderColor: 'rgba(30, 144, 255, 0.2)' };
      case 'module': return { backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ECC71', borderColor: 'rgba(46, 204, 113, 0.2)' };
      case 'administrative': return { backgroundColor: 'rgba(27, 42, 65, 0.1)', color: '#1B2A41', borderColor: 'rgba(27, 42, 65, 0.2)' };
      case 'system': return { backgroundColor: 'rgba(231, 76, 60, 0.1)', color: '#E74C3C', borderColor: 'rgba(231, 76, 60, 0.2)' };
      default: return { backgroundColor: '#F4F6F8', color: '#2C3E50', borderColor: '#E9EDF2' };
    }
  };

  const calculateRolePermissionCount = (roleId: string) => {
    if (!matrix) return 0;
    return Object.values(matrix.matrix[roleId] || {}).filter(Boolean).length;
  };

  const calculatePermissionRoleCount = (permissionId: string) => {
    if (!matrix) return 0;
    return Object.values(matrix.matrix).filter(roleMatrix => roleMatrix[permissionId]).length;
  };

  if (!hasPermission('manage_roles')) {
    return (
      <div className="professional-container professional-section">
        <Card className="professional-card">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: '#F59E0B' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2C3E50' }}>Access Denied</h3>
              <p style={{ color: '#7A8691' }}>You don't have permission to view the permission matrix.</p>
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
          <h1 className="text-3xl font-bold" style={{ color: '#2C3E50' }}>Permission Matrix</h1>
          <p className="mt-1" style={{ color: '#7A8691' }}>
            Visual overview of role permissions and access control
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleResetChanges}
                className="btn-secondary"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
          
          <div className="flex items-center space-x-1 rounded-lg p-1" style={{ backgroundColor: 'rgba(244, 246, 248, 0.5)' }}>
            <Button
              variant={viewMode === 'matrix' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('matrix')}
              className={viewMode === 'matrix' ? 'btn-primary' : 'btn-ghost'}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {hasChanges && (
        <Card className="professional-card" style={{
          borderColor: 'rgba(245, 158, 11, 0.3)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)'
        }}>
          <CardContent className="professional-card-content">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5" style={{ color: '#F59E0B' }} />
              <span className="font-medium" style={{ color: '#F59E0B' }}>
                You have unsaved changes. Don't forget to save your modifications.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="professional-card">
        <CardContent className="professional-card-content">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="glass-modal">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="module">Module</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {matrix && (
              <div className="flex items-center space-x-4 text-sm" style={{ color: '#7A8691' }}>
                <span>{matrix.roles.length} roles</span>
                <span>•</span>
                <span>{getFilteredPermissions().length} permissions</span>
                {selectedCategory !== 'all' && (
                  <>
                    <span>•</span>
                    <Badge className="text-xs border" style={getPermissionCategoryColor(selectedCategory)}>
                      {selectedCategory}
                    </Badge>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'matrix' | 'list')}>
        <TabsContent value="matrix">
          <Card className="professional-card">
            <CardHeader className="professional-card-header">
              <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
                <Grid className="h-5 w-5 mr-2" />
                Permission Matrix
              </CardTitle>
              <CardDescription style={{ color: '#7A8691' }}>
                Interactive matrix showing role-permission relationships
              </CardDescription>
            </CardHeader>
            <CardContent className="professional-card-content">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : matrix ? (
                <div className="overflow-x-auto">
                  <Table className="table-professional">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-48">Permission</TableHead>
                        {matrix.roles.map((role) => {
                          const RoleIcon = getRoleIcon(role);
                          return (
                            <TableHead key={role.id} className="text-center min-w-24">
                              <div className="flex flex-col items-center space-y-1">
                                <div className="flex items-center space-x-1">
                                  <RoleIcon className="h-4 w-4" style={{ color: '#7A8691' }} />
                                  <span className="text-xs font-medium" style={{ color: '#2C3E50' }}>
                                    {role.name.length > 8 ? role.name.substring(0, 8) + '...' : role.name}
                                  </span>
                                </div>
                                <Badge className="text-xs border" style={getRoleColor(role)}>
                                  {calculateRolePermissionCount(role.id)}
                                </Badge>
                              </div>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredPermissions().map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm" style={{ color: '#2C3E50' }}>{permission.name}</span>
                                <Badge className="text-xs border" style={getPermissionCategoryColor(permission.category)}>
                                  {permission.category}
                                </Badge>
                              </div>
                              <p className="text-xs" style={{ color: '#7A8691' }}>{permission.description}</p>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs" style={{ color: '#9EAAB7' }}>
                                  {calculatePermissionRoleCount(permission.id)} roles
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          {matrix.roles.map((role) => (
                            <TableCell key={role.id} className="text-center">
                              <Checkbox
                                checked={matrix.matrix[role.id]?.[permission.id] || false}
                                onCheckedChange={() => handlePermissionToggle(role.id, permission.id)}
                                disabled={role.is_system_role && currentUser?.role !== 'super_admin'}
                                className="mx-auto"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: '#F59E0B' }} />
                  <p style={{ color: '#7A8691' }}>Failed to load permission matrix</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Roles List */}
            <Card className="professional-card">
              <CardHeader className="professional-card-header">
                <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
                  <Shield className="h-5 w-5 mr-2" />
                  Roles
                </CardTitle>
                <CardDescription style={{ color: '#7A8691' }}>
                  Role-based permission overview
                </CardDescription>
              </CardHeader>
              <CardContent className="professional-card-content">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : matrix ? (
                  <div className="space-y-4">
                    {matrix.roles.map((role) => {
                      const RoleIcon = getRoleIcon(role);
                      const permissionCount = calculateRolePermissionCount(role.id);
                      const roleStyle = getRoleColor(role);
                      return (
                        <div key={role.id} className="p-4 rounded-lg border transition-colors" style={{
                          backgroundColor: 'rgba(244, 246, 248, 0.3)',
                          borderColor: '#E9EDF2'
                        }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(244, 246, 248, 0.5)' }}>
                                <RoleIcon className="h-5 w-5" style={{ color: '#2C3E50' }} />
                              </div>
                              <div>
                                <h4 className="font-medium" style={{ color: '#2C3E50' }}>{role.name}</h4>
                                <p className="text-sm" style={{ color: '#7A8691' }}>{role.description}</p>
                              </div>
                            </div>
                            <Badge className="border" style={roleStyle}>
                              {role.is_system_role ? 'System' : 'Custom'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#7A8691' }}>
                              {permissionCount} of {matrix.permissions.length} permissions
                            </span>
                            <div className="w-32 rounded-full h-2" style={{ backgroundColor: 'rgba(244, 246, 248, 0.5)' }}>
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(permissionCount / matrix.permissions.length) * 100}%`,
                                  background: 'linear-gradient(to right, #1E90FF, #1B2A41)'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* Permissions List */}
            <Card className="professional-card">
              <CardHeader className="professional-card-header">
                <CardTitle className="flex items-center" style={{ color: '#2C3E50' }}>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Permissions
                </CardTitle>
                <CardDescription style={{ color: '#7A8691' }}>
                  Permission usage across roles
                </CardDescription>
              </CardHeader>
              <CardContent className="professional-card-content">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : matrix ? (
                  <div className="space-y-4">
                    {getFilteredPermissions().map((permission) => {
                      const roleCount = calculatePermissionRoleCount(permission.id);
                      const categoryStyle = getPermissionCategoryColor(permission.category);
                      return (
                        <div key={permission.id} className="p-4 rounded-lg border transition-colors" style={{
                          backgroundColor: 'rgba(244, 246, 248, 0.3)',
                          borderColor: '#E9EDF2'
                        }}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-sm" style={{ color: '#2C3E50' }}>{permission.name}</h4>
                                <Badge className="text-xs border" style={categoryStyle}>
                                  {permission.category}
                                </Badge>
                              </div>
                              <p className="text-xs" style={{ color: '#7A8691' }}>{permission.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm" style={{ color: '#7A8691' }}>
                              {roleCount} of {matrix.roles.length} roles
                            </span>
                            <div className="w-32 rounded-full h-2" style={{ backgroundColor: 'rgba(244, 246, 248, 0.5)' }}>
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${(roleCount / matrix.roles.length) * 100}%`,
                                  background: 'linear-gradient(to right, #2ECC71, #1E90FF)'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionMatrix;