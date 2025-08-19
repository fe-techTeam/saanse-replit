import { useQuery } from "@tanstack/react-query";
import { Play, Plus, Info, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-bold text-red-600 mb-4">SAANSE</div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Get featured video
  const featuredVideo = typedVideos.length > 0 ? typedVideos[0] : null;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Netflix-style Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-bold text-red-600">SAANSE</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-white hover:text-gray-300">Home</a>
              <a href="#" className="text-gray-400 hover:text-gray-300">TV Shows</a>
              <a href="#" className="text-gray-400 hover:text-gray-300">Movies</a>
              <a href="#" className="text-gray-400 hover:text-gray-300">My List</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-red-600 rounded"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {featuredVideo && (
        <div className="relative h-screen">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${featuredVideo.thumbnailUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex items-center h-full max-w-screen-2xl mx-auto px-4 md:px-16">
            <div className="max-w-lg space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                {featuredVideo.title}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed line-clamp-3">
                {featuredVideo.description}
              </p>
              
              <div className="flex items-center space-x-4 pt-4">
                <button 
                  className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded font-semibold text-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setSelectedVideo(featuredVideo)}
                >
                  <Play className="w-6 h-6 fill-current" />
                  <span>Play</span>
                </button>
                
                <button className="flex items-center space-x-2 bg-gray-600/70 text-white px-8 py-3 rounded font-semibold text-lg hover:bg-gray-600/90 transition-colors">
                  <Info className="w-6 h-6" />
                  <span>More Info</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-300 pt-2">
                <span className="bg-gray-800 px-2 py-1 rounded">{featuredVideo.category}</span>
                <span>{Math.floor((featuredVideo.duration || 0) / 60)}m</span>
                <span>{((featuredVideo.views || 0) / 1000).toFixed(0)}K views</span>
              </div>
            </div>
          </div>
          
          <button 
            className="absolute bottom-8 right-8 p-3 bg-gray-800/70 rounded-full hover:bg-gray-700 transition-colors"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative z-10 -mt-32 space-y-12 pb-20">
        
        {/* Trending Now */}
        <div className="px-4 md:px-16">
          <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
            {typedVideos.slice(0, 20).map((video: any, index: number) => (
              <div 
                key={video.id}
                className="min-w-[300px] group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-44 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 rounded-lg"></div>
                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                    #{index + 1}
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/80 p-2 rounded">
                      <h3 className="font-semibold text-sm truncate">{video.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
                        <span>{Math.floor((video.duration || 0) / 60)}m</span>
                        <span>{((video.views || 0) / 1000).toFixed(0)}K views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular on Saanse */}
        <div className="px-4 md:px-16">
          <h2 className="text-2xl font-bold mb-6">Popular on Saanse</h2>
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
            {typedVideos
              .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
              .slice(0, 20)
              .map((video: any) => (
              <div 
                key={video.id}
                className="min-w-[280px] group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-40 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="bg-yellow-600 px-2 py-1 rounded">{video.category}</span>
                      <span>{((video.likes || 0) / 1000).toFixed(0)}K likes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        {['Ramayana', 'Krishna', 'Mahabharata', 'Shiva', 'Bhajans'].map(category => {
          const categoryVideos = typedVideos.filter((video: any) => video.category === category);
          
          if (categoryVideos.length === 0) return null;
          
          return (
            <div key={category} className="px-4 md:px-16">
              <h2 className="text-2xl font-bold mb-6">{category} Stories</h2>
              <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
                {categoryVideos.map((video: any) => (
                  <div 
                    key={video.id}
                    className="min-w-[240px] group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-36 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded"></div>
                      <div className="absolute top-2 right-2">
                        <button className="p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="font-medium text-sm truncate">{video.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {((video.views || 0) / 1000).toFixed(0)}K views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Continue Watching */}
        <div className="px-4 md:px-16">
          <h2 className="text-2xl font-bold mb-6">Continue Watching</h2>
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
            {typedVideos.slice(10, 25).map((video: any) => (
              <div 
                key={video.id}
                className="min-w-[320px] group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover rounded group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                    <div className="h-full bg-red-600 w-1/3"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/80 p-3 rounded-full">
                      <Play className="w-8 h-8 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-lg truncate">{video.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{video.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="relative">
              <img 
                src={selectedVideo.thumbnailUrl} 
                alt={selectedVideo.title}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <button 
                className="absolute top-4 right-4 p-2 bg-black/70 rounded-full text-white hover:bg-black"
                onClick={() => setSelectedVideo(null)}
              >
                ×
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <button className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded font-semibold">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play</span>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                <span className="text-green-500">98% Match</span>
                <span>{Math.floor((selectedVideo.duration || 0) / 60)}m</span>
                <span className="border border-gray-600 px-2 py-1 text-xs">HD</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                {selectedVideo.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Category: </span>
                  <span className="text-white">{selectedVideo.category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Views: </span>
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}