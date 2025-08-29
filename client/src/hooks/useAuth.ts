import { useState, useEffect } from "react";
import { supabase, signInWithGoogle, signOutUser, onAuthStateChange, getCurrentUser } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserType } from "@/types/video";

// Temporary type until @supabase/supabase-js is installed
interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check for current user on app load
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setSupabaseUser(user);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting current user:", error);
        setLoading(false);
      });
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((user) => {
      setSupabaseUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch or create user in our database
  const { data: user } = useQuery({
    queryKey: ["/api/users/supabase", supabaseUser?.id],
    enabled: !!supabaseUser?.id,
    staleTime: Infinity,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { 
      email: string; 
      displayName?: string; 
      photoURL?: string; 
      supabaseUid: string; 
    }) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/supabase"] });
    },
  });

  // Create user in database when Supabase user is available but our user doesn't exist
  useEffect(() => {
    if (supabaseUser && !user && !createUserMutation.isPending) {
      createUserMutation.mutate({
        email: supabaseUser.email!,
        displayName: supabaseUser.user_metadata?.full_name || undefined,
        photoURL: supabaseUser.user_metadata?.avatar_url || undefined,
        supabaseUid: supabaseUser.id,
      });
    }
  }, [supabaseUser, user, createUserMutation]);

  const signIn = () => {
    signInWithGoogle();
  };

  const signOut = async () => {
    try {
      await signOutUser();
      queryClient.clear();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    user: user as UserType | undefined,
    supabaseUser,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!supabaseUser,
  };
}
