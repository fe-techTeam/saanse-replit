import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSeries } from "@/hooks/useSeries";
import { useAllSeriesVideos } from "@/hooks/useAllSeriesVideos";
import type { VideoType, SeriesType } from "@/types/video";

const categories = [
  "Ramayana", "Mahabharata", "Krishna", "Shiva", "Bhajans", "Explained",
  "Hanuman", "Ganesha", "Devi", "Festivals"
];

const videoFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.enum(categories as [string, ...string[]]),
  duration: z.number().min(1, "Duration must be at least 1 second"),
  thumbnail_url: z.string().url("Must be a valid URL"),
  video_url: z.string().url("Must be a valid URL"),
  tags: z.string().optional(),
  is_active: z.boolean().default(true),
  content_type: z.enum(['standalone', 'series']).default('standalone'),
  series_id: z.string().optional(),
  episode_number: z.number().min(1, "Episode number must be at least 1").optional(),
}).refine((data) => {
  // If content_type is 'series', series_id is required
  if (data.content_type === 'series' && !data.series_id) {
    return false;
  }
  return true;
}, {
  message: "Series is required when content type is 'Part of Series'",
  path: ["series_id"],
}).refine((data) => {
  // If content_type is 'series', episode_number is required
  if (data.content_type === 'series' && (!data.episode_number || data.episode_number < 1)) {
    return false;
  }
  return true;
}, {
  message: "Episode number is required and must be at least 1 for series content",
  path: ["episode_number"],
});

type VideoFormData = z.infer<typeof videoFormSchema>;

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
  const { data: series = [] } = useSeries();
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
  
  // Fetch ALL videos for the selected series to determine next episode number
  // This includes both active and inactive videos to avoid database constraint violations
  const { data: seriesVideos = [], isLoading: isLoadingVideos, error: videosError } = useAllSeriesVideos(
    selectedSeriesId, 
    !!selectedSeriesId
  );

  const form = useForm<VideoFormData>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "Ramayana",
      duration: 0,
      thumbnail_url: "",
      video_url: "",
      tags: "",
      is_active: true,
      content_type: 'standalone' as const,
      series_id: "",
      episode_number: undefined,
    },
  });

  // Reset form when video changes
  useEffect(() => {
    if (video) {
      const seriesId = video.series_id || "";
      setSelectedSeriesId(seriesId);
      form.reset({
        title: video.title,
        description: video.description || "",
        category: video.category,
        duration: video.duration,
        thumbnail_url: video.thumbnail_url,
        video_url: video.video_url,
        tags: video.tags?.join(", ") || "",
        is_active: video.is_active ?? true,
        content_type: video.content_type || 'standalone',
        series_id: seriesId,
        episode_number: video.episode_number,
      });
    } else {
      setSelectedSeriesId("");
      form.reset({
        title: "",
        description: "",
        category: "Ramayana",
        duration: 0,
        thumbnail_url: "",
        video_url: "",
        tags: "",
        is_active: true,
        content_type: 'standalone' as const,
        series_id: "",
        episode_number: undefined,
      });
    }
  }, [video, form]);

  // Handle series selection change
  const handleSeriesChange = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    form.setValue("series_id", seriesId);
    
    // Don't auto-fill episode number - let user choose
    // Clear episode number when series changes
    form.setValue("episode_number", undefined);
  };

  // Get available episode numbers for selection
  const getAvailableEpisodeNumbers = (seriesId: string): number[] => {
    // Ensure seriesVideos is an array
    if (!Array.isArray(seriesVideos) || seriesVideos.length === 0) {
      return [1];
    }
    
    // Get active videos only to determine the current sequence
    const activeVideos = seriesVideos.filter(v => v.is_active);
    const activeEpisodeNumbers = activeVideos.map(v => v.episode_number || 0);
    
    // Find the highest active episode number
    const maxActiveEpisode = activeEpisodeNumbers.length > 0 ? Math.max(...activeEpisodeNumbers) : 0;
    
    // For episode selection, allow inserting at any position in the current sequence
    // plus one position at the end
    const availableEpisodes = [];
    for (let i = 1; i <= maxActiveEpisode + 1; i++) {
      availableEpisodes.push(i);
    }
    
    return availableEpisodes;
  };

  // Watch content_type changes to handle series selection
  const contentType = form.watch("content_type");
  
  useEffect(() => {
    if (contentType === 'standalone') {
      form.setValue("series_id", "");
      form.setValue("episode_number", undefined);
      setSelectedSeriesId("");
    }
  }, [contentType, form]);

  const handleSubmit = (data: VideoFormData) => {
    // Transform snake_case field names to camelCase as expected by the API
    const formattedData = {
      title: data.title,
      description: data.description,
      category: data.category,
      duration: Number(data.duration),
      thumbnailUrl: data.thumbnail_url, // snake_case to camelCase
      videoUrl: data.video_url, // snake_case to camelCase
      tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      isActive: data.is_active, // snake_case to camelCase
      content_type: data.content_type,
      seriesId: data.series_id, // snake_case to camelCase
      episodeNumber: data.episode_number, // snake_case to camelCase
    };
    onSubmit(formattedData as any);
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
                      <Input 
                        type="number" 
                        placeholder="120" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="thumbnail_url"
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
                name="video_url"
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
                    <FormDescription>
                      Separate tags with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standalone">Standalone</SelectItem>
                        <SelectItem value="series">Part of Series</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {contentType === 'series' && (
                <FormField
                  control={form.control}
                  name="series_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Series</FormLabel>
                      <Select onValueChange={handleSeriesChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a series" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {series.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose which series this video belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {contentType === 'series' && (
                <FormField
                  control={form.control}
                  name="episode_number"
                  render={({ field }) => {
                    const availableEpisodes = selectedSeriesId ? getAvailableEpisodeNumbers(selectedSeriesId) : [1];
                    
                    return (
                      <FormItem>
                        <FormLabel>Episode Number</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select episode number" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableEpisodes.map(episodeNum => (
                              <SelectItem key={episodeNum} value={episodeNum.toString()}>
                                Episode {episodeNum}
                                {episodeNum === availableEpisodes[availableEpisodes.length - 1] && " (New)"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {isLoadingVideos 
                            ? "Loading series data..."
                            : videosError
                              ? "Error loading series data, using fallback logic"
                              : selectedSeriesId && Array.isArray(seriesVideos) && seriesVideos.length > 0 
                                ? `Choose where to insert this video. Existing episodes will be shifted.`
                                : selectedSeriesId 
                                  ? "This will be the first episode in the series"
                                  : "Select a series first"
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}
              
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
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
