import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Eye, Upload, Settings } from "lucide-react";
import type { VideoType } from "@/types/video";

const categories = [
  "Ramayana", "Mahabharata", "Krishna", "Shiva", "Bhajans", "Explained",
  "Hanuman", "Ganesha", "Devi", "Festivals"
];

interface VideoFormData {
  title: string;
  description: string;
  category: string;
  duration: number;
  thumbnailUrl: string;
  videoUrl: string;
  tags: string;
}

export default function CMS() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    category: "Ramayana",
    duration: 0,
    thumbnailUrl: "",
    videoUrl: "",
    tags: ""
  });

  // Fetch all videos for management
  const { data: videos = [], refetch: refetchVideos } = useQuery<VideoType[]>({
    queryKey: ["/api/videos"],
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: (newVideo: Omit<VideoType, "id" | "likes" | "views" | "createdAt">) => 
      apiRequest("/api/videos", "POST", newVideo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video created successfully",
      });
      resetForm();
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
    mutationFn: ({ id, ...video }: VideoType) => 
      apiRequest(`/api/videos/${id}`, "PATCH", video),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      resetForm();
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
    mutationFn: (id: string) => apiRequest(`/api/videos/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "Ramayana",
      duration: 0,
      thumbnailUrl: "",
      videoUrl: "",
      tags: ""
    });
    setSelectedVideo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoData = {
      ...formData,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      duration: Number(formData.duration),
      isActive: true
    };

    if (selectedVideo) {
      updateVideoMutation.mutate({ ...videoData, id: selectedVideo.id } as VideoType);
    } else {
      createVideoMutation.mutate(videoData);
    }
  };

  const handleEdit = (video: VideoType) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      category: video.category,
      duration: video.duration,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      tags: video.tags?.join(", ") || ""
    });
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Content Management System</h1>
            <p className="text-muted-foreground mt-2">Manage your devotional content library</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Video
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedVideo ? "Edit Video" : "Add New Video"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter video title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      placeholder="120"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                    <Input
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Video URL</label>
                    <Input
                      value={formData.videoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://..."
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter video description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="krishna, devotion, divine, love"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createVideoMutation.isPending || updateVideoMutation.isPending}>
                    {createVideoMutation.isPending || updateVideoMutation.isPending ? "Saving..." : "Save Video"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="videos">Videos ({videos.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="videos" className="mt-6">
            <div className="grid gap-4">
              {videos.map((video) => (
                <Card key={video.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-32 h-18 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                          {video.title}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary">{video.category}</Badge>
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
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(video)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(video)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{videos.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {videos.reduce((sum, video) => sum + video.views, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total Likes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {videos.reduce((sum, video) => sum + video.likes, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Popular Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {categories.map(category => {
                  const categoryVideos = videos.filter(v => v.category === category);
                  const totalViews = categoryVideos.reduce((sum, v) => sum + v.views, 0);
                  return (
                    <Card key={category}>
                      <CardContent className="p-4 text-center">
                        <div className="font-semibold">{category}</div>
                        <div className="text-sm text-muted-foreground">
                          {categoryVideos.length} videos
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {totalViews.toLocaleString()} views
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>App Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Configure app-wide settings and preferences here.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Featured Content</label>
                    <p className="text-sm text-muted-foreground">
                      The most recent videos are automatically featured on the home page.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Categories</label>
                    <p className="text-sm text-muted-foreground">
                      Current categories: {categories.join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}