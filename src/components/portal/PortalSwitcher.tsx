import React from 'react';
import { usePortal } from '../../contexts/PortalContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Building2, Settings, Users, BarChart3 } from 'lucide-react';

const PortalSwitcher: React.FC = () => {
  const { currentPortal, setPortal, isSuperAdmin, isTenant } = usePortal();
  const { user, hasRole } = useAuth();

  // Only render for super admin users
  if (!user || !hasRole('super_admin')) {
    return null;
  }

  const handlePortalSwitch = () => {
    if (isSuperAdmin) {
      setPortal('tenant');
      window.location.href = '/tenant/dashboard';
    } else {
      setPortal('super-admin');
      window.location.href = '/super-admin/dashboard';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
        {isSuperAdmin ? (
          <>
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Super Admin</span>
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">Tenant Portal</span>
          </>
        )}
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handlePortalSwitch}
        className="text-xs"
      >
        {isSuperAdmin ? (
          <>
            <Building2 className="h-3 w-3 mr-1" />
            Switch to Tenant
          </>
        ) : (
          <>
            <Settings className="h-3 w-3 mr-1" />
            Switch to Admin
          </>
        )}
      </Button>
    </div>
  );
};

export default PortalSwitcher;