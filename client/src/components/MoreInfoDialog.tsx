import { useState } from "react";
import { X, Play, Plus, ThumbsUp, Clock, Eye, Calendar } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WatchLaterButton } from "@/components/WatchLaterButton";
import { useSeriesVideos } from "@/hooks/useSeriesVideos";
import { useSeriesById } from "@/hooks/useSeries";
import type { VideoType, SeriesType } from "@/types/video";
import { formatDuration } from "@/lib/utils";

interface MoreInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoType;
  onPlay: (video: VideoType) => void;
}

export function MoreInfoDialog({ 
  isOpen, 
  onClose, 
  video, 
  onPlay 
}: MoreInfoDialogProps) {
  const [selectedSeason, setSelectedSeason] = useState(1);
  
  const { 
    data: series, 
    isLoading: seriesLoading 
  } = useSeriesById(
    video.series_id || "", 
    isOpen && !!video.series_id
  );
  
  const { 
    data: episodeVideos, 
    isLoading: episodesLoading 
  } = useSeriesVideos(
    video.series_id || "", 
    isOpen && !!video.series_id
  );

  const handlePlayEpisode = (episodeVideo: VideoType) => {
    onPlay(episodeVideo);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-dharma-black border-dharma-gray/30">
        <div className="relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50 bg-dharma-black/70 hover:bg-dharma-black text-white rounded-full h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Hero Section */}
          <div className="relative h-64 md:h-80">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${series?.banner_url || video.thumbnail_url})`,
                backgroundPosition: 'center 25%'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-dharma-black via-dharma-black/60 to-transparent" />
            </div>
            
            <div className="absolute bottom-6 left-6 right-16 text-white">
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {series?.title || video.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <Button 
                  size="lg" 
                  className="bg-dharma-red hover:bg-dharma-red-dark text-white font-semibold px-6 py-2"
                  onClick={() => handlePlayEpisode(video)}
                >
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  Play
                </Button>
                
                <WatchLaterButton 
                  video={video}
                  variant="outline"
                  className="border-2 border-white/70 text-white hover:bg-white hover:text-dharma-black font-semibold px-6 py-2"
                  showText={true}
                />

                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-2 border-white/70 text-white hover:bg-white hover:text-dharma-black rounded-full w-10 h-10 p-0"
                >
                  <ThumbsUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Section - Scrollable */}
          <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-dharma-gray/20 scrollbar-thumb-dharma-gray/60 hover:scrollbar-thumb-dharma-gray/80">
            <div className="p-6 space-y-6">
              {/* Video/Series Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    <span className="text-green-400 font-semibold">
                      {video.views > 1000 ? `${Math.floor(video.views/1000)}K` : video.views} Match
                    </span>
                    <span>{formatDate(video.created_at)}</span>
                    {series && (
                      <Badge variant="secondary" className="bg-dharma-gray/30 text-white">
                        {episodeVideos?.length || series.total_episodes} Episodes
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{video.views.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-gray-200 leading-relaxed">
                    {series?.description || video.description}
                  </p>

                  {/* Tags */}
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="border-dharma-gray/50 text-gray-300 hover:bg-dharma-gray/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-gray-400">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Release year: {formatDate(video.created_at)}</span>
                    </div>
                    <div className="mb-2">
                      Category: <span className="text-white">{video.category}</span>
                    </div>
                    {video.content_type === 'series' && (
                      <div>
                        Episode: <span className="text-white">{video.episode_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Episodes Section */}
              {video.series_id && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Episodes</h2>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        className="bg-dharma-gray/30 border border-dharma-gray/50 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-dharma-red"
                      >
                        <option value={1}>Season 1</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {episodesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-gray-400">Loading episodes...</div>
                      </div>
                    ) : episodeVideos && episodeVideos.length > 0 ? (
                      episodeVideos
                        .sort((a, b) => (a.episode_number || 0) - (b.episode_number || 0))
                        .map((episode) => (
                          <div
                            key={episode.id}
                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-dharma-gray/20 cursor-pointer transition-colors group"
                            onClick={() => handlePlayEpisode(episode)}
                          >
                            <div className="text-white font-bold text-lg min-w-[2rem] text-center">
                              {episode.episode_number}
                            </div>
                            
                            <div className="relative flex-shrink-0">
                              <img
                                src={episode.thumbnail_url}
                                alt={episode.title}
                                className="w-32 h-18 object-cover rounded"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                <Play className="w-6 h-6 text-white fill-white" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-white text-sm group-hover:text-dharma-red transition-colors">
                                  {episode.title}
                                </h3>
                                <span className="text-xs text-gray-400 flex-shrink-0">
                                  {formatDuration(episode.duration)}
                                </span>
                              </div>
                              
                              {episode.description && (
                                <p className="text-gray-400 text-xs mt-1 line-clamp-2 overflow-hidden">
                                  {episode.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {episode.views.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {episode.likes}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No episodes available
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* More Like This Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">More Like This</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Placeholder for similar content */}
                  <div className="text-center py-8 text-gray-400 md:col-span-2 lg:col-span-3">
                    Similar content coming soon...
                  </div>
                </div>
              </div>

              {/* Trailers & More Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Trailers & More</h2>
                <div className="text-center py-8 text-gray-400">
                  Additional content coming soon...
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}