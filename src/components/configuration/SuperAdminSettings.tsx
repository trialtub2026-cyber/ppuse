import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  History, 
  Shield, 
  Globe, 
  FileText, 
  Users, 
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { ConfigurationSetting, ConfigurationAudit, configurationService } from '../../services/configurationService';
import ConfigurationFormModal from './ConfigurationFormModal';
import { toast } from '../ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

const SuperAdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<ConfigurationSetting[]>([]);
  const [filteredSettings, setFilteredSettings] = useState<ConfigurationSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<ConfigurationAudit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<ConfigurationSetting | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tenant_defaults');

  const categories = configurationService.getSuperAdminCategories();
  
  const categoryConfig = {
    tenant_defaults: {
      title: 'Tenant Onboarding Defaults',
      description: 'Default roles, permissions, modules, and notification rules for new tenants',
      icon: Users,
      color: 'bg-blue-500'
    },
    global_email: {
      title: 'Global Email/Notification Configuration',
      description: 'SMTP settings, push notification config, WhatsApp templates, and branding defaults',
      icon: Globe,
      color: 'bg-green-500'
    },
    system_policies: {
      title: 'System Policy Controls',
      description: 'Password policies, session timeouts, MFA settings, and security configurations',
      icon: Shield,
      color: 'bg-red-500'
    },
    pdf_templates: {
      title: 'PDF & Document Templates',
      description: 'Global templates for Service Agreements, Invoices, Job Sheets with tokenized variables',
      icon: FileText,
      color: 'bg-purple-500'
    },
    license_usage: {
      title: 'License & Usage Policy',
      description: 'Tenant license types, user limits, module restrictions, and expiry policies',
      icon: Key,
      color: 'bg-orange-500'
    }
  };

  useEffect(() => {
    loadSettings();
    loadAuditLogs();
  }, []);

  useEffect(() => {
    filterSettings();
  }, [settings, selectedCategory, searchTerm]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await configurationService.getSuperAdminSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load configuration settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const logs = await configurationService.getSuperAdminAuditLogs();
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const filterSettings = () => {
    let filtered = settings;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(setting => setting.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(setting =>
        setting.setting_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        setting.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSettings(filtered);
  };

  const handleCreateSetting = () => {
    setSelectedSetting(null);
    setIsFormModalOpen(true);
  };

  const handleEditSetting = (setting: ConfigurationSetting) => {
    setSelectedSetting(setting);
    setIsFormModalOpen(true);
  };

  const handleDeleteSetting = async (setting: ConfigurationSetting) => {
    if (!setting.id) return;

    if (!confirm(`Are you sure you want to delete the setting "${setting.setting_key}"?`)) {
      return;
    }

    try {
      await configurationService.deleteSuperAdminSetting(setting.id);
      toast({
        title: "Setting Deleted",
        description: "Configuration setting has been deleted successfully."
      });
      loadSettings();
      loadAuditLogs();
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast({
        title: "Error",
        description: "Failed to delete configuration setting.",
        variant: "destructive"
      });
    }
  };

  const handleFormSave = () => {
    loadSettings();
    loadAuditLogs();
  };

  const renderCategoryOverview = () => {
    const categoryStats = categories.map(category => {
      const categorySettings = settings.filter(s => s.category === category);
      const activeSettings = categorySettings.filter(s => s.is_active);
      
      return {
        category,
        total: categorySettings.length,
        active: activeSettings.length,
        config: categoryConfig[category as keyof typeof categoryConfig]
      };
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {categoryStats.map(({ category, total, active, config }) => {
          const IconComponent = config.icon;
          
          return (
            <Card 
              key={category} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === category ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveTab(category)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
                    <CardDescription className="text-xs">{config.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{total}</div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{active}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                  </div>
                  <Badge variant={total > 0 ? "default" : "secondary"}>
                    {total > 0 ? 'Configured' : 'Empty'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderSettingsTable = () => {
    const categorySettings = settings.filter(s => s.category === activeTab);

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>{categoryConfig[activeTab as keyof typeof categoryConfig]?.title}</span>
              </CardTitle>
              <CardDescription>
                {categoryConfig[activeTab as keyof typeof categoryConfig]?.description}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateSetting} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Setting
              </Button>
              <Button onClick={() => setIsAuditModalOpen(true)} variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Audit Log
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : categorySettings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Settings Configured</h3>
              <p className="mb-4">Get started by creating your first configuration setting for this category.</p>
              <Button onClick={handleCreateSetting}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Setting
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setting Key</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorySettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>
                      <div className="font-medium">{setting.setting_key}</div>
                      <div className="text-sm text-muted-foreground">
                        {Object.keys(setting.setting_value || {}).length} properties
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {setting.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={setting.is_active ? "default" : "secondary"}>
                        {setting.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {setting.updated_at ? formatDistanceToNow(new Date(setting.updated_at), { addSuffix: true }) : 'Never'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {setting.last_modified_by}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditSetting(setting)}
                          variant="ghost"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteSetting(setting)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderAuditModal = () => (
    <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Super Admin Settings Audit Log</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Setting</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant={
                        log.action === 'CREATE' ? 'default' :
                        log.action === 'UPDATE' ? 'secondary' :
                        log.action === 'DELETE' ? 'destructive' : 'outline'
                      }>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell>{log.setting_id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {log.change_reason || 'No reason provided'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {log.created_at ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true }) : 'Unknown'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Configuration</h1>
          <p className="text-muted-foreground">
            Manage global platform settings, tenant defaults, and system-wide policies
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAuditModalOpen(true)} variant="outline">
            <History className="h-4 w-4 mr-2" />
            View Audit Log
          </Button>
          <Button onClick={handleCreateSetting}>
            <Plus className="h-4 w-4 mr-2" />
            New Setting
          </Button>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> These settings affect all tenants and the entire platform. 
          Changes are logged and require Super Admin privileges. Always test in a staging environment first.
        </AlertDescription>
      </Alert>

      {renderCategoryOverview()}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs">
              {categoryConfig[category as keyof typeof categoryConfig]?.title.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            {renderSettingsTable()}
          </TabsContent>
        ))}
      </Tabs>

      <ConfigurationFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        setting={selectedSetting}
        mode="super_admin"
        onSave={handleFormSave}
      />

      {renderAuditModal()}
    </div>
  );
};

export default SuperAdminSettings;