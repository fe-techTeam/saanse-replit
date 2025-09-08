import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Search, User, Clock, Eye, Star, Info, Menu, X, LogOut, Settings, Plus, ThumbsUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { YouTubeStylePlayer } from "@/components/YouTubeStylePlayer";
import { NetflixHero } from "@/components/NetflixHero";
import { NetflixRow } from "@/components/NetflixRow";
import { Header } from "@/components/Header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const { user, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [videoForPlayer, setVideoForPlayer] = useState<any>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of MythosStream.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred while logging out.",
      });
    }
  };

  // High quality thumbnails
  const getUniqueThumbnail = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1604608672516-a84cf4734b11?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1583419135560-38b6e44ef52f?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1604608672654-0dd0b4b4d7b4?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1578662015701-0d6d697d8a6b?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1548199569-23cdfaec0ba2?w=1200&h=675&fit=crop&q=95"
    ];
    return images[index % images.length];
  };

  const enhancedVideos = typedVideos.map((video: any, index: number) => ({
    ...video,
    thumbnail_url: video.thumbnail_url || getUniqueThumbnail(index),
    thumbnailUrl: video.thumbnail_url || getUniqueThumbnail(index),
    rating: (4.1 + Math.random() * 0.8).toFixed(1),
    shortDescription: video.description ? video.description.slice(0, 80) + "..." : "Experience this divine story of faith and devotion.",
    duration: video.duration || (180 + Math.floor(Math.random() * 120)),
    views: video.views || (1000 + Math.floor(Math.random() * 50000)),
    likes: video.likes || (100 + Math.floor(Math.random() * 5000))
  }));

  // Auto-change hero every 6 seconds
  useEffect(() => {
    if (enhancedVideos.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % Math.min(4, enhancedVideos.length));
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [enhancedVideos.length]);

  const toggleFavorite = (videoId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setFavorites(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleVideoPlay = (video: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVideoForPlayer(video);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setVideoForPlayer(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-white tracking-wider">SAANSE</div>
          <div className="text-gray-400 text-lg">Loading divine stories...</div>
          <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-red-600 w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const featuredVideo = enhancedVideos[currentHeroIndex] || enhancedVideos[0];

  // Organize videos into sections
  const trendingVideos = enhancedVideos.slice(0, 10);
  const newReleases = enhancedVideos.slice(10, 20);
  const ramayanaSeries = enhancedVideos.filter(v => v.category === 'Ramayana').slice(0, 10);
  const krishnaStories = enhancedVideos.filter(v => v.category === 'Krishna').slice(0, 10);
  const mahabharataEpic = enhancedVideos.filter(v => v.category === 'Mahabharata').slice(0, 10);
  const devotionalContent = enhancedVideos.filter(v => v.category === 'Bhajans').slice(0, 10);
  const popularPicks = enhancedVideos.slice(20, 30);
  const watchAgain = enhancedVideos.slice(30, 40);
  const becauseYouWatched = enhancedVideos.slice(40, 50);

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
  };

  const handlePlayVideo = (video: any) => {
    handleVideoPlay(video);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header 
        onSearchClick={() => setShowSearchModal(true)}
        onProfileClick={() => navigate('/profile')}
      />

      {/* Hero Section */}
      {featuredVideo && (
        <NetflixHero
          title={featuredVideo.title}
          description={featuredVideo.description || featuredVideo.shortDescription}
          backgroundImage={featuredVideo.thumbnail_url}
          onPlay={() => handlePlayVideo(featuredVideo)}
          onAddToList={() => toggleFavorite(featuredVideo.id)}
          onMoreInfo={() => setSelectedVideo(featuredVideo)}
        />
      )}

      {/* Content Sections - Netflix Style Grid */}
      <div className="bg-black pb-20">
        {/* Trending Now */}
        {trendingVideos.length > 0 && (
          <NetflixRow
            title="Trending Now"
            videos={trendingVideos}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* New Releases */}
        {newReleases.length > 0 && (
          <NetflixRow
            title="New Releases"
            videos={newReleases}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* Continue Watching */}
        {watchAgain.length > 0 && (
          <NetflixRow
            title="Continue Watching"
            videos={watchAgain}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* Ramayana Epic Series */}
        {ramayanaSeries.length > 0 && (
          <NetflixRow
            title="Ramayana: Divine Epic"
            videos={ramayanaSeries}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* Krishna Leela Stories */}
        {krishnaStories.length > 0 && (
          <NetflixRow
            title="Krishna: Divine Stories"
            videos={krishnaStories}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* Popular on SAANSE */}
        {popularPicks.length > 0 && (
          <NetflixRow
            title="Popular on SAANSE"
            videos={popularPicks}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* Mahabharata Epic */}
        {mahabharataEpic.length > 0 && (
          <NetflixRow
            title="Mahabharata: The Great Epic"
            videos={mahabharataEpic}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* Devotional Content */}
        {devotionalContent.length > 0 && (
          <NetflixRow
            title="Devotional Bhajans"
            videos={devotionalContent}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* Because You Watched */}
        {becauseYouWatched.length > 0 && (
          <NetflixRow
            title="Because You Watched Krishna Stories"
            videos={becauseYouWatched}
            onVideoClick={handleVideoClick}
          />
        )}

        {/* More Netflix-style rows */}
        <NetflixRow
          title="Top 10 in India Today"
          videos={enhancedVideos.slice(0, 10)}
          onVideoClick={handleVideoClick}
        />

        <NetflixRow
          title="Spiritual Documentaries"
          videos={enhancedVideos.slice(15, 25)}
          onVideoClick={handleVideoClick}
        />

        <NetflixRow
          title="Festival Celebrations"
          videos={enhancedVideos.slice(25, 35)}
          onVideoClick={handleVideoClick}
        />

        <NetflixRow
          title="Mythological Tales"
          videos={enhancedVideos.slice(35, 45)}
          onVideoClick={handleVideoClick}
        />

        <NetflixRow
          title="Sacred Mantras & Chants"
          videos={enhancedVideos.slice(45, 55)}
          onVideoClick={handleVideoClick}
        />
      </div>

      {/* Netflix-Style Video Modal */}
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
                  <Plus className="w-6 h-6 text-white" />
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
                  <span className="flex items-center text-green-400 font-medium">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    {selectedVideo.rating}
                  </span>
                  <span className="text-gray-400">2024</span>
                  <span className="px-2 py-1 bg-zinc-700 text-white text-xs rounded">HD</span>
                  <span className="text-gray-400">{Math.floor(selectedVideo.duration / 60)}m</span>
                </div>
              </div>
              
              {/* Description */}
              <div className="space-y-4">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {selectedVideo.description || selectedVideo.shortDescription}
                </p>
              </div>
              
              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-700">
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Category</h3>
                  <span className="text-white">{selectedVideo.category}</span>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Views</h3>
                  <span className="text-white">{selectedVideo.views?.toLocaleString()} views</span>
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
          
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
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