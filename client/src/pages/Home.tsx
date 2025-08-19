import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Search, User, Clock, Eye } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Generate unique thumbnails
  const getUniqueThumbnail = (index: number) => {
    const imageIds = [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1604608672516-a84cf4734b11?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1583419135560-38b6e44ef52f?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=60",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1604608672654-0dd0b4b4d7b4?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop&q=60",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=300&fit=crop&q=60"
    ];
    return imageIds[index % imageIds.length];
  };

  const enhancedVideos = typedVideos.map((video: any, index: number) => ({
    ...video,
    thumbnailUrl: getUniqueThumbnail(index)
  }));

  const toggleFavorite = (videoId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    setFavorites(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl font-bold text-yellow-500 mb-4">SAANSE</div>
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  const featuredVideo = enhancedVideos[0];

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Simple Header */}
      <header className="fixed top-0 w-full bg-black/90 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-yellow-500">SAANSE</h1>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-white">Stories</a>
            <a href="#" className="text-gray-400 hover:text-white">Bhajans</a>
            <a href="#" className="text-gray-400 hover:text-white">Teachings</a>
            <a href="#" className="text-gray-400 hover:text-white">My List</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Search className="w-5 h-5 text-gray-400 cursor-pointer" />
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-black" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      {featuredVideo && (
        <section className="relative h-screen">
          <img 
            src={featuredVideo.thumbnailUrl} 
            alt={featuredVideo.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
          
          <div className="absolute bottom-32 left-6 max-w-2xl">
            <div className="mb-4 inline-flex items-center bg-yellow-600 text-black px-3 py-1 rounded text-sm font-bold">
              <Clock className="w-4 h-4 mr-2" />
              3 MIN STORY
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4">{featuredVideo.title}</h1>
            <p className="text-lg text-gray-200 mb-6 leading-relaxed">{featuredVideo.description}</p>
            
            <div className="flex items-center space-x-4 mb-8 text-sm">
              <span className="flex items-center text-yellow-400">
                <Eye className="w-4 h-4 mr-1" />
                125K views
              </span>
              <span className="px-3 py-1 bg-gray-800 rounded">{featuredVideo.category}</span>
            </div>
            
            <div className="flex space-x-4">
              <button 
                className="bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition-colors flex items-center"
                onClick={() => setSelectedVideo(featuredVideo)}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                Watch Now
              </button>
              
              <button 
                className="bg-gray-700 text-white px-8 py-3 rounded font-bold hover:bg-gray-600 transition-colors flex items-center"
                onClick={(e) => toggleFavorite(featuredVideo.id, e)}
              >
                <Heart className={`w-5 h-5 mr-2 ${favorites.includes(featuredVideo.id) ? 'fill-red-500 text-red-500' : ''}`} />
                Save
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Content Grid */}
      <div className="px-6 py-16 space-y-12">
        
        {/* Trending */}
        <section>
          <h2 className="text-3xl font-bold mb-10 text-white">Trending Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {enhancedVideos.slice(0, 15).map((video: any, index: number) => (
              <div 
                key={video.id}
                className="cursor-pointer group transform hover:scale-105 transition-all duration-300"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/400x300/1f2937/ffffff?text=${encodeURIComponent(video.title.slice(0, 20))}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  
                  <div className="absolute top-3 left-3 bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                    #{index + 1}
                  </div>
                  
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium border border-gray-600">
                    3 min
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-tight">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-gray-300">
                        <Eye className="w-4 h-4 mr-1" />
                        {Math.floor(Math.random() * 100 + 20)}K views
                      </span>
                      <span className="text-yellow-400 font-medium">{video.category}</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50">
                    <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 text-black fill-current ml-1" />
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(video.id, e)}
                    className="absolute bottom-4 right-4 p-2 bg-black/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black border border-gray-600"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        {['Ramayana', 'Krishna', 'Mahabharata', 'Shiva'].map(category => {
          const categoryVideos = enhancedVideos.filter((video: any) => video.category === category);
          if (categoryVideos.length === 0) return null;
          
          return (
            <section key={category}>
              <h2 className="text-3xl font-bold mb-10 text-white">{category} Chronicles</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {categoryVideos.slice(0, 12).map((video: any, videoIndex: number) => (
                  <div 
                    key={video.id}
                    className="cursor-pointer group transform hover:scale-105 transition-all duration-300"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-36 object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/400x300/1f2937/ffffff?text=${encodeURIComponent(category)}`;
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                        3 min
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50">
                        <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-xl">
                          <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => toggleFavorite(video.id, e)}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                      >
                        <Heart className={`w-3 h-3 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      </button>
                    </div>
                    
                    <div className="mt-3">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {Math.floor(Math.random() * 50 + 10)}K views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

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
                className="absolute top-4 right-4 p-2 bg-black/70 rounded-full text-white"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4">
                <button className="bg-white text-black px-6 py-3 rounded font-bold flex items-center">
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Watch
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedVideo.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  3 minutes
                </span>
                <span>{selectedVideo.category}</span>
              </div>
              <p className="text-gray-300">{selectedVideo.description}</p>
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