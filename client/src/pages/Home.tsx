import { useQuery } from "@tanstack/react-query";
import { Play, Plus, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  const typedVideos = videos as any[];
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center', animation: 'pulse 2s infinite' }}>
          <div style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold', 
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            SAANSE
          </div>
          <div style={{ color: '#FFD700', fontSize: '1.5rem' }}>
            Loading Netflix-Quality Divine Stories...
          </div>
          <div style={{ 
            marginTop: '2rem',
            width: '300px',
            height: '4px',
            backgroundColor: '#333',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #FFD700, #FFA500)',
              animation: 'loading 2s infinite'
            }}></div>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          `
        }} />
      </div>
    );
  }

  // Get featured video (highest views)
  const featuredVideo = typedVideos.reduce((prev: any, current: any) => {
    return (prev?.views || 0) > (current?.views || 0) ? prev : current;
  }, typedVideos[0] || null);

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    console.log("Playing video:", video.title);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white' }}>
      {/* NETFLIX HERO SECTION */}
      {featuredVideo && (
        <div style={{ 
          position: 'relative', 
          height: '80vh', 
          width: '100%', 
          overflow: 'hidden',
          backgroundImage: `url(${featuredVideo.thumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,10,1) 100%)'
          }} />
          
          <div style={{ 
            position: 'relative', 
            zIndex: 10, 
            maxWidth: '600px', 
            padding: '0 4rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <h1 style={{ 
              fontSize: '4rem', 
              fontWeight: 'bold', 
              lineHeight: 1.1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
            }}>
              {featuredVideo.title}
            </h1>
            
            <p style={{ 
              fontSize: '1.25rem', 
              lineHeight: 1.6, 
              color: '#e0e0e0',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              {featuredVideo.description}
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  backgroundColor: 'white',
                  color: 'black',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => handleVideoClick(featuredVideo)}
              >
                <Play size={24} fill="black" />
                Play
              </button>
              
              <button 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 2rem',
                  backgroundColor: 'rgba(109, 109, 110, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => console.log("More info:", featuredVideo.title)}
              >
                <Info size={24} />
                More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NETFLIX CONTENT ROWS */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        marginTop: '-200px',
        paddingTop: '200px',
        background: 'linear-gradient(180deg, transparent 0%, #0a0a0a 50%)',
        paddingBottom: '3rem'
      }}>
        {/* Trending Stories */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '600', 
            color: '#FFD700',
            marginBottom: '1rem',
            paddingLeft: '4rem'
          }}>
            🔥 Trending Divine Stories
          </h2>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            overflowX: 'auto', 
            paddingLeft: '4rem',
            paddingBottom: '1rem'
          }}>
            {typedVideos
              .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
              .slice(0, 12)
              .map((video: any) => (
              <div 
                key={video.id}
                style={{ 
                  minWidth: '300px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#1a1a1a'
                }}
                onClick={() => handleVideoClick(video)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    {Math.floor((video.duration || 0) / 60)}m
                  </div>
                </div>
                
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: 'white',
                    lineHeight: 1.4
                  }}>
                    {video.title}
                  </h3>
                  
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#b3b3b3',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {video.description}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #333',
                    fontSize: '0.75rem',
                    color: '#999'
                  }}>
                    <span>{((video.views || 0) / 1000).toFixed(0)}K views</span>
                    <span style={{ 
                      backgroundColor: '#FFD700',
                      color: '#000',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontSize: '0.625rem'
                    }}>
                      {video.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Loved Episodes */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '600', 
            color: '#FFD700',
            marginBottom: '1rem',
            paddingLeft: '4rem'
          }}>
            ⭐ Most Loved Episodes
          </h2>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            overflowX: 'auto', 
            paddingLeft: '4rem',
            paddingBottom: '1rem'
          }}>
            {typedVideos
              .sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0))
              .slice(0, 12)
              .map((video: any) => (
              <div 
                key={video.id}
                style={{ 
                  minWidth: '300px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#1a1a1a'
                }}
                onClick={() => handleVideoClick(video)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <div style={{ padding: '1rem' }}>
                  <h3 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: 'white'
                  }}>
                    {video.title}
                  </h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: '#999'
                  }}>
                    <span>{((video.likes || 0) / 1000).toFixed(0)}K likes</span>
                    <span style={{ 
                      backgroundColor: '#FFD700',
                      color: '#000',
                      padding: '2px 6px',
                      borderRadius: '12px'
                    }}>
                      {video.category}
                    </span>
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
            <div key={category} style={{ marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '600', 
                color: '#FFD700',
                marginBottom: '1rem',
                paddingLeft: '4rem'
              }}>
                📿 {category} Chronicles
              </h2>
              
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                overflowX: 'auto', 
                paddingLeft: '4rem',
                paddingBottom: '1rem'
              }}>
                {categoryVideos.map((video: any) => (
                  <div 
                    key={video.id}
                    style={{ 
                      minWidth: '300px',
                      cursor: 'pointer',
                      transition: 'transform 0.3s',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#1a1a1a'
                    }}
                    onClick={() => handleVideoClick(video)}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '600', 
                        marginBottom: '0.5rem',
                        color: 'white'
                      }}>
                        {video.title}
                      </h3>
                      
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: '#999'
                      }}>
                        {((video.views || 0) / 1000).toFixed(0)}K views • {((video.likes || 0) / 1000).toFixed(0)}K likes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}