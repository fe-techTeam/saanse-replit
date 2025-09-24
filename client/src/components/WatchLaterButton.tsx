import { useState, useEffect, useCallback, useMemo } from "react";
import { Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchLater } from "@/hooks/useWatchLater";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { VideoType } from "@/types/video";

interface WatchLaterButtonProps {
  video: VideoType;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
  showText?: boolean;
}

export function WatchLaterButton({ 
  video, 
  variant = "outline", 
  size = "sm", 
  className = "",
  showText = true 
}: WatchLaterButtonProps) {
  const [isInWatchLater, setIsInWatchLater] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { addToWatchLater, removeFromWatchLater, watchLater, isAdding, isRemoving } = useWatchLater();
  const { toast } = useToast();

  // Use cached data to determine if video is in watch later
  const isVideoInWatchLater = useMemo(() => {
    if (!watchLater || !Array.isArray(watchLater) || !video?.id) return false;
    return watchLater.some((item: any) => item.videoId === video.id);
  }, [watchLater, video?.id]);

  // Update local state when cached data changes
  useEffect(() => {
    setIsInWatchLater(isVideoInWatchLater);
    setIsLoading(false);
  }, [isVideoInWatchLater]);

  // Show loading state if we don't have watch later data yet
  const { isLoading: isWatchLaterLoading } = useWatchLater();
  const shouldShowLoading = isLoading || isWatchLaterLoading;

  const handleToggleWatchLater = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add videos to your Watch Later list.",
        variant: "destructive",
      });
      return;
    }

    if (isInWatchLater) {
      try {
        await removeFromWatchLater(video.id);
        toast({
          title: "Removed from Watch Later",
          description: `${video.title} has been removed from your Watch Later list.`,
        });
      } catch (error) {
        console.error("Failed to remove from watch later:", error);
        toast({
          title: "Error",
          description: "Failed to remove from Watch Later list.",
          variant: "destructive",
        });
      }
    } else {
      try {
        const result = await addToWatchLater({ videoId: video.id });
        
        if (result.alreadyExists) {
          toast({
            title: "Already in Watch Later",
            description: `${video.title} is already in your Watch Later list.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Added to Watch Later",
            description: `${video.title} has been added to your Watch Later list.`,
          });
        }
      } catch (error) {
        console.error("Failed to add to watch later:", error);
        toast({
          title: "Error",
          description: "Failed to add to Watch Later list.",
          variant: "destructive",
        });
      }
    }
  };

  if (shouldShowLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={className}
      >
        <Clock className="w-4 h-4" />
        {showText && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleWatchLater}
      disabled={isAdding || isRemoving}
      className={`${isInWatchLater ? 'bg-red-600 text-white hover:bg-red-700 border-transparent hover:border-transparent' : ''} ${className}`}
    >
      {isInWatchLater ? (
        <>
          <Check className="w-4 h-4" />
          {showText && <span className="ml-2">Added</span>}
        </>
      ) : (
        <>
          <Clock className="w-4 h-4" />
          {showText && <span className="ml-2">Watch Later</span>}
        </>
      )}
    </Button>
  );
}
