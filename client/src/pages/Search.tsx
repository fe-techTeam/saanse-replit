import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { VIDEO_CATEGORIES } from "@/types/video";
import type { VideoType } from "@/types/video";
import { useLocation } from "wouter";

export default function Search() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["/api/videos/search", searchQuery],
    enabled: !!searchQuery.trim(),
  });

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredResults = searchResults.filter((video: VideoType) => 
    selectedCategory === "All" || video.category === selectedCategory
  );

  const handleVideoClick = (video: VideoType) => {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setSelectedVideo(null);
  };

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  return (
    <div className="min-h-screen bg-dharma-dark">
      <Header 
        onSearchClick={() => {}}
        onProfileClick={handleProfileClick}
      />

      <main className="pt-20 pb-20">
        <div className="p-4">
          {/* Search Input */}
          <div className="relative mb-6">
            <Input
              type="text"
              placeholder="Search for devotional content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dharma-dark-light text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-dharma-gold border-none pl-12"
            />
            <SearchIcon className="absolute left-3 top-3 w-6 h-6 text-gray-400" />
          </div>
          
          {/* Search filters */}
          <div className="flex space-x-2 mb-6 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === "All"
                  ? "bg-dharma-gold text-dharma-dark"
                  : "bg-dharma-dark-light text-gray-300"
              }`}
            >
              All
            </button>
            {VIDEO_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-dharma-gold text-dharma-dark"
                    : "bg-dharma-dark-light text-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Search results */}
          <div className="space-y-4">
            {!searchQuery.trim() && (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Start typing to search devotional content</p>
              </div>
            )}
            
            {searchQuery.trim() && isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex space-x-3 p-3 bg-dharma-dark-light rounded-lg animate-pulse">
                    <div className="w-20 h-16 bg-gray-600 rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-600 rounded mb-2" />
                      <div className="h-3 bg-gray-600 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery.trim() && !isLoading && filteredResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No videos found for "{searchQuery}"</p>
              </div>
            )}
            
            {filteredResults.map((video: VideoType) => (
              <div
                key={video.id}
                className="flex space-x-3 p-3 bg-dharma-dark-light rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleVideoClick(video)}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-20 h-16 object-cover rounded"
                  loading="lazy"
                />
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1 line-clamp-2">
                    {video.title}
                  </h4>
                  <p className="text-gray-400 text-sm mb-1 line-clamp-1">
                    {video.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{video.category}</span>
                    <span>•</span>
                    <span>{formatDuration(video.duration)}</span>
                    <span>•</span>
                    <span>{video.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation />
      
      <VideoPlayer
        video={selectedVideo}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
      />
    </div>
  );
}
