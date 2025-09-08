import { Play, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroVideoProps {
  title: string;
  description: string;
  backgroundImage: string;
  onPlay: () => void;
  onAddToList: () => void;
  onMoreInfo: () => void;
}

export function NetflixHero({ title, description, backgroundImage, onPlay, onAddToList, onMoreInfo }: HeroVideoProps) {
  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center 25%'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dharma-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-4 md:px-12 lg:px-16">
        <div className="max-w-2xl space-y-6">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-lg drop-shadow-lg">
            {description}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-dharma-red text-dharma-white hover:bg-dharma-red-dark font-semibold px-8 py-3 text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={onPlay}
            >
              <Play className="w-6 h-6 mr-2 fill-white" />
              Play
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-dharma-gray/70 text-dharma-white hover:bg-dharma-gray font-semibold px-8 py-3 text-lg backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={onMoreInfo}
            >
              <Info className="w-6 h-6 mr-2" />
              More Info
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-dharma-white/70 text-dharma-white hover:bg-dharma-white hover:text-dharma-black font-semibold px-8 py-3 text-lg backdrop-blur-sm transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={onAddToList}
            >
              <Plus className="w-6 h-6 mr-2" />
              My List
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}