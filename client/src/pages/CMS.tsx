import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Video, 
  Users, 
  BarChart3, 
  Settings, 
  Shield,
  Home,
  TrendingUp,
  Flag
} from "lucide-react";
import type { VideoType } from "@/types/video";

// Import CMS components
import VideoManager from "@/components/admin/VideoManager";
import UserManager from "@/components/admin/UserManager";
import Analytics from "@/components/admin/Analytics";
import SettingsComponent from "@/components/admin/Settings";
import ContentModeration from "@/components/admin/ContentModeration";

interface DashboardStats {
  totalVideos: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
  activeVideos: number;
  recentUsers: any[];
  recentVideos: VideoType[];
}

export default function CMS() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch dashboard stats
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
    retry: false,
    staleTime: 30000,
  });

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview and key metrics"
    },
    {
      id: "videos",
      label: "Videos",
      icon: Video,
      description: "Manage video content"
    },
    {
      id: "users",
      label: "Users",
      icon: Users,
      description: "Manage user accounts"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "View detailed analytics"
    },
    {
      id: "moderation",
      label: "Moderation",
      icon: Shield,
      description: "Content moderation"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "System configuration"
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent stats={stats} isLoading={isLoading} />;
      case "videos":
        return <VideoManager />;
      case "users":
        return <UserManager />;
      case "analytics":
        return <Analytics />;
      case "moderation":
        return <ContentModeration />;
      case "settings":
        return <SettingsComponent />;
      default:
        return <DashboardContent stats={stats} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">SAANSE CMS</h1>
            <div className="h-6 w-px bg-border" />
            <nav className="flex items-center space-x-4 text-sm">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 space-y-4 p-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {navigationItems.find(item => item.id === activeTab)?.label}
            </h2>
            <p className="text-muted-foreground">
              {navigationItems.find(item => item.id === activeTab)?.description}
            </p>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent({ stats, isLoading }: { stats?: DashboardStats; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeVideos} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Video views
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLikes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              User interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentVideos.slice(0, 5).map((video) => (
                <div key={video.id} className="flex items-center space-x-4">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {video.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.slice(0, 5).map((user: any) => (
                <div key={user.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {user.displayName?.charAt(0) || user.email.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.displayName || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <Video className="h-6 w-6 mb-2" />
              <span>Add New Video</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Shield className="h-6 w-6 mb-2" />
              <span>Content Moderation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}