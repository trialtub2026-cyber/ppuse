import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, AlertTriangle, Database, Settings } from 'lucide-react';
import { configurationService } from '../../services/configurationService';

const ConfigurationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    superAdminTest: boolean | null;
    tenantTest: boolean | null;
    error: string | null;
  }>({
    superAdminTest: null,
    tenantTest: null,
    error: null
  });

  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults({ superAdminTest: null, tenantTest: null, error: null });

    try {
      // Test Super Admin Settings
      try {
        await configurationService.getSuperAdminSettings();
        setTestResults(prev => ({ ...prev, superAdminTest: true }));
      } catch (error) {
        console.error('Super Admin test failed:', error);
        setTestResults(prev => ({ ...prev, superAdminTest: false }));
      }

      // Test Tenant Settings
      try {
        await configurationService.getTenantSettings();
        setTestResults(prev => ({ ...prev, tenantTest: true }));
      } catch (error) {
        console.error('Tenant test failed:', error);
        setTestResults(prev => ({ ...prev, tenantTest: false }));
      }

    } catch (error) {
      console.error('Configuration test error:', error);
      setTestResults(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleSettings = async () => {
    setIsLoading(true);
    try {
      // Create sample super admin setting
      const superAdminSample = {
        category: 'tenant_defaults',
        setting_key: 'default_roles',
        setting_value: {
          roles: ['Admin', 'Manager', 'Engineer', 'Customer'],
          permissions: {
            'Admin': ['all'],
            'Manager': ['read', 'write', 'manage_users'],
            'Engineer': ['read', 'write'],
            'Customer': ['read']
          }
        },
        description: 'Default roles and permissions for new tenants',
        validation_schema: {
          type: 'object',
          required: true,
          properties: {
            roles: { type: 'array', items: { type: 'string' } },
            permissions: { type: 'object' }
          }
        }
      };

      await configurationService.createSuperAdminSetting(superAdminSample);

      // Create sample tenant setting
      const tenantSample = {
        category: 'complaint_rules',
        setting_key: 'auto_assignment',
        setting_value: {
          enabled: true,
          method: 'round_robin',
          criteria: {
            location_based: false,
            skill_based: true,
            workload_based: true
          }
        },
        description: 'Automatic complaint assignment rules',
        validation_schema: {
          type: 'object',
          required: true,
          properties: {
            enabled: { type: 'boolean' },
            method: { type: 'string', enum: ['manual', 'round_robin', 'geo_based'] },
            criteria: { type: 'object' }
          }
        }
      };

      await configurationService.createTenantSetting(tenantSample);

      // Re-run tests
      await runTests();
    } catch (error) {
      console.error('Error creating sample settings:', error);
      setTestResults(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to create sample settings'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const renderTestResult = (result: boolean | null, label: string) => {
    if (result === null) {
      return (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
          <span>Testing {label}...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        {result ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-600" />
        )}
        <span className={result ? 'text-green-600' : 'text-red-600'}>
          {label}: {result ? 'PASS' : 'FAIL'}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Configuration System Test</span>
          </CardTitle>
          <CardDescription>
            Test the configuration database tables and service connectivity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {renderTestResult(testResults.superAdminTest, 'Super Admin Settings Table')}
            {renderTestResult(testResults.tenantTest, 'Tenant Settings Table')}
          </div>

          {testResults.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {testResults.error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button onClick={runTests} disabled={isLoading}>
              <Settings className="h-4 w-4 mr-2" />
              Re-run Tests
            </Button>
            
            {(testResults.superAdminTest === false || testResults.tenantTest === false) && (
              <Button onClick={createSampleSettings} disabled={isLoading} variant="outline">
                Create Sample Settings
              </Button>
            )}
          </div>

          {testResults.superAdminTest && testResults.tenantTest && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Success!</strong> Configuration system is ready. You can now access the configuration modules.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationTest;