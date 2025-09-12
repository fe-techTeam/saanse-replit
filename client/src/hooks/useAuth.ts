import { useState, useEffect, useCallback } from "react";
import { supabase, signInWithEmail, signUpWithEmail, signOutUser } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import type { UserType } from "@/types/video";

// Auth data interface
interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

// JWT Token structure
interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

// Secure storage configuration
const AUTH_STORAGE_KEY = 'saanse_auth';
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours max session
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check activity every minute

// Safari detection utility
const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent;
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent) && !/Chromium/.test(userAgent);
};

// Simple encryption for localStorage (XOR cipher)
const encryptData = (data: string): string => {
  const key = 'SAANSE_2024_SECURE';
  return btoa(data.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join(''));
};

const decryptData = (encryptedData: string): string => {
  const key = 'SAANSE_2024_SECURE';
  return atob(encryptedData).split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
};

// Safari-compatible storage functions
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn('localStorage not available:', error);
    return false;
  }
};

const storeAuthData = (authData: AuthToken): void => {
  try {
    if (!isStorageAvailable()) {
      console.warn('localStorage not available, using sessionStorage as fallback');
      const encryptedData = encryptData(JSON.stringify(authData));
      sessionStorage.setItem(AUTH_STORAGE_KEY, encryptedData);
      return;
    }
    
    const encryptedData = encryptData(JSON.stringify(authData));
    localStorage.setItem(AUTH_STORAGE_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to store auth data:', error);
    // Fallback to sessionStorage
    try {
      const encryptedData = encryptData(JSON.stringify(authData));
      sessionStorage.setItem(AUTH_STORAGE_KEY, encryptedData);
    } catch (fallbackError) {
      console.error('Failed to store auth data in sessionStorage:', fallbackError);
    }
  }
};

const getStoredAuthData = (): AuthToken | null => {
  try {
    // Try localStorage first
    let storedData = null;
    if (isStorageAvailable()) {
      storedData = localStorage.getItem(AUTH_STORAGE_KEY);
    }
    
    // Fallback to sessionStorage if localStorage is not available or empty
    if (!storedData) {
      storedData = sessionStorage.getItem(AUTH_STORAGE_KEY);
    }
    
    if (!storedData) return null;
    
    const decryptedData = decryptData(storedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Failed to retrieve auth data:', error);
    // Clear corrupted data from both storages
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear localStorage:', e);
    }
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Could not clear sessionStorage:', e);
    }
    return null;
  }
};

const clearAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('mythosstream_auth');
  } catch (error) {
    console.warn('Could not clear localStorage:', error);
  }
  
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear sessionStorage:', error);
  }
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [activityTimer, setActivityTimer] = useState<NodeJS.Timeout | null>(null);
  const [authCheckTimer, setAuthCheckTimer] = useState<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Track user activity for security (Safari-compatible)
  const updateLastActivity = () => {
    try {
      if (isStorageAvailable()) {
        localStorage.setItem('saanse_last_activity', Date.now().toString());
      } else {
        sessionStorage.setItem('saanse_last_activity', Date.now().toString());
      }
    } catch (error) {
      console.warn('Could not update activity timestamp:', error);
    }
  };

  const checkSessionTimeout = async () => {
    try {
      // Check activity from both storage types (Safari compatibility)
      let lastActivity = null;
      if (isStorageAvailable()) {
        lastActivity = localStorage.getItem('saanse_last_activity');
      }
      if (!lastActivity) {
        lastActivity = sessionStorage.getItem('saanse_last_activity');
      }
      
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        
        if (timeSinceActivity > SESSION_TIMEOUT) {
          console.log('Session timeout due to inactivity');
          await signOut();
          return;
        }
      }
      
      const authData = getStoredAuthData();
      if (authData && Date.now() > authData.expires_at) {
        console.log('Session timeout due to token expiry');
        await signOut();
      }
    } catch (error) {
      console.warn('Error checking session timeout:', error);
    }
  };

  // Monitor user activity
  const startActivityMonitoring = () => {
    // Update activity on user interaction
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => updateLastActivity();
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Periodic session validation
    const timer = setInterval(checkSessionTimeout, ACTIVITY_CHECK_INTERVAL);
    setActivityTimer(timer);

    // Initial activity timestamp
    updateLastActivity();
  };

  const stopActivityMonitoring = () => {
    if (activityTimer) {
      clearInterval(activityTimer);
      setActivityTimer(null);
    }
    
    // Clean up activity tracking (Safari-compatible)
    try {
      localStorage.removeItem('saanse_last_activity');
    } catch (error) {
      console.warn('Could not clear localStorage activity:', error);
    }
    try {
      sessionStorage.removeItem('saanse_last_activity');
    } catch (error) {
      console.warn('Could not clear sessionStorage activity:', error);
    }
  };

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthState();
    
    // Debounced auth state check for Safari compatibility
    const debouncedCheckAuthState = () => {
      if (authCheckTimer) {
        clearTimeout(authCheckTimer);
      }
      
      const delay = isSafari() ? 500 : 100; // Longer delay for Safari
      const timer = setTimeout(() => {
        console.log('Debounced auth state check triggered');
        checkAuthState();
      }, delay);
      
      setAuthCheckTimer(timer);
    };

    // Listen for storage events to update auth state immediately (Safari-compatible)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY) {
        console.log('Auth storage changed, scheduling debounced check');
        debouncedCheckAuthState();
      }
    };

    // Safari-specific: Also listen for custom events as Safari may not fire storage events properly
    const handleCustomAuthChange = () => {
      console.log('Custom auth change event received, scheduling debounced check');
      debouncedCheckAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('saanse-auth-change', handleCustomAuthChange);
    
    // Cleanup timers and listeners on unmount
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      if (activityTimer) {
        clearInterval(activityTimer);
      }
      if (authCheckTimer) {
        clearTimeout(authCheckTimer);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('saanse-auth-change', handleCustomAuthChange);
    };
  }, []);

  // Start/stop activity monitoring based on auth state
  useEffect(() => {
    if (user) {
      startActivityMonitoring();
    } else {
      stopActivityMonitoring();
    }
    
    return () => {
      stopActivityMonitoring();
    };
  }, [user]);

  // Auto-refresh token before expiry
  const scheduleTokenRefresh = (authData: AuthToken) => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    const timeUntilRefresh = authData.expires_at - Date.now() - TOKEN_REFRESH_BUFFER;
    
    if (timeUntilRefresh > 0) {
      const timer = setTimeout(() => {
        refreshToken();
      }, timeUntilRefresh);
      
      setRefreshTimer(timer);
      console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
    }
  };

  // Refresh authentication token
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log('Refreshing authentication token...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error('Token refresh failed:', error);
        await signOut();
        return false;
      }

      const authUser: AuthUser = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        name: data.session.user.user_metadata?.full_name,
        avatar: data.session.user.user_metadata?.avatar_url
      };

      const newAuthData: AuthToken = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token || '',
        expires_at: (data.session.expires_at || 0) * 1000,
        user: authUser
      };

      storeAuthData(newAuthData);
      setUser(authUser);
      scheduleTokenRefresh(newAuthData);
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await signOut();
      return false;
    }
  };

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      
      // Check for stored auth token
      const storedAuthData = getStoredAuthData();
      if (storedAuthData) {
        console.log('Found stored auth token');
        
        // Check if token needs refresh
        const timeUntilExpiry = storedAuthData.expires_at - Date.now();
        
        if (timeUntilExpiry > TOKEN_REFRESH_BUFFER) {
          console.log('Stored token is valid, setting user:', storedAuthData.user);
          setUser(storedAuthData.user);
          scheduleTokenRefresh(storedAuthData);
          setLoading(false);
          return;
        } else if (timeUntilExpiry > 0) {
          console.log('Token needs refresh, attempting refresh...');
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            setLoading(false);
            return;
          }
        } else {
          console.log('Stored token expired, clearing it');
          clearAuthData();
        }
      }

      console.log('Checking Supabase session...');
      // Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Supabase session error:', error);
        throw error;
      }

      if (session?.user) {
        console.log('Found Supabase session, creating auth data');
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name,
          avatar: session.user.user_metadata?.avatar_url
        };

        // Store auth data
        const authData: AuthToken = {
          access_token: session.access_token,
          refresh_token: session.refresh_token || '',
          expires_at: (session.expires_at || 0) * 1000, // Convert to milliseconds
          user: authUser
        };

        storeAuthData(authData);
        setUser(authUser);
        scheduleTokenRefresh(authData);
      } else {
        console.log('No valid session found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      console.log('Auth check complete, setting loading to false');
      setLoading(false);
    }
  };


  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting signIn process...');
      const response = await signInWithEmail(email, password);
      console.log('Supabase response:', response);
      
      // Check if we got a valid response with user data
      if (response?.user) {
        console.log('User found in response:', response.user);
        
        const authUser: AuthUser = {
          id: response.user.id,
          email: response.user.email || email,
          name: response.user.user_metadata?.full_name || response.user.user_metadata?.name,
          avatar: response.user.user_metadata?.avatar_url
        };

        // Store auth data in localStorage
        const authData: AuthToken = {
          access_token: response.session?.access_token || '',
          refresh_token: response.session?.refresh_token || '',
          expires_at: (response.session?.expires_at || 0) * 1000, // Convert to milliseconds
          user: authUser
        };

        console.log('Storing auth data:', authData);
        storeAuthData(authData);
        setUser(authUser);
        scheduleTokenRefresh(authData);
        console.log('Sign in successful!');
        return true;
      }
      
      throw new Error('No user data received');
    } catch (error: any) {
      console.error("Sign in failed:", error);
      throw error; // Re-throw the original error to preserve the message
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await signUpWithEmail(email, password);
      if (error) throw error;
      return !!data.user;
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear all timers
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        setRefreshTimer(null);
      }
      
      // Stop activity monitoring
      stopActivityMonitoring();
      
      // Sign out from Supabase
      await signOutUser();
      
      // Clear all stored data
      clearAuthData();
      setUser(null);
      queryClient.clear();
      
      // Clear all session storage
      sessionStorage.clear();
      
      // Clear any remaining localStorage items related to the app
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('saanse_') || key.startsWith('mythosstream_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log('User signed out successfully - all session data cleared');
    } catch (error) {
      console.error("Sign out failed:", error);
      // Still clear local data even if server sign-out fails
      stopActivityMonitoring();
      clearAuthData();
      setUser(null);
      sessionStorage.clear();
      
      // Force clear all app-related localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('saanse_') || key.startsWith('mythosstream_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  };

  // Get auth headers for API requests
  const getAuthHeaders = useCallback(() => {
    const authData = getStoredAuthData();
    if (authData && authData.expires_at > Date.now()) {
      return {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  }, []);

  // Validate session server-side (optional enhanced security)
  const validateSession = async (): Promise<boolean> => {
    try {
      const authData = getStoredAuthData();
      if (!authData) return false;
      
      // In a real app, you'd validate the token server-side here
      // For now, just check if it's not expired
      return authData.expires_at > Date.now();
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  return {
    user: user as UserType | undefined,
    loading,
    signIn,
    signUp,
    signOut,
    getAuthHeaders,
    isAuthenticated: !!user,
    refreshToken,
    validateSession,
  };
}
