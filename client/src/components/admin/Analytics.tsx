import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Eye, 
  Heart, 
  Users, 
  TrendingUp, 
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";
import type { VideoType } from "@/types/video";

interface User {
  id: string;
  email: string;
  displayName?: string;
  created_at: string;
  lastLoginAt?: string;
}

interface AnalyticsData {
  totalVideos: number;
  totalUsers: number;
  totalViews: number;
  totalLikes: number;
  categoryStats: Record<string, number>;
  topVideos: VideoType[];
  recentVideos: VideoType[];
  averageViews: number;
  averageLikes: number;
  recentUsers: User[];
}

export default function Analytics() {
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
    retry: false,
    staleTime: 30000,
  });

  // Fetch individual data for more detailed analytics
  const { data: videos = [] } = useQuery<VideoType[]>({
    queryKey: ["/api/admin/videos"],
    retry: false,
    staleTime: 30000,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
    staleTime: 30000,
  });

  // Calculate additional analytics
  const calculatedAnalytics = useMemo(() => {
    if (!videos.length || !users.length) return null;

    const totalVideos = videos.length;
    const totalUsers = users.length;
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
    
    // Category breakdown
    const categoryStats = videos.reduce((acc, video) => {
      acc[video.category] = (acc[video.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Top performing videos
    const topVideos = [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // Recent videos
    const recentVideos = [...videos]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    // Recent users
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    // Engagement metrics
    const averageViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
    const averageLikes = totalVideos > 0 ? Math.round(totalLikes / totalVideos) : 0;
    
    // Growth metrics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentVideosCount = videos.filter(v => 
      new Date(v.created_at) > thirtyDaysAgo
    ).length;
    
    const recentUsersCount = users.filter(u => 
      new Date(u.created_at) > thirtyDaysAgo
    ).length;

    return {
      totalVideos,
      totalUsers,
      totalViews,
      totalLikes,
      categoryStats,
      topVideos,
      recentVideos,
      recentUsers,
      averageViews,
      averageLikes,
      recentVideosCount,
      recentUsersCount,
    };
  }, [videos, users]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const data = analytics || calculatedAnalytics;
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No data available</div>
      </div>
    );
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            <div className="text-2xl font-bold">{data.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              {data.recentVideos.length} added this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.averageViews} avg per video
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalLikes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.averageLikes} avg per video
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {data.recentUsers.length} joined this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.categoryStats).map(([category, count]) => {
                const percentage = ((count / data.totalVideos) * 100).toFixed(1);
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} videos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topVideos.slice(0, 5).map((video, index) => (
                <div key={video.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {video.views.toLocaleString()} views • {video.likes} likes
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {video.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Recent Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentVideos.map((video) => (
                <div key={video.id} className="flex items-center space-x-4">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-12 h-8 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {video.category}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDuration(video.duration)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentUsers.map((user) => (
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
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Engagement Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.averageViews}
              </div>
              <p className="text-sm text-muted-foreground">Average Views per Video</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.averageLikes}
              </div>
              <p className="text-sm text-muted-foreground">Average Likes per Video</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {data.totalVideos > 0 ? ((data.totalLikes / data.totalViews) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Like-to-View Ratio</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
