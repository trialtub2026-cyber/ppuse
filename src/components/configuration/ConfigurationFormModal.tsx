import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { AlertTriangle, Save, X, Info } from 'lucide-react';
import { ConfigurationSetting, ValidationSchema, configurationService } from '../../services/configurationService';
import { toast } from '../ui/use-toast';

interface ConfigurationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  setting?: ConfigurationSetting | null;
  mode: 'super_admin' | 'tenant';
  onSave: () => void;
}

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'json' | 'array';
  value: any;
  required?: boolean;
  options?: string[];
  description?: string;
  validation?: ValidationSchema;
}

const ConfigurationFormModal: React.FC<ConfigurationFormModalProps> = ({
  isOpen,
  onClose,
  setting,
  mode,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<ConfigurationSetting>>({
    category: '',
    setting_key: '',
    setting_value: {},
    description: '',
    validation_schema: null,
    is_active: true
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const categories = mode === 'super_admin' 
    ? configurationService.getSuperAdminCategories()
    : configurationService.getTenantCategories();

  const categoryLabels: Record<string, string> = {
    // Super Admin Categories
    tenant_defaults: 'Tenant Onboarding Defaults',
    global_email: 'Global Email/Notification Config',
    system_policies: 'System Policy Controls',
    pdf_templates: 'PDF & Document Templates',
    license_usage: 'License & Usage Policy',
    // Tenant Categories
    complaint_rules: 'Complaint Management Rules',
    job_work_config: 'Job Work Configuration',
    notification_preferences: 'Notification Preferences',
    product_defaults: 'Product & Service Defaults'
  };

  useEffect(() => {
    if (setting) {
      setFormData({
        ...setting,
        setting_value: setting.setting_value || {}
      });
      generateFormFields(setting.setting_value, setting.validation_schema);
    } else {
      setFormData({
        category: '',
        setting_key: '',
        setting_value: {},
        description: '',
        validation_schema: null,
        is_active: true
      });
      setFormFields([]);
    }
    setValidationErrors({});
  }, [setting, isOpen]);

  const generateFormFields = (value: any, schema: ValidationSchema | null) => {
    if (!value || typeof value !== 'object') return;

    const fields: FormField[] = [];
    
    Object.entries(value).forEach(([key, val]) => {
      const fieldSchema = schema?.properties?.[key];
      
      fields.push({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: inferFieldType(val, fieldSchema),
        value: val,
        required: fieldSchema?.required || false,
        options: fieldSchema?.enum,
        description: fieldSchema?.description,
        validation: fieldSchema
      });
    });

    setFormFields(fields);
  };

  const inferFieldType = (value: any, schema?: any): FormField['type'] => {
    if (schema?.type) {
      switch (schema.type) {
        case 'boolean': return 'boolean';
        case 'number': return 'number';
        case 'array': return 'array';
        case 'object': return 'json';
        default: 
          if (schema.enum) return 'select';
          return typeof value === 'string' && value.length > 100 ? 'textarea' : 'text';
      }
    }

    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'json';
    if (typeof value === 'string' && value.length > 100) return 'textarea';
    
    return 'text';
  };

  const handleFieldChange = (fieldKey: string, newValue: any) => {
    const updatedFields = formFields.map(field => 
      field.key === fieldKey ? { ...field, value: newValue } : field
    );
    setFormFields(updatedFields);

    // Update form data
    const newSettingValue = { ...formData.setting_value };
    newSettingValue[fieldKey] = newValue;
    
    setFormData(prev => ({
      ...prev,
      setting_value: newSettingValue
    }));

    // Clear validation errors for this field
    if (validationErrors[fieldKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const addNewField = () => {
    const newField: FormField = {
      key: `new_field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      value: '',
      required: false
    };
    
    setFormFields(prev => [...prev, newField]);
  };

  const removeField = (fieldKey: string) => {
    setFormFields(prev => prev.filter(field => field.key !== fieldKey));
    
    const newSettingValue = { ...formData.setting_value };
    delete newSettingValue[fieldKey];
    
    setFormData(prev => ({
      ...prev,
      setting_value: newSettingValue
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    // Validate basic fields
    if (!formData.category) {
      errors.category = ['Category is required'];
    }
    if (!formData.setting_key) {
      errors.setting_key = ['Setting key is required'];
    }

    // Validate form fields
    formFields.forEach(field => {
      if (field.validation) {
        const validation = configurationService.validateSetting(field.value, field.validation);
        if (!validation.valid) {
          errors[field.key] = validation.errors;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const settingData = {
        ...formData,
        setting_value: formFields.reduce((acc, field) => {
          acc[field.key] = field.value;
          return acc;
        }, {} as any)
      };

      if (setting?.id) {
        // Update existing setting
        if (mode === 'super_admin') {
          await configurationService.updateSuperAdminSetting(setting.id, settingData);
        } else {
          await configurationService.updateTenantSetting(setting.id, settingData);
        }
        
        toast({
          title: "Setting Updated",
          description: "Configuration setting has been updated successfully."
        });
      } else {
        // Create new setting
        if (mode === 'super_admin') {
          await configurationService.createSuperAdminSetting(settingData);
        } else {
          await configurationService.createTenantSetting(settingData);
        }
        
        toast({
          title: "Setting Created",
          description: "Configuration setting has been created successfully."
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save configuration setting.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = validationErrors[field.key];

    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
            />
            <Label>{field.label}</Label>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.key}
              type="number"
              value={field.value}
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
              className={hasError ? 'border-red-500' : ''}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={field.value} onValueChange={(value) => handleFieldChange(field.key, value)}>
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={field.value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              rows={4}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'array':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={Array.isArray(field.value) ? field.value.join('\n') : ''}
              onChange={(e) => handleFieldChange(field.key, e.target.value.split('\n').filter(Boolean))}
              className={hasError ? 'border-red-500' : ''}
              placeholder="Enter one item per line"
              rows={4}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      case 'json':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleFieldChange(field.key, parsed);
                } catch {
                  // Keep the raw value for editing
                  handleFieldChange(field.key, e.target.value);
                }
              }}
              className={hasError ? 'border-red-500' : ''}
              placeholder="Enter valid JSON"
              rows={6}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.key}
              value={field.value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {setting ? 'Edit' : 'Create'} {mode === 'super_admin' ? 'Super Admin' : 'Tenant'} Configuration
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Configure the basic properties of this setting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {categoryLabels[category] || category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.category && (
                      <p className="text-sm text-red-500">{validationErrors.category[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="setting_key">
                      Setting Key <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="setting_key"
                      value={formData.setting_key}
                      onChange={(e) => setFormData(prev => ({ ...prev, setting_key: e.target.value }))}
                      placeholder="e.g., auto_assignment_rules"
                      className={validationErrors.setting_key ? 'border-red-500' : ''}
                    />
                    {validationErrors.setting_key && (
                      <p className="text-sm text-red-500">{validationErrors.setting_key[0]}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this setting controls..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Setting Values
                  <Button onClick={addNewField} variant="outline" size="sm">
                    Add Field
                  </Button>
                </CardTitle>
                <CardDescription>
                  Configure the actual setting values and their properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2" />
                    <p>No fields configured yet. Click "Add Field" to start.</p>
                  </div>
                ) : (
                  formFields.map((field, index) => (
                    <div key={field.key} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{field.type}</Badge>
                        <Button
                          onClick={() => removeField(field.key)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {renderField(field)}
                      
                      {validationErrors[field.key] && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            {validationErrors[field.key].join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Validation Schema</CardTitle>
                <CardDescription>
                  Define validation rules for this setting (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.validation_schema ? JSON.stringify(formData.validation_schema, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const parsed = e.target.value ? JSON.parse(e.target.value) : null;
                      setFormData(prev => ({ ...prev, validation_schema: parsed }));
                    } catch {
                      // Keep the raw value for editing
                    }
                  }}
                  placeholder="Enter JSON schema for validation..."
                  rows={10}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <DialogFooter>
          <Button onClick={onClose} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {setting ? 'Update' : 'Create'} Setting
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigurationFormModal;