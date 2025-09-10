import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Share2, Heart, Volume2, Maximize, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { VideoType } from "@/types/video";
import { useAuth } from "@/hooks/useAuth";

interface VideoPlayerProps {
  video: VideoType | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
}

export function VideoPlayer({ video, isOpen, onClose, onNext }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Increment view count
  const viewMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("POST", `/api/videos/${videoId}/view`);
    },
  });

  // Like video
  const likeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("POST", `/api/videos/${videoId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
  });

  // Add to view history
  const historyMutation = useMutation({
    mutationFn: async (data: { userId: string; videoId: string; progress: number }) => {
      await apiRequest("POST", "/api/history", data);
    },
  });

  useEffect(() => {
    if (isOpen && video) {
      // Increment view count
      viewMutation.mutate(video.id);
      
      // Add to view history if user is authenticated
      if (user) {
        historyMutation.mutate({
          userId: user.id,
          videoId: video.id,
          progress: 0,
        });
      }
    }
  }, [isOpen, video, user]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const updateTime = () => setCurrentTime(videoEl.currentTime);
    const updateDuration = () => setDuration(videoEl.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext) onNext();
    };

    videoEl.addEventListener('timeupdate', updateTime);
    videoEl.addEventListener('loadedmetadata', updateDuration);
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('ended', handleEnded);

    return () => {
      videoEl.removeEventListener('timeupdate', updateTime);
      videoEl.removeEventListener('loadedmetadata', updateDuration);
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  const togglePlay = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    try {
      if (isPlaying) {
        videoEl.pause();
        setIsPlaying(false);
      } else {
        await videoEl.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing video:', error);
    }
  };

  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoEl.requestFullscreen();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    videoEl.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleLike = () => {
    if (!video) return;
    
    setIsLiked(!isLiked);
    likeMutation.mutate(video.id);
  };

  const handleShare = async () => {
    if (!video) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !video) {
    return null;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative h-full flex flex-col">
        {/* Video player header */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent z-10 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-white p-2"
              onClick={onClose}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white p-2"
                onClick={handleShare}
              >
                <Share2 className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`text-white p-2 ${isLiked ? 'text-dharma-red' : ''}`}
                onClick={handleLike}
              >
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Video container */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            src={video.video_url}
            className="w-full h-full object-contain"
            poster={video.thumbnail_url}
            playsInline
            onClick={togglePlay}
          />
        </div>
        
        {/* Video controls and info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <div className="mb-4">
            <h3 className="text-white text-lg font-devanagari font-semibold mb-1">
              {video.title}
            </h3>
            <p className="text-gray-300 text-sm">
              {video.description}
            </p>
          </div>
          
          {/* Video progress bar */}
          <div 
            className="w-full bg-gray-600 rounded-full h-1 mb-3 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="bg-dharma-red h-1 rounded-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Video controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 fill-current" />
                )}
              </Button>
              
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white p-1"
                onClick={toggleMute}
              >
                <Volume2 className={`w-5 h-5 ${isMuted ? 'opacity-50' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white p-1"
                onClick={toggleFullscreen}
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
