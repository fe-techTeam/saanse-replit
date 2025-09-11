import { useState, useRef, useEffect, useReducer, useCallback } from "react";
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
  MoreVertical,
  Repeat,
  Shuffle,
  Loader2,
  Subtitles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WatchLaterButton } from "@/components/WatchLaterButton";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { VideoType } from "@/types/video";
import { useAuth } from "@/hooks/useAuth";

interface YouTubeStylePlayerProps {
  video: VideoType | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  allVideos?: VideoType[];
  onVideoChange?: (video: VideoType) => void;
}

interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  isLiked: boolean;
  showInfo: boolean;
  playbackRate: number;
  isSeekBarHovered: boolean;
  isLoop: boolean;
  isRandom: boolean;
  isLoading: boolean;
  error: string | null;
  showSubtitles: boolean;
  currentPlaylist: VideoType[];
  currentPlaylistIndex: number;
}

type PlayerAction = 
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_SHOW_CONTROLS'; payload: boolean }
  | { type: 'SET_LIKED'; payload: boolean }
  | { type: 'SET_SHOW_INFO'; payload: boolean }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'SET_SEEKBAR_HOVERED'; payload: boolean }
  | { type: 'SET_LOOP'; payload: boolean }
  | { type: 'SET_RANDOM'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUBTITLES'; payload: boolean }
  | { type: 'SET_PLAYLIST'; payload: { playlist: VideoType[]; currentIndex: number } }
  | { type: 'SET_PLAYLIST_INDEX'; payload: number }
  | { type: 'RESET_PLAYER' };

const initialPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: false,
  showControls: true,
  isLiked: false,
  showInfo: true,
  playbackRate: 1,
  isSeekBarHovered: false,
  isLoop: false,
  isRandom: false,
  isLoading: true,
  error: null,
  showSubtitles: false,
  currentPlaylist: [],
  currentPlaylistIndex: -1,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload, isLoading: false };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_MUTED':
      return { ...state, isMuted: action.payload };
    case 'SET_FULLSCREEN':
      return { ...state, isFullscreen: action.payload };
    case 'SET_SHOW_CONTROLS':
      return { ...state, showControls: action.payload };
    case 'SET_LIKED':
      return { ...state, isLiked: action.payload };
    case 'SET_SHOW_INFO':
      return { ...state, showInfo: action.payload };
    case 'SET_PLAYBACK_RATE':
      return { ...state, playbackRate: action.payload };
    case 'SET_SEEKBAR_HOVERED':
      return { ...state, isSeekBarHovered: action.payload };
    case 'SET_LOOP':
      return { ...state, isLoop: action.payload };
    case 'SET_RANDOM':
      return { ...state, isRandom: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SUBTITLES':
      return { ...state, showSubtitles: action.payload };
    case 'SET_PLAYLIST':
      return { ...state, currentPlaylist: action.payload.playlist, currentPlaylistIndex: action.payload.currentIndex };
    case 'SET_PLAYLIST_INDEX':
      return { ...state, currentPlaylistIndex: action.payload };
    case 'RESET_PLAYER':
      return { ...initialPlayerState };
    default:
      return state;
  }
}

export function YouTubeStylePlayer({ 
  video, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious,
  allVideos = [],
  onVideoChange
}: YouTubeStylePlayerProps) {
  const [playerState, dispatch] = useReducer(playerReducer, initialPlayerState);
  const [isMobile, setIsMobile] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const cleanupRef = useRef<(() => void)[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const getVideoUrl = useCallback(() => {
    if (!video?.video_url) {
      return "https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4";
    }
    return video.video_url;
  }, [video?.video_url]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
  }, []);

  const runCleanups = useCallback(() => {
    cleanupRef.current.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup error:', error);
      }
    });
    cleanupRef.current = [];
  }, []);

  // Reset player state when video changes or player opens/closes
  useEffect(() => {
    if (!isOpen) {
      // When closing player, stop video and clean up
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
        videoEl.src = '';
        videoEl.load(); // Reset video element
      }
      runCleanups();
      dispatch({ type: 'RESET_PLAYER' });
      return;
    }

    if (video) {
      // When changing video, reset playback state completely
      console.log('Resetting video state for new video:', video.title);
      dispatch({ type: 'SET_TIME', payload: 0 });
      dispatch({ type: 'SET_DURATION', payload: 0 });
      dispatch({ type: 'SET_PLAYING', payload: false });
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_SHOW_CONTROLS', payload: true });
      dispatch({ type: 'SET_SEEKBAR_HOVERED', payload: false });
      
      // Reset video element properly
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
        // Don't reset src here as it will be set in the next effect
      }
      
      // Keep user preferences: loop, random, volume, muted, subtitles, etc.
    }
  }, [isOpen, video?.id, runCleanups]);

  // Fetch related videos from Supabase
  const { data: relatedVideos = [], isLoading: isLoadingRelated, error: relatedError } = useQuery<VideoType[]>({
    queryKey: ["/api/videos/related", video?.id, video?.category, JSON.stringify(video?.tags)],
    queryFn: async () => {
      if (!video) return [];
      
      const tagsArray = Array.isArray(video.tags) ? video.tags : [];
      const searchParams = new URLSearchParams();
      searchParams.set('category', video.category || 'Unknown');
      if (tagsArray.length > 0) {
        searchParams.set('tags', tagsArray.join(','));
      }
      searchParams.set('exclude', video.id);
      searchParams.set('limit', '12');
      
      const response = await apiRequest("GET", `/api/videos/related?${searchParams.toString()}`);
      const result = await response.json();
      return Array.isArray(result) ? result : [];
    },
    enabled: !!video && isOpen,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Build playlist when video changes or related videos are loaded
  useEffect(() => {
    if (!video || !isOpen) return;
    
    // Create playlist: current video + related videos
    const playlist = [video, ...relatedVideos];
    
    // Find current video index in the new playlist
    const currentIndex = playlist.findIndex(v => v.id === video.id);
    const finalIndex = currentIndex >= 0 ? currentIndex : 0;
    
    // Only update if playlist actually changed or current video changed
    const currentPlaylistIds = playerState.currentPlaylist.map(v => v.id).join(',');
    const newPlaylistIds = playlist.map(v => v.id).join(',');
    
    if (currentPlaylistIds !== newPlaylistIds || playerState.currentPlaylistIndex !== finalIndex) {
      console.log('Updating playlist:', {
        playlistLength: playlist.length,
        currentIndex: finalIndex,
        currentVideo: video.title
      });
      dispatch({ type: 'SET_PLAYLIST', payload: { playlist, currentIndex: finalIndex } });
    }
  }, [video?.id, relatedVideos, isOpen, playerState.currentPlaylist, playerState.currentPlaylistIndex]);


  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    addCleanup(() => window.removeEventListener('resize', checkMobile));
  }, [addCleanup]);

  // API mutations
  const viewMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("POST", `/api/videos/${videoId}/views`);
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("POST", `/api/videos/${videoId}/likes`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    },
  });

  const historyMutation = useMutation({
    mutationFn: async (data: { userId: string; videoId: string; progress: number }) => {
      await apiRequest("POST", "/api/history", data);
    },
  });

  // Track video views and history
  useEffect(() => {
    if (isOpen && video) {
      viewMutation.mutate(video.id);
      if (user) {
        historyMutation.mutate({
          userId: user.id,
          videoId: video.id,
          progress: 0,
        });
      }
    }
  }, [isOpen, video?.id, user?.id]);

  // Video element setup and autoplay
  useEffect(() => {
    if (!isOpen || !video) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    let isComponentMounted = true;

    const setupVideo = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        videoEl.load();

        const handleCanPlay = () => {
          if (!isComponentMounted) return;
          console.log('Video can play, attempting autoplay');
          dispatch({ type: 'SET_LOADING', payload: false });
          
          // Attempt autoplay
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                if (isComponentMounted) {
                  console.log('Autoplay successful');
                  dispatch({ type: 'SET_PLAYING', payload: true });
                }
              })
              .catch((error) => {
                console.log('Autoplay blocked:', error.message);
                if (isComponentMounted) {
                  dispatch({ type: 'SET_PLAYING', payload: false });
                }
              });
          }
        };

        const handleLoadedMetadata = () => {
          if (isComponentMounted && videoEl.duration) {
            dispatch({ type: 'SET_DURATION', payload: videoEl.duration });
          }
        };

        videoEl.addEventListener('canplay', handleCanPlay, { once: true });
        videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);

        // Handle subtitle track visibility
        const handleSubtitleChange = () => {
          const textTracks = videoEl.textTracks;
          if (textTracks && textTracks.length > 0) {
            for (let i = 0; i < textTracks.length; i++) {
              textTracks[i].mode = playerState.showSubtitles ? 'showing' : 'hidden';
            }
          }
        };

        // Set initial subtitle state
        handleSubtitleChange();

        addCleanup(() => {
          isComponentMounted = false;
          videoEl.removeEventListener('canplay', handleCanPlay);
          videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
        });
      } catch (error) {
        if (isComponentMounted) {
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load video' });
        }
      }
    };

    setupVideo();

    return () => {
      isComponentMounted = false;
    };
  }, [isOpen, video?.id, playerState.showSubtitles, addCleanup]);

  // Handle subtitle track visibility when showSubtitles changes
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !isOpen) return;

    const textTracks = videoEl.textTracks;
    if (textTracks && textTracks.length > 0) {
      for (let i = 0; i < textTracks.length; i++) {
        textTracks[i].mode = playerState.showSubtitles ? 'showing' : 'hidden';
      }
    }
  }, [playerState.showSubtitles, isOpen]);

  // Sync video element properties with player state
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !isOpen) return;

    // Sync volume and mute state
    if (Math.abs(videoEl.volume - playerState.volume) > 0.01) {
      videoEl.volume = playerState.volume;
    }
    if (videoEl.muted !== playerState.isMuted) {
      videoEl.muted = playerState.isMuted;
    }

    // Sync playback rate
    if (videoEl.playbackRate !== playerState.playbackRate) {
      videoEl.playbackRate = playerState.playbackRate;
    }

    console.log('Video element state synced:', {
      volume: videoEl.volume,
      muted: videoEl.muted,
      paused: videoEl.paused,
      currentTime: videoEl.currentTime,
      duration: videoEl.duration
    });
  }, [playerState.volume, playerState.isMuted, playerState.playbackRate, isOpen]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('Player state changed:', {
      isPlaying: playerState.isPlaying,
      isLoading: playerState.isLoading,
      error: playerState.error,
      currentTime: playerState.currentTime,
      duration: playerState.duration,
      playlistIndex: playerState.currentPlaylistIndex,
      playlistLength: playerState.currentPlaylist.length
    });
  }, [playerState.isPlaying, playerState.isLoading, playerState.error, playerState.currentTime, playerState.duration, playerState.currentPlaylistIndex, playerState.currentPlaylist.length]);

  // Video event listeners
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !isOpen) return;

    const updateTime = () => {
      if (videoEl && !isNaN(videoEl.currentTime)) {
        dispatch({ type: 'SET_TIME', payload: videoEl.currentTime });
      }
    };

    const updateDuration = () => {
      if (videoEl && !isNaN(videoEl.duration) && videoEl.duration > 0) {
        dispatch({ type: 'SET_DURATION', payload: videoEl.duration });
      }
    };

    const handlePlay = () => dispatch({ type: 'SET_PLAYING', payload: true });
    const handlePause = () => dispatch({ type: 'SET_PLAYING', payload: false });
    
    const handleEnded = () => {
      console.log('Video ended. Loop enabled:', playerState.isLoop);
      dispatch({ type: 'SET_PLAYING', payload: false });
      
      if (playerState.isLoop) {
        console.log('Restarting video for loop');
        // Small delay to ensure the ended event is fully processed
        setTimeout(() => {
          if (videoEl && !videoEl.paused) {
            return; // Already playing, avoid double restart
          }
          
          videoEl.currentTime = 0;
          dispatch({ type: 'SET_TIME', payload: 0 });
          
          // Start playing again
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Loop restart successful');
                dispatch({ type: 'SET_PLAYING', payload: true });
              })
              .catch(error => {
                console.warn('Loop playback error:', error);
                dispatch({ type: 'SET_PLAYING', payload: false });
              });
          }
        }, 100);
      } else {
        // Loop is disabled, play next video from playlist
        console.log('Loop disabled, attempting to play next video from playlist');
        setTimeout(() => {
          if (onNext) {
            // Use provided onNext if available (from parent playlist)
            console.log('Using provided onNext function');
            onNext();
          } else {
            // Use internal playlist navigation
            console.log('Using internal playlist navigation');
            handleNext();
          }
        }, 500); // Small delay for smooth transition
      }
    };

    const handleVolumeChange = () => {
      dispatch({ type: 'SET_VOLUME', payload: videoEl.volume });
      dispatch({ type: 'SET_MUTED', payload: videoEl.muted });
    };

    const handleError = () => {
      dispatch({ type: 'SET_ERROR', payload: 'Video playback error' });
      dispatch({ type: 'SET_PLAYING', payload: false });
    };

    const handleLoadStart = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
    };

    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    const events = [
      ['timeupdate', updateTime],
      ['loadedmetadata', updateDuration],
      ['durationchange', updateDuration],
      ['play', handlePlay],
      ['pause', handlePause],
      ['ended', handleEnded],
      ['volumechange', handleVolumeChange],
      ['error', handleError],
      ['loadstart', handleLoadStart],
      ['canplay', handleCanPlay],
    ] as const;

    events.forEach(([event, handler]) => {
      videoEl.addEventListener(event, handler);
    });

    addCleanup(() => {
      events.forEach(([event, handler]) => {
        videoEl.removeEventListener(event, handler);
      });
    });
  }, [isOpen, onNext, playerState.isLoop, relatedVideos, video?.id, onVideoChange, addCleanup]);

  // Handle loop state change - update video element loop attribute
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && isOpen) {
      videoEl.loop = false; // We handle loop manually for better control
    }
  }, [playerState.isLoop, isOpen]);

  // Auto-advance to next video when loop is disabled and we have related videos
  useEffect(() => {
    console.log('Playlist mode update:', {
      isLoop: playerState.isLoop,
      hasRelatedVideos: relatedVideos?.length > 0,
      currentVideo: video?.id,
      relatedCount: relatedVideos?.length
    });
  }, [playerState.isLoop, relatedVideos?.length, video?.id]);

  // Auto-hide controls with smooth transitions
  useEffect(() => {
    if (!isOpen) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      dispatch({ type: 'SET_SHOW_CONTROLS', payload: true });
      
      if (playerState.isPlaying && !isMobile) {
        controlsTimeoutRef.current = setTimeout(() => {
          dispatch({ type: 'SET_SHOW_CONTROLS', payload: false });
        }, 3000);
      }
    };

    resetControlsTimeout();

    const handleMouseMove = () => resetControlsTimeout();
    const handleMouseLeave = () => {
      if (playerState.isPlaying && !isMobile) {
        dispatch({ type: 'SET_SHOW_CONTROLS', payload: false });
      }
    };

    const handleTouch = () => {
      dispatch({ type: 'SET_SHOW_CONTROLS', payload: !playerState.showControls });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('touchstart', handleTouch);
    }

    addCleanup(() => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('touchstart', handleTouch);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    });
  }, [isOpen, playerState.isPlaying, playerState.showControls, isMobile, addCleanup]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent keyboard shortcuts when typing in input fields
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK': // Also support 'K' key like YouTube
          e.preventDefault();
          e.stopPropagation();
          console.log('Spacebar/K pressed, calling togglePlay');
          // Call togglePlay logic inline to avoid dependency issues
          {
            const videoEl = videoRef.current;
            if (!videoEl) {
              console.warn('Video element not found');
              return;
            }

            console.log('Toggle play called via keyboard. Current state:', playerState.isPlaying);
            console.log('Video element paused:', videoEl.paused);

            try {
              if (playerState.isPlaying || !videoEl.paused) {
                console.log('Attempting to pause video via keyboard');
                videoEl.pause();
                dispatch({ type: 'SET_PLAYING', payload: false });
              } else {
                console.log('Attempting to play video via keyboard');
                if (videoEl.readyState >= 2) {
                  const playPromise = videoEl.play();
                  if (playPromise !== undefined) {
                    playPromise
                      .then(() => {
                        console.log('Keyboard play successful');
                        dispatch({ type: 'SET_PLAYING', payload: true });
                      })
                      .catch((error) => {
                        console.error('Keyboard play error:', error);
                        dispatch({ type: 'SET_ERROR', payload: `Playback failed: ${error.message}` });
                        dispatch({ type: 'SET_PLAYING', payload: false });
                      });
                  }
                } else {
                  console.log('Video not ready for keyboard play');
                }
              }
            } catch (error) {
              console.error('Keyboard toggle error:', error);
            }
          }
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
        case 'KeyL':
          e.preventDefault();
          toggleLoop();
          break;
        case 'Escape':
          e.preventDefault();
          if (playerState.isFullscreen) {
            // First escape: exit fullscreen
            toggleFullscreen();
          } else {
            // Second escape: close player
            handleClose();
          }
          break;
        case 'KeyC':
          e.preventDefault();
          toggleSubtitles();
          break;
        case 'KeyN':
        case 'Period': // > key
          e.preventDefault();
          // Inline next logic
          {
            const { currentPlaylist, currentPlaylistIndex } = playerState;
            const canNext = currentPlaylist.length > 0 && 
                           (currentPlaylistIndex < currentPlaylist.length - 1 || playerState.isLoop);
            
            if (canNext) {
              if (onNext) {
                onNext();
              } else {
                const nextIndex = currentPlaylistIndex + 1;
                if (nextIndex < currentPlaylist.length) {
                  const nextVideo = currentPlaylist[nextIndex];
                  if (onVideoChange) {
                    onVideoChange(nextVideo);
                  }
                } else if (playerState.isLoop && currentPlaylist.length > 1) {
                  const firstVideo = currentPlaylist[0];
                  if (onVideoChange) {
                    onVideoChange(firstVideo);
                  }
                }
              }
            }
          }
          break;
        case 'KeyP':
        case 'Comma': // < key  
          e.preventDefault();
          // Inline previous logic
          {
            const { currentPlaylist, currentPlaylistIndex } = playerState;
            const canPrev = currentPlaylist.length > 0 && 
                           (currentPlaylistIndex > 0 || playerState.isLoop);
            
            if (canPrev) {
              if (onPrevious) {
                onPrevious();
              } else {
                const prevIndex = currentPlaylistIndex - 1;
                if (prevIndex >= 0) {
                  const prevVideo = currentPlaylist[prevIndex];
                  if (onVideoChange) {
                    onVideoChange(prevVideo);
                  }
                } else if (playerState.isLoop && currentPlaylist.length > 1) {
                  const lastIndex = currentPlaylist.length - 1;
                  const lastVideo = currentPlaylist[lastIndex];
                  if (onVideoChange) {
                    onVideoChange(lastVideo);
                  }
                }
              }
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    addCleanup(() => document.removeEventListener('keydown', handleKeyPress));
  }, [isOpen, playerState.isFullscreen, playerState.isPlaying, playerState.currentPlaylist, playerState.currentPlaylistIndex, playerState.isLoop, onNext, onPrevious, onVideoChange, addCleanup]);

  // Handle fullscreen change events from browser
  useEffect(() => {
    if (!isOpen) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (isCurrentlyFullscreen !== playerState.isFullscreen) {
        dispatch({ type: 'SET_FULLSCREEN', payload: isCurrentlyFullscreen });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    addCleanup(() => document.removeEventListener('fullscreenchange', handleFullscreenChange));
  }, [isOpen, playerState.isFullscreen, addCleanup]);

  const togglePlay = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl) {
      console.warn('Video element not found');
      return;
    }

    console.log('Toggle play called. Current state:', playerState.isPlaying);
    console.log('Video element paused:', videoEl.paused);
    console.log('Video element readyState:', videoEl.readyState);

    try {
      if (playerState.isPlaying || !videoEl.paused) {
        console.log('Attempting to pause video');
        videoEl.pause();
        dispatch({ type: 'SET_PLAYING', payload: false });
      } else {
        console.log('Attempting to play video');
        // Ensure video is ready
        if (videoEl.readyState >= 2) { // HAVE_CURRENT_DATA
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            await playPromise;
            dispatch({ type: 'SET_PLAYING', payload: true });
          }
        } else {
          console.log('Video not ready, waiting for canplay event');
          const waitForReady = () => {
            return new Promise<void>((resolve) => {
              const handleCanPlay = () => {
                videoEl.removeEventListener('canplay', handleCanPlay);
                resolve();
              };
              videoEl.addEventListener('canplay', handleCanPlay, { once: true });
            });
          };
          
          await waitForReady();
          const playPromise = videoEl.play();
          if (playPromise !== undefined) {
            await playPromise;
            dispatch({ type: 'SET_PLAYING', payload: true });
          }
        }
      }
    } catch (error) {
      console.error('Playback error:', error);
      dispatch({ type: 'SET_ERROR', payload: `Playback failed: ${error.message}` });
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  }, [playerState.isPlaying]);

  const skipTime = useCallback((seconds: number) => {
    const videoEl = videoRef.current;
    if (!videoEl || !playerState.duration) return;

    // Only allow backward seeking or staying at current time
    if (seconds <= 0) {
      const newTime = Math.max(0, videoEl.currentTime + seconds);
      videoEl.currentTime = newTime;
      dispatch({ type: 'SET_TIME', payload: newTime });
    }
  }, [playerState.duration]);

  const adjustVolume = useCallback((change: number) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const newVolume = Math.max(0, Math.min(1, playerState.volume + change));
    videoEl.volume = newVolume;
    dispatch({ type: 'SET_VOLUME', payload: newVolume });
    
    if (newVolume > 0) {
      videoEl.muted = false;
      dispatch({ type: 'SET_MUTED', payload: false });
    } else {
      dispatch({ type: 'SET_MUTED', payload: true });
    }
  }, [playerState.volume]);

  const toggleMute = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const newMuted = !playerState.isMuted;
    videoEl.muted = newMuted;
    dispatch({ type: 'SET_MUTED', payload: newMuted });
  }, [playerState.isMuted]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!playerState.isFullscreen && !document.fullscreenElement) {
        // Enter fullscreen
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        }
        // State will be updated by fullscreenchange event
      } else if (document.fullscreenElement) {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        // State will be updated by fullscreenchange event
      }
    } catch (error) {
      console.warn('Fullscreen error:', error);
      // Fallback: ensure state matches reality
      const isActuallyFullscreen = !!document.fullscreenElement;
      dispatch({ type: 'SET_FULLSCREEN', payload: isActuallyFullscreen });
    }
  }, [playerState.isFullscreen]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const videoEl = videoRef.current;
    if (!videoEl || !playerState.duration) return;

    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    const newTime = percentage * playerState.duration;
    
    // Only allow seeking backwards or to current position (no forward seeking)
    if (newTime <= playerState.currentTime) {
      videoEl.currentTime = newTime;
      dispatch({ type: 'SET_TIME', payload: newTime });
    }
  }, [playerState.currentTime, playerState.duration]);

  const handleVolumeClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newVolume = Math.max(0, Math.min(1, clickX / width));
    
    videoEl.volume = newVolume;
    dispatch({ type: 'SET_VOLUME', payload: newVolume });
    
    if (newVolume > 0) {
      videoEl.muted = false;
      dispatch({ type: 'SET_MUTED', payload: false });
    } else {
      dispatch({ type: 'SET_MUTED', payload: true });
    }
  }, []);

  const handleLike = useCallback(() => {
    if (!video) return;
    
    dispatch({ type: 'SET_LIKED', payload: !playerState.isLiked });
    likeMutation.mutate(video.id);
  }, [video?.id, playerState.isLiked, likeMutation]);

  const handleShare = useCallback(async () => {
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
      try {
        await navigator.clipboard.writeText(window.location.href);
        // You could add a toast notification here
      } catch (error) {
        console.warn('Failed to copy to clipboard');
      }
    }
  }, [video?.title, video?.description]);

  const toggleLoop = useCallback(() => {
    dispatch({ type: 'SET_LOOP', payload: !playerState.isLoop });
  }, [playerState.isLoop]);

  const toggleRandom = useCallback(() => {
    dispatch({ type: 'SET_RANDOM', payload: !playerState.isRandom });
  }, [playerState.isRandom]);

  const toggleSubtitles = useCallback(() => {
    dispatch({ type: 'SET_SUBTITLES', payload: !playerState.showSubtitles });
  }, [playerState.showSubtitles]);

  const handleRelatedVideoClick = useCallback((relatedVideo: VideoType) => {
    if (onVideoChange) {
      onVideoChange(relatedVideo);
    }
  }, [onVideoChange]);

  // Navigation functions for playlist
  const handleNext = useCallback(() => {
    const { currentPlaylist, currentPlaylistIndex } = playerState;
    
    if (currentPlaylist.length === 0) {
      console.log('No playlist available');
      return;
    }
    
    const nextIndex = currentPlaylistIndex + 1;
    
    if (nextIndex < currentPlaylist.length) {
      const nextVideo = currentPlaylist[nextIndex];
      console.log('Playing next video:', nextVideo.title);
      dispatch({ type: 'SET_PLAYLIST_INDEX', payload: nextIndex });
      if (onVideoChange) {
        onVideoChange(nextVideo);
      }
    } else {
      console.log('Reached end of playlist');
      // Optionally loop back to first video
      if (playerState.isLoop && currentPlaylist.length > 1) {
        const firstVideo = currentPlaylist[0];
        console.log('Looping back to first video:', firstVideo.title);
        dispatch({ type: 'SET_PLAYLIST_INDEX', payload: 0 });
        if (onVideoChange) {
          onVideoChange(firstVideo);
        }
      }
    }
  }, [playerState.currentPlaylist, playerState.currentPlaylistIndex, playerState.isLoop, onVideoChange]);
  
  const handlePrevious = useCallback(() => {
    const { currentPlaylist, currentPlaylistIndex } = playerState;
    
    if (currentPlaylist.length === 0) {
      console.log('No playlist available');
      return;
    }
    
    const prevIndex = currentPlaylistIndex - 1;
    
    if (prevIndex >= 0) {
      const prevVideo = currentPlaylist[prevIndex];
      console.log('Playing previous video:', prevVideo.title);
      dispatch({ type: 'SET_PLAYLIST_INDEX', payload: prevIndex });
      if (onVideoChange) {
        onVideoChange(prevVideo);
      }
    } else {
      console.log('Already at first video');
      // Optionally loop to last video
      if (playerState.isLoop && currentPlaylist.length > 1) {
        const lastIndex = currentPlaylist.length - 1;
        const lastVideo = currentPlaylist[lastIndex];
        console.log('Looping to last video:', lastVideo.title);
        dispatch({ type: 'SET_PLAYLIST_INDEX', payload: lastIndex });
        if (onVideoChange) {
          onVideoChange(lastVideo);
        }
      }
    }
  }, [playerState.currentPlaylist, playerState.currentPlaylistIndex, playerState.isLoop, onVideoChange]);
  
  // Helper functions to determine button states
  const canGoNext = useCallback(() => {
    const { currentPlaylist, currentPlaylistIndex } = playerState;
    return currentPlaylist.length > 0 && 
           (currentPlaylistIndex < currentPlaylist.length - 1 || playerState.isLoop);
  }, [playerState.currentPlaylist, playerState.currentPlaylistIndex, playerState.isLoop]);
  
  const canGoPrevious = useCallback(() => {
    const { currentPlaylist, currentPlaylistIndex } = playerState;
    return currentPlaylist.length > 0 && 
           (currentPlaylistIndex > 0 || playerState.isLoop);
  }, [playerState.currentPlaylist, playerState.currentPlaylistIndex, playerState.isLoop]);


  const formatTime = useCallback((time: number) => {
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
  }, []);

  // Global cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.pause();
        videoEl.removeAttribute('src');
        videoEl.load();
      }
      
      // Clear all timeouts
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      // Exit fullscreen if active
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      
      runCleanups();
    };
  }, [runCleanups]);

  // Handle proper cleanup when onClose is called
  const handleClose = useCallback(() => {
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    
    onClose();
  }, [onClose]);

  if (!isOpen || !video) {
    return null;
  }

  // Safe calculations for UI
  const progressPercent = (playerState.duration > 0 && !isNaN(playerState.duration) && !isNaN(playerState.currentTime)) 
    ? Math.max(0, Math.min(100, (playerState.currentTime / playerState.duration) * 100))
    : 0;
  const volumePercent = playerState.volume * 100;
  
  // Determine cursor style for seekbar based on hover position
  const getSeekbarCursor = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const potentialTime = percentage * playerState.duration;
    return potentialTime <= playerState.currentTime ? 'pointer' : 'not-allowed';
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 bg-black z-50 transition-all duration-300 ${playerState.isFullscreen ? '' : isMobile ? 'flex flex-col' : 'flex'}`}
    >
      {/* Video Container */}
      <div className={`relative flex items-center justify-center ${isMobile && !playerState.isFullscreen ? 'h-[40vh]' : 'flex-1'}`}>
        {/* Loading Overlay */}
        {playerState.isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {playerState.error && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="text-red-500 text-6xl">⚠️</div>
              <p className="text-white text-lg">{playerState.error}</p>
              <Button
                onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
                className="bg-red-600 hover:bg-red-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
          src={getVideoUrl()}
          className="w-full h-full object-contain transition-opacity duration-300"
          poster={video?.thumbnail_url || "https://res.cloudinary.com/demo/image/upload/samples/cld-sample-video.jpg"}
          playsInline
          preload="metadata"
          controls={false}
          onClick={(e) => {
            e.preventDefault();
            console.log('Video clicked, calling togglePlay');
            togglePlay();
          }}
          onKeyDown={(e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
              e.preventDefault();
              console.log('Video key pressed:', e.code);
              togglePlay();
            }
          }}
          style={{ opacity: playerState.isLoading ? 0 : 1 }}
          crossOrigin="anonymous"
          tabIndex={0}
        >
          {/* Add subtitle tracks here when available */}
          {video?.subtitle_url && (
            <track
              kind="subtitles"
              src={video.subtitle_url}
              srcLang="hi"
              label="Hindi"
              default={playerState.showSubtitles}
            />
          )}
        </video>
        
        {/* Subtitles Indicator */}
        {playerState.showSubtitles && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
            CC ON
          </div>
        )}
        

        {/* Play/Pause Overlay */}
        {!playerState.isPlaying && !playerState.isLoading && !playerState.error && (
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer group transition-opacity duration-300"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Play overlay clicked');
              togglePlay();
            }}
          >
            <div className="bg-black bg-opacity-50 rounded-full p-6 group-hover:bg-opacity-70 transition-all transform group-hover:scale-110">
              <Play className="w-16 h-16 text-white fill-current" />
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        {(playerState.showControls || !playerState.isPlaying || isMobile) && !playerState.isLoading && !playerState.error && (
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none transition-opacity duration-300 ${
            playerState.showControls || !playerState.isPlaying || isMobile ? 'opacity-100' : 'opacity-0'
          }`}>
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 pointer-events-auto">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                  onClick={handleClose}
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
              {/* Progress Bar - Only allows backward seeking */}
              <div 
                className={`w-full bg-gray-600 bg-opacity-50 rounded-full mb-4 transition-all group relative ${
                  playerState.isSeekBarHovered ? 'h-2' : 'h-1'
                }`}
                onClick={handleProgressClick}
                onMouseEnter={() => dispatch({ type: 'SET_SEEKBAR_HOVERED', payload: true })}
                onMouseLeave={() => dispatch({ type: 'SET_SEEKBAR_HOVERED', payload: false })}
                onMouseMove={(e) => {
                  e.currentTarget.style.cursor = getSeekbarCursor(e);
                }}
              >
                <div 
                  className="bg-red-500 h-full rounded-full transition-all relative"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, progressPercent))}%`,
                    minWidth: progressPercent > 0 ? '2px' : '0px'
                  }}
                >
                  {/* Seekbar Handle */}
                  {progressPercent > 0 && (
                    <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full transition-all duration-200 shadow-lg ${
                      playerState.isSeekBarHovered ? 'opacity-100 scale-125' : 'opacity-0'
                    }`} />
                  )}
                </div>
                
                {/* Buffered Progress (placeholder - can be enhanced later) */}
                <div 
                  className="absolute top-0 left-0 h-full bg-gray-400 bg-opacity-30 rounded-full transition-all"
                  style={{ width: `${Math.min(100, progressPercent + 10)}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Previous Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 transform hover:scale-110 ${
                      !canGoPrevious() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={onPrevious || handlePrevious}
                    disabled={!canGoPrevious()}
                    title={`Previous video (P) - ${playerState.currentPlaylistIndex > 0 ? 'Previous video' : playerState.isLoop ? 'Last video' : 'No previous video'}`}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  
                  {/* Play/Pause Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 transform hover:scale-110"
                    onClick={togglePlay}
                  >
                    {playerState.isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 fill-current" />
                    )}
                  </Button>
                  
                  {/* Next Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 transform hover:scale-110 ${
                      !canGoNext() ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={onNext || handleNext}
                    disabled={!canGoNext()}
                    title={`Next video (N) - ${playerState.currentPlaylistIndex < playerState.currentPlaylist.length - 1 ? 'Next video' : playerState.isLoop ? 'First video' : 'No next video'}`}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                  
                  {/* Loop Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 ${
                      playerState.isLoop ? 'text-red-500 bg-red-500 bg-opacity-20' : ''
                    }`}
                    onClick={toggleLoop}
                    title="Loop"
                  >
                    <Repeat className="w-5 h-5" />
                  </Button>
                  
                  {/* Random Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 ${
                      playerState.isRandom ? 'text-red-500 bg-red-500 bg-opacity-20' : ''
                    }`}
                    onClick={toggleRandom}
                    title="Random"
                  >
                    <Shuffle className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white hover:bg-opacity-20"
                      onClick={toggleMute}
                    >
                      {playerState.isMuted || playerState.volume === 0 ? (
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
                  
                  <span className="text-white text-sm whitespace-nowrap font-mono">
                    {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Subtitles/CC Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 ${
                      playerState.showSubtitles ? 'text-white bg-white bg-opacity-20' : ''
                    }`}
                    onClick={toggleSubtitles}
                    title="Toggle Subtitles (C)"
                  >
                    <Subtitles className="w-5 h-5" />
                  </Button>
                  
                  {/* Fullscreen Toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                    onClick={toggleFullscreen}
                    title={playerState.isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                  >
                    {playerState.isFullscreen ? (
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

      {/* Side Panel (desktop) or Bottom Panel (mobile) - only in non-fullscreen mode */}
      {!playerState.isFullscreen && (
        <div className={`bg-gray-900 flex flex-col transition-all duration-300 ${
          isMobile 
            ? 'flex-1 border-t border-gray-700' 
            : 'w-96 border-l border-gray-700'
        }`}>
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
                {/* Watch Later Button */}
                <WatchLaterButton 
                  video={video} 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-gray-700 transition-colors duration-200"
                  showText={false}
                />
                
                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-gray-700 transition-colors duration-200 ${
                    playerState.isLiked ? 'text-red-500' : ''
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`w-4 h-4 mr-1 ${playerState.isLiked ? 'fill-current' : ''}`} />
                  {video.likes + (playerState.isLiked ? 1 : 0)}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-700 transition-colors duration-200 flex items-center"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {video.tags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            {playerState.showInfo && video.description && (
              <div className="text-gray-300 text-sm transition-all duration-300">
                <p className="line-clamp-3">{video.description}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-dharma-gold hover:bg-gray-700 p-0 mt-2 transition-colors duration-200"
                  onClick={() => dispatch({ type: 'SET_SHOW_INFO', payload: false })}
                >
                  Show less
                </Button>
              </div>
            )}
            
            {!playerState.showInfo && (
              <Button
                variant="ghost"
                size="sm"
                className="text-dharma-gold hover:bg-gray-700 p-0 transition-colors duration-200"
                onClick={() => dispatch({ type: 'SET_SHOW_INFO', payload: true })}
              >
                Show more
              </Button>
            )}
          </div>
          
          {/* Related Videos */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">
                Related Videos
              </h3>
            </div>
            
            {isLoadingRelated ? (
              <div className="space-y-4">
                <div className="text-gray-400 text-sm mb-2">Loading related videos...</div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-800 rounded-lg mb-2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : relatedError ? (
              <div className="text-center py-8">
                <div className="text-red-400 text-sm mb-2">Error loading related videos</div>
                <p className="text-gray-500 text-xs">{relatedError instanceof Error ? relatedError.message : 'Unknown error'}</p>
                <div className="text-gray-600 text-xs mt-2">
                  Video ID: {video?.id}<br/>
                  Category: {video?.category}<br/>
                  Tags: {JSON.stringify(video?.tags)}
                </div>
              </div>
            ) : playerState.currentPlaylist.length > 0 ? (
              <div className="space-y-4 animate-fade-in">
                {playerState.currentPlaylist.map((playlistVideo, index) => {
                  const isCurrentlyPlaying = playlistVideo.id === video?.id;
                  const playlistIndex = index;
                  return (
                  <div
                    key={playlistVideo.id}
                    className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] rounded-lg p-2 relative hover:bg-gray-800 hover:bg-opacity-50"
                    onClick={() => handleRelatedVideoClick(playlistVideo)}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      animation: 'fadeInUp 0.6s ease-out forwards'
                    }}
                  >
                    {/* 16:9 Aspect Ratio Thumbnail Card */}
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 mb-3 shadow-md">
                      <img
                        src={playlistVideo.thumbnail_url}
                        alt={playlistVideo.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "https://res.cloudinary.com/demo/image/upload/samples/cld-sample-video.jpg";
                        }}
                      />
                      
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">
                        {formatTime(playlistVideo.duration)}
                      </div>
                      
                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <div className="bg-red-600 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-lg">
                          <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                      </div>
                      
                      {/* View Count Badge */}
                      <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">
                        {playlistVideo.views} views
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium line-clamp-2 leading-5 transition-colors duration-200 text-white group-hover:text-red-400">
                        {playlistVideo.title}
                      </h4>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs font-medium">
                          {playlistVideo.category}
                        </p>
                        <div className="text-gray-500 text-xs flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{playlistVideo.likes}</span>
                        </div>
                      </div>
                      
                      {/* Common Tags */}
                      {playlistVideo.tags.filter(tag => video?.tags?.includes(tag)).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {playlistVideo.tags
                            .filter(tag => video?.tags?.includes(tag))
                            .slice(0, 2)
                            .map(tag => (
                              <span
                                key={tag}
                                className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium transition-colors duration-200 hover:bg-red-700"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
                
                {/* Show message if only current video in playlist */}
                {playerState.currentPlaylist.length === 1 && (
                  <div className="text-center py-4 animate-fade-in">
                    <div className="text-gray-400 text-sm mb-2">
                      Single video mode
                    </div>
                    <p className="text-gray-500 text-xs">
                      Related videos will appear here when available
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 animate-fade-in">
                <div className="text-6xl mb-4 opacity-50">🎥</div>
                <div className="text-gray-400 text-sm mb-2">
                  No related videos found in "{video?.category}" category
                </div>
                <p className="text-gray-500 text-xs mb-4">
                  {video?.tags && video.tags.length > 0 
                    ? `We're looking for videos similar to: ${video.tags.join(', ')}` 
                    : 'Be the first to discover content in this category!'}
                </p>
                <div className="text-dharma-gold text-xs bg-dharma-gold bg-opacity-10 p-3 rounded-lg">
                  More {video?.category} videos will appear here as content grows
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Add these styles to your global CSS or Tailwind config
// @keyframes fadeInUp {
//   from {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
//
// @keyframes fade-in {
//   from { opacity: 0; }
//   to { opacity: 1; }
// }
//
// .animate-fade-in {
//   animation: fade-in 0.5s ease-out;
// }