import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

interface SessionTimeoutWarningProps {
  warningThreshold?: number; // Show warning when X seconds left (default: 300 = 5 minutes)
  autoLogoutThreshold?: number; // Auto logout when X seconds left (default: 60 = 1 minute)
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  warningThreshold = 300, // 5 minutes
  autoLogoutThreshold = 60 // 1 minute
}) => {
  const { sessionInfo, logout, isAuthenticated } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const checkSession = () => {
      const session = sessionInfo();
      const timeUntilExpiry = session?.timeUntilExpiry || 0;
      
      setTimeLeft(timeUntilExpiry);

      // Show warning if time is below threshold
      if (timeUntilExpiry > 0 && timeUntilExpiry <= warningThreshold && timeUntilExpiry > autoLogoutThreshold) {
        setShowWarning(true);
      } else if (timeUntilExpiry <= autoLogoutThreshold && timeUntilExpiry > 0) {
        // Auto logout
        handleAutoLogout();
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSession();

    // Check every 10 seconds
    const interval = setInterval(checkSession, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, warningThreshold, autoLogoutThreshold, sessionInfo]);

  const handleAutoLogout = async () => {
    setShowWarning(false);
    
    toast({
      title: 'Session Expired',
      description: 'You have been automatically logged out due to inactivity.',
      variant: 'destructive',
    });

    await logout();
  };

  const handleExtendSession = async () => {
    setIsExtending(true);
    
    try {
      // Attempt to refresh the token
      await authService.refreshToken();
      
      toast({
        title: 'Session Extended',
        description: 'Your session has been successfully extended.',
      });
      
      setShowWarning(false);
    } catch (error) {
      console.error('Failed to extend session:', error);
      
      toast({
        title: 'Session Extension Failed',
        description: 'Unable to extend your session. Please log in again.',
        variant: 'destructive',
      });
      
      await logout();
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogoutNow = async () => {
    setShowWarning(false);
    await logout();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressValue = ((warningThreshold - timeLeft) / warningThreshold) * 100;

  if (!showWarning || !isAuthenticated) {
    return null;
  }

  return (
    <AlertDialog open={showWarning} onOpenChange={() => {}}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Session Timeout Warning
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              Your session will expire in <strong>{formatTime(timeLeft)}</strong> due to inactivity.
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Time remaining</span>
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
              <Progress 
                value={progressValue} 
                className="h-2"
                // Change color based on urgency
                style={{
                  '--progress-background': timeLeft < 120 ? '#ef4444' : timeLeft < 180 ? '#f59e0b' : '#3b82f6'
                } as React.CSSProperties}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              Would you like to extend your session or log out now?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel 
            onClick={handleLogoutNow}
            className="w-full sm:w-auto"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out Now
          </AlertDialogCancel>
          
          <AlertDialogAction 
            onClick={handleExtendSession}
            disabled={isExtending}
            className="w-full sm:w-auto"
          >
            {isExtending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Extending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Extend Session
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionTimeoutWarning;