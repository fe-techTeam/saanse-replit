import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { getAdminAuthHeaders } from "./useAdminAuth";
import type { SeriesType } from "@/types/video";

export function useSeriesManagement() {
  const queryClient = useQueryClient();

  const createSeries = useMutation({
    mutationFn: async (seriesData: {
      title: string;
      description?: string;
      category?: string;
      slug?: string;
      thumbnailUrl?: string;
      bannerUrl?: string;
      status?: string;
    }) => {
      return apiClient.post<SeriesType>("/api/admin/series", seriesData, {
        headers: getAdminAuthHeaders()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
    },
  });

  const updateSeries = useMutation({
    mutationFn: async ({ id, ...seriesData }: {
      id: string;
      title: string;
      description?: string;
      category?: string;
      slug?: string;
      thumbnailUrl?: string;
      bannerUrl?: string;
      status?: string;
    }) => {
      return apiClient.patch<SeriesType>(`/api/admin/series/${id}`, seriesData, {
        headers: getAdminAuthHeaders()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
    },
  });

  const deleteSeries = useMutation({
    mutationFn: async (seriesId: string) => {
      return apiClient.delete(`/api/admin/series/${seriesId}`, {
        headers: getAdminAuthHeaders()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
    },
  });

  return {
    createSeries,
    updateSeries,
    deleteSeries,
  };
}
