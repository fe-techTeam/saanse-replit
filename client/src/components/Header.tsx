import { Search, User, Settings, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onSearchClick: () => void;
  onProfileClick: () => void;
}

export function Header({ onSearchClick, onProfileClick }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-b from-dharma-black to-transparent z-50 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Sacred Om symbol */}
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">ॐ</span>
          </div>
          <h1 className="text-2xl font-bold text-red-600 tracking-wide">SAANSE</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search icon */}
          <button 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            onClick={onSearchClick}
            title="Search"
          >
            <Search className="w-6 h-6" />
          </button>
          
          {/* Profile icon */}
          
          {/* Profile icon */}
          <button 
            className="w-8 h-8 bg-dharma-red rounded-full flex items-center justify-center"
            onClick={onProfileClick}
          >
            {isAuthenticated && user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-dharma-white" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
