import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Eye, MoreHorizontal, Filter, Download } from "lucide-react";
import type { VideoType } from "@/types/video";
// import VideoFormDialog from "./VideoFormDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const categories = [
  "Ramayana", "Mahabharata", "Krishna", "Shiva", "Bhajans", "Explained",
  "Hanuman", "Ganesha", "Devi", "Festivals"
];

interface VideoManagerProps {
  onVideoSelect?: (video: VideoType) => void;
}

export default function VideoManager({ onVideoSelect }: VideoManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getAuthHeaders } = useAdminAuth();
  
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  // Fetch videos with admin endpoint
  const { data: videos = [], isLoading, error } = useQuery<VideoType[]>({
    queryKey: ["/api/admin/videos"],
    retry: false, // Don't retry on auth errors
    staleTime: 30000, // Cache for 30 seconds
  });

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let filtered = videos.filter(video => {
      const matchesCategory = !filters.category || video.category === filters.category;
      const matchesSearch = !filters.search || 
        video.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        video.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "all" || 
        (filters.status === "active" && video.isActive) ||
        (filters.status === "inactive" && !video.isActive);
      
      return matchesCategory && matchesSearch && matchesStatus;
    });

    // Sort videos
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "views":
          aValue = a.views;
          bValue = b.views;
          break;
        case "likes":
          aValue = a.likes;
          bValue = b.likes;
          break;
        case "duration":
          aValue = a.duration;
          bValue = b.duration;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [videos, filters]);

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: (data: Omit<VideoType, "id" | "likes" | "views" | "createdAt">) => 
      apiRequest("/api/admin/videos", "POST", data, getAuthHeaders()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({
        title: "Success",
        description: "Video created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create video",
        variant: "destructive"
      });
    }
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: ({ id, ...data }: VideoType) => 
      apiRequest(`/api/admin/videos/${id}`, "PATCH", data, getAuthHeaders()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive"
      });
    }
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/videos/${id}`, "DELETE", undefined, getAuthHeaders()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/videos"] });
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive"
      });
    }
  });

  // Bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedVideos.length === 0) {
      toast({
        title: "Warning",
        description: "Please select videos first",
        variant: "destructive"
      });
      return;
    }

    switch (action) {
      case "delete":
        if (confirm(`Are you sure you want to delete ${selectedVideos.length} videos?`)) {
          selectedVideos.forEach(id => deleteVideoMutation.mutate(id));
          setSelectedVideos([]);
        }
        break;
      case "activate":
        selectedVideos.forEach(id => 
          updateVideoMutation.mutate({ id, isActive: true } as VideoType)
        );
        setSelectedVideos([]);
        break;
      case "deactivate":
        selectedVideos.forEach(id => 
          updateVideoMutation.mutate({ id, isActive: false } as VideoType)
        );
        setSelectedVideos([]);
        break;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVideos(filteredVideos.map(v => v.id));
    } else {
      setSelectedVideos([]);
    }
  };

  const handleSelectVideo = (videoId: string, checked: boolean) => {
    if (checked) {
      setSelectedVideos(prev => [...prev, videoId]);
    } else {
      setSelectedVideos(prev => prev.filter(id => id !== videoId));
    }
  };

  const handleEdit = (video: VideoType) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const handleDelete = (video: VideoType) => {
    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
      deleteVideoMutation.mutate(video.id);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">
          Error loading videos. Please check your authentication.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Input
            placeholder="Search videos..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full sm:w-64"
          />
          
          <Select value={filters.category} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, category: value }))
          }>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filters.status} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, status: value }))
          }>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          {selectedVideos.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Bulk Actions ({selectedVideos.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction("activate")}>
                  Activate Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("deactivate")}>
                  Deactivate Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("delete")}>
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Video
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-4 items-center">
        <Select value={filters.sortBy} onValueChange={(value) => 
          setFilters(prev => ({ ...prev, sortBy: value }))
        }>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="views">Views</SelectItem>
            <SelectItem value="likes">Likes</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters(prev => ({ 
            ...prev, 
            sortOrder: prev.sortOrder === "asc" ? "desc" : "asc" 
          }))}
        >
          {filters.sortOrder === "asc" ? "↑" : "↓"}
        </Button>
      </div>

      {/* Video Grid */}
      <div className="space-y-4">
        {filteredVideos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">No videos found</div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center space-x-2 p-2">
              <Checkbox
                checked={selectedVideos.length === filteredVideos.length && filteredVideos.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select All ({filteredVideos.length} videos)
              </span>
            </div>

            {/* Video List */}
            {filteredVideos.map((video) => (
              <Card key={video.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedVideos.includes(video.id)}
                      onCheckedChange={(checked) => handleSelectVideo(video.id, checked as boolean)}
                    />
                    
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-32 h-18 object-cover rounded-lg cursor-pointer"
                      onClick={() => onVideoSelect?.(video)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                            {video.title}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant={video.isActive ? "default" : "secondary"}>
                              {video.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{video.category}</Badge>
                            <Badge variant="outline">{formatDuration(video.duration)}</Badge>
                            <Badge variant="outline">{video.views} views</Badge>
                            <Badge variant="outline">{video.likes} likes</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {video.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {video.tags?.map((tag, index) => (
                              <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Created: {new Date(video.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onVideoSelect?.(video)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(video)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(video)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* Video Form Dialog - Temporarily disabled */}
      {/* <VideoFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        video={selectedVideo}
        onSubmit={(data) => {
          if (selectedVideo) {
            updateVideoMutation.mutate({ ...data, id: selectedVideo.id } as VideoType);
          } else {
            createVideoMutation.mutate(data);
          }
        }}
        isLoading={createVideoMutation.isPending || updateVideoMutation.isPending}
      /> */}
    </div>
  );
}
