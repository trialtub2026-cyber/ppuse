import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  History, 
  MessageSquare, 
  Wrench, 
  Bell, 
  FileText, 
  Package,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Info
} from 'lucide-react';
import { ConfigurationSetting, ConfigurationAudit, configurationService } from '../../services/configurationService';
import ConfigurationFormModal from './ConfigurationFormModal';
import { toast } from '../ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

const TenantAdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<ConfigurationSetting[]>([]);
  const [filteredSettings, setFilteredSettings] = useState<ConfigurationSetting[]>([]);
  const [auditLogs, setAuditLogs] = useState<ConfigurationAudit[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<ConfigurationSetting | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('complaint_rules');

  const categories = configurationService.getTenantCategories();
  
  const categoryConfig = {
    complaint_rules: {
      title: 'Complaint Management Rules',
      description: 'Auto-assignment logic, SLA thresholds, escalation settings, and complaint types',
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    job_work_config: {
      title: 'Job Work Configuration',
      description: 'Pricing rules, auto-generate job ref ID format, categories, and workflow settings',
      icon: Wrench,
      color: 'bg-green-500'
    },
    notification_preferences: {
      title: 'Notification Preferences',
      description: 'WhatsApp reminders, service contract expiry notifications, and channel preferences',
      icon: Bell,
      color: 'bg-yellow-500'
    },
    pdf_templates: {
      title: 'PDF Templates (Tenant-Scoped)',
      description: 'Custom branding on contracts, tenant-specific templates, and legal disclaimers',
      icon: FileText,
      color: 'bg-purple-500'
    },
    product_defaults: {
      title: 'Product & Service Defaults',
      description: 'Default warranty periods, service charges, and product categorization templates',
      icon: Package,
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
      const data = await configurationService.getTenantSettings();
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
      const logs = await configurationService.getTenantAuditLogs();
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
      await configurationService.deleteTenantSetting(setting.id);
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

  const renderQuickActions = () => {
    const quickActionTemplates = [
      {
        category: 'complaint_rules',
        key: 'auto_assignment',
        title: 'Setup Auto-Assignment',
        description: 'Configure automatic complaint assignment rules',
        icon: MessageSquare
      },
      {
        category: 'notification_preferences',
        key: 'whatsapp_reminders',
        title: 'WhatsApp Reminders',
        description: 'Setup service contract expiry reminders',
        icon: Bell
      },
      {
        category: 'job_work_config',
        key: 'pricing_rules',
        title: 'Job Pricing Rules',
        description: 'Configure default pricing and categories',
        icon: Wrench
      }
    ];

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quick Setup</span>
          </CardTitle>
          <CardDescription>
            Get started quickly with these common configuration templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActionTemplates.map((template) => {
              const IconComponent = template.icon;
              const existingSetting = settings.find(s => 
                s.category === template.category && s.setting_key === template.key
              );
              
              return (
                <Card key={`${template.category}-${template.key}`} className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{template.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                        <Button 
                          size="sm" 
                          variant={existingSetting ? "outline" : "default"}
                          onClick={() => {
                            if (existingSetting) {
                              handleEditSetting(existingSetting);
                            } else {
                              // Create with template
                              setSelectedSetting({
                                category: template.category,
                                setting_key: template.key,
                                setting_value: {},
                                description: template.description,
                                is_active: true,
                                last_modified_by: 'current_user'
                              } as ConfigurationSetting);
                              setIsFormModalOpen(true);
                            }
                          }}
                        >
                          {existingSetting ? 'Edit' : 'Setup'}
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
              <p className="mb-4">Configure your first setting for this category to customize your tenant's behavior.</p>
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
            <span>Tenant Settings Audit Log</span>
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
          <h1 className="text-3xl font-bold tracking-tight">Tenant Configuration</h1>
          <p className="text-muted-foreground">
            Manage tenant-specific settings, operational rules, and preferences
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
        <Building className="h-4 w-4" />
        <AlertDescription>
          <strong>Tenant Scope:</strong> These settings only affect your tenant and its users. 
          Changes are logged and require Tenant Admin privileges. Settings sync in real-time across your organization.
        </AlertDescription>
      </Alert>

      {renderQuickActions()}
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
        mode="tenant"
        onSave={handleFormSave}
      />

      {renderAuditModal()}
    </div>
  );
};

export default TenantAdminSettings;