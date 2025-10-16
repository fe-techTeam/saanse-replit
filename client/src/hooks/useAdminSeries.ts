import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getAdminAuthHeaders } from "./useAdminAuth";
import type { SeriesType } from "@/types/video";

export function useAdminSeries() {
  return useQuery<SeriesType[]>({
    queryKey: ["/api/admin/series"],
    queryFn: async () => {
      console.log("Fetching admin series from API...");
      const data = await apiClient.get<SeriesType[]>("/api/admin/series", {
        headers: getAdminAuthHeaders()
      });
      console.log("Admin series API response:", data);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10_000, // 10 seconds
    retry: 1,
  });
}

export function useAdminSeriesById(seriesId: string, enabled = true) {
  return useQuery<SeriesType>({
    queryKey: ["/api/admin/series", seriesId],
    queryFn: () => apiClient.get<SeriesType>(`/api/admin/series/${seriesId}`, {
      headers: getAdminAuthHeaders()
    }),
    enabled: enabled && !!seriesId,
    staleTime: 10_000, // 10 seconds
    retry: 1,
  });
}
