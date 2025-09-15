import { useState, useRef, useEffect, useReducer, useCallback, useMemo } from "react";
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
  Settings,
  MoreVertical,
  Repeat,
  Shuffle,
  Loader2,
  Subtitles,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaylistModal } from "@/components/PlaylistModal";
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
  playbackRate: number;
  isSeekBarHovered: boolean;
  isLoop: boolean;
  isRandom: boolean;
  isLoading: boolean;
  error: string | null;
  showSubtitles: boolean;
  currentPlaylist: VideoType[];
  currentPlaylistIndex: number;
  showPlaylistModal: boolean;
  canPlay: boolean;
  hasAttemptedPlay: boolean;
  playbackError: string | null;
}

type PlayerAction = 
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_MUTED'; payload: boolean }
  | { type: 'SET_FULLSCREEN'; payload: boolean }
  | { type: 'SET_SHOW_CONTROLS'; payload: boolean }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'SET_SEEKBAR_HOVERED'; payload: boolean }
  | { type: 'SET_LOOP'; payload: boolean }
  | { type: 'SET_RANDOM'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUBTITLES'; payload: boolean }
  | { type: 'SET_PLAYLIST'; payload: { playlist: VideoType[]; currentIndex: number } }
  | { type: 'SET_PLAYLIST_INDEX'; payload: number }
  | { type: 'SET_PLAYLIST_MODAL'; payload: boolean }
  | { type: 'SET_CAN_PLAY'; payload: boolean }
  | { type: 'SET_HAS_ATTEMPTED_PLAY'; payload: boolean }
  | { type: 'SET_PLAYBACK_ERROR'; payload: string | null }
  | { type: 'RESET_PLAYER' };

const initialPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  isFullscreen: true,
  showControls: true,
  playbackRate: 1,
  isSeekBarHovered: false,
  isLoop: false,
  isRandom: false,
  isLoading: false,
  error: null,
  showSubtitles: false,
  currentPlaylist: [],
  currentPlaylistIndex: -1,
  showPlaylistModal: false,
  canPlay: false,
  hasAttemptedPlay: false,
  playbackError: null,
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
    case 'SET_PLAYLIST_MODAL':
      return { ...state, showPlaylistModal: action.payload };
    case 'SET_CAN_PLAY':
      return { ...state, canPlay: action.payload };
    case 'SET_HAS_ATTEMPTED_PLAY':
      return { ...state, hasAttemptedPlay: action.payload };
    case 'SET_PLAYBACK_ERROR':
      return { ...state, playbackError: action.payload, error: action.payload };
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const cleanupRef = useRef<(() => void)[]>([]);
  const lastVideoIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Memoize video URL to prevent multiple requests
  const videoUrl = useMemo(() => {
    if (!video?.video_url) {
      console.warn('No video URL provided, using fallback');
      return "https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4";
    }
    
    // Validate URL format
    try {
      new URL(video.video_url);
      return video.video_url;
    } catch (error) {
      console.error('Invalid video URL format:', video.video_url, 'Using fallback');
      return "https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4";
    }
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
      if (videoEl && videoEl.src) {
        videoEl.pause();
        videoEl.currentTime = 0;
        videoEl.removeAttribute('src');
        videoEl.load();
      }
      runCleanups();
      dispatch({ type: 'RESET_PLAYER' });
      return;
    }

    if (video && isOpen) {
      // When changing video, reset playback state
      dispatch({ type: 'SET_TIME', payload: 0 });
      dispatch({ type: 'SET_DURATION', payload: 0 });
      dispatch({ type: 'SET_PLAYING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_SHOW_CONTROLS', payload: true });
      dispatch({ type: 'SET_FULLSCREEN', payload: true });
      dispatch({ type: 'SET_CAN_PLAY', payload: false });
      dispatch({ type: 'SET_HAS_ATTEMPTED_PLAY', payload: false });
      dispatch({ type: 'SET_PLAYBACK_ERROR', payload: null });
    }
  }, [isOpen, video?.id, runCleanups]);


  // Monitor network status
  useEffect(() => {
    if (!isOpen) return;
    
    const handleOnline = () => {
      setIsOnline(true);
      // Only retry if we actually have a network-related error
      if (playerState.playbackError?.includes('Network') && video && !playerState.isPlaying) {
        dispatch({ type: 'SET_PLAYBACK_ERROR', payload: null });
        dispatch({ type: 'SET_HAS_ATTEMPTED_PLAY', payload: false });
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      if (playerState.isPlaying) {
        dispatch({ type: 'SET_PLAYBACK_ERROR', payload: 'No internet connection' });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    addCleanup(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    });
  }, [isOpen, video?.id, playerState.playbackError, playerState.isPlaying, addCleanup]);

  // API mutations
  const viewMutation = useMutation({
    mutationFn: async (videoId: string) => {
      await apiRequest("POST", `/api/videos/${videoId}/views`);
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

  // Video element setup with enhanced error handling and fallbacks
  useEffect(() => {
    if (!isOpen || !video) return;

    const videoEl = videoRef.current;
    if (!videoEl) return;

    let isComponentMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    let isSetupComplete = false;
    let hasSetSource = false;

    const setupVideo = async () => {
      // Skip if already setup for this video
      if (isSetupComplete || lastVideoIdRef.current === video.id) return;
      
      try {
        // Set video source with error handling
        const currentVideoUrl = videoUrl;
        
        // Only set source if it's actually different
        if (videoEl.src !== currentVideoUrl) {
          console.log('Setting up new video:', video.title, currentVideoUrl);
          lastVideoIdRef.current = video.id;
          hasSetSource = true;
          dispatch({ type: 'SET_LOADING', payload: true });
          
          // Clear existing source first to prevent conflicts
          if (videoEl.src) {
            videoEl.removeAttribute('src');
            videoEl.load();
          }
          
          // Set new source
          videoEl.src = currentVideoUrl;
          videoEl.preload = 'auto';
          videoEl.crossOrigin = 'anonymous';
          videoEl.load();
        }

        const handleCanPlay = async () => {
          if (!isComponentMounted || isSetupComplete) return;
          
          dispatch({ type: 'SET_LOADING', payload: false });
          dispatch({ type: 'SET_CAN_PLAY', payload: true });
          isSetupComplete = true;
          
          // Attempt autoplay with retry logic
          await attemptAutoplay();
        };

        const attemptAutoplay = async () => {
          if (!isComponentMounted) return;
          
          dispatch({ type: 'SET_HAS_ATTEMPTED_PLAY', payload: true });

          try {
            // Ensure video is in a playable state
            if (videoEl.readyState < 3) { // HAVE_FUTURE_DATA
              console.log('Video not ready for playback, waiting...');
              return;
            }

            const playPromise = videoEl.play();
            if (playPromise !== undefined) {
              await playPromise;
              if (isComponentMounted) {
                console.log('Autoplay successful');
                dispatch({ type: 'SET_PLAYING', payload: true });
                dispatch({ type: 'SET_PLAYBACK_ERROR', payload: null });
              }
            }
          } catch (error: any) {
            console.warn('Autoplay failed:', error.message);
            if (isComponentMounted) {
              // Handle different types of autoplay errors
              if (error.name === 'NotAllowedError') {
                console.log('Autoplay blocked by browser policy - user interaction required');
                dispatch({ type: 'SET_PLAYING', payload: false });
                dispatch({ type: 'SET_PLAYBACK_ERROR', payload: null }); // Don't show error for autoplay block
              } else if (error.name === 'AbortError') {
                console.log('Playback aborted - possibly due to new load');
                dispatch({ type: 'SET_PLAYING', payload: false });
              } else {
                // Retry for network or other errors
                if (retryCount < maxRetries) {
                  retryCount++;
                  console.log(`Retrying playback (${retryCount}/${maxRetries})...`);
                  setTimeout(() => {
                    if (isComponentMounted) {
                      dispatch({ type: 'SET_HAS_ATTEMPTED_PLAY', payload: false });
                      attemptAutoplay();
                    }
                  }, 1000 * retryCount);
                } else {
                  dispatch({ type: 'SET_PLAYBACK_ERROR', payload: `Playback failed: ${error.message}` });
                }
              }
            }
          }
        };

        const handleLoadedMetadata = () => {
          if (isComponentMounted && videoEl.duration && !isNaN(videoEl.duration) && !isSetupComplete) {
            dispatch({ type: 'SET_DURATION', payload: videoEl.duration });
          }
        };

        const handleLoadedData = () => {
          if (isComponentMounted) {
            console.log('Video data loaded - ready for playback');
          }
        };

        const handleError = (event: Event) => {
          if (!isComponentMounted) return;
          
          const error = (event.target as HTMLVideoElement)?.error;
          let errorMessage = 'Video playback error';
          
          if (error) {
            switch (error.code) {
              case error.MEDIA_ERR_ABORTED:
                errorMessage = 'Video playback aborted';
                break;
              case error.MEDIA_ERR_NETWORK:
                errorMessage = 'Network error while loading video';
                break;
              case error.MEDIA_ERR_DECODE:
                errorMessage = 'Video decoding error';
                break;
              case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'Video format not supported';
                break;
              default:
                errorMessage = `Video error (${error.code})`;
            }
          }
          
          console.error('Video error:', errorMessage, error);
          dispatch({ type: 'SET_PLAYBACK_ERROR', payload: errorMessage });
          dispatch({ type: 'SET_LOADING', payload: false });
        };

        const handleWaiting = () => {
          if (isComponentMounted) {
            dispatch({ type: 'SET_LOADING', payload: true });
          }
        };

        const handlePlaying = () => {
          if (isComponentMounted) {
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({ type: 'SET_PLAYING', payload: true });
          }
        };

        const handlePause = () => {
          if (isComponentMounted) {
            dispatch({ type: 'SET_PLAYING', payload: false });
          }
        };

        // Add all event listeners - only if not already added
        if (!isSetupComplete) {
          videoEl.addEventListener('canplay', handleCanPlay, { once: true });
          videoEl.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          videoEl.addEventListener('loadeddata', handleLoadedData, { once: true });
          videoEl.addEventListener('error', handleError);
          videoEl.addEventListener('waiting', handleWaiting);
          videoEl.addEventListener('playing', handlePlaying);
          videoEl.addEventListener('pause', handlePause);
        }

        // Handle subtitle track visibility
        const handleSubtitleChange = () => {
          const textTracks = videoEl.textTracks;
          if (textTracks && textTracks.length > 0) {
            for (let i = 0; i < textTracks.length; i++) {
              textTracks[i].mode = playerState.showSubtitles ? 'showing' : 'hidden';
            }
          }
        };

        handleSubtitleChange();

        addCleanup(() => {
          isComponentMounted = false;
          isSetupComplete = false;
          hasSetSource = false;
          lastVideoIdRef.current = null;
          videoEl.removeEventListener('canplay', handleCanPlay);
          videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
          videoEl.removeEventListener('loadeddata', handleLoadedData);
          videoEl.removeEventListener('error', handleError);
          videoEl.removeEventListener('waiting', handleWaiting);
          videoEl.removeEventListener('playing', handlePlaying);
          videoEl.removeEventListener('pause', handlePause);
        });

      } catch (error: any) {
        console.error('Video setup error:', error);
        if (isComponentMounted) {
          dispatch({ type: 'SET_PLAYBACK_ERROR', payload: `Setup failed: ${error.message}` });
        }
      }
    };

    setupVideo();

    return () => {
      isComponentMounted = false;
      isSetupComplete = false;
      hasSetSource = false;
    };
  }, [isOpen, video?.id, addCleanup]);

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
  }, [playerState.volume, playerState.isMuted, playerState.playbackRate, isOpen]);


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

    const handleError = (event: Event) => {
      const target = event.target as HTMLVideoElement;
      const error = target?.error;
      
      let errorMessage = 'Video playback error';
      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = 'Video playback was aborted';
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error occurred';
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = 'Video decoding failed';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Video format not supported';
            break;
          default:
            errorMessage = `Video error (code: ${error.code})`;
        }
      }
      
      console.error('Video playback error:', errorMessage, error);
      dispatch({ type: 'SET_PLAYBACK_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_PLAYING', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
    };



    const events = [
      ['timeupdate', updateTime],
      ['loadedmetadata', updateDuration],
      ['durationchange', updateDuration],
      ['ended', handleEnded],
      ['volumechange', handleVolumeChange],
      ['error', handleError],
    ] as const;

    events.forEach(([event, handler]) => {
      videoEl.addEventListener(event, handler);
    });

    addCleanup(() => {
      events.forEach(([event, handler]) => {
        videoEl.removeEventListener(event, handler);
      });
    });
  }, [isOpen, onNext, playerState.isLoop, video?.id, onVideoChange, addCleanup]);

  // Handle loop state change - update video element loop attribute
  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && isOpen) {
      videoEl.loop = false; // We handle loop manually for better control
    }
  }, [playerState.isLoop, isOpen]);


  // Auto-hide controls with smooth transitions
  useEffect(() => {
    if (!isOpen) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      dispatch({ type: 'SET_SHOW_CONTROLS', payload: true });
      
      if (playerState.isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          dispatch({ type: 'SET_SHOW_CONTROLS', payload: false });
        }, 3000);
      }
    };

    resetControlsTimeout();

    const handleMouseMove = () => resetControlsTimeout();
    const handleMouseLeave = () => {
      if (playerState.isPlaying) {
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
  }, [isOpen, playerState.isPlaying, playerState.showControls, addCleanup]);

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

    console.log('Toggle play called. Current state:', {
      isPlaying: playerState.isPlaying,
      paused: videoEl.paused,
      readyState: videoEl.readyState,
      canPlay: playerState.canPlay,
      hasError: !!playerState.playbackError
    });

    try {
      dispatch({ type: 'SET_PLAYBACK_ERROR', payload: null });

      if (playerState.isPlaying || !videoEl.paused) {
        console.log('Pausing video');
        videoEl.pause();
        dispatch({ type: 'SET_PLAYING', payload: false });
        return;
      }

      // Attempt to play
      console.log('Attempting to play video');

      // Check if video is ready for playback
      if (videoEl.readyState < 2) { // Less than HAVE_CURRENT_DATA
        console.log('Video not ready, waiting...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Video loading timeout'));
          }, 10000); // 10 second timeout

          const handleCanPlay = () => {
            cleanup();
            resolve();
          };

          const handleError = () => {
            cleanup();
            reject(new Error('Video loading failed'));
          };

          const cleanup = () => {
            clearTimeout(timeout);
            videoEl.removeEventListener('canplay', handleCanPlay);
            videoEl.removeEventListener('error', handleError);
          };

          videoEl.addEventListener('canplay', handleCanPlay, { once: true });
          videoEl.addEventListener('error', handleError, { once: true });
        });

        dispatch({ type: 'SET_LOADING', payload: false });
      }

      // Now attempt playback
      const playPromise = videoEl.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Playback successful');
        dispatch({ type: 'SET_PLAYING', payload: true });
        dispatch({ type: 'SET_PLAYBACK_ERROR', payload: null });
      } else {
        console.warn('Play promise undefined - old browser?');
        // For older browsers that don't return a promise
        setTimeout(() => {
          if (!videoEl.paused) {
            dispatch({ type: 'SET_PLAYING', payload: true });
          }
        }, 100);
      }

    } catch (error: any) {
      console.error('Toggle play error:', error);
      
      let errorMessage = error.message || 'Unknown playback error';
      
      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Playback requires user interaction';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Video format not supported';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Playback was interrupted';
        // Don't show error for abort - usually means user changed video
        return;
      }

      dispatch({ type: 'SET_PLAYBACK_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_PLAYING', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [playerState.isPlaying, playerState.canPlay, playerState.playbackError]);

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


  const toggleLoop = useCallback(() => {
    dispatch({ type: 'SET_LOOP', payload: !playerState.isLoop });
  }, [playerState.isLoop]);

  const toggleRandom = useCallback(() => {
    dispatch({ type: 'SET_RANDOM', payload: !playerState.isRandom });
  }, [playerState.isRandom]);

  const toggleSubtitles = useCallback(() => {
    dispatch({ type: 'SET_SUBTITLES', payload: !playerState.showSubtitles });
  }, [playerState.showSubtitles]);

  const togglePlaylistModal = useCallback(() => {
    dispatch({ type: 'SET_PLAYLIST_MODAL', payload: !playerState.showPlaylistModal });
  }, [playerState.showPlaylistModal]);


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
      className="fixed inset-0 bg-black z-50"
    >
      {/* Video Container - Always Fullscreen */}
      <div className="relative flex items-center justify-center h-full w-full">
        {/* Loading Overlay */}
        {playerState.isLoading && !playerState.error && !playerState.playbackError && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white text-sm">
                {!playerState.canPlay ? 'Loading video...' : 'Buffering...'}
              </p>
              <p className="text-gray-400 text-xs">
                {video?.title}
              </p>
              {!isOnline && (
                <p className="text-orange-400 text-xs">
                  ⚠️ No internet connection
                </p>
              )}
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {(playerState.error || playerState.playbackError) && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4 max-w-md mx-auto p-6">
              <div className="text-red-500 text-6xl">⚠️</div>
              <h3 className="text-white text-xl font-semibold">Playback Error</h3>
              <p className="text-gray-300 text-center leading-relaxed">
                {playerState.playbackError || playerState.error}
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    dispatch({ type: 'SET_ERROR', payload: null });
                    dispatch({ type: 'SET_PLAYBACK_ERROR', payload: null });
                    dispatch({ type: 'SET_HAS_ATTEMPTED_PLAY', payload: false });
                    // Reload the video
                    const videoEl = videoRef.current;
                    if (videoEl) {
                      videoEl.load();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Retry Video
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // Try with fallback URL
                    const videoEl = videoRef.current;
                    if (videoEl) {
                      videoEl.src = "https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4";
                      videoEl.load();
                      dispatch({ type: 'SET_ERROR', payload: null });
                      dispatch({ type: 'SET_PLAYBACK_ERROR', payload: null });
                      dispatch({ type: 'SET_HAS_ATTEMPTED_PLAY', payload: false });
                    }
                  }}
                  className="border-gray-400 text-white hover:bg-gray-700"
                >
                  Load Demo Video
                </Button>
              </div>
              
              <p className="text-gray-500 text-xs text-center">
                If the problem persists, try refreshing the page or check your internet connection.
              </p>
            </div>
          </div>
        )}
        <video
          ref={videoRef}
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
        {(playerState.showControls || !playerState.isPlaying) && !playerState.isLoading && !playerState.error && (
          <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none transition-opacity duration-300 ${
            playerState.showControls || !playerState.isPlaying ? 'opacity-100' : 'opacity-0'
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
                  
                  {/* Playlist Toggle - Only show if video is part of a series */}
                  {video?.series_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 ${
                        playerState.showPlaylistModal ? 'text-white bg-white bg-opacity-20' : ''
                      }`}
                      onClick={togglePlaylistModal}
                      title="Episodes List"
                    >
                      <List className="w-5 h-5" />
                    </Button>
                  )}
                  
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

      {/* Playlist Modal */}
      {video && playerState.showPlaylistModal && (
        <PlaylistModal
          isOpen={playerState.showPlaylistModal}
          onClose={() => dispatch({ type: 'SET_PLAYLIST_MODAL', payload: false })}
          currentVideo={video}
          onVideoSelect={(selectedVideo) => {
            if (onVideoChange) {
              onVideoChange(selectedVideo);
            }
          }}
        />
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