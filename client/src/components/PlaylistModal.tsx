import { useState } from "react";
import { X, Play, Clock, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSeriesVideos } from "@/hooks/useSeriesVideos";
import { useSeriesById } from "@/hooks/useSeries";
import type { VideoType } from "@/types/video";
import { formatDuration } from "@/lib/utils";

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVideo: VideoType;
  onVideoSelect: (video: VideoType) => void;
}

export function PlaylistModal({ 
  isOpen, 
  onClose, 
  currentVideo, 
  onVideoSelect 
}: PlaylistModalProps) {
  const { 
    data: series, 
    isLoading: seriesLoading 
  } = useSeriesById(
    currentVideo.series_id || "", 
    isOpen && !!currentVideo.series_id
  );
  
  const { 
    data: episodeVideos, 
    isLoading: episodesLoading 
  } = useSeriesVideos(
    currentVideo.series_id || "", 
    isOpen && !!currentVideo.series_id
  );

  const handleVideoSelect = (video: VideoType) => {
    onVideoSelect(video);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden bg-dharma-black border-dharma-gray/30">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dharma-gray/30">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {series?.title || "Episodes"}
              </h2>
              {series && (
                <p className="text-gray-400 text-sm mt-1">
                  {series.total_episodes} episodes
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-dharma-gray/30 rounded-full h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Episodes List - Scrollable */}
          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-dharma-gray/20 scrollbar-thumb-dharma-gray/60">
            <div className="p-4">
              {episodesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-400">Loading episodes...</div>
                </div>
              ) : episodeVideos && episodeVideos.length > 0 ? (
                <div className="space-y-3">
                  {episodeVideos
                    .sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0))
                    .map((episode, index) => {
                      const isCurrentEpisode = episode.id === currentVideo.id;
                      return (
                        <div
                          key={episode.id}
                          className={`flex items-start gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            isCurrentEpisode 
                              ? 'bg-dharma-red/20 border border-dharma-red/40' 
                              : 'hover:bg-dharma-gray/20'
                          }`}
                          onClick={() => handleVideoSelect(episode)}
                        >
                          <div className={`text-lg font-bold min-w-[2rem] text-center ${
                            isCurrentEpisode ? 'text-dharma-red' : 'text-white'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <div className="relative flex-shrink-0">
                            <img
                              src={episode.thumbnail_url}
                              alt={episode.title}
                              className="w-32 h-18 object-cover rounded"
                            />
                            {!isCurrentEpisode && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                <Play className="w-6 h-6 text-white fill-white" />
                              </div>
                            )}
                            {isCurrentEpisode && (
                              <div className="absolute inset-0 bg-dharma-red/20 flex items-center justify-center rounded">
                                <div className="bg-dharma-red text-white text-xs px-2 py-1 rounded font-semibold">
                                  NOW PLAYING
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className={`font-semibold text-sm ${
                                isCurrentEpisode ? 'text-dharma-red' : 'text-white hover:text-dharma-red'
                              } transition-colors`}>
                                {episode.title}
                              </h3>
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {formatDuration(episode.duration)}
                              </span>
                            </div>
                            
                            {episode.description && (
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                                {episode.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {episode.views.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDuration(episode.duration)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No episodes available
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}