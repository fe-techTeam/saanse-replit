import { useQuery } from "@tanstack/react-query";
import { Play, Heart, BookOpen, Star, Clock, Users } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-4">
            SAANSE
          </div>
          <div className="text-amber-200 text-xl">Awakening Divine Stories...</div>
          <div className="mt-4 w-64 h-1 bg-purple-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const featuredVideo = typedVideos.length > 0 ? typedVideos[0] : null;

  const toggleFavorite = (videoId: string) => {
    setFavorites(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-white">
      
      {/* Custom Header */}
      <header className="relative z-50 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 backdrop-blur-md border-b border-amber-400/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                SAANSE
              </h1>
              <div className="hidden md:flex items-center space-x-6">
                <span className="text-amber-200 border-b-2 border-amber-400 pb-1">Stories</span>
                <span className="text-gray-300 hover:text-amber-200 cursor-pointer">Devotional</span>
                <span className="text-gray-300 hover:text-amber-200 cursor-pointer">My Journey</span>
                <span className="text-gray-300 hover:text-amber-200 cursor-pointer">Wisdom</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold">🕉</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Unique Design */}
      {featuredVideo && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={featuredVideo.thumbnailUrl} 
              alt={featuredVideo.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-purple-900/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-transparent to-slate-900/40"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-400/30">
                  <Star className="w-4 h-4 text-amber-400 mr-2" />
                  <span className="text-amber-200 text-sm font-medium">Featured Divine Story</span>
                </div>
                
                <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                    {featuredVideo.title}
                  </span>
                </h2>
                
                <p className="text-xl text-gray-300 leading-relaxed max-w-lg">
                  {featuredVideo.description}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {Math.floor((featuredVideo.duration || 0) / 60)} min
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {((featuredVideo.views || 0) / 1000).toFixed(0)}K seekers
                  </div>
                  <div className="px-3 py-1 bg-purple-700/30 rounded-full border border-purple-500/30">
                    {featuredVideo.category}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <button 
                    className="flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-amber-400 hover:to-orange-400 transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
                    onClick={() => setSelectedVideo(featuredVideo)}
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>Begin Journey</span>
                  </button>
                  
                  <button 
                    className="flex items-center space-x-3 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                    onClick={() => toggleFavorite(featuredVideo.id)}
                  >
                    <Heart 
                      className={`w-6 h-6 ${favorites.includes(featuredVideo.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                    <span>Save to Heart</span>
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl backdrop-blur-sm border border-white/10 p-6">
                  <img 
                    src={featuredVideo.thumbnailUrl} 
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-6 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-black fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections - Original Design */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
        
        {/* Trending Wisdom */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Trending Wisdom
            </h3>
            <button className="text-amber-400 hover:text-amber-300 font-medium">
              Explore All →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {typedVideos.slice(0, 8).map((video: any, index: number) => (
              <div 
                key={video.id}
                className="group relative bg-gradient-to-br from-slate-800/50 to-purple-800/30 rounded-2xl overflow-hidden border border-white/10 hover:border-amber-400/30 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="aspect-video relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    #{index + 1}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-amber-500/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-black fill-current ml-1" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-amber-200 transition-colors">
                    {video.title}
                  </h4>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{Math.floor((video.duration || 0) / 60)} min</span>
                    <span>{((video.views || 0) / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sacred Categories */}
        {['Ramayana', 'Krishna', 'Mahabharata', 'Shiva', 'Bhajans'].map(category => {
          const categoryVideos = typedVideos.filter((video: any) => video.category === category);
          if (categoryVideos.length === 0) return null;
          
          return (
            <section key={category}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-white">
                  Sacred {category}
                </h3>
                <button className="text-amber-400 hover:text-amber-300 font-medium">
                  View Collection →
                </button>
              </div>
              
              <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                {categoryVideos.map((video: any) => (
                  <div 
                    key={video.id}
                    className="min-w-[280px] group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700/30 to-purple-700/20 border border-white/5 hover:border-amber-400/20 transition-all duration-300">
                      <div className="aspect-video relative">
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <h4 className="font-semibold text-lg line-clamp-2 group-hover:text-amber-200 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <BookOpen className="w-4 h-4" />
                            <span>{((video.views || 0) / 1000).toFixed(0)}K seekers</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(video.id);
                            }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <Heart 
                              className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Continue Your Journey */}
        <section>
          <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Continue Your Spiritual Journey
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {typedVideos.slice(10, 16).map((video: any) => (
              <div 
                key={video.id}
                className="group relative bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl overflow-hidden border border-indigo-500/20 hover:border-purple-400/40 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="aspect-video relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-700">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/3"></div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 group-hover:text-purple-200 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-sm text-gray-400">{video.category} • Continue from 33%</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-amber-400/20">
            <div className="relative">
              <img 
                src={selectedVideo.thumbnailUrl} 
                alt={selectedVideo.title}
                className="w-full h-80 object-cover rounded-t-3xl"
              />
              <button 
                className="absolute top-6 right-6 p-3 bg-black/70 backdrop-blur-sm rounded-full text-white hover:bg-black/90 transition-colors"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              <div className="absolute bottom-6 left-6 right-6">
                <button className="flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-8 py-3 rounded-xl font-bold">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Begin This Journey</span>
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                {selectedVideo.title}
              </h2>
              <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-amber-400 mr-1" />
                  <span className="text-amber-400">Divine Content</span>
                </div>
                <span>{Math.floor((selectedVideo.duration || 0) / 60)} minutes</span>
                <span className="px-3 py-1 bg-purple-700/30 rounded-full">{selectedVideo.category}</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg mb-8">
                {selectedVideo.description}
              </p>
              
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Sacred Category: </span>
                  <span className="text-amber-300">{selectedVideo.category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Spiritual Seekers: </span>
                  <span className="text-white">{((selectedVideo.views || 0) / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}