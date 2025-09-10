import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Clock, Check, Trash2, Star, Eye, Calendar, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useWatchLater } from "@/hooks/useWatchLater";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { YouTubeStylePlayer } from "@/components/YouTubeStylePlayer";
import { WatchLaterButton } from "@/components/WatchLaterButton";
import type { WatchLaterWithVideoType } from "@/types/video";

export default function WatchList() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { watchLater, removeFromWatchLater, markAsWatched, isLoading, error } = useWatchLater();
  const { toast } = useToast();

  // Debug logging
  console.log('WatchList Debug:', {
    user: user?.id,
    isAuthenticated,
    watchLater: watchLater?.length,
    isLoading,
    error
  });
  
  const [selectedVideo, setSelectedVideo] = useState<WatchLaterWithVideoType | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleVideoPlay = (watchLaterItem: WatchLaterWithVideoType) => {
    setSelectedVideo(watchLaterItem);
    setIsVideoPlayerOpen(true);
  };

  const handleRemoveFromWatchLater = async (videoId: string, videoTitle: string) => {
    try {
      console.log("Removing from watch later:", videoId);
      await removeFromWatchLater(videoId);
      console.log("Successfully removed from watch later");
      toast({
        title: "Removed from Watch List",
        description: `${videoTitle} has been removed from your Watch List.`,
      });
    } catch (error) {
      console.error("Failed to remove from watch later:", error);
      toast({
        title: "Error",
        description: `Failed to remove from Watch List: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsWatched = async (videoId: string, videoTitle: string) => {
    try {
      console.log("Marking as watched:", videoId);
      await markAsWatched(videoId);
      console.log("Successfully marked as watched");
      toast({
        title: "Marked as Watched",
        description: `${videoTitle} has been marked as watched.`,
      });
    } catch (error) {
      console.error("Failed to mark as watched:", error);
      toast({
        title: "Error",
        description: `Failed to mark as watched: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return "bg-red-500";
    if (priority >= 2) return "bg-orange-500";
    if (priority >= 1) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dharma-gold mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your Watch List...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Error loading Watch List</div>
            <p className="text-gray-400 mb-4">{error.message}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-gray-800"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">My Watch List</h1>
                <p className="text-gray-400 text-sm">
                  {watchLater.length} {watchLater.length === 1 ? 'video' : 'videos'} in your list
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {watchLater.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your Watch List is Empty</h2>
            <p className="text-gray-400 mb-6">
              Start adding videos to your Watch List to see them here.
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark"
            >
              Browse Videos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {watchLater.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all duration-300"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video">
                  <img
                    src={item.video.thumbnail_url}
                    alt={item.video.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button
                      onClick={() => handleVideoPlay(item)}
                      className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-full font-semibold"
                    >
                      <Play className="w-4 h-4 mr-2 fill-current" />
                      Play
                    </Button>
                  </div>

                  {/* Priority Badge */}
                  {item.priority > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge className={`${getPriorityColor(item.priority)} text-white`}>
                        Priority {item.priority}
                      </Badge>
                    </div>
                  )}

                  {/* Watched Badge */}
                  {item.isWatched && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white">
                        <Check className="w-3 h-3 mr-1" />
                        Watched
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">
                    {item.video.title}
                  </h3>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {item.video.views}
                    </span>
                    <span>•</span>
                    <span>{Math.floor(item.video.duration / 60)}m</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                      {item.video.rating}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Added on {formatDate(item.addedAt)}
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div className="text-sm text-gray-300 mb-3 p-2 bg-gray-800 rounded">
                      <strong>Note:</strong> {item.notes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleVideoPlay(item)}
                      size="sm"
                      className="flex-1 bg-dharma-gold hover:bg-dharma-gold-light text-dharma-dark"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Play
                    </Button>
                    
                    {!item.isWatched && (
                      <Button
                        onClick={() => handleMarkAsWatched(item.videoId, item.video.title)}
                        size="sm"
                        variant="outline"
                        className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleRemoveFromWatchLater(item.videoId, item.video.title)}
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {isVideoPlayerOpen && selectedVideo && (
        <YouTubeStylePlayer
          video={selectedVideo.video}
          isOpen={isVideoPlayerOpen}
          onClose={() => {
            setIsVideoPlayerOpen(false);
            setSelectedVideo(null);
          }}
        />
      )}
    </div>
  );
}
