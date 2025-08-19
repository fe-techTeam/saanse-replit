import { useQuery } from "@tanstack/react-query";
import { NetflixHero } from "@/components/NetflixHero";
import { NetflixRow } from "@/components/NetflixRow";
import { useState } from "react";

// Force new interface by clearing any component cache
if (typeof window !== 'undefined') {
  console.log('SAANSE Netflix Interface Loading...');
}

const categories = [
  "Ramayana", "Mahabharata", "Krishna", "Shiva", "Bhajans", "Explained",
  "Hanuman", "Ganesha", "Devi", "Festivals"
];

export default function Home() {
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos"]
  });

  // Type assertion for videos data
  const typedVideos = videos as any[];
  
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            SAANSE
          </div>
          <div className="text-yellow-400 text-xl">Loading Netflix-Quality Divine Stories...</div>
          <div className="mt-4 w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get featured video (highest views)
  const featuredVideo = typedVideos.reduce((prev: any, current: any) => {
    return (prev.views > current.views) ? prev : current;
  }, typedVideos[0] || null);

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    // In a real app, this would navigate to video player
    console.log("Playing video:", video.title);
  };

  return (
    <div className="min-h-screen bg-dharma-dark">
      {/* Netflix-style Hero Section */}
      {featuredVideo && (
        <NetflixHero
          title={featuredVideo.title}
          description={featuredVideo.description}
          backgroundImage={featuredVideo.thumbnailUrl}
          onPlay={() => handleVideoClick(featuredVideo)}
          onAddToList={() => console.log("Added to list:", featuredVideo.title)}
          onMoreInfo={() => console.log("More info:", featuredVideo.title)}
        />
      )}

      {/* Netflix-style Content Rows */}
      <div className="relative z-10 -mt-32 bg-gradient-to-t from-dharma-dark via-dharma-dark/95 to-transparent">
        <div className="pt-32 pb-12 space-y-8">
          {/* Trending Now */}
          <NetflixRow
            title="🔥 Trending Divine Stories"
            videos={typedVideos
              .sort((a: any, b: any) => b.views - a.views)
              .slice(0, 12)
            }
            onVideoClick={handleVideoClick}
          />

          {/* Popular Episodes */}
          <NetflixRow
            title="⭐ Most Loved Episodes"
            videos={typedVideos
              .sort((a: any, b: any) => b.likes - a.likes)
              .slice(0, 12)
            }
            onVideoClick={handleVideoClick}
          />

          {/* Category Rows */}
          {categories.map(category => {
            const categoryVideos = typedVideos.filter((video: any) => video.category === category);
            if (categoryVideos.length === 0) return null;
            
            return (
              <NetflixRow
                key={category}
                title={`📿 ${category} Chronicles`}
                videos={categoryVideos}
                onVideoClick={handleVideoClick}
              />
            );
          })}

          {/* New Releases */}
          <NetflixRow
            title="✨ Recently Added"
            videos={typedVideos
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 12)
            }
            onVideoClick={handleVideoClick}
          />

          {/* Devotional Bhajans */}
          <NetflixRow
            title="🎵 Sacred Melodies"
            videos={typedVideos
              .filter((video: any) => video.category === "Bhajans")
              .sort((a: any, b: any) => b.views - a.views)
            }
            onVideoClick={handleVideoClick}
          />

          {/* Educational Content */}
          <NetflixRow
            title="📚 Spiritual Wisdom"
            videos={typedVideos
              .filter((video: any) => video.category === "Explained")
              .sort((a: any, b: any) => b.likes - a.likes)
            }
            onVideoClick={handleVideoClick}
          />
        </div>
      </div>
    </div>
  );
}