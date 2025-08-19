import { Home, Search, Bookmark, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/library", icon: Bookmark, label: "Library" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dharma-dark-light border-t border-gray-800 px-4 py-2">
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} href={path}>
            <div className={`flex flex-col items-center space-y-1 py-2 ${
              location === path ? "text-dharma-gold" : "text-gray-400"
            }`}>
              <Icon className="w-6 h-6" />
              <span className="text-xs">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
