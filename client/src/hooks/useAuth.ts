import { useState, useEffect } from "react";
import { auth, signInWithGoogle, signOutUser, onAuthStateChange, handleRedirectResult } from "@/lib/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserType } from "@/types/video";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check for redirect result on app load
  useEffect(() => {
    handleRedirectResult()
      .then((result) => {
        if (result?.user) {
          console.log("User signed in via redirect:", result.user);
        }
      })
      .catch((error) => {
        console.error("Error handling redirect:", error);
      });
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setFirebaseUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Fetch or create user in our database
  const { data: user } = useQuery({
    queryKey: ["/api/users/firebase", firebaseUser?.uid],
    enabled: !!firebaseUser?.uid,
    staleTime: Infinity,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: { 
      email: string; 
      displayName?: string; 
      photoURL?: string; 
      firebaseUid: string; 
    }) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/firebase"] });
    },
  });

  // Create user in database when Firebase user is available but our user doesn't exist
  useEffect(() => {
    if (firebaseUser && !user && !createUserMutation.isPending) {
      createUserMutation.mutate({
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        firebaseUid: firebaseUser.uid,
      });
    }
  }, [firebaseUser, user, createUserMutation]);

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
    firebaseUser,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!firebaseUser,
  };
}
