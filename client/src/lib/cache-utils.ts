import { queryClient } from './queryClient';

/**
 * Invalidate series-related caches when videos are modified
 */
export function invalidateSeriesCaches(seriesId?: string) {
  // Invalidate all series caches
  queryClient.invalidateQueries({ queryKey: ["series"] });
  queryClient.invalidateQueries({ queryKey: ["series-with-counts"] });
  
  // Invalidate specific series caches if seriesId is provided
  if (seriesId) {
    queryClient.invalidateQueries({ queryKey: ["/api/series", seriesId] });
    queryClient.invalidateQueries({ queryKey: ["/api/series", seriesId, "videos"] });
  }
  
  // Invalidate all video caches
  queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
}

/**
 * Invalidate all caches (use sparingly)
 */
export function invalidateAllCaches() {
  queryClient.invalidateQueries();
}
