import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit (increased from 100MB)
    files: 1, // Only one file at a time
    fields: 20, // Allow up to 20 fields
    fieldSize: 1 * 1024 * 1024, // 1MB per field
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - mimetype:', file.mimetype, 'size:', file.size);
    
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      const error = new Error('Only video files are allowed') as any;
      error.code = 'INVALID_FILE_TYPE';
      cb(error);
    }
  },
});

export interface VideoUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type: 'video';
  format?: string;
  quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | string;
  streaming_profile?: 'hd' | 'sd' | 'full_hd' | '4k';
  eager?: Array<{
    streaming_profile?: string;
    format?: string;
    quality?: string;
  }>;
  eager_async?: boolean;
}

export interface CloudinaryVideoResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  playback_url?: string;
  duration?: number;
  bit_rate?: number;
  frame_rate?: number;
  eager?: Array<{
    transformation: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
    url: string;
    secure_url: string;
  }>;
}

/**
 * Upload video to Cloudinary with multiple format support
 */
export async function uploadVideoToCloudinary(
  file: Express.Multer.File,
  options: Partial<VideoUploadOptions> = {}
): Promise<CloudinaryVideoResponse> {
  try {
    console.log('Starting Cloudinary upload:', {
      filename: file.originalname,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      mimetype: file.mimetype
    });

    const defaultOptions: VideoUploadOptions = {
      resource_type: 'video',
      folder: 'mythosstream-videos',
      // Optimize for large file uploads
      chunk_size: 20 * 1024 * 1024, // 20MB chunks
      timeout: 600000, // 10 minutes timeout
    };

    const uploadOptions = { ...defaultOptions, ...options } as any;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message || error}`));
          } else if (result) {
            console.log('Cloudinary upload successful:', {
              public_id: result.public_id,
              duration: result.duration,
              size: `${(result.bytes / 1024 / 1024).toFixed(2)}MB`
            });
            resolve(result as CloudinaryVideoResponse);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );

      // Handle upload stream errors
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(new Error(`Upload stream failed: ${error.message}`));
      });

      // End the stream with the file buffer
      uploadStream.end(file.buffer);
    });
  } catch (error: any) {
    console.error('Cloudinary upload setup error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message || error}`);
  }
}

/**
 * Get video streaming URLs for different formats
 * Uses eager transformations when available, falls back to on-the-fly generation
 */
export function getVideoStreamingUrls(publicId: string, cloudinaryResult?: any) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  
  // Check if we have eager transformations available
  const eagerUrls = cloudinaryResult?.eager || [];
  
  // Helper function to find eager URL by format
  const findEagerUrl = (format: string, width?: number, height?: number) => {
    return eagerUrls.find((eager: any) => {
      const matchesFormat = eager.format === format;
      const matchesSize = !width || (eager.width === width && eager.height === height);
      return matchesFormat && matchesSize;
    });
  };
  
  return {
    // Original video URL
    original: cloudinary.url(publicId, {
      resource_type: 'video',
    }),
    
    // HLS streaming URL - prefer eager, fallback to on-demand
    hls: findEagerUrl('m3u8')?.secure_url || 
         `https://res.cloudinary.com/${cloudName}/video/upload/f_m3u8/${publicId}.m3u8`,
    
    // DASH streaming URL - prefer eager, fallback to on-demand
    dash: findEagerUrl('mpd')?.secure_url || 
          `https://res.cloudinary.com/${cloudName}/video/upload/f_mpd/${publicId}.mpd`,
    
    // Smooth streaming for Microsoft Edge/IE compatibility
    smooth: `https://res.cloudinary.com/${cloudName}/video/upload/f_ism/${publicId}.ism/Manifest`,
    // MP4 URLs - prefer eager transformations, fallback to on-demand
    mp4_720p: findEagerUrl('mp4', 1280, 720)?.secure_url ||
              cloudinary.url(publicId, {
                resource_type: 'video',
                format: 'mp4',
                width: 1280,
                height: 720,
                crop: 'limit',
                quality: 'auto:good',
                video_codec: 'h264'
              }),
    mp4_480p: findEagerUrl('mp4', 854, 480)?.secure_url ||
              cloudinary.url(publicId, {
                resource_type: 'video', 
                format: 'mp4',
                width: 854,
                height: 480,
                crop: 'limit',
                quality: 'auto:good',
                video_codec: 'h264'
              }),
    mp4_360p: findEagerUrl('mp4', 640, 360)?.secure_url ||
              cloudinary.url(publicId, {
                resource_type: 'video',
                format: 'mp4', 
                width: 640,
                height: 360,
                crop: 'limit',
                quality: 'auto:good',
                video_codec: 'h264'
              }),
    // WebM URLs - prefer eager transformations, fallback to on-demand
    webm_720p: findEagerUrl('webm', 1280, 720)?.secure_url ||
               cloudinary.url(publicId, {
                 resource_type: 'video',
                 format: 'webm',
                 width: 1280, 
                 height: 720,
                 crop: 'limit',
                 quality: 'auto:good',
                 video_codec: 'vp9'
               }),
    webm_480p: findEagerUrl('webm', 854, 480)?.secure_url ||
               cloudinary.url(publicId, {
                 resource_type: 'video',
                 format: 'webm',
                 width: 854,
                 height: 480,
                 crop: 'limit',
                 quality: 'auto:good',
                 video_codec: 'vp9'
               }),
    // Thumbnail
    thumbnail: cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'jpg',
      start_offset: 'auto'
    }),
  };
}

/**
 * Delete video from Cloudinary
 */
export async function deleteVideoFromCloudinary(publicId: string): Promise<any> {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    });
  } catch (error) {
    throw new Error(`Failed to delete video from Cloudinary: ${error}`);
  }
}

/**
 * Get video information from Cloudinary
 */
export async function getVideoInfo(publicId: string): Promise<any> {
  try {
    return await cloudinary.api.resource(publicId, {
      resource_type: 'video',
    });
  } catch (error) {
    throw new Error(`Failed to get video info from Cloudinary: ${error}`);
  }
}

export default cloudinary;