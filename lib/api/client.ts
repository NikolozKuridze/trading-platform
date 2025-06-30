import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import { AuthenticationResult, RefreshTokenCommand } from '@/api/types';

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5168';
const TRADING_API_URL = process.env.NEXT_PUBLIC_TRADING_API_URL || 'http://localhost:5193';

// Token management
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  
  return {
    accessToken: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  };
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Create axios instances
export const authApi: AxiosInstance = axios.create({
  baseURL: AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tradingApi: AxiosInstance = axios.create({
  baseURL: TRADING_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
const addAuthInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { accessToken } = getTokens();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );
};

// Response interceptor to handle token refresh
const addResponseInterceptor = (instance: AxiosInstance) => {
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
  }> = [];

  const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    
    failedQueue = [];
  };

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // Handle 401 errors
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return instance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const { accessToken, refreshToken } = getTokens();

        if (!refreshToken || !accessToken) {
          clearTokens();
          window.location.href = '/auth/login';
          return Promise.reject(error);
        }

        try {
          const refreshData: RefreshTokenCommand = {
            accessToken,
            refreshToken,
          };

          const response = await authApi.post<AuthenticationResult>(
            '/api/auth/refresh-token',
            refreshData
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

          if (newAccessToken && newRefreshToken) {
            setTokens(newAccessToken, newRefreshToken);
            processQueue(null, newAccessToken);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            
            return instance(originalRequest);
          }
        } catch (refreshError) {
          processQueue(refreshError as AxiosError, null);
          clearTokens();
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other errors
      if (error.response) {
        const { status, data } = error.response;
        const problemDetails = data as any;
        
        switch (status) {
          case 400:
            toast.error(problemDetails.detail || 'Invalid request');
            break;
          case 403:
            toast.error('You do not have permission to perform this action');
            break;
          case 404:
            toast.error('Resource not found');
            break;
          case 409:
            toast.error(problemDetails.detail || 'Conflict occurred');
            break;
          case 500:
            toast.error('Server error. Please try again later');
            break;
          default:
            toast.error(problemDetails.detail || 'An error occurred');
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection');
      } else {
        toast.error('An unexpected error occurred');
      }

      return Promise.reject(error);
    }
  );
};

// Apply interceptors
addAuthInterceptor(authApi);
addAuthInterceptor(tradingApi);
addResponseInterceptor(authApi);
addResponseInterceptor(tradingApi);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    if (error.response?.data?.title) {
      return error.response.data.title;
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An unexpected error occurred';
};

// Export a function to manually refresh token
export const refreshAuthToken = async (): Promise<boolean> => {
  const { accessToken, refreshToken } = getTokens();
  
  if (!accessToken || !refreshToken) {
    return false;
  }

  try {
    const response = await authApi.post<AuthenticationResult>(
      '/api/auth/refresh-token',
      { accessToken, refreshToken }
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

    if (newAccessToken && newRefreshToken) {
      setTokens(newAccessToken, newRefreshToken);
      return true;
    }
    
    return false;
  } catch (error) {
    clearTokens();
    return false;
  }
};