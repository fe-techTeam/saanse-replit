import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Search, User, Clock, Eye, Star, Info, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // High quality thumbnails
  const getUniqueThumbnail = (index: number) => {
    const images = [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1604608672516-a84cf4734b11?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1583419135560-38b6e44ef52f?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1604608672654-0dd0b4b4d7b4?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1578662015701-0d6d697d8a6b?w=1200&h=675&fit=crop&q=95",
      "https://images.unsplash.com/photo-1548199569-23cdfaec0ba2?w=1200&h=675&fit=crop&q=95"
    ];
    return images[index % images.length];
  };

  const enhancedVideos = typedVideos.map((video: any, index: number) => ({
    ...video,
    thumbnailUrl: getUniqueThumbnail(index),
    rating: (4.1 + Math.random() * 0.8).toFixed(1),
    shortDescription: video.description ? video.description.slice(0, 80) + "..." : "Experience this divine story of faith and devotion."
  }));

  // Auto-change hero every 6 seconds
  useEffect(() => {
    if (enhancedVideos.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % Math.min(4, enhancedVideos.length));
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [enhancedVideos.length]);

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
        <div className="text-center space-y-6">
          <div className="text-6xl font-bold text-white tracking-wider">SAANSE</div>
          <div className="text-gray-400 text-lg">Loading divine stories...</div>
          <div className="w-64 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-red-600 w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const featuredVideo = enhancedVideos[currentHeroIndex] || enhancedVideos[0];

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Netflix-Style Header */}
      <header className="fixed top-0 w-full bg-black/95 backdrop-blur-md z-50 border-b border-gray-800">
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 md:space-x-10">
            <h1 className="text-2xl md:text-3xl font-bold text-red-600 tracking-wide">SAANSE</h1>
            
            <nav className="hidden md:flex items-center space-x-8 text-sm">
              <a href="#" className="text-white font-medium border-b-2 border-red-600 pb-1">Home</a>
              <a href="#" className="text-gray-300 hover:text-gray-200 transition-colors">Stories</a>
              <a href="#" className="text-gray-300 hover:text-gray-200 transition-colors">Devotional</a>
              <a href="#" className="text-gray-300 hover:text-gray-200 transition-colors">My List</a>
            </nav>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-white cursor-pointer hover:text-gray-300" />
            <div className="w-7 h-7 md:w-8 md:h-8 bg-red-600 rounded flex items-center justify-center cursor-pointer">
              <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/95 border-t border-gray-800">
            <nav className="flex flex-col px-4 py-2">
              <a href="#" className="text-white font-medium py-3 border-b border-gray-800">Home</a>
              <a href="#" className="text-gray-300 py-3 border-b border-gray-800">Stories</a>
              <a href="#" className="text-gray-300 py-3 border-b border-gray-800">Devotional</a>
              <a href="#" className="text-gray-300 py-3">My List</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section - Netflix Style */}
      {featuredVideo && (
        <section className="relative h-[60vh] md:h-screen pt-12 md:pt-16">
          <div className="absolute inset-0">
            <img 
              src={featuredVideo.thumbnailUrl} 
              alt={featuredVideo.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 md:via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 md:via-transparent to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex items-end h-full px-4 md:px-6 pb-16 md:pb-32 max-w-7xl mx-auto">
            <div className="max-w-full md:max-w-2xl">
              
              <div className="h-auto md:h-32 flex items-end mb-3 md:mb-6">
                <h1 className="text-3xl md:text-6xl font-bold leading-tight text-white line-clamp-2">
                  {featuredVideo.title}
                </h1>
              </div>
              
              <div className="h-auto md:h-20 mb-3 md:mb-6">
                <p className="text-sm md:text-xl text-gray-200 leading-relaxed max-w-xl line-clamp-2 md:line-clamp-3">
                  {featuredVideo.description}
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-lg mb-3 md:mb-6">
                <span className="flex items-center text-green-400">
                  <Star className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2 fill-current" />
                  {featuredVideo.rating}
                </span>
                <span className="text-gray-300">2024</span>
                <span className="text-gray-300">3m</span>
                <span className="px-1 md:px-2 py-0.5 md:py-1 border border-gray-500 text-xs md:text-sm text-gray-300">HD</span>
              </div>
              
              <div className="flex items-center space-x-2 md:space-x-4">
                <button 
                  className="flex items-center justify-center bg-white text-black px-4 md:px-10 py-2 md:py-4 rounded-md font-bold text-sm md:text-lg hover:bg-gray-200 transition-all shadow-lg"
                  onClick={() => setSelectedVideo(featuredVideo)}
                >
                  <Play className="w-4 h-4 md:w-6 md:h-6 mr-1.5 md:mr-3 fill-current" />
                  Play
                </button>
                
                <button 
                  className="flex items-center justify-center bg-gray-600/90 text-white px-4 md:px-10 py-2 md:py-4 rounded-md font-bold text-sm md:text-lg hover:bg-gray-500 transition-all shadow-lg"
                  onClick={() => setSelectedVideo(featuredVideo)}
                >
                  <Info className="w-4 h-4 md:w-6 md:h-6 mr-1.5 md:mr-3" />
                  More Info
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="relative -mt-8 md:-mt-16 space-y-8 md:space-y-16 px-4 md:px-6 pb-16 max-w-7xl mx-auto">
        
        {/* Trending Now */}
        <section className="bg-black/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-800">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="w-1 h-6 md:h-8 bg-red-600 mr-3 md:mr-4"></div>
            <h2 className="text-xl md:text-3xl font-bold text-white">Trending Now</h2>
            <div className="ml-3 md:ml-4 px-2 md:px-3 py-0.5 md:py-1 bg-red-600 text-white text-xs md:text-sm font-bold rounded-full">HOT</div>
          </div>
          <div className="flex space-x-3 md:space-x-4 overflow-x-auto scrollbar-hide pb-4">
            {enhancedVideos.slice(0, 12).map((video: any, index: number) => (
              <div 
                key={video.id}
                className="flex-shrink-0 w-40 sm:w-60 md:w-80 group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-24 sm:h-32 md:h-44 object-cover rounded-md md:group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/40 transition-colors duration-300 rounded-md"></div>
                  
                  <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-red-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm font-bold">
                    #{index + 1}
                  </div>
                  
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/70 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm">
                    3m
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 md:w-16 h-12 md:h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-4 md:w-6 h-4 md:h-6 text-black fill-current ml-0.5 md:ml-1" />
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(video.id, e)}
                    className="hidden md:block absolute bottom-2 right-2 p-2 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                </div>
                
                <div className="mt-2 space-y-1 md:space-y-2">
                  <h3 className="font-semibold text-white text-xs md:text-base md:group-hover:text-gray-300 transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="hidden sm:block text-xs md:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {video.shortDescription}
                  </p>
                  <div className="flex items-center text-xs md:text-sm text-gray-400 space-x-2 md:space-x-3">
                    <span className="flex items-center">
                      <Star className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1 text-green-400" />
                      {video.rating}
                    </span>
                    <span className="hidden sm:block">{video.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular on SAANSE */}
        <section className="bg-black/60 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-800">
          <div className="flex items-center mb-4 md:mb-6">
            <div className="w-1 h-6 md:h-8 bg-red-600 mr-3 md:mr-4"></div>
            <h2 className="text-xl md:text-3xl font-bold text-white">Popular on SAANSE</h2>
            <div className="ml-3 md:ml-4 px-2 md:px-3 py-0.5 md:py-1 bg-yellow-600 text-black text-xs md:text-sm font-bold rounded-full">POPULAR</div>
          </div>
          <div className="flex space-x-3 md:space-x-4 overflow-x-auto scrollbar-hide pb-4">
            {enhancedVideos.slice(12, 24).map((video: any, index: number) => (
              <div 
                key={video.id}
                className="flex-shrink-0 w-40 sm:w-60 md:w-80 group cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-24 sm:h-32 md:h-44 object-cover rounded-md md:group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/40 transition-colors duration-300 rounded-md"></div>
                  
                  <div className="absolute top-1 left-1 md:top-2 md:left-2 bg-yellow-600 text-black px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm font-bold">
                    TOP {index + 1}
                  </div>
                  
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/70 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm">
                    3m
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 md:w-16 h-12 md:h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-4 md:w-6 h-4 md:h-6 text-black fill-current ml-0.5 md:ml-1" />
                    </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(video.id, e)}
                    className="hidden md:block absolute bottom-2 right-2 p-2 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                </div>
                
                <div className="mt-2 space-y-1 md:space-y-2">
                  <h3 className="font-semibold text-white text-xs md:text-base md:group-hover:text-gray-300 transition-colors line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="hidden sm:block text-xs md:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                    {video.shortDescription}
                  </p>
                  <div className="flex items-center text-xs md:text-sm text-gray-400 space-x-2 md:space-x-3">
                    <span className="flex items-center">
                      <Star className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1 text-green-400" />
                      {video.rating}
                    </span>
                    <span className="hidden sm:block">{video.category}</span>
                  </div>
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
            <section key={category} className="bg-gradient-to-r from-black/80 to-black/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-800">
              <div className="flex items-center mb-4 md:mb-6">
                <div className="w-1 h-6 md:h-8 bg-red-600 mr-3 md:mr-4"></div>
                <h2 className="text-xl md:text-3xl font-bold text-white">{category} Chronicles</h2>
                <div className="ml-3 md:ml-4 px-2 md:px-3 py-0.5 md:py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs md:text-sm font-bold rounded-full">EPIC</div>
              </div>
              <div className="flex space-x-3 md:space-x-4 overflow-x-auto scrollbar-hide pb-4">
                {categoryVideos.slice(0, 10).map((video: any) => (
                  <div 
                    key={video.id}
                    className="flex-shrink-0 w-40 sm:w-60 md:w-80 group cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-24 sm:h-32 md:h-44 object-cover rounded-md md:group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/40 transition-colors duration-300 rounded-md"></div>
                      
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/70 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs md:text-sm">
                        3m
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 md:w-16 h-12 md:h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-4 md:w-6 h-4 md:h-6 text-black fill-current ml-0.5 md:ml-1" />
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => toggleFavorite(video.id, e)}
                        className="hidden md:block absolute bottom-2 right-2 p-2 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      </button>
                    </div>
                    
                    <div className="mt-2 space-y-1 md:space-y-2">
                      <h3 className="font-semibold text-white text-xs md:text-base md:group-hover:text-gray-300 transition-colors line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="hidden sm:block text-xs md:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {video.shortDescription}
                      </p>
                      <div className="flex items-center text-xs md:text-sm text-gray-400 space-x-2 md:space-x-3">
                        <span className="flex items-center">
                          <Star className="w-2.5 md:w-3 h-2.5 md:h-3 mr-0.5 md:mr-1 text-green-400" />
                          {video.rating}
                        </span>
                        <span className="hidden sm:block">{video.category}</span>
                      </div>
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-full md:max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="relative">
              <img 
                src={selectedVideo.thumbnailUrl} 
                alt={selectedVideo.title}
                className="w-full h-48 md:h-64 object-cover rounded-t-lg"
              />
              
              <button 
                className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2 bg-black/70 rounded-full text-white text-lg md:text-base"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              
              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 flex space-x-2 md:space-x-3">
                <button className="bg-white text-black px-4 md:px-6 py-1.5 md:py-2 rounded font-bold text-sm md:text-base flex items-center">
                  <Play className="w-4 md:w-5 h-4 md:h-5 mr-1.5 md:mr-2 fill-current" />
                  Play
                </button>
                <button 
                  onClick={(e) => toggleFavorite(selectedVideo.id, e)}
                  className="p-2 bg-gray-700 rounded-full"
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(selectedVideo.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
              </div>
            </div>
            
            <div className="p-4 md:p-6 space-y-3 md:space-y-4">
              <h2 className="text-lg md:text-2xl font-bold text-white">{selectedVideo.title}</h2>
              <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
                <span className="flex items-center text-green-400">
                  <Star className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                  {selectedVideo.rating}
                </span>
                <span>2024</span>
                <span>3 minutes</span>
                <span>HD</span>
              </div>
              <p className="text-sm md:text-base text-gray-300">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
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
        `
      }} />
    </div>
  );
}