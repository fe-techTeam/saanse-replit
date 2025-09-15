import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Search, User, Clock, Eye, Star, Info, Menu, X, LogOut, Settings, Plus, ThumbsUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWatchLater } from "@/hooks/useWatchLater";
import { YouTubeStylePlayer } from "@/components/YouTubeStylePlayer";
import { NetflixHero } from "@/components/NetflixHero";
import { NetflixRow } from "@/components/NetflixRow";
import { WatchLaterButton } from "@/components/WatchLaterButton";
import { MoreInfoDialog } from "@/components/MoreInfoDialog";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SeriesRow } from "@/components/SeriesRow";
import { CircularButton } from "@/components/ui/circular-button";
import { isSafari, getSafariQueryConfig, safariDebouncer, cleanupSafariResources } from "@/lib/safari-utils";

export default function Home() {
  const { user, signOut, isAuthenticated, getAuthHeaders } = useAuth();
  
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const fetchVideos = async () => {
        const response = await fetch("/api/videos", {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
        return response.json();
      };

      // Safari-specific debouncing
      if (isSafari()) {
        return safariDebouncer.debounce("/api/videos", fetchVideos);
      }
      
      return fetchVideos();
    },
    enabled: isAuthenticated,
    ...getSafariQueryConfig(),
    // Fallback for non-Safari browsers
    staleTime: isSafari() ? undefined : 5 * 60 * 1000,
    cacheTime: isSafari() ? undefined : 10 * 60 * 1000,
    retry: isSafari() ? undefined : 1,
  });

  const { watchLater } = useWatchLater();
  const navigate = useNavigate();
  const { toast } = useToast();

  const typedVideos = videos as any[];
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [videoForPlayer, setVideoForPlayer] = useState<any>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [moreInfoVideo, setMoreInfoVideo] = useState<any>(null);
  const [isMoreInfoOpen, setIsMoreInfoOpen] = useState(false);
  // Home no longer filters by category – series-centric

  // Safari cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSafari()) {
        cleanupSafariResources();
      }
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of SAANSE.",
      });
      navigate('/signup', { replace: true });
      setTimeout(() => {
        window.location.href = '/signup';
      }, 100);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "An error occurred while logging out.",
      });
      navigate('/signup', { replace: true });
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

  const handleMoreInfo = (video: any) => {
    setMoreInfoVideo(video);
    setIsMoreInfoOpen(true);
  };

  const handleCloseMoreInfo = () => {
    setIsMoreInfoOpen(false);
    setMoreInfoVideo(null);
  };

  const handleSeriesClick = (series: any) => {
    // Convert series to video format for MoreInfoDialog
    // Use the first episode or create a representative video object
    const seriesAsVideo = {
      id: series.id,
      title: series.title,
      description: series.description,
      thumbnail_url: series.thumbnail_url,
      banner_url: series.banner_url,
      series_id: series.id,
      category: series.category || 'Series',
      duration: 0, // Will be filled from first episode
      views: series.total_episodes * 1000, // Estimate based on episodes
      likes: series.total_episodes * 100,
      created_at: series.created_at,
      content_type: 'series',
      episode_number: 1,
      tags: series.tags || [],
      video_url: '', // Not needed for series overview
    };
    handleMoreInfo(seriesAsVideo);
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


  // Basic sections for series-centric homepage
  const sections = {
    trendingVideos: enhancedVideos.slice(0, 10),
    newReleases: enhancedVideos.slice(10, 20),
    watchAgain: enhancedVideos.slice(20, 30),
    popularPicks: enhancedVideos.slice(30, 40),
    ramayanaSeries: [] as any[],
    krishnaStories: [] as any[],
    mahabharataEpic: [] as any[],
    devotionalContent: [] as any[],
    becauseYouWatched: [] as any[],
  };

  // Remove unused handleVideoClick since we now use handleMoreInfo directly

  const handlePlayVideo = (video: any) => {
    handleVideoPlay(video);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm">
        {/* Top Row - Logo, Category Tabs, Search, Logout */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            <h1 className="text-red-600 text-2xl font-bold tracking-wide">SAANSE</h1>
            
            {/* Series-centric, no category tabs */}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Watch List Button */}
            <CircularButton 
              onClick={() => navigate('/watchlist')}
              className="bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark"
            >
              <Clock className="w-5 h-5" />
            </CircularButton>
            
            {/* Search Button */}
            <CircularButton 
              onClick={() => navigate('/search')}
            >
              <Search className="w-5 h-5" />
            </CircularButton>
            
            {/* Logout Button */}
            <CircularButton 
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </CircularButton>
          </div>
        </div>

        {/* Mobile Category Navigation Tabs */}
        {/* (Category tabs removed) */}
      </div>

      {/* Hero Section - Only show on Home */}
      <div className="pt-24">
        {featuredVideo && (
          <NetflixHero
            video={featuredVideo}
            onPlay={() => handlePlayVideo(featuredVideo)}
            onMoreInfo={() => handleMoreInfo(featuredVideo)}
          />
        )}
      </div>

      {/* Series row */}
      <SeriesRow onSeriesClick={handleSeriesClick} />

      {/* Content Sections - Netflix Style Grid */}
      <div className="bg-black pb-20">
        {/* Home rows */}
        {/* Watch Later Section - Only show if user has videos in watch later */}
        {isAuthenticated && watchLater.length > 0 && (
          <NetflixRow
            title="Your Watch Later"
            videos={watchLater.map(item => item.video)}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.trendingVideos.length > 0 && (
          <NetflixRow
            title="Trending Now"
            videos={sections.trendingVideos}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.newReleases.length > 0 && (
          <NetflixRow
            title="New Releases"
            videos={sections.newReleases}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.watchAgain.length > 0 && (
          <NetflixRow
            title="Continue Watching"
            videos={sections.watchAgain}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.ramayanaSeries.length > 0 && (
          <NetflixRow
            title="Ramayana: Divine Epic"
            videos={sections.ramayanaSeries}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.krishnaStories.length > 0 && (
          <NetflixRow
            title="Krishna: Divine Stories"
            videos={sections.krishnaStories}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.popularPicks.length > 0 && (
          <NetflixRow
            title="Popular on SAANSE"
            videos={sections.popularPicks}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.mahabharataEpic.length > 0 && (
          <NetflixRow
            title="Mahabharata: The Great Epic"
            videos={sections.mahabharataEpic}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.devotionalContent.length > 0 && (
          <NetflixRow
            title="Devotional Bhajans"
            videos={sections.devotionalContent}
            onVideoClick={handleMoreInfo}
          />
        )}

        {sections.becauseYouWatched.length > 0 && (
          <NetflixRow
            title="Because You Watched Krishna Stories"
            videos={sections.becauseYouWatched}
            onVideoClick={handleMoreInfo}
          />
        )}
      </div>


      {/* More Info Dialog */}
      {moreInfoVideo && (
        <MoreInfoDialog
          isOpen={isMoreInfoOpen}
          onClose={handleCloseMoreInfo}
          video={moreInfoVideo}
          onPlay={handleVideoPlay}
        />
      )}

      <YouTubeStylePlayer
        video={videoForPlayer}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
        onVideoChange={setVideoForPlayer}
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