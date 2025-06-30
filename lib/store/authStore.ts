import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/api/auth';
import { AuthenticationResult, UserSettingsQueryResponse } from '@/types/api.types';
import { clearTokens } from '@/api/client';

interface User {
  id?: string;
  name: string;
  email?: string;
  role: string;
  tradingAccountId?: string;
  settings?: UserSettingsQueryResponse;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresTwoFactor: boolean;
  twoFactorEmail?: string;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setRequiresTwoFactor: (requires: boolean, email?: string) => void;
  login: (result: AuthenticationResult) => void;
  logout: () => Promise<void>;
  loadUserSettings: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  requiresTwoFactor: false,
  twoFactorEmail: undefined,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setLoading: (isLoading) => set({ isLoading }),

      setRequiresTwoFactor: (requiresTwoFactor, twoFactorEmail) => 
        set({ requiresTwoFactor, twoFactorEmail }),

      login: (result) => {
        if (result.requiresTwoFactor) {
          set({ 
            requiresTwoFactor: true, 
            twoFactorEmail: result.name,
            isAuthenticated: false 
          });
        } else {
          const user: User = {
            name: result.name,
            role: result.role || 'user',
            tradingAccountId: result.tradingAccountId || undefined,
          };
          set({ 
            user, 
            isAuthenticated: true, 
            requiresTwoFactor: false,
            twoFactorEmail: undefined 
          });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          clearTokens();
          set(initialState);
        }
      },

      loadUserSettings: async () => {
        try {
          const settings = await authService.getUserSettings();
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: {
                ...currentUser,
                email: settings.email,
                settings,
              },
            });
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const isAuthorized = await authService.isAuthorized();
          if (isAuthorized) {
            await get().loadUserSettings();
            return true;
          } else {
            get().reset();
            return false;
          }
        } catch (error) {
          get().reset();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        clearTokens();
        set(initialState);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);