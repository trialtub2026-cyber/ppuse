import { authService } from '@/services/authService';

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  tenant_id: string;
  exp: number;
  iat?: number;
}

class SessionManager {
  private tokenKey = 'crm_auth_token';
  private userKey = 'crm_user';
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private onSessionExpired?: () => void;

  /**
   * Decode JWT token without verification (for client-side expiry check)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || authService.getToken();
    if (!tokenToCheck) return true;

    const payload = this.decodeToken(tokenToCheck);
    if (!payload || !payload.exp) return true;

    // Check if token expires in the next 5 minutes (300 seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 300; // 5 minutes buffer
    
    return payload.exp <= (currentTime + bufferTime);
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(token?: string): number {
    const tokenToCheck = token || authService.getToken();
    if (!tokenToCheck) return 0;

    const payload = this.decodeToken(tokenToCheck);
    if (!payload || !payload.exp) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  }

  /**
   * Start automatic session monitoring
   */
  startSessionMonitoring(onExpired: () => void): void {
    this.onSessionExpired = onExpired;
    
    // Clear existing interval
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    // Check every 30 seconds
    this.sessionCheckInterval = setInterval(() => {
      this.checkSession();
    }, 30000);

    // Initial check
    this.checkSession();
  }

  /**
   * Stop session monitoring
   */
  stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    this.onSessionExpired = undefined;
  }

  /**
   * Check current session validity
   */
  private checkSession(): void {
    const token = authService.getToken();
    
    if (!token || this.isTokenExpired(token)) {
      this.handleSessionExpiry();
    }
  }

  /**
   * Handle session expiry
   */
  private handleSessionExpiry(): void {
    console.log('Session expired, logging out...');
    
    // Clear session data
    this.clearSession();
    
    // Notify callback
    if (this.onSessionExpired) {
      this.onSessionExpired();
    }
  }

  /**
   * Clear all session data
   */
  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.clear();
    
    // Clear any other auth-related data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('crm_') || key.startsWith('auth_'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Validate session on app start
   */
  validateSession(): boolean {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    
    if (!token || !user) {
      this.clearSession();
      return false;
    }
    
    if (this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }
    
    return true;
  }

  /**
   * Get session info for debugging
   */
  getSessionInfo(): {
    isValid: boolean;
    timeUntilExpiry: number;
    user: any;
    tokenPayload: JWTPayload | null;
  } {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    const payload = token ? this.decodeToken(token) : null;
    
    return {
      isValid: this.validateSession(),
      timeUntilExpiry: this.getTimeUntilExpiry(token || ''),
      user,
      tokenPayload: payload
    };
  }
}

export const sessionManager = new SessionManager();