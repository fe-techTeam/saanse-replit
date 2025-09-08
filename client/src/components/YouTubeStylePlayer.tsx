import { useState, useRef, useEffect } from "react";
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward,
  Heart,
  Share2,
  Download,
  Settings,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { VideoType } from "@/types/video";
import { useAuth } from "@/hooks/useAuth";

interface YouTubeStylePlayerProps {
  video: VideoType | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function YouTubeStylePlayer({ 
  video, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious 
}: YouTubeStylePlayerProps) {
  const getVideoUrl = () => {
    if (!video?.video_url) {
      return "https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4";
    }
    return video.video_url;
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSeekBarHovered, setIsSeekBarHovered] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Increment view count
  const viewMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("POST", `/api/videos/${videoId}/views`);
    },
  });

  // Like video
  const likeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("POST", `/api/videos/${videoId}/likes`);
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

  // Reset states when video changes
  useEffect(() => {
    if (video?.id) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsSeekBarHovered(false);
    }
  }, [video?.id]);

  // Auto-play when player opens
  useEffect(() => {
    if (isOpen && video) {
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.load(); // Force reload with new video
        
        // Set up autoplay once video is ready
        const handleCanPlay = () => {
          videoEl.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              // Autoplay was blocked, user will need to click play
            });
        };
        
        videoEl.addEventListener('canplay', handleCanPlay, { once: true });
        
        return () => {
          videoEl.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [isOpen, video?.id]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const updateTime = () => {
      if (videoEl && !isNaN(videoEl.currentTime)) {
        setCurrentTime(videoEl.currentTime);
      }
    };
    const updateDuration = () => {
      if (videoEl && !isNaN(videoEl.duration) && videoEl.duration > 0) {
        setDuration(videoEl.duration);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onNext) onNext();
    };
    const handleVolumeChange = () => {
      setVolume(videoEl.volume);
      setIsMuted(videoEl.muted);
    };

    videoEl.addEventListener('timeupdate', updateTime);
    videoEl.addEventListener('loadedmetadata', updateDuration);
    videoEl.addEventListener('durationchange', updateDuration);
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('ended', handleEnded);
    videoEl.addEventListener('volumechange', handleVolumeChange);

    return () => {
      videoEl.removeEventListener('timeupdate', updateTime);
      videoEl.removeEventListener('loadedmetadata', updateDuration);
      videoEl.removeEventListener('durationchange', updateDuration);
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('ended', handleEnded);
      videoEl.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [onNext]);

  // Auto-hide controls
  useEffect(() => {
    if (!isOpen) return;

    const resetTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setShowControls(true);
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    resetTimeout();

    const handleMouseMove = () => resetTimeout();
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isFullscreen]);

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
      console.warn('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const skipTime = (seconds: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const newTime = Math.max(0, Math.min(duration || videoEl.duration || 0, videoEl.currentTime + seconds));
    videoEl.currentTime = newTime;
  };

  const adjustVolume = (change: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const newVolume = Math.max(0, Math.min(1, volume + change));
    videoEl.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume > 0) {
      videoEl.muted = false;
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const newMuted = !isMuted;
    videoEl.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.warn('Fullscreen error:', error);
      setIsFullscreen(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const videoDuration = duration || videoEl.duration || 0;
    
    if (videoDuration > 0) {
      const newTime = percentage * videoDuration;
      videoEl.currentTime = newTime;
    }
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, clickX / width));
    
    videoEl.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume > 0) {
      videoEl.muted = false;
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
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
    if (!time || isNaN(time) || time < 0) {
      return '0:00';
    }
    
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cleanup when closing player
  useEffect(() => {
    if (!isOpen) {
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      setIsSeekBarHovered(false);
      setVolume(1);
      setIsMuted(false);
      setIsFullscreen(false);
      setShowControls(true);
      setIsLiked(false);
      setShowInfo(true);
    }
  }, [isOpen]);

  if (!isOpen || !video) {
    return null;
  }

  // Safe calculation for progress percentage
  const progressPercent = (duration && duration > 0 && !isNaN(duration) && !isNaN(currentTime)) 
    ? Math.max(0, Math.min(100, (currentTime / duration) * 100))
    : 0;
  const volumePercent = volume * 100;

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 flex ${isFullscreen ? '' : 'p-4'}`}
    >
      {/* Video Container */}
      <div className="relative flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          src={getVideoUrl()}
          className="w-full h-full object-contain"
          poster={video?.thumbnail_url || "https://res.cloudinary.com/demo/image/upload/samples/cld-sample-video.jpg"}
          playsInline
          preload="metadata"
          controls={false}
          onClick={togglePlay}
        />
        

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer group"
            onClick={togglePlay}
          >
            <div className="bg-black bg-opacity-50 rounded-full p-6 group-hover:bg-opacity-70 transition-all">
              <Play className="w-16 h-16 text-white fill-current" />
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none">
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={onClose}
                >
                  <X className="w-6 h-6" />
                </Button>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
              {/* Progress Bar */}
              <div 
                className={`w-full bg-gray-600 bg-opacity-50 rounded-full mb-4 cursor-pointer transition-all group ${
                  isSeekBarHovered ? 'h-2' : 'h-1'
                }`}
                onClick={handleProgressClick}
                onMouseEnter={() => setIsSeekBarHovered(true)}
                onMouseLeave={() => setIsSeekBarHovered(false)}
              >
                <div 
                  className="bg-red-500 h-full rounded-full transition-all relative"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, progressPercent))}%`,
                    minWidth: progressPercent > 0 ? '2px' : '0px'
                  }}
                >
                  {progressPercent > 0 && (
                    <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full transition-opacity ${
                      isSeekBarHovered ? 'opacity-100' : 'opacity-0'
                    }`} />
                  )}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 fill-current" />
                    )}
                  </Button>
                  
                  {onPrevious && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white hover:bg-opacity-20"
                      onClick={onPrevious}
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                  )}
                  
                  {onNext && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white hover:bg-opacity-20"
                      onClick={onNext}
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white hover:bg-opacity-20"
                      onClick={toggleMute}
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                    
                    <div 
                      className="w-20 bg-gray-600 bg-opacity-50 rounded-full h-1 cursor-pointer hover:h-2 transition-all"
                      onClick={handleVolumeClick}
                    >
                      <div 
                        className="bg-white h-full rounded-full transition-all"
                        style={{ width: `${volumePercent}%` }}
                      />
                    </div>
                  </div>
                  
                  <span className="text-white text-sm whitespace-nowrap">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side Panel (only in non-fullscreen mode) */}
      {!isFullscreen && (
        <div className="w-96 bg-dharma-dark border-l border-gray-700 flex flex-col">
          {/* Video Info */}
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white text-lg font-semibold mb-2 line-clamp-2">
              {video.title}
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm">
                <span>{video.views} views</span>
                <span className="mx-2">•</span>
                <span>{formatTime(video.duration)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-gray-700 ${isLiked ? 'text-red-500' : ''}`}
                  onClick={handleLike}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {video.likes + (isLiked ? 1 : 0)}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {video.tags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-dharma-gold bg-opacity-20 text-dharma-gold text-xs px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {showInfo && video.description && (
              <div className="text-gray-300 text-sm">
                <p className="line-clamp-3">{video.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-dharma-gold hover:bg-gray-700 p-0 mt-2"
                  onClick={() => setShowInfo(false)}
                >
                  Show less
                </Button>
              </div>
            )}
            
            {!showInfo && (
              <Button
                variant="ghost"
                size="sm"
                className="text-dharma-gold hover:bg-gray-700 p-0"
                onClick={() => setShowInfo(true)}
              >
                Show more
              </Button>
            )}
          </div>
          
          {/* Related Videos or Comments section could go here */}
          <div className="flex-1 p-4">
            <h3 className="text-white font-medium mb-4">Related Videos</h3>
            <div className="text-gray-400 text-sm">
              More videos from this category coming soon...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}