import { useQuery } from "@tanstack/react-query";
import { Play, Plus, Info, Search, Bell, User } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl font-black tracking-wider mb-6">
            <span className="text-yellow-600">S</span>
            <span className="text-yellow-500">A</span>
            <span className="text-yellow-600">A</span>
            <span className="text-yellow-500">N</span>
            <span className="text-yellow-600">S</span>
            <span className="text-yellow-500">E</span>
          </div>
          <div className="text-gray-300 text-xl font-medium">Loading Epic Stories...</div>
          <div className="mt-6 w-80 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-600 to-orange-600 w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const featuredVideo = typedVideos.length > 0 ? typedVideos[0] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black via-black/95 to-transparent">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-10">
              <div className="text-4xl font-black tracking-widest">
                <span className="text-yellow-600">SAAN</span>
                <span className="text-yellow-500">SE</span>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-white font-semibold border-b-2 border-yellow-500 pb-1">Home</a>
                <a href="#" className="text-gray-300 hover:text-white font-medium transition-colors">Series</a>
                <a href="#" className="text-gray-300 hover:text-white font-medium transition-colors">Movies</a>
                <a href="#" className="text-gray-300 hover:text-white font-medium transition-colors">My List</a>
                <a href="#" className="text-gray-300 hover:text-white font-medium transition-colors">Browse</a>
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <Search className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer transition-colors" />
              <Bell className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer transition-colors" />
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
          
          <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-6">
            <div className="max-w-2xl space-y-6">
              <div className="inline-block px-4 py-2 bg-yellow-600 text-black font-bold text-sm rounded">
                FEATURED
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight text-white">
                {featuredVideo.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-medium max-w-xl">
                {featuredVideo.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm font-medium">
                <span className="text-yellow-500">{((featuredVideo.views || 0) / 1000).toFixed(0)}K Views</span>
                <span className="text-gray-300">{Math.floor((featuredVideo.duration || 0) / 60)} Minutes</span>
                <span className="px-3 py-1 bg-gray-800 text-white rounded font-bold">{featuredVideo.category}</span>
              </div>
              
              <div className="flex items-center space-x-4 pt-6">
                <button 
                  className="flex items-center space-x-3 bg-white text-black px-10 py-4 rounded font-bold text-lg hover:bg-gray-200 transition-all duration-200 shadow-lg"
                  onClick={() => setSelectedVideo(featuredVideo)}
                >
                  <Play className="w-7 h-7 fill-current" />
                  <span>Play</span>
                </button>
                
                <button className="flex items-center space-x-3 bg-gray-700/80 text-white px-10 py-4 rounded font-bold text-lg hover:bg-gray-600 transition-all duration-200">
                  <Info className="w-7 h-7" />
                  <span>More Info</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Rows */}
      <div className="relative -mt-40 space-y-12 pb-20">
        
        {/* Trending Now */}
        <section className="px-6">
          <h2 className="text-3xl font-bold mb-8 text-white">Trending Now</h2>
          <div className="flex space-x-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {typedVideos.slice(0, 15).map((video: any, index: number) => (
              <div 
                key={video.id}
                className="min-w-[320px] group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4 bg-yellow-600 text-black px-3 py-1 rounded font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-lg mb-2 text-white">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>{Math.floor((video.duration || 0) / 60)} min</span>
                      <span>{((video.views || 0) / 1000).toFixed(0)}K views</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-black fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular */}
        <section className="px-6">
          <h2 className="text-3xl font-bold mb-8 text-white">Popular on Saanse</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {typedVideos
              .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
              .slice(0, 12)
              .map((video: any) => (
              <div 
                key={video.id}
                className="group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
                <h3 className="font-semibold text-sm mt-2 text-white line-clamp-2">{video.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {['Ramayana', 'Krishna', 'Mahabharata', 'Shiva', 'Bhajans'].map(category => {
          const categoryVideos = typedVideos.filter((video: any) => video.category === category);
          
          if (categoryVideos.length === 0) return null;
          
          return (
            <section key={category} className="px-6">
              <h2 className="text-3xl font-bold mb-8 text-white">{category}</h2>
              <div className="flex space-x-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categoryVideos.map((video: any) => (
                  <div 
                    key={video.id}
                    className="min-w-[280px] group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300"></div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-2 bg-gray-800/80 rounded-full">
                          <Plus className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mt-3 text-white">{video.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{((video.views || 0) / 1000).toFixed(0)}K views</p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* Continue Watching */}
        <section className="px-6">
          <h2 className="text-3xl font-bold mb-8 text-white">Continue Watching</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                    <div className="h-full bg-yellow-600" style={{ width: '40%' }}></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-black fill-current ml-1" />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-xl mt-4 text-white">{video.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{video.category}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="relative">
              <img 
                src={selectedVideo.thumbnailUrl} 
                alt={selectedVideo.title}
                className="w-full h-80 object-cover rounded-t-xl"
              />
              <button 
                className="absolute top-6 right-6 p-3 bg-black/70 rounded-full text-white hover:bg-black transition-colors"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              <div className="absolute bottom-6 left-6">
                <button className="flex items-center space-x-3 bg-white text-black px-8 py-3 rounded font-bold text-lg">
                  <Play className="w-6 h-6 fill-current" />
                  <span>Play</span>
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <h2 className="text-4xl font-bold mb-4 text-white">{selectedVideo.title}</h2>
              <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6">
                <span className="text-yellow-500 font-bold">★ Featured</span>
                <span>{Math.floor((selectedVideo.duration || 0) / 60)} minutes</span>
                <span className="border border-gray-600 px-2 py-1 text-xs rounded">HD</span>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {selectedVideo.description}
              </p>
              
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Category: </span>
                  <span className="text-white font-semibold">{selectedVideo.category}</span>
                </div>
                <div>
                  <span className="text-gray-400">Views: </span>
                  <span className="text-white font-semibold">{((selectedVideo.views || 0) / 1000).toFixed(0)}K</span>
                </div>
              </div>
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
          div::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
    </div>
  );
}