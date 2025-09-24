import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuth } from "./useAuth";
import type { WatchLaterWithVideoType, WatchLaterType } from "@/types/video";
import { isSafari, getSafariQueryConfig, safariDebouncer } from "@/lib/safari-utils";

const API_BASE = "/api";

export function useWatchLater() {
  const { user, getAuthHeaders } = useAuth();
  const queryClient = useQueryClient();

  // Get watch later list
  const {
    data: watchLater = [],
    isLoading,
    error,
  } = useQuery<WatchLaterWithVideoType[]>({
    queryKey: ["/api/users", user?.id, "watch-later"],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const fetchWatchLater = async () => {
        const response = await fetch(`${API_BASE}/users/${user.id}/watch-later`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch watch later list");
        }

        return response.json();
      };

      // Safari-specific debouncing
      if (isSafari()) {
        const key = `/api/users/${user.id}/watch-later`;
        return safariDebouncer.debounce(key, fetchWatchLater);
      }
      
      return fetchWatchLater();
    },
    enabled: !!user?.id,
    ...getSafariQueryConfig(),
    // Fallback for non-Safari browsers
    staleTime: isSafari() ? undefined : 5 * 60 * 1000,
    gcTime: isSafari() ? undefined : 10 * 60 * 1000,
    retry: isSafari() ? undefined : 1,
  });

  // Add to watch later
  const addToWatchLaterMutation = useMutation({
    mutationFn: async ({ videoId, priority = 0, notes }: { videoId: string; priority?: number; notes?: string }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await fetch(`${API_BASE}/watch-later`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          videoId,
          priority,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to watch later");
      }

      const result = await response.json();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "watch-later"] });
    },
  });

  // Remove from watch later
  const removeFromWatchLaterMutation = useMutation({
    mutationFn: async (videoId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      console.log("Removing from watch later - videoId:", videoId, "userId:", user.id);
      const response = await fetch(`${API_BASE}/watch-later/${user.id}/${videoId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      console.log("Remove response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Remove error response:", errorData);
        throw new Error(errorData.error || "Failed to remove from watch later");
      }
    },
    onSuccess: () => {
      console.log("Successfully removed from watch later, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "watch-later"] });
    },
  });

  // Mark as watched
  const markAsWatchedMutation = useMutation({
    mutationFn: async (videoId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      console.log("Marking as watched - videoId:", videoId, "userId:", user.id);
      const response = await fetch(`${API_BASE}/watch-later/${user.id}/${videoId}/mark-watched`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      console.log("Mark watched response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Mark watched error response:", errorData);
        throw new Error(errorData.error || "Failed to mark as watched");
      }

      return response.json();
    },
    onSuccess: () => {
      console.log("Successfully marked as watched, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "watch-later"] });
    },
  });

  // Update progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ videoId, progress }: { videoId: string; progress: number }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await fetch(`${API_BASE}/watch-later/${user.id}/${videoId}/progress`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update progress");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "watch-later"] });
    },
  });

  // Check if video is in watch later - use cached data when possible
  const checkWatchLaterStatus = useCallback(async (videoId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    // First check if we have cached data
    const cachedData = queryClient.getQueryData<WatchLaterWithVideoType[]>(["/api/users", user.id, "watch-later"]);
    if (cachedData) {
      return cachedData.some(item => item.videoId === videoId);
    }
    
    try {
      const response = await fetch(`${API_BASE}/watch-later/${user.id}/${videoId}/status`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) return false;
      
      const data = await response.json();
      return data.isInWatchLater;
    } catch {
      return false;
    }
  }, [user?.id, queryClient, getAuthHeaders]);

  return {
    watchLater,
    isLoading,
    error,
    addToWatchLater: addToWatchLaterMutation.mutateAsync,
    removeFromWatchLater: removeFromWatchLaterMutation.mutateAsync,
    markAsWatched: markAsWatchedMutation.mutateAsync,
    updateProgress: updateProgressMutation.mutateAsync,
    checkWatchLaterStatus,
    isAdding: addToWatchLaterMutation.isPending,
    isRemoving: removeFromWatchLaterMutation.isPending,
    isMarkingWatched: markAsWatchedMutation.isPending,
    isUpdatingProgress: updateProgressMutation.isPending,
  };
}
