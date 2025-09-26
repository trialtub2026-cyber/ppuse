import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthState } from '@/types/auth';
import { authService } from '@/services/authService';
import { sessionManager } from '@/utils/sessionManager';
import { httpInterceptor } from '@/utils/httpInterceptor';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  sessionInfo: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  const navigate = useNavigate();

  const handleSessionExpiry = () => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });

    toast({
      title: 'Session Expired',
      description: 'Your session has expired. Please log in again.',
      variant: 'destructive',
    });

    navigate('/login');
  };

  const handleUnauthorized = () => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });

    navigate('/login');
  };

  const handleForbidden = () => {
    console.log('Access forbidden - insufficient permissions');
  };

  const handleTokenRefresh = (newToken: string) => {
    setAuthState(prev => ({
      ...prev,
      token: newToken
    }));
  };

  useEffect(() => {
    httpInterceptor.init({
      onUnauthorized: handleUnauthorized,
      onForbidden: handleForbidden,
      onTokenRefresh: handleTokenRefresh,
    });

    const initializeAuth = () => {
      const isValidSession = sessionManager.validateSession();
      
      if (isValidSession) {
        const user = authService.getCurrentUser();
        const token = authService.getToken();
        
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });

        sessionManager.startSessionMonitoring(handleSessionExpiry);
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initializeAuth();

    return () => {
      sessionManager.stopSessionMonitoring();
      httpInterceptor.destroy();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.login({ email, password });
      
      setAuthState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });

      sessionManager.startSessionMonitoring(handleSessionExpiry);

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${response.user.name}`,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      });
      
      throw error;
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      sessionManager.stopSessionMonitoring();
      
      sessionManager.clearSession();
      
      await authService.logout();
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      navigate('/login');
    }
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const hasPermission = (permission: string): boolean => {
    return authService.hasPermission(permission);
  };

  const sessionInfo = () => {
    return sessionManager.getSessionInfo();
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    hasRole,
    hasPermission,
    sessionInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};