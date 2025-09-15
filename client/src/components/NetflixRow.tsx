import { useState } from "react";
import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import type { VideoType } from "@/types/video";

interface NetflixRowProps {
  title: string;
  videos: VideoType[];
  onVideoClick?: (video: VideoType) => void;
}

export function NetflixRow({ title, videos, onVideoClick }: NetflixRowProps) {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const getMatchPercentage = () => {
    return Math.floor(Math.random() * 20) + 80; // 80-99% match
  };

  const handleVideoClick = (video: VideoType, e: React.MouseEvent) => {
    e.stopPropagation();
    onVideoClick?.(video);
  };

  return (
    <div className="mb-8">
      {/* Section Title */}
      <h2 className="text-xl font-semibold text-white mb-4 px-4 md:px-12 lg:px-16">
        {title}
      </h2>
      
      {/* Video Row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 md:px-12 lg:px-16">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex-none cursor-pointer relative group"
            onMouseEnter={() => setHoveredVideo(video.id)}
            onMouseLeave={() => setHoveredVideo(null)}
            onClick={(e) => handleVideoClick(video, e)}
          >
            <div className="w-48 h-28 rounded-md overflow-hidden bg-gray-800 transition-transform duration-300 group-hover:scale-110 group-hover:z-50 relative">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              
              {/* Hover Popup */}
              {hoveredVideo === video.id && (
                <div className="absolute inset-0 bg-zinc-900 rounded-md shadow-2xl transform scale-110 transition-all duration-300 z-50">
                  {/* Thumbnail */}
                  <div className="relative h-28">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover rounded-t-md"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                      </button>
                    </div>
                    {/* Duration Badge */}
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                      {formatDuration(video.duration)}
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
                        onClick={(e) => handleVideoClick(video, e)}
                      >
                        <ChevronDown className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    
                    {/* Match percentage and rating info */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-green-400 font-bold">{getMatchPercentage()}% Match</span>
                      <span className="text-gray-400">{formatDuration(video.duration)}</span>
                      <span className="border border-gray-500 px-1 text-gray-300">HD</span>
                    </div>
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-white font-medium text-sm line-clamp-1">{video.title}</h3>
                    </div>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 text-xs text-gray-400">
                      <span>{video.category}</span>
                      {video.tags && video.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{video.tags[0]}</span>
                        </>
                      )}
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