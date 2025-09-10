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
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
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
    const defaultOptions: VideoUploadOptions = {
      resource_type: 'video',
      folder: 'mythosstream-videos',
    };

    const uploadOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result as CloudinaryVideoResponse);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      ).end(file.buffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error}`);
  }
}

/**
 * Get video streaming URLs for different formats
 */
export function getVideoStreamingUrls(publicId: string) {
  return {
    // Original video URL
    original: cloudinary.url(publicId, {
      resource_type: 'video',
    }),
    // HLS streaming URL - streaming_profile ONLY
    hls: cloudinary.url(publicId, {
      resource_type: 'video',
      streaming_profile: 'hd'
    }),
    // DASH streaming URL - streaming_profile ONLY
    dash: cloudinary.url(publicId, {
      resource_type: 'video',
      streaming_profile: 'full_hd'
    }),
    // Standard MP4 URLs without streaming_profile
    mp4_720p: cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'mp4',
      width: 1280,
      height: 720,
      crop: 'limit',
      video_codec: 'h264'
    }),
    mp4_480p: cloudinary.url(publicId, {
      resource_type: 'video', 
      format: 'mp4',
      width: 854,
      height: 480,
      crop: 'limit',
      video_codec: 'h264'
    }),
    mp4_360p: cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'mp4', 
      width: 640,
      height: 360,
      crop: 'limit',
      video_codec: 'h264'
    }),
    // WebM URLs without streaming_profile
    webm_720p: cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'webm',
      width: 1280, 
      height: 720,
      crop: 'limit',
      video_codec: 'vp9'
    }),
    webm_480p: cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'webm',
      width: 854,
      height: 480,
      crop: 'limit',
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