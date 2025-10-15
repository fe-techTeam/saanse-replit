import { useState, useRef, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileVideo, CheckCircle, AlertCircle } from "lucide-react";
import { SeriesSelect } from "./SeriesSelect";
import { SeriesDialog } from "./SeriesDialog";

const formatOptions = [
  { value: "all", label: "All Formats (HLS, MP4, WebM, DASH)", recommended: true },
  { value: "hls", label: "HLS Streaming (m3u8)" },
  { value: "dash", label: "DASH Streaming (mpd)" },
  { value: "mp4", label: "MP4 (720p, 480p, 360p)" },
  { value: "webm", label: "WebM (720p, 480p)" },
];

const categoryOptions = [
  { value: "Ramayana", label: "Ramayana" },
  { value: "Krishna", label: "Krishna" },
  { value: "Mahabharata", label: "Mahabharata" },
  { value: "Shiva", label: "Shiva" },
  { value: "Hanuman", label: "Hanuman" },
  { value: "Ganesha", label: "Ganesha" },
  { value: "Devi", label: "Devi" },
  { value: "Festivals", label: "Festivals" },
  { value: "Bhajans", label: "Bhajans" },
  { value: "Explained", label: "Explained" },
];


const videoUploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  tags: z.string().optional(),
  category: z.string().optional(), // Made optional since it can be derived from series
  is_active: z.boolean().default(true),
  series_id: z.string().min(1, "Series is required"),
  episode_number: z.number().min(1, "Episode number is required"),
  format_options: z.string().default('all'),
});

type VideoUploadData = z.infer<typeof videoUploadSchema>;

interface VideoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function VideoUploadDialog({
  open,
  onOpenChange,
  onSuccess
}: VideoUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);

  const form = useForm<VideoUploadData>({
    resolver: zodResolver(videoUploadSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      category: "",
      is_active: true,
      series_id: "",
      episode_number: 1,
      format_options: 'all',
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file');
        return;
      }

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        alert('File size must be less than 500MB');
        return;
      }

      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadResult(null);

      // Auto-fill title from filename if empty
      if (!form.getValues('title')) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        form.setValue('title', fileName);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const processStreamingUrls = async (uploadResult: any) => {
    try {
      const { video, cloudinary } = uploadResult;
      
      if (!video?.id || !cloudinary?.public_id) {
        throw new Error('Missing video ID or Cloudinary public ID');
      }

      // Build streaming URLs based on Cloudinary public_id
      const publicId = cloudinary.public_id;
      const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
      
      const streamingUrls = {
        // Original video URL
        original: `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.${cloudinary.format || 'mp4'}`,
        
        // HLS streaming URL - adaptive bitrate streaming
        hls: `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/f_m3u8/${publicId}.m3u8`,
        
        // DASH streaming URL - for browser compatibility
        dash: `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/f_mpd/${publicId}.mpd`,
        
        // MP4 variants with different qualities
        mp4_720p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_1280,h_720,c_limit,f_mp4/${publicId}.mp4`,
        mp4_480p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_854,h_480,c_limit,f_mp4/${publicId}.mp4`,
        mp4_360p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_640,h_360,c_limit,f_mp4/${publicId}.mp4`,
        
        // WebM variants for Chrome/Firefox optimization
        webm_720p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_1280,h_720,c_limit,f_webm/${publicId}.webm`,
        webm_480p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_854,h_480,c_limit,f_webm/${publicId}.webm`,
        
        // Smooth streaming for Microsoft Edge/IE compatibility
        smooth: `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/f_ism/${publicId}.ism/Manifest`,
        
        // Thumbnail URL
        thumbnail: `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_400,h_300,c_fill,f_jpg/${publicId}.jpg`
      };

      // Prepare cloudinary metadata
      const cloudinaryMeta = {
        public_id: cloudinary.public_id,
        duration: cloudinary.duration,
        width: cloudinary.width,
        height: cloudinary.height,
        format: cloudinary.format,
        bytes: cloudinary.bytes,
        bit_rate: cloudinary.bit_rate,
        frame_rate: cloudinary.frame_rate,
        video_codec: cloudinary.video_codec,
        audio_codec: cloudinary.audio_codec,
      };

      // Get admin credentials for API call
      const adminId = localStorage.getItem('adminId');
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminId || !adminToken) {
        throw new Error('Admin authentication required');
      }

      // Update video with streaming URLs
      const response = await fetch(`/api/admin/videos/${video.id}/streaming`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': adminId,
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          streaming_urls: streamingUrls,
          cloudinary_meta: cloudinaryMeta,
          cloudinary_public_id: cloudinary.public_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to update streaming URLs');
      }

      console.log('Streaming URLs updated successfully');
      
    } catch (error) {
      console.error('Error processing streaming URLs:', error);
      throw error;
    }
  };

  const handleUpload = async (data: VideoUploadData) => {
    console.log('Upload form data received:', data);
    console.log('Category value specifically:', data.category, typeof data.category);
    
    if (!selectedFile) {
      alert('Please select a video file');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      // Get admin credentials from localStorage
      const adminId = localStorage.getItem('adminId');
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminId || !adminToken) {
        throw new Error('Admin authentication required');
      }

      // Validate required fields before creating FormData
      console.log('Validating fields:', { 
        title: data.title, 
        category: data.category, 
        series_id: data.series_id, 
        episode_number: data.episode_number 
      });
      
      if (!data.title || !data.series_id || !data.episode_number) {
        console.error('Missing required fields:', { 
          title: !!data.title, 
          category: !!data.category, 
          series_id: !!data.series_id, 
          episode_number: !!data.episode_number 
        });
        alert('Please fill in all required fields: Title, Series, and Episode Number');
        setIsUploading(false);
        setUploadStatus('idle');
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', data.title);
      if (data.category) {
        formData.append('category', data.category);
      }
      formData.append('description', data.description || '');
      formData.append('tags', data.tags || '');
      formData.append('is_active', data.is_active.toString());
      formData.append('format_options', data.format_options);
      formData.append('series_id', data.series_id);
      formData.append('episode_number', data.episode_number.toString());
      
      // Debug: Log what we're sending
      console.log('FormData contents:');
      formData.forEach((value, key) => {
        console.log(key, '=', value);
      });

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status === 201) {
            const result = JSON.parse(xhr.responseText);
            console.log('Upload result received:', result);
            
            // Process streaming URLs from Cloudinary response
            if (result.cloudinary && result.video) {
              try {
                setUploadStatus('processing');
                await processStreamingUrls(result);
                console.log('Streaming URLs processed successfully');
              } catch (error) {
                console.error('Failed to process streaming URLs:', error);
                // Continue with success even if streaming URL processing fails
              }
            }
            
            setUploadResult(result);
            setUploadStatus('success');
            setTimeout(() => {
              onSuccess();
              onOpenChange(false);
              resetForm();
            }, 2000);
            resolve(result);
          } else {
            let errorMessage = 'Upload failed';
            try {
              const error = JSON.parse(xhr.responseText);
              errorMessage = error.details || error.error || 'Upload failed';
              
              // Handle specific error types
              if (xhr.status === 408) {
                errorMessage = 'Upload timeout - please try with a smaller file or check your connection';
              } else if (xhr.status === 413) {
                errorMessage = 'File too large - maximum size is 500MB';
              } else if (xhr.status === 400 && error.error?.includes('file type')) {
                errorMessage = 'Invalid file type - only video files are allowed';
              }
            } catch (parseError) {
              errorMessage = `Upload failed with status ${xhr.status}`;
            }
            throw new Error(errorMessage);
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error - check your internet connection and try again'));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout - please try with a smaller file'));
        });

        xhr.addEventListener('loadend', () => {
          if (xhr.status === 201) {
            setUploadStatus('processing');
          } else {
            setUploadStatus('error');
          }
          setIsUploading(false);
        });

        xhr.open('POST', '/api/admin/videos/upload');
        xhr.timeout = 600000; // 10 minutes timeout
        xhr.setRequestHeader('x-admin-id', adminId);
        xhr.setRequestHeader('x-admin-token', adminToken);
        xhr.send(formData);
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setIsUploading(false);
      alert(error.message || 'Failed to upload video');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadResult(null);
    form.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Video to Cloudinary
          </DialogTitle>
          <DialogDescription>
            Upload a video file and configure streaming options. The video will be processed and optimized for multiple formats.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="mb-2"
                    >
                      Select Video File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-500">
                      MP4, MOV, AVI, WebM up to 500MB
                    </p>
                  </div>
                </div>
              </div>

              {selectedFile && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    </div>
                    <Badge variant="secondary">Ready to upload</Badge>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {(isUploading || uploadStatus === 'processing') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {uploadStatus === 'uploading' ? 'Uploading...' : 'Processing on Cloudinary...'}
                    </span>
                    {uploadStatus === 'uploading' && (
                      <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
                    )}
                  </div>
                  <Progress value={uploadStatus === 'uploading' ? uploadProgress : 100} className="w-full" />
                </div>
              )}

              {/* Upload Success */}
              {uploadStatus === 'success' && uploadResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Upload Successful!</p>
                      <p className="text-sm text-green-600">
                        Video uploaded and processing. Duration: {uploadResult.cloudinary?.duration ? formatDuration(uploadResult.cloudinary.duration) : 'Unknown'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="secondary">
                          {uploadResult.cloudinary?.format?.toUpperCase() || 'Unknown format'}
                        </Badge>
                        <Badge variant="secondary">
                          {uploadResult.cloudinary?.width}x{uploadResult.cloudinary?.height}
                        </Badge>
                        <Badge variant="secondary">
                          {formatFileSize(uploadResult.cloudinary?.bytes || 0)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="font-medium text-red-800">Upload Failed</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter video title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        console.log('Category selected:', value);
                        field.onChange(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Category will be inherited from series if not specified. Current: {field.value || 'Will inherit from series'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Series selection - now required */}
              <FormField
                control={form.control}
                name="series_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series *</FormLabel>
                    <SeriesSelect
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      onCreateNew={() => setSeriesDialogOpen(true)}
                    />
                    <FormDescription>
                      All videos must belong to a series. Create a new series if needed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="episode_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Episode Number *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Episode number within the selected series
                    </FormDescription>
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
            </div>

            {/* Upload Options */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-semibold">Upload & Streaming Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="format_options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Formats</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formatOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.label}
                                {option.recommended && (
                                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select which video formats to generate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Make video visible to users immediately
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
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedFile || isUploading || uploadStatus === 'success'}
                onClick={() => {
                  console.log('Current form values before submit:', form.getValues());
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      <SeriesDialog open={seriesDialogOpen} onOpenChange={setSeriesDialogOpen} />
    </Dialog>
  );
}