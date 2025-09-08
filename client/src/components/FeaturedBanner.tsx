import { Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturedBannerProps {
  onPlayClick: () => void;
  onAddToListClick: () => void;
}

export function FeaturedBanner({ onPlayClick, onAddToListClick }: FeaturedBannerProps) {
  return (
    <section className="relative h-64 md:h-80 mb-6">
      {/* Featured content carousel background */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=800')"
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="gradient-overlay absolute inset-0" />
      
      <div className="relative h-full flex items-end p-6">
        <div className="max-w-lg animate-fade-in-up">
          <span className="inline-block px-3 py-1 bg-dharma-red text-dharma-white text-sm font-medium rounded-full mb-2">
            Trending
          </span>
          <h2 className="text-2xl md:text-3xl font-devanagari font-bold mb-2">
            Shrimad Bhagavad Gita
          </h2>
          <p className="text-gray-300 text-sm mb-4">
            Discover the eternal wisdom through animated storytelling. Episode 1: The Battlefield of Life
          </p>
          <div className="flex items-center space-x-3">
            <Button 
              className="bg-white text-black px-6 py-2 hover:bg-gray-200 flex items-center space-x-2"
              onClick={onPlayClick}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play</span>
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white text-white px-6 py-2 hover:bg-white hover:text-black"
              onClick={onAddToListClick}
            >
              <Plus className="w-5 h-5 mr-2" />
              My List
            </Button>
          </div>
        </div>
      </div>
      
      {/* Carousel indicators */}
      <div className="absolute bottom-4 right-6 flex space-x-2">
        <div className="w-2 h-2 bg-dharma-red rounded-full" />
        <div className="w-2 h-2 bg-gray-500 rounded-full" />
        <div className="w-2 h-2 bg-gray-500 rounded-full" />
      </div>
    </section>
  );
}
