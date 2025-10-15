import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testEagerTransformations() {
  try {
    // Test with an existing video public_id
    const publicId = 'mythosstream-videos/lcl2mk5vtird1lzyafwk'; // Your TEST HLS video
    
    console.log('🔧 Testing eager transformations for:', publicId);
    
    // Generate eager transformations for existing video
    const result = await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      resource_type: 'video',
      eager: [
        // HLS streaming format
        { format: 'm3u8' },
        // DASH streaming format
        { format: 'mpd' },
        // MP4 variants
        { 
          width: 1280, 
          height: 720, 
          crop: 'limit', 
          quality: 'auto:good',
          format: 'mp4',
          video_codec: 'h264',
          audio_codec: 'aac'
        },
        { 
          width: 854, 
          height: 480, 
          crop: 'limit', 
          quality: 'auto:good',
          format: 'mp4',
          video_codec: 'h264',
          audio_codec: 'aac'
        }
      ],
      eager_async: false // Synchronous for testing
    });

    console.log('✅ Transformations completed!');
    console.log('📋 Results:');
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Generated ${result.eager?.length || 0} transformations`);
    
    if (result.eager && result.eager.length > 0) {
      console.log('\n🎥 Generated URLs:');
      result.eager.forEach((eager, index) => {
        console.log(`   ${index + 1}. ${eager.format?.toUpperCase() || 'Unknown'} (${eager.width || 'auto'}x${eager.height || 'auto'})`);
        console.log(`      URL: ${eager.secure_url}`);
        console.log(`      Size: ${((eager.bytes || 0) / 1024 / 1024).toFixed(2)}MB`);
      });
    }

    // Test the generated HLS URL
    const hlsTransformation = result.eager?.find(e => e.format === 'm3u8');
    if (hlsTransformation) {
      console.log('\n🧪 Testing HLS URL...');
      try {
        const response = await fetch(hlsTransformation.secure_url, { method: 'HEAD' });
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        if (response.status === 200) {
          console.log('✅ HLS URL is working!');
        } else {
          console.log('⚠️  HLS URL returned non-200 status');
        }
      } catch (error) {
        console.error('❌ Error testing HLS URL:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testEagerTransformations().then(() => {
  console.log('\n🎉 Test completed!');
  process.exit(0);
});