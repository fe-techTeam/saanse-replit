import { useQuery } from "@tanstack/react-query";
import type { VideoType } from "@/types/video";

interface CategorySectionProps {
  title: string;
  devanagariTitle: string;
  category: string;
  onVideoClick: (video: VideoType) => void;
  onViewAllClick: () => void;
}

export function CategorySection({ 
  title, 
  devanagariTitle, 
  category, 
  onVideoClick, 
  onViewAllClick 
}: CategorySectionProps) {
  const { data: videos = [], isLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/videos/category", category],
  });

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-xl font-devanagari font-semibold text-dharma-gold">
            {devanagariTitle}
          </h3>
        </div>
        <div className="flex space-x-3 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-40">
              <div className="bg-dharma-dark-light rounded-lg overflow-hidden animate-pulse">
                <div className="w-full h-24 bg-gray-600" />
                <div className="p-3">
                  <div className="h-4 bg-gray-600 rounded mb-2" />
                  <div className="h-3 bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!videos.length) {
    return (
      <section className="mb-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-xl font-devanagari font-semibold text-dharma-gold">
            {devanagariTitle}
          </h3>
        </div>
        <div className="px-4 py-8 text-center">
          <p className="text-gray-400">No videos available in this category</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between px-4 mb-4">
        <h3 className="text-xl font-devanagari font-semibold text-dharma-gold">
          {devanagariTitle}
        </h3>
        <button 
          className="text-gray-400 hover:text-white text-sm transition-colors"
          onClick={onViewAllClick}
        >
          View All
        </button>
      </div>
      
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide category-scroll px-4">
        {videos.map((video: VideoType) => (
          <div key={video.id} className="flex-shrink-0 w-40">
            <div 
              className="video-thumbnail bg-dharma-dark-light rounded-lg overflow-hidden cursor-pointer"
              onClick={() => onVideoClick(video)}
            >
              <img 
                src={video.thumbnailUrl} 
                alt={video.title}
                className="w-full h-24 object-cover"
                loading="lazy"
              />
              <div className="p-3">
                <h4 className="text-sm font-medium mb-1 line-clamp-2">
                  {video.title}
                </h4>
                <p className="text-xs text-gray-400">
                  {formatDuration(video.duration)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
