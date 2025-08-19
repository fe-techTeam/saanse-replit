import { useState } from "react";
import { Header } from "@/components/Header";
import { FeaturedBanner } from "@/components/FeaturedBanner";
import { CategorySection } from "@/components/CategorySection";
import { BottomNavigation } from "@/components/BottomNavigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SearchModal } from "@/components/SearchModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import type { VideoType } from "@/types/video";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const categories = [
    { title: "Ramayana Stories", devanagari: "रामायण कथा", category: "Ramayana" },
    { title: "Krishna Stories", devanagari: "श्रीकृष्ण लीला", category: "Krishna" },
    { title: "Bhajans & Aartis", devanagari: "भजन और आरती", category: "Bhajans" },
    { title: "Mahabharata", devanagari: "महाभारत गाथा", category: "Mahabharata" },
    { title: "Lord Shiva", devanagari: "भोलेनाथ की कथा", category: "Shiva" },
    { title: "Explained", devanagari: "व्याख्या", category: "Explained" },
  ];

  const handleVideoClick = (video: VideoType) => {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const handleCloseVideoPlayer = () => {
    setIsVideoPlayerOpen(false);
    setSelectedVideo(null);
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
  };

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  const handleFeaturedPlay = () => {
    // Create a mock featured video for demo
    const featuredVideo: VideoType = {
      id: "featured",
      title: "Shrimad Bhagavad Gita - Episode 1",
      description: "The eternal wisdom through animated storytelling. The Battlefield of Life",
      category: "Explained",
      duration: 600,
      thumbnailUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=225&fit=crop",
      videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
      likes: 0,
      views: 0,
      tags: ["bhagavad", "gita", "wisdom", "krishna"],
      isActive: true,
      createdAt: new Date(),
    };
    handleVideoClick(featuredVideo);
  };

  const handleAddToList = () => {
    // TODO: Implement add to playlist functionality
    console.log("Add to list clicked");
  };

  return (
    <div className="min-h-screen bg-dharma-dark">
      <Header 
        onSearchClick={handleSearchClick}
        onProfileClick={handleProfileClick}
      />

      <main className="pt-20 pb-20">
        <FeaturedBanner 
          onPlayClick={handleFeaturedPlay}
          onAddToListClick={handleAddToList}
        />

        {categories.map((category) => (
          <CategorySection
            key={category.category}
            title={category.title}
            devanagariTitle={category.devanagari}
            category={category.category}
            onVideoClick={handleVideoClick}
            onViewAllClick={() => console.log(`View all ${category.category}`)}
          />
        ))}
      </main>

      <BottomNavigation />
      
      <VideoPlayer
        video={selectedVideo}
        isOpen={isVideoPlayerOpen}
        onClose={handleCloseVideoPlayer}
      />
      
      <SearchModal
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onVideoClick={handleVideoClick}
      />
      
      <PWAInstallPrompt />
    </div>
  );
}
