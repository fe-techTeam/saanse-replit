import { useState } from "react";
import { Play, Plus, ThumbsUp, ChevronDown, RefreshCw } from "lucide-react";
import { useSeriesWithCounts } from "@/hooks/useSeriesWithCounts";
import { useQueryClient } from "@tanstack/react-query";
import type { SeriesType } from "@/types/video";

interface SeriesRowProps {
  onSeriesClick?: (series: SeriesType) => void;
}

export function SeriesRow({ onSeriesClick }: SeriesRowProps) {
  const { data: series = [], isLoading, refetch } = useSeriesWithCounts();
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const queryClient = useQueryClient();

  if (isLoading) return <p className="px-4">Loading series...</p>;

  const handleSeriesClick = (s: SeriesType, e: React.MouseEvent) => {
    e.stopPropagation();
    onSeriesClick?.(s);
  };

  const handleRefresh = () => {
    // Invalidate and refetch all series-related caches
    queryClient.invalidateQueries({ queryKey: ["series"] });
    queryClient.invalidateQueries({ queryKey: ["series-with-counts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/series"] });
    refetch();
  };

  return (
    <div className="mb-8">
      {/* Section Title */}
      <div className="flex items-center justify-between px-4 md:px-12 lg:px-16 mb-4">
        <h2 className="text-xl font-semibold text-white">
          Series
        </h2>
        <button
          onClick={handleRefresh}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh series data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>
      
      {/* Series Row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-12 lg:px-16">
        {series.map((s) => (
          <div 
            key={s.id} 
            className="flex-none cursor-pointer relative group"
            onMouseEnter={() => setHoveredSeries(s.id)}
            onMouseLeave={() => setHoveredSeries(null)}
            onClick={(e) => handleSeriesClick(s, e)}
          >
            <div className="w-48 h-28 rounded-md overflow-hidden bg-gray-800 transition-transform duration-300 group-hover:scale-110 group-hover:z-50 relative">
              <img 
                src={s.thumbnail_url} 
                alt={s.title} 
                className="w-full h-full object-cover" 
              />
              
              {/* Hover Popup */}
              {hoveredSeries === s.id && (
                <div className="absolute inset-0 bg-zinc-900 rounded-md shadow-2xl transform scale-110 transition-all duration-300 z-50">
                  {/* Thumbnail */}
                  <div className="relative h-28">
                    <img 
                      src={s.thumbnail_url} 
                      alt={s.title} 
                      className="w-full h-full object-cover rounded-t-md" 
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Info Section */}
                  <div className="p-3 space-y-2">
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle play
                        }}
                      >
                        <Play className="w-4 h-4 text-black fill-black ml-0.5" />
                      </button>
                      <button 
                        className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle add to list
                        }}
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                      <button 
                        className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle like
                        }}
                      >
                        <ThumbsUp className="w-4 h-4 text-white" />
                      </button>
                      <div className="flex-1" />
                      <button 
                        className="w-8 h-8 border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-white transition-colors"
                        onClick={(e) => handleSeriesClick(s, e)}
                      >
                        <ChevronDown className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    
                    {/* Title and Info */}
                    <div>
                      <h3 className="text-white font-medium text-sm line-clamp-1">{s.title}</h3>
                      <p className="text-green-400 text-xs font-medium">
                        {(s as any).actual_episode_count || s.total_episodes} Episodes
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
