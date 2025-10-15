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

function generateStreamingUrls(publicId) {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME || 'dc3ybi6xk';
  
  return {
    // Original video URL
    original: `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`,
    
    // HLS streaming URL - corrected format
    hls: `https://res.cloudinary.com/${cloudName}/video/upload/f_m3u8/${publicId}.m3u8`,
    
    // DASH streaming URL - corrected format
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

async function updateStreamingUrls() {
  try {
    console.log('🔧 Updating streaming URLs with corrected format...');
    
    // Get all videos that have cloudinary_public_id but may have wrong streaming URLs
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, title, cloudinary_public_id')
      .not('cloudinary_public_id', 'is', null);

    if (error) {
      console.error('❌ Error fetching videos:', error);
      return;
    }

    console.log(`📹 Found ${videos.length} videos to update`);

    for (const video of videos) {
      console.log(`\n🔄 Updating: ${video.title}`);
      
      // Generate corrected streaming URLs
      const streamingUrls = generateStreamingUrls(video.cloudinary_public_id);
      
      // Update the video
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          streaming_urls: streamingUrls
        })
        .eq('id', video.id);

      if (updateError) {
        console.error(`❌ Error updating video ${video.title}:`, updateError);
      } else {
        console.log(`✅ Updated streaming URLs for: ${video.title}`);
        console.log(`   HLS: ${streamingUrls.hls}`);
      }
    }
    
    console.log('\n🎉 Streaming URL update completed!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the update
updateStreamingUrls().then(() => process.exit(0));