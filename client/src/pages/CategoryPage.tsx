import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Search, LogOut, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { YouTubeStylePlayer } from "@/components/YouTubeStylePlayer";
import { NetflixHero } from "@/components/NetflixHero";
import { NetflixRow } from "@/components/NetflixRow";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VIDEO_CATEGORIES, VideoType } from "@/types/video";
import { CircularButton } from "@/components/ui/circular-button";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [videoForPlayer, setVideoForPlayer] = useState<VideoType | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Normalize category name (capitalize first letter)
  const normalizedCategory = category ? 
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : '';

  // Verify category exists
  const validCategory = VIDEO_CATEGORIES.find(cat => 
    cat.toLowerCase() === category?.toLowerCase()
  );

  const { data: categoryVideos = [], isLoading } = useQuery<VideoType[]>({
    queryKey: [`/api/videos/category/${normalizedCategory}`],
    enabled: !!validCategory,
  });

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of SAANSE.",
      });
      navigate('/signup', { replace: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred while logging out.",
      });
      navigate('/signup', { replace: true });
    }
  };

  const toggleFavorite = (videoId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setFavorites(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleVideoPlay = (video: VideoType, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVideoForPlayer(video);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setVideoForPlayer(null);
  };

  const handleVideoClick = (video: VideoType) => {
    setSelectedVideo(video);
  };

  const handlePlayVideo = (video: VideoType) => {
    handleVideoPlay(video);
  };

  // Helper function to convert VideoType to format expected by NetflixRow
  const convertVideoForNetflixRow = (videos: VideoType[]) => {
    return videos.map(video => ({
      ...video,
      thumbnailUrl: video.thumbnail_url, // Convert snake_case to camelCase
      videoUrl: video.video_url,
      createdAt: video.created_at,
      isActive: video.is_active,
      contentType: video.content_type,
      seriesId: video.series_id,
      episodeNumber: video.episode_number
    }));
  };

  if (!validCategory) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-red-600">Category Not Found</h1>
          <p className="text-gray-400">The category "{category}" does not exist.</p>
          <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-white tracking-wider">SAANSE</div>
          <div className="text-gray-400 text-lg">Loading {normalizedCategory} content...</div>
          <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-red-600 w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get featured video for hero section
  const featuredVideo = categoryVideos[0];

  // Organize videos into different sections
  const trendingVideos = categoryVideos.slice(0, 12);
  const popularVideos = categoryVideos.slice(12, 24);
  const recentVideos = categoryVideos.slice(24, 36);

  // Get category description
  const getCategoryDescription = (cat: string) => {
    const descriptions: Record<string, string> = {
      'Ramayana': 'Immerse yourself in the timeless epic of Lord Rama, Sita, and Hanuman. Experience the divine journey of virtue, love, and devotion.',
      'Krishna': 'Discover the enchanting leelas of Lord Krishna, from his childhood in Vrindavan to his divine teachings in the Bhagavad Gita.',
      'Mahabharata': 'Explore the greatest epic ever told - a tale of dharma, duty, and destiny featuring the Pandavas and Kauravas.',
      'Shiva': 'Delve into the mystical world of Lord Shiva, the destroyer and transformer, and his divine cosmic dance.',
      'Hanuman': 'Witness the unwavering devotion and tremendous strength of Hanuman, the greatest devotee of Lord Rama.',
      'Ganesha': 'Celebrate the wisdom and benevolence of Lord Ganesha, the remover of obstacles and patron of arts and sciences.',
      'Devi': 'Honor the Divine Mother in her various forms - Durga, Lakshmi, Saraswati, and the powerful Shakti.',
      'Festivals': 'Experience the joy and spirituality of Hindu festivals, their traditions, and cultural significance.',
      'Bhajans': 'Let your heart soar with devotional songs and chants that connect you to the divine.',
      'Explained': 'Understand the deeper meanings of Hindu philosophy, symbols, and spiritual concepts made simple.'
    };
    return descriptions[cat] || `Explore the divine world of ${cat} through these spiritual stories and teachings.`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm">
        {/* Top Row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            <CircularButton onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </CircularButton>
            <h1 className="text-red-600 text-2xl font-bold tracking-wide">SAANSE</h1>
            
            {/* Category Navigation Tabs */}
            <div className="hidden md:flex space-x-1 overflow-x-auto scrollbar-hide">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:bg-red-600/20 hover:text-red-400 whitespace-nowrap px-4 py-2 rounded-full"
                onClick={() => navigate('/')}
              >
                Home
              </Button>
              {VIDEO_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant="ghost"
                  size="sm"
                  className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                    cat === normalizedCategory 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-300 hover:bg-red-600/20 hover:text-red-400'
                  }`}
                  onClick={() => navigate(`/category/${cat.toLowerCase()}`)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <CircularButton onClick={() => navigate('/search')}>
              <Search className="w-5 h-5" />
            </CircularButton>
            
            {/* Logout Button */}
            <CircularButton onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </CircularButton>
          </div>
        </div>

        {/* Mobile Category Navigation Tabs */}
        <div className="md:hidden px-4 pb-2">
          <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:bg-red-600/20 hover:text-red-400 whitespace-nowrap px-4 py-2 rounded-full"
              onClick={() => navigate('/')}
            >
              Home
            </Button>
            {VIDEO_CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                size="sm"
                className={`whitespace-nowrap px-4 py-2 rounded-full transition-colors ${
                  cat === normalizedCategory 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-red-600/20 hover:text-red-400'
                }`}
                onClick={() => navigate(`/category/${cat.toLowerCase()}`)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24">
        {/* Hero Section */}
        {featuredVideo && (
          <NetflixHero
            title={`${normalizedCategory}: ${featuredVideo.title}`}
            description={getCategoryDescription(normalizedCategory)}
            backgroundImage={featuredVideo.thumbnail_url}
            onPlay={() => handlePlayVideo(featuredVideo)}
            onAddToList={() => toggleFavorite(featuredVideo.id)}
            onMoreInfo={() => setSelectedVideo(featuredVideo)}
          />
        )}

        {/* Content Sections */}
        <div className="bg-black pb-20">
          {/* All Videos in Category */}
          {categoryVideos.length > 0 && (
            <NetflixRow
              title={`All ${normalizedCategory} Content`}
              videos={convertVideoForNetflixRow(categoryVideos)}
              onVideoClick={(video: any) => handleVideoClick(video)}
            />
          )}

          {/* Trending in Category */}
          {trendingVideos.length > 0 && (
            <NetflixRow
              title={`Trending in ${normalizedCategory}`}
              videos={convertVideoForNetflixRow(trendingVideos)}
              onVideoClick={(video: any) => handleVideoClick(video)}
            />
          )}

          {/* Popular in Category */}
          {popularVideos.length > 0 && (
            <NetflixRow
              title={`Popular ${normalizedCategory} Stories`}
              videos={convertVideoForNetflixRow(popularVideos)}
              onVideoClick={(video: any) => handleVideoClick(video)}
            />
          )}

          {/* Recently Added */}
          {recentVideos.length > 0 && (
            <NetflixRow
              title={`Recently Added to ${normalizedCategory}`}
              videos={convertVideoForNetflixRow(recentVideos)}
              onVideoClick={(video: any) => handleVideoClick(video)}
            />
          )}

          {/* No Content Message */}
          {categoryVideos.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">No {normalizedCategory} content available</h2>
              <p className="text-gray-400 mb-8">We're working on adding more {normalizedCategory} stories for you.</p>
              <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
                Browse All Content
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-zinc-900 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl transform animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Section with Video Thumbnail */}
            <div className="relative h-[50vh] overflow-hidden">
              <img 
                src={selectedVideo.thumbnail_url} 
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              
              {/* Close Button */}
              <button 
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                onClick={() => setSelectedVideo(null)}
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Action Buttons */}
              <div className="absolute bottom-6 left-6 flex items-center space-x-3">
                <button 
                  className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-md font-semibold text-lg flex items-center transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={(e) => handleVideoPlay(selectedVideo, e)}
                >
                  <Play className="w-6 h-6 mr-2 fill-current" />
                  Play
                </button>
                
                <button 
                  onClick={(e) => toggleFavorite(selectedVideo.id, e)}
                  className="w-12 h-12 bg-zinc-800/80 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
                >
                  <Heart className={`w-6 h-6 ${favorites.includes(selectedVideo.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-6 space-y-6">
              {/* Title and Meta Info */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-white leading-tight">
                  {selectedVideo.title}
                </h1>
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-400">2024</span>
                  <span className="px-2 py-1 bg-zinc-700 text-white text-xs rounded">HD</span>
                  <span className="text-gray-400">{Math.floor(selectedVideo.duration / 60)}m</span>
                  <span className="text-gray-400">{selectedVideo.views} views</span>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-4">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {selectedVideo.description}
                </p>
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-700">
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Category</h3>
                  <span className="text-white">{selectedVideo.category}</span>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVideo.tags.map((tag, index) => (
                      <span key={index} className="bg-zinc-700 text-white px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <YouTubeStylePlayer
        video={videoForPlayer}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
      />
    </div>
  );
}