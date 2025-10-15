import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function extractPublicIdFromUrl(videoUrl) {
  // Extract public_id from Cloudinary URL
  // Example: https://res.cloudinary.com/dc3ybi6xk/video/upload/v1758786370/mythosstream-videos/lcl2mk5vtird1lzyafwk.mp4
  const match = videoUrl.match(/\/v\d+\/(.+?)\.(?:mp4|mov|avi|webm|mkv)$/);
  return match ? match[1] : null;
}

function generateStreamingUrls(publicId) {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dc3ybi6xk';
  
  return {
    // Original video URL
    original: `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`,
    
    // HLS streaming URL - correct format for adaptive streaming
    hls: `https://res.cloudinary.com/${cloudName}/video/upload/f_m3u8/${publicId}.m3u8`,
    
    // DASH streaming URL - correct format for DASH
    dash: `https://res.cloudinary.com/${cloudName}/video/upload/f_mpd/${publicId}.mpd`,
    
    // Smooth streaming for Microsoft Edge/IE compatibility
    smooth: `https://res.cloudinary.com/${cloudName}/video/upload/f_ism/${publicId}.ism/Manifest`,
    
    // Standard MP4 URLs
    mp4_720p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_1280,h_720,c_limit,f_mp4/${publicId}.mp4`,
    mp4_480p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_854,h_480,c_limit,f_mp4/${publicId}.mp4`,
    mp4_360p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_640,h_360,c_limit,f_mp4/${publicId}.mp4`,
    
    // WebM URLs
    webm_720p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_1280,h_720,c_limit,f_webm/${publicId}.webm`,
    webm_480p: `https://res.cloudinary.com/${cloudName}/video/upload/q_auto:good,w_854,h_480,c_limit,f_webm/${publicId}.webm`,
    
    // Thumbnail
    thumbnail: `https://res.cloudinary.com/${cloudName}/video/upload/so_0,w_400,h_300,c_fill,f_jpg/${publicId}.jpg`
  };
}

async function fixStreamingUrls() {
  try {
    console.log('🔧 Fixing streaming URLs for existing videos...');
    
    // Get all videos that have Cloudinary URLs but missing streaming_urls or cloudinary_public_id
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, title, video_url, cloudinary_public_id, streaming_urls')
      .like('video_url', '%cloudinary%')
      .or('cloudinary_public_id.is.null,streaming_urls.is.null');

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    console.log(`📹 Found ${videos.length} videos to fix`);

    for (const video of videos) {
      console.log(`\n🔄 Processing: ${video.title}`);
      
      // Extract public_id from video_url
      const publicId = video.cloudinary_public_id || extractPublicIdFromUrl(video.video_url);
      
      if (!publicId) {
        console.log(`⚠️  Could not extract public_id from: ${video.video_url}`);
        continue;
      }
      
      console.log(`📝 Extracted public_id: ${publicId}`);
      
      // Generate streaming URLs
      const streamingUrls = generateStreamingUrls(publicId);
      
      // Update the video
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          cloudinary_public_id: publicId,
          streaming_urls: streamingUrls
        })
        .eq('id', video.id);

      if (updateError) {
        console.error(`❌ Error updating video ${video.title}:`, updateError);
      } else {
        console.log(`✅ Updated streaming URLs for: ${video.title}`);
        console.log(`   HLS: ${streamingUrls.hls}`);
        console.log(`   DASH: ${streamingUrls.dash}`);
      }
    }
    
    console.log('\n🎉 Streaming URL fix completed!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the fix
fixStreamingUrls().then(() => process.exit(0));