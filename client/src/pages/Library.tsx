import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { YouTubeStylePlayer } from "@/components/YouTubeStylePlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Heart, Clock, BookOpen, Play, Trash2, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { VideoType, PlaylistType, ViewHistoryType, WatchLaterWithVideoType } from "@/types/video";
import { useAuth } from "@/hooks/useAuth";
import { useWatchLater } from "@/hooks/useWatchLater";
import { useLocation } from "wouter";

export default function Library() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { watchLater, removeFromWatchLater, markAsWatched, isRemoving, isMarkingWatched } = useWatchLater();

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

  const handleRemoveFromWatchLater = (videoId: string) => {
    removeFromWatchLater(videoId);
  };

  const handleMarkAsWatched = (videoId: string) => {
    markAsWatched(videoId);
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return "text-red-500";
    if (priority >= 2) return "text-orange-500";
    if (priority >= 1) return "text-yellow-500";
    return "text-gray-400";
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

          <Tabs defaultValue="watchLater" className="w-full">
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
                {!watchLater.length ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No videos saved for later</p>
                    <p className="text-gray-500 text-sm">Save videos to watch them later</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {watchLater.map((item) => (
                      <Card key={item.id} className="bg-dharma-dark-light border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative flex-shrink-0">
                              <img
                                src={item.video.thumbnail_url}
                                alt={item.video.title}
                                className="w-32 h-20 object-cover rounded-lg"
                              />
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                                {formatDuration(item.video.duration)}
                              </div>
                              {item.isWatched && (
                                <div className="absolute top-1 right-1 bg-green-500 text-white p-1 rounded-full">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-white truncate">
                                    {item.video.title}
                                  </h3>
                                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                    {item.video.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-gray-500">
                                      {item.video.category}
                                    </span>
                                    <span className="text-xs text-gray-500">•</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(item.addedAt).toLocaleDateString()}
                                    </span>
                                    {item.priority > 0 && (
                                      <>
                                        <span className="text-xs text-gray-500">•</span>
                                        <div className="flex items-center gap-1">
                                          <Star className={`w-3 h-3 ${getPriorityColor(item.priority)}`} />
                                          <span className={`text-xs ${getPriorityColor(item.priority)}`}>
                                            Priority {item.priority}
                                          </span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                  {item.notes && (
                                    <p className="text-xs text-gray-400 mt-1 italic">
                                      "{item.notes}"
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex flex-col gap-2 ml-4">
                                  <Button
                                    size="sm"
                                    onClick={() => handleVideoClick(item.video)}
                                    className="bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    Play
                                  </Button>
                                  
                                  <div className="flex gap-1">
                                    {!item.isWatched && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleMarkAsWatched(item.videoId)}
                                        disabled={isMarkingWatched}
                                        className="text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                    )}
                                    
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRemoveFromWatchLater(item.videoId)}
                                      disabled={isRemoving}
                                      className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
