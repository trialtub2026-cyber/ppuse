import React, { createContext, useContext, useEffect, useState } from 'react';

export type PortalType = 'tenant' | 'super-admin';

interface PortalContextType {
  currentPortal: PortalType;
  setPortal: (portal: PortalType) => void;
  isSuperAdmin: boolean;
  isTenant: boolean;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};

interface PortalProviderProps {
  children: React.ReactNode;
}

export const PortalProvider: React.FC<PortalProviderProps> = ({ children }) => {
  const [currentPortal, setCurrentPortal] = useState<PortalType>('tenant');

  useEffect(() => {
    // Determine portal based on current URL
    const path = window.location.pathname;
    if (path.startsWith('/super-admin')) {
      setCurrentPortal('super-admin');
    } else {
      setCurrentPortal('tenant');
    }
  }, []);

  const setPortal = (portal: PortalType) => {
    setCurrentPortal(portal);
  };

  const value: PortalContextType = {
    currentPortal,
    setPortal,
    isSuperAdmin: currentPortal === 'super-admin',
    isTenant: currentPortal === 'tenant',
  };

  return (
    <PortalContext.Provider value={value}>
      {children}
    </PortalContext.Provider>
  );
};

export default PortalContext;