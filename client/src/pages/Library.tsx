import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { YouTubeStylePlayer } from "@/components/YouTubeStylePlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Heart, Clock, BookOpen } from "lucide-react";
import type { VideoType, PlaylistType, ViewHistoryType } from "@/types/video";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Library() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const { data: playlists = [] } = useQuery<PlaylistType[]>({
    queryKey: ["/api/users", user?.id, "playlists"],
    enabled: !!user?.id,
  });

  const { data: viewHistory = [] } = useQuery<ViewHistoryType[]>({
    queryKey: ["/api/users", user?.id, "history"],
    enabled: !!user?.id,
  });

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

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dharma-dark">
        <Header 
          onSearchClick={() => setLocation("/search")}
          onProfileClick={handleProfileClick}
        />

        <main className="pt-20 pb-20 flex items-center justify-center">
          <div className="text-center p-6">
            <BookOpen className="w-16 h-16 text-dharma-gold mx-auto mb-4" />
            <h2 className="text-xl font-devanagari font-semibold text-dharma-gold mb-2">
              Sign in to access your library
            </h2>
            <p className="text-gray-400 mb-6">
              Save your favorite devotional content and continue watching where you left off
            </p>
            <button
              onClick={() => setLocation("/profile")}
              className="bg-dharma-gold text-dharma-dark px-6 py-2 rounded-lg font-semibold hover:bg-dharma-gold-light transition-colors"
            >
              Sign In
            </button>
          </div>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  const favoritesPlaylist = playlists.find((p: PlaylistType) => p.type === "favorites");
  const watchLaterPlaylist = playlists.find((p: PlaylistType) => p.type === "watchLater");

  return (
    <div className="min-h-screen bg-dharma-dark">
      <Header 
        onSearchClick={() => setLocation("/search")}
        onProfileClick={handleProfileClick}
      />

      <main className="pt-20 pb-20">
        <div className="p-4">
          <h1 className="text-2xl font-devanagari font-bold text-dharma-gold mb-6">
            Your Library
          </h1>

          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-dharma-dark-light">
              <TabsTrigger value="favorites" className="data-[state=active]:bg-dharma-gold data-[state=active]:text-dharma-dark">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="watchLater" className="data-[state=active]:bg-dharma-gold data-[state=active]:text-dharma-dark">
                <Clock className="w-4 h-4 mr-2" />
                Watch Later
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-dharma-gold data-[state=active]:text-dharma-dark">
                <BookOpen className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites" className="mt-6">
              <div className="space-y-4">
                {!favoritesPlaylist?.videoIds.length ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No favorite videos yet</p>
                    <p className="text-gray-500 text-sm">Videos you like will appear here</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {/* TODO: Implement favorites display */}
                    <p className="text-gray-400">Favorites coming soon...</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="watchLater" className="mt-6">
              <div className="space-y-4">
                {!watchLaterPlaylist?.videoIds.length ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No videos saved for later</p>
                    <p className="text-gray-500 text-sm">Save videos to watch them later</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {/* TODO: Implement watch later display */}
                    <p className="text-gray-400">Watch Later coming soon...</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-4">
                {!viewHistory.length ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No viewing history</p>
                    <p className="text-gray-500 text-sm">Videos you watch will appear here</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <p className="text-gray-400">Viewing history: {viewHistory.length} entries</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <BottomNavigation />
      
      <YouTubeStylePlayer
        video={selectedVideo}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
      />
    </div>
  );
}
