import { authApi, setTokens, clearTokens } from './client';
import {
  LoginCommand,
  LoginForRedirectCommand,
  RegisterUserCommand,
  AuthenticationResult,
  UseRecoveryCodeCommand,
  ChangePasswordCommand,
  SetupTwoFactorResponse,
  VerifyTwoFactorCommand,
  VerifyTwoFactorResponse,
  DisableTwoFactorCommand,
  UserSettingsQueryResponse,
} from '@/api/types';

export const authService = {
  /**
   * Login user with email/username and password
   */
  async login(data: LoginCommand): Promise<AuthenticationResult> {
    const response = await authApi.post<AuthenticationResult>('/api/auth/login', data);
    
    if (response.data.accessToken && response.data.refreshToken && !response.data.requiresTwoFactor) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response.data;
  },

  /**
   * Login for redirect - used for OAuth flows
   */
  async loginForRedirect(data: LoginForRedirectCommand): Promise<AuthenticationResult> {
    const response = await authApi.post<AuthenticationResult>('/api/auth/login-for-direct', data);
    
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response.data;
  },

  /**
   * Login with recovery code
   */
  async loginWithRecoveryCode(data: UseRecoveryCodeCommand): Promise<AuthenticationResult> {
    const response = await authApi.post<AuthenticationResult>('/api/auth/login-recovery', data);
    
    if (response.data.accessToken && response.data.refreshToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterUserCommand): Promise<void> {
    await authApi.post('/api/users/register', data);
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await authApi.post('/api/auth/logout');
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  },

  /**
   * Invalidate all sessions for the current user
   */
  async invalidateAllSessions(): Promise<void> {
    await authApi.post('/api/auth/invalidate-all-sessions');
    clearTokens();
    window.location.href = '/login';
  },

  /**
   * Check if user is authorized
   */
  async isAuthorized(): Promise<boolean> {
    try {
      await authApi.get('/api/auth/is-authorized');
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Confirm authentication with auth key
   */
  async confirmAuth(authKey: string): Promise<void> {
    await authApi.get('/api/auth/confirm-auth', {
      params: { authKey },
    });
  },

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<UserSettingsQueryResponse> {
    const response = await authApi.get<UserSettingsQueryResponse>('/api/users/settings');
    return response.data;
  },

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordCommand): Promise<void> {
    await authApi.post('/api/users', data);
  },

  /**
   * Setup two-factor authentication
   */
  async setupTwoFactor(): Promise<SetupTwoFactorResponse> {
    const response = await authApi.post<SetupTwoFactorResponse>('/api/auth/2fa/setup');
    return response.data;
  },

  /**
   * Verify two-factor authentication code
   */
  async verifyTwoFactor(data: VerifyTwoFactorCommand): Promise<VerifyTwoFactorResponse> {
    const response = await authApi.post<VerifyTwoFactorResponse>('/api/auth/2fa/verify', data);
    return response.data;
  },

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(data: DisableTwoFactorCommand): Promise<void> {
    await authApi.post('/api/auth/2fa/disable', data);
  },

  /**
   * Get active users (admin only)
   */
  async getActiveUsers(): Promise<any[]> {
    const response = await authApi.get('/api/users/get-active-users');
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<any> {
    const response = await authApi.get('/api/users/get-user-by-id', {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Get user phone number (admin only)
   */
  async getUserPhone(userId: string): Promise<string> {
    const response = await authApi.get('/api/users/get-user-phone', {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Get user email (admin only)
   */
  async getUserEmail(userId: string): Promise<string> {
    const response = await authApi.get('/api/users/get-user-email', {
      params: { userId },
    });
    return response.data;
  },
};

// Password validation helper
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation helper
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation helper
export const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 20) {
    errors.push('Username must be no more than 20 characters long');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};