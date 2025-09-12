import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { VideoType } from "@/types/video";

export function useSeriesVideos(seriesId: string, enabled = true) {
  return useQuery<VideoType[]>({
    queryKey: ["/api/series", seriesId, "videos"],
    queryFn: () => apiClient.get<VideoType[]>(`/api/series/${seriesId}/videos`),
    enabled,
  });
}
