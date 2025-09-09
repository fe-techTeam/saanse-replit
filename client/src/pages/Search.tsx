import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { YouTubeStylePlayer } from "@/components/YouTubeStylePlayer";
import { NetflixRow } from "@/components/NetflixRow";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, ArrowLeft, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { VIDEO_CATEGORIES } from "@/types/video";
import type { VideoType } from "@/types/video";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { data: searchResults = [], isLoading } = useQuery<VideoType[]>({
    queryKey: ["/api/videos/search", searchQuery],
    enabled: !!searchQuery.trim(),
  });

  // Update search query when URL params change
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    setSearchQuery(queryFromUrl);
  }, [searchParams]);

  const filteredResults = searchResults.filter((video: VideoType) => 
    selectedCategory === "All" || video.category === selectedCategory
  );

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setSelectedVideo(null);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setSearchQuery(query.trim());
    } else {
      setSearchParams({});
      setSearchQuery('');
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchParams({});
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Helper function to convert VideoType to format expected by NetflixRow
  const convertVideoForNetflixRow = (videos: VideoType[]) => {
    return videos.map(video => ({
      ...video,
      thumbnailUrl: video.thumbnail_url,
      videoUrl: video.video_url,
      createdAt: video.created_at,
      isActive: video.is_active,
      contentType: video.content_type,
      seriesId: video.series_id,
      episodeNumber: video.episode_number
    }));
  };

  // Popular search suggestions
  const searchSuggestions = [
    'Krishna Leela',
    'Hanuman Chalisa', 
    'Ramayana Episodes',
    'Bhagavad Gita',
    'Devi Stotram',
    'Ganesha Stories',
    'Shiva Tandav',
    'Mahabharata',
    'Bhajans',
    'Festivals',
    'Aarti',
    'Mantras'
  ];

  const filteredSuggestions = searchSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase()) && suggestion !== searchQuery
  );

  return (
    <div className="fixed inset-0 z-50 bg-black text-white overflow-y-auto">
      {/* Custom Search Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-gray-800/30">
        <div className="p-4">
          {/* Custom Full-Width Search Bar */}
          <div className="relative w-full">
            <div className="flex items-center w-full">
              {/* Back Button */}
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center w-12 h-12 text-gray-400 hover:text-white transition-colors mr-4 hover:bg-gray-800/50 rounded-full"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              {/* Search Input Container */}
              <div className="relative flex-1">
                <div className={`flex items-center w-full bg-gray-900/60 rounded-2xl border-2 transition-all duration-200 ${
                  isFocused ? 'border-red-500/50 bg-gray-900/80' : 'border-gray-700/50 hover:border-gray-600/50'
                }`}>
                  {/* Search Icon */}
                  <div className="flex items-center justify-center w-12 h-14 text-gray-400">
                    <SearchIcon className="w-5 h-5" />
                  </div>
                  
                  {/* Input Field */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      setIsFocused(true);
                      if (filteredSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setIsFocused(false);
                      setTimeout(() => setShowSuggestions(false), 150);
                    }}
                    placeholder="Search devotional content, stories, bhajans..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 py-4 px-4 text-lg leading-6 outline-none"
                    autoFocus
                  />
                  
                  {/* Clear Button */}
                  {searchQuery && (
                    <button
                      onClick={handleClear}
                      className="flex items-center justify-center w-12 h-14 text-gray-400 hover:text-white transition-colors mr-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl max-h-64 overflow-hidden">
                    {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center px-6 py-4 text-left text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors duration-150 border-b border-gray-800/30 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <SearchIcon className="w-4 h-4 text-gray-500 mr-4 flex-shrink-0" />
                        <span className="truncate text-base">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === "All"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                  : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 border border-gray-700/50"
              }`}
            >
              All
            </button>
            {VIDEO_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                    : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80 border border-gray-700/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {/* Search Suggestions - Material 3 Style */}
        {!searchQuery.trim() && (
          <div className="mb-8">
            <h3 className="text-xl font-medium text-white mb-6">Popular Searches</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSearch(suggestion)}
                  className="group p-4 bg-gray-900/60 hover:bg-gray-800/80 rounded-2xl text-left text-gray-300 hover:text-white transition-all duration-200 border border-gray-800/50 hover:border-gray-700/50 hover:shadow-lg"
                >
                  <div className="flex items-center">
                    <SearchIcon className="w-4 h-4 text-gray-500 mr-3 group-hover:text-red-400 transition-colors" />
                    <span className="text-sm font-medium">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Default State - Material 3 Style */}
        {!searchQuery.trim() && (
          <div className="text-center py-16">
            <div className="bg-gray-900/40 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-3">Search SAANSE</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Discover divine stories, bhajans, and spiritual content from our extensive library</p>
            
            {/* Quick Category Access */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {VIDEO_CATEGORIES.slice(0, 4).map((category) => (
                <button
                  key={category}
                  onClick={() => navigate(`/category/${category.toLowerCase()}`)}
                  className="group p-4 bg-gray-900/40 hover:bg-red-600/20 rounded-2xl border border-gray-800/50 hover:border-red-500/50 text-gray-300 hover:text-red-400 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="text-sm font-medium">{category}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Loading State - Material 3 Style */}
        {searchQuery.trim() && isLoading && (
          <div className="space-y-8">
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gray-900/60 rounded-full border border-gray-800/50">
                <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                <span className="text-gray-300">Searching for "{searchQuery}"...</span>
              </div>
            </div>
            
            {/* Material 3 Loading Skeleton */}
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-800/60 rounded-full w-64 mx-auto"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-gray-900/60 rounded-2xl overflow-hidden border border-gray-800/50">
                    <div className="w-full h-48 bg-gray-800/60"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-800/60 rounded-full w-3/4"></div>
                      <div className="h-3 bg-gray-800/60 rounded-full w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* No Results - Material 3 Style */}
        {searchQuery.trim() && !isLoading && filteredResults.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-900/40 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">No results found</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">We couldn't find any videos matching "{searchQuery}". Try a different search term or browse by category.</p>
            
            <div className="space-y-6">
              <p className="text-gray-500 font-medium">Try searching for:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 max-w-3xl mx-auto">
                {VIDEO_CATEGORIES.slice(0, 6).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleSearch(category)}
                    className="px-4 py-2 bg-gray-900/60 hover:bg-gray-800/80 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200 border border-gray-800/50 hover:border-gray-700/50"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Search Results using NetflixRow */}
        {searchQuery.trim() && !isLoading && filteredResults.length > 0 && (
          <div className="space-y-8">
            <NetflixRow
              title={`Search Results for "${searchQuery}" ${selectedCategory !== "All" ? `in ${selectedCategory}` : ''} (${filteredResults.length} ${filteredResults.length === 1 ? 'result' : 'results'})`}
              videos={convertVideoForNetflixRow(filteredResults)}
              onVideoClick={handleVideoClick}
            />
            
            {/* Additional rows based on categories if we have enough results */}
            {filteredResults.length > 10 && (
              <>
                {VIDEO_CATEGORIES.map((category) => {
                  const categoryResults = filteredResults.filter(video => video.category === category);
                  if (categoryResults.length > 0 && (selectedCategory === "All" || selectedCategory === category)) {
                    return (
                      <NetflixRow
                        key={category}
                        title={`${category} Results`}
                        videos={convertVideoForNetflixRow(categoryResults)}
                        onVideoClick={handleVideoClick}
                      />
                    );
                  }
                  return null;
                })}
              </>
            )}
          </div>
        )}
      </main>

      
      <YouTubeStylePlayer
        video={selectedVideo}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes zoom-in-95 {
            from { 
              opacity: 0;
              transform: scale(0.95);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .animate-in {
            animation-fill-mode: both;
          }
          
          .fade-in {
            animation: fade-in 0.3s ease-out;
          }
          
          .zoom-in-95 {
            animation: zoom-in-95 0.3s ease-out;
          }
        `
      }} />
    </div>
  );
}
