# Component Development Rules
# SAANSE - React Components Guidelines

## Component Structure

### File Organization
```
components/
├── ui/                    # shadcn/ui base components
├── layout/               # Layout components (Header, Footer, etc.)
├── video/                # Video-related components
├── auth/                 # Authentication components
├── cms/                  # CMS/admin components
└── common/               # Shared utility components
```

### Component Template
```typescript
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { VideoType } from "@/types/video";

interface ComponentProps {
  videoId: string;
  onPlay?: (video: VideoType) => void;
  className?: string;
}

export default function ComponentName({ 
  videoId, 
  onPlay, 
  className = "" 
}: ComponentProps) {
  const { toast } = useToast();
  const [localState, setLocalState] = useState();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/videos", videoId],
    enabled: !!videoId,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/endpoint", "POST", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Operation completed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">
        Failed to load data
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
}
```

## Component Guidelines

### 1. Props Interface
- Always define TypeScript interfaces for props
- Use descriptive prop names
- Make props optional when appropriate
- Include className for styling flexibility

### 2. State Management
- Use local state for component-specific data
- Use React Query for server state
- Implement proper loading and error states
- Use optimistic updates where beneficial

### 3. Event Handling
- Use descriptive event handler names
- Implement proper event propagation control
- Handle both mouse and keyboard events
- Provide proper accessibility support

### 4. Styling
- Use Tailwind CSS classes
- Follow the design system
- Implement responsive design
- Use semantic color tokens

### 5. Performance
- Use React.memo() for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders
- Use lazy loading for heavy components

## Video Components

### VideoCard Component
```typescript
interface VideoCardProps {
  video: VideoType;
  onPlay: (video: VideoType) => void;
  onFavorite?: (videoId: string) => void;
  isFavorite?: boolean;
  showProgress?: boolean;
  progress?: number;
}

export default function VideoCard({
  video,
  onPlay,
  onFavorite,
  isFavorite = false,
  showProgress = false,
  progress = 0,
}: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group relative cursor-pointer">
      <div className="relative aspect-video overflow-hidden rounded-lg">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {showProgress && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
            <div 
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${(progress / video.duration) * 100}%` }}
            />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
        
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
          {formatDuration(video.duration)}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="lg"
            className="rounded-full w-16 h-16"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(video);
            }}
          >
            <Play className="w-6 h-6 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <h3 className="font-semibold text-white group-hover:text-gray-300 transition-colors line-clamp-1">
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{video.category}</span>
          <div className="flex items-center space-x-2">
            <span>{video.views.toLocaleString()} views</span>
            {onFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(video.id);
                }}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### VideoPlayer Component
```typescript
interface VideoPlayerProps {
  video: VideoType;
  onProgress?: (progress: number) => void;
  onEnd?: () => void;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
}

export default function VideoPlayer({
  video,
  onProgress,
  onEnd,
  autoplay = false,
  controls = true,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnd?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onEnd]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        className="w-full aspect-video rounded-lg"
        controls={controls}
        autoPlay={autoplay}
      />
      
      {!controls && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="rounded-full w-20 h-20 opacity-0 hover:opacity-100 transition-opacity"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
        </div>
      )}
      
      {!controls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between text-white text-sm">
            <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            <Button variant="ghost" size="sm" onClick={togglePlay}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## CMS Components

### VideoForm Component
```typescript
interface VideoFormProps {
  video?: VideoType;
  onSubmit: (data: Omit<VideoType, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function VideoForm({
  video,
  onSubmit,
  onCancel,
  isLoading = false,
}: VideoFormProps) {
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
    },
  });

  const handleSubmit = (data: VideoFormData) => {
    onSubmit({
      ...data,
      tags: data.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      isActive: true,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
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
                    <SelectValue placeholder="Select a category" />
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
        
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
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
            <FormItem>
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
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="krishna, devotion, divine" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Video"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

## Common Patterns

### Loading States
```typescript
// Skeleton loader
export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-700 rounded-lg mb-3" />
      <div className="h-4 bg-gray-700 rounded mb-2" />
      <div className="h-3 bg-gray-700 rounded w-2/3" />
    </div>
  );
}

// Loading spinner
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`} />
    </div>
  );
}
```

### Error Boundaries
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export function ErrorBoundary({ children, fallback: Fallback }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return Fallback ? <Fallback error={error} /> : (
      <div className="text-center p-4 text-destructive">
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => setError(null)}>Try again</Button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallbackComponent={({ error }) => {
        setError(error);
        return null;
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Responsive Design
```typescript
// Responsive grid
export function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {children}
    </div>
  );
}

// Responsive text
export function ResponsiveText({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${className}`}>
      {children}
    </h2>
  );
}
```

## Best Practices

### 1. Component Composition
- Use composition over inheritance
- Create small, focused components
- Pass data down, events up
- Use render props or children for flexibility

### 2. Performance
- Memoize expensive calculations
- Use React.memo() judiciously
- Implement proper key props
- Avoid inline object/function creation

### 3. Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios

### 4. Testing
- Test component behavior, not implementation
- Use meaningful test descriptions
- Test edge cases and error states
- Mock external dependencies

### 5. Documentation
- Document complex components
- Include usage examples
- Explain prop interfaces
- Document any special behavior
