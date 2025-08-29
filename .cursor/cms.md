# CMS & Admin Panel Development Rules
# MythosStream - Content Management System Guidelines

## CMS Overview

The MythosStream CMS provides comprehensive content management capabilities for:
- Video content management
- User management
- Analytics and reporting
- System configuration
- Content moderation

## CMS Architecture

### File Organization
```
client/src/
├── pages/
│   └── CMS.tsx              # Main CMS page
├── components/
│   ├── cms/                 # CMS-specific components
│   │   ├── VideoManager.tsx
│   │   ├── UserManager.tsx
│   │   ├── Analytics.tsx
│   │   ├── Settings.tsx
│   │   └── Moderation.tsx
│   └── ui/                  # Reusable UI components
└── hooks/
    └── useCMS.ts            # CMS-specific hooks
```

## CMS Components Guidelines

### 1. Main CMS Layout

```typescript
interface CMSLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function CMSLayout({ children, title, subtitle }: CMSLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* CMS Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">SAANSE CMS</h1>
            <div className="h-6 w-px bg-border" />
            <nav className="flex items-center space-x-4 text-sm">
              <a href="/cms" className="font-medium">Dashboard</a>
              <a href="/cms/videos" className="text-muted-foreground">Videos</a>
              <a href="/cms/users" className="text-muted-foreground">Users</a>
              <a href="/cms/analytics" className="text-muted-foreground">Analytics</a>
            </nav>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* CMS Content */}
      <div className="flex-1 space-y-4 p-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {children}
      </div>
    </div>
  );
}
```

### 2. Video Management Component

```typescript
interface VideoManagerProps {
  onVideoSelect?: (video: VideoType) => void;
}

export default function VideoManager({ onVideoSelect }: VideoManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    status: "all"
  });

  // Fetch videos with filters
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["/api/videos", filters],
    queryFn: () => apiRequest("/api/videos"),
  });

  // Filter videos based on search and category
  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesCategory = !filters.category || video.category === filters.category;
      const matchesSearch = !filters.search || 
        video.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        video.description?.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "all" || 
        (filters.status === "active" && video.isActive) ||
        (filters.status === "inactive" && !video.isActive);
      
      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [videos, filters]);

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: (data: VideoFormData) => apiRequest("/api/videos", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
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
      apiRequest(`/api/videos/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
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

  const handleEdit = (video: VideoType) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const handleDelete = (video: VideoType) => {
    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
      deleteVideoMutation.mutate(video.id);
    }
  };

  const handleBulkAction = (action: string, videoIds: string[]) => {
    switch (action) {
      case "delete":
        if (confirm(`Are you sure you want to delete ${videoIds.length} videos?`)) {
          videoIds.forEach(id => deleteVideoMutation.mutate(id));
        }
        break;
      case "activate":
        videoIds.forEach(id => 
          updateVideoMutation.mutate({ id, isActive: true } as VideoType)
        );
        break;
      case "deactivate":
        videoIds.forEach(id => 
          updateVideoMutation.mutate({ id, isActive: false } as VideoType)
        );
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search videos..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-64"
          />
          
          <Select value={filters.category} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, category: value }))
          }>
            <SelectTrigger className="w-48">
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
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Video
        </Button>
      </div>

      {/* Video Grid */}
      <div className="grid gap-6">
        {filteredVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onEdit={() => handleEdit(video)}
            onDelete={() => handleDelete(video)}
            onSelect={onVideoSelect}
          />
        ))}
      </div>

      {/* Video Form Dialog */}
      <VideoFormDialog
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
      />
    </div>
  );
}
```

### 3. Video Form Dialog

```typescript
interface VideoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: VideoType | null;
  onSubmit: (data: VideoFormData) => void;
  isLoading?: boolean;
}

export default function VideoFormDialog({
  open,
  onOpenChange,
  video,
  onSubmit,
  isLoading = false
}: VideoFormDialogProps) {
  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: video?.title || "",
      description: video?.description || "",
      category: video?.category || "Ramayana",
      duration: video?.duration || 0,
      thumbnailUrl: video?.thumbnailUrl || "",
      videoUrl: video?.videoUrl || "",
      tags: video?.tags?.join(", ") || "",
      isActive: video?.isActive ?? true,
    },
  });

  const handleSubmit = (data: VideoFormData) => {
    onSubmit({
      ...data,
      tags: data.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      duration: Number(data.duration),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {video ? "Edit Video" : "Add New Video"}
          </DialogTitle>
          <DialogDescription>
            {video ? "Update video information" : "Create a new video entry"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter video title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Video URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter video description" 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="krishna, devotion, divine" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this video visible to users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : (video ? "Update Video" : "Create Video")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. Analytics Dashboard

```typescript
export default function AnalyticsDashboard() {
  const { data: videos = [] } = useQuery({
    queryKey: ["/api/videos"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
    const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0);
    const totalUsers = users.length;
    
    // Category breakdown
    const categoryStats = videos.reduce((acc, video) => {
      acc[video.category] = (acc[video.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Top performing videos
    const topVideos = [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // Recent activity
    const recentVideos = [...videos]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    
    return {
      totalVideos,
      totalViews,
      totalLikes,
      totalUsers,
      categoryStats,
      topVideos,
      recentVideos,
      averageViews: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
      averageLikes: totalVideos > 0 ? Math.round(totalLikes / totalVideos) : 0,
    };
  }, [videos, users]);

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
            <div className="text-2xl font-bold">{analytics.totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              Active content library
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
              {analytics.totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageViews} avg per video
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
              {analytics.totalLikes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageLikes} avg per video
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={analytics.categoryStats} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topVideos.map((video, index) => (
                <div key={video.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {video.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentVideos.map((video) => (
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
                <Badge variant="secondary">{video.category}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. User Management Component

```typescript
export default function UserManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    role: "all"
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !filters.search || 
        user.displayName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesSearch;
    });
  }, [users, filters]);

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...data }: User) => 
      apiRequest(`/api/users/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/users/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.displayName || user.email}"?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-64"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.displayName || "Anonymous"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(user)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <UserFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={selectedUser}
        onSubmit={(data) => {
          if (selectedUser) {
            updateUserMutation.mutate({ ...data, id: selectedUser.id } as User);
          }
        }}
        isLoading={updateUserMutation.isPending}
      />
    </div>
  );
}
```

## CMS Features

### 1. Content Moderation

```typescript
export default function ContentModeration() {
  const [reportedContent, setReportedContent] = useState<ReportedContent[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportedContent | null>(null);

  const handleModerationAction = async (action: string, contentId: string) => {
    try {
      await apiRequest(`/api/moderation/${contentId}`, "POST", { action });
      
      toast({
        title: "Success",
        description: `Content ${action} successfully`,
      });
      
      // Refresh reported content
      // fetchReportedContent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate content",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <CardDescription>
            Review and moderate reported content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportedContent.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{report.contentTitle}</h4>
                    <p className="text-sm text-muted-foreground">
                      Reported by {report.reportedBy} on {new Date(report.reportedAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Reason: {report.reason}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerationAction("approve", report.contentId)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerationAction("remove", report.contentId)}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. System Settings

```typescript
export default function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: "SAANSE",
    siteDescription: "Divine Stories Platform",
    maintenanceMode: false,
    allowRegistration: true,
    maxVideoDuration: 600,
    allowedVideoFormats: ["mp4", "webm"],
    emailNotifications: true,
  });

  const updateSettings = async (newSettings: typeof settings) => {
    try {
      await apiRequest("/api/settings", "PATCH", newSettings);
      
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      
      setSettings(newSettings);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure basic site settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Description</Label>
              <Input
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
            />
            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="allowRegistration"
              checked={settings.allowRegistration}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRegistration: checked }))}
            />
            <Label htmlFor="allowRegistration">Allow User Registration</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Settings</CardTitle>
          <CardDescription>
            Configure content upload and display settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="maxVideoDuration">Maximum Video Duration (seconds)</Label>
            <Input
              id="maxVideoDuration"
              type="number"
              value={settings.maxVideoDuration}
              onChange={(e) => setSettings(prev => ({ ...prev, maxVideoDuration: parseInt(e.target.value) }))}
            />
          </div>
          
          <div>
            <Label>Allowed Video Formats</Label>
            <div className="flex space-x-2 mt-2">
              {["mp4", "webm", "avi", "mov"].map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={format}
                    checked={settings.allowedVideoFormats.includes(format)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSettings(prev => ({
                          ...prev,
                          allowedVideoFormats: [...prev.allowedVideoFormats, format]
                        }));
                      } else {
                        setSettings(prev => ({
                          ...prev,
                          allowedVideoFormats: prev.allowedVideoFormats.filter(f => f !== format)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={format}>{format.toUpperCase()}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => updateSettings(settings)}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
```

## CMS Best Practices

### 1. Security
- Implement role-based access control (RBAC)
- Validate all user inputs
- Use proper authentication for admin actions
- Log all admin activities
- Implement session management

### 2. Performance
- Use pagination for large datasets
- Implement caching for frequently accessed data
- Optimize database queries
- Use lazy loading for components
- Implement proper error boundaries

### 3. User Experience
- Provide clear feedback for all actions
- Use loading states appropriately
- Implement proper form validation
- Provide undo/redo functionality where possible
- Use consistent UI patterns

### 4. Accessibility
- Ensure keyboard navigation works
- Use proper ARIA labels
- Maintain color contrast ratios
- Provide alternative text for images
- Test with screen readers

### 5. Testing
- Write unit tests for all components
- Test form validation
- Test error handling
- Test user permissions
- Test responsive design

This comprehensive CMS development guide should help maintain consistency and quality across the MythosStream admin panel development.
