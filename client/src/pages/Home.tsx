import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Share2, Search, Bell, User, Clock, Eye } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-black tracking-wider mb-6">
            <span className="text-yellow-600">S</span>
            <span className="text-yellow-500">A</span>
            <span className="text-yellow-600">A</span>
            <span className="text-yellow-500">N</span>
            <span className="text-yellow-600">S</span>
            <span className="text-yellow-500">E</span>
          </div>
          <div className="text-gray-300 text-xl font-medium">Loading Divine Stories...</div>
          <div className="mt-6 w-80 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-yellow-600 to-orange-600 w-1/3 animate-pulse"></div>
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
    <div className="min-h-screen bg-black text-white">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/95 to-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-3xl md:text-4xl font-black tracking-widest">
                <span className="text-yellow-600">SAAN</span>
                <span className="text-yellow-500">SE</span>
              </div>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-white font-semibold border-b-2 border-yellow-500 pb-1">Stories</a>
                <a href="#" className="text-gray-300 hover:text-white font-medium transition-colors">Devotional</a>
                <a href="#" className="text-gray-300 hover:text-white font-medium transition-colors">My List</a>
                <a href="#" className="text-gray-300 hover:text-white font-medium transition-colors">Categories</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Search className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer transition-colors" />
              <Bell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer transition-colors" />
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-600 to-orange-600 rounded cursor-pointer flex items-center justify-center">
                <User className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {featuredVideo && (
        <section className="relative h-screen">
          <div className="absolute inset-0">
            <img 
              src={featuredVideo.thumbnailUrl} 
              alt={featuredVideo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-600 text-black font-bold text-sm rounded">
                <Clock className="w-4 h-4 mr-2" />
                {Math.floor((featuredVideo.duration || 0) / 60)} MIN STORY
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-white">
                {featuredVideo.title}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium max-w-xl">
                {featuredVideo.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm font-medium">
                <div className="flex items-center text-yellow-500">
                  <Eye className="w-4 h-4 mr-1" />
                  {((featuredVideo.views || 0) / 1000).toFixed(0)}K Views
                </div>
                <span className="px-3 py-1 bg-gray-800 text-white rounded font-bold">{featuredVideo.category}</span>
              </div>
              
              <div className="flex items-center space-x-4 pt-6">
                <button 
                  className="flex items-center space-x-3 bg-white text-black px-8 py-3 rounded font-bold text-lg hover:bg-gray-200 transition-all duration-200 shadow-lg"
                  onClick={() => setSelectedVideo(featuredVideo)}
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>Watch Now</span>
                </button>
                
                <button 
                  className="flex items-center space-x-3 bg-gray-700/80 text-white px-8 py-3 rounded font-bold text-lg hover:bg-gray-600 transition-all duration-200"
                  onClick={() => toggleFavorite(featuredVideo.id)}
                >
                  <Heart className={`w-6 h-6 ${favorites.includes(featuredVideo.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="relative -mt-32 space-y-12 pb-20">
        
        {/* Trending Stories */}
        <section className="px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Trending Divine Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {typedVideos.slice(0, 12).map((video: any, index: number) => (
              <div 
                key={video.id}
                className="group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold">
                    #{index + 1} TRENDING
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor((video.duration || 0) / 60)}m
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-sm mb-2 text-white line-clamp-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {((video.views || 0) / 1000).toFixed(0)}K
                      </span>
                      <span className="bg-gray-700 px-2 py-1 rounded">{video.category}</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-black fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {['Ramayana', 'Krishna', 'Mahabharata', 'Shiva', 'Bhajans'].map(category => {
          const categoryVideos = typedVideos.filter((video: any) => video.category === category);
          
          if (categoryVideos.length === 0) return null;
          
          return (
            <section key={category} className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white">{category} Stories</h2>
                <button className="text-yellow-500 hover:text-yellow-400 font-medium text-sm">
                  View All →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {categoryVideos.slice(0, 12).map((video: any) => (
                  <div 
                    key={video.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-32 sm:h-36 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor((video.duration || 0) / 60)}m
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(video.id);
                        }}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Heart 
                          className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                        />
                      </button>
                    </div>
                    <h3 className="font-semibold text-sm mt-2 text-white line-clamp-2">{video.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {((video.views || 0) / 1000).toFixed(0)}K views
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Recently Added */}
        <section className="px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Recently Added</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {typedVideos.slice(15, 21).map((video: any) => (
              <div 
                key={video.id}
                className="group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-green-600 text-black px-2 py-1 rounded text-xs font-bold">
                    NEW
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor((video.duration || 0) / 60)}m
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-black fill-current ml-1" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <h3 className="font-bold text-lg text-white line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{video.category}</span>
                    <span className="text-yellow-500 flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {((video.views || 0) / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="relative">
              <img 
                src={selectedVideo.thumbnailUrl} 
                alt={selectedVideo.title}
                className="w-full h-64 md:h-80 object-cover rounded-t-xl"
              />
              <button 
                className="absolute top-4 right-4 p-2 bg-black/70 rounded-full text-white hover:bg-black transition-colors"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 flex items-center space-x-4">
                <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded font-bold">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Watch Now</span>
                </button>
                <button 
                  className="p-3 bg-gray-700/80 rounded-full hover:bg-gray-600 transition-colors"
                  onClick={() => toggleFavorite(selectedVideo.id)}
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(selectedVideo.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
                <button className="p-3 bg-gray-700/80 rounded-full hover:bg-gray-600 transition-colors">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">{selectedVideo.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
                <div className="flex items-center text-yellow-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="font-medium">{Math.floor((selectedVideo.duration || 0) / 60)} minutes</span>
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{((selectedVideo.views || 0) / 1000).toFixed(0)}K views</span>
                </div>
                <span className="px-3 py-1 bg-gray-700 rounded font-medium">{selectedVideo.category}</span>
              </div>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                {selectedVideo.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `
      }} />
    </div>
  );
}