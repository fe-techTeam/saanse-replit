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
      console.log('Creating series with data:', seriesData);
      const result = await apiClient.post<SeriesType>("/api/admin/series", seriesData, {
        headers: getAdminAuthHeaders()
      });
      console.log('Series created:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Invalidating series queries after create');
      // Invalidate both admin and public series queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
    },
    onError: (error) => {
      console.error('Error creating series:', error);
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
      console.log('=== CLIENT UPDATE SERIES ===');
      console.log('Series ID:', id);
      console.log('Series data being sent:', JSON.stringify(seriesData, null, 2));
      console.log('Title in payload:', seriesData.title);
      console.log('Title type:', typeof seriesData.title);
      console.log('Title length:', seriesData.title?.length);
      
      const result = await apiClient.patch<SeriesType>(`/api/admin/series/${id}`, seriesData, {
        headers: getAdminAuthHeaders()
      });
      console.log('Series update response:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Invalidating series queries after update');
      // Invalidate both admin and public series queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
    },
    onError: (error) => {
      console.error('Error updating series:', error);
    },
  });

  const deleteSeries = useMutation({
    mutationFn: async (seriesId: string) => {
      console.log('Deleting series:', seriesId);
      return apiClient.delete(`/api/admin/series/${seriesId}`, {
        headers: getAdminAuthHeaders()
      });
    },
    onSuccess: () => {
      console.log('Invalidating series queries after delete');
      // Invalidate both admin and public series queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/series"] });
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
    },
    onError: (error) => {
      console.error('Error deleting series:', error);
    },
  });

  return {
    createSeries,
    updateSeries,
    deleteSeries,
  };
}
