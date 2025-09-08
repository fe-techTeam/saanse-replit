import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { User, LogIn, LogOut, Settings, Heart, Clock, Eye } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, supabaseUser, isAuthenticated, signIn, signOut, loading } = useAuth();

  const handleProfileClick = () => {
    // Already on profile page
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dharma-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-dharma-gold rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dharma-dark">
        <Header 
          onSearchClick={() => setLocation("/search")}
          onProfileClick={handleProfileClick}
        />

        <main className="pt-20 pb-20 flex items-center justify-center">
          <div className="text-center p-6 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-dharma-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-dharma-dark" />
            </div>
            
            <h2 className="text-2xl font-devanagari font-bold text-dharma-gold mb-2">
              Welcome to Dharma Stream
            </h2>
            
            <p className="text-gray-400 mb-6">
              Sign in to save your favorite devotional content and sync across devices
            </p>
            
            <Button
              onClick={() => signIn()}
              className="w-full bg-dharma-gold text-dharma-dark hover:bg-dharma-gold-light flex items-center justify-center space-x-2 py-3"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign in with Google</span>
            </Button>

            <div className="mt-8 space-y-4">
              <Card className="bg-dharma-dark-light border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-6 h-6 text-dharma-gold" />
                    <div>
                      <h3 className="text-white font-medium">Save Favorites</h3>
                      <p className="text-gray-400 text-sm">Keep track of your favorite content</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dharma-dark-light border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-dharma-gold" />
                    <div>
                      <h3 className="text-white font-medium">Watch Later</h3>
                      <p className="text-gray-400 text-sm">Save videos for later viewing</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-dharma-dark-light border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-6 h-6 text-dharma-gold" />
                    <div>
                      <h3 className="text-white font-medium">View History</h3>
                      <p className="text-gray-400 text-sm">Continue watching where you left off</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dharma-dark">
      <Header 
        onSearchClick={() => setLocation("/search")}
        onProfileClick={handleProfileClick}
      />

      <main className="pt-20 pb-20">
        <div className="p-4">
          {/* User Profile Header */}
          <div className="text-center mb-8">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-dharma-gold"
              />
            ) : (
              <div className="w-20 h-20 bg-dharma-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-dharma-dark" />
              </div>
            )}
            
            <h1 className="text-xl font-semibold text-white mb-1">
              {user?.displayName || "Dharma Devotee"}
            </h1>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>

          {/* Profile Options */}
          <div className="space-y-4">
            <Card className="bg-dharma-dark-light border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-dharma-gold font-devanagari">Library</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setLocation("/library")}
                >
                  <Heart className="w-6 h-6 text-dharma-gold" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">Favorites</h3>
                    <p className="text-gray-400 text-sm">Your liked videos</p>
                  </div>
                </button>

                <button 
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setLocation("/library")}
                >
                  <Clock className="w-6 h-6 text-dharma-gold" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">Watch Later</h3>
                    <p className="text-gray-400 text-sm">Saved for later</p>
                  </div>
                </button>

                <button 
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => setLocation("/library")}
                >
                  <Eye className="w-6 h-6 text-dharma-gold" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">View History</h3>
                    <p className="text-gray-400 text-sm">Recently watched</p>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card className="bg-dharma-dark-light border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-dharma-gold font-devanagari">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-700 rounded-lg transition-colors">
                  <Settings className="w-6 h-6 text-gray-400" />
                  <div className="text-left">
                    <h3 className="text-white font-medium">App Settings</h3>
                    <p className="text-gray-400 text-sm">Notifications, language & more</p>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card className="bg-dharma-dark-light border-gray-700">
              <CardContent className="p-4">
                <Button
                  onClick={signOut}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* App Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2">Dharma Stream v1.0.0</p>
            <p className="text-gray-500 text-xs">Bringing devotional wisdom to your fingertips</p>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
