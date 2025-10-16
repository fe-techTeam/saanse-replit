import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { SeriesType } from "@/types/video";

interface SeriesWithCount extends SeriesType {
  actual_episode_count: number;
}

export function useSeriesWithCounts() {
  return useQuery<SeriesWithCount[]>({
    queryKey: ["series-with-counts"],
    queryFn: async () => {
      // Fetch series data
      const series = await apiClient.get<SeriesType[]>("/api/series");
      
      // For each series, fetch the actual video count
      const seriesWithCounts = await Promise.all(
        series.map(async (s) => {
          try {
            const videos = await apiClient.get(`/api/series/${s.id}/videos`);
            return {
              ...s,
              actual_episode_count: Array.isArray(videos) ? videos.length : 0,
            };
          } catch (error) {
            console.error(`Error fetching videos for series ${s.id}:`, error);
            return {
              ...s,
              actual_episode_count: 0,
            };
          }
        })
      );
      
      return seriesWithCounts;
    },
    staleTime: 0, // Always fetch fresh data
    retry: 1,
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}
