import { useQuery } from "@tanstack/react-query";
import { Play, Heart, Share2, Search, Bell, User, Clock, Eye, Plus, Bookmark, Filter } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate unique thumbnail URLs for variety
  const getUniqueThumbnail = (index: number) => {
    const baseUrl = "https://images.unsplash.com";
    const queries = [
      "hindu-temple-statue-800x600",
      "indian-mythology-art-800x600", 
      "lord-rama-painting-800x600",
      "krishna-statue-800x600",
      "hindu-deity-art-800x600",
      "indian-classical-dance-800x600",
      "temple-architecture-800x600",
      "devotional-music-800x600",
      "sanskrit-manuscript-800x600",
      "meditation-spiritual-800x600",
      "hindu-festival-celebration-800x600",
      "ancient-indian-art-800x600"
    ];
    const queryIndex = index % queries.length;
    return `${baseUrl}/${queries[queryIndex]}?auto=format&fit=crop&w=800&h=600&q=80`;
  };

  // Enhance videos with unique thumbnails
  const enhancedVideos = typedVideos.map((video: any, index: number) => ({
    ...video,
    thumbnailUrl: getUniqueThumbnail(index),
    isNew: index < 6,
    trending: index < 15
  }));

  const categories = ['All', 'Ramayana', 'Mahabharata', 'Krishna Leela', 'Shiva Purana', 'Bhajans', 'Mantras', 'Teachings'];

  const filteredVideos = activeCategory === 'All' 
    ? enhancedVideos 
    : enhancedVideos.filter((video: any) => video.category === activeCategory || 
        (activeCategory === 'Krishna Leela' && video.category === 'Krishna') ||
        (activeCategory === 'Shiva Purana' && video.category === 'Shiva') ||
        (activeCategory === 'Teachings' && video.category === 'Educational'));

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl font-black tracking-wider mb-6 animate-pulse">
            <span className="text-yellow-600">S</span>
            <span className="text-yellow-500">A</span>
            <span className="text-yellow-600">A</span>
            <span className="text-yellow-500">N</span>
            <span className="text-yellow-600">S</span>
            <span className="text-yellow-500">E</span>
          </div>
          <div className="text-gray-300 text-xl font-medium">Awakening Divine Stories...</div>
          <div className="mt-6 w-80 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-yellow-600 to-orange-600 w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const featuredVideo = enhancedVideos.length > 0 ? enhancedVideos[0] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Enhanced Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-lg border-b border-yellow-500/20' 
          : 'bg-gradient-to-b from-black via-black/90 to-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-10">
              <div className="relative">
                <div className="text-3xl md:text-4xl font-black tracking-wider">
                  <span className="text-yellow-600">SAAN</span>
                  <span className="text-yellow-500">SE</span>
                </div>
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-600 to-orange-500 rounded-full"></div>
              </div>
              
              {/* Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                <a href="#" className="relative group">
                  <span className="text-white font-semibold">Sacred Stories</span>
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500 rounded-full"></div>
                </a>
                <a href="#" className="text-gray-300 hover:text-yellow-400 font-medium transition-colors group">
                  Devotional Music
                  <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-yellow-500 rounded-full transition-all duration-300"></div>
                </a>
                <a href="#" className="text-gray-300 hover:text-yellow-400 font-medium transition-colors group">
                  Spiritual Teachings
                  <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-yellow-500 rounded-full transition-all duration-300"></div>
                </a>
                <a href="#" className="text-gray-300 hover:text-yellow-400 font-medium transition-colors group">
                  My Sacred List
                  <div className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-yellow-500 rounded-full transition-all duration-300"></div>
                </a>
              </nav>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-5">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-300 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Filter className="w-5 h-5 text-gray-300 hover:text-white" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-gray-300 hover:text-white" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full cursor-pointer flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                <User className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="pb-4 overflow-x-auto">
            <div className="flex space-x-3 min-w-max">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeCategory === category
                      ? 'bg-yellow-600 text-black font-bold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent"></div>
          </div>
          
          <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-3xl space-y-8 pt-20">
              <div className="flex items-center space-x-4">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-600 text-black font-bold text-sm rounded-full">
                  <Clock className="w-4 h-4 mr-2" />
                  {Math.floor((featuredVideo.duration || 180) / 60)} MIN DIVINE STORY
                </div>
                {featuredVideo.isNew && (
                  <div className="px-3 py-1 bg-green-600 text-black font-bold text-xs rounded-full">
                    NEW
                  </div>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-2xl">
                {featuredVideo.title}
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium max-w-2xl drop-shadow-lg">
                {featuredVideo.description}
              </p>
              
              <div className="flex items-center space-x-8 text-sm font-medium">
                <div className="flex items-center text-yellow-400">
                  <Eye className="w-4 h-4 mr-2" />
                  {((featuredVideo.views || 125000) / 1000).toFixed(0)}K Devotees Watched
                </div>
                <span className="px-4 py-2 bg-black/60 text-white rounded-full font-bold border border-gray-600">
                  {featuredVideo.category}
                </span>
              </div>
              
              <div className="flex items-center space-x-6 pt-4">
                <button 
                  className="flex items-center space-x-4 bg-white text-black px-10 py-4 rounded-lg font-bold text-lg hover:bg-yellow-100 transition-all duration-300 shadow-2xl transform hover:scale-105"
                  onClick={() => setSelectedVideo(featuredVideo)}
                >
                  <Play className="w-7 h-7 fill-current" />
                  <span>Experience Now</span>
                </button>
                
                <button 
                  className="flex items-center space-x-4 bg-black/60 backdrop-blur-md text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-black/80 transition-all duration-300 border border-gray-600 transform hover:scale-105"
                  onClick={(e) => toggleFavorite(featuredVideo.id, e)}
                >
                  <Heart className={`w-7 h-7 ${favorites.includes(featuredVideo.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>Add to Sacred List</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="relative -mt-32 space-y-16 pb-20">
        
        {/* Trending Section */}
        <section className="px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              🔥 Trending Divine Stories
            </h2>
            <button className="flex items-center space-x-2 text-yellow-500 hover:text-yellow-400 font-semibold">
              <span>View All</span>
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredVideos.slice(0, 10).map((video: any, index: number) => (
              <div 
                key={video.id}
                className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-2xl hover:shadow-yellow-500/20">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Overlay Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <div className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold">
                      #{index + 1}
                    </div>
                    {video.trending && (
                      <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        HOT
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.floor((video.duration || 180) / 60)}m
                  </div>

                  {/* Content Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-base mb-2 text-white line-clamp-2 group-hover:text-yellow-200 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {((video.views || 25000) / 1000).toFixed(0)}K
                      </span>
                      <span className="bg-gray-700/80 px-2 py-1 rounded font-medium">
                        {video.category}
                      </span>
                    </div>
                  </div>

                  {/* Hover Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/50">
                    <div className="w-20 h-20 bg-white/95 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 text-black fill-current ml-1" />
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(video.id, e)}
                    className="absolute bottom-4 right-4 p-2 bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black"
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category-Based Sections */}
        {['Ramayana', 'Krishna', 'Mahabharata', 'Shiva'].map(category => {
          const categoryVideos = filteredVideos.filter((video: any) => 
            video.category === category || 
            (category === 'Krishna' && video.category === 'Krishna Leela')
          );
          
          if (categoryVideos.length === 0) return null;
          
          const categoryEmojis = {
            'Ramayana': '🏹',
            'Krishna': '🦚', 
            'Mahabharata': '⚔️',
            'Shiva': '🔱'
          };
          
          return (
            <section key={category} className="px-4 md:px-6">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center space-x-3">
                  <span>{categoryEmojis[category as keyof typeof categoryEmojis]}</span>
                  <span>Sacred {category} Chronicles</span>
                </h2>
                <button className="text-yellow-500 hover:text-yellow-400 font-semibold flex items-center space-x-2">
                  <span>Explore All</span>
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                {categoryVideos.slice(0, 14).map((video: any) => (
                  <div 
                    key={video.id}
                    className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl">
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-32 sm:h-36 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300"></div>
                      
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor((video.duration || 180) / 60)}m
                      </div>

                      {video.isNew && (
                        <div className="absolute top-2 left-2 bg-green-600 text-black px-2 py-1 rounded text-xs font-bold">
                          NEW
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleFavorite(video.id, e)}
                        className="absolute bottom-2 right-2 p-1.5 bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <Bookmark 
                          className={`w-3 h-3 ${favorites.includes(video.id) ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`} 
                        />
                      </button>
                    </div>
                    
                    <div className="mt-3 space-y-1">
                      <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-yellow-200 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {((video.views || 15000) / 1000).toFixed(0)}K devotees
                      </p>
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
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto border border-yellow-500/20 shadow-2xl">
            <div className="relative">
              <img 
                src={selectedVideo.thumbnailUrl} 
                alt={selectedVideo.title}
                className="w-full h-72 md:h-96 object-cover rounded-t-2xl"
              />
              
              <button 
                className="absolute top-6 right-6 p-3 bg-black/80 backdrop-blur-sm rounded-full text-white hover:bg-black transition-colors"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              
              <div className="absolute bottom-6 left-6 flex items-center space-x-4">
                <button className="flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-100 transition-all shadow-lg">
                  <Play className="w-6 h-6 fill-current" />
                  <span>Begin Sacred Journey</span>
                </button>
                
                <button 
                  className="p-4 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors border border-gray-600"
                  onClick={(e) => toggleFavorite(selectedVideo.id, e)}
                >
                  <Heart className={`w-6 h-6 ${favorites.includes(selectedVideo.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
                
                <button className="p-4 bg-black/60 backdrop-blur-md rounded-full hover:bg-black/80 transition-colors border border-gray-600">
                  <Share2 className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {selectedVideo.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center text-yellow-400 font-medium">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{Math.floor((selectedVideo.duration || 180) / 60)} minutes of divine wisdom</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Eye className="w-4 h-4 mr-2" />
                  <span>{((selectedVideo.views || 25000) / 1000).toFixed(0)}K devotees experienced</span>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full font-medium text-yellow-300">
                  {selectedVideo.category}
                </span>
                {selectedVideo.isNew && (
                  <span className="px-3 py-1 bg-green-600 text-black font-bold text-xs rounded-full">
                    NEWLY ADDED
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed">
                {selectedVideo.description}
              </p>
              
              <div className="pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Join thousands of devotees in experiencing this sacred story. Add to your personal collection for repeated viewing and spiritual growth.
                </p>
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
          
          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #d97706, #ea580c);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #b45309, #c2410c);
          }
        `
      }} />
    </div>
  );
}