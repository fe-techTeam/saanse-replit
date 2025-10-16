import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SeriesType } from "@/types/video";

export function useSeries() {
  return useQuery<SeriesType[]>({
    queryKey: ["series"],
    queryFn: async () => {
      console.log("Fetching series from API...");
      const data = await apiClient.get<SeriesType[]>("/api/series");
      console.log("Series API response:", data);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useSeriesById(seriesId: string, enabled = true) {
  return useQuery<SeriesType>({
    queryKey: ["/api/series", seriesId],
    queryFn: () => apiClient.get<SeriesType>(`/api/series/${seriesId}`),
    enabled: enabled && !!seriesId,
    staleTime: 60_000,
    retry: 1,
  });
}
