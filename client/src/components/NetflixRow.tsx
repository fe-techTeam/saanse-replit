import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, ThumbsUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  views: number;
  likes: number;
  category: string;
}

interface NetflixRowProps {
  title: string;
  videos: Video[];
  onVideoClick?: (video: Video) => void;
}

export function NetflixRow({ title, videos, onVideoClick }: NetflixRowProps) {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of card + gap
      const currentScroll = scrollRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <div className="relative group mb-8">
      {/* Section Title */}
      <h2 className="text-2xl font-semibold text-dharma-gold mb-4 px-4 md:px-12 lg:px-16">
        {title}
      </h2>
      
      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Video Row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden scroll-smooth px-4 md:px-12 lg:px-16"
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex-none w-72 transition-all duration-300 hover:scale-105 cursor-pointer"
            onMouseEnter={() => setHoveredVideo(video.id)}
            onMouseLeave={() => setHoveredVideo(null)}
            onClick={() => onVideoClick?.(video)}
          >
            <Card className="bg-dharma-secondary border-dharma-gold/20 overflow-hidden hover:shadow-2xl hover:shadow-dharma-gold/20 transition-all duration-300">
              <div className="relative aspect-video">
                {/* Thumbnail */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                
                {/* Overlay on Hover */}
                {hoveredVideo === video.id && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300">
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                        <Play className="w-4 h-4 fill-black" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Duration Badge */}
                <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                  {formatDuration(video.duration)}
                </Badge>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
                  {video.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed min-h-[3.75rem]">
                  {video.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-dharma-gold/20">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViews(video.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatViews(video.likes)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-dharma-gold border-dharma-gold/50 text-xs">
                    {video.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}