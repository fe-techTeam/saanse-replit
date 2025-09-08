import { useState, useEffect } from "react";
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

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      
      // Check for stored auth token
      const storedAuth = localStorage.getItem('mythosstream_auth');
      if (storedAuth) {
        console.log('Found stored auth token');
        const authData: AuthToken = JSON.parse(storedAuth);
        
        // Check if token is still valid
        if (authData.expires_at > Date.now()) {
          console.log('Stored token is valid, setting user');
          setUser(authData.user);
          setLoading(false);
          return;
        } else {
          console.log('Stored token expired, clearing it');
          localStorage.removeItem('mythosstream_auth');
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

        localStorage.setItem('mythosstream_auth', JSON.stringify(authData));
        setUser(authUser);
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
        localStorage.setItem('mythosstream_auth', JSON.stringify(authData));
        setUser(authUser);
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
      await signOutUser();
      localStorage.removeItem('mythosstream_auth');
      setUser(null);
      queryClient.clear();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  // Get auth headers for API requests
  const getAuthHeaders = () => {
    const storedAuth = localStorage.getItem('mythosstream_auth');
    if (storedAuth) {
      const authData: AuthToken = JSON.parse(storedAuth);
      if (authData.expires_at > Date.now()) {
        return {
          'Authorization': `Bearer ${authData.access_token}`
        };
      }
    }
    return {};
  };

  return {
    user: user as UserType | undefined,
    loading,
    signIn,
    signUp,
    signOut,
    getAuthHeaders,
    isAuthenticated: !!user,
  };
}
