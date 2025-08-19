import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Search, User, Clock, Eye, Star, Award, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Premium quality thumbnails
  const getUniqueThumbnail = (index: number) => {
    const premiumImages = [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1604608672516-a84cf4734b11?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1583419135560-38b6e44ef52f?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1604608672654-0dd0b4b4d7b4?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1578662015701-0d6d697d8a6b?w=800&h=450&fit=crop&q=90",
      "https://images.unsplash.com/photo-1548199569-23cdfaec0ba2?w=800&h=450&fit=crop&q=90"
    ];
    return premiumImages[index % premiumImages.length];
  };

  const enhancedVideos = typedVideos.map((video: any, index: number) => ({
    ...video,
    thumbnailUrl: getUniqueThumbnail(index),
    rating: (4.2 + Math.random() * 0.8).toFixed(1),
    isPremium: index < 8,
    isExclusive: index < 4,
    quality: index < 6 ? "4K Ultra HD" : "HD"
  }));

  // Auto-rotate hero content
  useEffect(() => {
    if (isAutoPlaying && enhancedVideos.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % Math.min(5, enhancedVideos.length));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, enhancedVideos.length]);

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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              SAANSE
            </span>
          </div>
          <div className="text-gray-300 text-xl mb-8">Awakening Divine Stories</div>
          <div className="w-80 h-2 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 w-3/4 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const featuredVideo = enhancedVideos[currentHeroIndex] || enhancedVideos[0];
  const trendingVideos = enhancedVideos.slice(0, 12);
  const premiumCollection = enhancedVideos.filter(v => v.isPremium).slice(0, 8);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      
      {/* Premium Header */}
      <header className="fixed top-0 w-full bg-black/80 backdrop-blur-xl z-50 border-b border-yellow-500/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-12">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-black font-black text-lg">S</span>
                </div>
                <h1 className="text-2xl font-black">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    SAANSE
                  </span>
                </h1>
              </div>
              
              <nav className="hidden lg:flex items-center space-x-8">
                <a href="#" className="relative group">
                  <span className="text-white font-semibold">Sacred Cinema</span>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500 rounded-full"></div>
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">Divine Music</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">Wisdom</a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors font-medium">My Collection</a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center cursor-pointer">
                <User className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cinematic Hero */}
      {featuredVideo && (
        <section className="relative h-screen overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={featuredVideo.thumbnailUrl} 
              alt={featuredVideo.title}
              className="w-full h-full object-cover scale-110 transition-transform duration-[20s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
          </div>
          
          <div className="relative z-10 flex items-end h-full max-w-7xl mx-auto px-6 pb-24">
            <div className="max-w-3xl space-y-6">
              
              <div className="flex items-center space-x-4 mb-4">
                {featuredVideo.isExclusive && (
                  <div className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    <Award className="w-4 h-4 mr-2" />
                    SAANSE EXCLUSIVE
                  </div>
                )}
                <div className="flex items-center bg-yellow-600 text-black px-4 py-2 rounded-lg font-bold text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  3 MIN EPIC
                </div>
                <div className="flex items-center bg-gray-800/80 text-white px-3 py-1 rounded font-medium text-sm">
                  <Star className="w-4 h-4 mr-1 text-yellow-400" />
                  {featuredVideo.rating}
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight text-white drop-shadow-2xl">
                {featuredVideo.title}
              </h1>
              
              <p className="text-xl text-gray-200 leading-relaxed font-medium max-w-2xl drop-shadow-lg">
                {featuredVideo.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm font-medium">
                <div className="flex items-center text-yellow-400">
                  <Eye className="w-4 h-4 mr-2" />
                  2.1M Sacred Views
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full font-bold text-yellow-300">
                  {featuredVideo.category}
                </span>
                <span className="text-gray-300">{featuredVideo.quality}</span>
              </div>
              
              <div className="flex items-center space-x-6 pt-6">
                <button 
                  className="flex items-center space-x-4 bg-white text-black px-12 py-4 rounded-xl font-black text-lg hover:bg-yellow-100 transition-all duration-300 shadow-2xl transform hover:scale-105"
                  onClick={() => setSelectedVideo(featuredVideo)}
                >
                  <Play className="w-8 h-8 fill-current" />
                  <span>Experience Divine Story</span>
                </button>
                
                <button 
                  className="flex items-center space-x-4 bg-black/60 backdrop-blur-xl text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black/80 transition-all duration-300 border border-gray-600"
                  onClick={(e) => toggleFavorite(featuredVideo.id, e)}
                >
                  <Heart className={`w-6 h-6 ${favorites.includes(featuredVideo.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>Add to Sacred List</span>
                </button>

                <button className="p-4 bg-black/60 backdrop-blur-xl rounded-xl hover:bg-black/80 transition-all border border-gray-600">
                  <Volume2 className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="flex space-x-2 pt-4">
                {enhancedVideos.slice(0, 5).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroIndex(index)}
                    className={`w-12 h-1 rounded-full transition-all duration-300 ${
                      index === currentHeroIndex ? 'bg-yellow-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Premium Content Sections */}
      <div className="relative -mt-40 space-y-16 pb-20 bg-gradient-to-b from-transparent to-black">
        
        {/* Trending Now */}
        <section className="px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Trending Now</h2>
              <p className="text-gray-400 font-medium">Most watched sacred stories this week</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {trendingVideos.map((video: any, index: number) => (
                <div 
                  key={video.id}
                  className="group cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 hover:shadow-yellow-500/20">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
                    
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black">
                        #{index + 1}
                      </div>
                      {video.isPremium && (
                        <div className="bg-yellow-600 text-black px-3 py-1 rounded-full text-xs font-black">
                          PREMIUM
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-gray-600">
                      {video.quality}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm mb-4">
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-4 h-4 mr-1" />
                          <span className="font-bold">{video.rating}</span>
                        </div>
                        <span className="flex items-center text-gray-300">
                          <Eye className="w-4 h-4 mr-1" />
                          {Math.floor(Math.random() * 500 + 100)}K
                        </span>
                        <span className="text-yellow-500 font-bold">{video.category}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-yellow-100 transition-colors">
                          Watch Now
                        </button>
                        <button
                          onClick={(e) => toggleFavorite(video.id, e)}
                          className="p-2 bg-black/80 rounded-lg hover:bg-black transition-colors"
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60">
                      <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center shadow-2xl">
                        <Play className="w-8 h-8 text-black fill-current ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium Collection */}
        <section className="px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-white mb-2">Premium Collection</h2>
              <p className="text-gray-400 font-medium">Exclusive sacred stories crafted for devotees</p>
            </div>
          </div>
          
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {premiumCollection.map((video: any) => (
              <div 
                key={video.id}
                className="flex-shrink-0 w-80 group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-2xl overflow-hidden border border-yellow-500/20 shadow-xl transform hover:scale-105 transition-all duration-500">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                  
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-black">
                      PREMIUM
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white mb-2">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 mr-1" />
                        {video.rating}
                      </div>
                      <span className="text-gray-300">3 min</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-black fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Showcases */}
        {['Ramayana', 'Krishna', 'Mahabharata', 'Shiva'].map(category => {
          const categoryVideos = enhancedVideos.filter((video: any) => video.category === category);
          if (categoryVideos.length === 0) return null;
          
          const categoryIcons = {
            'Ramayana': '🏹',
            'Krishna': '🦚', 
            'Mahabharata': '⚔️',
            'Shiva': '🔱'
          };
          
          return (
            <section key={category} className="px-6">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-4xl font-black text-white mb-2 flex items-center">
                    <span className="mr-4 text-5xl">{categoryIcons[category as keyof typeof categoryIcons]}</span>
                    {category} Saga
                  </h2>
                  <p className="text-gray-400 font-medium">Epic tales from the sacred {category} chronicles</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {categoryVideos.slice(0, 12).map((video: any) => (
                  <div 
                    key={video.id}
                    className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-40 object-cover"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        3m
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                          <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-semibold text-white mt-3 line-clamp-2">{video.title}</h3>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <Star className="w-3 h-3 mr-1 text-yellow-400" />
                      {video.rating}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

      </div>

      {/* Enhanced Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-auto border border-yellow-500/20 shadow-2xl">
            <div className="relative">
              <img 
                src={selectedVideo.thumbnailUrl} 
                alt={selectedVideo.title}
                className="w-full h-80 object-cover rounded-t-3xl"
              />
              
              <button 
                className="absolute top-6 right-6 p-3 bg-black/80 backdrop-blur-sm rounded-full text-white hover:bg-black transition-colors"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              
              <div className="absolute bottom-8 left-8 flex items-center space-x-6">
                <button className="flex items-center space-x-4 bg-white text-black px-10 py-4 rounded-xl font-black text-lg hover:bg-yellow-100 transition-all shadow-lg">
                  <Play className="w-7 h-7 fill-current" />
                  <span>Begin Sacred Journey</span>
                </button>
                
                <button 
                  className="p-4 bg-black/60 backdrop-blur-md rounded-xl hover:bg-black/80 transition-colors border border-gray-600"
                  onClick={(e) => toggleFavorite(selectedVideo.id, e)}
                >
                  <Heart className={`w-7 h-7 ${favorites.includes(selectedVideo.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>
            </div>
            
            <div className="p-10 space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                {selectedVideo.isExclusive && (
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                    EXCLUSIVE
                  </div>
                )}
                <div className="flex items-center text-yellow-400">
                  <Star className="w-5 h-5 mr-2" />
                  <span className="font-bold text-lg">{selectedVideo.rating}</span>
                </div>
                <span className="text-gray-400">{selectedVideo.quality}</span>
              </div>
              
              <h2 className="text-4xl font-black text-white">
                {selectedVideo.title}
              </h2>
              
              <p className="text-xl text-gray-300 leading-relaxed">
                {selectedVideo.description}
              </p>
              
              <div className="flex items-center space-x-8 text-lg">
                <div className="flex items-center text-yellow-400 font-bold">
                  <Clock className="w-5 h-5 mr-2" />
                  3 minutes of divine wisdom
                </div>
                <div className="flex items-center text-gray-300">
                  <Eye className="w-5 h-5 mr-2" />
                  1.2M devotees experienced
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
          
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
    </div>
  );
}